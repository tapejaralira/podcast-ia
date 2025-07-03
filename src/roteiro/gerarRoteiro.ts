// src/roteiro/gerarRoteiro.ts
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

import { config } from '../config.js';
import {
  PautaDoDia,
  SugestaoAbertura,
  Personagens,
  ConfigRoteiro,
  NoticiaClassificada,
  FonteNoticia,
  SugestaoNoticia,
  Efemerie,
  Apresentadores,
  Audiencia,
} from '../types.js';

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const geminiModel = genAI.getGenerativeModel({ model: config.models.roteiro });

// --- Constantes de Roteiro (movidas de config.ts para cá por serem específicas deste script) ---
const TTS_NORMALIZATION_PROMPT = `
### REGRAS DE FORMATAÇÃO PARA ÁUDIO (OBRIGATÓRIO)
- **Normalização para TTS:** Converta o texto de saída para um formato adequado para text-to-speech. Garanta que números, símbolos e abreviações sejam expandidos para maior clareza quando lidos em voz alta. Expanda todas as abreviações para suas formas faladas completas.
- **Ritmo e Ênfase:** Em vez de usar tags SSML, controle o ritmo e a ênfase usando pontuação. Use reticências (...) para pausas dramáticas ou hesitação. Use LETRAS MAIÚSCULAS para dar ÊNFASE a palavras ou frases importantes.

- **Exemplos de Normalização:**
  - "R$ 42,50" → "quarenta e dois reais e cinquenta centavos"
  - "2º" → "segundo"
  - "Dr." → "Doutor"
  - "Av." → "Avenida"
  - "100km" → "cem quilômetros"
  - "100%" → "cem por cento"
  - "01/01/2024" → "primeiro de janeiro de dois mil e vinte e quatro"
  - "14:30" → "duas e trinta da tarde"
`;

const TRILHA_MAP: { [key: string]: string } = {
    "⚫️": "trilha_tensao_leve.mp3",
    "🟡": "trilha_informativa_neutra.mp3",
    "🔴": "trilha_reflexiva.mp3",
    "🚀": "trilha_tecnologica_upbeat.mp3",
    "🎬": "trilha_divertida_pop.mp3",
    "🎭": "trilha_cultural_regional.mp3",
    "👽": "trilha_misteriosa_humor.mp3"
};

const INSPIRACAO_INICIO_CENA: string[] = [
    "Início com Exclamação/Surpresa: Um apresentador chama a atenção do outro de forma energética sobre a notícia.",
    "Início com Curiosidade/Mistério: Um apresentador introduz o tema com uma pergunta ou de forma enigmática para despertar o interesse.",
    "Início com Reação à Manchete: Um apresentador lê a manchete e o outro reage imediatamente, seja com espanto, humor ou ceticismo.",
    "Início 'Fofoca'/Rede Social: A notícia é introduzida como algo que está 'bombando' ou 'bubuiando' nas redes.",
    "Início com Pergunta Retórica: Um apresentador faz uma pergunta ao outro que conecta com o cerne da notícia para iniciar a discussão.",
    "Início 'Hot Take': Um apresentador pede a opinião direta e sem filtros do outro logo de cara.",
    "Início com Contraponto/Debate: Um apresentador se mostra cético ou pessimista e o outro tenta apresentar uma visão diferente.",
    "Início com Interação do Ouvinte: A discussão começa a partir de uma suposta mensagem ou pergunta de um ouvinte."
];


// --- Tipos Específicos para Geração de Diálogo ---
type DialogoType = 
  | 'cold_open' 
  | 'fallback_cold_open' 
  | 'cardapio' 
  | 'saudacao_taina' 
  | 'despedida_taina' 
  | 'noticia_principal' 
  | 'super_noticia_principal';

interface GerarDialogoParams {
    tipo: DialogoType;
    noticia?: NoticiaClassificada | SugestaoNoticia | { titulos: string[] };
    personagens?: Apresentadores;
    audiencia?: Audiencia;
    direcao_cena?: string;
    data_fallback?: Efemerie;
}


// --- Funções Principais ---

