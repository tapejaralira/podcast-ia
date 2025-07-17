// ============================================================================
//                          TIPOS CENTRAIS DO PROJETO
//         Esta é a única fonte da verdade para as estruturas de dados.
// ============================================================================

// ----------------------------------------------------------------------------
// ETAPA 1: COLETA DE NOTÍCIAS
// ----------------------------------------------------------------------------

/**
 * Representa uma notícia em seu estado mais bruto, recém-coletada de uma fonte.
 * Esta é a estrutura de dados que todos os coletores devem retornar.
 * 
 * @example
 * ```typescript
 * const noticia: NoticiaCrua = {
 *   titulo: "Nova lei aprovada na Assembleia",
 *   resumo: "Projeto que altera regulamentação...",
 *   link: "https://exemplo.com/noticia",
 *   fonte: "G1 Amazonas",
 *   dataPublicacao: "2025-07-16T10:30:00.000Z"
 * };
 * ```
 */
export interface NoticiaCrua {
  /** Título da notícia como publicado na fonte */
  titulo: string;
  /** Resumo ou lead da notícia */
  resumo: string;
  /** URL completa da notícia */
  link: string;
  /** Nome da fonte (ex: "G1 Amazonas", "A Crítica") */
  fonte: string;
  /** Data de publicação no formato ISO 8601 */
  dataPublicacao: string;
}

/**
 * Define a interface para um módulo coletor de notícias.
 * Cada coletor (G1, A Crítica, etc.) deve implementar esta interface.
 * 
 * @example
 * ```typescript
 * export const meuColetor: Collector = {
 *   sourceName: "Minha Fonte",
 *   fetch: async ({ startTime }) => {
 *     // Implementação da coleta
 *     return noticias;
 *   }
 * };
 * ```
 */
export interface Collector {
  /** Nome identificador da fonte de notícias */
  sourceName: string;
  /** 
   * Função que executa a coleta de notícias
   * @param options Opções de coleta, incluindo data/hora de início
   * @returns Promise com array de notícias coletadas
   * @throws {Error} Quando falha ao acessar a fonte
   */
  fetch: (options: { startTime: string }) => Promise<NoticiaCrua[]>;
}

// ----------------------------------------------------------------------------
// ENUMS E CONSTANTES
// ----------------------------------------------------------------------------

/**
 * Trilhas sonoras disponíveis para diferentes tipos de conteúdo
 */
export enum TrilhaSonora {
  TENSAO_LEVE = 'trilha_tensao_leve.mp3',
  INFORMATIVA_NEUTRA = 'trilha_informativa_neutra.mp3',
  REFLEXIVA = 'trilha_reflexiva.mp3',
  TECNOLOGICA_UPBEAT = 'trilha_tecnologica_upbeat.mp3',
  DIVERTIDA_POP = 'trilha_divertida_pop.mp3',
  CULTURAL_REGIONAL = 'trilha_cultural_regional.mp3',
  MISTERIOSA_HUMOR = 'trilha_misteriosa_humor.mp3'
}

/**
 * Categorias de classificação de notícias
 */
export enum CategoriaNoticia {
  SEGURANCA = '⚫️',
  POLITICA = '🟡',
  PERRENGUES = '🔴',
  TECNOLOGIA = '🚀',
  CULTURA_POP = '🎬',
  CULTURA_REGIONAL = '🎭',
  BIZARRICES = '👽'
}

/**
 * Níveis de log disponíveis no sistema
 */
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// ----------------------------------------------------------------------------
// INTERFACES PARA APIs EXTERNAS
// ----------------------------------------------------------------------------

/**
 * Resposta da API OpenAI para classificação de notícias
 */
export interface OpenAIClassificationResponse {
  /** ID da categoria (ex: "⚫️ 1") */
  classification_id: string;
  /** Se a notícia é adequada para áudio */
  is_adequate: boolean;
}

/**
 * Resposta da API Gemini para geração de diálogos
 */
export interface GeminiDialogResponse {
  /** Texto do diálogo gerado */
  dialogo: string;
  /** Personagem que deve falar primeiro */
  personagem_inicial?: string;
}

/**
 * Configuração para APIs de IA
 */
export interface AIApiConfig {
  /** Chave da API */
  apiKey: string;
  /** Modelo a ser usado */
  model: string;
  /** Número máximo de tokens */
  maxTokens?: number;
  /** Temperatura para criatividade */
  temperature?: number;
}

// ----------------------------------------------------------------------------
// ETAPA 2: ANÁLISE E CLASSIFICAÇÃO
// ----------------------------------------------------------------------------

/**
 * Representa uma única fonte de notícia dentro de um grupo.
 * Usado quando múltiplas fontes cobrem o mesmo evento.
 * 
 * @example
 * ```typescript
 * const fonte: FonteNoticia = {
 *   resumo: "Governador anuncia nova medida...",
 *   link: "https://g1.com/noticia",
 *   fonte: "G1 Amazonas"
 * };
 * ```
 */
