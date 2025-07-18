# 🛠️ AI Templates - Bubuia News

## 📋 Templates Prontos para Copy-Paste

### 🔧 Template de Função Completa

```typescript
import { validateWithSchema } from '../utils/validation.js';
import { logInfo, logError } from '../utils/logger.js';
import { MeuSchema, MeuOutputSchema } from '../schemas/core.schemas.js';

/**
 * @ai-purpose [SUBSTITUA: Descreva exatamente o que esta função faz]
 * @ai-input-format [SUBSTITUA: Formato dos dados de entrada]
 * @ai-output-format [SUBSTITUA: Formato dos dados de saída]
 * @ai-dependencies [SUBSTITUA: APIs, módulos, arquivos necessários]
 * @ai-error-handling Try/catch com logs estruturados e retry se apropriado
 * @ai-performance [SUBSTITUA: Tempo esperado, limitações conhecidas]
 * @ai-context [SUBSTITUA: Contexto específico, configurações especiais]
 * @ai-validation MeuSchema para entrada, MeuOutputSchema para saída
 * @ai-side-effects [SUBSTITUA: Arquivos criados, APIs chamadas, etc]
 * @ai-cost [SUBSTITUA: Custo aproximado em tokens/USD se aplicável]
 * @ai-quality-factors [SUBSTITUA: O que afeta a qualidade do resultado]
 * @ai-optimization-tips [SUBSTITUA: Como otimizar performance/qualidade]
 * @ai-common-errors [SUBSTITUA: Erros comuns e como evitar]
 * @ai-debugging [SUBSTITUA: Como debugar problemas]
 * @ai-monitoring [SUBSTITUA: Métricas importantes para monitorar]
 * @ai-scaling [SUBSTITUA: Considerações para escala]
 * @ai-business-impact [SUBSTITUA: Impacto no produto final]
 * @ai-example minhaFuncao({ dados: [...] }) → { resultado: [...] }
 */
export async function minhaFuncao(input: MeuInput): Promise<MeuOutput> {
  // 1. Validar entrada
  const validInput = validateWithSchema(input, MeuSchema, 'minhaFuncao.input');

  // 2. Log início com contexto
  logInfo('Iniciando minhaFuncao', {
    inputSize: validInput.dados.length,
    timestamp: new Date().toISOString(),
  });

  try {
    // 3. Processamento principal
    const startTime = Date.now();
    const resultado = await processarDados(validInput);
    const duration = Date.now() - startTime;

    // 4. Validar saída
    const validOutput = validateWithSchema(
      resultado,
      MeuOutputSchema,
      'minhaFuncao.output'
    );

    // 5. Log sucesso com métricas
    logInfo('minhaFuncao concluída', {
      success: true,
      duration,
      outputSize: validOutput.resultado.length,
    });

    return validOutput;
  } catch (error) {
    logError('Erro em minhaFuncao', error, {
      input: sanitizeForLog(validInput),
      context: 'minhaFuncao',
    });
    throw error;
  }
}

// Função auxiliar para sanitizar logs
function sanitizeForLog(data: any): any {
  // Remove dados sensíveis para logs
  const { sensivelData, ...safe } = data;
  return safe;
}
```

### 🏗️ Template de Módulo Completo

