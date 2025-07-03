// src/noticias/analisarNoticias.ts
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import 'dotenv/config';

import { config } from '../config.js';
import {
    Noticia,
    NoticiaAgrupada,
    NoticiaClassificada,
    PautaDoDia,
    Classification
} from '../types.js';

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { relevanceKeywords, sourceWeights, classificationGuide } = config.analise;

const CLASSIFICATION_GUIDE_TEXT = Object.entries(classificationGuide)
    .map(([key, value]) => `* **${key}**: ${value}`)
    .join('\n');

// --- Tipos Específicos ---
interface OpenAIResponse {
    classification_id: string;
    is_adequate: boolean;
}

interface NoticiaAnalisada extends Noticia {
    relevanceScore: number;
    classification: Classification;
}

// --- Funções Principais ---

async function chamarIAparaClassificar(article: Noticia): Promise<Classification> {
    console.log(`  -> Classificando com OpenAI: "${article.titulo_principal.substring(0, 40)}..."`);
    try {
        const prompt = `
      Você é o editor-chefe do podcast "Bubuia News" de Manaus. Sua tarefa é analisar e classificar uma notícia com um rigoroso controle de qualidade.

      ### Guia de Curadoria Editorial (REGRAS DE EXCLUSÃO)
      - **REGRA 1: SEM CONTEÚDO VISUAL.** Se o título ou resumo contiver expressões como "veja fotos", "assista ao vídeo", "galeria de imagens", ou a palavra "VÍDEO", o conteúdo é INADEQUADO.
      - **REGRA 2: SEM AUTOPROMOÇÃO.** Se o conteúdo for sobre o próprio telejornal (ex: "Jornal do Amazonas de hoje"), é INADEQUADO.
      - **REGRA 3: SEM CONTEÚDO SENSÍVEL/POLÊMICO.** Evite tópicos que não se alinhem com o tom leve e familiar do programa. Se a notícia for inadequada para um ambiente familiar, é INADEQUADA.

      ### TAREFA
      Analise o artigo abaixo e retorne um objeto JSON com DUAS chaves:
      1.  \`classification_id\`: A string do ID da categoria do guia que melhor se encaixa (ex: "🚀 4").
      2.  \`is_adequate\`: Um booleano (true se for adequado, false caso contrário).

      #### Guia de Classificação de Conteúdo
      ${CLASSIFICATION_GUIDE_TEXT}

      #### Artigo para Análise
      - Título: ${article.titulo_principal}
      - Resumo: ${article.resumo}

      Responda APENAS com o objeto JSON.
    `;

        const response = await openai.chat.completions.create({
            model: config.models.analise,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const parsedResponse = JSON.parse(response.choices[0].message.content || '{}') as OpenAIResponse;
        
        const classificationId = parsedResponse.classification_id as keyof typeof classificationGuide;

        if (!classificationId || !classificationGuide[classificationId]) {
            console.warn(`  [AVISO] IA retornou ID inválido: ${classificationId}. Usando padrão.`);
            const fallbackId = "🔴 3" as keyof typeof classificationGuide;
            return { id: fallbackId, label: classificationGuide[fallbackId], isAdequate: true };
        }
        return {
            id: classificationId,
            label: classificationGuide[classificationId],
            isAdequate: parsedResponse.is_adequate !== false
        };
    } catch (error: any) {
        console.error(`❌ Erro ao chamar a API da OpenAI: ${error.message}`);
        const fallbackId = "🔴 3" as keyof typeof classificationGuide;
        return { id: fallbackId, label: classificationGuide[fallbackId], isAdequate: true }; // Fallback seguro
    }
}

function calcularRelevanceScore(article: Noticia, classification: Classification): number {
    if (!classification.isAdequate) return -100;
    
    let score = 0;
    const title = article.titulo_principal.toLowerCase();
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

function agruparNoticias(noticias: NoticiaAnalisada[]): NoticiaAgrupada[] {
    console.log('\n[LOG] Fase de agrupamento iniciada...');
    const grupos: { [key: string]: NoticiaAnalisada[] } = {};
    for (const noticia of noticias) {
        const categoria = noticia.classification.id;
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(noticia);
    }

    const noticiasAgrupadas: NoticiaAgrupada[] = [];
    const processados = new Set<string>();

    for (const categoria in grupos) {
        const grupoCategoria = grupos[categoria];
        while (grupoCategoria.length > 0) {
            const noticiaBase = grupoCategoria.shift()!;
            if (processados.has(noticiaBase.link)) continue;

            const grupoSimilar = [noticiaBase];
            const palavrasBase = new Set(noticiaBase.titulo_principal.toLowerCase().split(' ').filter(p => p.length > 3));

            for (let i = grupoCategoria.length - 1; i >= 0; i--) {
                const noticiaComparar = grupoCategoria[i];
                const palavrasComparar = new Set(noticiaComparar.titulo_principal.toLowerCase().split(' '));
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
                titulo_principal: noticiaPrincipal.titulo_principal,
                classification: noticiaPrincipal.classification,
                relevanceScore: noticiaPrincipal.relevanceScore,
                fontes: grupoSimilar.map(n => ({
                    link: n.link,
                    resumo: n.resumo,
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


export async function analisarNoticias() {
    console.log('🧠 Bubuia News - Iniciando análise e curadoria...');
    const inputFile = path.join(config.paths.data, 'noticias-recentes.json');
    const outputFile = path.join(config.paths.data, 'episodio-do-dia.json');
    let todasAsNoticias: Noticia[];

    try {
        const fileContent = await fs.readFile(inputFile, 'utf-8');
        todasAsNoticias = JSON.parse(fileContent);
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de notícias: ${inputFile}. Execute o 'buscarNoticias.ts' primeiro.`);
        return;
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
    pautaAgrupada.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const pautaRestante = pautaAgrupada;

    const noticiasPrincipais: NoticiaClassificada[] = [];
    const categoriasUsadas = new Set<string>();

    for (const noticia of pautaRestante) {
        if (noticiasPrincipais.length >= 4) break;
        if (!categoriasUsadas.has(noticia.classification.id)) {
            noticiasPrincipais.push(noticia as NoticiaClassificada);
            categoriasUsadas.add(noticia.classification.id);
        }
    }
    
    if (noticiasPrincipais.length < 4) {
        for (const noticia of pautaRestante) {
            if (noticiasPrincipais.length >= 4) break;
            if (!noticiasPrincipais.some(n => n.titulo_principal === noticia.titulo_principal)) {
                noticiasPrincipais.push(noticia as NoticiaClassificada);
            }
        }
    }

    console.log(`[LOG] Selecionadas ${noticiasPrincipais.length} notícias para o bloco principal.`);

    if (noticiasPrincipais.length === 0) {
        console.error('🔥 Nenhuma notícia principal foi selecionada. Encerrando a análise.');
        // Cria um arquivo de pauta vazio para não quebrar o pipeline
        const pautaVazia: PautaDoDia = { 
            data: new Date().toISOString(), 
            coldOpen: null as any, // O ideal seria ter um tipo que permita nulo
            noticiasPrincipais: [], 
            outrasNoticias: [] 
        };
        await fs.writeFile(outputFile, JSON.stringify(pautaVazia, null, 2));
        return;
    }

    // A notícia mais relevante vira o Cold Open, o resto vai para o bloco principal
    const coldOpenNoticia = noticiasPrincipais[0];
    const blocoPrincipalNoticias = noticiasPrincipais.slice(1);

    const pautaJSON: PautaDoDia = {
        data: new Date().toISOString(),
        coldOpen: coldOpenNoticia,
        noticiasPrincipais: blocoPrincipalNoticias,
        outrasNoticias: [], // O script original não populava isso, mantendo consistência
    };

    await fs.writeFile(outputFile, JSON.stringify(pautaJSON, null, 2));

    console.log('\n✅ Curadoria finalizada!');
    console.log('\n  🎙️  Cold Open:');
    console.log(`    - [${pautaJSON.coldOpen.classification.id}] ${pautaJSON.coldOpen.titulo_principal} (Score: ${pautaJSON.coldOpen.relevanceScore})`);
    console.log('\n  📰 Notícias Principais:');
    pautaJSON.noticiasPrincipais.forEach((n, index) => {
        console.log(`    ${index + 1}. [${n.classification.id}] ${n.titulo_principal} (Score: ${n.relevanceScore})`);
    });
    console.log(`\nArquivo de pauta salvo em: ${outputFile}`);
}
