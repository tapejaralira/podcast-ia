/**
 * @fileoverview Utilitários para validação com Zod schemas
 * @ai-purpose Funções helpers para validação segura e tratamento de erros
 */

import { ZodSchema, ZodError } from 'zod';

/**
 * Resultado de validação segura
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details: Array<{
      path: string;
      message: string;
      code: string;
    }>;
    context: string;
  };
}

/**
 * Valida dados com schema Zod e lança erro em caso de falha
 * @ai-purpose Validação rigorosa com erro detalhado para debugging
 */
export function validateWithSchema<T>(
  data: unknown,
  schema: ZodSchema<T>,
  context: string = 'Validação'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      const errorMessage = `${context} falhou: ${details.map(d => `${d.path}: ${d.message}`).join(', ')}`;
      
      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Valida dados com schema Zod sem lançar exceções
 * @ai-purpose Validação segura para fluxos que podem falhar graciosamente
 */
export function safeValidateWithSchema<T>(
  data: unknown,
  schema: ZodSchema<T>,
  context: string = 'Validação'
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }));
      
      return {
        success: false,
        error: {
          message: `${context} falhou`,
          details,
          context
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: `${context} falhou com erro inesperado`,
        details: [],
        context
      }
    };
  }
}

/**
 * Valida array de dados com schema
 * @ai-purpose Validação em lote com relatório detalhado
 */
export function validateArrayWithSchema<T>(
  dataArray: unknown[],
  schema: ZodSchema<T>,
  context: string = 'Validação de array'
): {
  valid: T[];
  invalid: Array<{ index: number; data: unknown; error: string }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    successRate: number;
  };
} {
  const valid: T[] = [];
  const invalid: Array<{ index: number; data: unknown; error: string }> = [];
  
  dataArray.forEach((item, index) => {
    const result = safeValidateWithSchema(item, schema, `${context}[${index}]`);
    
    if (result.success && result.data) {
      valid.push(result.data);
    } else {
      invalid.push({
        index,
        data: item,
        error: result.error?.message || 'Erro desconhecido'
      });
    }
  });
  
  return {
    valid,
    invalid,
    summary: {
      total: dataArray.length,
      valid: valid.length,
      invalid: invalid.length,
      successRate: dataArray.length > 0 ? valid.length / dataArray.length : 1
    }
  };
}

/**
 * Cria um validador reutilizável para um schema específico
 * @ai-purpose Factory para criar validadores customizados
 */
export function createValidator<T>(
  schema: ZodSchema<T>,
  defaultContext: string = 'Validação'
) {
  return {
    validate: (data: unknown, context?: string) => 
      validateWithSchema(data, schema, context || defaultContext),
    
    safeValidate: (data: unknown, context?: string) => 
      safeValidateWithSchema(data, schema, context || defaultContext),
    
    validateArray: (dataArray: unknown[], context?: string) => 
      validateArrayWithSchema(dataArray, schema, context || defaultContext)
  };
}