```typescript
// src/[categoria]/[modulo].ts

import { z } from 'zod';
import { validateWithSchema } from '../utils/validation.js';
import { logInfo, logError } from '../utils/logger.js';
import { config } from '../config.js';

// Schemas específicos do módulo
export const ModuloInputSchema = z.object({
  dados: z.array(z.string()),
  opcoes: z
    .object({
      modo: z.enum(['rapido', 'preciso']).default('preciso'),
      limite: z.number().positive().default(10),
    })
    .optional(),
});

export const ModuloOutputSchema = z.object({
  resultados: z.array(
    z.object({
      id: z.string(),
      valor: z.number(),
      confianca: z.number().min(0).max(1),
    })
  ),
  metadados: z.object({
    totalProcessados: z.number(),
    tempoExecucao: z.number(),
    sucessoRate: z.number().min(0).max(1),
  }),
});

export type ModuloInput = z.infer<typeof ModuloInputSchema>;
export type ModuloOutput = z.infer<typeof ModuloOutputSchema>;

/**
 * @ai-purpose [SUBSTITUA: Propósito principal do módulo]
 * @ai-input-format ModuloInput com dados e opções configuráveis
 * @ai-output-format ModuloOutput com resultados e metadados
 * @ai-dependencies [SUBSTITUA: Dependências específicas]
 * @ai-error-handling Validação de entrada, retry em falhas de API, logs detalhados
 * @ai-performance [SUBSTITUA: Performance esperada]
 * @ai-context Configurações em config.[categoria], logs estruturados
 * @ai-validation ModuloInputSchema e ModuloOutputSchema garantem type safety
 * @ai-side-effects [SUBSTITUA: Efeitos colaterais]
 * @ai-cost [SUBSTITUA: Custos aproximados]
 * @ai-quality-factors Qualidade dos dados de entrada, configuração do modelo
 * @ai-optimization-tips Cache resultados, batch processing, configurar timeouts
 * @ai-common-errors Dados malformados, timeout de API, limite de tokens
 * @ai-debugging Verificar logs com contexto, validar entrada/saída
 * @ai-monitoring Taxa de sucesso, tempo de resposta, qualidade dos resultados
 * @ai-scaling Considera rate limits, batching para grandes volumes
 * @ai-business-impact [SUBSTITUA: Impacto no produto]
 * @ai-example processarModulo({ dados: ["texto1"], opcoes: { modo: "rapido" } })
 */
export async function processarModulo(
  input: ModuloInput
): Promise<ModuloOutput> {
  const validInput = validateWithSchema(
    input,
    ModuloInputSchema,
    'processarModulo.input'
  );

  logInfo('Iniciando processarModulo', {
    totalItems: validInput.dados.length,
    modo: validInput.opcoes?.modo || 'preciso',
  });

  const startTime = Date.now();
  const resultados = [];
  let sucessos = 0;

  try {
    for (const item of validInput.dados) {
      try {
        const resultado = await processarItem(item, validInput.opcoes);
        resultados.push(resultado);
        sucessos++;
      } catch (error) {
        logError('Erro ao processar item', error, {
          item: item.substring(0, 100),
        });
        // Continua processando outros itens
      }
    }

    const tempoExecucao = Date.now() - startTime;
    const sucessoRate = sucessos / validInput.dados.length;

    const output: ModuloOutput = {
      resultados,
      metadados: {
        totalProcessados: validInput.dados.length,
        tempoExecucao,
        sucessoRate,
      },
    };

    const validOutput = validateWithSchema(
      output,
      ModuloOutputSchema,
      'processarModulo.output'
    );

    logInfo('processarModulo concluído', {
      sucessos,
      total: validInput.dados.length,
      sucessoRate,
      tempoExecucao,
    });

    return validOutput;
  } catch (error) {
    logError('Erro fatal em processarModulo', error);
    throw error;
  }
}

// Função auxiliar interna
async function processarItem(item: string, opcoes?: ModuloInput['opcoes']) {
  // Implementação específica
  return {
    id: `item_${Date.now()}`,
    valor: Math.random(),
    confianca: 0.95,
  };
}
```

### 📊 Template de Schema Zod

```typescript
// src/schemas/[modulo].schemas.ts

import { z } from 'zod';

/**
 * Schema para [SUBSTITUA: descreva o propósito]
 * @ai-validation Garante [SUBSTITUA: o que garante]
 */
export const MeuNovoSchema = z.object({
  // Campos obrigatórios
  id: z.string().min(1, 'ID não pode estar vazio'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),

  // Campos com validação específica
  email: z.string().email('Email deve ser válido'),
  idade: z.number().int().min(0).max(120, 'Idade deve ser realista'),

  // Enums para valores controlados
  status: z.enum(['ativo', 'inativo', 'pendente']).default('pendente'),

  // Arrays com validação dos elementos
  tags: z.array(z.string().min(1)).default([]),

  // Objetos aninhados
  configuracao: z
    .object({
      tema: z.enum(['claro', 'escuro']).default('claro'),
      notificacoes: z.boolean().default(true),
      preferencias: z.record(z.string(), z.any()).optional(),
    })
    .optional(),

  // Campos opcionais
  descricao: z.string().optional(),

  // Campos com transformação
  criadoEm: z.string().datetime('Data deve estar no formato ISO'),
  atualizadoEm: z.string().datetime().optional(),

  // Validações customizadas
  senha: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma maiúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
});

/**
 * Schema para resposta de API
 * @ai-validation Garante formato consistente de resposta
 */
export const MeuNovoResponseSchema = z.object({
  sucesso: z.boolean(),
  dados: MeuNovoSchema.optional(),
  erro: z
    .object({
      codigo: z.string(),
      mensagem: z.string(),
      detalhes: z.record(z.any()).optional(),
    })
    .optional(),
  metadados: z.object({
    timestamp: z.string().datetime(),
    versao: z.string(),
    tempoExecucao: z.number().positive(),
  }),
});

// Exports de tipos
export type MeuNovoTipo = z.infer<typeof MeuNovoSchema>;
export type MeuNovoResponse = z.infer<typeof MeuNovoResponseSchema>;

// Schemas derivados
export const MeuNovoCreateSchema = MeuNovoSchema.omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const MeuNovoUpdateSchema = MeuNovoSchema.partial().omit({
  id: true,
  criadoEm: true,
});

export type MeuNovoCreate = z.infer<typeof MeuNovoCreateSchema>;
export type MeuNovoUpdate = z.infer<typeof MeuNovoUpdateSchema>;
```

