# 🛠️ AI Templates - Bubuia News

## � **ATENÇÃO: LEIA ISTO PRIMEIRO**

### **❌ ERROS CRÍTICOS QUE SEMPRE ACONTECEM:**

1. **Inquirer.js**: NUNCA use `inquirer.confirm()` → Use `inquirer.prompt([{type: 'confirm'}])`
2. **Imports**: SEMPRE use `.js` → `import { x } from './module.js'`
3. **Schemas**: SEMPRE valide → `validateWithSchema(data, Schema, 'context')`
4. **CLI**: SEMPRE destructure → `const { resposta } = await inquirer.prompt(...)`
5. **Scripts Executáveis**: SEMPRE adicione logs iniciais → `console.log('🚀 Script iniciado...')`
6. **Detecção de Módulo**: NUNCA use `import.meta.url === file://` → Use `.includes('script-name')`

---

### **🚨 NOVO: Template Script Executável (EVITA EXECUÇÃO SILENCIOSA)**

```typescript
// src/scripts/[nome]-script.ts

import { validateWithSchema } from '../utils/validation.js';
import { logInfo, logError } from '../utils/logger.js';
import { MeuSchema } from '../schemas/core.schemas.js';

/**
 * @ai-purpose [SUBSTITUA: Propósito específico do script]
 * @ai-execution Via npm run ou tsx diretamente
 * @ai-silent-failure-prevention Logs iniciais obrigatórios, detecção robusta
 * @ai-error-handling Try/catch com contexto específico e stack trace
 * @ai-debugging Console logs em cada etapa crítica
 * @ai-validation Entrada e saída validadas, formato antigo detectado
 */

async function executarScript(): Promise<void> {
  // CRÍTICO: Log inicial para detectar se script executa
  console.log('🚀 Iniciando [NOME DO SCRIPT]...');

  try {
    // CRÍTICO: Log de cada etapa principal
    console.log('📂 Carregando dados...');
    const dados = await carregarDados();

    console.log('🔍 Validando dados...');
    const dadosValidados = validateWithSchema(
      dados,
      MeuSchema,
      'executarScript.input'
    );

    console.log('⚙️ Processando...');
    const resultado = await processarDados(dadosValidados);

    console.log('💾 Salvando resultado...');
    await salvarResultado(resultado);

    console.log('\n✅ Script concluído com sucesso!');
    console.log('📁 Resultado salvo em: [CAMINHO]');
  } catch (error) {
    // CRÍTICO: Error handling com contexto específico
    if (error instanceof Error) {
      // Detectar problemas específicos conhecidos
      if (
        error.message.includes('metadados: Required') ||
        error.message.includes('categorias: Required')
      ) {
        console.log('\n⚠️ Dados estão no formato antigo.');
        console.log('💡 Execute: npm run analisar:completo');
      } else if (error.message.includes('ENOENT')) {
        console.log('\n⚠️ Arquivo não encontrado.');
        console.log('💡 Execute primeiro: npm run coletar');
      } else {
        console.error('\n❌ Erro durante execução:', error.message);
        console.error('Stack:', error.stack);
      }
    } else {
      console.error('\n❌ Erro desconhecido:', error);
    }
    process.exit(1);
  }
}

// CRÍTICO: Detecção robusta de execução direta
if (
  import.meta.url.includes('[nome-script].ts') ||
  process.argv[1]?.includes('[nome-script]')
) {
  executarScript()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha crítica:', error);
      process.exit(1);
    });
}
```

---

## �📋 Templates Prontos para Copy-Paste

### 🎯 Template CLI Interface (INQUIRER CORRETO)

