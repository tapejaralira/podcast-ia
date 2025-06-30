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
const SUGESTOES_ABERTURA_FILE = path.join(__dirname, '..', 'data', 'sugestoes-abertura.json');
const CONFIG_ROTEIRO_FILE = path.join(__dirname, 'config-roteiro.json');
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
    "Comece com Iraí introduzindo a notícia com uma de suas expressões, como 'Égua, espia só o que rolou...' ou 'Rapaz, essa aqui é da boa...'",
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
    const { tipo, noticia, personagens, direcao_cena, data_fallback, audiencia } = promptData;
    let prompt;

    let infoTaina = '';
    let infoIrai = '';
    let infoAudiencia = '';

    if (personagens && audiencia) {
        infoTaina = `- Tainá: ${personagens.taina.perfil_geral}. Apelidos para Iraí: ${personagens.taina.formas_de_chamar_o_outro.join(', ')}.`;
        infoIrai = `- Iraí: ${personagens.irai.perfil_geral}. Apelidos para Tainá: ${personagens.irai.formas_de_chamar_o_outro.join(', ')}.`;
        infoAudiencia = `- Audiência: ${audiencia.perfil}. Formas de chamar os ouvintes: ${audiencia.formas_de_chamar.join(', ')}.`;
    } else if (audiencia) {
        infoAudiencia = `- Audiência: ${audiencia.perfil}. Formas de chamar os ouvintes: ${audiencia.formas_de_chamar.join(', ')}.`;
    } else if (personagens) {
        infoTaina = `- Tainá: ${personagens.taina.perfil_geral}.`;
        infoIrai = `- Iraí: ${personagens.irai.perfil_geral}.`;
    }
    
    switch (tipo) {
        case 'cold_open':
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo de 15 a 20 segundos para o "Cold Open". Tainá deve contar para Iraí, como se fosse um segredo, a seguinte notícia:
- Título: ${noticia.titulo_principal}
- Resumo Combinado: ${noticia.fontes.map(f => f.resumo).join(' ')}
Use os perfis dos personagens para guiar a reação. Use a tag <break time="0.3s"/> para uma pequena pausa.
Responda APENAS com o diálogo.`;
            break;
        case 'fallback_cold_open':
            prompt = `Você é um roteirista e pesquisador do podcast "Bubuia News". Hoje é ${data_fallback.titulo}.
Sua tarefa é encontrar UMA efeméride ou fato histórico curioso que aconteceu nesta data, com forte conexão com Manaus ou o estado do Amazonas.
Com base nesse fato, crie um diálogo de 15 a 20 segundos para o "Cold Open" do programa, onde Iraí surpreende Tainá com essa curiosidade.
- Fato: "${data_fallback.texto}"
Exemplo: "Iraí: Tai, tu sabia que no dia..."
Responda APENAS com o diálogo.`;
            break;
        case 'cardapio':
             prompt = `Você é o roteirista Iraí do podcast "Bubuia News". Com base nos títulos a seguir, crie uma chamada carismática e regional para o que vem por aí no programa, no estilo 'E hoje no Bubuia, a gente vai de...'
- Títulos: ${noticia.titulos.join('; ')}
Responda APENAS com a fala do Iraí.`;
            break;
        case 'saudacao_taina':
        case 'despedida_taina':
            const acao = tipo === 'saudacao_taina' ? 'uma saudação de abertura curta e energética' : 'uma despedida curta, animada e convidativa';
            prompt = `Você é a roteirista da Tainá para o podcast "Bubuia News". Crie ${acao}.
${infoAudiencia}
Instrução: Ela deve se dirigir diretamente à audiência usando uma das formas de chamar.
Responda APENAS com a fala da Tainá.`;
            break;
        case 'noticia_principal':
        case 'super_noticia_principal':
            let tom_cena = "de forma neutra e informativa.";
            if (noticia && noticia.classification) {
                const id = noticia.classification.id.split(' ')[0];
                if (['🚀', '🎬', '🎭', '👽'].includes(id)) tom_cena = "de forma animada e divertida.";
                if (['🔴', '⚫️'].includes(id)) tom_cena = "com um tom de seriedade e preocupação.";
            }
            const dialogoLength = tipo === 'super_noticia_principal' ? 'APROFUNDADO (6 a 8 falas)' : 'natural e conciso (4 a 6 falas)';
            const ssmlExtra = tipo === 'super_noticia_principal' ? '- Use a tag <prosody rate=\"slow\">...</prosody> em uma fala do Iraí para um tom mais analítico.' : '';

            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo ${dialogoLength} entre Tainá e Iraí sobre a notícia abaixo.

### INSTRUÇÕES DE DIREÇÃO
- **Perfis dos Personagens:**
${infoTaina}
${infoIrai}
- **Perfil da Audiência:** ${infoAudiencia}
- **Tom da Cena:** Discutam a notícia ${tom_cena}
- **Conteúdo da Notícia:** ${noticia.texto_completo}
- **Direção de Início:** ${direcao_cena}

### REGRAS TÉCNICAS (OBRIGATÓRIO)
- **Interação:** É essencial que eles usem os apelidos um do outro e que, em algum momento, um deles se dirija diretamente à audiência.
- **SSML:** Use a tag <break time="0.5s"/> para pausas e a tag <emphasis level="strong">PALAVRA</emphasis> para ênfase. ${ssmlExtra}

Responda APENAS com o diálogo.`;
            break;
        default:
            return "// Placeholder para: " + tipo;
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", messages: [{ role: "user", content: prompt }], temperature: 0.85,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error(`❌ Erro ao gerar diálogo para '${tipo}': ${error.message}`);
        return `// Erro ao gerar diálogo para ${tipo}.`;
    }
}

