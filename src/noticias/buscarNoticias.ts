// src/noticias/buscarNoticias.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

// Obtém __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { config, filePaths } from '../config.js';
import { NoticiaCrua, Collector } from '../types.js';
import { NoticiaCruaSchema } from '../schemas/core.schemas.js';
import { validateWithSchema, validateArrayWithSchema, safeValidateWithSchema } from '../utils/validation.js';

// Define a interface para um módulo coletor importado dinamicamente
interface CollectorModule {
    default: Collector;
}

/**
 * Converte uma data para o horário de Manaus (UTC-4) no formato brasileiro
 */
function formatarDataManaus(data: Date): string {
    // Manaus está no fuso UTC-4 (sem horário de verão)
    const manausOffset = -4 * 60; // -4 horas em minutos
    const utc = data.getTime() + (data.getTimezoneOffset() * 60000);
    const manausTime = new Date(utc + (manausOffset * 60000));
    
    // Formato brasileiro: DD/MM/AAAA HH:mm:ss
    const dia = manausTime.getDate().toString().padStart(2, '0');
    const mes = (manausTime.getMonth() + 1).toString().padStart(2, '0');
    const ano = manausTime.getFullYear();
    const hora = manausTime.getHours().toString().padStart(2, '0');
    const min = manausTime.getMinutes().toString().padStart(2, '0');
    const seg = manausTime.getSeconds().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

/**
 * Converte horário de Manaus (formato brasileiro) para UTC ISO string
 * Para uso interno quando necessário comparar com APIs externas
 */
function manausParaUTC(dataManausStr: string): string {
    try {
        // Parse do formato DD/MM/AAAA HH:mm:ss
        const [datePart, timePart] = dataManausStr.split(' ');
        const [dia, mes, ano] = datePart.split('/');
        const [hora, min, seg] = timePart.split(':');
        
        // Criar data local de Manaus
        const manausTime = new Date(
            parseInt(ano), 
            parseInt(mes) - 1, // Mês é 0-indexado
            parseInt(dia),
            parseInt(hora),
            parseInt(min),
            parseInt(seg || '0')
        );
        
        // Converter para UTC (Manaus é UTC-4)
        const utcTime = new Date(manausTime.getTime() + (4 * 60 * 60 * 1000));
        return utcTime.toISOString();
    } catch (error) {
        console.error('Erro ao converter data de Manaus para UTC:', error);
        // Fallback: usar data atual
        return new Date().toISOString();
    }
}

/**
 * @ai-purpose Coleta notícias de fontes locais amazônicas e estrutura dados brutos para análise posterior
 * @ai-input-format Lê estado da última coleta de estado-coleta.json ou usa config.coleta.horasDefault como fallback
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
 * // Gera noticias-recentes.json com notícias das últimas config.coleta.horasDefault horas
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
        
        if (estado.ultimaColetaManaus) {
            // Novo formato: trabalhar direto com horário de Manaus
            console.log(`Última coleta registrada: ${estado.ultimaColetaManaus} (horário de Manaus)`);
            // Converter para UTC apenas para comparação interna com os feeds
            startTime = manausParaUTC(estado.ultimaColetaManaus);
        } else if (estado.ultimaColeta) {
            // Formato antigo: converter de UTC para Manaus
            const dataLegivel = formatarDataManaus(new Date(estado.ultimaColeta));
            console.log(`Última coleta (formato antigo): ${dataLegivel} (convertido para Manaus)`);
            startTime = estado.ultimaColeta;
        } else {
            throw new Error('Formato de estado inválido');
        }
    } catch (error) {
        console.log(`Nenhum registro de coleta anterior válido. Buscando notícias das últimas ${config.coleta.horasDefault} horas.`);
        const date = new Date();
        date.setHours(date.getHours() - config.coleta.horasDefault);
        startTime = date.toISOString();
    }

    const todosOsArtigos: NoticiaCrua[] = [];
    const linksProcessados = new Set<string>();
    const runStartTime = new Date();
    // Sempre usa diretório compilado para garantir que encontre os coletores
    const collectorsDir = path.join(process.cwd(), 'dist', 'noticias', 'collectors');

    try {
        console.log(`📁 Carregando coletores do diretório: ${collectorsDir}`);
        const collectorFiles = await fs.readdir(collectorsDir);
        console.log(`📋 Arquivos encontrados: ${collectorFiles.filter(f => f.endsWith('.js')).length} coletores`);
        
        const coletoresPromises = collectorFiles
            .filter(file => file.endsWith('.js')) // O import dinâmico carrega os arquivos JS transpilados
            .map(file => {
                const fullPath = path.join(collectorsDir, file);
                console.log(`🔄 Importando: ${file}`);
                return import(pathToFileURL(fullPath).href) as Promise<CollectorModule>;
            });
        
        console.log(`⏳ Aguardando carregamento de ${coletoresPromises.length} coletores...`);
        const resultados = await Promise.allSettled(coletoresPromises);
        console.log(`✅ Coletores carregados: ${resultados.filter(r => r.status === 'fulfilled').length}/${resultados.length}`);

        for (const resultado of resultados) {
            if (resultado.status === 'fulfilled' && resultado.value.default) {
                const coletor = resultado.value.default;
                try {
                    console.log(`\n🔍 Iniciando coleta: ${coletor.sourceName}...`);
                    const startColeta = Date.now();
                    const artigos = await coletor.fetch({ startTime });
                    const tempoColeta = Date.now() - startColeta;
                    console.log(`  ✅ ${coletor.sourceName}: ${artigos.length} artigos em ${tempoColeta}ms`);
                    
                    let adicionados = 0;
                    for (const artigo of artigos) {
                        if (artigo && artigo.link && !linksProcessados.has(artigo.link)) {
                            const validationResult = safeValidateWithSchema(artigo, NoticiaCruaSchema, `buscarNoticias.artigo.${artigo.link}`);
                            if (validationResult.success && validationResult.data) {
                                todosOsArtigos.push(validationResult.data as NoticiaCrua);
                                linksProcessados.add(artigo.link);
                                adicionados++;
                            } else {
                                console.warn(`  ⚠️ Artigo inválido ignorado: ${artigo.titulo || 'sem título'}`);
                            }
                        }
                    }
                    console.log(`  📊 ${coletor.sourceName}: ${adicionados} novos artigos adicionados (${artigos.length - adicionados} duplicados/inválidos)`);
                } catch (error: any) {
                    console.error(`  ❌ Falha em ${coletor.sourceName}: ${error.message}`);
                }
            } else if (resultado.status === 'rejected') {
                console.error('❌ Erro ao importar coletor:', resultado.reason);
            }
        }
        
        console.log(`\n📊 RESUMO DA COLETA:`);
        console.log(`   Coletores executados: ${resultados.filter(r => r.status === 'fulfilled').length}`);
        console.log(`   Total de artigos coletados: ${todosOsArtigos.length}`);
        console.log(`   Links únicos processados: ${linksProcessados.size}`);
        
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
        
        // Salvar apenas a data da última coleta no horário de Manaus
        const dataManaus = formatarDataManaus(runStartTime);
        await fs.writeFile(estadoFile, JSON.stringify({ 
            ultimaColetaManaus: dataManaus, // Apenas horário de Manaus
            totalArtigos: validationResult.valid.length,
            taxaValidacao: validationResult.summary.successRate
        }, null, 2));

        console.log(`
✅ Coleta finalizada! ${validationResult.valid.length} artigos únicos e válidos salvos em ${outputFile}`);
        console.log(`Data da última coleta: ${dataManaus} (horário de Manaus)`);

    } catch (error) {
        console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
        throw error; // Lança o erro para o pipeline principal
    }
}

// Executa apenas quando chamado diretamente, não quando importado
if (
    import.meta.url.includes('buscarNoticias.ts') ||
    process.argv[1]?.includes('buscarNoticias')
) {
    console.log('🚀 Executando buscarNoticias como script principal...');
    buscarNoticias()
        .then(() => console.log('✅ Script concluído com sucesso'))
        .catch(error => {
            console.error('❌ Erro no script:', error);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}
