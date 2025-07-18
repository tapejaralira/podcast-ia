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
    // Caminho para o arquivo de notícias categorizadas no projeto principal
    const backendPath = path.resolve(process.cwd(), '..', 'data', 'noticias-categorizadas.json');
    
    let dados;
    
    try {
      const fileContent = await fs.readFile(backendPath, 'utf-8');
      dados = JSON.parse(fileContent);
    } catch {
      // Se não encontrar arquivo novo, tenta arquivo antigo para compatibilidade
      const pastaPath = path.resolve(process.cwd(), '..', 'data');
      const files = await fs.readdir(pastaPath);
      
      // Procura por arquivos de pauta
      const pautaFile = files.find(f => f.startsWith('pauta-') && f.endsWith('.json'));
      
      if (pautaFile) {
        const pautaPath = path.join(pastaPath, pautaFile);
        const pautaContent = await fs.readFile(pautaPath, 'utf-8');
        const dadosAntigos = JSON.parse(pautaContent);
        
        // Converte formato antigo para novo
        dados = converterFormatoAntigo(dadosAntigos);
        
        if (!dados) {
          throw new Error('Erro na conversão de formato antigo');
        }
      } else {
        throw new Error('Nenhum arquivo de notícias encontrado');
      }
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
    console.error('Erro ao carregar notícias:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao carregar notícias', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
