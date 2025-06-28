// collectors/g1amazonas.js
import RssParser from 'rss-parser';

const parser = new RssParser();
const G1_AM_FEED_URL = 'https://g1.globo.com/rss/g1/am/amazonas/';

async function fetchFromG1AM() {
  try {
    const feed = await parser.parseURL(G1_AM_FEED_URL);
    
    // Mapeia os itens do feed para o nosso formato padrão
    return feed.items.map(item => ({
      id: item.guid || item.link, 
      title: item.title,
      link: item.link,
      source: 'G1 Amazonas',
      publishedDate: item.isoDate, 
      summary: item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '') || ''
    }));

  } catch (error) {
    // Em caso de erro, loga a mensagem e retorna um array vazio para não quebrar o sistema
    console.error('Erro ao buscar notícias do G1 Amazonas:', error.message);
    return []; 
  }
}

// Exportamos a função e o nome da fonte para o orquestrador `buscarNoticias.js` poder usar
export default {
  fetch: fetchFromG1AM,
  sourceName: 'G1 Amazonas'
};