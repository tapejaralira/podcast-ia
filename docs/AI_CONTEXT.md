# 🤖 AI Context - Bubuia News

## TL;DR para IA
- **Função**: Pipeline automatizado de podcast de notícias locais do Amazonas
- **Tech Stack**: TypeScript + OpenAI/Gemini + FFmpeg + ElevenLabs
- **Estrutura**: assets/ → src/ → output/
- **Fluxo**: Coleta → Análise → Roteiro → Áudio → Mixagem

## Como este projeto funciona
1. **Coleta** (`src/noticias/`): Busca notícias de fontes locais
2. **Análise** (`src/noticias/`): IA classifica e prioriza notícias
3. **Roteiro** (`src/roteiro/`): IA gera script do podcast
4. **Produção** (`src/producao/`): Converte texto em áudio (TTS)
5. **Mixagem** (`src/mixagem/`): Monta episódio final com trilhas

## Estrutura AI-Friendly
```
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
```

## Padrões importantes para IA
- ✅ **Tipagem rigorosa**: Schemas TypeScript + validação Zod
- ✅ **Logs estruturados**: Use `src/utils/logger.ts`
- ✅ **Configuração central**: `src/config.ts` com validação
- ✅ **JSDoc rico**: Documentação inline com exemplos
- ✅ **Tratamento de erro**: Try/catch com logs contextuais

## Como ajudar como IA
1. **Sempre validar** dados com schemas TypeScript
2. **Usar logging** para debugging (`logInfo`, `logError`)
3. **Manter padrões** estabelecidos no codebase
4. **Documentar** mudanças com JSDoc detalhado
5. **Testar** modificações antes de sugerir

## APIs utilizadas
- **OpenAI**: Classificação de notícias
- **Gemini**: Geração de roteiros
- **ElevenLabs**: Text-to-Speech
- **FFmpeg**: Processamento de áudio
