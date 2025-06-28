const fs = require('fs');

class ClassificadorContextual {
    constructor() {
        console.log('ℹ️ Modo fallback ativo - usando análise baseada em regras');
        this.contextos = this.carregarContextos();
    }

    carregarContextos() {
        return {
            'cultura_parintins': {
                palavrasChave: ['parintins', 'festival', 'boi', 'garantido', 'caprichoso', 'arena', 'toada', 'folclore'],
                peso: 3
            },
            'tragico': {
                palavrasChave: ['acidente', 'morte', 'morreu', 'morto', 'vítima', 'fatal', 'grave', 'ferido', 'tragédia'],
                peso: 4
            },
            'infraestrutura_urbana': {
                palavrasChave: ['buraco', 'rua', 'asfalto', 'estrada', 'ponte', 'obras', 'construção', 'trânsito', 'semáforo'],
                peso: 2
            },
            'politica': {
                palavrasChave: ['prefeito', 'vereador', 'governo', 'prefeitura', 'político', 'eleição', 'câmara', 'lei'],
                peso: 2
            },
            'economia': {
                palavrasChave: ['economia', 'dinheiro', 'emprego', 'salário', 'preço', 'mercado', 'empresa', 'negócio'],
                peso: 2
            },
            'seguranca': {
                palavrasChave: ['polícia', 'crime', 'assalto', 'roubo', 'prisão', 'violência', 'segurança', 'delegacia'],
                peso: 3
            },
            'saude': {
                palavrasChave: ['hospital', 'médico', 'saúde', 'doença', 'tratamento', 'sus', 'vacina', 'pandemia'],
                peso: 2
            },
            'educacao': {
                palavrasChave: ['escola', 'universidade', 'educação', 'professor', 'aluno', 'ensino', 'faculdade'],
                peso: 2
            },
            'clima_severo': {
                palavrasChave: ['chuva', 'tempestade', 'alagamento', 'enchente', 'temporal', 'clima', 'meteorologia'],
                peso: 3
            },
            'esporte': {
                palavrasChave: ['futebol', 'nacional', 'fast', 'time', 'jogador', 'campeonato', 'esporte', 'jogo'],
                peso: 2
            }
        };
    }

    async classificarNoticia(noticia) {
        try {
            // Garantir que temos um título válido
            const titulo = this.extrairTitulo(noticia);
            
            if (!titulo) {
                console.log('⚠️ Título não encontrado, usando contexto geral');
                return 'geral';
            }

            console.log('ℹ️ Usando análise fallback (IA não disponível)');
            return this.classificarPorRegras(titulo);
        } catch (error) {
            console.log(`❌ Erro na classificação: ${error.message}`);
            return 'geral';
        }
    }

    extrairTitulo(noticia) {
        // Diferentes formas de obter o título
        if (typeof noticia === 'string') {
            return noticia;
        }
        
        if (noticia && typeof noticia === 'object') {
            return noticia.titulo || noticia.title || noticia.headline || '';
        }
        
        return '';
    }

    classificarPorRegras(titulo) {
        if (!titulo || typeof titulo !== 'string') return 'geral';

        const pontuacoes = {};
        for (const [contexto, config] of Object.entries(this.contextos)) {
            pontuacoes[contexto] = this.analisarPalavrasChave(titulo, config.palavrasChave, config.peso);
        }
        const melhorContexto = Object.keys(pontuacoes).reduce((a, b) =>
            pontuacoes[a] > pontuacoes[b] ? a : b
        );
        return pontuacoes[melhorContexto] > 0 ? melhorContexto : 'geral';
    }

    analisarPalavrasChave(texto, palavrasChave, peso = 1) {
        if (!texto || typeof texto !== 'string') {
            return 0;
        }
        
        const textoLower = texto.toLowerCase();
        let pontuacao = 0;
        
        for (const palavra of palavrasChave) {
            if (textoLower.includes(palavra.toLowerCase())) {
                pontuacao += peso;
            }
        }
        
        return pontuacao;
    }

    obterConfiguracaoVoz(contexto) {
        const configuracoes = {
            'cultura_parintins': {
                taina: { emocao: 'very_excited', velocidade: 1.2, intensidade: 'high' },
                irai: { emocao: 'curious', velocidade: 1.0, intensidade: 'medium' }
            },
            'tragico': {
                taina: { emocao: 'sad', velocidade: 0.8, intensidade: 'low' },
                irai: { emocao: 'concerned', velocidade: 0.8, intensidade: 'low' }
            },
            'infraestrutura_urbana': {
                taina: { emocao: 'frustrated', velocidade: 1.1, intensidade: 'medium_high' },
                irai: { emocao: 'resigned', velocidade: 0.9, intensidade: 'medium' }
            },
            'politica': {
                taina: { emocao: 'analytical', velocidade: 1.0, intensidade: 'medium' },
                irai: { emocao: 'thoughtful', velocidade: 0.9, intensidade: 'medium' }
            },
            'clima_severo': {
                taina: { emocao: 'concerned', velocidade: 1.0, intensidade: 'medium' },
                irai: { emocao: 'serious', velocidade: 0.9, intensidade: 'medium' }
            },
            'geral': {
                taina: { emocao: 'conversational', velocidade: 1.0, intensidade: 'medium' },
                irai: { emocao: 'conversational', velocidade: 0.95, intensidade: 'medium' }
            }
        };

        return configuracoes[contexto] || configuracoes.geral;
    }
}

module.exports = ClassificadorContextual;