export interface FonteNoticia {
  /** Resumo específico desta fonte */
  resumo: string;
  /** URL da notícia nesta fonte */
  link: string;
  /** Nome da fonte */
  fonte: string;
}

/**
 * Representa um grupo de notícias sobre o mesmo tópico, após a análise inicial.
 * Consolida informações de múltiplas fontes sobre o mesmo evento.
 * 
 * @example
 * ```typescript
 * const grupo: NoticiaAgrupada = {
 *   tituloPrincipal: "Nova lei de trânsito aprovada",
 *   fontes: [fonte1, fonte2],
 *   relevanceScore: 85,
 *   isSuperNoticia: true
 * };
 * ```
 */
export interface NoticiaAgrupada {
  /** Título consolidado que representa melhor o evento */
  tituloPrincipal: string;
  /** Array com todas as fontes que cobriram este evento */
  fontes: FonteNoticia[];
  /** Score de relevância (0-100) calculado pelo algoritmo */
  relevanceScore: number;
  /** Se esta notícia é considerada de grande impacto */
  isSuperNoticia: boolean;
}

/**
 * Representa a classificação final de uma notícia.
 * Determina como a notícia será apresentada no podcast.
 * 
 * @example
 * ```typescript
 * const classificacao: Classification = {
 *   id: "⚫️ 1",
 *   label: "Segurança & BOs de Impacto",
 *   isAdequate: true
 * };
 * ```
 */
export interface Classification {
  /** ID da categoria com emoji (ex: "⚫️ 1") */
  id: string;
  /** Descrição textual da categoria */
  label: string;
  /** Se a notícia é adequada para transmissão em áudio */
  isAdequate: boolean;
}

/**
 * A estrutura final de uma notícia, enriquecida com classificação e pronta para o roteiro.
 * Herda de NoticiaAgrupada e adiciona informações de IA.
 * 
 * @example
 * ```typescript
 * const noticiaFinal: NoticiaClassificada = {
 *   tituloPrincipal: "Novo shopping inaugura na zona norte",
 *   fontes: [fonte1, fonte2],
 *   relevanceScore: 75,
 *   isSuperNoticia: false,
 *   classification: classificacao,
 *   textoCompleto: "Texto completo extraído..."
 * };
 * ```
 */
export interface NoticiaClassificada extends NoticiaAgrupada {
  /** Classificação atribuída pela IA */
  classification: Classification;
  /** Texto completo extraído da notícia (opcional) */
  textoCompleto?: string;
}

// ----------------------------------------------------------------------------
// ETAPA 3: ROTEIRIZAÇÃO
// ----------------------------------------------------------------------------

/**
 * Representa uma efeméride, curiosidade ou fato histórico para a abertura.
 * Usado para criar cold opens interessantes baseados na data.
 * 
 * @example
 * ```typescript
 * const efemeride: Efemerie = {
 *   titulo: "Fundação de Manaus",
 *   texto: "Em 24 de outubro de 1669...",
 *   fonte: "Arquivo Histórico"
 * };
 * ```
 */
export interface Efemerie {
  /** Título do evento histórico */
  titulo: string;
  /** Descrição detalhada do evento */
  texto: string;
  /** Fonte da informação histórica */
  fonte: string;
}

/**
 * Representa uma única sugestão de gancho para a abertura.
 * Combina o texto do gancho com a trilha sonora apropriada.
 * 
 * @example
 * ```typescript
 * const gancho: SugestaoGancho = {
 *   gancho: "E aí, Manaus! Que tal começarmos falando de...",
 *   trilhaSonora: "trilha_divertida_pop.mp3"
 * };
 * ```
 */
export interface SugestaoGancho {
  /** Texto do gancho de abertura */
  gancho: string;
  /** Nome do arquivo de trilha sonora a ser usado */
  trilhaSonora: string;
}

/**
 * Estrutura do arquivo de sugestões de abertura gerado pela IA.
 * Contém uma sugestão principal e alternativas.
 * 
 * @example
 * ```typescript
 * const sugestoes: SugestoesAbertura = {
 *   sugestaoPrincipal: gancho1,
 *   alternativas: [gancho2, gancho3]
 * };
 * ```
 */
export interface SugestoesAbertura {
  /** Sugestão principal escolhida pela IA */
  sugestaoPrincipal: SugestaoGancho;
  /** Array com sugestões alternativas */
  alternativas: SugestaoGancho[];
}

/**
 * Estrutura final do arquivo de pauta do dia, pronto para a geração do roteiro.
 * Esta é a estrutura que o analisarNoticias.ts gera e que os outros módulos consomem.
 * 
 * @example
 * ```typescript
 * const pauta: PautaDoDia = {
 *   data: "2025-07-16T14:30:00.000Z",
 *   manchete: "Nova lei de trânsito aprovada",
 *   efemerides: [efemeride1],
 *   pauta: {
 *     politica: [noticia1, noticia2],
 *     economia: [],
 *     cidades: [noticia3],
 *     cultura: [noticia4],
 *     esportes: []
 *   }
 * };
 * ```
 */
