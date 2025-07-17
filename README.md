# 🎙️ Bubuia News: Ecossistema de Podcast Automatizado! 🤖

Bem-vindo ao **Bubuia News**, uma plataforma completa de podcast automatizado que transforma informação em conteúdo envolvente usando o poder da IA! Mais do que apenas um gerador de podcast, o Bubuia News é um **ecossistema completo** que busca, analisa, produz e distribui conteúdo de forma totalmente automatizada.

![Bubuia News Thumbnail](assets/images/thumbnail02.png)

## 🌟 Visão Geral

O Bubuia News representa uma **nova geração de criação de conteúdo**, onde a IA não é apenas uma ferramenta, mas um colaborador ativo no processo criativo. Nossa plataforma automatiza todo o pipeline de um podcast profissional, desde a coleta de notícias até a distribuição multi-plataforma.

### ✨ O que fazemos agora?

**Pipeline Core Automatizado:**

1. **🔍 Busca Inteligente**: Vasculhamos múltiplas fontes web para notícias relevantes
2. **🧠 Análise com IA**: Classificamos, resumimos e organizamos conteúdo automaticamente
3. **📝 Roteiro Dinâmico**: Geramos roteiros criativos com aberturas, blocos temáticos e encerramentos
4. **🎙️ Produção de Áudio**: Criamos narrações profissionais usando TTS avançado
5. **🎵 Mixagem Profissional**: Combinamos áudio, trilhas e vinhetas para qualidade de estúdio

### 🚀 Funcionalidades Planejadas (Roadmap Expandido)

**Distribuição Automática:**

- 📡 RSS feeds para Spotify, Apple Podcasts, Google Podcasts
- 📱 Publicação automática em redes sociais (Instagram, Twitter, LinkedIn, TikTok)
- 📺 YouTube automation com vídeo podcast e shorts
- 🌐 CDN global para distribuição otimizada

**Engajamento e Comunidade:**

- 💬 Sistema de feedback e comentários agregados
- 🤖 Chatbots inteligentes para múltiplas plataformas
- 📊 Analytics avançado cross-platform
- 🎯 Personalização baseada em preferências da audiência

**Infraestrutura Escalável:**

- 🏗️ Suporte para múltiplos shows e formatos
- ☁️ Cloud deployment com auto-scaling
- 📈 Business intelligence e métricas de ROI
- 🔄 CI/CD para operação completamente automatizada

## 🚀 Começando

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **TypeScript** (instalado globalmente ou via npm)
- **FFmpeg** (instalado e acessível no PATH do sistema)
- **Credenciais de API** para OpenAI e/ou Google Gemini

### Instalação Rápida

1. Clone este repositório:

   ```bash
   git clone https://github.com/seu-usuario/bubuia-news.git
   cd bubuia-news
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure suas variáveis de ambiente:

   ```bash
   # APIs de IA (obrigatórias)
   OPENAI_API_KEY=your_openai_key_here
   GEMINI_API_KEY=your_gemini_key_here

   # Configurações opcionais
   API_PROVIDER=gemini  # ou 'openai'
   FFMPEG_PATH=C:/Program Files/ffmpeg/bin/ffmpeg.exe
   ```

4. Execute o pipeline:
   ```bash
   npm start
   ```

### 🎯 Funcionalidades Atuais vs. Planejadas

| Funcionalidade                | Status       | Fase |
| ----------------------------- | ------------ | ---- |
| ✅ Pipeline core automatizado | Implementado | 1.5  |
| ✅ Estrutura AI-friendly      | Implementado | 1.5  |
| ✅ TypeScript + validação     | Implementado | 1.5  |
| 🚧 RSS Feed + distribuição    | Planejado    | 10   |
| 🚧 Redes sociais automation   | Planejado    | 11   |
| 🚧 YouTube integration        | Planejado    | 12   |
| 🚧 Sistema de comunidade      | Planejado    | 13   |
| 🚧 Analytics avançado         | Planejado    | 14   |
| 🚧 Multi-show support         | Planejado    | 15   |

_Veja o [ROADMAP.md](ROADMAP.md) para o plano completo de desenvolvimento._
FFMPEG_PATH=C:/Program Files/ffmpeg/bin/ffmpeg.exe
API_PROVIDER=gemini # ou 'openai'
```

