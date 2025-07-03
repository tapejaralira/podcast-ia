// src/types.ts

/**
 * Define a estrutura para uma notícia crua, como coletada de uma fonte.
 */
export interface NoticiaCrua {
  titulo: string;
  resumo: string;
  link: string;
  fonte: string;
  dataPublicacao: string;
}

/**
 * Define a interface para um coletor de notícias.
 */
export interface Collector {
  name: string;
  fetch: (options: { startTime: string }) => Promise<NoticiaCrua[]>;
}

/**
 * Define a estrutura para uma única fonte de notícia.
 * @deprecated Substituído por NoticiaCrua e NoticiaAgrupada.
 */
export interface FonteNoticia {
  resumo: string;
  link: string;
}

/**
 * Define a estrutura para uma sugestão de notícia.
 */
export interface SugestaoNoticia extends NoticiaAgrupada {}

/**
 * Define a estrutura para uma efeméride.
 */
export interface Efemerie {
  encontrado?: boolean; // Adicionado para o fluxo da IA
  titulo: string;
  texto: string;
}

/**
 * Define a estrutura para as sugestões de abertura (efeméride ou mensagem).
 */
export interface SugestaoAbertura {
  sugestao_roteirista: string;
  noticia: SugestaoNoticia | null;
  efemeride: Efemerie | null;
}

/**
 * Define a estrutura do arquivo de sugestões que combina notícia e efeméride.
 */
export interface Sugestoes {
  noticia: SugestaoNoticia | null;
  efemeride: Efemerie | null;
}

/**
 * Define a estrutura para os apresentadores.
 */
export interface Apresentador {
  nome: string;
  perfil_geral: string;
  formas_de_chamar_o_outro: string[];
}

/**
 * Define a estrutura para o perfil da audiência.
 */
export interface Audiencia {
  perfil: string;
  formas_de_chamar: string[];
}

/**
 * Define a estrutura do arquivo de personagens.
 */
export interface Personagens {
  apresentadores: Apresentador[];
  audiencia: Audiencia;
}

/**
 * Define a estrutura para a classificação de uma notícia.
 */
export interface Classification {
  id: string;
  label: string;
  isAdequate: boolean;
}

/**
 * Define a estrutura principal para uma notícia classificada.
 */
export interface NoticiaClassificada extends NoticiaAgrupada {
  texto_completo?: string; // Adicionado para armazenar o texto completo buscado
}

/**
 * Define a estrutura do arquivo de pauta diária.
 */
export interface PautaDoDia {
  data: string;
  coldOpen: NoticiaClassificada; // Adicionado para a notícia de abertura
  noticiasPrincipais: NoticiaClassificada[];
  outrasNoticias: NoticiaAgrupada[];
}

/**
 * Define a estrutura para os apresentadores.
 */
export interface Apresentadores {
    taina: Apresentador;
    irai: Apresentador;
}

/**
 * Define a estrutura para as configurações do roteiro.
 */
export interface ConfigRoteiro {
    prioridade_cold_open: 'noticia' | 'efemeride';
}

/**
 * Define a estrutura para uma notícia.
 * @deprecated Use NoticiaCrua ou NoticiaClassificada em vez disso.
 */
export interface Noticia {
  titulo_principal: string;
  resumo: string;
  link: string;
  fonte: string;
  data_publicacao: string;
}

// Representa uma notícia após a análise e agrupamento de fontes.
export interface NoticiaAgrupada {
  titulo_principal: string;
  fontes: {
    resumo: string;
    link: string;
  }[];
  classification: Classification;
  relevanceScore: number;
  isSuperNoticia: boolean;
}

/**
 * Define a estrutura para as configurações de Text-to-Speech (TTS).
 */
export interface TtsConfig {
  voices: {
    [key: string]: string;
  };
  estilos_de_voz: {
    [key: string]: {
      stability: number;
      similarity_boost: number;
    };
  };
}
