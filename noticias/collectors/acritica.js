// noticias/collectors/acritica.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { parse } from 'date-fns';

// URL ADICIONADA: Incluindo a seção 'geral'
const A_CRITICA_URLS = [
    'https://www.acritica.com/manaus',
    'https://www.acritica.com/entretenimento',
    'https://www.acritica.com/educacao',
    'https://www.acritica.com/geral' 
];
const SOURCE_NAME = 'A Crítica';
const TIMEZONE = 'America/Manaus';

function parseDateFromText(dateText) {
    if (!dateText) return null;
    try {
        const parsedDate = parse(dateText, "dd/MM/yyyy 'às' HH:mm", new Date());
        return toDate(parsedDate, { timeZone: TIMEZONE }).toISOString();
    } catch (e) { return null; }
}

function isAfterStartTime(isoDate, startTime) {
    if (!isoDate || !startTime) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch(e) { return false; }
}

async function fetchFromSection(url) {
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
    const $ = cheerio.load(html);
    const articlePromises = [];

    $('h3[class*="styled__HeadingThree"]').each((index, element) => {
        const h3Element = $(element);
        const linkElement = h3Element.find('a');
        const title = linkElement.text().trim();
        const partialLink = linkElement.attr('href');
        const dateText = h3Element.siblings('span[class*="styled__Span"]').text().trim();
        const publishedDate = parseDateFromText(dateText);

        if (title && partialLink && publishedDate) {
            const fullLink = `https://www.acritica.com${partialLink}`;
            const promise = (async () => {
                try {
                    const { data: articleHtml } = await axios.get(fullLink, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
                    const $article = cheerio.load(articleHtml);
                    const summary = $article('div.Block__Component-sc-1uj1scg-0 p').first().text().trim();
                    return { title, link: fullLink, source: SOURCE_NAME, publishedDate, summary: summary || 'Resumo não disponível.' };
                } catch (err) { return null; }
            })();
            articlePromises.push(promise);
        }
    });
    return Promise.all(articlePromises);
}

async function fetchFromACritica({ startTime }) {
  try {
    const sectionsResults = await Promise.all(A_CRITICA_URLS.map(url => fetchFromSection(url)));
    let allArticles = sectionsResults.flat().filter(article => article !== null);
    
    allArticles = allArticles.filter(article => isAfterStartTime(article.publishedDate, startTime));

    const uniqueArticles = [];
    const processedLinks = new Set();
    for (const article of allArticles) {
        if (!processedLinks.has(article.link)) {
            uniqueArticles.push(article);
            processedLinks.add(article.link);
        }
    }
    if (uniqueArticles.length === 0) console.warn(`[AVISO] Nenhum artigo recente encontrado para "${SOURCE_NAME}".`);
    return uniqueArticles;
  } catch (error) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return [];
  }
}

export default {
  fetch: fetchFromACritica,
  sourceName: SOURCE_NAME,
};
