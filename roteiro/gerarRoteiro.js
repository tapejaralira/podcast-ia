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

// CAMINHOS CORRIGIDOS PARA A NOVA ESTRUTURA
const PAUTA_FILE = path.join(__dirname, '..', 'data', 'episodio-do-dia.json');
const PERSONAGENS_FILE = path.join(__dirname, '..', 'data', 'personagens.json');
const TEMPLATE_FILE = path.join(__dirname, 'roteiro-template.md');
const OUTPUT_DIR = path.join(__dirname, '..', 'episodios');

// MAPA DE TRILHAS ATUALIZADO PARA A PAUTA 2.0
const TRILHA_MAP = {
    "⚫️": "trilha_tensao_leve.mp3",      // Segurança & BOs de Impacto
    "🟡": "trilha_informativa_neutra.mp3", // Política de Baré
    "🔴": "trilha_reflexiva.mp3",          // Perrengues da Cidade
    "🚀": "trilha_tecnologica_upbeat.mp3", // Tecnologia & Inovação
    "🎬": "trilha_divertida_pop.mp3",      // Cultura Pop & Geek
    "🎭": "trilha_cultural_regional.mp3",  // Rolê Cultural
    "👽": "trilha_misteriosa_humor.mp3"    // Bizarrices da Bubuia
};

// --- Funções Principais ---

async function fetchFullText(url) {
    try {
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
        const $ = cheerio.load(html);
        const articleBody = 
            $('div[itemprop="articleBody"]').text() || 
            $('div.post-content').text() || 
            $('div.editorianoticia').text() ||
            $('article').text();
        
        return articleBody.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        console.error(`  [ERRO] Falha ao buscar texto completo de: ${url}`);
        return null;
    }
}

async function gerarDialogo(promptData) {
    const { tipo, noticia, personagens } = promptData;
    let prompt;

    switch (tipo) {
        case 'cold_open':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo de 15 a 20 segundos para o "Cold Open". Tainá deve contar para Iraí, como se fosse um segredo, a seguinte notícia:
- Título: ${noticia.titulo_principal}
- Resumo Combinado: ${noticia.fontes.map(f => f.resumo).join(' ')}
Use os perfis dos personagens para guiar a reação: Tainá (jovem, curiosa), Iraí (cético, tradicional).
Responda APENAS com o diálogo. Comece com "Tainá:".`;
            break;
        case 'noticia_principal':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo natural entre Tainá e Iraí sobre a notícia abaixo.
- Perfis: Tainá (${personagens.taina.perfil_geral}), Iraí (${personagens.irai.perfil_geral}).
- Formas como Tainá chama Iraí: ${personagens.taina.formas_de_chamar_o_outro.join(', ')}.
- Formas como Iraí chama Tainá: ${personagens.irai.formas_de_chamar_o_outro.join(', ')}.
- Tom da Notícia: ${noticia.classification.description}
- Conteúdo Completo (combinado de várias fontes): ${noticia.texto_completo}
Instruções: Comece com um dos apresentadores introduzindo o assunto. O diálogo deve ter entre 4 a 6 falas. Adapte o tom e as reações à classificação da notícia e ao perfil de cada um. Incorpore SSML para pausas, como <break time="0.5s"/>.
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
                dialogo = await gerarDialogo({ tipo: 'noticia_principal', noticia, personagens });
            } else {
                dialogo = "// Não foi possível buscar o texto completo para esta notícia.";
            }

            const classificationEmoji = noticia.classification.id.split(' ')[0];
            trilha = TRILHA_MAP[classificationEmoji] || "trilha_neutra.mp3";
        }
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TITULO}}`, titulo);
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_DIALOGO}}`, dialogo);
        roteiroFinal = roteiroFinal.replace(`{{NOTICIA_${i + 1}_TRILHA}}`, trilha);
    }
    
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const outputFilename = path.join(OUTPUT_DIR, `roteiro-${dataDeHoje}.md`);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilename, roteiroFinal);

    console.log(`\n✅ Roteiro finalizado com sucesso! Salvo em: ${outputFilename}`);
}

gerarRoteiro();
