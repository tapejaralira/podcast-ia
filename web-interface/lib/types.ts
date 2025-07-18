/**
 * @ai-purpose Tipos compartilhados entre interface web e backend
 * @ai-input-format Re-exports dos tipos do projeto principal
 * @ai-output-format TypeScript types para uso no frontend
 * @ai-dependencies Backend schemas, Zod types
 * @ai-error-handling Type-safe imports, fallbacks para compatibilidade
 * @ai-performance Lightweight re-exports, tree-shaking friendly
 * @ai-validation Types garantem consistência com backend
 * @ai-common-errors "Module not found", "Type import errors"
 * @ai-debugging Type inspection, import validation
 * @ai-business-impact Consistência entre frontend e backend
 */

// Re-export tipos principais do projeto
export interface NoticiaCompleta {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  fonte: string;
  url: string;
  dataPublicacao: string;
  relevancia: number;
  prioridade: 'baixa' | 'media' | 'alta';
  tempoEstimado: number;
  contextoAmazonico: string;
  scoreTotal: number;
  scoreDetalhado: {
    relevanciaRegional: number;
    impactoLocal: number;
    urgencia: number;
    unicidade: number;
    engajamento: number;
  };
  tagsDetectadas: string[];
  razaoRelevancia: string;
  statusSelecao: {
    selecionadaAutomaticamente: boolean;
    motivoSelecao: 'manchete' | 'relevancia' | 'diversidade' | null;
    posicaoRanking: number;
    probabilidadeSelecao: number;
  };
  editorial: {
    categoriaSugerida: string;
    anguloPauta: string;
    potencialPolemica: 'baixo' | 'medio' | 'alto';
    adequacaoPublico: number;
  };
}

export interface NoticiasCategorizadasCompletas {
  data: string;
  metadados: {
    totalAnalisadas: number;
    totalRelevantes: number;
    fontesProcessadas: string[];
    tempoProcessamento: string;
    versaoAnalise: string;
  };
  estatisticas: {
    distribucaoPorCategoria: Record<string, number>;
    distribucaoPorRelevancia: Record<string, number>;
    distribucaoPorPrioridade: Record<string, number>;
    scoresMedios: Record<string, number>;
  };
  sugestaoAutomatica: {
    manchete: NoticiaCompleta;
    noticiasRecomendadas: string[];
    justificativa: string;
    confianca: number;
  };
  categorias: {
    politica: NoticiaCompleta[];
    economia: NoticiaCompleta[];
    cidades: NoticiaCompleta[];
    cultura: NoticiaCompleta[];
    esportes: NoticiaCompleta[];
    geral: NoticiaCompleta[];
  };
  rankingGeral: NoticiaCompleta[];
  destaquesDoDia: {
    maisRelevante: NoticiaCompleta;
    maisAmazonico: NoticiaCompleta;
    maisBizarro: NoticiaCompleta;
    maisUrgente: NoticiaCompleta;
  };
}

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
  estatisticas: {
    totalNoticias: number;
    duracaoEstimada: number;
    categorias: number;
  };
  observacoes?: string;
}

// Tipos para formato antigo (compatibilidade)
export interface PautaDoDia {
  data: string;
  manchete: string;
  pauta: {
    [categoria: string]: NoticiaAntiga[];
  };
}

export interface NoticiaAntiga {
  id: string;
  titulo: string;
  resumo: string;
  fonte: string;
  url: string;
  categoria: string;
  relevancia: number;
  prioridade: string;
  tempoEstimado: number;
  contextoAmazonico?: string;
}

// Tipos específicos da interface
export interface FiltrosInterface {
  categoria: string;
  relevanciaMinima: number;
  ordenacao: 'score' | 'relevancia' | 'categoria';
  busca: string;
}

export interface EstadoSelecao {
  manchete: string | null;
  noticias: Set<string>;
  observacoes: string;
}
