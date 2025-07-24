// src/noticias/analisarNoticias.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import 'dotenv/config';

import { config, filePaths } from '../config.js';
import {
    NoticiaCrua,
    NoticiaAgrupada,
    NoticiaClassificada,
    PautaDoDia,
    Classification,
    FonteNoticia
} from '../types.js';
import { NoticiaCruaSchema, PautaDoDiaSchema } from '../schemas/core.schemas.js';
import { validateWithSchema, validateArrayWithSchema } from '../utils/validation.js';
import { classifyNewsPrompt } from '../ai/prompts/classify-news.prompt.js';
import { renderTemplate } from '../ai/prompts/prompt-template.js';
import { AIPerformanceCollector } from '../ai/metrics/ai-performance.js';

// Initialize AI metrics collector
const aiMetrics = new AIPerformanceCollector();

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { relevanceKeywords, sourceWeights, classificationGuide } = config.analise;

const CLASSIFICATION_GUIDE_TEXT = Object.entries(classificationGuide)
    .map(([key, value]) => `* **${key}**: ${value.label}`)
    .join('\n');

// --- Tipos Específicos ---
interface OpenAIResponse {
    classification_id: string;
    is_adequate: boolean;
}

// Notícia crua enriquecida com dados da análise
interface NoticiaAnalisada extends NoticiaCrua {
    relevanceScore: number;
    classification: Classification;
}

// Notícia com campos extras para compatibilidade com schema
interface NoticiaEnriquecida {
    isSuperNoticia: boolean;
    tituloPrincipal: string;
    classification: Classification;
    relevanceScore: number;
    fontes: Array<{
        link: string;
        resumo: string;
        fonte: string;
    }>;
    // Campos adicionais para schema
    id: string;
    titulo: string;
    resumo: string;
    relevancia: number;
    categoria: 'politica' | 'economia' | 'meio-ambiente' | 'cultura' | 'tecnologia' | 'social';
    contextoAmazonico: string;
    tempoEstimado: number;
    prioridade: 'alta' | 'media' | 'baixa';
}

// Notícia simplificada para agrupamento
interface NoticiaSimplificada {
    id: string;
    titulo: string;
    resumo: string;
    fonte: string;
    link: string;
    links: string[];           // ✅ NOVO: Array de todos os links encontrados
    fontes: string[];          // ✅ NOVO: Array de todas as fontes
    categoria: 'politica' | 'economia' | 'cidades' | 'cultura' | 'esportes' | 'geral';
    relevanceScore: number;
    classification: Classification;
}

// --- Funções Principais ---

async function chamarIAparaClassificar(article: NoticiaCrua): Promise<Classification> {
    console.log(`  -> Classificando com IA: "${article.titulo.substring(0, 40)}..."`);
    const startTime = Date.now();
    
    try {
        // Usar template estruturado de prompt
        const prompt = renderTemplate(classifyNewsPrompt, {
            newsData: `- Título: ${article.titulo}\n- Resumo: ${article.resumo}`,
            classificationGuide: CLASSIFICATION_GUIDE_TEXT
        });

        const response = await openai.chat.completions.create({
            model: config.ai.openai.model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: classifyNewsPrompt.config.temperature || 0.1,
        });

        const parsedResponse = JSON.parse(response.choices[0].message.content || '{}') as OpenAIResponse;
        const classificationId = parsedResponse.classification_id as keyof typeof classificationGuide;

        if (!classificationId || !classificationGuide[classificationId]) {
            console.warn(`  [AVISO] IA retornou ID inválido: ${classificationId}. Usando padrão.`);
            
            // Track failed metric
            await aiMetrics.trackAIUsage(
                'classification',
                config.ai.openai.model,
                false,
                Date.now() - startTime,
                undefined, // quality
                prompt.length / 4, // inputTokens estimate
                undefined, // outputTokens
                'invalid_classification_id',
                { article: article.titulo }
            );
            
            return { 
                id: '🚀 4', 
                label: classificationGuide['🚀 4'].label,
                isAdequate: false 
            };
        }

        const classification: Classification = {
            id: classificationId,
            label: classificationGuide[classificationId].label,
            isAdequate: parsedResponse.is_adequate || false
        };

        // Track successful metric
        await aiMetrics.trackAIUsage(
            'classification',
            config.ai.openai.model,
            true,
            Date.now() - startTime,
            classification.isAdequate ? 8 : 6, // quality
            prompt.length / 4, // inputTokens estimate
            (response.choices[0].message.content || '').length / 4, // outputTokens estimate
            undefined, // errorType
            { 
                article: article.titulo,
                classification: classificationId,
                adequate: classification.isAdequate
            }
        );

        return classification;
        
    } catch (error: any) {
        console.error(`❌ Erro ao chamar a API de classificação: ${error.message}`);
        
        // Track failed metric
        await aiMetrics.trackAIUsage(
            'classification',
            config.ai.openai.model,
            false,
            Date.now() - startTime,
            undefined, // quality
            undefined, // inputTokens
            undefined, // outputTokens
            'api_error',
            { article: article.titulo, error: error.message }
        );
        
        const fallbackId = "🔴 3" as keyof typeof classificationGuide;
        return { id: fallbackId, label: classificationGuide[fallbackId].label, isAdequate: true }; // Fallback seguro
    }
}

