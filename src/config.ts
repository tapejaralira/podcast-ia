import path from 'path';

// Usar __dirname para garantir caminhos absolutos robustos
const __dirname = path.resolve(path.dirname('')); // Simula __dirname em módulos ES

export const SRC_DIR = path.resolve(__dirname, 'src');
export const DATA_DIR = path.resolve(__dirname, 'data');
export const EPISODIOS_DIR = path.resolve(__dirname, 'episodios');

const ROOT_DIR = path.resolve(__dirname, '..');

const AUDIOS_GERADOS_DIR = path.join(ROOT_DIR, 'audios_gerados');
const ROTEIRO_DIR = path.join(ROOT_DIR, 'roteiro');

export const config = {
  // Qual API usar para a geração de conteúdo
  apiProvider: process.env.API_PROVIDER || 'gemini', // Opções: 'openai', 'gemini'

  // Modelos de IA a serem usados
  models: {
    roteiro: process.env.MODEL_ROTEIRO || 'gemini-1.5-pro-latest',
    sugestao: process.env.MODEL_SUGESTAO || 'gemini-1.5-flash',
    analise: process.env.MODEL_ANALISE || 'gemini-1.5-flash',
  },

  // Configurações do Podcast
  podcast: {
    prioridade_cold_open: 'noticia' as 'noticia' | 'efemeride',
  },

  // Caminhos do projeto (relativos à raiz)
  paths: {
    // Diretórios base
    data: DATA_DIR,
    episodios: EPISODIOS_DIR,
    audios: path.join(ROOT_DIR, 'audios'),
    episodios_finais: path.join(ROOT_DIR, 'episodios_finais'),
    src: path.join(ROOT_DIR, 'src'),
    audioOutputDir: AUDIOS_GERADOS_DIR,
    roteirosDir: EPISODIOS_DIR,

    // Arquivos específicos
    noticiasRecentesFile: path.join(DATA_DIR, 'noticias-recentes.json'),
    pautaDoDiaFile: path.join(DATA_DIR, 'episodio-do-dia.json'),
    estadoColetaFile: path.join(DATA_DIR, 'estado_coleta.json'),
    sugestoesAberturaFile: path.join(DATA_DIR, 'sugestoes-abertura.json'),
    personagensFile: path.join(DATA_DIR, 'personagens.json'),
    roteiroTemplateFile: path.join(ROTEIRO_DIR, 'roteiro-template.md'),
    ttsConfigFile: path.join(DATA_DIR, 'tts-config.json'),
  },

  // Configurações de Análise
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

  tts: {
    sugestoesAberturaFile: path.join(DATA_DIR, 'sugestoes-abertura.json'),
    personagensFile: path.join(DATA_DIR, 'personagens.json'),
    ttsConfigFile: path.join(DATA_DIR, 'tts-config.json'),
    roteiroTemplateFile: path.join(ROTEIRO_DIR, 'roteiro-template.md'),
    roteirosDir: EPISODIOS_DIR, // Adicionado para roteiros
    audioOutputDir: path.resolve(__dirname, '..', 'audios_gerados'), // Adicionado para saída de áudio
  },

  geracaoAudio: {
    categoriaParaEstilo: {
      '⚫️': 'serio_ou_analitico',
      '🟡': 'serio_ou_analitico',
      '🔴': 'indignado_leve',
      '🚀': 'animado',
      '🎬': 'animado',
      '🎭': 'animado',
      '👽': 'curioso_ou_bizarro',
    },
  },

  mixagem: {
    ffmpegPath: process.env.FFMPEG_PATH || 'C:/Program Files/ffmpeg/bin/ffmpeg.exe',
    crossfadeDuration: 2,
  },
};