async function fetchFullText(url: string): Promise<string | null> {
    try {
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
        const $ = cheerio.load(html);
        let articleBody = '';
        
        // Seletor específico para A Crítica
        const acriticaBody = $('div.ceRPNp'); 
        if (acriticaBody.length > 0) {
            acriticaBody.find('p[class*="styled__Paragraph"]').each((i, el) => {
                articleBody += $(el).text() + ' ';
            });
        }

        // Seletores genéricos de fallback
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

async function gerarDialogo(promptData: GerarDialogoParams): Promise<string> {
    const { tipo, noticia, personagens, direcao_cena, data_fallback, audiencia } = promptData;
    let prompt: string;

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
            const n = noticia as SugestaoNoticia;
            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo de 15 a 20 segundos para o "Cold Open". Tainá deve contar para Iraí, como se fosse um segredo, a seguinte notícia:
- Título: ${n.titulo_principal}
- Resumo Combinado: ${n.fontes.map((f: FonteNoticia) => f.resumo).join(' ')}

${TTS_NORMALIZATION_PROMPT}

Responda APENAS com o diálogo.`;
            break;
        case 'fallback_cold_open':
            const df = data_fallback as Efemerie;
            if (df.titulo.includes("Mensagem") || df.titulo.includes("Curiosidade")) {
                prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo de 15 a 20 segundos para o "Cold Open".
A ideia é que Tainá leia uma mensagem carinhosa de um ouvinte (ou uma curiosidade aleatória) para Iraí, e ele reage de forma calorosa e autêntica.

- Conteúdo a ser lido por Tainá: "${df.texto}"

${TTS_NORMALIZATION_PROMPT}

Exemplo de início: "Tainá: Mano, se liga só nessa mensagem que chegou pra gente..."
Responda APENAS com o diálogo.`;
            } else {
                prompt = `Você é um roteirista criativo para o podcast "Bubuia News". Sua missão é criar um diálogo de 15 a 20 segundos para o "Cold Open" entre Tainá e Iraí.

**Contexto:**
A conversa deve girar em torno do seguinte fato histórico ou data comemorativa. A interação precisa ser natural, onde um apresentador compartilha a informação e o outro reage com curiosidade ou de forma positiva.

- **Título do Fato:** ${df.titulo}
- **Descrição:** "${df.texto}"

**Inspiração para o Início (Use como base, não precisa ser idêntico):**
- "Iraí: Mana... se liga nessa..."
- "Tainá: Rapaz... Olha isso... Hoje..."

${TTS_NORMALIZATION_PROMPT}

**Instrução Final:** Responda APENAS com o diálogo entre Tainá e Iraí.`;
            }
            break;
        case 'cardapio':
             const cardapio = noticia as { titulos: string[] };
             prompt = `Você é o roteirista Iraí do podcast "Bubuia News". Com base nos títulos a seguir, crie uma chamada carismática e regional para o que vem por aí no programa, no estilo 'E hoje no Bubuia, a gente vai de...'
- Títulos: ${cardapio.titulos.join('; ')}

${TTS_NORMALIZATION_PROMPT}

Responda APENAS com a fala do Iraí.`;
            break;
        case 'saudacao_taina':
        case 'despedida_taina':
            const acao = tipo === 'saudacao_taina' ? 'uma saudação de abertura curta e energética' : 'uma despedida curta, animada e convidativa';
            prompt = `Você é a roteirista da Tainá para o podcast "Bubuia News". Crie ${acao}.
${infoAudiencia}
Instrução: Ela deve se dirigir diretamente à audiência usando uma das formas de chamar.

${TTS_NORMALIZATION_PROMPT}

Responda APENAS com a fala da Tainá.`;
            break;
        case 'noticia_principal':
        case 'super_noticia_principal':
            const np = noticia as NoticiaClassificada;
            let tom_cena = "de forma neutra e informativa.";
            if (np && np.classification) {
                const id = np.classification.id.split(' ')[0];
                if (['🚀', '🎬', '🎭', '👽'].includes(id)) tom_cena = "de forma animada e divertida.";
                if (['🔴', '⚫️'].includes(id)) tom_cena = "com um tom de seriedade e preocupação.";
            }
            const dialogoLength = tipo === 'super_noticia_principal' ? 'APROFUNDADO (6 a 8 falas)' : 'natural e conciso (4 a 6 falas)';

            prompt = `Você é um roteirista do podcast "Bubuia News". Crie um diálogo ${dialogoLength} entre Tainá e Iraí sobre a notícia abaixo.

### INSTRUÇÕES DE DIREÇÃO
- **Perfis dos Personagens:**
${infoTaina}
${infoIrai}
- **Perfil da Audiência:** ${infoAudiencia}
- **Tom da Cena:** Discutam a notícia ${tom_cena}
- **Conteúdo da Notícia:** ${np.texto_completo}
- **Inspiração para o Início:** Use a seguinte ideia como inspiração para começar o diálogo, mas sinta-se livre para variar: "${direcao_cena}". O importante é capturar a essência da sugestão.

${TTS_NORMALIZATION_PROMPT}

### REGRAS DE INTERAÇÃO (OBRIGATÓRIO)
- É essencial que eles usem os apelidos um do outro e que, em algum momento, um deles se dirija diretamente à audiência.

Responda APENAS com o diálogo.`;
            break;
        default:
            return Promise.resolve("// Placeholder para tipo de diálogo desconhecido");
    }

    try {
        if (config.apiProvider === 'gemini') {
            console.log(`  -> Gerando diálogo com Gemini...`);
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } else { // Padrão é OpenAI
            console.log(`  -> Gerando diálogo com OpenAI...`);
            const response = await openai.chat.completions.create({
                model: "gpt-4o", messages: [{ role: "user", content: prompt }], temperature: 0.85,
            });
            return response.choices[0].message.content || `// Erro: OpenAI não retornou conteúdo para ${tipo}.`;
        }
    } catch (error: any) {
        console.error(`❌ Erro ao gerar diálogo para '${tipo}' usando ${config.apiProvider}: ${error.message}`);
        return `// Erro ao gerar diálogo para ${tipo}.`;
    }
}

