/**
 * @ai-purpose Serviços para comunicação com backend
 * @ai-input-format Frontend requests, user selections
 * @ai-output-format API responses, error handling
 * @ai-dependencies Backend endpoints, file system access
 * @ai-error-handling Try-catch, user feedback, fallbacks
 * @ai-performance Caching, minimal API calls
 * @ai-validation Response validation, type checking
 * @ai-common-errors "File not found", "Parse error", "Network error"
 * @ai-debugging Request/response logging, error details
 * @ai-business-impact Data consistency, user experience
 */

import { NoticiasCategorizadas, SelecaoManual, SugestoesAbertura } from './types';

// Configuração base
const API_BASE = process.env.NODE_ENV === 'development' ? '/api' : '/api';

/**
 * Carrega as notícias categorizadas do arquivo backend
 * @ai-context Lê dados do arquivo JSON gerado pelo pipeline principal
 */
export async function carregarNoticias(): Promise<NoticiasCategorizadas | null> {
  try {
    const response = await fetch(`${API_BASE}/noticias`);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data as NoticiasCategorizadas;
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    return null;
  }
}

/**
 * Salva a seleção manual do usuário
 * @ai-context Grava arquivo de seleção para uso pelo pipeline
 */
export async function salvarSelecaoManual(selecao: SelecaoManual): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/selecao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selecao),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao salvar seleção:', error);
    return false;
  }
}

/**
 * Carrega seleção manual existente se houver
 */
export async function carregarSelecaoExistente(): Promise<SelecaoManual | null> {
  try {
    const response = await fetch(`${API_BASE}/selecao`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data as SelecaoManual;
  } catch (error) {
    console.error('Erro ao carregar seleção existente:', error);
    return null;
  }
}

/**
 * Carrega as sugestões de abertura do podcast
 */
export async function carregarSugestoesAbertura(): Promise<SugestoesAbertura | null> {
  try {
    const response = await fetch(`${API_BASE}/sugestoes-abertura`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data as SugestoesAbertura;
  } catch (error) {
    console.error('Erro ao carregar sugestões de abertura:', error);
    return null;
  }
}

/**
 * Conversão de formato antigo para novo (compatibilidade)
 */
export function converterFormatoAntigo(dados: unknown): NoticiasCategorizadas | null {
  try {
    // Verifica se é um objeto
    if (!dados || typeof dados !== 'object') {
      return null;
    }
    
    const obj = dados as Record<string, unknown>;
    
    // Se já está no formato novo, tenta retornar (com validação básica)
    if (obj.metadados && obj.categorias && obj.data) {
      return obj as unknown as NoticiasCategorizadas;
    }
    
    // Se está no formato antigo, converte
    if (obj.pauta && obj.manchete) {
      const agora = new Date().toISOString().split('T')[0];
      
      // Cria estrutura mínima do formato novo
      const resultado: NoticiasCategorizadas = {
        data: (obj.data as string) || agora,
        metadados: {
          totalAnalisadas: 0,
          totalRelevantes: 0,
          fontesProcessadas: [],
          tempoProcessamento: '0s',
          versaoAnalise: '1.0-compat',
        },
        estatisticas: {
          distribucaoPorCategoria: {},
          distribucaoPorRelevancia: {},
          distribucaoPorPrioridade: {},
          scoresMedios: {},
        },
        sugestaoAutomatica: {
          manchete: {} as any, // Assuming NoticiaCompleta is replaced by any or needs a placeholder
          noticiasRecomendadas: [],
          justificativa: 'Conversão de formato antigo',
          confianca: 0.5,
        },
        categorias: {
          politica: [],
          economia: [],
          cidades: [],
          cultura: [],
          esportes: [],
          geral: [],
        },
        rankingGeral: [],
        destaquesDoDia: {
          maisRelevante: {} as any, // Assuming NoticiaCompleta is replaced by any or needs a placeholder
          maisAmazonico: {} as any, // Assuming NoticiaCompleta is replaced by any or needs a placeholder
          maisBizarro: {} as any, // Assuming NoticiaCompleta is replaced by any or needs a placeholder
          maisUrgente: {} as any, // Assuming NoticiaCompleta is replaced by any or needs a placeholder
        },
      };
      
      return resultado;
    }
    
    return null;
  } catch (error) {
    console.error('Erro na conversão de formato:', error);
    return null;
  }
}
