# 🗺️ Roadmap de Melhorias - Bubuia News

## Objetivo

Tornar o projeto Bubuia News mais **AI friendly**, facilitando a manutenção, extensibilidade e colaboração com assistentes de IA.

**🎯 Com a migração TypeScript completa, focamos agora em:**

- 🤖 **Compreensibilidade para IA**: Código autodocumentado e estruturas previsíveis
- 📋 **Manutenibilidade assistida**: Padrões que facilitam refatoração automática
- 🔄 **Iteração rápida**: Estruturas que permitem modificações seguras
- 📚 **Conhecimento explícito**: Documentação inline que IA pode interpretar

## Princípios Orientadores (Atualizado)

- ✅ **Segurança primeiro**: Implementar melhorias sem quebrar funcionalidades existentes
- 🧪 **Testes contínuos**: Validar cada etapa antes de prosseguir
- 📚 **Documentação viva**: Manter documentação sempre atualizada
- 🔄 **Iteração incremental**: Pequenas mudanças com grandes impactos
- 🤖 **AI-First Design**: Estruturas que IA consegue compreender e modificar facilmente
- 🏗️ **Arquitetura Explícita**: Padrões claros e consistentes em todo o codebase
- 📖 **Contexto Rico**: Cada módulo tem contexto suficiente para ser compreendido isoladamente

---

## 📋 Fase 1: Fundação (1-2 semanas)

_Objetivo: Estabelecer bases sólidas sem alterar funcionalidades_

### 1.1 Documentação e Tipos Básicos

- [x] **JSDoc em todas as funções principais**
  - ✅ Concluído: `src/types.ts` (interfaces já existentes)
  - ✅ Expandido para todas as interfaces com exemplos práticos
  - **Template JSDoc padrão:**
    ```typescript
    /**
     * Analisa e classifica notícias brutas usando IA
     * @param noticias Array de notícias brutas coletadas
     * @returns Pauta organizada com cold open e notícias principais
     * @throws {Error} Quando falha ao acessar API de IA
     */
    ```

- [x] **Expandir types.ts com tipos ausentes**
  - ✅ Criadas interfaces para respostas de APIs (OpenAI, Gemini)
  - ✅ Criados enums para constantes (trilhas, categorias, logs)
  - ✅ Criados tipos para configurações
  - **Exemplo:**

    ```typescript
    export enum TrilhaSonora {
      TENSAO_LEVE = 'trilha_tensao_leve.mp3',
      INFORMATIVA_NEUTRA = 'trilha_informativa_neutra.mp3',
      // ...
    }

    export interface OpenAIClassificationResponse {
      classification_id: string;
      is_adequate: boolean;
    }
    ```

### 1.2 Configuração Central

- [x] **Expandir src/config.ts**
  - ✅ Centralizadas todas as constantes espalhadas pelo código
  - ✅ Adicionada validação de variáveis de ambiente (`validateConfig()`)
  - ✅ Criada função `validateConfig()` que roda no início
  - ✅ Adicionadas funções utilitárias (`getApiConfig()`, `getActiveApiProvider()`)
  - **Estrutura implementada:**
    ```typescript
    export const config = {
      ai: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY!,
          model: 'gpt-4o',
          maxTokens: 2000,
        },
        gemini: {
          apiKey: process.env.GEMINI_API_KEY!,
          model: 'gemini-2.0-flash',
        },
      },
      paths: {
        data: 'data',
        audios: 'audios',
        // ...
      },
      pipeline: {
        maxNoticias: 4,
        relevanceThreshold: 10,
      },
    };
    ```

### 1.3 Utilitários Básicos

- [x] **Criar src/utils/logger.ts**
  - ✅ Sistema de logging centralizado implementado
  - ✅ Diferentes níveis de log (INFO, WARN, ERROR, DEBUG)
  - ✅ Função para medir tempo de execução
  - ✅ Logger contextual para módulos específicos

  ```typescript
  export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
  }

  export function log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, data || '');
  }
  ```

- [x] **Criar src/utils/fileHelpers.ts**
  - ✅ Funções para carregar/salvar JSON com tipagem
  - ✅ Funções para manipulação de arquivos com tratamento de erro
  - ✅ Utilitários para validação de arquivos e diretórios
  ```typescript
  /**
   * Carrega e valida arquivo JSON com tipagem
   */
  export async function loadJsonFile<T>(path: string): Promise<T> {
    // Implementação com tratamento de erro e validação
  }
  ```

---

## 🧪 Fase 2: Estrutura AI-Friendly (1-2 semanas)

_Objetivo: Criar estruturas que IA consegue compreender e modificar facilmente_