4.  Compile o projeto TypeScript:

    ```bash
    npm run build
    ```

## 🛠️ Scripts Disponíveis

O projeto utiliza TypeScript e oferece os seguintes comandos:

### Pipeline Completo

- `npm start` ou `npm run pipeline`: Executa o pipeline completo automatizado
- `npm run build`: Compila o TypeScript para JavaScript
- `npm run dev`: Executa em modo desenvolvimento com watch

### Etapas Individuais

- `npm run buscar`: Busca as notícias mais recentes
- `npm run analisar`: Analisa e classifica as notícias coletadas
- `npm run roteiro`: Gera o roteiro do episódio do dia
- `npm run audio`: Gera os áudios (TTS) para o roteiro
- `npm run montar`: Monta o episódio final com mixagem

### Qualidade de Código

- `npm run lint`: Verifica a qualidade do código com ESLint
- `npm run format`: Formata o código usando Prettier
- `npm run type-check`: Verifica tipos TypeScript sem compilar

### Testes

- `npm test`: Executa todos os testes
- `npm run test:watch`: Executa testes em modo watch
- `npm run test:coverage`: Gera relatório de cobertura

O episódio final será salvo em `output/episodes/`.

## 📂 Estrutura do Projeto (AI-Friendly)

O projeto foi completamente reestruturado para ser **AI-friendly**, facilitando a colaboração com assistentes de IA:

```
podcast-ia/
├── 📚 docs/                  # Documentação centralizada
│   ├── AI_CONTEXT.md        # Contexto completo para IA
│   ├── ARCHITECTURE.md      # Arquitetura detalhada
│   └── MIGRATION_SUMMARY.md # Resumo da migração
├── 🎵 assets/               # Assets organizados
│   ├── audio/               # Trilhas, vinhetas, locuções
│   ├── images/              # Thumbnails e imagens
│   ├── templates/           # Templates de roteiro e configs
│   └── examples/            # Exemplos de uso
├── 📤 output/               # Saídas do pipeline
│   ├── audio/               # Episódios de áudio gerados
│   ├── episodes/            # Episódios finais processados
│   ├── scripts/             # Roteiros gerados
│   └── cache/               # Cache temporário
├── 🧠 src/                  # Código TypeScript
│   ├── config.ts            # Configuração centralizada
│   ├── types.ts             # Tipos e interfaces
│   ├── noticias/            # Busca e análise de notícias
│   ├── roteiro/             # Geração de roteiros
│   ├── producao/            # Geração de áudio (TTS)
│   ├── mixagem/             # Montagem do episódio
│   └── utils/               # Utilitários (logger, fileHelpers)
├── 🧪 tests/                # Testes estruturados
│   ├── unit/                # Testes unitários
│   ├── integration/         # Testes de integração
│   ├── ai/                  # Testes de IA e prompts
│   └── fixtures/            # Dados de teste
├── 📜 scripts/              # Automação e ferramentas
│   └── ai-tools/            # Scripts específicos de IA
├── 📄 data/                 # Configurações e dados JSON
└── dist/                    # Código compilado (auto-gerado)
```

### 🎯 Benefícios da Nova Estrutura

- **🤖 AI-Friendly**: Estrutura clara e previsível para assistentes de IA
- **📖 Autodocumentada**: JSDoc rica e tipos TypeScript detalhados
- **🔧 Manutenível**: Código organizado em módulos bem definidos
- **🧪 Testável**: Estrutura preparada para testes automatizados
- **📦 Escalável**: Fácil adicionar novos coletores e funcionalidades

## � Colaboração com IA

Este projeto foi especialmente estruturado para facilitar a colaboração com assistentes de IA:

