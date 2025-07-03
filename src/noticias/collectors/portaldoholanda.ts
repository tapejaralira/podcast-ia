// src/noticias/collectors/portaldoholanda.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { subDays, subHours, subMinutes } from 'date-fns';
import { NoticiaCrua, Collector } from '../../types.js';

const PORTAL_DO_HOLANDA_URLS = [
    'https://www.portaldoholanda.com.br/bizarro',
    'https://www.portaldoholanda.com.br/amazonas',
    'https://www.portaldoholanda.com.br/agenda-cultural'
];
const SOURCE_NAME = 'Portal do Holanda';
const TIMEZONE = 'America/Manaus';

function parseRelativeDate(dateText: string | undefined): string | null {
    if (!dateText) return null;
    const now = new Date();
    const text = dateText.toLowerCase();
    try {
        if (text.includes('agora')) return toDate(now, { timeZone: TIMEZONE }).toISOString();
        if (text.includes('há um dia')) return toDate(subDays(now, 1), { timeZone: TIMEZONE }).toISOString();
        if (text.includes('há uma hora')) return toDate(subHours(now, 1), { timeZone: TIMEZONE }).toISOString();
        const numberMatch = text.match(/\d+/);
        if (!numberMatch) return null;
        const number = parseInt(numberMatch[0], 10);
        if (text.includes('minuto')) return toDate(subMinutes(now, number), { timeZone: TIMEZONE }).toISOString();
        if (text.includes('hora')) return toDate(subHours(now, number), { timeZone: TIMEZONE }).toISOString();
        if (text.includes('dia')) return toDate(subDays(now, number), { timeZone: TIMEZONE }).toISOString();
        return null;
    } catch(e) {
        console.error(`Erro ao converter data relativa: ${dateText}`, e);
        return null;
    }
}

function isAfterStartTime(isoDate: string | null, startTime: string): boolean {
    if (!isoDate || !startTime) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch (e) {
        console.error(`Erro ao comparar datas: ${isoDate} e ${startTime}`, e);
        return false;
    }
}

async function fetchFromSection(url: string): Promise<NoticiaCrua[]> {
    const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' } });
    const $ = cheerio.load(html);
    const articles: NoticiaCrua[] = [];
    $('div.editorianoticia').each((index, element) => {
        const textContainer = $(element);
        const titleElement = textContainer.find('h3.destaque.titulo a');
        const title = titleElement.text().trim();
        const partialLink = titleElement.attr('href');
        if (title && partialLink) {
            const fullLink = `https://www.portaldoholanda.com.br${partialLink}`;
            if (articles.some(a => a.link === fullLink)) return;
            
            const summary = textContainer.find('p.destaque.sutia').text().trim();
            const dateText = textContainer.find('p.destaque.ha').text().trim();
            const publishedDate = parseRelativeDate(dateText);

            if (publishedDate) {
                articles.push({
                    titulo: title,
                    link: fullLink,
                    fonte: SOURCE_NAME,
                    dataPublicacao: publishedDate,
                    resumo: summary || 'Resumo não disponível.',
                });
            }
        }
    });
    return articles;
}

async function fetchFromPortalDoHolanda({ startTime }: { startTime: string }): Promise<NoticiaCrua[]> {
  try {
    const sectionsResults = await Promise.all(PORTAL_DO_HOLANDA_URLS.map(url => fetchFromSection(url)));
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

    if (uniqueArticles.length === 0) {
        console.warn(`[AVISO] Nenhum artigo recente encontrado para "${SOURCE_NAME}".`);
    }

    return uniqueArticles;
  } catch (error: any) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return [];
  }
}

export const portalDoHolandaCollector: Collector = {
  name: SOURCE_NAME,
  fetch: fetchFromPortalDoHolanda,
};
