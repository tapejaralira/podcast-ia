// noticias/collectors/d24am.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';

const D24AM_URLS = [
    'https://d24am.com/amazonas/',
    'https://d24am.com/plus/',
];
const SOURCE_NAME = 'D24AM';
const TIMEZONE = 'America/Manaus';

// Objeto para mapear meses em português para inglês, para que o Date.parse funcione
const monthMap = {
    'janeiro': 'January', 'fevereiro': 'February', 'março': 'March',
    'abril': 'April', 'maio': 'May', 'junho': 'June',
    'julho': 'July', 'agosto': 'August', 'setembro': 'September',
    'outubro': 'October', 'novembro': 'November', 'dezembro': 'December'
};

// Nova função para extrair a data do texto "28 de junho de 2025"
function parsePortugueseDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.toLowerCase().split(' '); // ex: ["28", "de", "junho", "de", "2025"]
    if (parts.length < 5) return null;

    const day = parts[0];
    const monthName = parts[2];
    const year = parts[4];

    const englishMonth = monthMap[monthName];
    if (!englishMonth) return null;

    try {
        // Cria uma string de data padrão que o Javascript entende (ex: "June 28, 2025")
        const standardDateString = `${englishMonth} ${day}, ${year}`;
        const date = new Date(standardDateString);
        return toDate(date, { timeZone: TIMEZONE }).toISOString();
    } catch (e) {
        return null;
    }
}

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

// Função genérica para buscar notícias de uma URL específica
async function fetchFromSection(url) {
    const { data: html } = await axios.get(url, {
        headers: {
            'User-Agent': 'BubuiaNews-Bot/1.0'
        }
    });

    const $ = cheerio.load(html);
    const articles = [];

    // **SELETOR FINAL E CORRIGIDO:** Baseado na estrutura completa que você forneceu.
    // Ele procura pelo contêiner de texto principal.
    $('div.text-container').each((index, element) => {
        const container = $(element);
        const title = container.find('h1.blog-post-title').text().trim();
        const summary = container.find('div.blog-post-excerpt p').text().trim();
        const dateText = container.find('span.blog-post-time').attr('title');
        
        // O link (<a>) é geralmente o elemento pai do contêiner da notícia
        const fullLink = container.closest('a').attr('href');
        
        const publishedDate = parsePortugueseDate(dateText);
        
        // Adiciona na lista se tiver tudo que precisamos e for recente
        if (title && fullLink && isTodayOrYesterday(publishedDate)) {
            if (!articles.some(a => a.link === fullLink)) { // Evita duplicatas
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

async function fetchFromD24AM() {
  try {
    const sectionsResults = await Promise.all(D24AM_URLS.map(url => fetchFromSection(url)));
    const allArticles = sectionsResults.flat().filter(article => article !== null);
    
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