```typescript
// src/scripts/[nome]-cli.ts

import inquirer from 'inquirer';
import { validateWithSchema } from '../utils/validation.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * @ai-purpose Template CLI com inquirer.js CORRETO - evita erros de API
 * @ai-input-format Interação via terminal, dados validados
 * @ai-output-format Resultados estruturados, logs detalhados
 * @ai-dependencies inquirer (VERSÃO CORRETA), schemas Zod
 * @ai-error-handling CRÍTICO: inquirer.prompt([{...}]) NÃO inquirer.confirm()!
 * @ai-performance Interface responsiva, validação rápida
 * @ai-validation Cada input validado antes de processamento
 * @ai-common-errors inquirer.confirm/select/input (métodos diretos NÃO EXISTEM!)
 * @ai-debugging Logs em cada etapa, dados sanitizados
 * @ai-example npm run meu-cli → interface interativa
 */
export async function interfaceCLI(): Promise<void> {
  logInfo('Iniciando interface CLI');

  try {
    // ✅ CORRETO: inquirer.prompt([{...}])
    const { continuar } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continuar',
        message: '🚀 Deseja continuar?',
        default: true,
      },
    ]);

    if (!continuar) {
      console.log('❌ Operação cancelada');
      return;
    }

    // ✅ CORRETO: type 'list' para seleção única
    const { opcao } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcao',
        message: '📋 Escolha uma opção:',
        choices: [
          { name: '🔍 Analisar', value: 'analisar' },
          { name: '📝 Visualizar', value: 'visualizar' },
          { name: '✏️ Editar', value: 'editar' },
        ],
      },
    ]);

    // ✅ CORRETO: type 'input' para texto
    const { observacoes } = await inquirer.prompt([
      {
        type: 'input',
        name: 'observacoes',
        message: '📝 Observações (opcional):',
        default: '',
      },
    ]);

    // ✅ CORRETO: type 'checkbox' para múltipla seleção
    const { itens } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'itens',
        message: '☑️ Selecione itens:',
        choices: [
          { name: 'Item 1', value: 'item1', checked: true },
          { name: 'Item 2', value: 'item2' },
          { name: 'Item 3', value: 'item3' },
        ],
        validate: (answer) => {
          if (answer.length < 1) {
            return 'Selecione pelo menos um item';
          }
          return true;
        },
      },
    ]);

    // ✅ CORRETO: type 'number' para números
    const { limite } = await inquirer.prompt([
      {
        type: 'number',
        name: 'limite',
        message: '🔢 Limite (1-100):',
        default: 10,
        validate: (value) => {
          if (value < 1 || value > 100) {
            return 'Valor deve estar entre 1 e 100';
          }
          return true;
        },
      },
    ]);

    const config = {
      opcao,
      observacoes: observacoes || '',
      itens,
      limite,
    };

    // Validar com schema
    const validConfig = validateWithSchema(
      config,
      ConfigCLISchema,
      'interfaceCLI.config'
    );

    logInfo('Configuração CLI validada', validConfig);

    // Processar com base na configuração
    await processarComConfig(validConfig);
  } catch (error) {
    logError('Erro na interface CLI', error);
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

async function processarComConfig(config: any) {
  // Implementação específica baseada na configuração
  logInfo('Processando com configuração', config);
}

// ❌ NUNCA FAÇA ISTO:
// const resposta = await inquirer.confirm({ message: '...' });
// const escolha = await inquirer.select({ message: '...' });
// const valores = await inquirer.checkbox({ message: '...' });

// ✅ SEMPRE FAÇA ISTO:
// const { resposta } = await inquirer.prompt([{ type: 'confirm', name: 'resposta', message: '...' }]);
// const { escolha } = await inquirer.prompt([{ type: 'list', name: 'escolha', message: '...' }]);
// const { valores } = await inquirer.prompt([{ type: 'checkbox', name: 'valores', message: '...' }]);
```

### � Template de Compatibilidade (CONVERSÃO DE FORMATOS)