export interface PautaDoDia {
  /** Data de geração da pauta no formato ISO 8601 */
  data: string;
  /** Título da notícia principal do dia */
  manchete: string;
  /** Array de efemérides históricas para a data */
  efemerides: Efemerie[];
  /** Notícias organizadas por categoria */
  pauta: {
    /** Notícias de política local */
    politica: NoticiaClassificada[];
    /** Notícias de economia */
    economia: NoticiaClassificada[];
    /** Notícias sobre a cidade e serviços públicos */
    cidades: NoticiaClassificada[];
    /** Notícias culturais e de entretenimento */
    cultura: NoticiaClassificada[];
    /** Notícias esportivas */
    esportes: NoticiaClassificada[];
  };
}

/**
 * Define a estrutura para os personagens do podcast.
 * Representa um apresentador ou comentarista do programa.
 * 
 * @example
 * ```typescript
 * const taina: Personagem = {
 *   nome: "Tainá",
 *   perfil_geral: "Apresentadora principal, comunicativa e carismática",
 *   especialidade: "Jornalismo e cultura local"
 * };
 * ```
 */
export interface Personagem {
  /** Nome do personagem */
  nome: string;
  /** Descrição geral da personalidade e estilo */
  perfil_geral: string;
  /** Área de especialidade (opcional) */
  especialidade?: string;
}

/**
 * Configuração completa dos personagens do podcast.
 * Define apresentadores e características da audiência.
 * 
 * @example
 * ```typescript
 * const config: PersonagensConfig = {
 *   apresentadores: [taina, irai],
 *   audiencia: {
 *     perfil: "Jovens adultos de Manaus interessados em notícias locais",
 *     formas_de_chamar: ["galera", "pessoal", "meus amigos"]
 *   }
 * };
 * ```
 */
export interface PersonagensConfig {
  /** Array com os apresentadores do programa */
  apresentadores: Personagem[];
  /** Configuração da audiência-alvo */
  audiencia: {
    /** Descrição do perfil da audiência */
    perfil: string;
    /** Formas como os apresentadores se dirigem à audiência */
    formas_de_chamar: string[];
  };
}

// ----------------------------------------------------------------------------
// ETAPA 4: PRODUÇÃO DE ÁUDIO (TTS)
// ----------------------------------------------------------------------------

/**
 * Define a estrutura para as configurações de Text-to-Speech (TTS).
 * Mapeia personagens para suas respectivas vozes e configurações.
 * 
 * @example
 * ```typescript
 * const config: TtsConfig = {
 *   voices: {
 *     "Tainá": "voice_id_taina_123",
 *     "Iraí": "voice_id_irai_456"
 *   },
 *   estilosDeVoz: {
 *     "natural": { stability: 0.5, similarity_boost: 0.8 },
 *     "energetico": { stability: 0.3, similarity_boost: 0.9 }
 *   },
 *   estilos_de_voz: {
 *     "padrao": { stability: 0.5, similarity_boost: 0.8 }
 *   }
 * };
 * ```
 */
export interface TtsConfig {
  /** Mapeia nome do personagem para voice_id do serviço de TTS */
  voices: {
    [personagem: string]: string;
  };
  /** Diferentes estilos de voz com suas configurações */
  estilosDeVoz: {
    [estilo: string]: {
      /** Estabilidade da voz (0-1) */
      stability: number;
      /** Boost de similaridade (0-1) */
      similarity_boost: number;
    };
  };
  /** @deprecated Use estilosDeVoz. Mantido para compatibilidade */
  estilos_de_voz: {
    padrao: {
      stability: number;
      similarity_boost: number;
    };
    [estilo: string]: {
      stability: number;
      similarity_boost: number;
    };
  };
}

// ----------------------------------------------------------------------------
// CONFIGURAÇÕES GERAIS
// ----------------------------------------------------------------------------

/**
 * Configuração central do projeto
 * Centraliza todas as configurações em um só lugar para facilitar manutenção
 */
export interface ProjectConfig {
  /** Configurações das APIs de IA */
  ai: {
    openai: AIApiConfig;
    gemini: AIApiConfig;
  };
  /** Caminhos importantes do projeto */
  paths: {
    data: string;
    /** Estrutura nova AI-friendly */
    assets: {
      audio: string;
      templates: string;
      examples: string;
    };
    output: {
      audio: string;
      episodes: string;
      reports: string;
      cache: string;
    };
    docs: string;
    tests: string;
    /** Caminhos de compatibilidade (legacy) */
    audios: string;
    episodios: string;
    roteiros: string;
  };
  /** Configurações do pipeline */
  pipeline: {
    /** Número máximo de notícias principais */
    maxNoticias: number;
    /** Threshold mínimo de relevância */
    relevanceThreshold: number;
    /** Tempo limite para coleta em horas */
    timeoutHours: number;
  };
}
