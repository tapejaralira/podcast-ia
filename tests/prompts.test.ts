/**
 * @fileoverview Testes para sistema de prompts estruturados
 * @ai-purpose Validação de templates e renderização de prompts
 */

import { 
  createPromptTemplate, 
  renderTemplate, 
  validateTemplateVariables 
} from '../src/ai/prompts/prompt-template.js';
import { classifyNewsPrompt } from '../src/ai/prompts/classify-news.prompt.js';

// Simple test runner (no dependencies)
function runPromptTests() {
  console.log('🧪 Executando testes de prompts...');
  
  // Test 1: Criação de template
  try {
    const template = createPromptTemplate(
      'test-template',
      'Template de Teste',
      'Você é um {{role}}. Analise: {{content}}',
      ['role', 'content']
    );
    
    if (template.id !== 'test-template') {
      throw new Error('ID do template incorreto');
    }
    console.log('✅ Criação de template: PASS');
  } catch (error) {
    console.log('❌ Criação de template: FAIL', error);
  }

  // Test 2: Renderização de template
  try {
    const template = createPromptTemplate(
      'render-test',
      'Teste Renderização',
      'Olá {{nome}}, você tem {{idade}} anos',
      ['nome', 'idade']
    );
    
    const rendered = renderTemplate(template, {
      nome: 'João',
      idade: '30'
    });
    
    if (!rendered.includes('João') || !rendered.includes('30')) {
      throw new Error('Renderização incorreta');
    }
    console.log('✅ Renderização de template: PASS');
  } catch (error) {
    console.log('❌ Renderização de template: FAIL', error);
  }

  // Test 3: Validação de variáveis
  try {
    const template = createPromptTemplate(
      'validation-test',
      'Teste Validação',
      'Template com {{var1}} e {{var2}}',
      ['var1', 'var2']
    );
    
    const validation = validateTemplateVariables(template, { var1: 'valor1' });
    
    if (validation.valid || validation.missing.length !== 1) {
      throw new Error('Validação deveria falhar');
    }
    console.log('✅ Validação de variáveis: PASS');
  } catch (error) {
    console.log('❌ Validação de variáveis: FAIL', error);
  }

  // Test 4: Template real de classificação
  try {
    const rendered = renderTemplate(classifyNewsPrompt, {
      newsData: 'Título: Teste\nResumo: Teste resumo',
      classificationGuide: 'Política: teste'
    });
    
    if (!rendered.includes('Teste') || !rendered.includes('editor-chefe')) {
      throw new Error('Template de classificação não renderizado corretamente');
    }
    console.log('✅ Template de classificação: PASS');
  } catch (error) {
    console.log('❌ Template de classificação: FAIL', error);
  }
  
  console.log('🏁 Testes de prompts concluídos');
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPromptTests();
}

export { runPromptTests };
