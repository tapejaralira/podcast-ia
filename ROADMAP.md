# 🗺️ Roadmap de Melhorias - Bubuia News

## Objetivo

Tornar o projeto Bubuia News mais **AI friendly**, facilitando a manutenção, extensibilidade e colaboração com assistentes de IA.

## Princípios Orientadores

- ✅ **Segurança primeiro**: Implementar melhorias sem quebrar funcionalidades existentes
- 🧪 **Testes contínuos**: Validar cada etapa antes de prosseguir
- 📚 **Documentação viva**: Manter documentação sempre atualizada
- 🔄 **Iteração incremental**: Pequenas mudanças com grandes impactos

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

## 🧪 Fase 2: Testes e Validação (1-2 semanas)

_Objetivo: Garantir qualidade e detectar regressões_

### 2.1 Estrutura de Testes

- [ ] **Setup básico de testes**
  - Instalar Jest/Vitest
  - Configurar `jest.config.js` ou `vitest.config.ts`
  - Criar pasta `src/__tests__/`

### 2.2 Testes Unitários Críticos

- [ ] **Testar coletores de notícias**

  ```typescript
  // src/__tests__/collectors.test.ts
  describe('Collectors', () => {
    test('acriticaCollector deve retornar NoticiaCrua[]', async () => {
      // Mock da requisição HTTP
      // Testar estrutura de retorno
    });
  });
  ```

- [ ] **Testar análise de notícias**
  ```typescript
  // src/__tests__/analisarNoticias.test.ts
  describe('Análise de Notícias', () => {
    test('deve classificar notícia adequada corretamente', () => {
      // Testar lógica de classificação sem chamar API
    });
  });
  ```

### 2.3 Testes de Integração

- [ ] **Testar pipeline completo com dados mock**
- [ ] **Validar estrutura de arquivos gerados**

### 2.4 Scripts de Validação

- [ ] **Criar scripts/validate-data.ts**
  - Validar estrutura de `data/episodio-do-dia.json`
  - Validar `data/noticias-recentes.json`
  - Validar roteiros gerados

---

## 🔧 Fase 3: Refatoração Inteligente (2-3 semanas)

_Objetivo: Melhorar legibilidade e manutenibilidade_

### 3.1 Separação de Responsabilidades

- [ ] **Extrair prompts para arquivos separados**
  - Criar `src/prompts/classificar-noticia.md`
  - Criar `src/prompts/gerar-dialogo.md`
  - Criar `src/prompts/gerar-abertura.md`
  - **Exemplo de uso:**
    ```typescript
    import { loadPrompt } from './utils/promptLoader.js';
    const prompt = await loadPrompt('classificar-noticia', { noticia });
    ```

- [ ] **Modularizar funções grandes**
  - Quebrar `gerarRoteiro()` em funções menores
  - Extrair lógica de `analisarNoticias()` em módulos
  - Criar `src/services/` para lógicas de negócio

### 3.2 Sistema de Plugins para Coletores

- [ ] **Auto-descoberta de coletores**
  ```typescript
  // src/noticias/collectorRegistry.ts
  export async function discoverCollectors(): Promise<Collector[]> {
    const files = await fs.readdir('./src/noticias/collectors');
    // Auto-import de todos os coletores
  }
  ```

### 3.3 Pipeline Configurável

- [ ] **Tornar etapas do pipeline plugáveis**
  ```typescript
  // src/pipeline/PipelineRunner.ts
  export class PipelineRunner {
    private steps: PipelineStep[] = [];

    addStep(step: PipelineStep) {
      /* ... */
    }
    async run() {
      /* ... */
    }
  }
  ```

---

## 🚀 Fase 4: Funcionalidades Avançadas (2-3 semanas)

_Objetivo: Adicionar recursos que facilitam IA e automação_

### 4.1 Sistema de Cache Inteligente

- [ ] **Cache de análises de IA**
  - Evitar reprocessar notícias idênticas
  - Cache baseado em hash do conteúdo
  ```typescript
  // src/services/cacheService.ts
  export class CacheService {
    async get<T>(key: string): Promise<T | null> {
      /* ... */
    }
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      /* ... */
    }
  }
  ```

### 4.2 Monitoramento e Métricas

- [ ] **Sistema de métricas**
  - Tempo de execução de cada etapa
  - Número de notícias processadas
  - Taxa de sucesso das APIs
  ```typescript
  // src/utils/metrics.ts
  export class MetricsCollector {
    trackExecutionTime(operation: string, duration: number) {
      /* ... */
    }
    trackApiSuccess(service: string, success: boolean) {
      /* ... */
    }
  }
  ```

### 4.3 Retry e Recuperação

- [ ] **Sistema de retry para APIs**
  ```typescript
  // src/utils/retry.ts
  export async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    backoff: number = 1000
  ): Promise<T> {
    /* ... */
  }
  ```

---

## 📚 Fase 5: Documentação Avançada (1 semana)

_Objetivo: Criar documentação que facilita colaboração com IA_

### 5.1 Documentação Técnica

- [ ] **Criar ARCHITECTURE.md**
  - Diagrama do pipeline
  - Fluxo de dados
  - Decisões arquiteturais

- [ ] **Criar API.md**
  - Documentar todas as interfaces públicas
  - Exemplos de uso
  - Padrões de entrada/saída

### 5.2 Guias de Desenvolvimento

- [ ] **Criar CONTRIBUTING.md**
  - Como adicionar novos coletores
  - Como modificar prompts de IA
  - Padrões de código

- [ ] **Criar TROUBLESHOOTING.md**
  - Problemas comuns e soluções
  - Logs importantes
  - Como debugar cada etapa

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

### Métricas Qualitativas

- [ ] **IA consegue entender e sugerir melhorias facilmente**
- [ ] **Novos coletores podem ser adicionados em < 30 min**
- [ ] **Debugging é mais rápido e claro**
- [ ] **Onboarding de novos desenvolvedores < 1 dia**

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

### Checkpoints Obrigatórios

- [ ] **Fim da Fase 1**: Pipeline ainda funciona 100%
- [ ] **Fim da Fase 2**: Testes cobrem cenários críticos
- [ ] **Fim da Fase 3**: Código mais legível e manutenível
- [ ] **Fim da Fase 4**: Funcionalidades avançadas agregam valor
- [ ] **Fim da Fase 5**: Documentação facilita onboarding
- [ ] **Fim da Fase 6**: Processo de desenvolvimento automatizado

---

## 🎯 Próximos Passos Imediatos

1. **Começar pela Fase 1.1** - Adicionar JSDoc em `src/types.ts`
2. **Configurar ambiente de testes** - Setup básico Jest/Vitest
3. **Criar branch `roadmap/fase-1`** para implementação incremental

---

## 📝 Notas de Implementação

- **Cada fase deve ser uma PR separada**
- **Documentar decisões técnicas em ADRs (Architecture Decision Records)**
- **Manter changelog atualizado**
- **Testar sempre em ambiente local antes de mergear**

---

_Este roadmap é um documento vivo. Ajuste conforme necessário baseado no feedback e nas descobertas durante a implementação._
