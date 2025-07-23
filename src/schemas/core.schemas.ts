/**
 * @fileoverview Schemas Zod centralizados para validação de dados do projeto
 * @ai-purpose Define estruturas de dados com validação robusta e type safety
 */

import { z } from 'zod';

/**
 * Schema para notícia crua coletada dos feeds RSS
 * @ai-validation Garante que todas as notícias têm campos obrigatórios
 */
export const NoticiaCruaSchema = z.object({
  titulo: z.string().min(1, 'Título não pode estar vazio'),
  resumo: z.string().min(1, 'Resumo não pode estar vazio'),
  link: z.string().url('Link deve ser uma URL válida'),
  fonte: z.string().min(1, 'Fonte não pode estar vazia'),
  dataPublicacao: z.string().datetime('Data deve estar no formato ISO')
});

/**
 * Schema base para notícia completa com análise detalhada
 * @ai-validation Estrutura enriquecida para curadoria e automação
 */
export const NoticiaCompletaSchema = z.object({
  // Dados básicos
  id: z.string(),
  titulo: z.string(),
  resumo: z.string(),
  link: z.string().url(),
  fonte: z.string(),
  dataPublicacao: z.string().datetime(),
  
  // Análise IA
  relevancia: z.number().min(0).max(10),
  categoria: z.enum(['politica', 'economia', 'meio-ambiente', 'cultura', 'tecnologia', 'social', 'esportes', 'geral']),
  contextoAmazonico: z.string(),
  tempoEstimado: z.number().positive(),
  prioridade: z.enum(['alta', 'media', 'baixa']),
  
  // Métricas para decisão
  scoreTotal: z.number(),
  scoreDetalhado: z.object({
    relevanciaRegional: z.number(),
    impactoLocal: z.number(),
    urgencia: z.number(),
    unicidade: z.number(),
    engajamento: z.number()
  }),
  tagsDetectadas: z.array(z.string()),
  razaoRelevancia: z.string(),
  
  // Status de seleção
  statusSelecao: z.object({
    selecionadaAutomaticamente: z.boolean(),
    motivoSelecao: z.enum(['manchete', 'relevancia', 'diversidade', 'manual']).nullable(),
    posicaoRanking: z.number(),
    probabilidadeSelecao: z.number().min(0).max(1)
  }),
  
  // Metadados editoriais
  editorial: z.object({
    categoriaSugerida: z.string(),
    anguloPauta: z.string(),
    potencialPolemica: z.enum(['baixo', 'medio', 'alto']),
    adequacaoPublico: z.number().min(0).max(1)
  })
});

/**
 * Schema para notícias categorizadas completas (arquivo principal)
 * @ai-validation Estrutura para visualização e curadoria
 */
export const NoticiasCategorizadasCompletasSchema = z.object({
  data: z.string().datetime(),
  metadados: z.object({
    totalAnalisadas: z.number().nonnegative(),
    totalRelevantes: z.number().nonnegative(),
    fontesProcessadas: z.array(z.string()),
    tempoProcessamento: z.string(),
    versaoAnalise: z.string()
  }),
  estatisticas: z.object({
    distribucaoPorCategoria: z.record(z.number()),
    distribucaoPorRelevancia: z.record(z.number()),
    distribucaoPorPrioridade: z.record(z.number()),
    scoresMedios: z.record(z.number())
  }),
  sugestaoAutomatica: z.object({
    manchete: NoticiaCompletaSchema,
    noticiasRecomendadas: z.array(z.string()),
    justificativa: z.string(),
    confianca: z.number().min(0).max(1)
  }),
  categorias: z.object({
    politica: z.array(NoticiaCompletaSchema),
    economia: z.array(NoticiaCompletaSchema),
    cidades: z.array(NoticiaCompletaSchema),
    cultura: z.array(NoticiaCompletaSchema),
    esportes: z.array(NoticiaCompletaSchema),
    geral: z.array(NoticiaCompletaSchema)
  }),
  rankingGeral: z.array(NoticiaCompletaSchema),
  destaquesDoDia: z.object({
    maisRelevante: NoticiaCompletaSchema,
    maisAmazonico: NoticiaCompletaSchema,
    maisBizarro: NoticiaCompletaSchema,
    maisUrgente: NoticiaCompletaSchema
  })
});

/**
 * Schema para notícias selecionadas (episódio final)
 * @ai-validation Estrutura para produção do episódio
 */
export const NoticiasSelecionadasSchema = z.object({
  data: z.string().datetime(),
  metodo: z.enum(['automatico', 'manual', 'hibrido']),
  episodio: z.object({
    numero: z.number().positive().optional(),
    dataEpisodio: z.string().datetime(),
    tema: z.string(),
    duracaoEstimada: z.number().positive()
  }),
  manchete: NoticiaCompletaSchema,
  blocos: z.object({
    abertura: z.array(NoticiaCompletaSchema),
    principal: z.array(NoticiaCompletaSchema),
    fechamento: z.array(NoticiaCompletaSchema)
  }),
  estatisticas: z.object({
    totalNoticias: z.number().nonnegative(),
    duracaoTotal: z.number().positive(),
    distribuicaoTempo: z.record(z.number()),
    balanceamentoCategoria: z.record(z.number())
  }),
  justificativa: z.object({
    escolhaManchete: z.string(),
    criteriosSelecao: z.array(z.string()),
    observacoes: z.string().optional()
  })
});

