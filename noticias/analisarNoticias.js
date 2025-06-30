// noticias/analisarNoticias.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import 'dotenv/config';

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CAMINHOS CORRIGIDOS para refletir a pasta /data na raiz do projeto
const INPUT_FILE = path.join(__dirname, '..', 'data', 'noticias-recentes.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'episodio-do-dia.json');

const KEYWORDS_RELEVANCIA = [
  // Cultura Pop & Geek (Peso Alto)
  "cinema", "série", "game", "e-sports", "anime", "geek", "nerd", "estreia", "lançamento", "cosplay", "evento geek",
  
  // Tecnologia & Inovação (Peso Alto)
  "tecnologia", "startup", "aplicativo", "inovação", "inteligência artificial",

  // Rolê Cultural & Bizarrices (Peso Médio)
  "festival", "show", "exposição", "gratuito", "parintins", "lenda", "bizarro", "mistério", "inusitado", "gastronomia",
  
  // Impacto Direto e Serviços (Peso Alto para Relevância)
  "manaus", "amazonas", "concurso", "transporte público", "tarifa", "saúde", "educação", "semed", "semsa", "água", "energia",
  
  // Nomes de Grande Relevância
  "Wilson Lima", "David Almeida",

  // Eventos Naturais de Grande Impacto
  "cheia", "seca", "br-319", "queimadas"
];

const SOURCE_WEIGHTS = { 
  'G1 Amazonas': 10,       
  'A Crítica': 8,          
  'D24AM': 7,              
  'Portal do Holanda': 9   
};


const CLASSIFICATION_GUIDE_MAP = {
    "⚫️ 1": "Segurança & BOs de Impacto",
    "🟡 2": "Política de Baré",
    "🔴 3": "Perrengues da Cidade",
    "🚀 4": "Tecnologia & Inovação do Igarapé",
    "🎬 5": "Cultura Pop & Geek de Rede",
    "🎭 6": "Rolê Cultural",
    "👽 7": "Bizarrices da Bubuia"
};
const CLASSIFICATION_GUIDE_TEXT = Object.entries(CLASSIFICATION_GUIDE_MAP)
    .map(([key, value]) => `* **${key}**: ${value}`).join('\n');

// --- Funções Principais ---

async function chamarIAparaClassificar(article) {
  console.log(`  -> Classificando com OpenAI: "${article.title.substring(0, 40)}..."`);
  try {
    const prompt = `
      Você é o editor-chefe do podcast "Bubuia News" de Manaus. Sua tarefa é analisar e classificar uma notícia com um rigoroso controle de qualidade.

      ### Guia de Curadoria Editorial (REGRAS DE EXCLUSÃO)
      - **REGRA 1: SEM CONTEÚDO VISUAL.** Se o título ou resumo contiver expressões como "veja fotos", "assista ao vídeo", "galeria de imagens", ou a palavra "VÍDEO" (em maiúsculas ou minúsculas), o conteúdo é INADEQUADO.
      - **REGRA 2: SEM AUTOPROMOÇÃO.** Se o conteúdo for sobre o próprio telejornal (ex: "Jornal do Amazonas de hoje"), é INADEQUADO.
      - **REGRA 3: SEM CONTEÚDO SENSÍVEL/POLÊMICO.** Evite tópicos que não se alinhem com o tom leve e familiar do programa (violência gráfica, discurso de ódio, conteúdo sexual explícito ou polêmicas muito densas). Se a notícia for inadequada para um ambiente familiar, é INADEQUADA.

      ### TAREFA
      Analise o artigo abaixo e retorne um objeto JSON com DUAS chaves:
      1.  \`classification_id\`: A string do ID da categoria do guia que melhor se encaixa (ex: "🚀 4").
      2.  \`is_adequate\`: Um booleano ('true' se for adequado para áudio e não violar NENHUMA regra, 'false' caso contrário).

      #### Guia de Classificação de Conteúdo
      ${CLASSIFICATION_GUIDE_TEXT}

      #### Artigo para Análise
      - Título: ${article.title}
      - Resumo: ${article.summary}

      Responda APENAS com o objeto JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });
    
    const parsedResponse = JSON.parse(response.choices[0].message.content);
    if (!parsedResponse.classification_id || !CLASSIFICATION_GUIDE_MAP[parsedResponse.classification_id]) {
        console.warn(`  [AVISO] IA retornou ID inválido: ${parsedResponse.classification_id}. Usando padrão.`);
        return { id: "🔴 3", description: CLASSIFICATION_GUIDE_MAP["� 3"], adequada_para_audio: true };
    }
    return {
        id: parsedResponse.classification_id,
        description: CLASSIFICATION_GUIDE_MAP[parsedResponse.classification_id],
        adequada_para_audio: parsedResponse.is_adequate !== false
    };
  } catch (error) {
    console.error(`❌ Erro ao chamar a API da OpenAI: ${error.message}`);
    return { id: "🔴 3", description: "Perrengues da Cidade", adequada_para_audio: true };
  }
}

function calcularRelevanceScore(article, classification) {
    let score = 0;
    if (!classification || classification.adequada_para_audio === false) return -100;
    const title = article.title.toLowerCase();
    score += SOURCE_WEIGHTS[article.source] || 3;
    for (const keyword of KEYWORDS_RELEVANCIA) {
        if (title.includes(keyword)) score += 5;
    }
    
    // LÓGICA DE SCORE REBALANCEADA
    const classificationId = (classification.id && typeof classification.id === 'string') ? classification.id.split(' ')[0] : '';
    if (['⚫️', '🟡', '🔴'].includes(classificationId)) score += 9;  // Hard News com peso maior
    if (['🚀', '🎬'].includes(classificationId)) score += 12;      // Tecnologia e Cultura Pop continuam com prioridade alta
    if (['🎭'].includes(classificationId)) score += 8;            // Rolê Cultural com peso um pouco menor
    if (['👽'].includes(classificationId)) score += 14;           // Bizarrices continuam com peso alto para o Cold Open
    
    return score;
}

function agruparNoticias(noticias) {
    console.log('\n[LOG] Fase de agrupamento iniciada...');
    const grupos = {};
    for (const noticia of noticias) {
        const categoria = noticia.classification.id;
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(noticia);
    }

    const superNoticias = [];
    const processados = new Set();
    for (const categoria in grupos) {
        const grupoCategoria = grupos[categoria];
        while (grupoCategoria.length > 0) {
            const noticiaBase = grupoCategoria.shift();
            if (processados.has(noticiaBase.link)) continue;

            const grupoSimilar = [noticiaBase];
            const palavrasBase = new Set(noticiaBase.title.toLowerCase().split(' ').filter(p => p.length > 3));
            for (let i = grupoCategoria.length - 1; i >= 0; i--) {
                const noticiaComparar = grupoCategoria[i];
                const palavrasComparar = new Set(noticiaComparar.title.toLowerCase().split(' '));
                const intersecao = new Set([...palavrasBase].filter(p => palavrasComparar.has(p)));
                if ((intersecao.size / palavrasBase.size) > 0.4) {
                    grupoSimilar.push(noticiaComparar);
                    grupoCategoria.splice(i, 1);
                }
            }
            
            grupoSimilar.sort((a, b) => b.relevanceScore - a.relevanceScore);
            const noticiaPrincipal = grupoSimilar[0];
            processados.add(noticiaPrincipal.link);
            superNoticias.push({
                isSuperNoticia: grupoSimilar.length > 1,
                titulo_principal: noticiaPrincipal.title,
                classification: noticiaPrincipal.classification,
                relevanceScore: noticiaPrincipal.relevanceScore,
                fontes: grupoSimilar.map(n => ({
                    link: n.link, source: n.source,
                    resumo: n.summary, titulo_original: n.title,
                })),
            });
        }
    }
    console.log(`[LOG] Agrupamento finalizado. ${superNoticias.length} eventos únicos identificados.`);
    if(superNoticias.some(n => n.isSuperNoticia)) {
        console.log('[LOG] Pelo menos uma "Super-Notícia" foi criada a partir de múltiplas fontes.');
    }
    return superNoticias;
}


async function analisarEselecionarNoticias() {
    console.log('🧠 Bubuia News - Iniciando análise e curadoria...');
    let todasAsNoticias;
    try {
        const fileContent = await fs.readFile(INPUT_FILE, 'utf-8');
        todasAsNoticias = JSON.parse(fileContent);
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de notícias: ${INPUT_FILE}. Execute o 'buscarNoticias.js' primeiro.`);
        return;
    }

    console.log(`\n[LOG] ${todasAsNoticias.length} artigos brutos encontrados. Iniciando classificação com a nova pauta...`);
    let noticiasAnalisadas = [];
    for (const article of todasAsNoticias) {
        const classification = await chamarIAparaClassificar(article);
        const relevanceScore = calcularRelevanceScore(article, classification);
        if (relevanceScore > -100) {
            noticiasAnalisadas.push({ ...article, relevanceScore, classification });
        }
        await new Promise(resolve => setTimeout(resolve, 200)); 
    }
    console.log(`[LOG] ${noticiasAnalisadas.length} notícias foram consideradas adequadas após a classificação da IA.`);

    const pautaAgrupada = agruparNoticias(noticiasAnalisadas);
    pautaAgrupada.sort((a, b) => b.relevanceScore - a.relevanceScore);

    let coldOpenNoticia = null;
    const candidatosColdOpen = pautaAgrupada.filter(n => {
        const id = n.classification.id.split(' ')[0];
        return ['👽'].includes(id);
    });
    console.log(`\n[LOG] Fase de seleção iniciada. Encontrados ${candidatosColdOpen.length} candidatos para o Cold Open.`);

    let pautaRestante = pautaAgrupada;
    if (candidatosColdOpen.length > 0) {
        coldOpenNoticia = candidatosColdOpen[0];
        console.log(`[LOG] Cold Open selecionado: "${coldOpenNoticia.titulo_principal}"`);
        pautaRestante = pautaAgrupada.filter(n => n.titulo_principal !== coldOpenNoticia.titulo_principal);
        console.log(`[LOG] ${pautaRestante.length} notícias restantes para o bloco principal.`);
    }

    const noticiasPrincipais = [];
    const categoriasUsadas = new Set();
    for (const noticia of pautaRestante) {
        if (noticiasPrincipais.length >= 4) break;
        if (!categoriasUsadas.has(noticia.classification.id)) {
            noticiasPrincipais.push(noticia);
            categoriasUsadas.add(noticia.classification.id);
        }
    }
    
    if (noticiasPrincipais.length < 4) {
        for (const noticia of pautaRestante) {
            if (noticiasPrincipais.length >= 4) break;
            if (!noticiasPrincipais.some(n => n.titulo_principal === noticia.titulo_principal)) {
                noticiasPrincipais.push(noticia);
            }
        }
    }

    console.log(`[LOG] Selecionadas ${noticiasPrincipais.length} notícias para o bloco principal.`);

    const pautaJSON = {
        coldOpen: coldOpenNoticia,
        noticiasPrincipais: noticiasPrincipais.slice(0, 4), 
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(pautaJSON, null, 2));

    console.log('\n✅ Curadoria finalizada!');
    if (pautaJSON.coldOpen) {
        console.log(`  -> 💥 Cold Open: [${pautaJSON.coldOpen.classification.id}] ${pautaJSON.coldOpen.titulo_principal}`);
    } else {
        console.log('  -> 💥 Cold Open: Nenhuma notícia adequada encontrada.');
    }
  
    console.log('\n  📰 Notícias Principais:');
    pautaJSON.noticiasPrincipais.forEach((n, index) => {
        console.log(`    ${index + 1}. [${n.classification.id}] ${n.titulo_principal} (Score: ${n.relevanceScore})`);
    });
    console.log(`\nArquivo de pauta salvo em: ${OUTPUT_FILE}`);
}

analisarEselecionarNoticias();
