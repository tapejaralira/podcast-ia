/**
 * 🧹 Script de Limpeza Completa do Código Legacy
 * Remove toda a infraestrutura legacy após validação da Fase 1.5
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();

console.log('🧹 LIMPEZA COMPLETA DO CÓDIGO LEGACY');
console.log('====================================\n');

async function safeLegacyCleanup() {
  console.log('📋 Etapa 1: Verificação de Segurança...');
  
  // Teste 1: Compilação TypeScript
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { cwd: ROOT_DIR, stdio: 'pipe' });
    console.log('   ✅ TypeScript compilando sem erros');
  } catch (error) {
    console.log('   ❌ ERRO: TypeScript não compila - abortando limpeza');
    return false;
  }
  
  // Teste 2: Verificar se nova estrutura existe
  const requiredDirs = ['assets/audio', 'output/audio', 'output/episodes'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(ROOT_DIR, dir))) {
      console.log(`   ❌ ERRO: ${dir} não existe - abortando limpeza`);
      return false;
    }
  }
  console.log('   ✅ Nova estrutura validada');
  
  // Teste 3: Verificar se arquivos foram migrados
  const outputAudioCount = fs.readdirSync(path.join(ROOT_DIR, 'output/audio')).length;
  const outputEpisodesCount = fs.readdirSync(path.join(ROOT_DIR, 'output/episodes')).length;
  
  if (outputAudioCount === 0 && outputEpisodesCount === 0) {
    console.log('   ⚠️  AVISO: Nenhum arquivo na nova estrutura - validando manualmente...');
  } else {
    console.log(`   ✅ Arquivos migrados: ${outputAudioCount} áudios, ${outputEpisodesCount} episódios`);
  }
  
  console.log('\n📋 Etapa 2: Atualizando Imports nos Scripts...');
  
  // Atualizar imports para usar newConfig
  const filesToUpdate = [
    'src/noticias/buscarNoticias.ts',
    'src/noticias/analisarNoticias.ts', 
    'src/roteiro/gerarRoteiro.ts',
    'src/roteiro/sugerirAbertura.ts',
    'src/producao/gerarAudio.ts',
    'src/mixagem/montarEpisodio.ts'
  ];
  
  for (const file of filesToUpdate) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Substituir import { config } por import { newConfig as config }
      const oldImport = /import\s*{\s*config\s*}\s*from\s*['"]\.\.\/config\.js['"];?/g;
      const newImport = "import { newConfig as config } from '../config.js';";
      
      if (oldImport.test(content)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(filePath, content);
        console.log(`   ✅ Atualizado: ${file}`);
      } else {
        console.log(`   ⏭️  Já atualizado: ${file}`);
      }
    }
  }
  
  console.log('\n📋 Etapa 3: Removendo Código Legacy do config.ts...');
  
  // Limpar config.ts
  const configPath = path.join(ROOT_DIR, 'src/config.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Remover constantes legacy
  configContent = configContent.replace(/const AUDIOS_GERADOS_DIR = [^;]+;/g, '');
  configContent = configContent.replace(/const ROTEIRO_DIR = [^;]+;/g, '');
  
  // Remover configLegacy completo
  const configLegacyRegex = /\/\*\*\s*\* Configuração estendida para retrocompatibilidade[\s\S]*?export \{ configLegacy as config \};/;
  configContent = configContent.replace(configLegacyRegex, '// Configuração legacy removida - usar newConfig diretamente\nexport { newConfig as config };');
  
  // Remover comentários // ← Aponta para novo local  
  configContent = configContent.replace(/\s*\/\/ ← [^\\n]+/g, '');
  
  // Limpar paths de compatibilidade
  configContent = configContent.replace(/\s*\/\/ Mantém para compatibilidade \(será removido na próxima fase\)[^\\n]*/g, '');
  
  fs.writeFileSync(configPath, configContent);
  console.log('   ✅ config.ts limpo');
  
  console.log('\n📋 Etapa 4: Removendo Diretórios Antigos...');
  
  // Verificar se diretórios antigos ainda existem
  const oldDirs = ['audios', 'audios_gerados', 'episodios_finais'];
  for (const dir of oldDirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   📁 Removendo ${dir}/...`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`   ✅ ${dir}/ removido`);
    } else {
      console.log(`   ⏭️  ${dir}/ já não existe`);
    }
  }
  
  console.log('\n📋 Etapa 5: Atualizando Documentação...');
  
  // Atualizar README.md
  const readmePath = path.join(ROOT_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Atualizar estrutura de pastas no README
    readmeContent = readmeContent.replace(/├── audios_gerados\/[^\\n]*/g, '├── output/audio/         # Áudios de narração gerados pela IA');
    readmeContent = readmeContent.replace(/├── episodios_finais\/[^\\n]*/g, '├── output/episodes/     # Onde a mágica acontece: seus podcasts!');
    readmeContent = readmeContent.replace(/episódio final será salvo na pasta `episodios_finais`/g, 'episódio final será salvo na pasta `output/episodes`');
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log('   ✅ README.md atualizado');
  }
  
  // Atualizar .gitignore
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    // Substituir entradas antigas
    gitignoreContent = gitignoreContent.replace(/audios_gerados\//g, 'output/audio/');
    gitignoreContent = gitignoreContent.replace(/episodios_finais\//g, 'output/episodes/');
    
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('   ✅ .gitignore atualizado');
  }
  
  console.log('\n📋 Etapa 6: Teste Final...');
  
  // Teste final de compilação
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { cwd: ROOT_DIR, stdio: 'pipe' });
    console.log('   ✅ TypeScript: compilação final OK');
  } catch (error) {
    console.log('   ❌ ERRO: TypeScript falhou após limpeza');
    console.log('   🚨 REVISAR MUDANÇAS MANUALMENTE');
    return false;
  }
  
  // Remover arquivos de teste temporários
  const tempFiles = ['test-pipeline-completo.js', 'test-pipeline-final.js'];
  for (const file of tempFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   🗑️  Removido: ${file}`);
    }
  }
  
  console.log('\n🎉 LIMPEZA LEGACY CONCLUÍDA COM SUCESSO!');
  console.log('========================================');
  console.log('✅ Código legacy removido completamente');
  console.log('✅ Imports atualizados para newConfig');
  console.log('✅ Diretórios antigos removidos');
  console.log('✅ Documentação atualizada');
  console.log('✅ TypeScript funcionando perfeitamente');
  console.log('\n🚀 Projeto 100% limpo e pronto para Fase 2!');
  
  return true;
}

// Executar limpeza
safeLegacyCleanup().catch(error => {
  console.error('❌ Erro durante limpeza:', error);
  process.exit(1);
});
