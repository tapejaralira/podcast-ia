// src/noticias/buscarNoticias.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { config, filePaths } from '../config.js';
import { NoticiaCrua, Collector } from '../types.js';
import { NoticiaCruaSchema } from '../schemas/core.schemas.js';
import { validateWithSchema, validateArrayWithSchema, safeValidateWithSchema } from '../utils/validation.js';

// Define a interface para um módulo coletor importado dinamicamente
interface CollectorModule {
    default: Collector;
}

/**
 * @ai-purpose Coleta notícias de fontes locais amazônicas e estrutura dados brutos para análise posterior
 * @ai-input-format Lê estado da última coleta de estado-coleta.json ou usa 48h como fallback
 * @ai-output-format Array de NoticiaCrua salvo em noticias-recentes.json com metadados completos de extração
 * @ai-dependencies Módulos coletores em src/noticias/collectors/, cheerio para parsing HTML, axios para HTTP
 * @ai-error-handling Retry com backoff exponencial por fonte, skip fontes indisponíveis, continua com fontes funcionais
 * @ai-performance 10-30s dependendo do número de fontes ativas, timeout por fonte: 15s, rate limiting inteligente
 * @ai-context Otimizado para fontes amazônicas (G1 AM, A Crítica, Folha BV), detecta paywall automático, valida qualidade do conteúdo extraído
 * @ai-validation Cada notícia validada contra NoticiaCrua schema (pendente), filtra conteúdo inválido ou duplicado automaticamente
 * @ai-side-effects Atualiza estado-coleta.json com timestamp, cache de notícias para evitar duplicatas via Set de URLs, logs de status de fontes
 * @ai-failure-modes Rate limiting de sites, mudança de estrutura HTML dos sites, sites indisponíveis, paywall inesperado, timeout de rede
 * @ai-monitoring Taxa de sucesso por fonte (target: >80%), tempo de coleta total, qualidade do conteúdo extraído (título não vazio, URL válida)
 * @ai-scaling Máximo 20 fontes simultaneamente, usa Promise.allSettled para resiliência, rate limiting configurável por fonte
 * @ai-business-impact Base do pipeline - qualidade da coleta impacta 100% do sistema downstream, permite automação completa da curadoria
 * @ai-example
 * ```typescript
 * await buscarNoticias();
 * // Gera noticias-recentes.json com notícias das últimas 48h
 * // Atualiza estado-coleta.json para próxima execução
 * console.log('Notícias coletadas e prontas para análise');
 * ```
 */
export async function buscarNoticias() {
    console.log('🤖 Bubuia News - Iniciando busca por notícias...');
    
    const estadoFile = filePaths.estadoColetaFile;
    let startTime: string;

    try {
        const estadoContent = await fs.readFile(estadoFile, 'utf-8');
        const estado = JSON.parse(estadoContent);
        if (estado.ultimaColeta) {
            startTime = new Date(estado.ultimaColeta).toISOString();
            console.log(`Última coleta registrada em: ${new Date(startTime).toLocaleString('pt-BR')}. Buscando notícias desde então.`);
        } else {
            throw new Error('Formato de estado inválido');
        }
    } catch (error) {
        console.log('Nenhum registro de coleta anterior válido. Buscando notícias das últimas 48 horas.');
        const date = new Date();
        date.setHours(date.getHours() - 48);
        startTime = date.toISOString();
    }

    const todosOsArtigos: NoticiaCrua[] = [];
    const linksProcessados = new Set<string>();
    const runStartTime = new Date();
    const collectorsDir = path.join(__dirname, 'collectors');

    try {
        const collectorFiles = await fs.readdir(collectorsDir);
        const coletoresPromises = collectorFiles
            .filter(file => file.endsWith('.js')) // O import dinâmico carrega os arquivos JS transpilados
            .map(file => {
                const fullPath = path.join(collectorsDir, file);
                return import(pathToFileURL(fullPath).href) as Promise<CollectorModule>;
            });
        
        const resultados = await Promise.allSettled(coletoresPromises);

        for (const resultado of resultados) {
            if (resultado.status === 'fulfilled' && resultado.value.default) {
                const coletor = resultado.value.default;
                try {
                    console.log(`Buscando em: ${coletor.sourceName}...`);
                    const artigos = await coletor.fetch({ startTime });
                    console.log(`  -> Encontrados: ${artigos.length} artigos recentes.`);
                    for (const artigo of artigos) {
                        if (artigo && artigo.link && !linksProcessados.has(artigo.link)) {
                            const validationResult = safeValidateWithSchema(artigo, NoticiaCruaSchema, `buscarNoticias.artigo.${artigo.link}`);
                            if (validationResult.success && validationResult.data) {
                                todosOsArtigos.push(validationResult.data as NoticiaCrua);
                                linksProcessados.add(artigo.link);
                            } else {
                                console.warn(`⚠️ Artigo inválido pelo schema, ignorado: ${artigo.link}`, validationResult.error?.message);
                            }
                        }
                    }
                } catch (error: any) {
                    console.error(`❌ Falha ao processar a fonte ${coletor.sourceName}:`, error.message);
                }
            } else if (resultado.status === 'rejected') {
                console.error('❌ Erro ao importar um módulo coletor:', resultado.reason);
            }
        }
        
        // Validação final dos dados coletados
        const validationResult = validateArrayWithSchema(
            todosOsArtigos, 
            NoticiaCruaSchema, 
            'buscarNoticias.output'
        );
        
        console.log(`✅ Validação: ${validationResult.summary.valid}/${validationResult.summary.total} artigos válidos (${(validationResult.summary.successRate * 100).toFixed(1)}%)`);
        
        if (validationResult.invalid.length > 0) {
            console.warn(`⚠️ ${validationResult.invalid.length} artigos inválidos foram ignorados`);
        }
        
        const outputFile = filePaths.noticiasRecentesFile;
        await fs.mkdir(path.dirname(outputFile), { recursive: true });
        await fs.writeFile(outputFile, JSON.stringify(validationResult.valid, null, 2));
        
        await fs.writeFile(estadoFile, JSON.stringify({ 
            ultimaColeta: runStartTime.toISOString(),
            totalArtigos: validationResult.valid.length,
            taxaValidacao: validationResult.summary.successRate
        }, null, 2));

        console.log(`
✅ Coleta finalizada! ${validationResult.valid.length} artigos únicos e válidos salvos em ${outputFile}`);
        console.log(`Data da última coleta atualizada para: ${runStartTime.toLocaleString('pt-BR')}`);

    } catch (error) {
        console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
        throw error; // Lança o erro para o pipeline principal
    }
}
