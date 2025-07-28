/**
 * @ai-purpose API endpoint para carregar sugestões de abertura do podcast
 * @ai-input-format HTTP GET request
 * @ai-output-format JSON com sugestões de efemérides
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Caminho para o arquivo de sugestões de abertura
    const sugestoesPath = path.join(process.cwd(), '..', 'data', 'sugestoes-abertura.json');
    
    try {
      const content = await fs.readFile(sugestoesPath, 'utf-8');
      const data = JSON.parse(content);
      
      // Transformar dados para o formato esperado pela interface
      const response = {
        data: new Date().toISOString().split('T')[0],
        opcoesEfemerides: data.opcoesEfemerides || {
          fatosBrasileiros: data.fatosBrasileiros || [],
          efemeridesIA: data.efemeridesIA || [],
          curiosidadesAmazonicas: data.curiosidadesAmazonicas || [],
          recomendacao: data.recomendacao || null
        }
      };
      
      return NextResponse.json(response);
    } catch (fileError) {
      console.error('Arquivo de sugestões não encontrado:', fileError);
      
      // Retorna estrutura vazia se arquivo não existir
      const fallback = {
        data: new Date().toISOString().split('T')[0],
        opcoesEfemerides: {
          fatosBrasileiros: [],
          efemeridesIA: [],
          curiosidadesAmazonicas: [],
          recomendacao: null
        }
      };
      
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error('Erro ao carregar sugestões de abertura:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
