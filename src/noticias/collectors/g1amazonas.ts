// src/noticias/collectors/g1amazonas.ts
import RssParser from 'rss-parser';
import { NoticiaCrua, Collector } from '../../types.js';

const parser = new RssParser();
const G1_AM_FEED_URL = 'https://g1.globo.com/rss/g1/am/amazonas/';
const SOURCE_NAME = 'G1 Amazonas';

function isAfterStartTime(isoDate: string | undefined, startTime: string): boolean {
    if (!isoDate || !startTime) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch (e) {
        console.error(`Erro ao comparar datas: ${isoDate} e ${startTime}`, e);
        return false;
    }
}

async function fetchFromG1AM({ startTime }: { startTime: string }): Promise<NoticiaCrua[]> {
  try {
    const feed = await parser.parseURL(G1_AM_FEED_URL);
    
    const allItems: NoticiaCrua[] = feed.items
      .map(item => ({
        titulo: item.title || '',
        link: item.link || '',
        fonte: SOURCE_NAME,
        dataPublicacao: item.isoDate || new Date().toISOString(),
        resumo: item.contentSnippet || item.content?.replace(/<[^>]*>?/gm, '') || 'Resumo não disponível.'
      }))
      .filter(item => item.titulo && item.link); // Garante que itens sem título ou link sejam descartados

    const recentItems = allItems.filter(item => isAfterStartTime(item.dataPublicacao, startTime));

    return recentItems;

  } catch (error: any) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return []; 
  }
}

export const g1amazonasCollector: Collector = {
  name: SOURCE_NAME,
  fetch: fetchFromG1AM,
};
