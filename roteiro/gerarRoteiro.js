// roteiro/gerarRoteiro.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import 'dotenv/config';

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAUTA_FILE = path.join(__dirname, '..', 'data', 'episodio-do-dia.json');
const PERSONAGENS_FILE = path.join(__dirname, '..', 'data', 'personagens.json');
const TEMPLATE_FILE = path.join(__dirname, 'roteiro-template.md');
const OUTPUT_DIR = path.join(__dirname, '..', 'episodios');

const TRILHA_MAP = {
    "⚫️": "trilha_tensao_leve.mp3",
    "🟡": "trilha_informativa_neutra.mp3",
    "🔴": "trilha_reflexiva.mp3",
    "🚀": "trilha_tecnologica_upbeat.mp3",
    "🎬": "trilha_divertida_pop.mp3",
    "🎭": "trilha_cultural_regional.mp3",
    "👽": "trilha_misteriosa_humor.mp3"
};

const CENAS_DE_DIALOGO = [
    "Comece com Tainá chamando a atenção de Iraí com uma expressão como 'Mano, tu viu essa?!' ou 'Iraí, se liga só nisso aqui...'",
    "Comece com Iraí introduzindo a notícia com uma de suas expressões, como 'Égua, cunhatã, espia só o que rolou...' ou 'Rapaz, essa aqui é da boa...'",
    "Comece com um dos apresentadores lendo a manchete em voz alta, como se estivesse surpreso, e o outro reage com espanto, como 'É sério isso?'",
    "Comece com Tainá dizendo que viu algo 'bubuiando' nas redes sociais e então introduzindo a notícia.",
    "Comece com Iraí fazendo uma pergunta retórica para Tainá que tenha a ver com o tema da notícia. (Ex: 'Tu já imaginou o que acontece quando...? Pois é, aconteceu.')",
    "Comece com Tainá pedindo a opinião imediata de Iraí sobre a manchete, no estilo 'hot take'.",
    "Comece com Iraí sendo cético sobre o impacto real da notícia ('Humm, já vi esse filme antes...') e Tainá tentando encontrar um lado positivo.",
    "Comece com um dos apresentadores dizendo que recebeu uma mensagem de um ouvinte (fictício) sobre o tema para iniciar o debate."
];


// --- Funções Principais ---

async function fetchFullText(url) {
    try {
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
        const $ = cheerio.load(html);
        let articleBody = '';
        const acriticaBody = $('div.ceRPNp'); 
        if (acriticaBody.length > 0) {
            acriticaBody.find('p[class*="styled__Paragraph"]').each((i, el) => {
                articleBody += $(el).text() + ' ';
            });
        }
        if (!articleBody) {
             articleBody = 
                $('div[itemprop="articleBody"]').text() || 
                $('div.post-content').text() || 
                $('div.editorianoticia').text() ||
                $('article').text();
        }
        return articleBody.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        console.error(`  [ERRO] Falha ao buscar texto completo de: ${url}`);
        return null;
    }
}

async function gerarDialogo(promptData) {
    const { tipo, noticia, personagens, direcao_cena } = promptData;
    let prompt;

    let tom_cena = "de forma neutra e informativa.";
    if (noticia && noticia.classification) {
        const id = noticia.classification.id.split(' ')[0];
        if (['🚀', '🎬', '🎭', '👽'].includes(id)) tom_cena = "de forma animada e divertida.";
        if (['🔴', '⚫️'].includes(id)) tom_cena = "com um tom de seriedade e preocupação.";
    }

    // **NOVA LÓGICA:** Monta as informações de personagem para o prompt
    const infoTaina = `- Tainá: ${personagens.taina.perfil_geral}. Gírias: ${personagens.taina.girias.join(', ')}. Apelidos para Iraí: ${personagens.taina.formas_de_chamar_o_outro.join(', ')}.`;
    const infoIrai = `- Iraí: ${personagens.irai.perfil_geral}. Gírias: ${personagens.irai.girias.join(', ')}. Apelidos para Tainá: ${personagens.irai.formas_de_chamar_o_outro.join(', ')}.`;

    switch (tipo) {
        case 'cold_open':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo de 15 a 20 segundos para o "Cold Open". Tainá deve contar para Iraí, como se fosse um segredo, a seguinte notícia:
- Título: ${noticia.titulo_principal}
- Resumo Combinado: ${noticia.fontes.map(f => f.resumo).join(' ')}
Use os perfis dos personagens para guiar a reação. Use a tag <break time="0.3s"/> para uma pequena pausa.
Responda APENAS com o diálogo.`;
            break;
        case 'noticia_principal':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo natural e conciso (4 a 6 falas) entre Tainá e Iraí sobre a notícia abaixo.

### INSTRUÇÕES DE DIREÇÃO
- **Perfis:**
${infoTaina}
${infoIrai}
- **Tom da Cena:** Discutam a notícia ${tom_cena}
- **Conteúdo da Notícia:** ${noticia.texto_completo}
- **Direção de Início:** ${direcao_cena}

### REGRAS TÉCNICAS (OBRIGATÓRIO)
- Use a tag <break time="0.5s"/> para criar pausas naturais.
- Use a tag <emphasis level="strong">PALAVRA</emphasis> para dar ênfase.
- Incentive o uso dos apelidos que eles usam um com o outro.

Responda APENAS com o diálogo.`;
            break;
        case 'super_noticia_principal':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo APROFUNDADO (6 a 8 falas) entre Tainá e Iraí sobre a notícia abaixo, que foi o evento mais comentado do dia.

### INSTRUÇÕES DE DIREÇÃO
- **Perfis:**
${infoTaina}
${infoIrai}
- **Tom da Cena:** Discutam a notícia ${tom_cena}
- **Conteúdo da Notícia (de várias fontes):** ${noticia.texto_completo}
- **Direção de Início:** ${direcao_cena}

### REGRAS TÉCNICAS (OBRIGATÓRIO)
- Use a tag <break time="0.5s"/> para criar pausas naturais.
- Use a tag <emphasis level="strong">PALAVRA</emphasis> para dar ênfase.
- Incentive o uso dos apelidos que eles usam um com o outro.
- Use a tag <prosody rate="slow">...</prosody> em uma fala do Iraí para um tom mais analítico.

Responda APENAS com o diálogo.`;
            break;
        case 'cardapio':
             prompt = `Você é o roteirista Iraí do podcast "Bubuia News". Com base nos títulos a seguir, crie uma chamada carismática e regional para o que vem por aí no programa, no estilo 'E hoje no Bubuia, a gente vai de...'
- Títulos: ${noticia.titulos.join('; ')}
Responda APENAS com a fala do Iraí.`;
            break;
        default:
            return "// Placeholder para: " + tipo;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.85,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error(`❌ Erro ao gerar diálogo para '${tipo}': ${error.message}`);
        return `// Erro ao gerar diálogo para ${tipo}.`;
    }
}

