// noticias/gerarRoteiro.js
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

const PAUTA_FILE = path.join(__dirname, 'data', 'episodio-do-dia.json');
const PERSONAGENS_FILE = path.join(__dirname, 'data', 'personagens.json');
const GIRIAS_FILE = path.join(__dirname, 'data', 'girias.json');
const TEMPLATE_FILE = path.join(__dirname, 'roteiro-template.md');
const OUTPUT_DIR = path.join(__dirname, 'episodios');

const TRILHA_MAP = {
    "🟢": "trilha_alegre.mp3", "🔵": "trilha_curiosa.mp3", "🔴": "trilha_triste.mp3",
    "🟡": "trilha_politica.mp3", "⚫": "trilha_policia.mp3", "🟣": "trilha_cultural.mp3",
    "🟠": "trilha_servicos.mp3", "⚪": "trilha_neutra.mp3", "🟤": "trilha_fofoca.mp3"
};

// --- Funções Principais ---

async function fetchFullText(url) {
    try {
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
        const $ = cheerio.load(html);
        // Seletores genéricos que tentam pegar o corpo principal do artigo
        const articleBody = 
            $('div[itemprop="articleBody"]').text() || 
            $('div.post-content').text() || 
            $('div.entry-content').text() || 
            $('article').text();
        
        // Limpa e formata o texto
        return articleBody.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        console.error(`  [ERRO] Falha ao buscar texto completo de: ${url}`);
        return null;
    }
}

async function gerarDialogo(promptData) {
    const { tipo, noticia, personagens, girias, clima } = promptData;
    let prompt;

    // Monta o prompt com base no tipo de diálogo necessário
    switch (tipo) {
        case 'cold_open':
            prompt = `Crie um diálogo de 15 a 20 segundos entre Tainá e Iraí para o "Cold Open" do podcast "Bubuia News". Tainá deve contar para Iraí, como se fosse um segredo, a seguinte notícia:
- Título: ${noticia.titulo_principal}
- Resumo Combinado: ${noticia.fontes.map(f => f.resumo).join(' ')}
Use o perfil dos personagens para guiar a reação: Tainá (jovem, curiosa), Iraí (cético, tradicional).
Responda APENAS com o diálogo. Comece com "Tainá:".`;
            break;
        case 'noticia_principal':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo natural entre Tainá e Iraí sobre a notícia abaixo.
- Perfis: Tainá (${personagens.taina.perfil_geral}), Iraí (${personagens.irai.perfil_geral}).
- Gírias Tainá: ${girias.taina.join(', ')}. Gírias Iraí: ${girias.irai.join(', ')}.
- Tom da Notícia: ${noticia.classification.description}
- Conteúdo Completo (combinado de várias fontes): ${noticia.texto_completo}
Instruções: Comece com um dos apresentadores introduzindo o assunto. O diálogo deve ter entre 4 a 6 falas. Adapte o tom e as reações à classificação da notícia e ao perfil de cada um. Incorpore SSML para pausas, como <break time="0.5s"/>.
Responda APENAS com o diálogo.`;
            break;
        // ... outros casos como 'cardapio', 'saudacao', etc.
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
    
    const [pauta, personagensData, giriasData, template] = await Promise.all([
        fs.readFile(PAUTA_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(PERSONAGENS_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(GIRIAS_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(TEMPLATE_FILE, 'utf-8'),
    ]);
    
    const personagens = { taina: personagensData.apresentadores[0], irai: personagensData.apresentadores[1] };
    let roteiroFinal = template;
    
    // Geração do Cold Open
    let coldOpenDialogo = "// Nenhuma notícia de Cold Open encontrada.";
    if (pauta.coldOpen) {
        coldOpenDialogo = await gerarDialogo({ tipo: 'cold_open', noticia: pauta.coldOpen, personagens, girias });
    } else {
        // Implementar fallback aqui (Efeméride, etc.)
        coldOpenDialogo = "Iraí: Tainá, tu sabia que... // Placeholder para Efeméride";
    }
    roteiroFinal = roteiroFinal.replace('{{COLD_OPEN_DIALOGO}}', coldOpenDialogo);
    
    // ... (geração de outras partes do roteiro, como Cardápio)
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_TAINA}}', `E aí, galera conectada no Bubuia News! Tainá na área!`);
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_IRAI}}', `Boto fé, Tainá. Um bom dia pra esse povo trabalhador.`);
    roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', `// Placeholder Cardápio`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_IRAI}}', `É isso, meu povo. Por hoje é só o filé.`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_TAINA}}', `Valeu, galera! Não esquece de seguir a gente nas redes!`);
    
    // Geração dos diálogos das notícias principais
    for (let i = 0; i < 4; i++) {
        const noticia = pauta.noticiasPrincipais[i];
        let dialogo = "// Sem notícia para este bloco.";
        if (noticia) {
            console.log(`\nBuscando texto completo para: "${noticia.titulo_principal}"`);
            const textosCompletos = await Promise.all(noticia.fontes.map(f => fetchFullText(f.link)));
            noticia.texto_completo = textosCompletos.filter(t => t).join('\n\n---\n\n');
            
            if (noticia.texto_completo) {
                dialogo = await gerarDialogo({ tipo: 'noticia_principal', noticia, personagens, girias });
            } else {
                dialogo = "// Não foi possível buscar o texto completo para esta notícia.";
            }

            const classificationEmoji = noticia.classification.id.split(' ')[0];
            const trilha = TRILHA_MAP[classificationEmoji] || "trilha_neutra.mp3";
            roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TITULO}}`, noticia.titulo_principal);
            roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TRILHA}}`, trilha);
        }
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_DIALOGO}}`, dialogo);
    }
    
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const outputFilename = path.join(OUTPUT_DIR, `roteiro-${dataDeHoje}.md`);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilename, roteiroFinal);

    console.log(`\n✅ Roteiro finalizado com sucesso! Salvo em: ${outputFilename}`);
}

gerarRoteiro();
