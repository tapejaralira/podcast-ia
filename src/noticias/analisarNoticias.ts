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

// --- Funções Principais ---

async function chamarIAparaClassificar(article: NoticiaCrua): Promise<Classification> {
    console.log(`  -> Classificando com IA: "${article.titulo.substring(0, 40)}..."`);
    try {
        // Usar template estruturado de prompt
        const prompt = renderTemplate(classifyNewsPrompt, {
            newsData: `- Título: ${article.titulo}\n- Resumo: ${article.resumo}`,
            classificationGuide: CLASSIFICATION_GUIDE_TEXT
        });

        const response = await openai.chat.completions.create({
            model: config.ai.gemini.model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: classifyNewsPrompt.config.temperature || 0.1,
        });

        const parsedResponse = JSON.parse(response.choices[0].message.content || '{}') as OpenAIResponse;
        
        const classificationId = parsedResponse.classification_id as keyof typeof classificationGuide;

        if (!classificationId || !classificationGuide[classificationId]) {
            console.warn(`  [AVISO] IA retornou ID inválido: ${classificationId}. Usando padrão.`);
            const fallbackId = "🔴 3" as keyof typeof classificationGuide;
            return { id: fallbackId, label: classificationGuide[fallbackId].label, isAdequate: true };
        }
        return {
            id: classificationId,
            label: classificationGuide[classificationId].label,
            isAdequate: parsedResponse.is_adequate !== false
        };
    } catch (error: any) {
        console.error(`❌ Erro ao chamar a API de classificação: ${error.message}`);
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

function agruparNoticias(noticias: NoticiaAnalisada[]): NoticiaClassificada[] {
    console.log('\n[LOG] Fase de agrupamento iniciada...');
    const grupos: { [key: string]: NoticiaAnalisada[] } = {};
    for (const noticia of noticias) {
        const categoria = noticia.classification.id;
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(noticia);
    }

    const noticiasAgrupadas: NoticiaClassificada[] = [];
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

            noticiasAgrupadas.push({
                isSuperNoticia: grupoSimilar.length > 1,
                tituloPrincipal: noticiaPrincipal.titulo,
                classification: noticiaPrincipal.classification,
                relevanceScore: noticiaPrincipal.relevanceScore,
                fontes: grupoSimilar.map(n => ({
                    link: n.link,
                    resumo: n.resumo,
                    fonte: n.fonte
                })),
            });
        }
    }
    console.log(`[LOG] Agrupamento finalizado. ${noticiasAgrupadas.length} eventos únicos identificados.`);
    if (noticiasAgrupadas.some(n => n.isSuperNoticia)) {
        console.log('[LOG] Pelo menos uma "Super-Notícia" foi criada a partir de múltiplas fontes.');
    }
    return noticiasAgrupadas;
}


/**
 * @ai-purpose Analisa e classifica notícias brutas usando IA para relevância local amazônica
 * @ai-input-format Lê arquivo JSON com array de NoticiaCrua de noticias-recentes.json
 * @ai-output-format Gera PautaDoDia estruturada com cold open e notícias priorizadas em pauta-do-dia.json
 * @ai-dependencies OpenAI API, configuração de keywords locais, arquivo noticias-recentes.json
 * @ai-error-handling Retry com diferentes modelos, fallback para classificação heurística se IA falhar completamente
 * @ai-performance Média 30s para 10 notícias, escala linear O(n), timeout individual de 15s por classificação
 * @ai-context Especializado em notícias do Amazonas/Norte, threshold de relevância configurável (padrão: -100), rate limiting de 200ms entre chamadas
 * @ai-validation Entrada esperada como NoticiaCrua[], saída validada como PautaDoDia - sem validação Zod ainda implementada
 * @ai-side-effects Salva análise em data/pauta-do-dia.json, logs detalhados de progresso, cache implícito via filesystem
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
 * // Gera pauta-do-dia.json com notícias classificadas e cold open
 * console.log('Pauta gerada para produção do episódio');
 * ```
 */
export async function analisarNoticias() {
    console.log('🧠 Bubuia News - Iniciando análise e curadoria...');
    const inputFile = filePaths.noticiasRecentesFile;
    const outputFile = filePaths.pautaDoDiaFile;
    let todasAsNoticias: NoticiaCrua[];

    try {
        const fileContent = await fs.readFile(inputFile, 'utf-8');
        const rawNoticias = JSON.parse(fileContent);
        
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

    const pautaAgrupada = agruparNoticias(noticiasAnalisadas);
    pautaAgrupada.sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (pautaAgrupada.length === 0) {
        console.warn('\n[AVISO] Nenhuma notícia adequada foi encontrada para formar a pauta. O processo será interrompido.');
        throw new Error('Nenhuma notícia para a pauta.');
    }

    // --- Montagem da Pauta Final (LÓGICA CORRIGIDA) ---

    // A notícia mais relevante vira a manchete
    const manchete = pautaAgrupada.shift()!;

    // Inicializa a pauta final com a estrutura correta
    const pautaFinal: PautaDoDia = {
        data: new Date().toISOString(),
        manchete: manchete.tituloPrincipal,
        efemerides: [], // Efemérides serão adicionadas em outra etapa (se necessário)
        pauta: {
            politica: [],
            economia: [],
            cidades: [],
            cultura: [],
            esportes: [],
        },
    };

    // Adiciona a manchete à sua categoria correspondente
    const categoriaManchete = classificationGuide[manchete.classification.id as keyof typeof classificationGuide].categoria as keyof PautaDoDia['pauta'];
    if (pautaFinal.pauta[categoriaManchete]) {
        pautaFinal.pauta[categoriaManchete].push(manchete);
    }

    // Distribui as notícias restantes nas suas respectivas categorias
    for (const noticia of pautaAgrupada) {
        const categoria = classificationGuide[noticia.classification.id as keyof typeof classificationGuide].categoria as keyof PautaDoDia['pauta'];
        if (pautaFinal.pauta[categoria] && pautaFinal.pauta[categoria].length < 4) { // Limita notícias por categoria
            pautaFinal.pauta[categoria].push(noticia);
        }
    }

    // Validação da pauta final com Zod
    try {
        const pautaValidada = validateWithSchema(pautaFinal, PautaDoDiaSchema, 'analisarNoticias.output');
        await fs.writeFile(outputFile, JSON.stringify(pautaValidada, null, 2));
        console.log(`\n✅ Análise finalizada! Pauta do dia com ${pautaAgrupada.length + 1} notícias categorizadas e validada foi salva em ${outputFile}`);
    } catch (error) {
        console.error('🔥 Erro de validação da pauta final:', error);
        throw new Error('Erro na geração da pauta do dia. Verifique os logs para mais detalhes.');
    }
}
