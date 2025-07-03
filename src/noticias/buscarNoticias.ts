// src/noticias/buscarNoticias.ts
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import { config } from '../config.js';
import { Noticia } from '../types.js';

// Define a interface para um módulo coletor
interface CollectorModule {
    default: {
        sourceName: string;
        fetch: (options: { startTime: Date }) => Promise<Noticia[]>;
    };
}

export async function buscarNoticias() {
    console.log('🤖 Bubuia News - Iniciando busca por notícias...');
    
    const estadoFile = path.join(config.paths.data, 'estado_coleta.json');
    let startTime: Date;

    try {
        const estadoContent = await fs.readFile(estadoFile, 'utf-8');
        const estado = JSON.parse(estadoContent);
        if (estado.ultimaColeta) {
            startTime = new Date(estado.ultimaColeta);
            console.log(`Última coleta registrada em: ${startTime.toLocaleString('pt-BR')}. Buscando notícias desde então.`);
        } else {
            throw new Error('Formato de estado inválido');
        }
    } catch (error) {
        console.log('Nenhum registro de coleta anterior válido. Buscando notícias das últimas 48 horas.');
        startTime = new Date();
        startTime.setHours(startTime.getHours() - 48);
    }

    const todosOsArtigos: Noticia[] = [];
    const linksProcessados = new Set<string>();
    const runStartTime = new Date();
    const collectorsDir = path.join(__dirname, 'collectors'); // O __dirname ainda é relativo ao arquivo JS transpilado

    try {
        const collectorFiles = await fs.readdir(collectorsDir);
        const coletoresPromises = collectorFiles
            .filter(file => file.endsWith('.js')) // Os coletores ainda serão .js após a transpilação
            .map(file => {
                const fullPath = path.join(collectorsDir, file);
                // A importação dinâmica continua a mesma, pois o Node.js a executará
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
        
        const outputFile = path.join(config.paths.data, 'noticias-recentes.json');
        await fs.mkdir(path.dirname(outputFile), { recursive: true });
        await fs.writeFile(outputFile, JSON.stringify(todosOsArtigos, null, 2));
        
        await fs.writeFile(estadoFile, JSON.stringify({ ultimaColeta: runStartTime.toISOString() }, null, 2));

        console.log(`
✅ Coleta finalizada! ${todosOsArtigos.length} artigos únicos salvos em ${outputFile}`);
        console.log(`Data da última coleta atualizada para: ${runStartTime.toLocaleString('pt-BR')}`);

    } catch (error) {
        console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
    }
}
