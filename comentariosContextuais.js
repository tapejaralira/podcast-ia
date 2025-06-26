#!/usr/bin/env node

// Tentar carregar OpenAI apenas se disponível
let OpenAI = null;
try {
    OpenAI = require('openai');
} catch (error) {
    console.log('⚠️ OpenAI não instalado - usando comentários pré-definidos');
}

class GeradorComentariosContextuais {
    constructor() {
        // Carregar variáveis de ambiente se disponível
        try {
            require('dotenv').config();
        } catch (error) {
            // dotenv não instalado, continuar sem ele
        }

        this.usarIA = OpenAI && process.env.OPENAI_API_KEY && 
                     process.env.OPENAI_API_KEY !== 'sua_chave_openai_aqui' &&
                     process.env.USE_FALLBACK !== 'true';
        
        if (this.usarIA) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        } else {
            console.log('ℹ️ Modo fallback ativo - usando comentários pré-definidos');
        }
        
        this.probabilidadesReacao = {
            "cultura_parintins": 0.95,
            "tragico": 0.85,
            "infraestrutura_urbana": 0.70,
            "politica_polemica": 0.80,
            "economia_local": 0.40,
            "tecnologia_educacao": 0.75,
            "clima_severo": 0.80,
            "noticia_comum": 0.20
        };
        
