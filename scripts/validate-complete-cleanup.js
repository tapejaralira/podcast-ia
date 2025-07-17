#!/usr/bin/env node

/**
 * Script de validação completa pós-limpeza legacy
 * Verifica se TODOS os vestígios legacy foram removidos
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = process.cwd();

async function validateCompleteCleanup() {
  console.log('🔍 VALIDAÇÃO COMPLETA - Verificando limpeza total legacy...\n');

  let hasLegacy = false;

  // 1. Verificar se diretórios legacy foram removidos
  console.log('1️⃣ Verificando diretórios legacy...');
  const legacyDirs = [
    'audios',
    'audios_gerados', 
    'episodios_finais',
    'episodios',
    'mixagem',
    'noticias',
    'producao',
    'roteiro'
  ];

  for (const dir of legacyDirs) {
    const fullPath = path.join(ROOT_DIR, dir);
    try {
      await fs.access(fullPath);
      console.log(`   ❌ LEGACY ENCONTRADO: ${dir}/`);
      hasLegacy = true;
    } catch {
      console.log(`   ✅ ${dir}/ removido`);
    }
  }

  // 2. Verificar se nova estrutura está completa
  console.log('\n2️⃣ Verificando nova estrutura...');
  const newDirs = [
    'assets/audio',
    'assets/templates',
    'output/audio',
    'output/episodes',
    'output/scripts',
    'output/cache',
    'src/noticias',
    'src/roteiro',
    'src/producao',
    'src/mixagem',
    'docs',
    'tests'
  ];

  for (const dir of newDirs) {
    const fullPath = path.join(ROOT_DIR, dir);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ ${dir}/`);
    } catch {
      console.log(`   ⚠️  FALTANDO: ${dir}/`);
    }
  }

  // 3. Verificar arquivos migrados
  console.log('\n3️⃣ Verificando arquivos essenciais...');
  const essentialFiles = [
    'assets/templates/roteiro-template.md',
    'src/config.ts',
    'src/types.ts',
    'docs/AI_CONTEXT.md',
    'docs/ARCHITECTURE.md',
    'docs/MIGRATION_SUMMARY.md'
  ];

  for (const file of essentialFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ ${file}`);
    } catch {
      console.log(`   ❌ FALTANDO: ${file}`);
    }
  }

  // 4. Verificar se roteiros foram migrados
  console.log('\n4️⃣ Verificando migração de roteiros...');
  try {
    const scriptFiles = await fs.readdir(path.join(ROOT_DIR, 'output', 'scripts'));
    const roteiros = scriptFiles.filter(f => f.startsWith('roteiro-') && f.endsWith('.md'));
    console.log(`   ✅ ${roteiros.length} roteiros migrados para output/scripts/`);
    roteiros.forEach(r => console.log(`      📄 ${r}`));
  } catch {
    console.log('   ⚠️  Pasta output/scripts/ não encontrada');
  }

  // 5. Resultado final
  console.log('\n📊 RESULTADO DA LIMPEZA:');
  if (!hasLegacy) {
    console.log('   🎉 LIMPEZA COMPLETA! Todos os vestígios legacy foram removidos.');
    console.log('\n✅ ESTRUTURA FINAL AI-FRIENDLY:');
    console.log('   📚 docs/ - Documentação centralizada');
    console.log('   🎵 assets/ - Audio, templates, examples');
    console.log('   📤 output/ - Audio, episodes, scripts, cache');
    console.log('   🧠 src/ - Código TypeScript organizado');
    console.log('   🧪 tests/ - Testes estruturados');
    console.log('   📜 scripts/ - Automação e ferramentas');
    
    console.log('\n🚀 PRÓXIMAS AÇÕES:');
    console.log('   1. Teste o pipeline completo');
    console.log('   2. Configure variáveis de ambiente');
    console.log('   3. Execute npm run build && npm test');
    console.log('   4. Inicie a Fase 2 do ROADMAP');
    
    return true;
  } else {
    console.log('   ⚠️  ATENÇÃO: Ainda existem vestígios legacy que precisam ser removidos.');
    return false;
  }
}

// Executar validação
validateCompleteCleanup()
  .then(success => {
    if (success) {
      console.log('\n🎯 MIGRAÇÃO AI-FRIENDLY 100% CONCLUÍDA! 🎯');
      process.exit(0);
    } else {
      console.log('\n❌ Limpeza incompleta. Revise os itens marcados acima.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  });
