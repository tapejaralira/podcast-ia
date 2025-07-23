/**
 * @ai-purpose Tipos compartilhados entre interface web e backend
 */

export interface NoticiaSimplificada {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  categoria: string;
  relevanceScore: number;
  classification: {
    id: string;
    label: string;
    isAdequate: boolean;
  };
}

export interface NoticiasCategorizadas {
  data: string;
  manchete: string;
  categorias: {
    politica: NoticiaSimplificada[];
    economia: NoticiaSimplificada[];
    cidades: NoticiaSimplificada[];
    cultura: NoticiaSimplificada[];
    esportes: NoticiaSimplificada[];
    geral: NoticiaSimplificada[];
  };
  rankingGeral: NoticiaSimplificada[];
  metadados: {
    totalAnalisadas: number;
    totalRelevantes: number;
    fontesProcessadas: string[];
    tempoProcessamento: string;
    versaoAnalise: string;
  };
}

export interface SelecaoManual {
  data: string;
  manchete: string;
  noticiasEscolhidas: string[];
  observacoes?: string;
}

export interface EstadoSelecao {
  manchete: string | null;
  noticias: Set<string>;
  observacoes: string;
}
