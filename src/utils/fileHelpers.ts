/**
 * Utilitários para manipulação de arquivos com tipagem e validação
 * Facilita operações de I/O com tratamento de erro robusto
 */

import fs from 'fs/promises';
import path from 'path';
import { logError, logWarn, logInfo } from './logger.js';

/**
 * Carrega e faz parse de um arquivo JSON com tipagem
 * @param filePath Caminho para o arquivo JSON
 * @returns Promise com os dados tipados
 * @throws {Error} Quando arquivo não existe ou JSON é inválido
 * 
 * @example
 * ```typescript
 * interface Config { apiKey: string; model: string; }
 * const config = await loadJsonFile<Config>('./config.json');
 * ```
 */
export async function loadJsonFile<T>(filePath: string): Promise<T> {
  try {
    const absolutePath = path.resolve(filePath);
    logInfo(`Carregando arquivo JSON: ${absolutePath}`);
    
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    
    if (!fileContent.trim()) {
      throw new Error(`Arquivo está vazio: ${absolutePath}`);
    }
    
    const data = JSON.parse(fileContent);
    logInfo(`✅ Arquivo JSON carregado com sucesso: ${absolutePath}`);
    return data;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao carregar arquivo JSON: ${filePath}`, { error: errorMessage });
    throw new Error(`Erro ao carregar ${filePath}: ${errorMessage}`);
  }
}

/**
 * Salva dados em um arquivo JSON com formatação
 * @param filePath Caminho onde salvar o arquivo
 * @param data Dados a serem salvos
 * @param indent Espaçamento para formatação (padrão: 2)
 * 
 * @example
 * ```typescript
 * await saveJsonFile('./output.json', { resultado: 'sucesso' });
 * ```
 */
export async function saveJsonFile<T>(
  filePath: string, 
  data: T, 
  indent: number = 2
): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    
    // Cria diretório se não existir
    await fs.mkdir(dir, { recursive: true });
    
    const jsonContent = JSON.stringify(data, null, indent);
    await fs.writeFile(absolutePath, jsonContent, 'utf-8');
    
    logInfo(`✅ Arquivo JSON salvo: ${absolutePath}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao salvar arquivo JSON: ${filePath}`, { error: errorMessage });
    throw new Error(`Erro ao salvar ${filePath}: ${errorMessage}`);
  }
}

/**
 * Verifica se um arquivo existe
 * @param filePath Caminho do arquivo
 * @returns Promise<boolean> indicando se arquivo existe
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(path.resolve(filePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Cria um diretório se ele não existir
 * @param dirPath Caminho do diretório
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(dirPath);
    await fs.mkdir(absolutePath, { recursive: true });
    logInfo(`Diretório garantido: ${absolutePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao criar diretório: ${dirPath}`, { error: errorMessage });
    throw error;
  }
}

/**
 * Carrega um arquivo de texto simples
 * @param filePath Caminho do arquivo
 * @returns Conteúdo do arquivo como string
 */
export async function loadTextFile(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    logInfo(`Arquivo de texto carregado: ${absolutePath}`);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao carregar arquivo de texto: ${filePath}`, { error: errorMessage });
    throw new Error(`Erro ao carregar ${filePath}: ${errorMessage}`);
  }
}

/**
 * Salva conteúdo em um arquivo de texto
 * @param filePath Caminho onde salvar
 * @param content Conteúdo a ser salvo
 */
export async function saveTextFile(filePath: string, content: string): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
    
    logInfo(`✅ Arquivo de texto salvo: ${absolutePath}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao salvar arquivo de texto: ${filePath}`, { error: errorMessage });
    throw error;
  }
}

/**
 * Lista arquivos em um diretório com filtro opcional
 * @param dirPath Caminho do diretório
 * @param extension Extensão para filtrar (opcional, ex: '.ts')
 * @returns Array com nomes dos arquivos
 */
export async function listFiles(dirPath: string, extension?: string): Promise<string[]> {
  try {
    const absolutePath = path.resolve(dirPath);
    const files = await fs.readdir(absolutePath);
    
    if (extension) {
      return files.filter(file => file.endsWith(extension));
    }
    
    return files;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao listar arquivos: ${dirPath}`, { error: errorMessage });
    throw error;
  }
}

/**
 * Copia um arquivo de origem para destino
 * @param sourcePath Caminho do arquivo origem
 * @param destPath Caminho do arquivo destino
 */
export async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  try {
    const absoluteSource = path.resolve(sourcePath);
    const absoluteDest = path.resolve(destPath);
    const destDir = path.dirname(absoluteDest);
    
    await fs.mkdir(destDir, { recursive: true });
    await fs.copyFile(absoluteSource, absoluteDest);
    
    logInfo(`✅ Arquivo copiado: ${absoluteSource} → ${absoluteDest}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao copiar arquivo: ${sourcePath} → ${destPath}`, { error: errorMessage });
    throw error;
  }
}

/**
 * Remove um arquivo se ele existir
 * @param filePath Caminho do arquivo
 */
export async function removeFile(filePath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    
    if (await fileExists(absolutePath)) {
      await fs.unlink(absolutePath);
      logInfo(`✅ Arquivo removido: ${absolutePath}`);
    } else {
      logWarn(`Arquivo não encontrado para remoção: ${absolutePath}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Falha ao remover arquivo: ${filePath}`, { error: errorMessage });
    throw error;
  }
}