```typescript
// src/utils/format-compatibility.ts

import { z } from 'zod';
import { validateWithSchema } from './validation.js';
import { logInfo, logWarning } from './logger.js';

/**
 * @ai-purpose Sistema de compatibilidade entre formatos antigos e novos
 * @ai-input-format PautaDoDia (antigo) ou NoticiasCategorizadasCompletas (novo)
 * @ai-output-format Sempre NoticiasCategorizadasCompletas (formato unificado)
 * @ai-dependencies Schemas Zod, utilitários de validação
 * @ai-error-handling Detecta formato automaticamente, converte com segurança
 * @ai-performance Conversão rápida, cache quando possível
 * @ai-validation Valida entrada E saída para garantir integridade
 * @ai-common-errors Assumir formato sem verificar, quebrar compatibilidade
 * @ai-debugging Logs indicam qual conversão foi aplicada
 * @ai-business-impact Mantém pipeline funcionando durante migração
 * @ai-example converterFormatos(pautaAntiga) → formatoNovo
 */

// Type guards para detectar formato
export function isFormatoAntigo(data: any): data is PautaDoDia {
  return (
    data &&
    typeof data === 'object' &&
    'categoria1' in data &&
    'categoria2' in data &&
    'manchete' in data &&
    !('categorias' in data)
  ); // Não tem o novo formato
}

export function isFormatoNovo(
  data: any
): data is NoticiasCategorizadasCompletas {
  return (
    data &&
    typeof data === 'object' &&
    'categorias' in data &&
    'ranking' in data &&
    'estatisticas' in data
  );
}

/**
 * Converte qualquer formato para o formato unificado atual
 */
export function converterFormatos(
  input: PautaDoDia | NoticiasCategorizadasCompletas | any
): NoticiasCategorizadasCompletas {
  // Se já é o formato novo, apenas valida
  if (isFormatoNovo(input)) {
    logInfo('Formato já é novo, validando apenas');
    return validateWithSchema(
      input,
      NoticiasCategorizadasCompletasSchema,
      'converterFormatos.novo'
    );
  }

  // Se é formato antigo, converte
  if (isFormatoAntigo(input)) {
    logWarning('Detectado formato antigo, convertendo...');
    return converterPautaParaCompleta(input);
  }

  // Formato desconhecido
  throw new Error('Formato de dados não reconhecido');
}

/**
 * Conversão específica de PautaDoDia para NoticiasCategorizadasCompletas
 */
function converterPautaParaCompleta(
  pauta: PautaDoDia
): NoticiasCategorizadasCompletas {
  const todasNoticias = [
    ...pauta.categoria1,
    ...pauta.categoria2,
    ...pauta.categoria3,
    ...(pauta.tecnologia || []),
  ];

  // Converter cada notícia para o formato completo
  const categoria1 = pauta.categoria1.map((noticia) =>
    converterNoticiaParaCompleta(noticia, 'categoria1')
  );
  const categoria2 = pauta.categoria2.map((noticia) =>
    converterNoticiaParaCompleta(noticia, 'categoria2')
  );
  const categoria3 = pauta.categoria3.map((noticia) =>
    converterNoticiaParaCompleta(noticia, 'categoria3')
  );
  const tecnologia = (pauta.tecnologia || []).map((noticia) =>
    converterNoticiaParaCompleta(noticia, 'tecnologia')
  );

  // Gerar ranking baseado no score
  const ranking = todasNoticias
    .map((noticia) => converterNoticiaParaCompleta(noticia, 'geral'))
    .sort((a, b) => (b.scoreTotal || 0) - (a.scoreTotal || 0));

  // Calcular estatísticas
  const estatisticas = {
    totalNoticias: todasNoticias.length,
    distribucaoCategorias: {
      categoria1: categoria1.length,
      categoria2: categoria2.length,
      categoria3: categoria3.length,
      tecnologia: tecnologia.length,
    },
    scoresMedios: {
      categoria1: calcularScoreMedio(categoria1),
      categoria2: calcularScoreMedio(categoria2),
      categoria3: calcularScoreMedio(categoria3),
      tecnologia: calcularScoreMedio(tecnologia),
    },
    tempoPrevitoEpisodio: todasNoticias.reduce(
      (total, noticia) => total + (noticia.tempoEstimado || 30),
      0
    ),
  };

  const resultado: NoticiasCategorizadasCompletas = {
    categorias: {
      categoria1,
      categoria2,
      categoria3,
      tecnologia,
    },
    ranking,
    estatisticas,
    manchete: pauta.manchete || ranking[0] || null,
    dataGeracao: new Date().toISOString(),
    versaoSchema: '2.0',
  };

  // Validar o resultado da conversão
  return validateWithSchema(
    resultado,
    NoticiasCategorizadasCompletasSchema,
    'converterPautaParaCompleta.output'
  );
}

function converterNoticiaParaCompleta(
  noticia: any,
  categoria: string
): NoticiaCompleta {
  return {
    id: noticia.id || `noticia_${Date.now()}_${Math.random()}`,
    titulo: noticia.titulo,
    resumo: noticia.resumo,
    conteudo: noticia.conteudo || noticia.texto || '',
    fonte: noticia.fonte,
    dataPublicacao: noticia.dataPublicacao || new Date().toISOString(),
    categoria,
    tags: noticia.tags || [],
    scoreTotal: noticia.scoreTotal || noticia.relevancia || 5,
    scoreDetalhado: noticia.scoreDetalhado || calcularScoreDetalhado(noticia),
    prioridade: noticia.prioridade || 'media',
    tempoEstimado: noticia.tempoEstimado || 30,
    razaoRelevancia:
      noticia.razaoRelevancia ||
      noticia.justificativa ||
      'Convertido do formato antigo',
    contextoAmazonico: noticia.contextoAmazonico || 'medio',
    statusSelecao: {
      selecionadaAutomaticamente: true,
      selecionadaManualmente: false,
      motivoSelecao: 'Conversão automática do formato antigo',
    },
  };
}

function calcularScoreMedio(noticias: NoticiaCompleta[]): number {
  if (noticias.length === 0) return 0;
  const soma = noticias.reduce((acc, noticia) => acc + noticia.scoreTotal, 0);
  return Number((soma / noticias.length).toFixed(2));
}

function calcularScoreDetalhado(noticia: any): any {
  // Implementação básica para conversão
  return {
    relevancia: noticia.scoreTotal || 5,
    impacto: 5,
    urgencia: 5,
    interesse: 5,
    total: noticia.scoreTotal || 5,
  };
}
```

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

