/**
 * @fileoverview Sistema de templates de prompts estruturados com métricas
 * @ai-purpose Padroniza criação, versionamento e otimização de prompts para IA
 */

/**
 * Interface para métricas de performance de prompts
 */
export interface PromptMetrics {
  /** Taxa de sucesso (0-1) */
  successRate: number;
  /** Tempo médio de resposta em ms */
  avgResponseTime: number;
  /** Qualidade média das respostas (0-10) */
  avgQuality: number;
  /** Número total de execuções */
  totalExecutions: number;
  /** Timestamp da última atualização */
  lastUpdated: Date;
}

/**
 * Interface para template de prompt estruturado
 */
export interface PromptTemplate {
  /** ID único do template */
  id: string;
  /** Versão semântica do template */
  version: string;
  /** Nome descritivo do template */
  name: string;
  /** Descrição do propósito */
  description: string;
  /** Template do prompt com placeholders */
  template: string;
  /** Variáveis esperadas no template */
  variables: string[];
  /** Constraints/restrições para a IA */
  constraints: string[];
  /** Exemplos de uso esperado */
  examples: Array<{
    input: Record<string, any>;
    expectedOutput: string;
  }>;
  /** Métricas de performance */
  metrics: PromptMetrics;
  /** Configurações específicas */
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

/**
 * Cria um novo template de prompt
 */
export function createPromptTemplate(
  id: string,
  name: string,
  template: string,
  variables: string[],
  options?: Partial<PromptTemplate>
): PromptTemplate {
  return {
    id,
    version: '1.0.0',
    name,
    description: options?.description || '',
    template,
    variables,
    constraints: options?.constraints || [],
    examples: options?.examples || [],
    metrics: {
      successRate: 0,
      avgResponseTime: 0,
      avgQuality: 0,
      totalExecutions: 0,
      lastUpdated: new Date()
    },
    config: options?.config || {},
    ...options
  };
}

/**
 * Renderiza um template com variáveis
 */
export function renderTemplate(
  template: PromptTemplate,
  variables: Record<string, any>
): string {
  let rendered = template.template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(placeholder, String(value));
  }
  
  return rendered;
}

/**
 * Valida se todas as variáveis necessárias estão presentes
 */
export function validateTemplateVariables(
  template: PromptTemplate,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing = template.variables.filter(
    variable => !(variable in variables)
  );
  
  return {
    valid: missing.length === 0,
    missing
  };
}
