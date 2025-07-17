# 🏗️ Arquitetura - Bubuia News

## Visão Geral
Pipeline automatizado que transforma notícias locais em podcast diário.

## Fluxo de Dados
```
[Fontes Web] → [Coletores] → [Análise IA] → [Roteiro IA] → [TTS] → [Mixagem] → [Podcast]
```

## Módulos Principais

### 📰 Coleta (`src/noticias/`)
- `buscarNoticias.ts`: Coleta de múltiplas fontes
- `analisarNoticias.ts`: Classificação com IA

### 📝 Roteiro (`src/roteiro/`)
- `gerarRoteiro.ts`: Geração de script
- `sugerirAbertura.ts`: Cold opens dinâmicos

### 🎵 Produção (`src/producao/`)
- `gerarAudio.ts`: Text-to-Speech

### 🎬 Mixagem (`src/mixagem/`)
- `montarEpisodio.ts`: Montagem final

## Decisões Arquiteturais
- **TypeScript**: Tipagem rigorosa para melhor assistência de IA
- **Configuração centralizada**: Single source of truth
- **Logging estruturado**: Debugging facilitado
- **Modularidade**: Cada etapa é independente e testável
