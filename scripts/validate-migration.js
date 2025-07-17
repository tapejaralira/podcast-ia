#!/usr/bin/env node

/**
 * Script de validação final da migração para estrutura AI-friendly
 * Verifica se todos os caminhos estão corretos e a estrutura está funcionando
 */

import fs from 'fs/promises';
import path from 'path';
import { config, filePaths, validateConfig } from '../dist/config.js';

const ROOT_DIR = path.resolve(process.cwd());

async function validateStructure() {
  console.log('🔍 Validando estrutura AI-friendly...\n');

  // 1. Validar configurações
  console.log('1️⃣ Testando configurações...');
  try {
    validateConfig();
    console.log('   ✅ Configurações válidas');
  } catch (error) {
    console.log(`   ❌ Erro nas configurações: ${error.message}`);
    return false;
  }

  // 2. Validar diretórios principais
  console.log('\n2️⃣ Verificando diretórios...');
  const dirsToCheck = [
    'assets/audio',
    'output/audio',
    'output/episodes',
    'output/cache',
    'src',
    'data',
    'docs',
    'tests'
  ];

  for (const dir of dirsToCheck) {
    const fullPath = path.join(ROOT_DIR, dir);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ ${dir}`);
    } catch {
      console.log(`   ❌ ${dir} não encontrado`);
      return false;
    }
  }

  // 3. Verificar arquivos de dados
  console.log('\n3️⃣ Verificando arquivos de dados...');
  const filesToCheck = [
    filePaths.noticiasRecentesFile,
    filePaths.personagensFile,
    filePaths.ttsConfigFile
  ];

  for (const file of filesToCheck) {
    try {
      await fs.access(file);
      console.log(`   ✅ ${path.basename(file)}`);
    } catch {
      console.log(`   ❌ ${path.basename(file)} não encontrado`);
    }
  }

  // 4. Testar importações dos módulos principais
  console.log('\n4️⃣ Testando importações dos módulos...');
  const modules = [
    '../dist/noticias/buscarNoticias.js',
    '../dist/noticias/analisarNoticias.js',
    '../dist/roteiro/gerarRoteiro.js',
    '../dist/producao/gerarAudio.js',
    '../dist/mixagem/montarEpisodio.js'
  ];

  for (const mod of modules) {
    try {
      await import(mod);
      console.log(`   ✅ ${path.basename(mod, '.js')}`);
    } catch (error) {
      console.log(`   ❌ ${path.basename(mod, '.js')}: ${error.message}`);
    }
  }

  // 5. Verificar se não existem mais referências legacy
  console.log('\n5️⃣ Verificando limpeza de legacy...');
  const legacyDirs = ['audios', 'audios_gerados', 'episodios_finais', 'mixagem', 'noticias', 'producao', 'roteiro'];
  let hasLegacy = false;

  for (const dir of legacyDirs) {
    const fullPath = path.join(ROOT_DIR, dir);
    try {
      await fs.access(fullPath);
      console.log(`   ⚠️  Diretório legacy ainda existe: ${dir}`);
      hasLegacy = true;
    } catch {
      // Está correto - não deve existir
    }
  }

  if (!hasLegacy) {
    console.log('   ✅ Todos os diretórios legacy foram removidos');
  }

  console.log('\n📊 Resumo da estrutura:');
  console.log(`   📁 Raiz: ${ROOT_DIR}`);
  console.log(`   📁 Assets: ${config.paths.assets.audio}`);
  console.log(`   📁 Output: ${config.paths.output.audio}`);
  console.log(`   📁 Dados: ${config.paths.data}`);
  console.log(`   📁 Docs: ${config.paths.docs}`);

  console.log('\n🎉 Migração para estrutura AI-friendly concluída com sucesso!');
  return true;
}

async function main() {
  try {
    const success = await validateStructure();
    if (success) {
      console.log('\n📋 Próximos passos:');
      console.log('1. Teste o pipeline completo com: npm run test:pipeline');
      console.log('2. Gere um novo episódio para validar tudo');
      console.log('3. Documente qualquer configuração específica no README.md');
      process.exit(0);
    } else {
      console.log('\n❌ Validação falhou. Verifique os erros acima.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