### 2.1 Schema e Validação de Dados

- [ ] **Criar schemas Zod para validação**

  ```typescript
  // src/schemas/noticia.schema.ts
  import { z } from 'zod';

  export const NoticiaCruaSchema = z.object({
    titulo: z.string().min(1),
    url: z.string().url(),
    fonte: z.string(),
    // Schema completo com validação
  });
  ```

- [ ] **Validação automática em tempo de execução**
  - Validar dados de entrada de APIs
  - Validar estruturas de arquivos JSON
  - Logs detalhados de falhas de validação

### 2.2 Estrutura de Prompts Inteligente

- [ ] **Sistema de prompts estruturado**

  ```typescript
  // src/prompts/index.ts
  export interface PromptTemplate {
    id: string;
    description: string;
    template: string;
    variables: string[];
    examples: PromptExample[];
  }
  ```

- [ ] **Prompts com versionamento e A/B testing**
  - Múltiplas versões de prompts
  - Métricas de efetividade
  - Rollback automático se performance cair

### 2.3 Testes Orientados a IA

- [ ] **Testes com dados sintéticos**
  - Gerar datasets de teste usando IA
  - Testar edge cases automaticamente
  - Validar outputs com IA

- [ ] **Snapshots de respostas IA**
  ```typescript
  // src/__tests__/ai-responses.test.ts
  test('classificação deve ser consistente', async () => {
    const response = await classifyNews(mockNews);
    expect(response).toMatchAISnapshot();
  });
  ```

---

## 🔧 Fase 3: Padrões AI-Native (2-3 semanas)

_Objetivo: Implementar padrões que facilitam colaboração com IA_

### 3.1 Arquitetura Declarativa

- [ ] **Pipeline baseado em configuração**

  ```typescript
  // src/pipeline/pipeline.config.ts
  export const pipelineConfig: PipelineConfig = {
    steps: [
      { name: 'collect', module: 'noticias/buscarNoticias', parallel: true },
      {
        name: 'analyze',
        module: 'noticias/analisarNoticias',
        deps: ['collect'],
      },
      { name: 'script', module: 'roteiro/gerarRoteiro', deps: ['analyze'] },
    ],
  };
  ```

- [ ] **Auto-descoberta de módulos**
  - Registro automático de coletores
  - Descoberta de prompts e templates
  - Validação automática de interfaces

### 3.2 Contexto Rico para IA

- [ ] **Documentação inline estruturada**

  ```typescript
  /**
   * @ai-purpose Coleta notícias de fontes locais do Amazonas
   * @ai-input-format URL da fonte, filtros opcionais
   * @ai-output-format Array de NoticiaCrua com metadados
   * @ai-failure-modes Rate limiting, site indisponível, estrutura HTML alterada
   * @ai-dependencies cheerio para parsing, axios para HTTP
   */
  export async function coletarNoticias(
    fonte: FonteNoticia
  ): Promise<NoticiaCrua[]>;
  ```

- [ ] **Metadata rica em cada módulo**
  - Propósito e responsabilidades
  - Dependências e side effects
  - Exemplos de uso e edge cases

### 3.3 Estruturas Autorreflexivas

- [ ] **Sistema de métricas inteligente**

  ```typescript
  // src/utils/aiMetrics.ts
  export class AIMetrics {
    trackPromptEffectiveness(
      promptId: string,
      input: any,
      output: any,
      quality: number
    ) {
      // Analisa padrões de sucesso/falha
      // Sugere melhorias automáticas
    }
  }
  ```

- [ ] **Auto-otimização de prompts**
  - Análise de padrões de sucesso
  - Sugestões de melhorias
  - A/B testing automático

### 3.4 Limpeza de Código Legacy

- [x] **Migrar todos os scripts para nova estrutura de configuração** ✅
  - ✅ Substituir imports de `config` por `newConfig` onde aplicável
  - ✅ Atualizar scripts em `noticias/`, `roteiro/`, `producao/`, `mixagem/`
  - ✅ Testar cada script após migração

- [x] **Remover arquivos legacy obsoletos** ✅ **CONCLUÍDO**
  - ✅ Removidos scripts JS legacy: `roteiro/gerarRoteiro.js`, `roteiro/sugerirAbertura.js`
  - ✅ Diretório `roteiro/` legacy removido
  - ✅ Arquivos de teste temporários removidos
  - ✅ Compilação TypeScript validada pós-limpeza

- [ ] **Remover configuração legacy (`configLegacy`)**
  - Verificar que nenhum arquivo ainda usa propriedades antigas
  - Remover `configLegacy` e export `{ configLegacy as config }`
  - Limpar propriedades obsoletas em `src/types.ts`

