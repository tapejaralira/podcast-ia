// noticias/buscarNoticias.js - VERSÃO CORRIGIDA
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'; // Importa a função necessária

// --- Lógica para descobrir o caminho absoluto do diretório atual ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ----------------------------------------------------------------

// --- Constantes de Configuração (agora usando caminhos absolutos) ---
const COLLECTORS_DIR = path.join(__dirname, 'collectors');
const OUTPUT_FILE = path.join(__dirname, 'data', 'noticias-recentes.json');
// ----------------------------------------------------------------

/**
 * Função principal para orquestrar a busca de notícias de todas as fontes.
 */
async function buscarNoticias() {
  console.log('🤖 Bubuia News - Iniciando busca por notícias...');
  const todosOsArtigos = [];
  const linksProcessados = new Set(); 

  try {
    const collectorFiles = await fs.readdir(COLLECTORS_DIR);

    const coletoresPromises = collectorFiles
      .filter(file => file.endsWith('.js'))
      .map(file => {
        // O caminho para o coletor agora é absoluto e sempre correto
        const fullPath = path.join(COLLECTORS_DIR, file);
        return import(fullPath);
      });

    const resultados = await Promise.allSettled(coletoresPromises);

    for (const resultado of resultados) {
      if (resultado.status === 'fulfilled' && resultado.value.default) {
        const coletor = resultado.value.default;
        try {
          console.log(`Buscando em: ${coletor.sourceName}...`);
          const artigos = await coletor.fetch();
          
          for (const artigo of artigos) {
            if (artigo && artigo.link && !linksProcessados.has(artigo.link)) {
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
    
    // Garante que o diretório de saída exista dentro da pasta /noticias
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(todosOsArtigos, null, 2));

    console.log(`\n✅ Coleta finalizada! ${todosOsArtigos.length} artigos únicos salvos em ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('🔥 Ocorreu um erro geral no processo de busca:', error);
  }
}

buscarNoticias();