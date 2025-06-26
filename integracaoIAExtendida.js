const IntegracaoIA = require('./integracaoIA');

class IntegracaoIAExtendida extends IntegracaoIA {
    constructor() {
        super();
        // Inicializar fetch de forma síncrona
        this.garantirFetch();
    }

    garantirFetch() {
        // Verificar se fetch está disponível globalmente
        if (typeof global.fetch === 'undefined' && typeof fetch === 'undefined') {
            console.log('⚠️ Fetch não disponível, modo fallback ativo');
            this.fetchDisponivel = false;
        } else {
            this.fetchDisponivel = true;
            // Se fetch não está global mas existe, torná-lo global
            if (typeof global.fetch === 'undefined' && typeof fetch !== 'undefined') {
                global.fetch = fetch;
            }
        }
    }

    async gerarTexto(prompt, maxTokens = 150) {
        try {
            // Recarregar .env para garantir que está atualizado
            require('dotenv').config();
            
            // Verificar se OpenAI está configurada
            if (!process.env.OPENAI_API_KEY || 
                process.env.OPENAI_API_KEY === 'sua_chave_openai_aqui' ||
                !process.env.OPENAI_API_KEY.startsWith('sk-')) {
                console.log('⚠️ OpenAI não configurada adequadamente, usando fallback');
                return this.respostaFallback(prompt);
            }

            // Verificar se fetch está disponível
            if (!this.fetchDisponivel) {
                console.log('⚠️ Fetch não disponível, usando fallback');
                return this.respostaFallback(prompt);
            }

            console.log('🧠 Gerando texto com OpenAI GPT-4...');
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.8,
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API erro: ${response.status}`);
            }

            const data = await response.json();
            const textoGerado = data.choices[0]?.message?.content?.trim();

            if (!textoGerado) {
                throw new Error('Resposta vazia da OpenAI');
            }

            console.log(`✅ Texto gerado: ${textoGerado.length} caracteres`);
            return textoGerado;

        } catch (error) {
            console.log(`❌ Erro na OpenAI: ${error.message}`);
            console.log('🔄 Usando resposta fallback...');
            return this.respostaFallback(prompt);
        }
    }

    respostaFallback(prompt) {
        // Respostas simples baseadas em palavras-chave do prompt
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('introdução') || promptLower.includes('introduz')) {
            return `**Tainá:** Fala, meu povo! Tá começando mais um BubuiA News!

**Iraí:** E aqui é o Iraí, trazendo as notícias de dentro da rede!

**Tainá:** Bora ver o que rolou por aqui hoje!`;
        }
        
        if (promptLower.includes('cardápio') || promptLower.includes('manchetes')) {
            return `**Tainá:** Eita, pessoal! O cardápio de hoje tá recheadinho!

**Iraí:** Vamos ver as principais notícias que separamos.`;
        }
        
        if (promptLower.includes('esporte') || promptLower.includes('garantido')) {
            return `**Iraí:** E no esporte, galera...

**Tainá:** Garantido no coração sempre, né meu povo!

**Iraí:** Os dois bois são patrimônio nosso!

**Tainá:** Vermelho e branco é vida!`;
        }
        
        if (promptLower.includes('cultura') || promptLower.includes('amazônic')) {
            return `**Tainá:** A cultura amazônica é nossa riqueza!

**Iraí:** Tradições que vêm de gerações, né?

**Tainá:** A floresta ensina quem sabe escutar!`;
        }
        
        if (promptLower.includes('encerramento') || promptLower.includes('despedida')) {
            return `**Tainá:** Valeu, meu povo! Foi massa estar com vocês!

**Iraí:** Até o próximo episódio, pessoal!

**Tainá:** Comenta aí nas redes sociais!`;
        }
        
        // Resposta genérica
        return `**Tainá:** Eita, interessante isso!

**Iraí:** Pois é, né? Vamos conversar sobre isso.`;
    }
}

module.exports = IntegracaoIAExtendida;