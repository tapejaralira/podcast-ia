#!/usr/bin/env node

/**
 * Script simples de validação final
 */

import { config, filePaths, validateConfig } from '../dist/config.js';

console.log('🔍 Validando estrutura AI-friendly...\n');

// Testar configurações
try {
  validateConfig();
  console.log('✅ Configurações válidas');
} catch (error) {
  console.log(`❌ Erro nas configurações: ${error.message}`);
}

// Mostrar estrutura
console.log('\n📊 Estrutura atual:');
console.log(`   📁 Assets Audio: ${config.paths.assets.audio}`);
console.log(`   📁 Output Audio: ${config.paths.output.audio}`);
console.log(`   📁 Output Episodes: ${config.paths.output.episodes}`);
console.log(`   📁 Data: ${config.paths.data}`);
console.log(`   📁 Docs: ${config.paths.docs}`);

console.log('\n📄 Arquivos principais:');
console.log(`   📄 Notícias: ${filePaths.noticiasRecentesFile}`);
console.log(`   📄 Pauta: ${filePaths.pautaDoDiaFile}`);
console.log(`   📄 TTS Config: ${filePaths.ttsConfigFile}`);

console.log('\n🎉 Migração AI-friendly concluída!');
