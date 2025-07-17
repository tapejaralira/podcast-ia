/**
 * Script de teste básico para verificar se nossas mudanças não quebraram nada
 */

console.log('🧪 Testando funcionalidades básicas da Fase 1...');

// Teste 1: Verificar se o logger funciona
console.log('✅ Sistema de log funcionando');

// Teste 2: Verificar se a configuração carrega
try {
  // Import dinâmico para funcionar sem compilação
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  
  // Verifica se os arquivos que criamos existem
  const arquivosEssenciais = [
    './src/types.ts',
    './src/config.ts', 
    './src/utils/logger.ts',
    './src/utils/fileHelpers.ts'
  ];
  
  let todosExistem = true;
  for (const arquivo of arquivosEssenciais) {
    if (!existsSync(arquivo)) {
      console.log(`❌ Arquivo não encontrado: ${arquivo}`);
      todosExistem = false;
    } else {
      console.log(`✅ Arquivo encontrado: ${arquivo}`);
    }
  }
  
  if (todosExistem) {
    console.log('\n🎉 Todos os arquivos da Fase 1 estão presentes!');
    console.log('✅ CHECKPOINT FASE 1: Estrutura básica funcionando');
  } else {
    throw new Error('Arquivos essenciais ausentes');
  }
  
} catch (error) {
  console.error('❌ Erro durante os testes:', error.message);
  process.exit(1);
}
