// noticias/collectors/portaldoholanda.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { toDate } from 'date-fns-tz';
import { subDays, subHours, subMinutes } from 'date-fns';


const PORTAL_DO_HOLANDA_URLS = [
    'https://www.portaldoholanda.com.br/bizarro',
    'https://www.portaldoholanda.com.br/amazonas',
    'https://www.portaldoholanda.com.br/agenda-cultural'
];
const SOURCE_NAME = 'Portal do Holanda';
const TIMEZONE = 'America/Manaus';

// **FUNÇÃO ATUALIZADA:** Agora entende "há um dia" e "há uma hora"
function parseRelativeDate(dateText) {
    if (!dateText) return null;
    
    const now = new Date();
    const text = dateText.toLowerCase();

    try {
        if (text.includes('agora')) {
            return toDate(now, { timeZone: TIMEZONE }).toISOString();
        }

        // Adiciona checagem para casos sem número explícito
        if (text.includes('há um dia')) {
            return toDate(subDays(now, 1), { timeZone: TIMEZONE }).toISOString();
        }
        if (text.includes('há uma hora')) {
            return toDate(subHours(now, 1), { timeZone: TIMEZONE }).toISOString();
        }

        const numberMatch = text.match(/\d+/);
        if (!numberMatch) return null; // Se não houver número, não podemos prosseguir
        const number = parseInt(numberMatch[0], 10);

        if (text.includes('minuto')) {
            return toDate(subMinutes(now, number), { timeZone: TIMEZONE }).toISOString();
        }
        if (text.includes('hora')) {
            return toDate(subHours(now, number), { timeZone: TIMEZONE }).toISOString();
        }
        if (text.includes('dia')) {
            return toDate(subDays(now, number), { timeZone: TIMEZONE }).toISOString();
        }
        return null; // Formato não reconhecido
    } catch(e) {
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
        headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }
    });

    const $ = cheerio.load(html);
    const articles = [];

    // **NOVA LÓGICA:** Seletor único e preciso baseado na sua descoberta.
    // Ele procura pelo container de texto 'div.editorianoticia' que é o elemento mais consistente.
    $('div.editorianoticia').each((index, element) => {
        const textContainer = $(element);
        
        const titleElement = textContainer.find('h3.destaque.titulo a');
        const title = titleElement.text().trim();
        const partialLink = titleElement.attr('href');
        
        if (title && partialLink) {
            const fullLink = `https://www.portaldoholanda.com.br${partialLink}`;
            
            // Verifica se o link já foi processado para evitar duplicatas
            if (articles.some(a => a.link === fullLink)) {
                return; // 'continue' para o loop .each
            }

            const summary = textContainer.find('p.destaque.sutia').text().trim();
            const dateText = textContainer.find('p.destaque.ha').text().trim();
            const publishedDate = parseRelativeDate(dateText);

            if (isTodayOrYesterday(publishedDate)) {
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

async function fetchFromPortalDoHolanda() {
  try {
    const sectionsResults = await Promise.all(PORTAL_DO_HOLANDA_URLS.map(url => fetchFromSection(url)));
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
  fetch: fetchFromPortalDoHolanda,
  sourceName: SOURCE_NAME,
};
