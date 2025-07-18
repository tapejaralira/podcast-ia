/**
 * @fileoverview Índice centralizado dos templates de prompts
 * @ai-purpose Facilita importação e descoberta de prompts estruturados
 */

export * from './classify-news.prompt.js';
export * from './generate-hooks.prompt.js';
export * from './prompt-template.js';

// Re-export principais para conveniência
export { classifyNewsPrompt } from './classify-news.prompt.js';
export { generateHooksPrompt } from './generate-hooks.prompt.js';
export { 
    createPromptTemplate, 
    renderTemplate, 
    validateTemplateVariables,
    type PromptTemplate,
    type PromptMetrics
} from './prompt-template.js';