- [x] **Consolidar utilitários antigos** ✅
  - ✅ Migrar funções utilitárias espalhadas para `src/utils/`
  - ✅ Remover duplicações de código
  - ✅ Padronizar tratamento de erros

- [ ] **Documentar mudanças breaking**
  - Criar `MIGRATION.md` com guia de migração
  - Listar todas as propriedades removidas/alteradas
  - Exemplos antes/depois para cada mudança

**Checklist de Migração:**

```typescript
// ❌ Padrão antigo (a ser removido)
import { config } from './src/config.js';
const model = config.models.roteiro;

// ✅ Padrão novo (migrado)
import { newConfig } from './src/config.js';
const model = newConfig.ai.gemini.model;
```

---

## 🚀 Fase 4: IA como Colaborador (2-3 semanas)

_Objetivo: Transformar IA de ferramenta em colaborador ativo_

### 4.1 Sistema de Feedback Inteligente

- [ ] **IA analisa próprio output**

  ```typescript
  // src/ai/selfReflection.ts
  export async function analyzeOwnOutput(
    prompt: string,
    output: string,
    context: any
  ): Promise<QualityAnalysis> {
    // IA analisa se seu próprio output faz sentido
    // Sugere melhorias ou indica problemas
  }
  ```

- [ ] **Sistema de aprendizado contínuo**
  - IA coleta feedback sobre suas respostas
  - Ajusta estratégias baseado em resultados
  - Mantém histórico de padrões bem-sucedidos

### 4.2 Colaboração Multimodal

- [ ] **IA gera e valida código**

  ```typescript
  // src/ai/codeGeneration.ts
  export class AICodeGenerator {
    async generateCollector(sourceDescription: string): Promise<string> {
      // Gera novo coletor baseado em descrição
      // Valida sintaxe e testa automaticamente
    }

    async reviewCode(code: string): Promise<CodeReview> {
      // IA faz code review de mudanças
      // Sugere melhorias e detecta problemas
    }
  }
  ```

- [ ] **IA como Product Owner**
  - Analisa métricas de engajamento
  - Sugere novos recursos baseado em dados
  - Prioriza melhorias automaticamente

### 4.3 Orquestração Inteligente

- [ ] **Pipeline que se auto-otimiza**
  ```typescript
  // src/pipeline/selfOptimizing.ts
  export class SelfOptimizingPipeline {
    async adjustParameters(): Promise<void> {
      // Analisa performance histórica
      // Ajusta timeouts, retry logic, etc.
      // Testa mudanças com traffic pequeno
    }
  }
  ```

---

## 📚 Fase 5: Documentação Viva e Inteligente (1 semana)

_Objetivo: Documentação que evolui com o código e ensina IA_

### 5.1 Documentação Auto-Gerativa

- [ ] **README.md que se atualiza sozinho**

  ```typescript
  // scripts/generateDocs.ts
  export async function generateLiveDocs(): Promise<void> {
    // Analisa código TypeScript
    // Extrai interfaces e exemplos
    // Gera documentação atualizada
  }
  ```

- [ ] **API docs com exemplos reais**
  - Extrai exemplos de testes automaticamente
  - Valida que exemplos ainda funcionam
  - Mostra casos de uso reais do código

### 5.2 Onboarding Inteligente para IA

- [ ] **Guia de contexto para IA**

  ```markdown
  # AI_CONTEXT.md

  ## Como este projeto funciona

  - Pipeline de notícias → análise → roteiro → áudio
  - IA é usada para: classificação, geração de roteiro, análise de conteúdo
  - Arquitetura modular com TypeScript rigoroso

  ## Padrões importantes para IA saber

  - Sempre usar schemas Zod para validação
  - Logs contextuais com logger centralizado
  - Prompts são versionados e testáveis
  ```

- [ ] **Mapa mental do codebase**
  - Diagrama automático de dependências
  - Fluxo de dados visualizado
  - Pontos de extensão marcados claramente

### 5.3 Knowledge Base Evolutiva

- [ ] **Decisões arquiteturais documentadas**

  ```typescript
  // docs/decisions/
  // ADR-001-typescript-migration.md
  // ADR-002-ai-prompt-structure.md
  // ADR-003-pipeline-orchestration.md
  ```

- [ ] **Troubleshooting com IA**
  - Base de conhecimento de erros comuns
  - IA sugere soluções baseado em logs
  - Aprende com resoluções bem-sucedidas

---

## ⚡ Fase 6: Automação e CI/CD (1 semana)

_Objetivo: Garantir qualidade contínua_

### 6.1 GitHub Actions