async function gerarRoteiro() {
    console.log('📜 Bubuia News - Iniciando geração do roteiro...');
    
    const [pauta, personagensData, template] = await Promise.all([
        fs.readFile(PAUTA_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(PERSONAGENS_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(TEMPLATE_FILE, 'utf-8'),
    ]);
    
    const personagens = { taina: personagensData.apresentadores[0], irai: personagensData.apresentadores[1] };
    let roteiroFinal = template;
    
    roteiroFinal = roteiroFinal.replace('{{DATA_ATUAL}}', new Date().toLocaleDateString('pt-BR'));
    
    let coldOpenDialogo = "// Nenhuma notícia de Cold Open encontrada.";
    if (pauta.coldOpen) {
        coldOpenDialogo = await gerarDialogo({ tipo: 'cold_open', noticia: pauta.coldOpen, personagens });
    } else {
        coldOpenDialogo = "Iraí: Tainá, tu sabia que... // Placeholder para Efeméride";
    }
    roteiroFinal = roteiroFinal.replace('{{COLD_OPEN_DIALOGO}}', coldOpenDialogo);
    
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_TAINA}}', `E aí, galera conectada no Bubuia News! Tainá na área!`);
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_IRAI}}', `Boto fé, Tainá. Um bom dia pra esse povo trabalhador.`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_IRAI}}', `É isso, meu povo. Por hoje é só o filé.`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_TAINA}}', `Valeu, galera! Não esquece de seguir a gente nas redes!`);

    const titulosPrincipais = pauta.noticiasPrincipais.map(n => n.titulo_principal);
    if(titulosPrincipais.length > 0) {
        const cardapioDialogo = await gerarDialogo({ tipo: 'cardapio', noticia: { titulos: titulosPrincipais } });
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', cardapioDialogo);
    } else {
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', 'Iraí: Eita, maninha, parece que hoje a rede veio vazia! Vamos ver o que tem de bom por aqui mesmo assim.');
    }

    let cenasDisponiveis = [...CENAS_DE_DIALOGO];

    for (let i = 0; i < 4; i++) {
        const noticia = pauta.noticiasPrincipais[i];
        let dialogo = "// Sem notícia para este bloco.";
        let titulo = "Intervalo";
        let trilha = "trilha_neutra.mp3";

        if (noticia) {
            titulo = noticia.titulo_principal;
            console.log(`\nBuscando texto completo para: "${titulo}"`);
            const textosCompletos = await Promise.all(noticia.fontes.map(f => fetchFullText(f.link)));
            noticia.texto_completo = textosCompletos.filter(t => t).join('\n\n---\n\n');
            
            if (noticia.texto_completo) {
                if (cenasDisponiveis.length === 0) cenasDisponiveis = [...CENAS_DE_DIALOGO];
                const cenaIndex = Math.floor(Math.random() * cenasDisponiveis.length);
                const direcao_cena = cenasDisponiveis.splice(cenaIndex, 1)[0];
                const tipoDialogo = noticia.isSuperNoticia ? 'super_noticia_principal' : 'noticia_principal';
                console.log(`  -> Gerando diálogo (Tipo: ${tipoDialogo} | Direção: ${direcao_cena})`);
                dialogo = await gerarDialogo({ tipo: tipoDialogo, noticia, personagens, direcao_cena });
            } else {
                dialogo = "// Não foi possível buscar o texto completo para esta notícia.";
            }

            const classificationEmoji = noticia.classification.id.split(' ')[0];
            trilha = TRILHA_MAP[classificationEmoji] || "trilha_neutra.mp3";
        }
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TITULO}}`, titulo);
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_DIALOGO}}`, dialogo);
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TRILHA}}`, trilha);

        if(i < 3) {
             await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const outputFilename = path.join(OUTPUT_DIR, `roteiro-${dataDeHoje}.md`);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilename, roteiroFinal);

    console.log(`\n✅ Roteiro finalizado com sucesso! Salvo em: ${outputFilename}`);
}

gerarRoteiro();
