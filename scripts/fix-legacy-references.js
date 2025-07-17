#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir automaticamente todas as referências legacy nos arquivos TypeScript
 * após a migração para a nova estrutura AI-friendly
 */

const SRC_DIR = path.join(__dirname, '..', 'src');

// Mapeamento de propriedades legacy para as novas
const LEGACY_MAPPINGS = {
  // Caminhos legacy -> novos caminhos
  'config.paths.src': 'config.paths.data', // Na maioria dos casos, src era usado para temp, usar data
  'config.paths.roteirosDir': 'config.paths.roteiros',
  'config.paths.audioOutputDir': 'config.paths.output.audio',
  'config.paths.episodios_finais': 'config.paths.output.episodes',
  'config.paths.noticiasRecentesFile': 'filePaths.noticiasRecentesFile',
  'config.paths.pautaDoDiaFile': 'filePaths.pautaDoDiaFile',
  'config.paths.estadoColetaFile': 'filePaths.estadoColetaFile',
  'config.paths.ttsConfigFile': 'filePaths.ttsConfigFile',
  
  // Propriedades removidas -> novas equivalentes
  'config.models.analise': 'config.ai.gemini.model',
  'config.models.sugestao': 'config.ai.gemini.model',
  'config.apiProvider': "'gemini'", // Valor fixo, já que gemini é o padrão
};

// Arquivos que precisam ser atualizados
const FILES_TO_UPDATE = [
  'src/mixagem/montarEpisodio.ts',
  'src/noticias/analisarNoticias.ts',
  'src/noticias/buscarNoticias.ts',
  'src/producao/gerarAudio.ts',
  'src/roteiro/sugerirAbertura.ts'
];

// Imports que precisam ser adicionados
const REQUIRED_IMPORTS = {
  'filePaths': 'import { filePaths } from \'../config.js\';'
};

/**
 * Atualiza um arquivo TypeScript com as correções necessárias
 */
function updateFile(filePath) {
  console.log(`\n🔧 Atualizando ${filePath}...`);
  
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Arquivo não encontrado: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let hasChanges = false;

  // Verificar se precisa adicionar import do filePaths
  const needsFilePathsImport = Object.values(LEGACY_MAPPINGS).some(newRef => 
    newRef.includes('filePaths.') && content.includes('filePaths.')
  );

  if (needsFilePathsImport && !content.includes('import { filePaths }')) {
    // Adicionar import do filePaths após o import do config
    const configImportMatch = content.match(/import.*config.*from\s+['"]\.\.\/config\.js['"];?\n/);
    if (configImportMatch) {
      const configImportLine = configImportMatch[0];
      const newImportLine = configImportLine.replace(
        /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\.\.\/config\.js['"];?/,
        "import { $1, filePaths } from '../config.js';"
      );
      content = content.replace(configImportLine, newImportLine);
      hasChanges = true;
      console.log(`  ✅ Adicionado import do filePaths`);
    }
  }

  // Aplicar as correções de mapeamento
  for (const [legacyRef, newRef] of Object.entries(LEGACY_MAPPINGS)) {
    if (content.includes(legacyRef)) {
      content = content.replace(new RegExp(legacyRef.replace('.', '\\.'), 'g'), newRef);
      hasChanges = true;
      console.log(`  ✅ ${legacyRef} → ${newRef}`);
    }
  }

  // Correções específicas por arquivo
  if (filePath.includes('montarEpisodio.ts')) {
    // TEMP_DIR deve usar um caminho específico de temp
    if (content.includes('path.join(config.paths.data, \'mixagem\', \'temp\')')) {
      content = content.replace(
        'path.join(config.paths.data, \'mixagem\', \'temp\')',
        'path.join(config.paths.output.cache, \'mixagem-temp\')'
      );
      hasChanges = true;
      console.log(`  ✅ Corrigido TEMP_DIR para usar cache`);
    }
  }

  if (filePath.includes('sugerirAbertura.ts')) {
    // Remover referências a config.apiProvider e usar gemini diretamente
    if (content.includes('if (config.apiProvider === \'gemini\')')) {
      content = content.replace(
        /if \(config\.apiProvider === 'gemini'\) \{[\s\S]*?\} else \{[\s\S]*?\}/,
        '// Usando Gemini como provedor padrão'
      );
      hasChanges = true;
      console.log(`  ✅ Removido check de apiProvider, usando Gemini`);
    }
    
    if (content.includes('config.apiProvider')) {
      content = content.replace(/config\.apiProvider/g, "'gemini'");
      hasChanges = true;
      console.log(`  ✅ Substituído config.apiProvider por 'gemini'`);
    }
  }

  // Salvar o arquivo se houve mudanças
  if (hasChanges) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Arquivo atualizado: ${filePath}`);
  } else {
    console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
  }
}

/**
 * Função principal
 */
function main() {
  console.log('🚀 Iniciando correção de referências legacy...\n');
  
  // Atualizar cada arquivo
  for (const filePath of FILES_TO_UPDATE) {
    updateFile(filePath);
  }
  
  console.log('\n✅ Correção de referências legacy concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute: npx tsc --noEmit');
  console.log('2. Teste o pipeline completo');
  console.log('3. Valide se todos os caminhos estão corretos');
}

if (require.main === module) {
  main();
}