- [ ] **Setup de CI/CD**
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: npm ci
        - run: npm run lint
        - run: npm run test
        - run: npm run build
  ```

### 6.2 Hooks de Pre-commit

- [ ] **Setup Husky + lint-staged**
  - Lint automático antes do commit
  - Testes rápidos
  - Formatação automática

---

## 📊 Métricas de Sucesso

### Métricas Quantitativas

- [ ] **Cobertura de testes > 80%**
- [ ] **Tempo de build < 30s**
- [ ] **Lint warnings = 0**
- [ ] **TSDoc coverage > 90%**
- [ ] **Zero código legacy restante** ✅
- [ ] **100% migração para nova estrutura de config**
- [ ] **Schema coverage > 95%** (validação Zod)
- [ ] **AI context completeness > 90%** (documentação inline AI-friendly)

### Métricas Qualitativas AI-Friendly

- [ ] **IA consegue entender e sugerir melhorias facilmente** ✅
- [ ] **IA pode gerar novos coletores com < 3 iterações**
- [ ] **IA identifica bugs sem contexto externo**
- [ ] **Debugging assistido por IA é 50% mais rápido**
- [ ] **Onboarding de nova IA < 10 minutos** (tempo para IA entender projeto)
- [ ] **IA consegue fazer refatorações seguras autonomamente**
- [ ] **Taxa de sucesso de prompts > 85%**

---

## 🚨 Pontos de Atenção

### Riscos e Mitigações

1. **Breaking changes acidentais**
   - ✅ Manter testes de regressão sempre rodando
   - ✅ Usar feature flags para mudanças grandes

2. **Over-engineering**
   - ✅ Implementar apenas o que agrega valor imediato
   - ✅ Revisão semanal do progresso

3. **Dependências externas**
   - ✅ Manter APIs de IA mockáveis
   - ✅ Ter fallbacks para serviços externos

4. **Acúmulo de débito técnico (Legacy Code)**
   - ✅ Remover código legacy assim que migração for validada
   - ✅ Documentar todas as mudanças breaking em `MIGRATION.md`
   - ✅ Manter apenas uma forma de fazer cada coisa (eliminar duplicações)
   - ✅ Validar que pipeline funciona antes de remover código antigo
   - ✅ Ter fallbacks para serviços externos

### Checkpoints Obrigatórios

- [x] **Fim da Fase 1**: Pipeline ainda funciona 100% ✅ **CONCLUÍDO E VALIDADO**
  - ✅ JSDoc implementado em todos os tipos principais
  - ✅ Configuração centralizada com validação
  - ✅ Utilitários básicos (logger, fileHelpers) criados
  - ✅ Estrutura de tipos expandida e documentada
  - ✅ Compatibilidade retroativa mantida
  - ✅ Testes básicos da Fase 1 passando
  - ✅ **TESTE COMPLETO: Score 100% - TypeScript, Dados e Módulos OK**
  - ✅ **Migração JS→TS completa e funcional**
- [x] **Fim da Fase 1.5**: Estrutura de diretórios AI-friendly implementada ✅ **CONCLUÍDO**
  - ✅ Migração completa de `audios/` → `assets/audio/`
  - ✅ Migração completa de `audios_gerados/` → `output/audio/`
  - ✅ Migração completa de `episodios_finais/` → `output/episodes/`
  - ✅ Pipeline funcionando 100% com nova estrutura
  - ✅ Documentação base (`AI_CONTEXT.md`, `ARCHITECTURE.md`) criada
  - ✅ **Configuração atualizada com novos caminhos**
  - ✅ **TypeScript compilando sem erros**
  - ✅ **Estrutura completa AI-friendly implementada**
- [ ] **Próximo**: Iniciar Fase 2 (Estrutura AI-Friendly) - **PRONTO PARA EXECUTAR**
- [ ] **Fim da Fase 2**: Schemas Zod e prompts estruturados
- [ ] **Fim da Fase 3**: Padrões AI-Native + Zero código legacy
- [ ] **Fim da Fase 4**: IA como colaborador ativo
- [ ] **Fim da Fase 5**: Documentação viva e inteligente
- [ ] **Fim da Fase 6**: Automação e CI/CD completos

---

## 🎯 Próximos Passos Imediatos (Atualizado)

**Agora vamos executar a Fase 1.5 - Reestruturação Completa:**

1. **🏗️ IMPLEMENTAR AGORA**: Fase 1.5.1 - Criar nova estrutura de diretórios
2. **🔄 Migração**: Executar Fases A, B, C com validação contínua
3. **✅ Validação**: Teste completo do pipeline com nova estrutura
4. **📚 Documentação**: Criar `AI_CONTEXT.md` e `ARCHITECTURE.md`

**🚀 Após Fase 1.5 (estrutura limpa):**

- Implementar schemas Zod para validação robusta
- Extrair prompts para arquivos estruturados
- Implementar @ai-tags para documentação rica
- Pipeline de validação assistido por IA

**� Execução Imediata:**

```bash
# 1. Criar estrutura
mkdir -p docs assets/audio output/{audio,episodes} src/ai tests scripts