### 🎯 Template de Prompt Estruturado

```typescript
// src/ai/prompts/[categoria]-prompts.ts

import { createPromptTemplate, PromptTemplate } from './prompt-template.js';

/**
 * Template para [SUBSTITUA: propósito específico]
 */
export const meuPromptTemplate: PromptTemplate = createPromptTemplate(
  'meu-prompt-v1',
  'Nome Descritivo do Prompt',
  `Você é um especialista em [SUBSTITUA: domínio].

Contexto:
{{contexto}}

Tarefa:
Analise o seguinte conteúdo e [SUBSTITUA: tarefa específica]:

Conteúdo:
{{conteudo}}

Parâmetros:
- Foco: {{foco}}
- Nível de detalhe: {{nivelDetalhe}}
- Formato de saída: {{formatoSaida}}

Restrições:
- Mantenha o tom {{tom}}
- Limite a resposta a {{limiteCaracteres}} caracteres
- Use apenas informações fornecidas
- Seja objetivo e preciso

Formato de resposta esperado:
\`\`\`json
{
  "resultado": "...",
  "confianca": 0.95,
  "justificativa": "...",
  "metadados": {
    "categorias": ["..."],
    "palavrasChave": ["..."]
  }
}
\`\`\`

Responda APENAS com o JSON válido.`,
  [
    'contexto',
    'conteudo',
    'foco',
    'nivelDetalhe',
    'formatoSaida',
    'tom',
    'limiteCaracteres',
  ],
  {
    description: 'Template para [SUBSTITUA: descrição detalhada]',
    constraints: [
      'Resposta deve ser JSON válido',
      'Confiança deve ser entre 0 e 1',
      'Justificativa deve explicar o raciocínio',
      'Metadados devem incluir categorização',
    ],
    examples: [
      {
        input: {
          contexto: 'Análise de sentimento para podcast',
          conteudo: 'Notícia sobre política local',
          foco: 'impacto regional',
          nivelDetalhe: 'alto',
          formatoSaida: 'estruturado',
          tom: 'neutro',
          limiteCaracteres: '500',
        },
        expectedOutput: '{"resultado": "Positivo", "confianca": 0.87, ...}',
      },
    ],
    config: {
      temperature: 0.3,
      maxTokens: 1000,
    },
  }
);

/**
 * Função helper para usar o prompt
 */
export async function usarMeuPrompt(
  contexto: string,
  conteudo: string,
  opcoes: {
    foco?: string;
    nivelDetalhe?: 'baixo' | 'medio' | 'alto';
    formatoSaida?: string;
    tom?: string;
    limiteCaracteres?: number;
  } = {}
) {
  const variables = {
    contexto,
    conteudo,
    foco: opcoes.foco || 'geral',
    nivelDetalhe: opcoes.nivelDetalhe || 'medio',
    formatoSaida: opcoes.formatoSaida || 'estruturado',
    tom: opcoes.tom || 'neutro',
    limiteCaracteres: opcoes.limiteCaracteres || 500,
  };

  const prompt = renderTemplate(meuPromptTemplate, variables);

  // Aqui você chamaria sua API de IA
  // const response = await openai.chat.completions.create(...)

  return prompt; // Por enquanto retorna apenas o prompt renderizado
}
```

### 🧪 Template de Teste

```typescript
// src/[categoria]/__tests__/[modulo].test.ts

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { minhaFuncao } from '../minhaFuncao.js';

