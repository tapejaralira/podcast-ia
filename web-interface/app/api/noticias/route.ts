/**
 * @ai-purpose API endpoint para carregar notícias categorizadas
 * @ai-input-format HTTP GET request
 * @ai-output-format JSON com dados das notícias categorizadas
 * @ai-dependencies File system, JSON parsing, data conversion
 * @ai-error-handling File not found, parse errors, validation errors
 * @ai-performance File caching, minimal data processing
 * @ai-validation Data format validation, fallback handling
 * @ai-common-errors "File not found", "Invalid JSON", "Data format errors"
 * @ai-debugging Request logging, file path validation
 * @ai-business-impact Core data loading para interface
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { converterFormatoAntigo } from '../../../lib/api';

export async function GET() {
  try {
    // Caminho para o arquivo de notícias categorizadas
    const backendPath = path.resolve(process.cwd(), '..', 'data', 'noticias-categorizadas.json');
    console.log('📂 Tentando carregar arquivo:', backendPath);
    
    let dados;
    
    try {
      const fileContent = await fs.readFile(backendPath, 'utf-8');
      dados = JSON.parse(fileContent);
      
      // Distribuir notícias nas categorias
      if (dados.rankingGeral && Array.isArray(dados.rankingGeral)) {
        const categorias = {
          politica: [],
          economia: [],
          cidades: [],
          cultura: [],
          esportes: [],
          geral: []
        };
        
        // Distribuir cada notícia em sua categoria
        dados.rankingGeral.forEach(noticia => {
          const categoria = noticia.categoria.toLowerCase();
          if (categorias[categoria]) {
            categorias[categoria].push(noticia);
          } else {
            categorias.geral.push(noticia);
          }
        });
        
        // Atualizar as categorias no objeto de dados
        dados.categorias = categorias;
      }
      
      // Log detalhado do conteúdo
      console.log('📊 Conteúdo do arquivo:', {
        path: backendPath,
        rankingGeral: dados.rankingGeral?.length || 0,
        categorias: Object.entries(dados.categorias || {}).reduce((acc, [cat, noticias]) => {
          const length = Array.isArray(noticias) ? noticias.length : 0;
          console.log(`   - ${cat}: ${length} notícias`);
          acc[cat] = length;
          return acc;
        }, {} as Record<string, number>),
        metadados: dados.metadados || {},
        totalNoticias: Object.values(dados.categorias || {}).reduce((total, noticias) => 
          total + (Array.isArray(noticias) ? noticias.length : 0), 0
        )
      });

    } catch (error) {
      console.error('❌ Erro ao carregar arquivo:', error);
      throw new Error('Não foi possível carregar o arquivo de notícias');
    }
    
    // Validação básica dos dados
    if (!dados || typeof dados !== 'object') {
      throw new Error('Dados inválidos carregados');
    }
    
    // Headers para evitar cache em desenvolvimento
    const headers = {
      'Cache-Control': process.env.NODE_ENV === 'development' ? 'no-cache' : 'public, max-age=300',
    };
    
    return NextResponse.json(dados, { headers });
    
  } catch (error) {
    console.error('❌ Erro ao carregar notícias:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao carregar notícias', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