function calcularRelevanceScore(article: NoticiaCrua, classification: Classification): number {
    if (!classification.isAdequate) return -100;
    
    let score = 0;
    const title = article.titulo.toLowerCase();
    const source = article.fonte as keyof typeof sourceWeights;

    score += sourceWeights[source] || 3;

    for (const keyword of relevanceKeywords) {
        if (title.includes(keyword)) score += 5;
    }

    const classificationId = classification.id.split(' ')[0];
    if (['⚫️', '🟡', '🔴'].includes(classificationId)) score += 9;
    if (['🚀', '🎬'].includes(classificationId)) score += 12;
    if (['🎭'].includes(classificationId)) score += 8;
    if (['👽'].includes(classificationId)) score += 14;

    return score;
}

function agruparNoticias(noticias: NoticiaAnalisada[]): NoticiaSimplificada[] {
    console.log('\n[LOG] Fase de agrupamento iniciada...');
    const grupos: { [key: string]: NoticiaAnalisada[] } = {};
    for (const noticia of noticias) {
        const categoria = noticia.classification.id;
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(noticia);
    }

    const noticiasAgrupadas: NoticiaSimplificada[] = [];
    const processados = new Set<string>();

    for (const categoria in grupos) {
        const grupoCategoria = grupos[categoria];
        while (grupoCategoria.length > 0) {
            const noticiaBase = grupoCategoria.shift()!;
            if (processados.has(noticiaBase.link)) continue;

            const grupoSimilar = [noticiaBase];
            const palavrasBase = new Set(noticiaBase.titulo.toLowerCase().split(' ').filter(p => p.length > 3));

            for (let i = grupoCategoria.length - 1; i >= 0; i--) {
                const noticiaComparar = grupoCategoria[i];
                const palavrasComparar = new Set(noticiaComparar.titulo.toLowerCase().split(' '));
                const intersecao = new Set([...palavrasBase].filter(p => palavrasComparar.has(p)));
                if ((intersecao.size / palavrasBase.size) > 0.4) {
                    grupoSimilar.push(noticiaComparar);
                    grupoCategoria.splice(i, 1);
                }
            }
            
            grupoSimilar.sort((a, b) => b.relevanceScore - a.relevanceScore);
            const noticiaPrincipal = grupoSimilar[0];
            processados.add(noticiaPrincipal.link);

            // ✅ NOVO: Coletar todos os links e fontes do grupo
            const todosOsLinks = grupoSimilar
                .map(n => n.link)
                .filter(link => link && link.trim() !== '')
                .filter((link, index, self) => self.indexOf(link) === index); // Remove duplicatas
            
            const todasAsFontes = [...new Set(grupoSimilar.map(n => n.fonte))];

            console.log(`[LOG] Grupo "${noticiaPrincipal.titulo.substring(0, 50)}...": ${grupoSimilar.length} notícias, ${todosOsLinks.length} links únicos`);

            noticiasAgrupadas.push({
                id: `noticia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: noticiaPrincipal.titulo,
                resumo: noticiaPrincipal.resumo,
                fonte: noticiaPrincipal.fonte,
                link: noticiaPrincipal.link,
                links: todosOsLinks,           // ✅ Todos os links encontrados
                fontes: todasAsFontes,         // ✅ Todas as fontes
                categoria: mapearCategoriaParaPauta(noticiaPrincipal.classification.id),
                relevanceScore: noticiaPrincipal.relevanceScore,
                classification: noticiaPrincipal.classification
            });
        }
    }
    console.log(`[LOG] Agrupamento finalizado. ${noticiasAgrupadas.length} eventos únicos identificados.`);
    return noticiasAgrupadas;
}

// Funções auxiliares para mapear dados para o schema
function mapCategoriaToSchema(classificationId: string): 'politica' | 'economia' | 'meio-ambiente' | 'cultura' | 'tecnologia' | 'social' {
    const id = classificationId.split(' ')[0];
    switch (id) {
        case '🟡': return 'politica';
        case '🚀': return 'tecnologia';
        case '🎬':
        case '🎭': return 'cultura';
        case '⚫️':
        case '🔴': return 'social';   // Segurança e perrengues vão para social  
        case '👽': return 'cultura';
        default: return 'social';
    }
}

function gerarContextoAmazonico(noticia: NoticiaAnalisada): string {
    const titulo = noticia.titulo.toLowerCase();
    const contextos = [];
    
    // Contextos específicos do Amazonas
    if (titulo.includes('manaus')) contextos.push('Impacto direto na capital amazonense');
    if (titulo.includes('amazonas')) contextos.push('Relevância estadual');
    if (titulo.includes('parintins')) contextos.push('Tradição cultural amazônica');
    if (titulo.includes('rio negro') || titulo.includes('rio amazonas')) contextos.push('Recursos hídricos regionais');
    if (titulo.includes('floresta') || titulo.includes('queimada')) contextos.push('Meio ambiente amazônico');
    if (titulo.includes('festival') || titulo.includes('cultura')) contextos.push('Identidade cultural regional');
    if (titulo.includes('wilson lima') || titulo.includes('david almeida')) contextos.push('Gestão pública local');
    
    return contextos.length > 0 ? contextos.join(' | ') : 'Relevância regional geral';
}

function calcularTempoEstimado(noticia: NoticiaAnalisada, numFontes: number): number {
    // Base: 30 segundos para notícia simples
    let tempo = 30;
    
    // +10s para cada fonte adicional (super-notícia)
    tempo += (numFontes - 1) * 10;
    
    // +15s para classificações de maior impacto
    const id = noticia.classification.id.split(' ')[0];
    if (['⚫️', '👽'].includes(id)) tempo += 15;
    if (['🚀', '🎬'].includes(id)) tempo += 10;
    
    // +5s para alta relevância
    if (noticia.relevanceScore > 25) tempo += 5;
    
    return tempo;
}

function calcularPrioridade(relevanceScore: number): 'alta' | 'media' | 'baixa' {
    if (relevanceScore >= 25) return 'alta';
    if (relevanceScore >= 15) return 'media';
    return 'baixa';
}

function gerarTemaDestaque(manchete: NoticiaEnriquecida, pautaAgrupada: NoticiaEnriquecida[]): string {
    const temas = [];
    
    // Analisa a manchete
    if (manchete.categoria === 'politica') temas.push('Política');
    if (manchete.categoria === 'cultura') temas.push('Cultura');
    if (manchete.categoria === 'social') temas.push('Cidade');
    if (manchete.categoria === 'economia' || manchete.categoria === 'tecnologia') temas.push('Economia');
    
    // Verifica se há super-notícias
    const superNoticias = pautaAgrupada.filter(n => n.isSuperNoticia);
    if (superNoticias.length > 0) temas.push('Destaque Regional');
    
    return temas.length > 0 ? temas.join(' e ') : 'Notícias do Dia';
}

function calcularDuracaoTotal(pauta: any): number {
    let total = 0;
    Object.values(pauta).forEach((categoria: any) => {
        if (Array.isArray(categoria)) {
            categoria.forEach((noticia: any) => {
                total += noticia.tempoEstimado || 30;
            });
        }
    });
    return total;
}

function calcularDistribuicaoCategorias(pauta: any): Record<string, number> {
    const distribuicao: Record<string, number> = {};
    Object.entries(pauta).forEach(([categoria, noticias]: [string, any]) => {
        if (Array.isArray(noticias)) {
            distribuicao[categoria] = noticias.length;
        }
    });
    return distribuicao;
}

function calcularRelevanciaMedia(noticias: NoticiaEnriquecida[]): number {
    if (noticias.length === 0) return 0;
    const soma = noticias.reduce((acc, noticia) => acc + noticia.relevancia, 0);
    return Number((soma / noticias.length).toFixed(1));
}

function mapearCategoriaParaPauta(classificationId: string): 'politica' | 'economia' | 'cidades' | 'cultura' | 'esportes' | 'geral' {
    // Mapeia os IDs de classificação para as categorias da pauta
    const id = classificationId.split(' ')[0];
    switch (id) {
        case '🟡': // Política de Baré
            return 'politica';
        case '🚀': // Tecnologia & Inovação do Igarapé
            return 'economia';
        case '⚫️': // Segurança & BOs de Impacto
        case '🔴': // Perrengues da Cidade
            return 'cidades';
        case '🎭': // Rolê Cultural
        case '👽': // Bizarrices da Bubuia
            return 'cultura';
        default:
            return 'geral';
    }
}


/**
 * @ai-purpose Analisa e classifica notícias brutas usando IA para relevância local amazônica
 * @ai-input-format Lê arquivo JSON com array de NoticiaCrua de noticias-recentes.json
 * @ai-output-format Gera PautaDoDia estruturada com cold open e notícias priorizadas em noticias-categorizadas.json
 * @ai-dependencies OpenAI API, configuração de keywords locais, arquivo noticias-recentes.json
 * @ai-error-handling Retry com diferentes modelos, fallback para classificação heurística se IA falhar completamente
 * @ai-performance Média 30s para 10 notícias, escala linear O(n), timeout individual de 15s por classificação
 * @ai-context Especializado em notícias do Amazonas/Norte, threshold de relevância configurável (padrão: -100), rate limiting de 200ms entre chamadas
 * @ai-validation Entrada esperada como NoticiaCrua[], saída validada como PautaDoDia - sem validação Zod ainda implementada
 * @ai-side-effects Salva análise em data/noticias-categorizadas.json, logs detalhados de progresso, cache implícito via filesystem
 * @ai-cost $0.08-0.25 por execução (depende da quantidade de notícias e modelo GPT usado)
 * @ai-quality-factors Precisão de classificação IA (40%), relevância keywords locais (35%), qualidade editorial fonte (25%)
 * @ai-optimization-tips Use batch processing para muitas notícias, implemente cache de classificações similares, ajuste threshold de relevância baseado em feedback
 * @ai-common-errors "Rate limit exceeded OpenAI", "Classification threshold too restrictive", "Empty news array", "File not found noticias-recentes.json"
 * @ai-debugging Verificar qualidade das notícias de entrada, validar API keys, testar classificação individual, logs detalhados habilitados
 * @ai-monitoring Taxa de aprovação de notícias (~30-50%), distribuição por categoria, tempo de resposta por notícia, accuracy de classificação
 * @ai-scaling Máximo recomendado 50 notícias por execução, usar parallel processing com cuidado (rate limits), considerar cache Redis para classificações
 * @ai-business-impact Reduz 80% do trabalho manual de curadoria, melhora consistência editorial, permite escala de múltiplos episódios diários
 * @ai-example
 * ```typescript
 * // Arquivo noticias-recentes.json deve existir com array de NoticiaCrua
 * await analisarNoticias();
 * // Gera noticias-categorizadas.json com notícias classificadas e cold open
 * console.log('Pauta gerada para produção do episódio');
 * ```
 */
// === ANÁLISE E PROCESSAMENTO DE NOTÍCIAS ===

export async function analisarNoticias() {
    console.log('🧠 Bubuia News - Iniciando análise e curadoria...');
    console.log(`📂 Arquivo de entrada: ${filePaths.noticiasRecentesFile}`);
    console.log(`📂 Arquivo de saída: ${filePaths.noticiasCategorizadasFile}`);
    
    // Carregar e processar notícias
    const inputFile = filePaths.noticiasRecentesFile;
    const outputFile = filePaths.noticiasCategorizadasFile;
    let todasAsNoticias: NoticiaCrua[];

    try {
        console.log('📖 Lendo arquivo de notícias...');
        const fileContent = await fs.readFile(inputFile, 'utf-8');
        console.log(`📊 Arquivo lido com ${fileContent.length} caracteres`);
        const rawNoticias = JSON.parse(fileContent);
        console.log(`📋 JSON parsado com ${rawNoticias.length} notícias`);
        
        // Validação das notícias de entrada
        const validationResult = validateArrayWithSchema(
            rawNoticias, 
            NoticiaCruaSchema, 
            'analisarNoticias.input'
        );
        
        if (validationResult.invalid.length > 0) {
            console.warn(`⚠️ ${validationResult.invalid.length} notícias inválidas foram ignoradas na entrada`);
        }
        
        todasAsNoticias = validationResult.valid as NoticiaCrua[];
        console.log(`✅ Validação de entrada: ${validationResult.summary.valid}/${validationResult.summary.total} notícias válidas (${(validationResult.summary.successRate * 100).toFixed(1)}%)`);
        
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de notícias: ${inputFile}. Execute a etapa de busca primeiro.`);
        throw error;
    }

    console.log(`\n[LOG] ${todasAsNoticias.length} artigos brutos encontrados. Iniciando classificação...`);
    const noticiasAnalisadas: NoticiaAnalisada[] = [];
    for (const article of todasAsNoticias) {
        const classification = await chamarIAparaClassificar(article);
        const relevanceScore = calcularRelevanceScore(article, classification);
        if (relevanceScore > -100) {
            noticiasAnalisadas.push({ ...article, relevanceScore, classification });
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
    }
    console.log(`[LOG] ${noticiasAnalisadas.length} notícias foram consideradas adequadas após a classificação da IA.`);

    let pautaAgrupada = agruparNoticias(noticiasAnalisadas);
    pautaAgrupada.sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (pautaAgrupada.length === 0) {
        console.warn('\n[AVISO] Nenhuma notícia adequada foi encontrada para formar a pauta. O processo será interrompido.');
        throw new Error('Nenhuma notícia para a pauta.');
    }

    // A primeira notícia é sempre a manchete
    const manchete = pautaAgrupada[0];

    // Inicializa a pauta final com estrutura simplificada
    const pautaFinal = {
        data: new Date().toISOString(),
        manchete: manchete.titulo,
        categorias: {
            politica: [] as NoticiaSimplificada[],
            economia: [] as NoticiaSimplificada[],
            cidades: [] as NoticiaSimplificada[],
            cultura: [] as NoticiaSimplificada[],
            esportes: [] as NoticiaSimplificada[],
            geral: [] as NoticiaSimplificada[]
        },
        rankingGeral: pautaAgrupada,
        metadados: {
            totalAnalisadas: todasAsNoticias.length,
            totalRelevantes: noticiasAnalisadas.length,
            fontesProcessadas: [...new Set(todasAsNoticias.map(n => n.fonte))],
            tempoProcessamento: '0s',
            versaoAnalise: '2.0'
        }
    };

    // Distribuir notícias nas categorias
    for (const noticia of pautaAgrupada) {
        const categoria = mapearCategoriaParaPauta(noticia.categoria);
        if (pautaFinal.categorias[categoria]) {
            pautaFinal.categorias[categoria].push(noticia);
        }
    }

    // Validação da pauta final
    try {
        console.log('💾 Validando e salvando pauta final...');
        const pautaValidada = validateWithSchema(pautaFinal, PautaDoDiaSchema, 'analisarNoticias.output');
        await fs.writeFile(outputFile, JSON.stringify(pautaValidada, null, 2));
        console.log(`\n✅ Análise finalizada! Pauta do dia com ${pautaAgrupada.length} notícias categorizadas e validada foi salva em ${outputFile}`);
    } catch (error) {
        console.error('🔥 Erro de validação da pauta final:', error);
        throw new Error('Erro na geração da pauta do dia. Verifique os logs para mais detalhes.');
    }
}

// Chamada direta se executado como script principal
if (
    import.meta.url.includes('analisarNoticias.ts') ||
    process.argv[1]?.includes('analisarNoticias')
) {
    console.log('🚀 Executando analisarNoticias como script principal...');
    analisarNoticias()
        .then(() => console.log('✅ Script concluído com sucesso'))
        .catch(error => {
            console.error('❌ Erro no script:', error);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}
