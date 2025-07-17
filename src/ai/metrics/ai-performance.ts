/**
 * @fileoverview Sistema de métricas e monitoramento de IA
 * @ai-purpose Coleta métricas de performance, qualidade e custos das APIs de IA
 */

/**
 * Interface para métrica de uso de IA
 */
export interface AIUsageMetric {
  /** ID único da operação */
  id: string;
  /** Tipo de operação */
  operation: 'text-generation' | 'text-analysis' | 'text-to-speech' | 'classification';
  /** Modelo de IA usado */
  model: string;
  /** Timestamp da operação */
  timestamp: Date;
  /** Duração em milissegundos */
  duration: number;
  /** Sucesso da operação */
  success: boolean;
  /** Tokens de entrada */
  inputTokens?: number;
  /** Tokens de saída */
  outputTokens?: number;
  /** Custo estimado em USD */
  estimatedCost?: number;
  /** Qualidade da resposta (0-10) */
  quality?: number;
  /** Tipo de erro se falhou */
  errorType?: string;
  /** Contexto adicional */
  context?: Record<string, any>;
}

/**
 * Coletor de métricas de IA
 */
export class AIPerformanceCollector {
  private metrics: AIUsageMetric[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Registra uso de IA
   */
  async trackAIUsage(
    operation: AIUsageMetric['operation'],
    model: string,
    success: boolean,
    duration: number,
    quality?: number,
    inputTokens?: number,
    outputTokens?: number,
    errorType?: string,
    context?: Record<string, any>
  ): Promise<void> {
    const metric: AIUsageMetric = {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      operation,
      model,
      timestamp: new Date(),
      duration,
      success,
      quality,
      inputTokens,
      outputTokens,
      estimatedCost: this.calculateCost(model, inputTokens, outputTokens),
      errorType,
      context
    };

    this.metrics.push(metric);
    
    // Manter apenas as últimas métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log para desenvolvimento
    console.log(`🤖 AI Metric: ${operation} (${model}) - ${success ? '✅' : '❌'} ${duration}ms`);
  }

  /**
   * Calcula custo estimado baseado no modelo e tokens
   */
  private calculateCost(model: string, inputTokens = 0, outputTokens = 0): number {
    // Preços aproximados por 1K tokens (USD) - valores de referência
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'gemini-pro': { input: 0.0005, output: 0.0015 },
      'elevenlabs': { input: 0, output: 0.18 }, // por 1K caracteres
      'default': { input: 0.001, output: 0.002 }
    };

    const modelPricing = pricing[model] || pricing.default;
    return (inputTokens / 1000 * modelPricing.input) + (outputTokens / 1000 * modelPricing.output);
  }

  /**
   * Obtém estatísticas de performance
   */
  getPerformanceStats(timeRange?: { start: Date; end: Date }) {
    let filteredMetrics = this.metrics;
    
    if (timeRange) {
      filteredMetrics = this.metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (filteredMetrics.length === 0) {
      return null;
    }

    const successful = filteredMetrics.filter(m => m.success);
    const totalCost = filteredMetrics.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
    const avgDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0) / filteredMetrics.length;
    const avgQuality = successful
      .filter(m => m.quality !== undefined)
      .reduce((sum, m, _, arr) => sum + (m.quality || 0) / arr.length, 0);

    return {
      period: timeRange ? `${timeRange.start.toISOString()} - ${timeRange.end.toISOString()}` : 'All time',
      totalOperations: filteredMetrics.length,
      successfulOperations: successful.length,
      successRate: successful.length / filteredMetrics.length,
      avgDuration: Math.round(avgDuration),
      avgQuality: Math.round(avgQuality * 100) / 100,
      totalCost: Math.round(totalCost * 10000) / 10000,
      byOperation: this.groupByOperation(filteredMetrics),
      byModel: this.groupByModel(filteredMetrics)
    };
  }

  private groupByOperation(metrics: AIUsageMetric[]) {
    const groups: Record<string, any> = {};
    
    metrics.forEach(metric => {
      if (!groups[metric.operation]) {
        groups[metric.operation] = {
          count: 0,
          successCount: 0,
          totalDuration: 0,
          totalCost: 0
        };
      }
      
      const group = groups[metric.operation];
      group.count++;
      if (metric.success) group.successCount++;
      group.totalDuration += metric.duration;
      group.totalCost += metric.estimatedCost || 0;
    });

    Object.keys(groups).forEach(op => {
      const group = groups[op];
      group.successRate = group.successCount / group.count;
      group.avgDuration = Math.round(group.totalDuration / group.count);
      group.totalCost = Math.round(group.totalCost * 10000) / 10000;
    });

    return groups;
  }

  private groupByModel(metrics: AIUsageMetric[]) {
    const groups: Record<string, any> = {};
    
    metrics.forEach(metric => {
      if (!groups[metric.model]) {
        groups[metric.model] = {
          count: 0,
          successCount: 0,
          totalTokens: 0,
          totalCost: 0
        };
      }
      
      const group = groups[metric.model];
      group.count++;
      if (metric.success) group.successCount++;
      group.totalTokens += (metric.inputTokens || 0) + (metric.outputTokens || 0);
      group.totalCost += metric.estimatedCost || 0;
    });

    Object.keys(groups).forEach(model => {
      const group = groups[model];
      group.successRate = group.successCount / group.count;
      group.totalCost = Math.round(group.totalCost * 10000) / 10000;
    });

    return groups;
  }

  /**
   * Exporta métricas para análise
   */
  exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    }
    
    // Implementar CSV se necessário
    return this.metrics.map(m => 
      `${m.timestamp.toISOString()},${m.operation},${m.model},${m.success},${m.duration},${m.quality || ''},${m.estimatedCost || ''}`
    ).join('\n');
  }
}

// Instância global
export const aiMetrics = new AIPerformanceCollector();

// Funções de conveniência
export async function trackAIUsage(
  operation: AIUsageMetric['operation'],
  success: boolean,
  duration: number,
  quality?: number,
  model?: string,
  errorType?: string
) {
  return aiMetrics.trackAIUsage(
    operation,
    model || 'unknown',
    success,
    duration,
    quality,
    undefined,
    undefined,
    errorType
  );
}
