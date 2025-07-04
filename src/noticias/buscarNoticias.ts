// src/noticias/buscarNoticias.ts
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import { config } from '../config.js';
import { NoticiaCrua, Collector } from '../types.js';

// Define a interface para um módulo coletor importado dinamicamente
interface CollectorModule {
    default: Collector;
}

export async function buscarNoticias() {
    console.log('🤖 Bubuia News - Iniciando busca por notícias...');
    
    const estadoFile = config.paths.estadoColetaFile;
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
                            todosOsArtigos.push(artigo);
                            linksProcessados.add(artigo.link);
                        }
                    }
                } catch (error: any) {
                    console.error(`❌ Falha ao processar a fonte ${coletor.sourceName}:`, error.message);
                }
            } else if (resultado.status === 'rejected') {
                console.error('❌ Erro ao importar um módulo coletor:', resultado.reason);
            }
        }
        
        const outputFile = config.paths.noticiasRecentesFile;
        await fs.mkdir(path.dirname(outputFile), { recursive: true });
        await fs.writeFile(outputFile, JSON.stringify(todosOsArtigos, null, 2));
        
        await fs.writeFile(estadoFile, JSON.stringify({ ultimaColeta: runStartTime.toISOString() }, null, 2));

        console.log(`
✅ Coleta finalizada! ${todosOsArtigos.length} artigos únicos salvos em ${outputFile}`);
        console.log(`Data da última coleta atualizada para: ${runStartTime.toLocaleString('pt-BR')}`);

    } catch (error) {
        console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
        throw error; // Lança o erro para o pipeline principal
    }
}
