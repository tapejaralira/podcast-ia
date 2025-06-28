// noticias/analisarNoticias.js - VERSÃO FINAL CORRIGIDA
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { toDate, format } from 'date-fns-tz';
import OpenAI from 'openai';
import 'dotenv/config'; // Carrega as variáveis do .env

// --- Configuração da IA ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Constantes e Configurações ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INPUT_FILE = path.join(__dirname, 'data', 'noticias-recentes.json');
const OUTPUT_FILE = path.join(__dirname, 'data', 'episodio-do-dia.json');
const TIMEZONE = 'America/Manaus';
const KEYWORDS_RELEVANCIA = ["manaus", "amazonas", "prefeitura", "governo", "polícia", "festival", "ponte rio negro", "zona franca", "Wilson Lima", "David Almeida", "cheia", "seca", "parintins", "br-319"];
const SOURCE_WEIGHTS = { 'G1 Amazonas': 10, 'A Crítica': 8, 'D24AM': 7 };

const CLASSIFICATION_GUIDE_MAP = {
    "🟢 1": "Notícia Alegre",
    "🔵 2": "Notícia Curiosa / Inusitada",
    "🔴 3": "Notícia Triste / Sensível",
    "🟡 4": "Notícia de Política",
    "⚫ 5": "Notícia de Segurança / Polícia",
    "🟣 6": "Notícia Cultural",
    "� 7": "Agenda / Serviços / Eventos",
    "⚪ 8": "Opinião / Comentário",
    "🟤 9": "Fofoca / Bastidores / “Off”"
};

const CLASSIFICATION_GUIDE_TEXT = Object.entries(CLASSIFICATION_GUIDE_MAP)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

