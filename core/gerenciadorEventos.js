const fs = require('fs');
const path = require('path');

class GerenciadorEventos {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.eventosFile = path.join(this.dataPath, 'eventos.json');
        this.eventos = this.carregarEventos();
        
        // Palavras-chave para detectar eventos nas notícias
        this.palavrasChaveEventos = [
            'festival', 'feira', 'show', 'apresentação', 'concerto',
            'congresso', 'seminário', 'workshop', 'conferência',
            'campeonato', 'torneio', 'competição', 'jogo',
            'inauguração', 'abertura', 'lançamento',
            'encontro', 'reunião', 'assembleia',
            'exposição', 'mostra', 'exibição',
            'parintins', 'boi-bumbá', 'carnaval',
            'corrida', 'caminhada', 'maratona',
            'aniversário', 'comemoração', 'celebração'
        ];

        this.mesesPorExtenso = {
            'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
            'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
            'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
        };
    }

    carregarEventos() {
        try {
            const conteudo = fs.readFileSync(this.eventosFile, 'utf8');
            return JSON.parse(conteudo);
        } catch (error) {
            console.log('📅 Arquivo de eventos não encontrado, criando novo...');
            return {
                eventos: [],
                comentarios_ouvintes: [],
                sugestoes_pauta: [],
                ultima_atualizacao: new Date().toISOString()
            };
        }
    }

    salvarEventos() {
        this.eventos.ultima_atualizacao = new Date().toISOString();
        fs.writeFileSync(this.eventosFile, JSON.stringify(this.eventos, null, 2), 'utf8');
        console.log('💾 Eventos salvos com sucesso!');
    }

    // Detecta eventos automáticamente nas notícias
    detectarEventosNasNoticias(textoNoticia) {
        const eventosDetectados = [];
        const linhas = textoNoticia.split('\n');

        for (const linha of linhas) {
            const temEventoChave = this.palavrasChaveEventos.some(palavra => 
                linha.toLowerCase().includes(palavra.toLowerCase())
            );

            if (temEventoChave) {
                const datasEncontradas = this.extrairDatas(linha);
                
                if (datasEncontradas.length > 0) {
                    eventosDetectados.push({
                        titulo: this.extrairTituloEvento(linha),
                        descricao: linha.trim(),
                        data: datasEncontradas[0],
                        fonte: 'detecção_automatica',
                        categoria: this.categorizarEvento(linha),
                        relevancia: this.calcularRelevancia(linha),
                        data_deteccao: new Date().toISOString()
                    });
                }
            }
        }

        return eventosDetectados;
    }

    extrairDatas(texto) {
        const datasEncontradas = [];
        const anoAtual = new Date().getFullYear();

        // Padrão "15 de dezembro"
        const matchesMes = texto.match(/(\d{1,2})\s+de\s+(\w+)/gi);
        if (matchesMes) {
            matchesMes.forEach(match => {
                const [, dia, mes] = match.match(/(\d{1,2})\s+de\s+(\w+)/i);
                const numeroMes = this.mesesPorExtenso[mes.toLowerCase()];
                if (numeroMes) {
                    datasEncontradas.push(`${anoAtual}-${numeroMes}-${dia.padStart(2, '0')}`);
                }
            });
        }

        return datasEncontradas.filter(data => new Date(data) > new Date());
    }

    extrairTituloEvento(linha) {
        // Remove texto desnecessário e pega as primeiras palavras importantes
        let titulo = linha.replace(/^\W+/, '').trim();
        const palavras = titulo.split(' ');
        return palavras.slice(0, 8).join(' ').replace(/[.,;:]$/, '');
    }

    categorizarEvento(texto) {
        const texto_lower = texto.toLowerCase();
        
        if (texto_lower.includes('parintins') || texto_lower.includes('boi')) return 'cultura_regional';
        if (texto_lower.includes('festival') || texto_lower.includes('show')) return 'entretenimento';
        if (texto_lower.includes('campeonato') || texto_lower.includes('jogo')) return 'esportes';
        if (texto_lower.includes('feira') || texto_lower.includes('mercado')) return 'economia';
        if (texto_lower.includes('seminário') || texto_lower.includes('congresso')) return 'educacao';
        
        return 'geral';
    }

    calcularRelevancia(texto) {
        let pontos = 0;
        const texto_lower = texto.toLowerCase();

        // Eventos culturais regionais têm alta relevância
        if (texto_lower.includes('parintins') || texto_lower.includes('amazonas')) pontos += 3;
        if (texto_lower.includes('manaus')) pontos += 2;
        if (texto_lower.includes('festival') || texto_lower.includes('feira')) pontos += 2;
        if (texto_lower.includes('gratuito') || texto_lower.includes('grátis')) pontos += 1;

        return Math.min(pontos, 5); // Máximo 5 pontos
    }

    // Adiciona evento manualmente
    adicionarEventoManual(titulo, descricao, data, categoria = 'geral') {
        const novoEvento = {
            id: Date.now(),
            titulo,
            descricao,
            data,
            categoria,
            fonte: 'manual',
            relevancia: 3,
            data_criacao: new Date().toISOString()
        };

        this.eventos.eventos.push(novoEvento);
        this.salvarEventos();
        console.log(`✅ Evento adicionado: ${titulo}`);
        return novoEvento;
    }

    // Processa notícias e adiciona eventos automaticamente
    processarNoticias(noticias) {
        let eventosAdicionados = 0;

        for (const noticia of noticias) {
            const eventosDetectados = this.detectarEventosNasNoticias(noticia);
            
            for (const evento of eventosDetectados) {
                // Verifica se evento similar já existe
                const eventoExistente = this.eventos.eventos.find(e => 
                    e.titulo.toLowerCase().includes(evento.titulo.toLowerCase().split(' ')[0]) &&
                    e.data === evento.data
                );

                if (!eventoExistente) {
                    this.eventos.eventos.push(evento);
                    eventosAdicionados++;
                    console.log(`🎯 Evento detectado: ${evento.titulo} - ${evento.data}`);
                }
            }
        }

        if (eventosAdicionados > 0) {
            this.salvarEventos();
            console.log(`📅 ${eventosAdicionados} novos eventos adicionados!`);
        }

        return eventosAdicionados;
    }

    // Remove eventos passados
    limparEventosAntigos() {
        const hoje = new Date();
        const eventosAtivos = this.eventos.eventos.filter(evento => 
            new Date(evento.data) >= hoje
        );

        const removidos = this.eventos.eventos.length - eventosAtivos.length;
        this.eventos.eventos = eventosAtivos;

        if (removidos > 0) {
            this.salvarEventos();
            console.log(`🗑️ ${removidos} eventos antigos removidos`);
        }

        return removidos;
    }

    // Lista eventos próximos (próximos 7 dias)
    obterEventosProximos(dias = 7) {
        const hoje = new Date();
        const dataLimite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));

        return this.eventos.eventos
            .filter(evento => {
                const dataEvento = new Date(evento.data);
                return dataEvento >= hoje && dataEvento <= dataLimite;
            })
            .sort((a, b) => new Date(a.data) - new Date(b.data));
    }
}

module.exports = GerenciadorEventos;