        this.tendenciasReacao = {
            "cultura_parintins": "taina",
            "infraestrutura_urbana": "taina",
            "tecnologia_educacao": "irai",
            "economia_local": "irai",
            "clima_severo": "ambos"
        };
    }

    async gerarReacaoContextual(noticia, contexto, personagem) {
        const tipoReacao = this.definirTipoReacao(contexto);
        const comentario = await this.gerarComentarioIA(noticia, contexto, personagem, tipoReacao);
        return comentario; // Remover chamada para método não implementado
    }

    adaptarPersonalidade(comentario, personagem, contexto) {
        // Adaptações básicas por personagem
        if (personagem === 'taina') {
            // Tainá mais expressiva
            if (!comentario.includes('!') && contexto === 'cultura_parintins') {
                comentario += '!';
            }
        } else if (personagem === 'irai') {
            // Iraí mais pausado
            if (!comentario.includes('né') && Math.random() < 0.3) {
                comentario += ', né?';
            }
        }
        
        return comentario;
    }

    definirTipoReacao(contexto) {
        const tipos = {
            "cultura_parintins": "empolgacao_regional",
            "tragico": "pesar_respeitoso",
            "politica": "analise_critica",
            "infraestrutura_urbana": "ironia_construtiva",
            "tecnologia_educacao": "esperanca_futuro",
            "clima_severo": "preocupacao_solidaria",
            "economia_local": "analise_pratica",
            "violencia_urbana": "indignacao_controlada"
        };
        return tipos[contexto] || "curiosidade_jornalistica";
    }

    async gerarComentarioIA(noticia, contexto, personagem, tipoReacao) {
        if (!this.usarIA) {
            console.log('ℹ️ Usando comentários pré-definidos (IA não disponível)');
            return this.obterComentarioFallback(contexto, personagem);
        }

        const caracteristicas = {
            taina: "parintinense orgulhosa, emotiva, usa 'eita', 'meu povo', 'né'",
            irai: "manauara reflexivo, experiência no sul, usa 'pois é', 'rapaz', 'né'"
        };

        const prompt = `
        Gere um comentário breve (1-2 frases) para o apresentador reagir à notícia:
        
        NOTÍCIA: "${noticia}"
        CONTEXTO: ${contexto}
        TIPO DE REAÇÃO: ${tipoReacao}
        APRESENTADOR: ${personagem} - ${caracteristicas[personagem]}
        
        O comentário deve:
        - Ser natural e espontâneo
        - Refletir a personalidade do apresentador
        - Ser apropriado ao contexto
        - Usar gírias regionais sutilmente
        - Ter entre 10-25 palavras
        
        Apenas o comentário, sem aspas:
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 100
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.log('⚠️ Erro na IA, usando fallback:', error.message);
            return this.obterComentarioFallback(contexto, personagem);
        }
    }

    obterComentarioFallback(contexto, personagem) {
        const fallbacks = {
            taina: {
                cultura_parintins: "Eita, meu povo! Já tô com o coração acelerado!",
                infraestrutura_urbana: "Rapaz, essa situação não dá mais!",
                tragico: "Nossa, que tristeza... força às famílias.",
                default: "Eita, né! Que notícia interessante!"
            },
            irai: {
                cultura_parintins: "Essa Tainá já tá contando os dias, né?",
                infraestrutura_urbana: "Pois é, problema antigo esse...",
                tragico: "Situação muito delicada mesmo.",
                default: "Pois é, rapaz... é bem assim mesmo."
            }
        };
        
        return fallbacks[personagem][contexto] || fallbacks[personagem].default;
    }

    avaliarNecessidadeReacao(contexto) {
        const prob = this.probabilidadesReacao[contexto] || 0.30;
        return Math.random() < prob;
    }

    definirQuemReage(contexto) {
        const tendencia = this.tendenciasReacao[contexto];
        if (tendencia === "ambos") {
            return Math.random() < 0.5 ? "taina" : "irai";
        }
        return tendencia || (Math.random() < 0.6 ? "taina" : "irai");
    }

    async processarNoticiaComReacao(noticia, contexto) {
        const precisaReacao = this.avaliarNecessidadeReacao(contexto);
        
        if (!precisaReacao) {
            return { noticia, reacoes: [] };
        }

        const primeiroReagir = this.definirQuemReage(contexto);
        const reacaoPrincipal = await this.gerarReacaoContextual(noticia, contexto, primeiroReagir);
        
        const resultado = {
            noticia,
            reacoes: [
                { personagem: primeiroReagir, comentario: reacaoPrincipal }
            ]
        };

        // 30% chance do outro apresentador responder
        if (Math.random() < 0.3) {
            const segundoApresentador = primeiroReagir === 'taina' ? 'irai' : 'taina';
            const resposta = await this.gerarRespostaContextual(reacaoPrincipal, contexto, segundoApresentador);
            resultado.reacoes.push({ personagem: segundoApresentador, comentario: resposta });
        }

        return resultado;
    }

    async gerarRespostaContextual(reacaoAnterior, contexto, personagem) {
        if (!this.usarIA) {
            return this.obterRespostaFallback(contexto, personagem);
        }

        const prompt = `
        O apresentador ${personagem} vai responder ao comentário do colega sobre uma notícia.
        
        COMENTÁRIO ANTERIOR: "${reacaoAnterior}"
        CONTEXTO: ${contexto}
        
        Gere uma resposta breve (máximo 15 palavras) que:
        - Complemente ou concorde com o comentário anterior
        - Use a personalidade do ${personagem}
        - Seja natural na conversa
        
        Apenas a resposta:
        `;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 50
            });
            return response.choices[0].message.content.trim();
        } catch (error) {
            return this.obterRespostaFallback(contexto, personagem);
        }
    }

    obterRespostaFallback(contexto, personagem) {
        const respostas = {
            taina: {
                cultura_parintins: "Né não, Iraí? É tradição pura!",
                infraestrutura_urbana: "Né? A situação tá complicada mesmo!",
                tragico: "É verdade... momento muito difícil.",
                default: "Né não? É bem assim mesmo!"
            },
            irai: {
                cultura_parintins: "É bem assim mesmo, Tai. Tradição é tradição.",
                infraestrutura_urbana: "Pois é... problema antigo esse.",
                tragico: "Realmente, situação delicada.",
                default: "É bem assim mesmo, né?"
            }
        };
        
        return respostas[personagem][contexto] || respostas[personagem].default;
    }
}

module.exports = GeradorComentariosContextuais;