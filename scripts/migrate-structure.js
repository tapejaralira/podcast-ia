/**
 * 🚀 Script de Migração para Estrutura AI-Friendly
 * Executa a Fase 1.5 do roadmap
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();

console.log('🚀 INICIANDO FASE 1.5 - REESTRUTURAÇÃO AI-FRIENDLY');
console.log('================================================\n');

// Fase A: Criar nova estrutura de diretórios
async function createNewStructure() {
  console.log('📁 Fase A: Criando nova estrutura de diretórios...');
  
  const directories = [
    'docs',
    'docs/decisions',
    'assets',
    'assets/audio',
    'assets/templates', 
    'assets/examples',
    'output',
    'output/audio',
    'output/episodes',
    'output/reports',
    'output/cache',
    'src/ai',
    'src/ai/prompts',
    'src/ai/schemas',
    'src/ai/services',
    'src/monitoring',
    'tests',
    'tests/unit',
    'tests/integration',
    'tests/ai',
    'tests/fixtures',
    'scripts/ai-tools'
  ];

  for (const dir of directories) {
    const fullPath = path.join(ROOT_DIR, dir);
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  ✅ Criado: ${dir}`);
      } else {
        console.log(`  📁 Já existe: ${dir}`);
      }
    } catch (error) {
      console.log(`  ❌ Erro ao criar ${dir}: ${error.message}`);
    }
  }
  
  console.log('\n📁 Estrutura de diretórios criada!\n');
}

// Fase B: Copiar arquivos existentes
async function copyExistingFiles() {
  console.log('📂 Fase B: Copiando arquivos existentes...');
  
  const migrations = [
    { from: 'audios', to: 'assets/audio', desc: 'Assets de áudio' },
    { from: 'audios_gerados', to: 'output/audio', desc: 'Áudios gerados' },
    { from: 'episodios_finais', to: 'output/episodes', desc: 'Episódios finais' }
  ];

  for (const migration of migrations) {
    const fromPath = path.join(ROOT_DIR, migration.from);
    const toPath = path.join(ROOT_DIR, migration.to);
    
    if (fs.existsSync(fromPath)) {
      try {
        console.log(`  📋 Copiando ${migration.desc}...`);
        copyRecursive(fromPath, toPath);
        console.log(`  ✅ ${migration.from} → ${migration.to}`);
      } catch (error) {
        console.log(`  ❌ Erro ao copiar ${migration.from}: ${error.message}`);
      }
    } else {
      console.log(`  ⏭️  ${migration.from} não existe - OK`);
    }
  }
  
  console.log('\n📂 Cópia de arquivos concluída!\n');
}

// Função auxiliar para cópia recursiva
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Fase C: Criar documentação base
async function createBaseDocs() {
  console.log('📚 Fase C: Criando documentação base...');
  
  // AI_CONTEXT.md
  const aiContext = `# 🤖 AI Context - Bubuia News

## TL;DR para IA
- **Função**: Pipeline automatizado de podcast de notícias locais do Amazonas
- **Tech Stack**: TypeScript + OpenAI/Gemini + FFmpeg + ElevenLabs
- **Estrutura**: assets/ → src/ → output/
- **Fluxo**: Coleta → Análise → Roteiro → Áudio → Mixagem

## Como este projeto funciona
1. **Coleta** (\`src/noticias/\`): Busca notícias de fontes locais
2. **Análise** (\`src/noticias/\`): IA classifica e prioriza notícias
3. **Roteiro** (\`src/roteiro/\`): IA gera script do podcast
4. **Produção** (\`src/producao/\`): Converte texto em áudio (TTS)
5. **Mixagem** (\`src/mixagem/\`): Monta episódio final com trilhas

## Estrutura AI-Friendly
\`\`\`
assets/audio/          # Trilhas, vinhetas, efeitos
src/                   # Código TypeScript
├── noticias/         # Coleta e análise
├── roteiro/          # Geração de script  
├── producao/         # TTS e áudio
├── mixagem/          # Montagem final
├── ai/               # Módulos específicos de IA
└── utils/            # Utilitários (logger, fileHelpers)
output/               # Tudo que é gerado
├── audio/           # Áudios de TTS
└── episodes/        # Podcasts finais
\`\`\`

## Padrões importantes para IA
- ✅ **Tipagem rigorosa**: Schemas TypeScript + validação Zod
- ✅ **Logs estruturados**: Use \`src/utils/logger.ts\`
- ✅ **Configuração central**: \`src/config.ts\` com validação
- ✅ **JSDoc rico**: Documentação inline com exemplos
- ✅ **Tratamento de erro**: Try/catch com logs contextuais

## Como ajudar como IA
1. **Sempre validar** dados com schemas TypeScript
2. **Usar logging** para debugging (\`logInfo\`, \`logError\`)
3. **Manter padrões** estabelecidos no codebase
4. **Documentar** mudanças com JSDoc detalhado
5. **Testar** modificações antes de sugerir

## APIs utilizadas
- **OpenAI**: Classificação de notícias
- **Gemini**: Geração de roteiros
- **ElevenLabs**: Text-to-Speech
- **FFmpeg**: Processamento de áudio
`;

  // ARCHITECTURE.md
  const architecture = `# 🏗️ Arquitetura - Bubuia News

## Visão Geral
Pipeline automatizado que transforma notícias locais em podcast diário.

## Fluxo de Dados
\`\`\`
[Fontes Web] → [Coletores] → [Análise IA] → [Roteiro IA] → [TTS] → [Mixagem] → [Podcast]
\`\`\`

## Módulos Principais

### 📰 Coleta (\`src/noticias/\`)
- \`buscarNoticias.ts\`: Coleta de múltiplas fontes
- \`analisarNoticias.ts\`: Classificação com IA

### 📝 Roteiro (\`src/roteiro/\`)
- \`gerarRoteiro.ts\`: Geração de script
- \`sugerirAbertura.ts\`: Cold opens dinâmicos

### 🎵 Produção (\`src/producao/\`)
- \`gerarAudio.ts\`: Text-to-Speech

### 🎬 Mixagem (\`src/mixagem/\`)
- \`montarEpisodio.ts\`: Montagem final

## Decisões Arquiteturais
- **TypeScript**: Tipagem rigorosa para melhor assistência de IA
- **Configuração centralizada**: Single source of truth
- **Logging estruturado**: Debugging facilitado
- **Modularidade**: Cada etapa é independente e testável
`;

  try {
    fs.writeFileSync(path.join(ROOT_DIR, 'docs', 'AI_CONTEXT.md'), aiContext);
    console.log('  ✅ docs/AI_CONTEXT.md criado');
    
    fs.writeFileSync(path.join(ROOT_DIR, 'docs', 'ARCHITECTURE.md'), architecture);
    console.log('  ✅ docs/ARCHITECTURE.md criado');
  } catch (error) {
    console.log(`  ❌ Erro ao criar documentação: ${error.message}`);
  }
  
  console.log('\n📚 Documentação base criada!\n');
}

// Executar migração completa
async function executeMigration() {
  try {
    await createNewStructure();
    await copyExistingFiles();
    await createBaseDocs();
    
    console.log('🎉 FASE 1.5 CONCLUÍDA COM SUCESSO!');
    console.log('==================================');
    console.log('✅ Nova estrutura AI-friendly criada');
    console.log('✅ Arquivos migrados para novos locais');
    console.log('✅ Documentação base criada');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualizar src/config.ts com novos paths');
    console.log('2. Testar pipeline com nova estrutura');
    console.log('3. Remover diretórios antigos após validação');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
}

// Executar
executeMigration();