- **📚 Documentação Rica**: Cada módulo possui contexto completo com JSDoc
- **🎯 Tipos Explícitos**: TypeScript com interfaces detalhadas e exemplos
- **📖 Guias de Contexto**: Documentos específicos em [`docs/`](docs/) para orientar IA
- **🔄 Padrões Consistentes**: Convenções claras em todo o codebase

### Para Assistentes de IA

Se você é uma IA colaborando neste projeto:

1. **Comece lendo**: [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md)
2. **Entenda a arquitetura**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. **Veja exemplos**: [`assets/examples/`](assets/examples/)
4. **Consulte tipos**: [`src/types.ts`](src/types.ts) tem todas as interfaces

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# APIs de IA (obrigatórias)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Configurações do pipeline
API_PROVIDER=gemini              # 'openai' ou 'gemini'
MAX_NOTICIAS=4                   # Máximo de notícias principais
RELEVANCE_THRESHOLD=10           # Threshold de relevância (0-100)

# Configurações de áudio
FFMPEG_PATH=C:/path/to/ffmpeg.exe
CROSSFADE_DURATION=2             # Duração do crossfade (segundos)

# Futuras configurações (roadmap)
# SPOTIFY_CLIENT_ID=your_spotify_id
# YOUTUBE_API_KEY=your_youtube_key
# INSTAGRAM_ACCESS_TOKEN=your_ig_token
# DISCORD_BOT_TOKEN=your_discord_token
```

### Personalizando o Pipeline

O pipeline é altamente configurável através do arquivo [`src/config.ts`](src/config.ts):

- **Fontes de notícias**: Adicione novos coletores em [`src/noticias/collectors/`](src/noticias/collectors/)
- **Classificação**: Ajuste categorias e pesos no `config.analise`
- **Personagens**: Configure vozes e estilos em [`data/personagens.json`](data/personagens.json)
- **Trilhas sonoras**: Organize áudios em [`assets/audio/`](assets/audio/)

### 🎯 Configurações Futuras (Roadmap)

**Distribuição Multi-Plataforma:**

```typescript
// Configuração planejada para Fase 10-11
interface DistributionConfig {
  platforms: {
    spotify: SpotifyConfig;
    youtube: YouTubeConfig;
    social: SocialMediaConfig;
  };
  scheduling: SchedulingStrategy;
  analytics: AnalyticsConfig;
}
```

**Sistema de Comunidade:**

```typescript
// Configuração planejada para Fase 13
interface CommunityConfig {
  chatbot: ChatbotConfig;
  moderation: ModerationRules;
  engagement: EngagementStrategies;
}
```

## �🤝 Contribuindo

O Bubuia News é um projeto em constante evolução! Sinta-se à vontade para:

### Como Contribuir

1. **Fork** este repositório
2. **Clone** seu fork localmente
3. **Instale** as dependências: `npm install`
4. **Crie** uma branch para sua feature: `git checkout -b minha-feature`
5. **Teste** suas mudanças: `npm test`
6. **Commit** suas alterações: `git commit -m "feat: minha nova feature"`
7. **Push** para sua branch: `git push origin minha-feature`
8. **Abra** um Pull Request

### 🎯 Áreas de Contribuição Prioritárias

**Funcionalidades Core (Disponível Agora):**

- 🔍 **Novos coletores** de fontes de notícias locais
- 🎯 **Melhorias de IA** (prompts, classificação, análise)
- 🎵 **Recursos de áudio** (trilhas, efeitos, vozes regionais)
- 🧪 **Testes automatizados** e validação
- 📚 **Documentação** e exemplos práticos

**Expansões Futuras (Roadmap):**

- 📡 **APIs de distribuição** (Spotify, YouTube, redes sociais)
- 🤖 **Chatbots e automação** para engajamento
- 📊 **Analytics e métricas** avançadas
- 🏗️ **Infraestrutura escalável** e multi-tenant
- 🌐 **Internacionalização** para outras regiões

### Diretrizes

- Siga os padrões TypeScript estabelecidos
- Adicione testes para novas funcionalidades
- Documente código com JSDoc
- Use conventional commits

---

Feito com ❤️, ☕ e muito código por [Tapejara Lira](https://github.com/tapejaralira).
