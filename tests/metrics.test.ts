/**
 * @fileoverview Testes para sistema de métricas de IA
 * @ai-purpose Validação do collector de métricas e tracking
 */

import { AIPerformanceCollector } from '../src/ai/metrics/ai-performance.js';

// Simple test runner for AI metrics
async function runMetricsTests() {
  console.log('📊 Executando testes de métricas...');
  
  const collector = new AIPerformanceCollector();
  
  // Test 1: Tracking básico
  try {
    await collector.trackAIUsage(
      'classification',
      'test-model',
      true,
      1500,
      8, // quality
      100, // inputTokens
      50, // outputTokens
      undefined, // errorType
      { test: 'context' }
    );
    
    const metrics = await collector.getMetrics();
    if (metrics.length !== 1) {
      throw new Error('Métrica não foi registrada');
    }
    console.log('✅ Tracking básico: PASS');
  } catch (error) {
    console.log('❌ Tracking básico: FAIL', error);
  }

  // Test 2: Tracking de erro
  try {
    await collector.trackAIUsage(
      'text-generation',
      'test-model',
      false,
      2000,
      undefined, // quality
      100, // inputTokens
      undefined, // outputTokens
      'api_timeout',
      { test: 'error-context' }
    );
    
    const metrics = await collector.getMetrics();
    const errorMetric = metrics.find(m => !m.success);
    
    if (!errorMetric || errorMetric.errorType !== 'api_timeout') {
      throw new Error('Métrica de erro não registrada corretamente');
    }
    console.log('✅ Tracking de erro: PASS');
  } catch (error) {
    console.log('❌ Tracking de erro: FAIL', error);
  }

  // Test 3: Estatísticas
  try {
    const stats = await collector.getStats();
    
    if (stats.totalOperations !== 2 || stats.successRate !== 0.5) {
      throw new Error('Estatísticas incorretas');
    }
    console.log('✅ Estatísticas: PASS');
  } catch (error) {
    console.log('❌ Estatísticas: FAIL', error);
  }
  
  // Test 4: Reset de métricas
  try {
    await collector.reset();
    const metricsAfterReset = await collector.getMetrics();
    
    if (metricsAfterReset.length !== 0) {
      throw new Error('Reset não funcionou');
    }
    console.log('✅ Reset de métricas: PASS');
  } catch (error) {
    console.log('❌ Reset de métricas: FAIL', error);
  }
  
  console.log('🏁 Testes de métricas concluídos');
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMetricsTests();
}

export { runMetricsTests };
