/**
 * Configuração central do projeto Bubuia News
 * Centraliza todas as configurações, caminhos e constantes
 * Estrutura AI-friendly - versão final sem legacy
 */

import * as path from 'path';
import { fileURLToPath } from 'url'; // Importação necessária
import { ProjectConfig, AIApiConfig } from './types.js';
import { logError, logInfo } from './utils/logger.js';

// Caminhos base do projeto (CORRIGIDO para ser mais robusto)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Isto aponta para /src
const ROOT_DIR = path.resolve(__dirname, '..'); // Isto aponta para a raiz do projeto

export const SRC_DIR = path.resolve(__dirname); // Simplificado
export const DATA_DIR = path.resolve(ROOT_DIR, 'data'); // Corrigido para usar o novo ROOT_DIR
export const ROTEIROS_DIR = path.join(ROOT_DIR, 'output', 'scripts');

/**
 * Valida se todas as variáveis de ambiente necessárias estão definidas
 * @throws {Error} Se alguma variável obrigatória estiver ausente
 */
export function validateConfig(): void {
  const required = ['OPENAI_API_KEY', 'GEMINI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMsg = `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`;
    logError('Configuração inválida', { missing });
    throw new Error(errorMsg);
  }

  logInfo('✅ Configuração validada com sucesso');
}

/**
 * Configuração principal do projeto
 */
export const config: ProjectConfig & {
  // Extensões específicas do Bubuia News
  podcast: {
    prioridade_cold_open: 'noticia' | 'efemeride';
  };
  analise: {
    relevanceKeywords: string[];
    sourceWeights: Record<string, number>;
    classificationGuide: Record<string, { label: string; categoria: string }>;
  };
  tts: {
    sugestoesAberturaFile: string;
    personagensFile: string;
    ttsConfigFile: string;
    roteiroTemplateFile: string;
    roteirosDir: string;
    audioOutputDir: string;
  };
  geracaoAudio: {
    categoriaParaEstilo: Record<string, string>;
  };
  mixagem: {
    ffmpegPath: string;
    crossfadeDuration: number;
  };
} = {
  // Configurações das APIs de IA
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1')
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1')
    }
  },

  // Caminhos importantes do projeto (ESTRUTURA AI-FRIENDLY)
  paths: {
    data: DATA_DIR,
    // Estrutura organizada
    assets: {
      audio: path.join(ROOT_DIR, 'assets', 'audio'),
      templates: path.join(ROOT_DIR, 'assets', 'templates'),
      examples: path.join(ROOT_DIR, 'assets', 'examples')
    },
    output: {
      audio: path.join(ROOT_DIR, 'output', 'audio'),
      episodes: path.join(ROOT_DIR, 'output', 'episodes'),
      reports: path.join(ROOT_DIR, 'output', 'reports'),
      cache: path.join(ROOT_DIR, 'output', 'cache')
    },
    docs: path.join(ROOT_DIR, 'docs'),
    tests: path.join(ROOT_DIR, 'tests'),
    // Caminhos de compatibilidade
    audios: path.join(ROOT_DIR, 'assets', 'audio'),
    episodios: path.join(ROOT_DIR, 'output', 'episodes'),
    roteiros: ROTEIROS_DIR
  },

  // Configurações de coleta de notícias
  coleta: {
    horasDefault: parseInt(process.env.COLETA_HORAS || '25'), // Período de coleta em horas
    maxRetries: parseInt(process.env.COLETA_MAX_RETRIES || '3'),
    timeoutPorFonte: parseInt(process.env.COLETA_TIMEOUT_FONTE || '15000'), // 15 segundos
    rateLimitDelay: parseInt(process.env.COLETA_RATE_LIMIT || '200') // 200ms entre chamadas
  },

  // Configurações do pipeline
  pipeline: {
    maxNoticias: parseInt(process.env.MAX_NOTICIAS || '4'),
    relevanceThreshold: parseInt(process.env.RELEVANCE_THRESHOLD || '10'),
    timeoutHours: parseInt(process.env.TIMEOUT_HOURS || '25') // Atualizado para 25 horas
  },

  // Configurações específicas do Podcast
  podcast: {
    prioridade_cold_open: (process.env.COLD_OPEN_PRIORITY as 'noticia' | 'efemeride') || 'noticia'
  },

  // Configurações de Análise de Notícias
  analise: {
    relevanceKeywords: [
      // Cultura Pop & Geek (Peso Alto)
      "cinema", "série", "game", "e-sports", "anime", "geek", "nerd", "estreia", "lançamento", "cosplay", "evento geek",
      // Tecnologia & Inovação (Peso Alto)
      "tecnologia", "startup", "aplicativo", "inovação", "inteligência artificial",
      // Rolê Cultural & Bizarrices (Peso Médio)
      "festival", "show", "exposição", "gratuito", "parintins", "lenda", "bizarro", "mistério", "inusitado", "gastronomia",
      // Impacto Direto e Serviços (Peso Alto para Relevância)
      "manaus", "amazonas", "concurso", "transporte público", "tarifa", "saúde", "educação", "semed", "semsa", "água", "energia",
      // Nomes de Grande Relevância
      "Wilson Lima", "David Almeida",
      // Eventos Naturais de Grande Impacto
      "cheia", "seca", "br-319", "queimadas"
    ],
    sourceWeights: {
      'G1 Amazonas': 10,
      'A Crítica': 8,
      'D24AM': 7,
      'Portal do Holanda': 9
    },
    classificationGuide: {
      "⚫️ 1": { label: "Segurança & BOs de Impacto", categoria: "cidades" },
      "🟡 2": { label: "Política de Baré", categoria: "politica" },
      "🔴 3": { label: "Perrengues da Cidade", categoria: "cidades" },
      "🚀 4": { label: "Tecnologia & Inovação do Igarapé", categoria: "economia" },
      "🎬 5": { label: "Cultura Pop & Geek de Rede", categoria: "cultura" },
      "🎭 6": { label: "Rolê Cultural", categoria: "cultura" },
      "👽 7": { label: "Bizarrices da Bubuia", categoria: "cultura" }
    }
  },

  // Configurações de TTS
  tts: {
    sugestoesAberturaFile: path.join(DATA_DIR, 'sugestoes-abertura.json'),
    personagensFile: path.join(DATA_DIR, 'personagens.json'),
    ttsConfigFile: path.join(DATA_DIR, 'tts-config.json'),
    roteiroTemplateFile: path.join(SRC_DIR, 'roteiro', 'roteiro-template.md'),
    roteirosDir: ROTEIROS_DIR,
    audioOutputDir: path.join(ROOT_DIR, 'output', 'audio')
  },

  // Configurações de Geração de Áudio
  geracaoAudio: {
    categoriaParaEstilo: {
      '⚫️': 'serio_ou_analitico',
      '🟡': 'serio_ou_analitico',
      '🔴': 'indignado_leve',
      '🚀': 'animado',
      '🎬': 'animado',
      '🎭': 'animado',
      '👽': 'curioso_ou_bizarro',
    }
  },

  // Configurações de Mixagem
  mixagem: {
    ffmpegPath: process.env.FFMPEG_PATH || 'C:/Program Files/ffmpeg/bin/ffmpeg.exe',
    crossfadeDuration: parseInt(process.env.CROSSFADE_DURATION || '2')
  }
};