# 2. Executar migração automática
npm run migrate:structure

# 3. Validar pipeline
npm run test:pipeline
```

---

## 📝 Notas de Implementação

- **Cada fase deve ser uma PR separada**
- **Documentar decisões técnicas em ADRs (Architecture Decision Records)**
- **Manter changelog atualizado**
- **Testar sempre em ambiente local antes de mergear**

---

_Este roadmap é um documento vivo. Ajuste conforme necessário baseado no feedback e nas descobertas durante a implementação._

---

## 📁 Fase 1.5: Reestruturação AI-Friendly ✅ **CONCLUÍDA**

_Objetivo: Reorganizar estrutura de pastas para facilitar colaboração com IA_

### 1.5.1 Nova Estrutura de Diretórios ✅

- [x] **Criar estrutura AI-friendly completa**
  ```
  📚 docs/                    # Documentação viva para IA
  🎵 assets/audio/            # Áudios, trilhas, vinhetas organizados
  � output/audio/            # Episódios de áudio gerados
  📤 output/episodes/         # Episódios finais processados
  📤 output/cache/            # Cache temporário
  🧪 tests/                   # Testes estruturados
  📜 scripts/                 # Automação e ferramentas
  🧠 src/                     # Código TypeScript organizado
  ```

### 1.5.2 Migração Segura de Arquivos ✅

- [x] **Fase A: Criar estrutura (sem mover arquivos)**
- [x] **Fase B: Atualizar configuração com paths duplos**
- [x] **Fase C: Migrar arquivos gradualmente**
  - ✅ Migrado `audios/` → `assets/audio/`
  - ✅ Migrado `audios_gerados/` → `output/audio/`
  - ✅ Migrado `episodios_finais/` → `output/episodes/`

### 1.5.3 Atualização de Referências ✅

- [x] **Atualizar scripts de produção**
  - ✅ `src/producao/gerarAudio.ts` → usando novos paths
  - ✅ `src/mixagem/montarEpisodio.ts` → usando novos paths
  - ✅ Removidos todos os fallbacks e código legacy

- [ ] **Atualizar configurações**
  - `package.json` scripts
  - `README.md` documentação
  - `.gitignore` se necessário

### 1.5.4 Validação e Limpeza

- [ ] **Teste completo do pipeline**
  - Executar coleta → análise → roteiro → áudio → mixagem
  - Validar que todos os arquivos são gerados nos novos locais
  - Confirmar que assets são encontrados corretamente

- [ ] **Remoção de estrutura antiga**
  - Remover `audios/`, `audios_gerados/`, `episodios_finais/`
  - Limpar paths legacy do `src/config.ts`
  - Atualizar documentação final

### 1.5.5 Criação de Documentação Base

- [ ] **Criar `docs/AI_CONTEXT.md`**

### 1.5.4 Limpeza e Documentação ✅

- [x] **Remover código e estrutura legacy**
  - ✅ Removidos diretórios legacy (`audios/`, `audios_gerados/`, `episodios_finais/`)
  - ✅ Removidas referências legacy no código
  - ✅ Removido `configLegacy` e propriedades obsoletas
  - ✅ Limpeza completa de imports e tipos antigos

- [x] **Criar documentação AI-friendly**
  - ✅ `docs/AI_CONTEXT.md` - Contexto para IA
  - ✅ `docs/ARCHITECTURE.md` - Arquitetura da nova estrutura
  - ✅ Atualização do README.md
  - ✅ Documentação inline com JSDoc

- [x] **Validação final**
  - ✅ Compilação TypeScript sem erros
  - ✅ Todos os caminhos atualizados
  - ✅ Estrutura AI-friendly funcionando
  - ✅ Pipeline pronto para próximas fases

**🎯 Resultados da Fase 1.5:**

- ✅ **Estrutura AI-friendly**: Diretórios organizados logicamente
- ✅ **Código limpo**: Zero legacy, 100% TypeScript
- ✅ **Documentação rica**: Contexto completo para IA
- ✅ **Base sólida**: Pronto para automação e melhorias AI

---

_🚀 **PRÓXIMA FASE**: Fase 2 - Melhorias AI-First (prompts, schemas, automação)_