export async function gerarRoteiro() {
    console.log('📜 Bubuia News - Iniciando geração do roteiro final...');
    
    const pautaFile = path.join(config.paths.data, 'episodio-do-dia.json');
    const sugestoesFile = path.join(config.paths.data, 'sugestoes-abertura.json');
    const configFile = path.join(config.paths.src, 'roteiro', 'config-roteiro.json');
    const personagensFile = path.join(config.paths.data, 'personagens.json');
    const templateFile = path.join(config.paths.src, 'roteiro', 'roteiro-template.md');

    const [pauta, sugestoes, configRoteiro, personagensData, template] = await Promise.all([
        fs.readFile(pautaFile, 'utf-8').then(JSON.parse) as Promise<PautaDoDia>,
        fs.readFile(sugestoesFile, 'utf-8').then(JSON.parse) as Promise<SugestaoAbertura>,
        fs.readFile(configFile, 'utf-8').then(JSON.parse) as Promise<ConfigRoteiro>,
        fs.readFile(personagensFile, 'utf-8').then(JSON.parse) as Promise<Personagens>,
        fs.readFile(templateFile, 'utf-8'),
    ]).catch(err => {
        console.error("🔥 Erro ao carregar um dos arquivos de entrada. Verifique se os scripts de análise e sugestão foram executados.", err);
        process.exit(1);
    });
    
    const personagens: Apresentadores = { taina: personagensData.apresentadores[0], irai: personagensData.apresentadores[1] };
    const audiencia = personagensData.audiencia;
    let roteiroFinal = template;
    const dataAtualString = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    roteiroFinal = roteiroFinal.replace('{{DATA_ATUAL}}', dataAtualString);
    roteiroFinal = roteiroFinal.replace('{{TRILHA_ABERTURA}}', 'trilha_cultural_regional.mp3'); 

    
    // Lógica de decisão para o Cold Open
    let coldOpenDialogo = "";
    console.log(`[LOG] Prioridade de Cold Open definida como: "${configRoteiro.prioridade_cold_open}"`);

    if (configRoteiro.prioridade_cold_open === 'efemeride') {
        if (sugestoes.efemeride && sugestoes.efemeride.texto) {
            console.log('[LOG] Usando a Efeméride Regional (prioridade do editor).');
            coldOpenDialogo = await gerarDialogo({ tipo: 'fallback_cold_open', data_fallback: sugestoes.efemeride, personagens });
        } else {
            console.log('[LOG] Prioridade era Efeméride, mas não foi encontrada. Usando notícia como fallback.');
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
    roteiroFinal = roteiroFinal.replace('{{SAUDACAO_IRAI}}', `É isso aí, Tai. Um bom dia pra esse povo trabalhador.`);
    roteiroFinal = roteiroFinal.replace('{{DESPEDIDA_IRAI}}', `É isso, meu povo. Por hoje é isso.`);

    const titulosPrincipais = pauta.noticiasPrincipais.map((n: NoticiaClassificada) => n.titulo_principal);
    if(titulosPrincipais.length > 0) {
        const cardapioDialogo = await gerarDialogo({ tipo: 'cardapio', noticia: { titulos: titulosPrincipais } });
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', cardapioDialogo);
    } else {
        roteiroFinal = roteiroFinal.replace('{{CARDAPIO_NOTICIAS}}', 'Iraí: Eita, maninha, parece que hoje a rede veio vazia!');
    }

    let cenasDisponiveis = [...INSPIRACAO_INICIO_CENA];

    for (let i = 0; i < 4; i++) {
        const noticia = pauta.noticiasPrincipais[i];
        let dialogo = "// Sem notícia para este bloco.";
        let titulo = "Intervalo";
        let trilha = "trilha_neutra.mp3";

        if (noticia) {
            titulo = `[${noticia.classification.id}] ${noticia.titulo_principal}`;
            console.log(`
Buscando texto completo para: "${noticia.titulo_principal}"`);
            const textosCompletos = await Promise.all(noticia.fontes.map((f: FonteNoticia) => fetchFullText(f.link)));
            noticia.texto_completo = textosCompletos.filter((t): t is string => t !== null).join('\n\n---\n\n');
            
            if (noticia.texto_completo) {
                if (cenasDisponiveis.length === 0) cenasDisponiveis = [...INSPIRACAO_INICIO_CENA];
                const cenaIndex = Math.floor(Math.random() * cenasDisponiveis.length);
                const direcao_cena = cenasDisponiveis.splice(cenaIndex, 1)[0];
                const tipoDialogo = noticia.isSuperNoticia ? 'super_noticia_principal' : 'noticia_principal';
                console.log(`  -> Gerando diálogo (Tipo: ${tipoDialogo} | Inspiração: ${direcao_cena.split(':')[0]})`);
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
             // Evita sobrecarregar a API de IA
             await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const outputFilename = path.join(config.paths.episodios, `roteiro-${dataDeHoje}.md`);
    await fs.mkdir(config.paths.episodios, { recursive: true });
    await fs.writeFile(outputFilename, roteiroFinal);

    console.log(`
✅ Roteiro finalizado com sucesso! Salvo em: ${outputFilename}`);
}

gerarRoteiro();
