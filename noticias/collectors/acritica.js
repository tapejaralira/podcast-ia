// noticias/collectors/acritica.js
import axios from 'axios';
import * as cheerio from 'cheerio';
// CORREÇÃO: A função 'parse' vem da biblioteca principal 'date-fns'
import { toDate } from 'date-fns-tz';
import { parse } from 'date-fns';

const A_CRITICA_URLS = [
    'https://www.acritica.com/manaus',
    'https://www.acritica.com/entretenimento',
    'https://www.acritica.com/policia',
    'https://www.acritica.com/educacao'
];
const SOURCE_NAME = 'A Crítica';
const TIMEZONE = 'America/Manaus';

// **NOVA FUNÇÃO:** Para extrair a data do texto "dd/MM/yyyy às HH:mm"
function parseDateFromText(dateText) {
    if (!dateText) return null;
    try {
        // Usa a biblioteca date-fns para converter o texto para um objeto de data padrão
        const parsedDate = parse(dateText, "dd/MM/yyyy 'às' HH:mm", new Date());
        // Ajusta para o fuso horário de Manaus e converte para o formato ISO
        return toDate(parsedDate, { timeZone: TIMEZONE }).toISOString();
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
    const articlePromises = [];

    // Seletor para encontrar o "card" de cada notícia
    $('h3[class*="styled__HeadingThree"]').each((index, element) => {
        const h3Element = $(element);
        const linkElement = h3Element.find('a');
        
        const title = linkElement.text().trim();
        const partialLink = linkElement.attr('href');

        // **NOVA LÓGICA:** Busca a data no "irmão" do h3, que é o span com a data
        const dateText = h3Element.siblings('span[class*="styled__Span"]').text().trim();
        const publishedDate = parseDateFromText(dateText);

        // **FILTRO INTELIGENTE:** Só prossegue se a notícia for recente
        if (title && partialLink && isTodayOrYesterday(publishedDate)) {
            const fullLink = `https://www.acritica.com${partialLink}`;
            
            // Cria a promessa para buscar o resumo apenas das notícias que passaram no filtro
            const promise = (async () => {
                try {
                    const { data: articleHtml } = await axios.get(fullLink, { headers: { 'User-Agent': 'BubuiaNews-Bot/1.0' }});
                    const $article = cheerio.load(articleHtml);
                    const summary = $article('div.Block__Component-sc-1uj1scg-0 p').first().text().trim();
                    
                    return {
                        id: fullLink,
                        title,
                        link: fullLink,
                        source: SOURCE_NAME,
                        publishedDate,
                        summary: summary || 'Resumo não disponível.',
                    };
                } catch (err) {
                    return null;
                }
            })();
            articlePromises.push(promise);
        }
    });
    
    return Promise.all(articlePromises);
}

async function fetchFromACritica() {
  try {
    const sectionsResults = await Promise.all(A_CRITICA_URLS.map(url => fetchFromSection(url)));
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
  fetch: fetchFromACritica,
  sourceName: SOURCE_NAME,
};