async function gerarRoteiro() {
    console.log('📜 Bubuia News - Iniciando geração do roteiro final...');
    
    // Carrega todos os arquivos necessários
    const [pauta, sugestoes, config, personagensData, template] = await Promise.all([
        fs.readFile(PAUTA_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(SUGESTOES_ABERTURA_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(CONFIG_ROTEIRO_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(PERSONAGENS_FILE, 'utf-8').then(JSON.parse),
        fs.readFile(TEMPLATE_FILE, 'utf-8'),
    ]).catch(err => {
        console.error("🔥 Erro ao carregar um dos arquivos de entrada. Verifique se os scripts 'analisar' e 'sugerir' foram executados.", err);
        process.exit(1);
    });
    
    const personagens = { taina: personagensData.apresentadores[0], irai: personagensData.apresentadores[1] };
    const audiencia = personagensData.audiencia;
    let roteiroFinal = template;
    const dataAtualString = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric'});
    
    roteiroFinal = roteiroFinal.replace('{{DATA_ATUAL}}', dataAtualString);
    
    // LÓGICA DE DECISÃO CORRIGIDA PARA O COLD OPEN
    let coldOpenDialogo = "";
    console.log(`[LOG] Prioridade de Cold Open definida como: "${config.prioridade_cold_open}"`);

    if (config.prioridade_cold_open === 'efemeride') {
        if (sugestoes.efemeride && sugestoes.efemeride.texto) {
            console.log('[LOG] Usando a Efeméride Regional (prioridade do editor).');
            coldOpenDialogo = await gerarDialogo({ tipo: 'fallback_cold_open', data_fallback: sugestoes.efemeride, personagens });
        } else {
            console.log('[LOG] Prioridade era Efeméride, mas não foi encontrada. Usando notícia como fallback, se existir.');
            coldOpenDialogo = sugestoes.noticia 
                ? await gerarDialogo({ tipo: 'cold_open', noticia: sugestoes.noticia, personagens, audiencia })
                : "// Nenhuma opção de Cold Open disponível.";
        }
    } else { // A prioridade é 'noticia'
        if (sugestoes.noticia) {
            console.log('[LOG] Usando a notícia sugerida para o Cold Open.');
            coldOpenDialogo = await gerarDialogo({ tipo: 'cold_open', noticia: sugestoes.noticia, personagens, audiencia });
        } else if (sugestoes.efemeride && sugestoes.efemeride.texto) {
            console.log('[LOG] Nenhuma notícia para Cold Open. Acionando fallback de Efeméride Regional...');
            coldOpenDialogo = await gerarDialogo({ tipo: 'fallback_cold_open', data_fallback: sugestoes.efemeride, personagens, audiencia });
        } else {
            coldOpenDialogo = "// Nenhuma opção de Cold Open disponível.";
        }
    }

    roteiroFinal = roteiroFinal.replace('{{COLD_OPEN_DIALOGO}}', coldOpenDialogo);
    
    const [saudacaoTaina, despedidaTaina] = await Promise.all([
        gerarDialogo({ tipo: 'saudacao_taina', audiencia, personagens }),
        gerarDialogo({ tipo: 'despedida_taina', audiencia, personagens })
    ]);
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_TAINA}}', saudacaoTaina);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_TAINA}}', despedidaTaina);
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_IRAI}}', `Boto fé, Tai. Um bom dia pra esse povo trabalhador.`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_IRAI}}', `É isso, meu povo. Por hoje é só o filé.`);

    const titulosPrincipais = pauta.noticiasPrincipais.map(n => n.titulo_principal);
    if(titulosPrincipais.length > 0) {
        const cardapioDialogo = await gerarDialogo({ tipo: 'cardapio', noticia: { titulos: titulosPrincipais } });
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', cardapioDialogo);
    } else {
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', 'Iraí: Eita, maninha, parece que hoje a rede veio vazia!');
    }

    let cenasDisponiveis = [...CENAS_DE_DIALOGO];

    for (let i = 0; i < 4; i++) {
        const noticia = pauta.noticiasPrincipais[i];
        let dialogo = "// Sem notícia para este bloco.";
        let titulo = "Intervalo";
        let trilha = "trilha_neutra.mp3";

        if (noticia) {
            // CORREÇÃO APLICADA: Inclui o ID da classificação no título
            titulo = `[${noticia.classification.id}] ${noticia.titulo_principal}`;
            console.log(`\nBuscando texto completo para: "${noticia.titulo_principal}"`);
            const textosCompletos = await Promise.all(noticia.fontes.map(f => fetchFullText(f.link)));
            noticia.texto_completo = textosCompletos.filter(t => t).join('\n\n---\n\n');
            
            if (noticia.texto_completo) {
                if (cenasDisponiveis.length === 0) cenasDisponiveis = [...CENAS_DE_DIALOGO];
                const cenaIndex = Math.floor(Math.random() * cenasDisponiveis.length);
                const direcao_cena = cenasDisponiveis.splice(cenaIndex, 1)[0];
                const tipoDialogo = noticia.isSuperNoticia ? 'super_noticia_principal' : 'noticia_principal';
                console.log(`  -> Gerando diálogo (Tipo: ${tipoDialogo} | Direção: ${direcao_cena})`);
                dialogo = await gerarDialogo({ tipo: tipoDialogo, noticia, personagens, audiencia, direcao_cena });
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
