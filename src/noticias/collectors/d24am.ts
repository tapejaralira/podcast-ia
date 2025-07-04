// src/noticias/collectors/d24am.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { NoticiaCrua, Collector } from '../../types.js';

const D24AM_URLS = [
    'https://d24am.com/amazonas/',
    'https://d24am.com/plus/',
    'https://d24am.com/economia/'
];
const SOURCE_NAME = 'D24AM';
const TIMEZONE = 'America/Manaus';

const monthMap: { [key: string]: string } = {
    'janeiro': 'January', 'fevereiro': 'February', 'março': 'March',
    'abril': 'April', 'maio': 'May', 'junho': 'June',
    'julho': 'July', 'agosto': 'August', 'setembro': 'September',
    'outubro': 'October', 'novembro': 'November', 'dezembro': 'December'
};

function parsePortugueseDate(dateString: string | undefined): string | null {
    if (!dateString) return null;
    const parts = dateString.toLowerCase().split(' ');
    if (parts.length < 5) return null;

    const day = parts[0];
    const monthName = parts[2];
    const year = parts[4];

    const englishMonth = monthMap[monthName];
    if (!englishMonth) return null;

    try {
        const standardDateString = `${englishMonth} ${day}, ${year}`;
        const date = new Date(standardDateString);
        return toDate(date, { timeZone: TIMEZONE }).toISOString();
    } catch (e) {
        console.error(`Erro ao converter a data: ${dateString}`, e);
        return null;
    }
}

function isAfterStartTime(isoDate: string | null, startTime: string): boolean {
    if (!isoDate) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch(e) {
        console.error(`Erro ao comparar datas: ${isoDate} e ${startTime}`, e);
        return false;
    }
}

async function fetchFromSection(url: string): Promise<NoticiaCrua[]> {
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': 'BubuiaNews-Bot/1.0'
        }
    });

    const $ = cheerio.load(html);
    const articles: NoticiaCrua[] = [];

    $('div.text-container').each((index, element) => {
        const container = $(element);
        const title = container.find('h1.blog-post-title').text().trim();
        const summary = container.find('div.blog-post-excerpt p').text().trim();
        const dateText = container.find('span.blog-post-time').attr('title');
        const fullLink = container.closest('a').attr('href');
        const publishedDate = parsePortugueseDate(dateText);
        
        if (title && fullLink && publishedDate) {
            if (!articles.some(a => a.link === fullLink)) {
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

async function fetchFromD24AM({ startTime }: { startTime: string }): Promise<NoticiaCrua[]> {
  try {
    const sectionsResults = await Promise.all(D24AM_URLS.map(url => fetchFromSection(url)));
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
    return uniqueArticles;
  } catch (error) {
    console.error('Erro ao buscar notícias do D24AM:', error);
    return [];
  }
}

export const d24amCollector: Collector = {
    sourceName: SOURCE_NAME,
    fetch: fetchFromD24AM,
};
