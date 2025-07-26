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
 * Representa uma efeméride/fato histórico
 */
export interface Efemeride {
  titulo: string;
  texto: string;
  fonte: string;
}

/**
 * Opções de efemérides disponíveis para seleção
 */
export interface OpcoesEfemerides {
  fatosBrasileiros: Efemeride[];
  efemeridesIA: Efemeride[];
  curiosidadesAmazonicas: Efemeride[];
  recomendacao: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
    motivo: string;
  };
}

/**
 * Sugestões de abertura com ganchos e efemérides
 */
export interface SugestoesAbertura {
  ganchos: Array<{
    tipo: string;
    texto: string;
    trilha_sugerida: string;
  }>;
  efemeride: Efemeride;
  opcoesEfemerides: OpcoesEfemerides;
  instrucoes: {
    como_escolher: string;
    categorias: {
      fatosBrasileiros: string;
      efemeridesIA: string;
      curiosidadesAmazonicas: string;
    };
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
  efemerideSelecionada?: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
    efemeride: Efemeride;
  };
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
