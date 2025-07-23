/**
 * @ai-purpose Tipos compartilhados entre a interface web e o backend, garantindo consistência.
 */

/**
 * Representa a estrutura completa de um artigo de notícia após a análise.
 */
export interface NoticiaCompleta {
  id: string;
  titulo: string;
  resumo: string;
  url: string;
  fonte: string;
  dataPublicacao: string;
  categoria: string;
  scoreTotal: number;
  relevancia: number;
  tempoEstimado: number;
  // Adicione outros campos conforme necessário para corresponder aos seus dados
}

/**
 * Representa o conjunto de dados de notícias, organizadas por categorias
 * e com um ranking geral.
 */
export interface NoticiasCategorizadas {
  data: string;
  rankingGeral?: NoticiaCompleta[];
  categorias: {
    [nomeCategoria: string]: NoticiaCompleta[];
  };
  metadados?: {
    totalAnalisadas: number;
    totalRelevantes: number;
  };
}

/**
 * Representa a seleção final feita pelo curador para ser salva.
 */
export interface SelecaoManual {
  data: string;
  manchete: {
    id: string;
    titulo: string;
    categoria: string;
  };
  noticiasEscolhidas: Array<{
    categoria: string;
    ids: string[];
    total: number;
  }>;
}

/**
 * Filtros e ordenação aplicados às notícias.
 */
export interface FiltrosInterface {
  ordenacao: 'score' | 'relevancia' | 'categoria';
}

/**
 * Estado da seleção de notícias, incluindo observações do curador.
 */
export interface EstadoSelecao {
  manchete: string | null;
  noticias: Set<string>;
  observacoes: string;
}
