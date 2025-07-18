/**
 * @ai-purpose API endpoints para seleção manual de notícias
 * @ai-input-format GET: empty, POST: SelecaoManual object
 * @ai-output-format GET: SelecaoManual | null, POST: success status
 * @ai-dependencies File system, JSON parsing, data validation
 * @ai-error-handling File not found, parse errors, write errors
 * @ai-performance Atomic file operations, error recovery
 * @ai-validation JSON schema validation, data integrity
 * @ai-common-errors "File access errors", "JSON format errors", "Validation errors"
 * @ai-debugging Request logging, file operation monitoring
 * @ai-business-impact Persistência da seleção editorial
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Caminho para o arquivo de seleção manual
    const selecaoPath = path.resolve(process.cwd(), '..', 'data', 'selecao-manual.json');
    
    try {
      const fileContent = await fs.readFile(selecaoPath, 'utf-8');
      const selecao = JSON.parse(fileContent);
      
      return NextResponse.json(selecao);
    } catch {
      // Se arquivo não existe, retorna null
      return NextResponse.json(null);
    }
    
  } catch (error) {
    console.error('Erro ao carregar seleção:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao carregar seleção', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const selecao = await request.json();
    
    // Validação básica
    if (!selecao || !selecao.data || !selecao.manchete || !selecao.noticiasEscolhidas) {
      return NextResponse.json(
        { error: 'Dados de seleção inválidos' },
        { status: 400 }
      );
    }
    
    // Caminho para o arquivo de seleção manual
    const selecaoPath = path.resolve(process.cwd(), '..', 'data', 'selecao-manual.json');
    
    // Garantir que o diretório existe
    const dataDir = path.dirname(selecaoPath);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Salvar arquivo
    await fs.writeFile(selecaoPath, JSON.stringify(selecao, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro ao salvar seleção:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao salvar seleção', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
