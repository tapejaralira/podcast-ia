/**
 * Sistema de logging centralizado para o Bubuia News
 * Facilita debugging e monitoramento do pipeline
 */

import { LogLevel } from '../types.js';

/**
 * Função principal de logging com timestamp e formatação consistente
 * @param level Nível do log (INFO, WARN, ERROR, DEBUG)
 * @param message Mensagem principal do log
 * @param data Dados adicionais (opcional)
 * 
 * @example
 * ```typescript
 * log(LogLevel.INFO, 'Pipeline iniciado');
 * log(LogLevel.ERROR, 'Falha na API', { error: 'Connection timeout' });
 * ```
 */
export function log(level: LogLevel, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Log de informação - para eventos normais do pipeline
 * @param message Mensagem informativa
 * @param data Dados adicionais (opcional)
 */
export function logInfo(message: string, data?: any): void {
  log(LogLevel.INFO, message, data);
}

/**
 * Log de aviso - para situações que merecem atenção mas não impedem execução
 * @param message Mensagem de aviso
 * @param data Dados adicionais (opcional)
 */
export function logWarn(message: string, data?: any): void {
  log(LogLevel.WARN, message, data);
}

/**
 * Log de erro - para falhas que impedem execução normal
 * @param message Mensagem de erro
 * @param data Dados adicionais (opcional)
 */
export function logError(message: string, data?: any): void {
  log(LogLevel.ERROR, message, data);
}

/**
 * Log de debug - para informações detalhadas durante desenvolvimento
 * @param message Mensagem de debug
 * @param data Dados adicionais (opcional)
 */
export function logDebug(message: string, data?: any): void {
  // Só mostra debug se NODE_ENV for development
  if (process.env.NODE_ENV === 'development') {
    log(LogLevel.DEBUG, message, data);
  }
}

/**
 * Utilitário para medir e logar tempo de execução de operações
 * @param operation Nome da operação
 * @param fn Função a ser executada e medida
 * @returns Resultado da função
 * 
 * @example
 * ```typescript
 * const resultado = await logExecutionTime('Buscar notícias', async () => {
 *   return await buscarNoticias();
 * });
 * ```
 */
export async function logExecutionTime<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  logInfo(`Iniciando: ${operation}`);
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logInfo(`✅ Concluído: ${operation}`, { duration: `${duration}ms` });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`❌ Falhou: ${operation}`, { 
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Cria um logger contextual para um módulo específico
 * @param module Nome do módulo
 * @returns Objeto com funções de log contextualizadas
 * 
 * @example
 * ```typescript
 * const logger = createModuleLogger('ColetorG1');
 * logger.info('Iniciando coleta');
 * logger.error('Falha na conexão');
 * ```
 */
export function createModuleLogger(module: string) {
  return {
    info: (message: string, data?: any) => logInfo(`[${module}] ${message}`, data),
    warn: (message: string, data?: any) => logWarn(`[${module}] ${message}`, data),
    error: (message: string, data?: any) => logError(`[${module}] ${message}`, data),
    debug: (message: string, data?: any) => logDebug(`[${module}] ${message}`, data),
  };
}
