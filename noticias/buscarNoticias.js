// noticias/buscarNoticias.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos ajustados para a nova estrutura de pastas
const COLLECTORS_DIR = path.join(__dirname, 'collectors');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'noticias-recentes.json');
const ESTADO_FILE = path.join(__dirname, '..', 'data', 'estado_coleta.json'); 

async function buscarNoticias() {
    console.log('🤖 Bubuia News - Iniciando busca por notícias...');
    let startTime;
    try {
        const estadoContent = await fs.readFile(ESTADO_FILE, 'utf-8');
        const estado = JSON.parse(estadoContent);
        if (estado.ultimaColeta) {
            startTime = new Date(estado.ultimaColeta);
            console.log(`Última coleta registrada em: ${startTime.toLocaleString('pt-BR')}. Buscando notícias desde então.`);
        }
    } catch (error) {
        console.log('Nenhum registro de coleta anterior encontrado. Buscando notícias das últimas 48 horas.');
        startTime = new Date();
        startTime.setHours(startTime.getHours() - 48);
    }

    const todosOsArtigos = [];
    const linksProcessados = new Set();
    const runStartTime = new Date();

    try {
        const collectorFiles = await fs.readdir(COLLECTORS_DIR);
        const coletoresPromises = collectorFiles
            .filter(file => file.endsWith('.js'))
            .map(file => {
                const fullPath = path.join(COLLECTORS_DIR, file);
                return import(pathToFileURL(fullPath).href);
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
                            delete artigo.id;
                            todosOsArtigos.push(artigo);
                            linksProcessados.add(artigo.link);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Falha ao processar a fonte ${coletor.sourceName}:`, error.message);
                }
            } else if (resultado.status === 'rejected') {
                console.error('❌ Erro ao importar um módulo coletor:', resultado.reason);
            }
        }
        
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(todosOsArtigos, null, 2));
        
        await fs.writeFile(ESTADO_FILE, JSON.stringify({ ultimaColeta: runStartTime.toISOString() }, null, 2));

        console.log(`\n✅ Coleta finalizada! ${todosOsArtigos.length} artigos únicos salvos em ${OUTPUT_FILE}`);
        console.log(`Data da última coleta atualizada para: ${runStartTime.toLocaleString('pt-BR')}`);

    } catch (error) {
        console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
    }
}

buscarNoticias();