/**
 * Caminhos de arquivos específicos
 */
export const filePaths = {
  noticiasRecentesFile: path.join(config.paths.data, 'noticias-recentes.json'),
  noticiasCategorizadasFile: path.join(config.paths.data, 'noticias-categorizadas.json'),
  noticiasSelecionadasFile: path.join(config.paths.data, 'noticias-selecionadas.json'),
  selecaoManualFile: path.join(config.paths.data, 'selecao-manual.json'),
  estadoColetaFile: path.join(config.paths.data, 'estado_coleta.json'),
  sugestoesAberturaFile: path.join(config.paths.data, 'sugestoes-abertura.json'),
  personagensFile: path.join(config.paths.data, 'personagens.json'),
  ttsConfigFile: path.join(config.paths.data, 'tts-config.json'),
  roteiroTemplateFile: path.join(SRC_DIR, 'roteiro', 'roteiro-template.md'),
  roteiroOutputDir: ROTEIROS_DIR, // Adicionado para consistência

  // Backwards compatibility
  pautaDoDiaFile: path.join(DATA_DIR, 'noticias-categorizadas.json')
};

/**
 * Obtém a configuração da API atualmente ativa
 * @param provider Nome do provedor ('openai' ou 'gemini')
 * @returns Configuração da API
 */
export function getApiConfig(provider: 'openai' | 'gemini'): AIApiConfig {
  const apiConfig = config.ai[provider];
  if (!apiConfig.apiKey) {
    throw new Error(`API Key não configurada para ${provider}`);
  }
  return apiConfig;
}

/**
 * Obtém o provedor de API ativo baseado na variável de ambiente
 */
export function getActiveApiProvider(): 'openai' | 'gemini' {
  const provider = process.env.API_PROVIDER || 'gemini';
  if (provider !== 'openai' && provider !== 'gemini') {
    throw new Error(`Provedor de API inválido: ${provider}. Use 'openai' ou 'gemini'.`);
  }
  return provider;
}
