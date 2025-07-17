/**
 * Teste Completo do Pipeline - Validação da Fase 1
 * 
 * Este script testa todo o pipeline do Bubuia News:
 * 1. Coleta de notícias
 * 2. Análise e classificação
 * 3. Geração de roteiro
 * 4. Produção de áudio
 * 5. Mixagem final
 * 
 * Objetivo: Garantir que a Fase 1 não quebrou nenhuma funcionalidade existente
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { validateConfig } from './src/config.js';
import { logInfo, logError, logWarn, measureTime } from './src/utils/logger.js';
import { loadJsonFile, saveJsonFile, fileExists } from './src/utils/fileHelpers.js';

const ROOT_DIR = process.cwd();

/**
 * Executa um comando e retorna o resultado
 */
function runCommand(command, description) {
  try {
    logInfo(`🚀 Executando: ${description}`);
    const result = execSync(command, { 
      cwd: ROOT_DIR, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    logInfo(`✅ ${description} - Concluído`);
    return { success: true, output: result };
  } catch (error) {
    logError(`❌ ${description} - Falhou`, {
      command,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    });
    return { success: false, error: error.message };
  }
}

/**
 * Verifica se arquivo foi gerado e tem conteúdo válido
 */
async function validateGeneratedFile(filePath, description) {
  try {
    if (!await fileExists(filePath)) {
      logError(`❌ ${description} - Arquivo não encontrado: ${filePath}`);
      return false;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      logError(`❌ ${description} - Arquivo vazio: ${filePath}`);
      return false;
    }

    logInfo(`✅ ${description} - Arquivo válido (${stats.size} bytes)`);
    return true;
  } catch (error) {
    logError(`❌ ${description} - Erro ao validar arquivo`, { filePath, error: error.message });
    return false;
  }
}

/**
 * Valida estrutura de arquivo JSON
 */
async function validateJsonStructure(filePath, requiredFields, description) {
  try {
    const data = await loadJsonFile(filePath);
    
    for (const field of requiredFields) {
      if (!(field in data)) {
        logError(`❌ ${description} - Campo obrigatório ausente: ${field}`);
        return false;
      }
    }

    logInfo(`✅ ${description} - Estrutura JSON válida`);
    return true;
  } catch (error) {
    logError(`❌ ${description} - JSON inválido`, { filePath, error: error.message });
    return false;
  }
}

/**
 * Script principal de teste
 */
async function testPipelineCompleto() {
  logInfo('🎯 Iniciando Teste Completo do Pipeline - Fase 1');
  logInfo('=' .repeat(60));

  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;

  try {
    // 1. Validar configuração
    logInfo('📋 1. Validando Configuração...');
    totalTests++;
    try {
      validateConfig();
      logInfo('✅ Configuração válida');
      passedTests++;
    } catch (error) {
      logError('❌ Configuração inválida', { error: error.message });
    }

    // 2. Testar coleta de notícias
    logInfo('\n📰 2. Testando Coleta de Notícias...');
    totalTests++;
    const coletaResult = runCommand('node noticias/buscarNoticias.js', 'Coleta de Notícias');
    if (coletaResult.success) {
      const noticiasFile = path.join(ROOT_DIR, 'data', 'noticias-recentes.json');
      if (await validateGeneratedFile(noticiasFile, 'Arquivo de Notícias') &&
          await validateJsonStructure(noticiasFile, ['noticias', 'dataAtualizacao'], 'Estrutura de Notícias')) {
        passedTests++;
      }
    }

    // 3. Testar análise de notícias
    logInfo('\n🔍 3. Testando Análise de Notícias...');
    totalTests++;
    const analiseResult = runCommand('node noticias/analisarNoticias.js', 'Análise de Notícias');
    if (analiseResult.success) {
      const pautaFile = path.join(ROOT_DIR, 'data', 'episodio-do-dia.json');
      if (await validateGeneratedFile(pautaFile, 'Arquivo de Pauta') &&
          await validateJsonStructure(pautaFile, ['cold_open', 'noticias', 'data'], 'Estrutura de Pauta')) {
        passedTests++;
      }
    }

    // 4. Testar geração de roteiro
    logInfo('\n📝 4. Testando Geração de Roteiro...');
    totalTests++;
    const roteiroResult = runCommand('node roteiro/gerarRoteiro.js', 'Geração de Roteiro');
    if (roteiroResult.success) {
      // Verificar se roteiro foi gerado (buscar arquivo mais recente)
      const episodiosDir = path.join(ROOT_DIR, 'episodios');
      const files = fs.readdirSync(episodiosDir)
        .filter(f => f.startsWith('roteiro-') && f.endsWith('.md'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const roteiroFile = path.join(episodiosDir, files[0]);
        if (await validateGeneratedFile(roteiroFile, 'Arquivo de Roteiro')) {
          passedTests++;
        }
      } else {
        logError('❌ Nenhum roteiro encontrado');
      }
    }

    // 5. Testar geração de áudio
    logInfo('\n🎵 5. Testando Geração de Áudio...');
    totalTests++;
    const audioResult = runCommand('node producao/gerarAudio.js', 'Geração de Áudio');
    if (audioResult.success) {
      // Verificar se áudio foi gerado
      const today = new Date().toISOString().split('T')[0];
      const audioDir = path.join(ROOT_DIR, 'audios_gerados', `episodio-${today}`);
      
      if (fs.existsSync(audioDir)) {
        const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
        if (audioFiles.length > 0) {
          logInfo(`✅ Áudios gerados: ${audioFiles.length} arquivos`);
          passedTests++;
        } else {
          logError('❌ Nenhum arquivo de áudio encontrado');
        }
      } else {
        logError('❌ Diretório de áudio não encontrado');
      }
    }

    // 6. Testar mixagem final
    logInfo('\n🎧 6. Testando Mixagem Final...');
    totalTests++;
    const mixagemResult = runCommand('node mixagem/montarEpisodio.js', 'Mixagem Final');
    if (mixagemResult.success) {
      const episodiosFinaisDir = path.join(ROOT_DIR, 'episodios_finais');
      const finalFiles = fs.readdirSync(episodiosFinaisDir)
        .filter(f => f.startsWith('bubuia_news_') && f.endsWith('.mp3'))
        .sort()
        .reverse();
      
      if (finalFiles.length > 0) {
        const finalFile = path.join(episodiosFinaisDir, finalFiles[0]);
        if (await validateGeneratedFile(finalFile, 'Episódio Final')) {
          passedTests++;
        }
      } else {
        logError('❌ Nenhum episódio final encontrado');
      }
    }

  } catch (error) {
    logError('💥 Erro crítico durante o teste', { error: error.message, stack: error.stack });
  }

  // Relatório final
  const duration = measureTime(startTime);
  logInfo('\n' + '=' .repeat(60));
  logInfo('📊 RELATÓRIO FINAL DO TESTE');
  logInfo('=' .repeat(60));
  logInfo(`✅ Testes Passaram: ${passedTests}/${totalTests}`);
  logInfo(`⏱️  Tempo Total: ${duration}ms`);
  
  if (passedTests === totalTests) {
    logInfo('🎉 PIPELINE COMPLETO FUNCIONANDO - FASE 1 VALIDADA!');
    logInfo('✅ Todos os componentes estão operacionais');
    logInfo('🚀 Pronto para avançar para a Fase 2');
  } else {
    logWarn(`⚠️  PIPELINE PARCIALMENTE FUNCIONAL (${passedTests}/${totalTests})`);
    logWarn('🔧 Algumas etapas precisam de atenção antes da Fase 2');
  }

  return { passedTests, totalTests, success: passedTests === totalTests };
}

// Executar teste se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testPipelineCompleto()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logError('💥 Falha catastrófica no teste', { error: error.message });
      process.exit(1);
    });
}

export { testPipelineCompleto };
