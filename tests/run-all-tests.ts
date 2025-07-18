/**
 * @fileoverview Runner para todos os testes do Trio de Ouro
 * @ai-purpose Executa suite completa de testes sem dependências externas
 */

import { runPromptTests } from './prompts.test.js';
import { runMetricsTests } from './metrics.test.js';

async function runAllTests() {
  console.log('🚀 Iniciando suite de testes do Trio de Ouro...\n');
  
  try {
    // Testes de Prompts
    runPromptTests();
    console.log('');
    
    // Testes de Métricas
    await runMetricsTests();
    console.log('');
    
    console.log('✨ Todos os testes concluídos com sucesso!');
    console.log('🎯 Trio de Ouro: Schemas ✅ | Prompts ✅ | Métricas ✅');
    
  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
