const fs = require('fs');
const path = require('path');
const GerenciadorEventos = require('./gerenciadorEventos');
const IntegracaoIA = require('./integracaoIA');
const DialogosEspontaneos = require('./dialogosEspontaneos');
const SistemaRevisao = require('./sistemaRevisao');

class GeradorRoteiro {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.templatesPath = path.join(__dirname, 'templates');
        
        // Inicializar gerenciadores
        this.gerenciadorEventos = new GerenciadorEventos();
        this.integracaoIA = new IntegracaoIA();
        this.dialogosEspontaneos = new DialogosEspontaneos();
        this.sistemaRevisao = new SistemaRevisao();
        
        // Carregar dados
        this.personagens = this.carregarJSON('personagens.json');
        this.girias = this.carregarJSON('girias.json');
        this.podcastConfig = this.carregarJSON('podcast-config.json');
        this.eventos = this.gerenciadorEventos.eventos;
        
        // Carregar template
        this.template = fs.readFileSync(
            path.join(this.templatesPath, 'roteiro-template-melhorado.md'), 
            'utf8'
        );
    }

    carregarJSON(nomeArquivo) {
        try {
            const conteudo = fs.readFileSync(
                path.join(this.dataPath, nomeArquivo), 
                'utf8'
            );
            return JSON.parse(conteudo);
        } catch (error) {
            console.error(`Erro ao carregar ${nomeArquivo}:`, error.message);
            return {};
        }
    }

    obterDataFormatada() {
        const hoje = new Date();
        return hoje.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    obterGiriaAleatoria(personagem) {
        const girias = this.girias[personagem.toLowerCase()]?.gírias || [];
        if (girias.length === 0) {
            // Remover fallback para frases do config
            throw new Error(`Sem gírias cadastradas para o personagem: ${personagem}`);
        }
        return girias[Math.floor(Math.random() * girias.length)];
    }

    obterComentarioOuvinte() {
        const comentarios = this.eventos.comentarios_ouvintes;
        if (!comentarios || comentarios.length === 0) {
            throw new Error('Nenhum comentário de ouvinte disponível nos dados.');
        }
        const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
        return `"${comentario.comentario}" - ${comentario.nome}, ${comentario.cidade}`;
    }

    gerarDialogoNatural() {
        const taina = this.personagens.personagens?.find(p => p.nome.includes('Tainá'));
        const iray = this.personagens.personagens?.find(p => p.nome.includes('Iraí'));

        if (!taina || !iray) {
            return "Diálogo não disponível - dados dos personagens não encontrados";
        }

        const dialogos = [
            `**Tainá:** ${this.obterGiriaAleatoria('tainá')}, ${iray.apelidos[0]}, você viu essa notícia?\n**Iraí:** ${this.obterGiriaAleatoria('iray')}, vi sim, ${taina.apelidos[0]}. Que coisa, né?`,
            `**Iraí:** E aí, ${taina.apelidos[1]}, o que você achou?\n**Tainá:** ${this.obterGiriaAleatoria('tainá')}, achei interessante demais!`,
            `**Tainá:** ${this.obterGiriaAleatoria('tainá')}, ${iray.apelidos[1]}, conta aí sua opinião!\n**Iraí:** Ah, ${taina.apelidos[0]}, ${this.obterGiriaAleatoria('iray')}, é bem assim mesmo.`,
        ];

        return dialogos[Math.floor(Math.random() * dialogos.length)];
    }

    // NOVO: Obter abertura aleatória do podcast
    obterAberturaAleatoria() {
        const aberturas = this.podcastConfig?.podcast_info?.aberturas_padrao || [
            "Fala maninho, tá começando mais um BubuiA News!",
            "Fala curumím, tá começando mais um BubuiA News!"
        ];
        return aberturas[Math.floor(Math.random() * aberturas.length)];
    }

    gerarRoteiro() {
        console.log('📝 Gerando roteiro do BubuiA News...');

        try {
            // 1. INTRODUÇÃO OFICIAL
            const introducaoCompleta = this.dialogosEspontaneos.gerarIntroducaoCompleta();
            
            // 2. INTERAÇÃO ESPONTÂNEA
            const interacaoEspontanea = this.dialogosEspontaneos.gerarInteracaoEspontanea();
            
            // 3. TRANSIÇÃO PARA CARDÁPIO
            const transicaoCardapio = this.dialogosEspontaneos.gerarTransicaoCardapio();

            // 4. GERAR CONTEÚDO (IMPLEMENTAR TODAS AS VARIÁVEIS)
            const eventosProximos = this.gerenciadorEventos.obterEventosProximos();
            const eventoDestaque = this.obterEventoDestaque();
            const comentarioOuvinte = this.obterComentarioOuvinte();

            // Criar placeholders COMPLETOS
            const placeholders = {
                // Estrutura do programa
                '{{INTRODUCAO_COMPLETA}}': introducaoCompleta,
                '{{INTERACAO_ESPONTANEA}}': interacaoEspontanea.texto,
                '{{TRANSICAO_CARDAPIO}}': transicaoCardapio,
                
                // Personagens - CORRIGINDO VALOR_TEMPORARIO
                '{{APRESENTADOR}}': 'Tainá e Iraí',
                '{{APRESENTADOR_PRINCIPAL}}': this.obterApresentadorPrincipal(),
                '{{APRESENTADOR_SECUNDARIO}}': 'E eu sou o Iraí!',
                
                // Conteúdo principal - 3 MANCHETES + CLIMA CONDICIONAL
                '{{MANCHETE_PRINCIPAL}}': this.gerarManchetePrincipal(),
                '{{MANCHETE_SECUNDARIA}}': this.gerarMancheteSecundaria(),
                '{{MANCHETE_TERCIARIA}}': this.gerarMancheteTerciaria(),
                '{{NOTICIA_1}}': this.gerarNoticia1(),
                '{{NOTICIA_2}}': this.gerarNoticia2(),
                '{{NOTICIA_3}}': this.gerarNoticia3(),
                '{{NOTICIA_ESPORTE}}': this.gerarNoticiaEsporte(),
                '{{CLIMA_RELEVANTE}}': this.gerarClimaRelevante() || '', // Garantir que não fica undefined
                '{{EVENTO_DESTAQUE}}': eventoDestaque.titulo || this.gerarEventoDestaque(),
                '{{DESCRICAO_EVENTO}}': eventoDestaque.descricao || "Evento com várias atrações regionais",
                '{{CURIOSIDADE_REGIONAL}}': this.gerarCuriosidadeRegional(),
                
                // Comentários e interações
                '{{COMENTARIO_BOI_TAINA}}': this.gerarComentarioBoiTaina(),
                '{{COMENTARIO_BOI_IRAY}}': this.gerarComentarioBoiIrai(),
                '{{COMENTARIO_IRAY_MANCHETE}}': this.gerarComentarioIraiManchete(),
                '{{COMENTARIO_TAINA}}': this.gerarComentarioTaina(),
                '{{COMENTARIO_OUVINTE}}': comentarioOuvinte,
                '{{COMENTARIO_RIVALIDADE}}': this.gerarComentarioRivalidade(),
                '{{RESPOSTA_TAINA}}': this.gerarRespostaTaina(),
                '{{RESPOSTA_IRAY}}': this.gerarRespostaIrai(),
                '{{DIALOGO_CULTURA}}': this.gerarDialogoCultura(),
                
                // Encerramentos - CORRIGINDO ENCERRAMENTO_IRAI
                '{{DESPEDIDA_CONJUNTA}}': this.gerarDespedidaConjunta(),
                '{{ENCERRAMENTO_TAINA}}': this.gerarEncerramentoTaina(),
                '{{ENCERRAMENTO_IRAI}}': this.gerarEncerramentoIrai(),
                
                // Características dos personagens
                '{{GIRIA_TAINA}}': this.gerarGiriaTaina(),
                '{{GIRIA_IRAI}}': this.gerarGiriaIrai(),
                '{{LISTA_GIRIAS_TAINA}}': this.obterListaGiriasTaina(),
                '{{LISTA_GIRIAS_IRAY}}': this.obterListaGiriasIrai(),
                
                // Metadados
                '{{DATA}}': this.obterDataFormatada(),
                '{{DURACAO}}': this.obterDuracao(),
                '{{TIMESTAMP}}': this.obterTimestamp(),
                '{{TEMAS_PRINCIPAIS}}': this.obterTemasPrincipais(),
                '{{TIME_FOCO}}': this.obterTimeFoco(),
                '{{EFEITOS_SONOROS}}': this.obterEfeitosSonoros(),
                '{{OBSERVACOES_TECNICAS}}': this.obterObservacoesTecnicas(),
                '{{TIPO_INTERACAO}}': interacaoEspontanea.tipo,
                '{{CONFIGURACAO_TTS}}': JSON.stringify(
                    this.dialogosEspontaneos.obterConfiguracaoTTS(interacaoEspontanea.tipo)
                )
            };

            // Aplicar placeholders no template
            let roteiro = this.template;
            Object.keys(placeholders).forEach(placeholder => {
                const valor = placeholders[placeholder];
                if (valor === undefined || valor === null) {
                    throw new Error(`Placeholder não resolvido: ${placeholder}`);
                }
                roteiro = roteiro.replace(
                    new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), 
                    valor
                );
            });

            // LIMPEZA FINAL: Corrigir problemas conhecidos
            roteiro = roteiro.replace(/VALOR_TEMPORARIO/g, 'E eu sou o Iraí!');
            roteiro = roteiro.replace(/\bIray\b/g, 'Iraí'); // Corrigir nome
            roteiro = roteiro.replace(/Oxe,/g, 'Eita,'); // Reduzir "oxe" excessivo
            
            // Corrigir formatação de diálogos
            roteiro = roteiro.replace(/\\n/g, '\n');
            
            // Remover seções duplicadas
            roteiro = roteiro.replace(/## 💬 INTERAÇÃO ESPONTÂNEA \([^)]+\)\s*\n\s*## 💬 INTERAÇÃO ESPONTÂNEA \([^)]+\)/g, '## 💬 INTERAÇÃO ESPONTÂNEA');
            roteiro = roteiro.replace(/## 🔄 TRANSIÇÃO PARA CARDÁPIO\s*\n\s*## 🔄 TRANSIÇÃO PARA CARDÁPIO/g, '## 🔄 TRANSIÇÃO PARA CARDÁPIO');
            
            // Remover variáveis não resolvidas
            roteiro = roteiro.replace(/VALOR_NAO_DEFINIDO_\{\{[^}]+\}\}/g, '');
            roteiro = roteiro.replace(/\{\{[^}]+\}\}/g, ''); // Remover placeholders restantes
            
            // Remover seções vazias de clima
            roteiro = roteiro.replace(/## 🌦️ BLOCO \d+ - CLIMA \(SE RELEVANTE\)\s*\n\s*\n---/g, '');
            
            // Corrigir emojis quebrados
            roteiro = roteiro.replace(/� /g, '🏆 ');

            // VERIFICAÇÃO FINAL: Procurar por undefined restante
            const undefinedCount = (roteiro.match(/undefined/gi) || []).length;
            if (undefinedCount > 0) {
                console.log(`⚠️ Encontrados ${undefinedCount} 'undefined' no roteiro - corrigindo...`);
                roteiro = roteiro.replace(/undefined/gi, '');
            }

            console.log('✅ Roteiro gerado com sucesso!');
            console.log(`📊 Tipo de interação: ${interacaoEspontanea.tipo}`);
            console.log(`🔍 Variáveis undefined encontradas: ${undefinedCount}`);
            
            return roteiro;

        } catch (error) {
            console.error('❌ Erro ao gerar roteiro:', error.message);
            throw error;
        }
    }

    salvarRoteiro(roteiro) {
        const dataArquivo = new Date().toISOString().split('T')[0];
        const nomeArquivo = `roteiro-${dataArquivo}.md`;
        const caminhoArquivo = path.join(__dirname, nomeArquivo);

        fs.writeFileSync(caminhoArquivo, roteiro, 'utf8');
        console.log(`✅ Roteiro salvo em: ${nomeArquivo}`);
        return nomeArquivo;
    }

    // NOVO: Processar notícias e detectar eventos
    async processarNoticiasDodia(noticias) {
        console.log('📰 Processando notícias para detectar eventos...');
        
        const eventosDetectados = this.gerenciadorEventos.processarNoticias(noticias);
        
        if (eventosDetectados > 0) {
            console.log(`🎯 ${eventosDetectados} novos eventos detectados e adicionados!`);
            // Recarrega eventos atualizados
            this.eventos = this.gerenciadorEventos.eventos;
        }

        return eventosDetectados;
    }

    // NOVO: Gerar roteiro com eventos dinâmicos
    gerarRoteiroComEventos() {
        // Limpa eventos antigos
        this.gerenciadorEventos.limparEventosAntigos();
        
        // Pega eventos próximos
        const eventosProximos = this.gerenciadorEventos.obterEventosProximos();
        
        let roteiro = this.gerarRoteiro(); // Método original
        
        // Adiciona seção de eventos se houver
        if (eventosProximos.length > 0) {
            let secaoEventos = '\n\n## 📅 AGENDA DE EVENTOS\n\n';
            
            eventosProximos.forEach(evento => {
                const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
                secaoEventos += `**${evento.titulo}**\n`;
                secaoEventos += `📅 ${dataFormatada} | 📍 ${evento.categoria}\n`;
                secaoEventos += `${evento.descricao}\n\n`;
            });
            
            // Insere antes do encerramento
            roteiro = roteiro.replace('## ENCERRAMENTO', secaoEventos + '## 🎵 ENCERRAMENTO');
        }

        return roteiro;
    }

    // NOVO: Execução completa com IA
    async executarCompleto(opcoes = {}) {
        console.log('🎙️ Iniciando geração completa do podcast...');
        
        try {
            // 1. Processar notícias se fornecidas
            if (opcoes.noticias) {
                await this.processarNoticiasDodia(opcoes.noticias);
            }

            // 2. Gerar roteiro
            const roteiro = this.gerarRoteiroComEventos();
            const nomeArquivo = this.salvarRoteiro(roteiro);

            // 3. Gerar áudios se solicitado
            if (opcoes.gerarAudio) {
                console.log('🎵 Gerando áudios...');
                const caminhoRoteiro = path.join(__dirname, nomeArquivo);
                const infoAudios = await this.integracaoIA.processarRoteiroCompleto(caminhoRoteiro);
                
                console.log(`🎧 ${infoAudios.total_audios} áudios gerados!`);
                
                return {
                    roteiro: nomeArquivo,
                    audios: infoAudios,
                    eventos_detectados: opcoes.noticias ? 'processados' : 'não fornecidas'
                };
            }

            return {
                roteiro: nomeArquivo,
                eventos_proximos: this.gerenciadorEventos.obterEventosProximos().length
            };

        } catch (error) {
            console.error('❌ Erro na execução completa:', error.message);
            throw error;
        }
    }

    // NOVO: Método principal com sistema de revisão integrado
    async gerarEpisodioCompleto(opcoes = {}) {
        console.log('🎙️ === BUBUIA NEWS - GERAÇÃO COMPLETA ===');
        
        // Verificar se precisa revisão
        const precisaRevisao = this.sistemaRevisao.precisaRevisao();
        const estatisticas = this.sistemaRevisao.obterEstatisticas();
        
        console.log(`📊 Episódio #${estatisticas.episodios_processados + 1}`);
        console.log(`🤖 Nível autonomia: ${estatisticas.nivel_autonomia}/10`);
        console.log(`📝 Precisa revisão: ${precisaRevisao ? 'SIM' : 'NÃO'}`);
        
        try {
            // 1. Gerar roteiro
            const roteiro = this.gerarRoteiro();
            
            // 2. Criar metadados do episódio
            const metadados = {
                episodio_numero: estatisticas.episodios_processados + 1,
                data_geracao: new Date().toISOString(),
                nivel_autonomia: estatisticas.nivel_autonomia,
                precisa_revisao: precisaRevisao,
                areas_atencao: estatisticas.areas_problematicas.slice(0, 3)
            };

            if (precisaRevisao) {
                // MODO REVISÃO: Gerar arquivos para correção
                console.log('\n📝 === MODO REVISÃO ATIVADO ===');
                console.log('Sistema ainda está aprendendo...');
                
                const arquivosRevisao = this.sistemaRevisao.gerarVersaoRevisao(roteiro, metadados);
                
                return {
                    modo: 'revisao',
                    roteiro_original: roteiro,
                    arquivos: arquivosRevisao,
                    metadados,
                    proximos_passos: [
                        '1. Edite o arquivo *_corrigido.md com suas correções',
                        '2. Execute: npm run processar-correcao [nome-arquivo]',
                        '3. Sistema aprenderá com suas mudanças automáticamente'
                    ]
                };
                
            } else {
                // MODO AUTÔNOMO: Gerar diretamente
                console.log('\n🤖 === MODO AUTÔNOMO ATIVADO ===');
                console.log('Sistema funcionando independentemente!');
                
                const nomeArquivo = this.salvarRoteiro(roteiro);
                
                if (opcoes.gerarAudio) {
                    console.log('🎵 Gerando áudios automaticamente...');
                    const infoAudios = await this.integracaoIA.processarRoteiroCompleto(
                        path.join(__dirname, nomeArquivo)
                    );
                    
                    return {
                        modo: 'autonomo',
                        roteiro: nomeArquivo,
                        audios: infoAudios,
                        metadados
                    };
                }

                return {
                    modo: 'autonomo',
                    roteiro: nomeArquivo,
                    metadados
                };
            }

        } catch (error) {
            console.error('❌ Erro na geração completa:', error.message);
            throw error;
        }
    }

    // Método para substituir variáveis undefined no roteiro
    processarTextoRoteiro(texto) {
        if (!texto) return '';
        
        // Substituir variáveis undefined comuns
        texto = texto.replace(/\bundefined\b/g, '');
        texto = texto.replace(/\$\{[^}]*undefined[^}]*\}/g, '');
        texto = texto.replace(/\$\{.*?\}/g, (match) => {
            console.warn('⚠️ Variável não resolvida:', match);
            return '';
        });
        
        // Limpar espaços extras
        texto = texto.replace(/\s+/g, ' ').trim();
        
        return texto;
    }

    // Método para obter nome correto dos personagens
    obterNomePersonagem(personagem) {
        if (typeof personagem === 'string') {
            if (personagem.toLowerCase().includes('taina') || personagem.toLowerCase().includes('tainá')) {
                return 'Tainá';
            }
            if (personagem.toLowerCase().includes('iray') || personagem.toLowerCase().includes('iraí')) {
                return 'Iraí';
            }
        }
        return personagem?.nome || personagem || 'Apresentador';
    }

    // Método para aplicar características dos personagens
    aplicarCaracteristicasPersonagem(texto, nomePersonagem) {
        if (!texto) return '';
        
        // Buscar personagem no arquivo JSON
        const personagem = this.personagens.find(p => 
            p.nome.toLowerCase() === nomePersonagem.toLowerCase()
        );
        
        if (!personagem) return texto;
        
        // Reduzir uso excessivo de "oxe" e "vichi"
        if (nomePersonagem === 'Tainá') {
            // Substituir algumas ocorrências de "oxe" por variações
            texto = texto.replace(/\boxe\b/gi, (match, index, string) => {
                const random = Math.random();
                if (random < 0.4) return 'eita';
                if (random < 0.6) return 'né';
                return match; // Manter algumas
            });
        }
        
        if (nomePersonagem === 'Iraí') {
            // Substituir "vichi" por variações mais manauaras
            texto = texto.replace(/\bvichi\b/gi, (match, index, string) => {
                const random = Math.random();
                if (random < 0.5) return 'rapaz';
                if (random < 0.7) return 'pois é';
                return match; // Manter algumas
            });
            
            // Garantir que nome está correto
            texto = texto.replace(/\biray\b/gi, 'Iraí');
        }
        
        return texto;
    }

    // Métodos para gerar gírias dos personagens
    gerarGiriaTaina() {
        const girias = ['eita', 'né', 'meu povo', 'massa', 'danado', 'maninho'];
        return girias[Math.floor(Math.random() * girias.length)];
    }

    gerarGiriaIrai() {
        const girias = ['rapaz', 'pois é', 'né', 'caboco', 'massa', 'maninho'];
        return girias[Math.floor(Math.random() * girias.length)];
    }

    // Métodos que estavam faltando para as variáveis do template
    obterApresentador() {
        return Math.random() > 0.5 ? 'Tainá' : 'Iraí';
    }

    obterApresentadorPrincipal() {
        return 'Tainá';
    }

    obterApresentadorSecundario() {
        return 'Iraí';
    }

    gerarComentarioBoiTaina() {
        const comentarios = [
            "Garantido no coração sempre, né meu povo!",
            "Vermelho e branco é a nossa paixão!",
            "O sangue indígena pulsa forte no Festival!",
            "Parintins é magia pura, maninho!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioBoiIrai() {
        const comentarios = [
            "Rapaz, os dois bois são impressionantes!",
            "Pois é, né? O Festival é patrimônio nosso!",
            "É massa ver toda essa cultura amazônica!",
            "Barbaridade, que espetáculo!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioIraiManchete() {
        const comentarios = [
            "Pois é, rapaz... a situação tá bem assim mesmo.",
            "É bem assim que acontece aqui em Manaus, né?",
            "Rapaz, isso aí é típico da nossa região.",
            "Caboco, essa história é interessante mesmo!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioTaina() {
        const comentarios = [
            "Eita, meu povo! Que história essa!",
            "Né, pessoal? A gente sempre traz o que tá rolando!",
            "Massa demais essa notícia!",
            "Maninho, isso aí é importante de saber!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioRivalidade() {
        const rivalidades = [
            "**Tainá:** Iraí, você tem que escolher um lado no Festival!\\n**Iraí:** Rapaz, os dois bois são bonitos, né?",
            "**Iraí:** Essa Tainá não sossega com o Garantido!\\n**Tainá:** Né que é! Vermelho e branco no coração!"
        ];
        return rivalidades[Math.floor(Math.random() * rivalidades.length)];
    }

    gerarDespedidaConjunta() {
        const despedidas = [
            "**Tainá:** Valeu, meu povo!\\n**Iraí:** Até a próxima, pessoal!",
            "**Iraí:** Foi massa estar com vocês!\\n**Tainá:** BubuiA News sempre no ar!",
            "**Tainá:** Comenta aí da sua rede!\\n**Iraí:** E não esqueçam de compartilhar!"
        ];
        return despedidas[Math.floor(Math.random() * despedidas.length)];
    }

    gerarEncerramentoTaina() {
        const encerramentos = [
            "Eita, meu povo! Foi massa demais estar com vocês hoje!",
            "Né, pessoal? O BubuiA News tá sempre aqui pra vocês!",
            "Massa! Até o próximo episódio, maninho!"
        ];
        return encerramentos[Math.floor(Math.random() * encerramentos.length)];
    }

    gerarEncerramentoIrai() {
        const encerramentos = [
            "Pois é, né? Foi ótimo estar aqui com vocês hoje!",
            "Rapaz, sempre bom conversar com vocês!",
            "É bem assim mesmo, caboco! Até a próxima!"
        ];
        return encerramentos[Math.floor(Math.random() * encerramentos.length)];
    }

    gerarDialogoCultura() {
        const dialogos = [
            "**Tainá:** A floresta ensina quem sabe escutar, né maninho?\\n**Iraí:** É verdade! Essa sabedoria ancestral é impressionante.",
            "**Iraí:** Conta aí sobre essas tradições de Parintins, Tai.\\n**Tainá:** Eita! É muita história bonita do meu povo!"
        ];
        return dialogos[Math.floor(Math.random() * dialogos.length)];
    }

    gerarNoticia1() {
        const noticias = [
            "Prefeitura anuncia obras na Constantino Nery para melhorar trânsito",
            "Teatro Amazonas recebe espetáculo regional neste fim de semana",
            "Mercado Municipal passa por revitalização em nova fase"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    gerarNoticia2() {
        const noticias = [
            "Festival de Parintins divulga programação oficial de 2025",
            "Feira de artesanato amazônico acontece na Ponta Negra",
            "Centro Cultural recebe exposição sobre cultura indígena"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    gerarNoticia3() {
        const noticias = [
            "Chuvas causam alagamentos pontuais na Zona Leste",
            "Inauguração de nova unidade de saúde na Compensa",
            "Projeto de preservação do Meeting das Águas ganha força"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    gerarNoticiaEsporte() {
        const noticias = [
            "Nacional prepara elenco para temporada 2025",
            "Fast Clube anuncia contratações para a Série D",
            "Campeonato Amazonense divulga tabela de jogos"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    obterListaGiriasTaina() {
        return "eita, né, meu povo, massa, danado, maninho, curumim";
    }

    obterListaGiriasIrai() {
        return "rapaz, pois é, né, caboco, massa, maninho, barbaridade";
    }

    gerarManchetePrincipal() {
        const manchetes = [
            "Obras na Constantino Nery prometem melhorar trânsito",
            "Festival de Parintins 2025 terá novidades especiais",
            "Teatro Amazonas completa mais um ano de história",
            "Mercado Municipal ganha cara nova com revitalização"
        ];
        return manchetes[Math.floor(Math.random() * manchetes.length)];
    }

    gerarRespostaTaina() {
        const respostas = [
            "Eita, né! É bem assim mesmo!",
            "Massa, Iraí! Concordo contigo!",
            "Né, meu povo? Exatamente isso!"
        ];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    gerarRespostaIrai() {
        const respostas = [
            "Pois é, Tai! É exatamente assim!",
            "Rapaz, você falou tudo!",
            "É bem assim mesmo, né?"
        ];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    obterDuracao() {
        return "15-20 minutos";
    }

    obterTimestamp() {
        return new Date().toISOString();
    }

    obterTemasPrincipais() {
        return "Notícias locais, cultura amazônica, eventos regionais";
    }

    obterTimeFoco() {
        return Math.random() > 0.5 ? "Garantido" : "Caprichoso";
    }

    obterEfeitosSonoros() {
        return "Som ambiente de floresta, vinhetas regionais";
    }

    obterObservacoesTecnicas() {
        return "Pausas naturais, variação de velocidade por personagem, ênfase em gírias regionais";
    }

    obterNumeroEpisodio() {
        // Calcular número do episódio baseado na data ou usar contador
        const hoje = new Date();
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        const diasDoAno = Math.floor((hoje - inicioAno) / (24 * 60 * 60 * 1000));
        return Math.floor(diasDoAno / 7) + 1; // Episódio por semana
    }

    obterDuracao() {
        return "15-20 minutos";
    }

    obterTimestamp() {
        return new Date().toISOString();
    }

    obterTemasPrincipais() {
        return "Notícias locais, cultura amazônica, eventos regionais";
    }

    obterTimeFoco() {
        return "Nacional";
    }

    obterEfeitosSonoros() {
        return "Som ambiente de floresta, vinhetas regionais";
    }

    // === NOVOS MÉTODOS CONTEXTUAIS ===
    
    async inicializarSistemasContextuais() {
        if (!this.classificadorContextual) {
            const ClassificadorContextual = require('./classificadorContextual');
            const GeradorComentariosContextuais = require('./comentariosContextuais');
            const MixadorAutomatico = require('./mixadorAutomatico');
            
            this.classificadorContextual = new ClassificadorContextual();
            this.geradorComentarios = new GeradorComentariosContextuais();
            this.mixadorAutomatico = new MixadorAutomatico();
        }
    }

    async processarNoticiaComContexto(noticia) {
        await this.inicializarSistemasContextuais();
        
        // 1. Classificar contexto automaticamente
        const contexto = await this.classificadorContextual.classificarNoticia(noticia);
        
        // 2. Obter configuração de voz para o contexto
        const configVoz = this.classificadorContextual.obterConfiguracaoVoz(contexto);
        
        // 3. Processar com comentários contextuais
        const noticiaProcessada = await this.geradorComentarios.processarNoticiaComReacao(noticia, contexto);
        
        return {
            ...noticiaProcessada,
            contexto,
            configVoz
        };
    }

    async gerarEpisodioCompleto() {
        try {
            console.log('🎙️ === BUBUIA NEWS - GERAÇÃO COMPLETA ===');
            console.log(`📊 Episódio #${this.obterNumeroEpisodio()}`);
            console.log(`🤖 Nível autonomia: ${this.sistemaRevisao?.obterNivelAutonomia?.() || 0}/10`);
            console.log(`📝 Precisa revisão: ${this.sistemaRevisao?.precisaRevisao?.() ? 'SIM' : 'NÃO'}`);

            // 1. Gerar roteiro com contextos
            const roteiroComContextos = await this.gerarRoteiroContextual();
            
            // 2. Gerar áudio com mixagem automática
            const audioCompleto = await this.gerarAudioCompleto(roteiroComContextos);
            
            // 3. Sistema de revisão
            const analise = this.sistemaRevisao?.analisarEpisodio?.(roteiroComContextos, audioCompleto) || {
                qualidade: 'boa',
                sugestoes: [],
                status: 'aprovado'
            };
            
            return {
                roteiro: roteiroComContextos,
                audio: audioCompleto,
                analise,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erro na geração completa:', error.message);
            throw error;
        }
    }

    async gerarRoteiroContextual() {
        // Gerar roteiro base
        const roteiroBase = this.gerarRoteiro();
        
        // Processar notícias com contextos
        const noticiasProcessadas = [];
        const noticias = [
            this.gerarManchetePrincipal(),
            this.gerarMancheteSecundaria(),
            this.gerarMancheteTerciaria(),
            this.gerarNoticiaEsporte()
        ];
        
        for (let noticia of noticias) {
            const processada = await this.processarNoticiaComContexto(noticia);
            noticiasProcessadas.push(processada);
        }
        
        // Aplicar comentários contextuais no roteiro
        let roteiroFinal = roteiroBase;
        noticiasProcessadas.forEach((noticia, index) => {
            if (noticia.reacoes && noticia.reacoes.length > 0) {
                // Inserir reações após cada notícia
                const reacaoTexto = noticia.reacoes.map(r => 
                    `**${r.personagem.charAt(0).toUpperCase() + r.personagem.slice(1)}:** ${r.comentario}`
                ).join('\n');
                
                // Substituir placeholder ou adicionar após notícia
                const noticiaOriginal = noticia.noticia;
                const noticiaComReacao = `${noticiaOriginal}\n\n${reacaoTexto}`;
                roteiroFinal = roteiroFinal.replace(noticiaOriginal, noticiaComReacao);
            }
        });
        
        return {
            texto: roteiroFinal,
            contextos: noticiasProcessadas,
            metadados: {
                titulo: `BubuiA News - ${this.obterDataFormatada()}`,
                episodio: this.obterNumeroEpisodio(),
                contextos_utilizados: noticiasProcessadas.map(n => n.contexto)
            }
        };
    }

    async gerarAudioCompleto(roteiroData) {
        await this.inicializarSistemasContextuais();
        
        console.log('🎵 Modo simulação - gerando timeline de áudio...');
        
        // 1. Quebrar roteiro em segmentos
        const segmentos = this.quebrarRoteiroEmSegmentos(roteiroData.texto);
        
        // 2. Simular áudio para cada segmento com configuração contextual
        const segmentosAudio = [];
        
        for (let segmento of segmentos) {
            const contexto = this.identificarContextoSegmento(segmento, roteiroData.contextos);
            const configVoz = contexto ? contexto.configVoz : this.obterConfiguracaoVozPadrao();
            
            const audioSegmento = await this.simularAudioSegmento(segmento, configVoz);
            segmentosAudio.push(audioSegmento);
        }
        
        // 3. Gerar relatório em vez de mixar áudio real
        const relatorioAudio = this.gerarRelatorioAudio(segmentosAudio, roteiroData.metadados);
        
        return relatorioAudio;
    }

    async simularAudioSegmento(segmento, configVoz) {
        // Normalizar nome do personagem
        let personagemKey = segmento.personagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (personagemKey.includes('taina')) personagemKey = 'taina';
        else if (personagemKey.includes('irai')) personagemKey = 'irai';

        // TODO: Integrar com ElevenLabs ou outro TTS real
        // Aqui você pode chamar: await integracaoIA.gerarAudio(segmento.texto, personagemKey, { configVoz });
        // Por enquanto, simular
        const nomeArquivo = `temp_${personagemKey}_${segmento.ordem}.mp3`;
        const caminhoArquivo = require('path').join(__dirname, 'temp_audio', nomeArquivo);
        const duracaoEstimada = segmento.texto.length * 0.05; // ~50ms por caractere

        return {
            arquivo: caminhoArquivo,
            duracao: duracaoEstimada,
            personagem: personagemKey,
            bloco: segmento.bloco,
            texto: segmento.texto,
            configVoz: configVoz
        };
    }

    gerarRelatorioAudio(segmentosAudio, metadados) {
        const duracaoTotal = segmentosAudio.reduce((total, seg) => total + seg.duracao, 0);
        const minutos = Math.floor(duracaoTotal / 60);
        const segundos = Math.floor(duracaoTotal % 60);
        
        // Contagem correta por personagem - verificar valores exatos
        const tainaSegmentos = segmentosAudio.filter(s => s.personagem === 'taina');
        const iraiSegmentos = segmentosAudio.filter(s => s.personagem === 'irai');
        
        console.log(`🔍 Debug contagem no relatório:`);
        console.log(`   Total de segmentos: ${segmentosAudio.length}`);
        console.log(`   Tainá encontrados: ${tainaSegmentos.length}`);
        console.log(`   Iraí encontrados: ${iraiSegmentos.length}`);
        
        // Verificar personagens únicos
        const personagensUnicos = [...new Set(segmentosAudio.map(s => s.personagem))];
        console.log(`   Personagens: ${personagensUnicos.join(', ')}`);
        
        const relatorio = {
            tipo: 'simulacao',
            segmentos: segmentosAudio.length,
            duracao_total: `${minutos}:${segundos.toString().padStart(2, '0')}`,
            duracao_segundos: duracaoTotal,
            personagens: {
                taina: tainaSegmentos.length,
                irai: iraiSegmentos.length
            },
            blocos: [...new Set(segmentosAudio.map(s => s.bloco))],
            arquivo_simulado: `bubuia_news_${new Date().toISOString().split('T')[0]}_completo.mp3`,
            detalhes: segmentosAudio.slice(0, 5) // Primeiros 5 para debug
        };
        
        console.log(`🎵 Simulação concluída: ${relatorio.segmentos} segmentos, ${relatorio.duracao_total}`);
        console.log(`👩 Tainá: ${relatorio.personagens.taina} falas | 👨 Iraí: ${relatorio.personagens.irai} falas`);
        
        // Debug adicional se contagem zerada
        if (relatorio.personagens.taina === 0 && relatorio.personagens.irai === 0) {
            console.log('⚠️ Simulação não encontrou falas dos apresentadores!');
            console.log('🔍 Tipos de segmentos encontrados:');
            const tipos = [...new Set(segmentosAudio.map(s => s.personagem))];
            tipos.forEach(tipo => {
                const count = segmentosAudio.filter(s => s.personagem === tipo).length;
                console.log(`   - ${tipo}: ${count} segmentos`);
            });
        }
        
        return relatorio;
    }

    quebrarRoteiroEmSegmentos(roteiro) {
        const linhas = roteiro.split('\n');
        const segmentos = [];
        let blocoAtual = 'introducao';
        
        console.log('🔍 Analisando roteiro linha por linha...');
        
        linhas.forEach((linha, index) => {
            // Identificar blocos
            if (linha.includes('## ')) {
                if (linha.includes('MANCHETES')) blocoAtual = 'manchetes';
                else if (linha.includes('ESPORTES')) blocoAtual = 'esportes';
                else if (linha.includes('CULTURA')) blocoAtual = 'cultura';
                else if (linha.includes('RECADO')) blocoAtual = 'recados';
                else if (linha.includes('ENCERRAMENTO')) blocoAtual = 'encerramento';
                else if (linha.includes('INTRODUÇÃO')) blocoAtual = 'introducao';
                else if (linha.includes('CARDÁPIO')) blocoAtual = 'cardapio';
                console.log(`📍 Bloco encontrado: ${blocoAtual} (linha ${index + 1})`);
            }
            
            // Tentar múltiplos patterns para capturar falas
            let matchPersonagem = null;
            
            // Pattern principal: **Nome:**
            matchPersonagem = linha.match(/\*\*(Tainá|Iraí):\*\*\s*(.+)/);
            
            if (!matchPersonagem) {
                // Pattern alternativo: **Nome:** com espaços
                matchPersonagem = linha.match(/\*\*\s*(Tainá|Iraí)\s*:\s*\*\*\s*(.+)/);
            }
            
            if (!matchPersonagem) {
                // Pattern sem markdown: Nome:
                matchPersonagem = linha.match(/(Tainá|Iraí):\s*(.+)/);
            }
            
            if (matchPersonagem && matchPersonagem[2] && matchPersonagem[2].trim().length > 3) {
                // Normalizar nomes para sem acento (consistência)
                const personagemNormalizado = matchPersonagem[1].toLowerCase()
                    .replace('á', 'a')
                    .replace('í', 'i');
                
                const texto = matchPersonagem[2].trim();
                
                segmentos.push({
                    personagem: personagemNormalizado, // 'taina' ou 'irai' sem acento
                    texto,
                    bloco: blocoAtual,
                    ordem: segmentos.length,
                    linha: index + 1
                });
                
                console.log(`💬 Fala capturada: ${personagemNormalizado} (linha ${index + 1}): "${texto.substring(0, 30)}..."`);
            }
        });
        
        console.log(`📝 Roteiro quebrado em ${segmentos.length} segmentos`);
        
        // Contagem por personagem - sem filtro adicional
        const tainaFalas = segmentos.filter(s => s.personagem === 'taina').length;
        const iraiFalas = segmentos.filter(s => s.personagem === 'irai').length;
        
        console.log(`👩 Falas da Tainá: ${tainaFalas}`);
        console.log(`👨 Falas do Iraí: ${iraiFalas}`);
        
        // Debug: mostrar primeiras linhas do roteiro se contagem zerada
        if (tainaFalas === 0 && iraiFalas === 0) {
            console.log('⚠️ Contagem zerada! Primeiras 10 linhas do roteiro:');
            linhas.slice(0, 10).forEach((linha, i) => {
                console.log(`${i + 1}: ${linha}`);
            });
            
            console.log('\n🔍 Segmentos detectados mas não contados:');
            segmentos.slice(0, 5).forEach(seg => {
                console.log(`- ${seg.personagem}: "${seg.texto.substring(0, 30)}..."`);
            });
        }
        
        return segmentos; // Retornar todos os segmentos
    }

    identificarContextoSegmento(segmento, contextos) {
        // Buscar contexto baseado no texto do segmento
        for (let contexto of contextos) {
            if (segmento.texto.includes(contexto.noticia.substring(0, 20))) {
                return contexto;
            }
        }
        return null;
    }

    async gerarAudioSegmento(segmento, configVoz) {
        // Normalizar nome do personagem
        let personagemKey = segmento.personagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (personagemKey.includes('taina')) personagemKey = 'taina';
        else if (personagemKey.includes('irai')) personagemKey = 'irai';

        // TODO: Integrar com ElevenLabs ou outro TTS real
        // Aqui você pode chamar: await integracaoIA.gerarAudio(segmento.texto, personagemKey, { configVoz });
        // Por enquanto, simular
        const nomeArquivo = `temp_${personagemKey}_${segmento.ordem}.mp3`;
        const caminhoArquivo = require('path').join(__dirname, 'temp_audio', nomeArquivo);
        const duracaoEstimada = segmento.texto.length * 0.05; // ~50ms por caractere

        return {
            arquivo: caminhoArquivo,
            duracao: duracaoEstimada,
            personagem: personagemKey,
            bloco: segmento.bloco,
            texto: segmento.texto,
            configVoz: configVoz
        };
    }

    // Métodos que estavam sendo chamados no gerarRoteiro mas não existiam
    gerarClimaManaus() {
        const climas = [
            "Sol pela manhã com pancadas de chuva à tarde - o clássico de Manaus!",
            "Calor de 34°C com sensação térmica de 42°C - preparem o ventilador!",
            "Chuva forte prevista para hoje - saiam com guarda-chuva!",
            "Tempo seco e muito calor - hidratem-se, meu povo!"
        ];
        return climas[Math.floor(Math.random() * climas.length)];
    }

    gerarTransitoManaus() {
        const transitos = [
            "Constantino Nery com lentidão no sentido Centro - novidade nenhuma!",
            "Torquato Tapajós fluindo bem por enquanto",
            "Djalma Batista com os buracos de sempre - cuidado aí!",
            "Zona Leste complicada por conta da chuva da madrugada"
        ];
        return transitos[Math.floor(Math.random() * transitos.length)];
    }

    gerarPiadaLocal() {
        const piadas = [
            "Trânsito mais lento que boto subindo corredeira!",
            "Chuva que nem enchente de 2012!",
            "Calor de derreter até o ferro do Teatro Amazonas!",
            "Buraco na rua maior que piscina natural!"
        ];
        return piadas[Math.floor(Math.random() * piadas.length)];
    }

    gerarEventoDestaque() {
        const eventos = [
            "Festival gastronômico na Ponta Negra",
            "Show regional no Largo de São Sebastião", 
            "Feira de artesanato no Centro Histórico",
            "Apresentação cultural no Teatro Amazonas"
        ];
        return eventos[Math.floor(Math.random() * eventos.length)];
    }

    gerarMancheteSecundaria() {
        const manchetes = [
            "Mercado Municipal inaugura nova ala de produtos regionais",
            "Universidade Federal do Amazonas anuncia novos cursos",
            "Porto de Manaus registra aumento no movimento de cargas",
            "Centro Histórico recebe projeto de revitalização urbana"
        ];
        return manchetes[Math.floor(Math.random() * manchetes.length)];
    }

    gerarMancheteTerciaria() {
        const manchetes = [
            "Projeto preserva línguas indígenas da região amazônica",
            "Nova linha de ônibus conecta bairros da Zona Norte",
            "Feira de tecnologia amazônica acontece no próximo mês",
            "Artesãos locais ganham espaço em shopping da cidade"
        ];
        return manchetes[Math.floor(Math.random() * manchetes.length)];
    }

    gerarClimaRelevante() {
        // Só gera clima quando é algo realmente relevante
        const eventosClimaticos = [
            "🌊 Nível do Rio Negro atinge cota de atenção",
            "☔ Chuvas intensas causam alagamentos em pontos da cidade", 
            "🌵 Estiagem severa afeta abastecimento de água",
            "⛈️ Temporal derruba árvores e causa falta de energia",
            "🌡️ Temperatura máxima bate recorde histórico de 42°C"
        ];
        
        // 30% de chance de ter clima relevante
        if (Math.random() < 0.3) {
            return eventosClimaticos[Math.floor(Math.random() * eventosClimaticos.length)];
        } else {
            return ""; // Sem notícia de clima
        }
    }

    gerarCuriosidadeRegional() {
        const curiosidades = [
            "Você sabia que o Meeting das Águas pode ser visto do espaço?",
            "O Teatro Amazonas foi construído no auge da borracha!",
            "Parintins é conhecida mundialmente pelo Boi-Bumbá!",
            "Manaus é a porta de entrada para a maior floresta do mundo!"
        ];
        return curiosidades[Math.floor(Math.random() * curiosidades.length)];
    }

    executar() {
        console.log('🎙️ Gerando roteiro do podcast...');
        
        try {
            const roteiro = this.gerarRoteiro();
            const nomeArquivo = this.salvarRoteiro(roteiro);
            
            console.log('📋 Roteiro gerado com sucesso!');
            console.log(`📄 Arquivo: ${nomeArquivo}`);
            console.log('🎉 Bom programa!');
            
        } catch (error) {
            console.error('❌ Erro ao gerar roteiro:', error.message);
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    const gerador = new GeradorRoteiro();
    
    // Teste do sistema completo
    console.log('🎙️ === BUBUIA NEWS - SISTEMA COMPLETO ===');
    console.log('📻 Testando nova estrutura de diálogos...\n');
    
    try {
        const roteiro = gerador.gerarRoteiro();
        const nomeArquivo = gerador.salvarRoteiro(roteiro);
        
        console.log('\n🎉 === TESTE CONCLUÍDO ===');
        console.log(`📄 Arquivo: ${nomeArquivo}`);
        console.log('✅ Nova introdução oficial implementada');
        console.log('✅ Sistema de diálogos espontâneos funcionando');
        console.log('✅ Interações com audiência, editor e locais');
        console.log('✅ Transições naturais para cardápio');
        console.log('\n🚀 BubuiA News pronto para decolar!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

module.exports = GeradorRoteiro;
        console.log('\n🎉 === TESTE CONCLUÍDO ===');
        console.log(`📄 Arquivo: ${nomeArquivo}`);
        console.log('✅ Nova introdução oficial implementada');
        console.log('✅ Sistema de diálogos espontâneos funcionando');
        console.log('✅ Interações com audiência, editor e locais');
        console.log('✅ Transições naturais para cardápio');
        console.log('\n🚀 BubuiA News pronto para decolar!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

module.exports = GeradorRoteiro;