describe('minhaFuncao', () => {
  beforeEach(() => {
    // Setup antes de cada teste
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup após cada teste
  });

  describe('casos de sucesso', () => {
    it('deve processar dados válidos corretamente', async () => {
      // Arrange
      const input = {
        dados: ['item1', 'item2'],
        opcoes: { modo: 'rapido' as const },
      };

      // Act
      const result = await minhaFuncao(input);

      // Assert
      expect(result.sucesso).toBe(true);
      expect(result.dados).toHaveLength(2);
      expect(result.metadados.totalProcessados).toBe(2);
    });

    it('deve usar valores padrão quando opções não fornecidas', async () => {
      const input = { dados: ['item1'] };
      const result = await minhaFuncao(input);

      expect(result.sucesso).toBe(true);
      // Verificar valores padrão aplicados
    });
  });

  describe('casos de erro', () => {
    it('deve falhar com dados inválidos', async () => {
      const input = { dados: [] }; // Array vazio inválido

      await expect(minhaFuncao(input)).rejects.toThrow('Validação falhou');
    });

    it('deve tratar erro de API graciosamente', async () => {
      // Mock de falha de API
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('API Error'));

      const input = { dados: ['item1'] };

      await expect(minhaFuncao(input)).rejects.toThrow('API Error');
    });
  });

  describe('casos extremos', () => {
    it('deve processar grande volume de dados', async () => {
      const input = {
        dados: Array(1000).fill('item'),
        opcoes: { modo: 'rapido' as const },
      };

      const result = await minhaFuncao(input);

      expect(result.metadados.totalProcessados).toBe(1000);
    });

    it('deve respeitar timeouts', async () => {
      // Teste de timeout se aplicável
    });
  });

  describe('integração', () => {
    it('deve integrar com outros módulos', async () => {
      // Testes de integração
    });
  });
});
```

### 📝 Template de Documentação

```markdown
# [Nome do Módulo]

## 📋 Visão Geral

[SUBSTITUA: Descrição de uma linha do que o módulo faz]

## 🎯 Propósito

[SUBSTITUA: Explicação detalhada do problema que resolve]

## 🔧 Como Usar

### Instalação

\`\`\`bash

# Se for um novo módulo

npm install [dependências]
\`\`\`

### Uso Básico

\`\`\`typescript
import { minhaFuncao } from './[modulo].js';

const resultado = await minhaFuncao({
dados: ['exemplo'],
opcoes: { modo: 'rapido' }
});
\`\`\`

### Uso Avançado

\`\`\`typescript
// Exemplo com todas as opções
const resultado = await minhaFuncao({
dados: dados,
opcoes: {
modo: 'preciso',
limite: 50,
configuracaoEspecial: true
}
});
\`\`\`

## 📊 Interface

### Input

\`\`\`typescript
interface ModuloInput {
dados: string[];
opcoes?: {
modo: 'rapido' | 'preciso';
limite: number;
};
}
\`\`\`

### Output

\`\`\`typescript
interface ModuloOutput {
sucesso: boolean;
dados: ResultadoItem[];
metadados: {
totalProcessados: number;
tempoExecucao: number;
};
}
\`\`\`

## ⚡ Performance

- **Tempo típico**: [SUBSTITUA: tempo esperado]
- **Limitações**: [SUBSTITUA: limitações conhecidas]
- **Otimizações**: [SUBSTITUA: dicas de otimização]

## 🚨 Tratamento de Erros

- **Validação**: Dados de entrada são validados com Zod
- **API**: Falhas de API são tratadas com retry automático
- **Logs**: Todos os erros são logados com contexto

## 🧪 Testes

\`\`\`bash
npm test -- [modulo].test.ts
\`\`\`

## 📈 Métricas

- Taxa de sucesso esperada: >95%
- Tempo médio de execução: [X]ms
- Uso de memória: [X]MB

## 🔗 Dependências

- [SUBSTITUA: listar dependências principais]

## 📝 Changelog

- v1.0.0: Implementação inicial
- [SUBSTITUA: adicionar mudanças]
```

## 🎯 Como Usar os Templates

1. **Copie o template** apropriado
2. **Substitua** todos os `[SUBSTITUA: ...]` com valores específicos
3. **Adapte** o código para sua necessidade
4. **Teste** a implementação
5. **Documente** mudanças se necessário

## 💡 Dicas Importantes

- **Sempre valide** entrada e saída com Zod
- **Use logs estruturados** para debugging
- **Implemente error handling** robusto
- **Documente com AI tags** completas
- **Teste casos extremos** além dos básicos
- **Monitore performance** em produção

**🎉 Com estes templates, qualquer IA pode criar código de alta qualidade que se integra perfeitamente ao projeto Bubuia News!**
