const IntegracaoIA = require('./integracaoIAExtendida');

class GeradorFalasIA {
    constructor() {
        this.ia = new IntegracaoIA();
        this.contextoEpisodio = {
            episodio: 0,
            data: '',
            apresentadores: {
                taina: {
                    origem: 'Parintins',
                    personalidade: 'expressiva, carinhosa, usa gírias regionais',
                    estiloFala: 'animada, próxima ao público',
                    boiPreferido: 'Garantido (vermelho e branco)'
                },
                irai: {
                    origem: 'Manaus', 
                    personalidade: 'reflexivo, tranquilo, mais pausado',
                    estiloFala: 'analítico, ponderado, diplomático'
                }
            }
        };
    }

    async gerarRoteiroCompleto(noticias, contextoEpisodio = {}) {
        console.log('🧠 Gerando roteiro completo com GPT-4...');
        
        // Atualizar contexto
        this.contextoEpisodio = { ...this.contextoEpisodio, ...contextoEpisodio };
        
        try {
            const roteiro = {
                introducao: await this.gerarIntroducao(),
                cardapio: await this.gerarCardapio(noticias),
                manchetes: await this.gerarManchetes(noticias),
                esportes: await this.gerarBlocoEsportes(noticias),
                cultura: await this.gerarBlocoCultura(),
                encerramento: await this.gerarEncerramento()
            };
            
            return this.montarRoteiroFinal(roteiro);
        } catch (error) {
            console.log('⚠️ Erro na geração com IA, usando fallback...');
            return this.gerarRoteiroFallback(noticias);
        }
    }

    async gerarIntroducao() {
        const prompt = `Você é roteirista do podcast "BubuiA News" do Amazonas.

APRESENTADORES:
- Tainá: De Parintins, expressiva, carinhosa, usa gírias regionais ("Eita!", "meu povo", "maninho")
- Iraí: De Manaus, reflexivo, tranquilo, mais analítico ("Rapaz", "Pois é")

TAREFA: Crie uma introdução natural de 3 falas alternadas.

CONTEXTO: Episódio #${this.contextoEpisodio.episodio}, ${this.contextoEpisodio.data}

FORMATO:
**Tainá:** [fala animada apresentando o programa]
**Iraí:** [complementa apresentação do programa]
**Tainá:** [transição para as notícias]

DIRETRIZES:
- Tom conversacional e descontraído
- Mencionar "BubuiA News"
- Personalidades distintas
- Máximo 30 palavras por fala
- Usar gírias regionais apropriadas`;

        const resposta = await this.ia.gerarTexto(prompt, 120);
        return this.processarFalasGeradas(resposta);
    }

    async gerarCardapio(noticias) {
        const manchetes = noticias.slice(0, 4).map((n, i) => `${i+1}. ${n.titulo}`).join('\n');
        
        const prompt = `APRESENTADORES do BubuiA News:
- Tainá: Parintinense, expressiva, gírias regionais ("Eita!", "meu povo")
- Iraí: Manauara, reflexivo, pausado ("Rapaz", "Vamos ver")

TAREFA: Criar apresentação do "cardápio do dia" (manchetes).

MANCHETES DE HOJE:
${manchetes}

FORMATO:
**Tainá:** [apresenta o cardápio animadamente]
**Iraí:** [confirma e convida para as notícias]

DIRETRIZES:
- Usar expressão "cardápio do dia"
- Tom animado mas informativo
- Máximo 25 palavras por fala
- Gírias regionais da Tainá`;

        const resposta = await this.ia.gerarTexto(prompt, 100);
        return this.processarFalasGeradas(resposta);
    }

    async gerarManchetes(noticias) {
        const manchetePrincipal = noticias[0];
        
        const prompt = `APRESENTADORES do BubuiA News:
- Tainá: Parintinense, expressiva, usa "meu povo", "Eita!", "maninho"
- Iraí: Manauara, reflexivo, usa "Rapaz", "Pois é", "né?"

TAREFA: Apresentar a manchete principal com reação contextual.

MANCHETE: "${manchetePrincipal.titulo}"
CONTEXTO: ${manchetePrincipal.contexto || 'geral'}

FORMATO:
**Tainá:** [apresenta a manchete]
**Iraí:** [reage/comenta apropriadamente]

DIRETRIZES:
- Reação apropriada ao contexto:
  * Tragédia: tom respeitoso e solidário
  * Cultura: tom animado e orgulhoso
  * Política: tom analítico e equilibrado
  * Infraestrutura: tom de cobrança/frustração
- Máximo 30 palavras por fala
- Manter personalidades distintas`;

        const resposta = await this.ia.gerarTexto(prompt, 120);
        return this.processarFalasGeradas(resposta);
    }

    async gerarBlocoEsportes(noticias) {
        const noticiaEsporte = noticias.find(n => 
            n.categoria === 'esporte' || 
            n.titulo.toLowerCase().includes('nacional') ||
            n.titulo.toLowerCase().includes('fast') ||
            n.titulo.toLowerCase().includes('futebol')
        ) || noticias[noticias.length - 1];

        const prompt = `APRESENTADORES do BubuiA News:
- Tainá: Parintinense, FANÁTICA pelo Garantido (boi vermelho e branco)
- Iraí: Manauara, diplomático sobre os bois de Parintins

TAREFA: Apresentar esporte + conversa sobre bois de Parintins.

NOTÍCIA: "${noticiaEsporte.titulo}"

FORMATO:
**Iraí:** [apresenta o bloco esporte]
**Tainá:** [apresenta a notícia]
**Iraí:** [provoca sobre Garantido vs Caprichoso]
**Tainá:** [defende o Garantido apaixonadamente]

DIRETRIZES:
- Tainá SEMPRE defende o Garantido (vermelho e branco)
- Iraí é diplomático mas pode provocar levemente
- Tom descontraído e amigável
- Máximo 25 palavras por fala
- Rivalidade amigável entre os bois`;

        const resposta = await this.ia.gerarTexto(prompt, 150);
        return this.processarFalasGeradas(resposta);
    }

