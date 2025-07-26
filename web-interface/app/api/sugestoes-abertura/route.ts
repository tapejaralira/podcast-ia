/**
 * @ai-purpose Endpoint para carregar sugestões de abertura do podcast
 * @ai-input-format GET request
 * @ai-output-format JSON com ganchos e efemérides disponíveis
 * @ai-dependencies File system, JSON parsing
 * @ai-error-handling File not found, parse errors
 * @ai-performance File read caching
 * @ai-validation JSON schema validation
 * @ai-common-errors "File not found", "Invalid JSON", "Missing fields"
 * @ai-debugging File path validation, JSON structure
 * @ai-business-impact Fornece dados para seleção editorial
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUGESTOES_ABERTURA_PATH = path.join(process.cwd(), '..', 'data', 'sugestoes-abertura.json');

export async function GET() {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(SUGESTOES_ABERTURA_PATH)) {
      return NextResponse.json(
        { error: 'Arquivo de sugestões de abertura não encontrado' },
        { status: 404 }
      );
    }

    // Ler e parsear o arquivo
    const fileContent = fs.readFileSync(SUGESTOES_ABERTURA_PATH, 'utf-8');
    const sugestoesAbertura = JSON.parse(fileContent);

    // Validação básica da estrutura
    if (!sugestoesAbertura.opcoesEfemerides || !sugestoesAbertura.efemeride) {
      return NextResponse.json(
        { error: 'Estrutura inválida no arquivo de sugestões' },
        { status: 400 }
      );
    }

    return NextResponse.json(sugestoesAbertura);
  } catch (error) {
    console.error('Erro ao carregar sugestões de abertura:', error);
    
    // Verificar tipo específico de erro
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erro ao parsear JSON das sugestões' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
