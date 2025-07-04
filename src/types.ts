// ============================================================================
//                          TIPOS CENTRAIS DO PROJETO
//         Esta é a única fonte da verdade para as estruturas de dados.
// ============================================================================

// ----------------------------------------------------------------------------
// ETAPA 1: COLETA DE NOTÍCIAS
// ----------------------------------------------------------------------------

/**
 * Representa uma notícia em seu estado mais bruto, recém-coletada de uma fonte.
 */
export interface NoticiaCrua {
  titulo: string;
  resumo: string;
  link: string;
  fonte: string;
  dataPublicacao: string; // Formato ISO 8601
}

/**
 * Define a interface para um módulo coletor de notícias.
 * Cada coletor (G1, A Crítica, etc.) deve implementar esta interface.
 */
export interface Collector {
  sourceName: string;
  fetch: (options: { startTime: string }) => Promise<NoticiaCrua[]>;
}

// ----------------------------------------------------------------------------
// ETAPA 2: ANÁLISE E CLASSIFICAÇÃO
// ----------------------------------------------------------------------------

/**
 * Representa uma única fonte de notícia dentro de um grupo.
 */
export interface FonteNoticia {
  resumo: string;
  link: string;
  fonte: string;
}

/**
 * Representa um grupo de notícias sobre o mesmo tópico, após a análise inicial.
 */
export interface NoticiaAgrupada {
  tituloPrincipal: string;
  fontes: FonteNoticia[];
  relevanceScore: number;
  isSuperNoticia: boolean;
}

/**
 * Representa a classificação final de uma notícia.
 */
export interface Classification {
  id: string;      // Ex: "⚫️ 1"
  label: string;   // Ex: "Segurança & BOs de Impacto"
  isAdequate: boolean;
}

/**
 * A estrutura final de uma notícia, enriquecida com classificação e pronta para o roteiro.
 * Herda de NoticiaAgrupada e adiciona mais informações.
 */
export interface NoticiaClassificada extends NoticiaAgrupada {
  classification: Classification;
  textoCompleto?: string; // Opcional, para armazenar o texto completo se buscado
}

// ----------------------------------------------------------------------------
// ETAPA 3: ROTEIRIZAÇÃO
// ----------------------------------------------------------------------------

/**
 * Representa uma efeméride, curiosidade ou fato histórico para a abertura.
 */
export interface Efemerie {
  titulo: string;
  texto: string;
  fonte: string;
}

/**
 * Representa uma única sugestão de gancho para a abertura.
 */
export interface SugestaoGancho {
  gancho: string;
  trilhaSonora: string;
}

/**
 * Estrutura do arquivo de sugestões de abertura gerado pela IA.
 */
export interface SugestoesAbertura {
  sugestaoPrincipal: SugestaoGancho;
  alternativas: SugestaoGancho[];
}

/**
 * Estrutura final do arquivo de pauta do dia, pronto para a geração do roteiro.
 */
export interface PautaDoDia {
  data: string; // Formato ISO 8601
  manchete: string;
  efemerides: Efemerie[];
  pauta: {
    politica: NoticiaClassificada[];
    economia: NoticiaClassificada[];
    cidades: NoticiaClassificada[];
    cultura: NoticiaClassificada[];
    esportes: NoticiaClassificada[];
  };
}

/**
 * Define a estrutura para os personagens do podcast.
 */
export interface Personagem {
  nome: string;
  perfil_geral: string;
  especialidade?: string; // Adicionado para diferenciar comentaristas
}

export interface PersonagensConfig {
  apresentadores: Personagem[];
  audiencia: {
    perfil: string;
    formas_de_chamar: string[];
  };
}

// ----------------------------------------------------------------------------
// ETAPA 4: PRODUÇÃO DE ÁUDIO (TTS)
// ----------------------------------------------------------------------------

/**
 * Define a estrutura para as configurações de Text-to-Speech (TTS).
 */
export interface TtsConfig {
  voices: {
    [key: string]: string; // Mapeia nome do personagem para voice_id
  };
  estilosDeVoz: {
    [key: string]: {
      stability: number;
      similarity_boost: number;
    };
  };
}
