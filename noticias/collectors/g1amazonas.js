// noticias/collectors/g1amazonas.js
import RssParser from 'rss-parser';
import { toDate } from 'date-fns-tz';

const parser = new RssParser();
const G1_AM_FEED_URL = 'https://g1.globo.com/rss/g1/am/amazonas/';
const SOURCE_NAME = 'G1 Amazonas';
const TIMEZONE = 'America/Manaus';

// Função para verificar se a data da notícia é de hoje ou de ontem
function isTodayOrYesterday(isoDate) {
    if (!isoDate) return false;
    const now = new Date();
    const today = toDate(now, { timeZone: TIMEZONE });
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const articleDate = toDate(new Date(isoDate), { timeZone: TIMEZONE });
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const articleDateStr = articleDate.toISOString().split('T')[0];
    return articleDateStr === todayStr || articleDateStr === yesterdayStr;
}

async function fetchFromG1AM() {
  try {
    const feed = await parser.parseURL(G1_AM_FEED_URL);
    
    // Mapeia os itens do feed para o nosso formato padrão
    const allItems = feed.items.map(item => ({
      id: item.guid || item.link, 
      title: item.title,
      link: item.link,
      source: SOURCE_NAME,
      publishedDate: item.isoDate, 
      summary: item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '') || ''
    }));

    // **NOVA LÓGICA:** Aplica o filtro para manter apenas notícias de hoje e ontem
    const recentItems = allItems.filter(item => isTodayOrYesterday(item.publishedDate));

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
