#!/usr/bin/env node

/**
 * Análise de pastas desnecessárias na nova estrutura AI-friendly
 * Identifica e sugere ações para pastas que não se encaixam na nova organização
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = process.cwd();

async function analyzeUnnecessaryFolders() {
  console.log('🔍 ANÁLISE DE PASTAS DESNECESSÁRIAS...\n');

  const analysis = {
    toMove: [],
    toRemove: [],
    toKeep: [],
    questionable: []
  };

  // 1. Pasta img/ - deve ser movida para assets/
  console.log('📁 img/ - Contém thumbnails');
  try {
    const imgFiles = await fs.readdir(path.join(ROOT_DIR, 'img'));
    console.log(`   Arquivos: ${imgFiles.join(', ')}`);
    analysis.toMove.push({
      from: 'img/',
      to: 'assets/images/',
      reason: 'Thumbnails devem estar em assets/'
    });
  } catch {
    console.log('   ❌ Pasta não encontrada');
  }

  // 2. Pasta dist/ - arquivos compilados temporários
  console.log('\n📁 dist/ - Arquivos TypeScript compilados');
  try {
    const distFiles = await fs.readdir(path.join(ROOT_DIR, 'dist'));
    console.log(`   Contém: ${distFiles.length} arquivos/pastas compilados`);
    analysis.questionable.push({
      folder: 'dist/',
      reason: 'Pode ser removida e recriada com npm run build',
      action: 'Opcional: adicionar ao .gitignore se não estiver'
    });
  } catch {
    console.log('   ❌ Pasta não encontrada');
  }

  // 3. Verificar se há pastas vazias desnecessárias
  console.log('\n📁 Verificando pastas de teste...');
  const testDirs = ['tests/ai', 'tests/fixtures', 'tests/integration', 'tests/unit'];
  for (const dir of testDirs) {
    try {
      const files = await fs.readdir(path.join(ROOT_DIR, dir));
      if (files.length === 0) {
        console.log(`   ⚠️  ${dir}/ está vazia`);
        analysis.questionable.push({
          folder: dir,
          reason: 'Pasta de teste vazia',
          action: 'Manter para estrutura ou adicionar arquivos .gitkeep'
        });
      } else {
        console.log(`   ✅ ${dir}/ contém ${files.length} arquivo(s)`);
      }
    } catch {
      console.log(`   ❌ ${dir}/ não encontrada`);
    }
  }

  // 4. Verificar scripts desnecessários
  console.log('\n📁 Verificando scripts...');
  try {
    const scriptFiles = await fs.readdir(path.join(ROOT_DIR, 'scripts'));
    const unnecessaryScripts = scriptFiles.filter(f => 
      f.includes('validate-') || 
      f.includes('cleanup') || 
      f.includes('migration')
    );
    
    if (unnecessaryScripts.length > 0) {
      console.log(`   🧹 Scripts de migração encontrados: ${unnecessaryScripts.join(', ')}`);
      analysis.toRemove.push({
        items: unnecessaryScripts.map(s => `scripts/${s}`),
        reason: 'Scripts de migração não são mais necessários'
      });
    }
  } catch {
    console.log('   ❌ Pasta scripts/ não encontrada');
  }

  // 5. Relatório final
  console.log('\n📊 RELATÓRIO DE LIMPEZA:');
  
  if (analysis.toMove.length > 0) {
    console.log('\n🔄 PARA MOVER:');
    analysis.toMove.forEach(item => {
      console.log(`   📁 ${item.from} → ${item.to}`);
      console.log(`      Motivo: ${item.reason}`);
    });
  }

  if (analysis.toRemove.length > 0) {
    console.log('\n🗑️  PARA REMOVER:');
    analysis.toRemove.forEach(item => {
      console.log(`   📁 ${item.items.join(', ')}`);
      console.log(`      Motivo: ${item.reason}`);
    });
  }

  if (analysis.questionable.length > 0) {
    console.log('\n❓ QUESTIONÁVEIS:');
    analysis.questionable.forEach(item => {
      console.log(`   📁 ${item.folder}`);
      console.log(`      Motivo: ${item.reason}`);
      console.log(`      Ação: ${item.action}`);
    });
  }

  // 6. Sugestões de ação
  console.log('\n🚀 AÇÕES RECOMENDADAS:');
  console.log('1. Mover img/ → assets/images/');
  console.log('2. Remover scripts de migração desnecessários');
  console.log('3. Considerar adicionar dist/ ao .gitignore');
  console.log('4. Adicionar .gitkeep em pastas de teste vazias');

  return analysis;
}

// Executar análise
analyzeUnnecessaryFolders()
  .then(analysis => {
    const totalIssues = analysis.toMove.length + analysis.toRemove.length + analysis.questionable.length;
    console.log(`\n📈 Total de itens para revisão: ${totalIssues}`);
    
    if (totalIssues > 0) {
      console.log('\n💡 Execute as ações recomendadas para finalizar a limpeza.');
    } else {
      console.log('\n✅ Estrutura já está otimizada!');
    }
  })
  .catch(error => {
    console.error('❌ Erro durante análise:', error);
  });
