// noticias/collectors/d24am.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';

const D24AM_URLS = [
    'https://d24am.com/amazonas/',
    'https://d24am.com/plus/',
    'https://d24am.com/economia/'
];
const SOURCE_NAME = 'D24AM';
const TIMEZONE = 'America/Manaus';

const monthMap = {
    'janeiro': 'January', 'fevereiro': 'February', 'março': 'March',
    'abril': 'April', 'maio': 'May', 'junho': 'June',
    'julho': 'July', 'agosto': 'August', 'setembro': 'September',
    'outubro': 'October', 'novembro': 'November', 'dezembro': 'December'
};

function parsePortugueseDate(dateString) {
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
        return null;
    }
}

// LÓGICA CORRIGIDA: Usando o filtro dinâmico
function isAfterStartTime(isoDate, startTime) {
    if (!isoDate || !startTime) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch(e) {
        return false;
    }
}

async function fetchFromSection(url) {
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': 'BubuiaNews-Bot/1.0'
        }
    });

    const $ = cheerio.load(html);
    const articles = [];

    $('div.text-container').each((index, element) => {
        const container = $(element);
        const title = container.find('h1.blog-post-title').text().trim();
        const summary = container.find('div.blog-post-excerpt p').text().trim();
        const dateText = container.find('span.blog-post-time').attr('title');
        const fullLink = container.closest('a').attr('href');
        const publishedDate = parsePortugueseDate(dateText);
        
        // Coleta todos os artigos com data válida, o filtro será aplicado depois
        if (title && fullLink && publishedDate) {
            if (!articles.some(a => a.link === fullLink)) {
                articles.push({
                    title,
                    link: fullLink,
                    source: SOURCE_NAME,
                    publishedDate,
                    summary: summary || 'Resumo não disponível.',
                });
            }
        }
    });
    
    return articles;
}

// LÓGICA CORRIGIDA: A função agora aceita e usa o parâmetro { startTime }
async function fetchFromD24AM({ startTime }) {
  try {
    const sectionsResults = await Promise.all(D24AM_URLS.map(url => fetchFromSection(url)));
    let allArticles = sectionsResults.flat().filter(article => article !== null);

    // Filtro dinâmico aplicado aqui
    allArticles = allArticles.filter(article => isAfterStartTime(article.publishedDate, startTime));
    
    const uniqueArticles = [];
    const processedLinks = new Set();
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

  } catch (error) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return [];
  }
}

export default {
  fetch: fetchFromD24AM,
  sourceName: SOURCE_NAME,
};