### 📦 Template de Imports CORRETOS (EVITA ERROS DE COMPILAÇÃO)

```typescript
// src/[categoria]/[modulo].ts

// ✅ SEMPRE use .js no final (OBRIGATÓRIO!)
import { z } from 'zod';
import inquirer from 'inquirer';
import { validateWithSchema } from '../utils/validation.js';
import { logInfo, logError } from '../utils/logger.js';
import { config } from '../config.js';

// ✅ Imports de schemas
import {
  NoticiaCruaSchema,
  PautaDoDiaSchema,
  NoticiasCategorizadasCompletasSchema,
} from '../schemas/core.schemas.js';

// ✅ Imports de tipos
import type {
  NoticiaCrua,
  PautaDoDia,
  NoticiasCategorizadasCompletas,
} from '../types.js';

// ✅ Imports condicionais (se necessário)
import { promises as fs } from 'fs';
import path from 'path';

// ❌ NUNCA FAÇA ISTO:
// import { config } from '../config';          // Sem .js
// import { validate } from '../utils/validation';  // Sem .js
// import type { NoticiaCrua } from '../types';     // Sem .js

/**
 * @ai-purpose [SUBSTITUA: Propósito específico]
 * @ai-imports-critical SEMPRE use .js nos imports relativos!
 * @ai-dependencies inquirer, zod, fs/promises, path
 * @ai-validation Todos os dados validados com schemas Zod
 * @ai-error-handling Try/catch com contexto específico
 * @ai-common-errors Esquecer .js nos imports, usar inquirer incorretamente
 */
export async function exemploComImportsCorretos(): Promise<void> {
  // Implementação aqui...
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

### 🧪 Template de Teste ROBUSTO (BASEADO EM ERROS REAIS)

```typescript
// src/[categoria]/__tests__/[modulo].test.ts

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { minhaFuncao } from '../minhaFuncao.js';
import { NoticiasCategorizadasCompletasSchema } from '../schemas/core.schemas.js';

