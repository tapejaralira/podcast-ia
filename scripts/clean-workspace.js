#!/usr/bin/env node

/**
 * Script para limpeza do workspace - Remove arquivos temporários e de build
 * Execute apenas quando necessário: node scripts/clean-workspace.js
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🧹 Limpando workspace...\n');

// Pastas que podem ser removidas completamente
const foldersToClean = [
  'dist',
  'build',
  'out',
  'tmp',
  'temp',
  '.tsbuildinfo'
];

// Arquivos temporários por padrão
const tempFilePatterns = [
  '**/*-temp.*',
  '**/*-tmp.*',
  '**/test-*.js',
  '**/setup-*.js',
  '**/migration-*.js',
  '**/cleanup-*.js',
  '**/analyze-*.js',
  '**/fix-*.js',
  '**/*.log'
];

let cleaned = 0;

// Limpar pastas
foldersToClean.forEach(folder => {
  if (existsSync(folder)) {
    console.log(`🗂️  Removendo pasta: ${folder}`);
    rmSync(folder, { recursive: true, force: true });
    cleaned++;
  }
});

// Verificar se há arquivos temporários (sem remover automaticamente)
console.log('\n🔍 Verificando arquivos temporários...');
try {
  const result = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' });
  const untracked = result.split('\n').filter(line => line.trim());
  
  const tempFiles = untracked.filter(file => 
    tempFilePatterns.some(pattern => 
      file.includes('temp') || 
      file.includes('tmp') || 
      file.includes('test-') ||
      file.includes('setup-') ||
      file.includes('migration-')
    )
  );

  if (tempFiles.length > 0) {
    console.log('⚠️  Arquivos temporários encontrados:');
    tempFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\n💡 Execute: git clean -fd para remover se necessário');
  } else {
    console.log('✅ Nenhum arquivo temporário encontrado');
  }
} catch (error) {
  console.log('⚠️  Não foi possível verificar arquivos não rastreados');
}

console.log(`\n🎉 Limpeza concluída! ${cleaned} itens removidos.`);
console.log('💡 Para rebuild: npm run build');
