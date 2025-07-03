// noticias/collectors/g1amazonas.js
import RssParser from 'rss-parser';
import { toDate } from 'date-fns-tz';

const parser = new RssParser();
const G1_AM_FEED_URL = 'https://g1.globo.com/rss/g1/am/amazonas/';
const SOURCE_NAME = 'G1 Amazonas';
const TIMEZONE = 'America/Manaus';

// **LÓGICA CORRIGIDA:** Usando o filtro dinâmico
function isAfterStartTime(isoDate, startTime) {
    if (!isoDate || !startTime) return false;
    try {
        // Compara a data da notícia com a data da última coleta
        return new Date(isoDate) > new Date(startTime);
    } catch (e) {
        return false;
    }
}

// **LÓGICA CORRIGIDA:** A função agora aceita o parâmetro { startTime }
async function fetchFromG1AM({ startTime }) {
  try {
    const feed = await parser.parseURL(G1_AM_FEED_URL);
    
    // Mapeia os itens do feed para o nosso formato padrão
    const allItems = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      source: SOURCE_NAME,
      publishedDate: item.isoDate, 
      summary: item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '') || ''
    }));

    // Aplica o novo filtro dinâmico para pegar notícias desde a última coleta
    const recentItems = allItems.filter(item => isAfterStartTime(item.publishedDate, startTime));

    return recentItems;

  } catch (error) {
    // Em caso de erro, loga a mensagem e retorna um array vazio para não quebrar o sistema
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return []; 
  }
}

// Exportamos a função e o nome da fonte para o orquestrador `buscarNoticias.js` poder usar
export default {
  fetch: fetchFromG1AM,
  sourceName: SOURCE_NAME
};
