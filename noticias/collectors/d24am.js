// noticias/collectors/d24am.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { parse } from 'date-fns';

const D24AM_URLS = [
    'https://d24am.com/amazonas/',
    'https://d24am.com/plus/',
    'https://d24am.com/cidades/'
];
const SOURCE_NAME = 'D24AM';
const TIMEZONE = 'America/Manaus';

// Função para converter "Publicado em 27 de junho de 2025 às 19:01" em uma data ISO
function parseFullDateFromText(dateText) {
    if (!dateText) return null;
    try {
        // Formato esperado: "Publicado em dd de MMMM de yyyy às HH:mm"
        const cleanText = dateText.replace('Publicado em ', '');
        const parsedDate = parse(cleanText, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", new Date());
        return toDate(parsedDate, { timeZone: TIMEZONE }).toISOString();
    } catch (e) {
        console.error(`  [D24AM] Erro ao converter data: "${dateText}"`, e);
        return null;
    }
}

// Nova função que substitui a 'isTodayOrYesterday'
function isAfterStartTime(isoDate, startTime) {
    if (!isoDate || !startTime) return false;
    try {
        return new Date(isoDate) > new Date(startTime);
    } catch(e) {
        return false;
    }
}

// Função genérica para buscar os links das notícias em uma seção
async function fetchLinksFromSection(url) {
    const { data: html } = await axios.get(url, {
        headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }
    });
    const $ = cheerio.load(html);
    const links = new Set(); // Usamos um Set para já evitar links duplicados

    $('a').each((index, element) => {
        const linkElement = $(element);
        const titleDiv = linkElement.find('div.title');

        if (titleDiv.length > 0) {
            const fullLink = linkElement.attr('href');
            if (fullLink) {
                links.add(fullLink);
            }
        }
    });
    return Array.from(links);
}

// A função agora recebe o 'startTime' como parâmetro
async function fetchFromD24AM({ startTime }) {
  try {
    // 1. Coleta todos os links de todas as seções primeiro
    const sectionsResults = await Promise.all(D24AM_URLS.map(url => fetchLinksFromSection(url)));
    const allLinks = sectionsResults.flat();
    const uniqueLinks = Array.from(new Set(allLinks));

    // 2. Processa cada link para buscar os detalhes
    const articlePromises = uniqueLinks.map(async (link) => {
        try {
            const { data: articleHtml } = await axios.get(link, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
            const $article = cheerio.load(articleHtml);

            // 3. Extrai a data precisa de dentro da página
            const dateText = $article('time.blog-post-meta').text().trim();
            const publishedDate = parseFullDateFromText(dateText);

            // 4. Aplica o filtro dinâmico de data
            if (!isAfterStartTime(publishedDate, startTime)) {
                return null;
            }

            const title = $article('h1.blog-post-title').text().trim();
            const summary = $article('div.post-content p').first().text().trim();

            return {
                title,
                link: link,
                source: SOURCE_NAME,
                publishedDate,
                summary: summary || 'Resumo não disponível.',
            };
        } catch (err) {
            return null;
        }
    });
    
    const finalArticles = (await Promise.all(articlePromises)).filter(article => article !== null);

    if (finalArticles.length === 0) {
        console.warn(`[AVISO] Nenhum artigo recente encontrado para "${SOURCE_NAME}".`);
    }

    return finalArticles;

  } catch (error) {
    console.error(`Erro ao buscar notícias do ${SOURCE_NAME}:`, error.message);
    return [];
  }
}

export default {
  fetch: fetchFromD24AM,
  sourceName: SOURCE_NAME,
};