    async gerarBlocoCultura() {
        const prompt = `APRESENTADORES do BubuiA News:
- Tainá: Parintinense, orgulhosa da cultura amazônica
- Iraí: Manauara, valoriza as tradições regionais

TAREFA: Criar bloco sobre cultura/tradições amazônicas.

FORMATO:
**Tainá:** [introduz o tema cultura regional]
**Iraí:** [comenta sobre tradições amazônicas]
**Tainá:** [fala sobre sabedoria ancestral/floresta]

DIRETRIZES:
- Valorizar cultura amazônica
- Mencionar sabedoria ancestral
- Tom respeitoso e orgulhoso
- Máximo 30 palavras por fala
- Conexão com a natureza e tradições`;

        const resposta = await this.ia.gerarTexto(prompt, 120);
        return this.processarFalasGeradas(resposta);
    }

    async gerarEncerramento() {
        const prompt = `APRESENTADORES do BubuiA News:
- Tainá: Parintinense, carinhosa com o público ("meu povo")
- Iraí: Manauara, agradece a audiência

TAREFA: Criar encerramento natural e acolhedor.

FORMATO:
**Tainá:** [despedida carinhosa para o público]
**Iraí:** [agradece e convida interação]
**Tainá:** [fala final sobre redes sociais]

DIRETRIZES:
- Tom acolhedor e próximo
- Convidar para interagir
- Mencionar redes sociais
- Máximo 25 palavras por fala
- Despedida calorosa amazônica`;

        const resposta = await this.ia.gerarTexto(prompt, 100);
        return this.processarFalasGeradas(resposta);
    }

    processarFalasGeradas(texto) {
        const falas = [];
        const linhas = texto.split('\n').filter(linha => linha.trim());
        
        for (const linha of linhas) {
            const match = linha.match(/\*\*(Tainá|Iraí):\*\*\s*(.+)/);
            if (match) {
                falas.push({
                    personagem: match[1].toLowerCase() === 'tainá' ? 'taina' : 'irai',
                    texto: match[2].trim().replace(/["""]/g, ''), // Limpar aspas
                    bloco: 'gerado_ia'
                });
            }
        }
        
        return falas;
    }

    montarRoteiroFinal(blocos) {
        console.log('📝 Montando roteiro final com IA...');
        
        let roteiro = `# 🎙️ BUBUIA NEWS - ROTEIRO GERADO POR IA

**Data:** ${this.contextoEpisodio.data}
**Episódio:** #${this.contextoEpisodio.episodio}
**Apresentadores:** Tainá Oliveira & Iraí Santos
**Gerado por:** GPT-4 + Sistema Contextual

---

`;

        // Adicionar cada bloco
        for (const [nomeBloco, falas] of Object.entries(blocos)) {
            if (falas && falas.length > 0) {
                roteiro += this.formatarBlocoRoteiro(nomeBloco, falas);
            }
        }

        return roteiro;
    }

    formatarBlocoRoteiro(nomeBloco, falas) {
        const titulos = {
            introducao: '🎵 INTRODUÇÃO',
            cardapio: '📋 CARDÁPIO DO DIA',
            manchetes: '📰 MANCHETE PRINCIPAL', 
            esportes: '🏆 ESPORTES + PARINTINS',
            cultura: '🎭 CULTURA AMAZÔNICA',
            encerramento: '👋 ENCERRAMENTO'
        };

        let bloco = `## ${titulos[nomeBloco] || nomeBloco.toUpperCase()}\n\n`;
        
        falas.forEach((fala, index) => {
            const nome = fala.personagem === 'taina' ? 'Tainá' : 'Iraí';
            bloco += `**${nome}:** ${fala.texto}\n\n`;
        });

        bloco += '---\n\n';
        return bloco;
    }

    gerarRoteiroFallback(noticias) {
        console.log('🔄 Gerando roteiro com sistema fallback...');
        
        return `# 🎙️ BUBUIA NEWS - ROTEIRO FALLBACK

**Data:** ${this.contextoEpisodio.data}
**Episódio:** #${this.contextoEpisodio.episodio}
**Modo:** Fallback (IA indisponível)

---

## 🎵 INTRODUÇÃO

**Tainá:** Fala, meu povo! Tá começando mais um BubuiA News!

**Iraí:** ...o podcast que te traz a notícia de dentro da rede!

**Tainá:** Bora ver o que rolou por aqui hoje!

---

## 📋 CARDÁPIO DO DIA

**Tainá:** Eita, pessoal! O cardápio de hoje tá recheadinho!

**Iraí:** Vamos ver as principais notícias que selecionamos para vocês.

---

## 📰 MANCHETES

**Tainá:** ${noticias[0]?.titulo || 'Notícia principal do dia'}

**Iraí:** Interessante essa, né Tainá?

---

## 🏆 ESPORTES

**Iraí:** E no esporte, galera...

**Tainá:** Garantido no coração sempre, né meu povo!

**Iraí:** Os dois bois são patrimônio nosso!

---

## 🎭 CULTURA

**Tainá:** A cultura amazônica é nossa riqueza!

**Iraí:** Tradições que vêm de gerações, né?

---

## 👋 ENCERRAMENTO

**Tainá:** Valeu, meu povo! Até o próximo episódio!

**Iraí:** Comentem aí nas redes sociais!

---

_Roteiro gerado em modo fallback_
`;
    }
}

module.exports = { GeradorFalasIA };