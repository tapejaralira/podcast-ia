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
  url?: string; // Manter compatibilidade
  link: string; // Link principal
  links: string[]; // ✅ NOVO: Array de todos os links encontrados
  fonte: string; // Fonte principal
  fontes: string[]; // ✅ NOVO: Array de todas as fontes
  dataPublicacao?: string;
  categoria: string;
  scoreTotal?: number;
  relevanceScore: number; // Score de relevância
  relevancia: number;
  tempoEstimado: number;
  classification?: {
    id: string;
    label: string;
    isAdequate: boolean;
  };
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