/**
 * Schema para seleção manual
 * @ai-validation Configuração de curadoria manual
 */
export const SelecaoManualSchema = z.object({
  data: z.string().datetime(),
  manchete: z.string(), // ID da notícia
  noticiasEscolhidas: z.array(z.object({
    categoria: z.string(),
    ids: z.array(z.string())
  })),
  observacoes: z.string().optional()
});

/**
 * Schema simplificado para notícia
 * @ai-validation Estrutura mínima necessária para visualização
 */
export const NoticiaSimplificadaSchema = z.object({
    id: z.string(),
    titulo: z.string(),
    resumo: z.string(),
    fonte: z.string(),
    categoria: z.enum(['politica', 'economia', 'cidades', 'cultura', 'esportes', 'geral']),
    relevanceScore: z.number(),
    classification: z.object({
        id: z.string(),
        label: z.string(),
        isAdequate: z.boolean()
    })
});

/**
 * Schema para pauta do dia (versão simplificada)
 * @ai-validation Estrutura simplificada para visualização e seleção
 */
export const PautaDoDiaSchema = z.object({
    data: z.string(),
    manchete: z.string(),
    categorias: z.object({
        politica: z.array(NoticiaSimplificadaSchema),
        economia: z.array(NoticiaSimplificadaSchema),
        cidades: z.array(NoticiaSimplificadaSchema),
        cultura: z.array(NoticiaSimplificadaSchema),
        esportes: z.array(NoticiaSimplificadaSchema),
        geral: z.array(NoticiaSimplificadaSchema)
    }),
    rankingGeral: z.array(NoticiaSimplificadaSchema),
    metadados: z.object({
        totalAnalisadas: z.number(),
        totalRelevantes: z.number(),
        fontesProcessadas: z.array(z.string()),
        tempoProcessamento: z.string(),
        versaoAnalise: z.string()
    })
});

/**
 * Schema para roteiro estruturado do podcast
 * @ai-validation Garante estrutura correta para geração de áudio
 */
export const RoteiroPodcastSchema = z.object({
  episodio: z.object({
    numero: z.number().positive(),
    data: z.string().datetime(),
    tema: z.string(),
    duracaoEstimada: z.number().positive()
  }),
  abertura: z.object({
    saudacao: z.string(),
    apresentacao: z.string(),
    contextoDia: z.string()
  }),
  blocos: z.array(z.object({
    tipo: z.enum(['noticia', 'transicao', 'encerramento']),
    ordem: z.number().positive(),
    locutor: z.enum(['irai', 'taina']),
    conteudo: z.string(),
    observacoes: z.string().optional(),
    duracaoEstimada: z.number().positive()
  })),
  encerramento: z.object({
    resumo: z.string(),
    chamada: z.string(),
    despedida: z.string()
  }),
  metadados: z.object({
    versao: z.string(),
    geradoPor: z.string(),
    timestamp: z.string().datetime(),
    configuracoes: z.record(z.any()).optional()
  })
});

/**
 * Schema para configuração de TTS (Text-to-Speech)
 * @ai-validation Padroniza configurações de síntese de voz
 */
export const TTSConfigSchema = z.object({
  locutor: z.enum(['irai', 'taina']),
  configuracao: z.object({
    modelo: z.string(),
    voz: z.string(),
    velocidade: z.number().min(0.5).max(2.0),
    pitch: z.number().min(-20).max(20),
    qualidade: z.enum(['draft', 'standard', 'premium']),
    formato: z.enum(['mp3', 'wav', 'ogg']),
    sampleRate: z.number().positive()
  }),
  processamento: z.object({
    aplicarEfeitosPos: z.boolean().default(true),
    normalizarAudio: z.boolean().default(true),
    removerRuido: z.boolean().default(false)
  })
});

/**
 * Schema para arquivo de áudio gerado
 * @ai-validation Rastreia metadados dos arquivos de áudio
 */
export const AudioGeradoSchema = z.object({
  arquivo: z.string(),
  duracao: z.number().positive(),
  tamanho: z.number().positive(),
  locutor: z.enum(['irai', 'taina']),
  texto: z.string(),
  configuracao: TTSConfigSchema,
  timestamp: z.string().datetime(),
  qualidade: z.object({
    bitrate: z.number().positive(),
    sampleRate: z.number().positive(),
    canais: z.number().positive()
  })
});

// Type exports para usar em TypeScript
export type NoticiaCrua = z.infer<typeof NoticiaCruaSchema>;
export type NoticiaCompleta = z.infer<typeof NoticiaCompletaSchema>;
export type NoticiasCategorizadasCompletas = z.infer<typeof NoticiasCategorizadasCompletasSchema>;
export type NoticiasSelecionadas = z.infer<typeof NoticiasSelecionadasSchema>;
export type SelecaoManual = z.infer<typeof SelecaoManualSchema>;
export type RoteiroPodcast = z.infer<typeof RoteiroPodcastSchema>;
export type TTSConfig = z.infer<typeof TTSConfigSchema>;
export type AudioGerado = z.infer<typeof AudioGeradoSchema>;

// Backwards compatibility
export type PautaDoDia = NoticiasCategorizadasCompletas;
