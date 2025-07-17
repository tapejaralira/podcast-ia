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
  link: z.string().url('Link deve ser uma URL válida'),
  descricao: z.string().min(1, 'Descrição não pode estar vazia'),
  dataPublicacao: z.string().datetime('Data deve estar no formato ISO'),
  fonte: z.string().min(1, 'Fonte não pode estar vazia'),
  categoria: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relevanciaRegional: z.number().min(0).max(10).default(5),
  conteudoCompleto: z.string().optional()
});

/**
 * Schema para pauta do dia processada e organizada
 * @ai-validation Estrutura final da análise de notícias
 */
export const PautaDoDiaSchema = z.object({
  data: z.string().datetime(),
  noticias: z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    resumo: z.string(),
    relevancia: z.number().min(0).max(10),
    categoria: z.enum(['politica', 'economia', 'meio-ambiente', 'cultura', 'tecnologia', 'social']),
    contextoAmazonico: z.string(),
    tempoEstimado: z.number().positive(), // segundos
    prioridade: z.enum(['alta', 'media', 'baixa'])
  })),
  temaDestaque: z.string(),
  duracaoTotal: z.number().positive(),
  estatisticas: z.object({
    totalNoticias: z.number().nonnegative(),
    noticiasPorCategoria: z.record(z.number()),
    relevanciaMedia: z.number().min(0).max(10)
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
export type PautaDoDia = z.infer<typeof PautaDoDiaSchema>;
export type RoteiroPodcast = z.infer<typeof RoteiroPodcastSchema>;
export type TTSConfig = z.infer<typeof TTSConfigSchema>;
export type AudioGerado = z.infer<typeof AudioGeradoSchema>;