// --- CHAMADA REAL À IA (COM PROMPT COMPLETO) ---
async function chamarIAparaClassificar(article) {
  console.log(`  -> Classificando com OpenAI: "${article.title.substring(0, 40)}..."`);
  try {
    const prompt = `
      Você é o **editor-chefe** do "Bubuia News", um podcast de notícias de ÁUDIO que cobre **Manaus e os principais acontecimentos do estado do Amazonas**, sempre com uma pegada **regional, humana e bem-humorada**. Seu público quer saber o que **impacta o dia a dia**, o que gera **conversa na beira do igarapé** e as histórias que só acontecem aqui. Evite o tom corporativo e formal.

      ---
      ### Guia de Curadoria Editorial (REGRAS)

      **Critérios de Interesse (o que torna uma notícia BOA):**
      - **Impacto Local:** Afeta diretamente a vida, o bolso ou a rotina do morador de Manaus.
      - **Relevância Estadual:** Notícias do interior do Amazonas são ótimas, DESDE QUE tenham um impacto claro ou gerem interesse para quem vive em Manaus (ex: o Festival de Parintins, grandes operações ambientais na BR-319, questões de infraestrutura que afetam a capital).
      - **Elemento Humano:** Histórias de pessoas, superação, conquistas ou problemas de um morador local.
      - **Curiosidade Amazônica:** Fatos inusitados sobre nossa fauna, flora e cultura.

      **Critérios de Exclusão (o que torna uma notícia RUIM):**
      - **Visual:** Se o título ou resumo contiver expressões como "veja fotos", "assista ao vídeo", "galeria de imagens", o conteúdo é INADEQUADO.
      - **Promocional:** Se o conteúdo for sobre o próprio telejornal (ex: "Jornal do Amazonas de hoje"), é INADEQUADO.
      - **Hiperlocal sem impacto:** Notícias de cidades pequenas que não têm relevância para o público de Manaus (ex: a troca de um secretário em um município distante).
      - **Não-Notícia:** Notas de falecimento simples, agenda interna de órgãos públicos.

      ---
      ### TAREFA

      Analise o artigo abaixo e retorne um objeto JSON com DUAS chaves:
      1.  \`classification_id\`: Uma string contendo APENAS o ID da categoria do guia (ex: "🟣 6").
      2.  \`is_adequate\`: Um booleano ('true' se for adequado para áudio e não violar as regras de exclusão, 'false' caso contrário).

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
    
    // VALIDAÇÃO DA RESPOSTA DA IA
    const parsedResponse = JSON.parse(response.choices[0].message.content);
    if (!parsedResponse.classification_id || !CLASSIFICATION_GUIDE_MAP[parsedResponse.classification_id]) {
        console.warn(`  [AVISO] IA retornou ID inválido: ${parsedResponse.classification_id}. Usando padrão.`);
        return { id: "⚪ 8", description: CLASSIFICATION_GUIDE_MAP["⚪ 8"], adequada_para_audio: true };
    }

    return {
        id: parsedResponse.classification_id,
        description: CLASSIFICATION_GUIDE_MAP[parsedResponse.classification_id],
        adequada_para_audio: parsedResponse.is_adequate !== false
    };

  } catch (error) {
    console.error(`❌ Erro ao chamar a API da OpenAI: ${error.message}`);
    return { id: "⚪ 8", description: "Opinião / Comentário", adequada_para_audio: true };
  }
}

// --- Funções de Lógica ---
function calcularRelevanceScore(article, classification) {
  let score = 0;
  if (!classification || classification.adequada_para_audio === false) {
      return -100;
  }
  
  const title = article.title.toLowerCase();
  score += SOURCE_WEIGHTS[article.source] || 3;

  for (const keyword of KEYWORDS_RELEVANCIA) {
    if (title.includes(keyword)) {
      score += 5;
    }
  }
  
  const classificationId = classification.id.split(' ')[0];
  
  if (['🔴', '⚫', '🟡'].includes(classificationId)) score += 10;
  if (['🔵', '🟤'].includes(classificationId)) score += 12; 
  if (['🟣', '🟢', '🟠'].includes(classificationId)) score += 7;
  
  return score;
}

function isTodayInManaus(isoDate) {
    try {
        const nowInManaus = toDate(new Date(), { timeZone: TIMEZONE });
        const articleDateInManaus = toDate(new Date(isoDate), { timeZone: TIMEZONE });
        const formatString = 'yyyy-MM-dd';
        return format(nowInManaus, formatString) === format(articleDateInManaus, formatString);
    } catch (error) {
        console.warn(`Aviso: Data inválida encontrada para artigo: ${isoDate}`);
        return false;
    }
}

// Função para limpar uma notícia para o JSON final
const limparNoticia = (noticia) => {
    if (!noticia) return null;
    const { adequada_para_audio, ...classificationLimpia } = noticia.classification;
    return {
        title: noticia.title,
        link: noticia.link,
        source: noticia.source,
        publishedDate: noticia.publishedDate,
        summary: noticia.summary,
        relevanceScore: noticia.relevanceScore,
        classification: classificationLimpia,
    };
};

// --- Função Principal ---
async function analisarEselecionarNoticias() {
  console.log('🧠 Bubuia News - Iniciando análise e curadoria das notícias...');
  
  let todasAsNoticias;
  try {
    const fileContent = await fs.readFile(INPUT_FILE, 'utf-8');
    todasAsNoticias = JSON.parse(fileContent);
  } catch (error) {
    console.error(`🔥 Erro ao ler o arquivo de notícias: ${INPUT_FILE}. Execute o 'buscarNoticias.js' primeiro.`);
    return;
  }

  console.log(`Encontrados ${todasAsNoticias.length} artigos brutos. Filtrando por data de hoje (${format(new Date(), 'dd/MM/yyyy')})...`);

  const noticiasDeHoje = todasAsNoticias.filter(article => isTodayInManaus(article.publishedDate));
  
  if (noticiasDeHoje.length === 0) {
    console.log('Nenhuma notícia de hoje encontrada. Encerrando.');
    return;
  }
  console.log(`${noticiasDeHoje.length} notícias de hoje encontradas. Iniciando classificação e ranking...`);

  let noticiasAnalisadas = [];
  for (const article of noticiasDeHoje) {
    const classification = await chamarIAparaClassificar(article);
    const relevanceScore = calcularRelevanceScore(article, classification);
    
    noticiasAnalisadas.push({
      ...article,
      relevanceScore,
      classification,
    });
  }

  // ETAPA DE SELEÇÃO E DIVERSIFICAÇÃO
  let noticiasAdequadas = noticiasAnalisadas.filter(n => n.classification && n.classification.adequada_para_audio !== false);
  noticiasAdequadas.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
  // 1. SELECIONAR O COLD OPEN
  let coldOpenNoticia = null;
  const candidatosColdOpen = noticiasAdequadas.filter(n => {
    const classificationId = n.classification.id.split(' ')[0];
    return ['🔵', '🟤'].includes(classificationId);
  });

  if (candidatosColdOpen.length > 0) {
    coldOpenNoticia = candidatosColdOpen[0]; // Pega o mais relevante
    noticiasAdequadas = noticiasAdequadas.filter(n => n.id !== coldOpenNoticia.id);
  }

  // 2. SELECIONAR AS 4 NOTÍCIAS PRINCIPAIS (COM DIVERSIFICAÇÃO)
  const noticiasPrincipais = [];
  const categoriasUsadas = new Set();

  for (const noticia of noticiasAdequadas) {
      if (noticiasPrincipais.length < 4 && !categoriasUsadas.has(noticia.classification.id)) {
          noticiasPrincipais.push(noticia);
          categoriasUsadas.add(noticia.classification.id);
      }
  }

  if (noticiasPrincipais.length < 4) {
      for (const noticia of noticiasAdequadas) {
          if (noticiasPrincipais.length < 4 && !noticiasPrincipais.find(n => n.id === noticia.id)) {
            noticiasPrincipais.push(noticia);
          }
      }
  }

  // 3. MONTAR E SALVAR A PAUTA FINAL
  const pautaFinal = {
    coldOpen: limparNoticia(coldOpenNoticia),
    noticiasPrincipais: noticiasPrincipais.map(limparNoticia),
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(pautaFinal, null, 2));

  console.log('\n✅ Curadoria finalizada!');
  if (pautaFinal.coldOpen) {
    console.log(`  -> 💥 Cold Open: [${pautaFinal.coldOpen.classification.id}] ${pautaFinal.coldOpen.title}`);
  } else {
    console.log('  -> 💥 Cold Open: Nenhuma notícia adequada encontrada.');
  }
  
  console.log('\n  📰 Notícias Principais:');
  pautaFinal.noticiasPrincipais.forEach((n, index) => {
    console.log(`    ${index + 1}. [${n.classification.id}] ${n.title} (Score: ${n.relevanceScore})`);
  });
  console.log(`\nArquivo de pauta salvo em: ${OUTPUT_FILE}`);
}

// Inicia a execução do script
analisarEselecionarNoticias();
