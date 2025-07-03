import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { parse } from 'date-fns';
import { NoticiaCrua, Collector } from '../../types.js';

const A_CRITICA_URLS = [
    'https://www.acritica.com/manaus',
    'https://www.acritica.com/entretenimento',
    'https://www.acritica.com/educacao',
    'https://www.acritica.com/geral'
];
const SOURCE_NAME = 'A Crítica';
const TIMEZONE = 'America/Manaus';

function parseDateFromText(dateText: string): string | null {
    if (!dateText) return null;
    try {
        const parsedDate = parse(dateText, "dd/MM/yyyy 'às' HH:mm", new Date());
        return toDate(parsedDate, { timeZone: TIMEZONE }).toISOString();
    } catch (e) { return null; }
}

function isAfterStartTime(isoDate: string | null, startTime: string): boolean {
    if (!isoDate) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch(e) { return false; }
}

async function fetchFromSection(url: string): Promise<NoticiaCrua[]> {
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
    const $ = cheerio.load(html);
    const articlePromises: Promise<NoticiaCrua | null>[] = [];

    $('h3[class*="styled__HeadingThree"]').each((index, element) => {
        const h3Element = $(element);
        const linkElement = h3Element.find('a');
        const titulo = linkElement.text().trim();
        const partialLink = linkElement.attr('href');
        const dateText = h3Element.siblings('span[class*="styled__Span"]').text().trim();
        const dataPublicacao = parseDateFromText(dateText);

        if (titulo && partialLink && dataPublicacao) {
            const link = `https://www.acritica.com${partialLink}`;
            const promise = (async (): Promise<NoticiaCrua | null> => {
                try {
                    const { data: articleHtml } = await axios.get(link, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
                    const $article = cheerio.load(articleHtml);
                    const resumo = $article('div.Block__Component-sc-1uj1scg-0 p').first().text().trim();
                    return { titulo, link, fonte: SOURCE_NAME, dataPublicacao, resumo: resumo || 'Resumo não disponível.' };
                } catch (err) { return null; }
            })();
            articlePromises.push(promise);
        }
    });
    const resolvedArticles = await Promise.all(articlePromises);
    return resolvedArticles.filter((article): article is NoticiaCrua => article !== null);
}

const fetchFromACritica: Collector['fetch'] = async ({ startTime }) => {
  try {
    const sectionsResults = await Promise.all(A_CRITICA_URLS.map(fetchFromSection));
    let allArticles = sectionsResults.flat();
    
    allArticles = allArticles.filter(article => isAfterStartTime(article.dataPublicacao, startTime));

    const uniqueArticles: NoticiaCrua[] = [];
    const processedLinks = new Set<string>();
    for (const article of allArticles) {
        if (!processedLinks.has(article.link)) {
            uniqueArticles.push(article);
            processedLinks.add(article.link);
        }
    }
    if (uniqueArticles.length === 0) console.warn(`[AVISO] Nenhum artigo recente encontrado para "${SOURCE_NAME}".`);
    return uniqueArticles;
  } catch (error) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, (error as Error).message);
    return [];
  }
}

const acriticaCollector: Collector = {
  name: SOURCE_NAME,
  fetch: fetchFromACritica,
};

export default acriticaCollector;