describe('minhaFuncao', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup após cada teste
  });

  describe('validação de entrada (CRÍTICO)', () => {
    it('deve rejeitar dados inválidos', async () => {
      const inputInvalido = { dados: null }; // Propositalmente inválido

      await expect(minhaFuncao(inputInvalido)).rejects.toThrow(
        'Validação falhou'
      );
    });

    it('deve aceitar formato antigo E novo', async () => {
      const formatoAntigo = {
        categoria1: [],
        categoria2: [],
        categoria3: [],
        manchete: null,
      };

      const formatoNovo = {
        categorias: {
          categoria1: [],
          categoria2: [],
          categoria3: [],
          tecnologia: [],
        },
        ranking: [],
        estatisticas: {},
      };

      // Ambos devem funcionar sem erro
      await expect(minhaFuncao(formatoAntigo)).resolves.toBeDefined();
      await expect(minhaFuncao(formatoNovo)).resolves.toBeDefined();
    });
  });

  describe('casos de erro reais encontrados', () => {
    it('deve lidar com inquirer API incorreta', async () => {
      // Simular erro comum do inquirer
      const mockInquirer = {
        confirm: jest
          .fn()
          .mockRejectedValue(new Error('confirm is not a function')),
      };

      // Verificar que função usa API correta
      // (Este teste vai falhar se usar inquirer.confirm ao invés de inquirer.prompt)
    });

    it('deve validar saída com schema correto', async () => {
      const input = { dados: ['teste'] };
      const result = await minhaFuncao(input);

      // Validar que saída está no formato esperado
      expect(() => {
        NoticiasCategorizadasCompletasSchema.parse(result);
      }).not.toThrow();
    });

    it('deve converter formatos automaticamente', async () => {
      const formatoAntigo = {
        categoria1: [{ titulo: 'Teste', resumo: 'Resumo' }],
        categoria2: [],
        categoria3: [],
        manchete: null,
      };

      const result = await minhaFuncao(formatoAntigo);

      // Verificar que resultado é no formato novo
      expect(result).toHaveProperty('categorias');
      expect(result).toHaveProperty('ranking');
      expect(result).toHaveProperty('estatisticas');
    });
  });

  describe('performance e limites', () => {
    it('deve processar grande volume sem travar', async () => {
      const dadosGrandes = {
        dados: Array(1000).fill('item de teste'),
      };

      const startTime = Date.now();
      await minhaFuncao(dadosGrandes);
      const duration = Date.now() - startTime;

      // Não deve demorar mais que 30 segundos
      expect(duration).toBeLessThan(30000);
    });

    it('deve ter rate limiting para APIs', async () => {
      // Teste de múltiplas chamadas rápidas
      const promises = Array(10)
        .fill(null)
        .map(() => minhaFuncao({ dados: ['teste'] }));

      // Não deve falhar por rate limiting
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('compatibilidade backwards', () => {
    it('deve manter compatibilidade com versões anteriores', async () => {
      const dadosVersaoAntiga = {
        // Formato usado antes da refatoração
        categoria1: [{ titulo: 'Antigo', texto: 'Conteúdo antigo' }],
        categoria2: [],
        categoria3: [],
      };

      const result = await minhaFuncao(dadosVersaoAntiga);

      // Deve funcionar e retornar formato novo
      expect(result.categorias.categoria1).toHaveLength(1);
      expect(result.categorias.categoria1[0]).toHaveProperty('conteudo'); // Novo formato
    });
  });
});
```

### 🔍 Template de Validação RIGOROSA

```typescript
// src/utils/validation-enhanced.ts

import { z } from 'zod';
import { logError, logWarning } from './logger.js';

/**
 * @ai-purpose Validação aprimorada com recovery automático de erros
 * @ai-input-format Qualquer dados + schema Zod + contexto
 * @ai-output-format Dados validados ou erro estruturado
 * @ai-error-handling Recovery automático, logs detalhados, sugestões de correção
 * @ai-common-errors Dados malformados, schemas incompatíveis, tipos incorretos
 * @ai-debugging Logs indicam exatamente qual validação falhou e porquê
 * @ai-business-impact Evita crashes, mantém pipeline funcionando
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings: string[];
  recovered: boolean;
}

export function validateWithRecovery<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string,
  recoveryOptions?: {
    allowPartial?: boolean;
    useDefaults?: boolean;
    skipInvalidItems?: boolean;
  }
): ValidationResult<T> {
  const warnings: string[] = [];

  try {
    // Tentativa normal de validação
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
      warnings,
      recovered: false,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      logWarning(`Validação inicial falhou para ${context}`, {
        errors: error.errors,
        data: sanitizeForLog(data),
      });

      // Tentar recovery automático
      if (recoveryOptions?.useDefaults) {
        try {
          const recovered = attemptDefaultRecovery(data, schema);
          warnings.push('Valores padrão aplicados automaticamente');

          return {
            success: true,
            data: recovered,
            warnings,
            recovered: true,
          };
        } catch (recoveryError) {
          // Recovery falhou
        }
      }

      if (recoveryOptions?.allowPartial) {
        try {
          const recovered = attemptPartialRecovery(data, schema);
          warnings.push('Dados parciais recuperados');

          return {
            success: true,
            data: recovered,
            warnings,
            recovered: true,
          };
        } catch (recoveryError) {
          // Recovery falhou
        }
      }

      // Se chegou aqui, não foi possível recuperar
      logError(`Validação e recovery falharam para ${context}`, error, {
        originalData: sanitizeForLog(data),
        attemptedRecovery: !!recoveryOptions,
      });

      return {
        success: false,
        error: `Validação falhou: ${error.errors.map((e) => e.message).join(', ')}`,
        warnings,
        recovered: false,
      };
    }

    // Erro não relacionado ao Zod
    logError(`Erro inesperado na validação de ${context}`, error);
    return {
      success: false,
      error: 'Erro interno de validação',
      warnings,
      recovered: false,
    };
  }
}

function attemptDefaultRecovery<T>(data: any, schema: z.ZodSchema<T>): T {
  // Tentar aplicar valores padrão do schema
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const recovered: any = { ...data };

    for (const [key, fieldSchema] of Object.entries(shape)) {
      if (!(key in recovered) || recovered[key] == null) {
        // Tentar obter valor padrão
        try {
          const defaultValue = getDefaultValue(fieldSchema as z.ZodTypeAny);
          if (defaultValue !== undefined) {
            recovered[key] = defaultValue;
          }
        } catch {
          // Ignorar se não conseguir obter padrão
        }
      }
    }

    return schema.parse(recovered);
  }

  throw new Error('Recovery não suportado para este tipo de schema');
}

function attemptPartialRecovery<T>(data: any, schema: z.ZodSchema<T>): T {
  // Tentar remover campos inválidos e manter válidos
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const recovered: any = {};

    for (const [key, fieldSchema] of Object.entries(shape)) {
      if (key in data) {
        try {
          (fieldSchema as z.ZodTypeAny).parse(data[key]);
          recovered[key] = data[key];
        } catch {
          // Campo inválido, pular
        }
      }
    }

    return schema.parse(recovered);
  }

  throw new Error('Recovery parcial não suportado');
}

function getDefaultValue(schema: z.ZodTypeAny): any {
  if (schema instanceof z.ZodDefault) {
    return schema._def.defaultValue();
  }
  if (schema instanceof z.ZodOptional) {
    return undefined;
  }
  if (schema instanceof z.ZodString) {
    return '';
  }
  if (schema instanceof z.ZodNumber) {
    return 0;
  }
  if (schema instanceof z.ZodBoolean) {
    return false;
  }
  if (schema instanceof z.ZodArray) {
    return [];
  }
  if (schema instanceof z.ZodObject) {
    return {};
  }

  return undefined;
}

function sanitizeForLog(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const { senha, token, apiKey, ...safe } = data;
    return safe;
  }
  return data;
}
```

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

## 🚨 CHECKLIST FINAL - EVITE TODOS OS ERROS COMUNS

### **Antes de Commitar Qualquer Código:**

- [ ] **Inquirer.js**: Usei `inquirer.prompt([{...}])` e não métodos diretos?
- [ ] **Imports**: Todos os imports relativos terminam com `.js`?
- [ ] **Destructuring**: CLI usa `const { resposta } = await inquirer.prompt(...)`?
- [ ] **Schemas**: Entrada e saída validadas com `validateWithSchema()`?
- [ ] **Compatibilidade**: Implementei conversão entre formatos antigo/novo?
- [ ] **Error Handling**: Try/catch com logs estruturados e contexto?
- [ ] **TypeScript**: Sem tipos `any`, tudo explícito?
- [ ] **Performance**: Monitoramento de tempo adicionado?
- [ ] **AI Tags**: Pelo menos 10 tags por função importante?
- [ ] **Testes**: Casos de sucesso, erro, extremos e compatibilidade?
- [ ] **🚨 NOVO: Logs Iniciais**: Scripts executáveis têm `console.log('🚀 Script iniciado...')`?
- [ ] **🚨 NOVO: Detecção Robusta**: Uso `.includes('script-name')` não `import.meta.url === file://`?

### **Durante Desenvolvimento:**

- [ ] **Build**: `npm run build` compila sem erros?
- [ ] **Lint**: `get_errors` retorna zero problemas?
- [ ] **Validação**: Testei com dados reais do formato antigo?
- [ ] **CLI**: Interface funciona sem travar?
- [ ] **Logs**: Contexto suficiente para debugging?
- [ ] **🚨 NOVO: Execução**: Script produz output imediato quando executado?
- [ ] **🚨 NOVO: PowerShell**: Comandos funcionam no PowerShell do Windows?

### **Testes Específicos dos Problemas Encontrados:**

- [ ] **Inquirer**: Testei que não uso `.confirm()`, `.select()`, etc?
- [ ] **Imports**: Nenhum import relativo sem `.js`?
- [ ] **Schema Conversion**: Formato antigo converte para novo automaticamente?
- [ ] **CLI Destructuring**: Todas as respostas do inquirer são destructured?
- [ ] **TypeScript Strict**: Compilação passa sem warnings?
- [ ] **🚨 NOVO: Script Silencioso**: Executei `npm run [script]` e confirmo que produz output?
- [ ] **🚨 NOVO: Validação Schema**: Erro de schema produz mensagem específica sobre formato?
- [ ] **🚨 NOVO: Detecção Módulo**: Script detecta corretamente execução via tsx/npm?

### **Validação Final:**

- [ ] **Integration Test**: Pipeline completo funciona end-to-end?
- [ ] **Backwards Compatibility**: Código antigo ainda roda?
- [ ] **Error Recovery**: Falhas são tratadas graciosamente?
- [ ] **Performance**: Tempo de execução aceitável (<30s)?
- [ ] **Documentation**: AI tags documentam todos os aspectos?
- [ ] **🚨 NOVO: Execução Verificada**: Confirmei manualmente que script executa e produz output esperado?
- [ ] **🚨 NOVO: Error Messages**: Mensagens de erro são específicas e orientam próximos passos?

**🎉 Se todos os checkboxes estão marcados, seu código está pronto para produção sem os erros comuns que encontramos!**
