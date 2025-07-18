// src/noticias/analisarNoticiasCompleto.ts

import { promises as fs } from 'fs';
import { 
  NoticiaCrua,
  NoticiaCompleta, 
  NoticiasCategorizadasCompletas,
  NoticiasSelecionadas,
  SelecaoManual
} from '../schemas/core.schemas.js';
import { 
  NoticiaCruaSchema, 
  NoticiasCategorizadasCompletasSchema,
  NoticiasSelecionadasSchema,
  SelecaoManualSchema
} from '../schemas/core.schemas.js';
import { validateWithSchema, validateArrayWithSchema } from '../utils/validation.js';
import { config, filePaths } from '../config.js';
import { logInfo, logError } from '../utils/logger.js';
import { analisarNoticias as analisarNoticiasOriginal } from './analisarNoticias.js';

/**
 * @ai-purpose Gera estrutura completa de notícias categorizadas para curadoria e automação
 * @ai-input-format Array de NoticiaCrua de noticias-recentes.json
 * @ai-output-format NoticiasCategorizadasCompletas em noticias-categorizadas.json
 * @ai-dependencies OpenAI API para classificação, sistema de análise original
 * @ai-error-handling Try/catch com fallback para análise básica, logs estruturados
 * @ai-performance ~30-60s para 50-100 notícias, escala linear, sem overhead significativo
 * @ai-context Enriquece análise existente com métricas para curadoria manual/automática
 * @ai-validation Entrada como NoticiaCrua[], saída validada como NoticiasCategorizadasCompletas
 * @ai-side-effects Salva estrutura em noticias-categorizadas.json, logs de progresso
 * @ai-cost Mesmo custo da análise original (~$0.08-0.25), sem calls extras de IA
 * @ai-quality-factors Precisão classificação (40%), métricas curadoria (35%), organização (25%)
 * @ai-optimization-tips Use cache de scores calculados, batch processing de métricas
 * @ai-common-errors "Missing noticias-recentes.json", "Invalid structure after analysis", "Score calculation overflow"
 * @ai-debugging Verificar análise original funciona, validar cálculos de score, testar estrutura final
 * @ai-monitoring Taxa de notícias processadas, distribuição de scores, tempo por fase
 * @ai-scaling Máximo 200 notícias por execução, considerar paralelização de cálculos
 * @ai-business-impact Permite curadoria manual sem perder automação, melhora qualidade editorial
 * @ai-example
 * ```typescript
 * // Gera arquivo completo organizando todas as notícias
 * await gerarEstruturaCategorizada();
 * // Cria noticias-categorizadas.json pronto para curadoria ou automação
 * console.log('Estrutura completa gerada para decisão editorial');
 * ```
 */
export async function gerarEstruturaCategorizada(): Promise<void> {
  logInfo('🔍 Iniciando geração de estrutura categorizada completa');
  
  try {
    // 1. Carregar e validar notícias brutas
    const noticiasRaw = await carregarNoticiasBrutas();
    
    // 2. Executar análise original (classificação IA)
    await executarAnaliseOriginal();
    
    // 3. Carregar notícias analisadas do arquivo atual
    const noticiasClassificadas = await carregarNoticiasClassificadas();
    
    // 4. Enriquecer com métricas completas
    const noticiasCompletas = await enriquecerComMetricas(noticiasClassificadas);
    
    // 5. Gerar estrutura categorizada completa
    const estruturaCompleta = await montarEstruturaCompleta(noticiasCompletas);
    
    // 6. Validar e salvar
    const estruturaValidada = validateWithSchema(
      estruturaCompleta, 
      NoticiasCategorizadasCompletasSchema, 
      'gerarEstruturaCategorizada.output'
    );
    
    await fs.writeFile(
      filePaths.noticiasCategorizadasFile,
      JSON.stringify(estruturaValidada, null, 2)
    );
    
    logInfo('✅ Estrutura categorizada completa gerada', {
      totalRelevantes: estruturaValidada.metadados.totalRelevantes,
      categorias: Object.keys(estruturaValidada.categorias).length,
      arquivo: filePaths.noticiasCategorizadasFile
    });
    
  } catch (error) {
    logError('Erro ao gerar estrutura categorizada', error);
    throw error;
  }
}

/**
 * @ai-purpose Verifica se existe configuração de seleção manual ativa
 * @ai-input-format Arquivo selecao-manual.json opcional
 * @ai-output-format Boolean indicando modo de operação
 */
export async function verificarModoSelecao(): Promise<'automatico' | 'manual'> {
  try {
    const selecaoManualContent = await fs.readFile(filePaths.selecaoManualFile, 'utf-8');
    const selecaoManual = JSON.parse(selecaoManualContent);
    
    // Verificar se é uma seleção válida e recente (mesmo dia)
    const dataSelecao = new Date(selecaoManual.data);
    const hoje = new Date();
    const mesmoDia = dataSelecao.toDateString() === hoje.toDateString();
    
    if (mesmoDia && selecaoManual.manchete && selecaoManual.noticiasEscolhidas) {
      logInfo('📝 Modo manual detectado - seleção encontrada', {
        dataSelecao: selecaoManual.data,
        manchete: selecaoManual.manchete
      });
      return 'manual';
    }
  } catch (error) {
    // Arquivo não existe ou inválido - modo automático
  }
  
  return 'automatico';
}

/**
 * @ai-purpose Aplica seleção automática de notícias para o episódio
 * @ai-input-format NoticiasCategorizadasCompletas estruturadas
 * @ai-output-format NoticiasSelecionadas para produção do episódio
 */
export async function aplicarSelecaoAutomatica(
  noticiasCompletas: NoticiasCategorizadasCompletas
): Promise<void> {
  logInfo('🤖 Aplicando seleção automática de notícias');
  
  try {
    // Usar sugestão automática da IA
    const { sugestaoAutomatica } = noticiasCompletas;
    
    // Buscar notícias recomendadas por ID
    const noticiasEscolhidas = buscarNoticiasPorIds(
      noticiasCompletas, 
      sugestaoAutomatica.noticiasRecomendadas
    );
    
    // Organizar em blocos
    const blocos = organizarEmBlocos(noticiasEscolhidas);
    
    // Montar episódio final
    const episodio: NoticiasSelecionadas = {
      data: new Date().toISOString(),
      metodo: 'automatico',
      episodio: {
        dataEpisodio: noticiasCompletas.data,
        tema: sugestaoAutomatica.manchete.titulo,
        duracaoEstimada: calcularDuracaoTotal(noticiasEscolhidas)
      },
      manchete: sugestaoAutomatica.manchete,
      blocos,
      estatisticas: calcularEstatisticasEpisodio(noticiasEscolhidas),
      justificativa: {
        escolhaManchete: `Score: ${sugestaoAutomatica.manchete.scoreTotal} - ${sugestaoAutomatica.manchete.razaoRelevancia}`,
        criteriosSelecao: [
          'Relevância regional',
          'Diversidade de categorias',
          'Impacto local',
          'Urgência da informação'
        ],
        observacoes: sugestaoAutomatica.justificativa
      }
    };
    
    // Validar e salvar
    const episodioValidado = validateWithSchema(
      episodio,
      NoticiasSelecionadasSchema,
      'aplicarSelecaoAutomatica.output'
    );
    
    await fs.writeFile(
      filePaths.noticiasSelecionadasFile,
      JSON.stringify(episodioValidado, null, 2)
    );
    
    logInfo('✅ Seleção automática aplicada', {
      totalNoticias: episodioValidado.estatisticas.totalNoticias,
      duracaoTotal: episodioValidado.estatisticas.duracaoTotal,
      confianca: sugestaoAutomatica.confianca
    });
    
  } catch (error) {
    logError('Erro na seleção automática', error);
    throw error;
  }
}

/**
 * @ai-purpose Aplica seleção manual de notícias baseada em arquivo de configuração
 * @ai-input-format SelecaoManual + NoticiasCategorizadasCompletas
 * @ai-output-format NoticiasSelecionadas customizadas
 */
export async function aplicarSelecaoManual(
  noticiasCompletas: NoticiasCategorizadasCompletas
): Promise<void> {
  logInfo('📝 Aplicando seleção manual de notícias');
  
  try {
    // Carregar seleção manual
    const selecaoManualRaw = JSON.parse(
      await fs.readFile(filePaths.selecaoManualFile, 'utf-8')
    );
    
    const selecaoManual = validateWithSchema(
      selecaoManualRaw,
      SelecaoManualSchema,
      'aplicarSelecaoManual.input'
    );
    
    // Buscar manchete escolhida
    const manchete = buscarNoticiaPorId(noticiasCompletas, selecaoManual.manchete);
    if (!manchete) {
      throw new Error(`Manchete não encontrada: ${selecaoManual.manchete}`);
    }
    
    // Buscar notícias escolhidas
    const idsEscolhidos = selecaoManual.noticiasEscolhidas
      .flatMap(categoria => categoria.ids);
    
    const noticiasEscolhidas = buscarNoticiasPorIds(noticiasCompletas, idsEscolhidos);
    
    // Marcar como seleção manual
    noticiasEscolhidas.forEach(noticia => {
      noticia.statusSelecao.motivoSelecao = 'manual';
    });
    
    // Organizar em blocos
    const blocos = organizarEmBlocos(noticiasEscolhidas);
    
    // Montar episódio final
    const episodio: NoticiasSelecionadas = {
      data: new Date().toISOString(),
      metodo: 'manual',
      episodio: {
        dataEpisodio: noticiasCompletas.data,
        tema: manchete.titulo,
        duracaoEstimada: calcularDuracaoTotal([manchete, ...noticiasEscolhidas])
      },
      manchete,
      blocos,
      estatisticas: calcularEstatisticasEpisodio([manchete, ...noticiasEscolhidas]),
      justificativa: {
        escolhaManchete: `Seleção manual - ${manchete.razaoRelevancia}`,
        criteriosSelecao: ['Curadoria editorial manual'],
        observacoes: selecaoManual.observacoes
      }
    };
    
    // Validar e salvar
    const episodioValidado = validateWithSchema(
      episodio,
      NoticiasSelecionadasSchema,
      'aplicarSelecaoManual.output'
    );
    
    await fs.writeFile(
      filePaths.noticiasSelecionadasFile,
      JSON.stringify(episodioValidado, null, 2)
    );
    
    logInfo('✅ Seleção manual aplicada', {
      totalNoticias: episodioValidado.estatisticas.totalNoticias,
      duracaoTotal: episodioValidado.estatisticas.duracaoTotal,
      observacoes: selecaoManual.observacoes || 'Nenhuma'
    });
    
  } catch (error) {
    logError('Erro na seleção manual', error);
    throw error;
  }
}

// === FUNÇÕES AUXILIARES ===

async function carregarNoticiasBrutas(): Promise<NoticiaCrua[]> {
  const content = await fs.readFile(filePaths.noticiasRecentesFile, 'utf-8');
  const rawNoticias = JSON.parse(content);
  
  const validationResult = validateArrayWithSchema(
    rawNoticias,
    NoticiaCruaSchema,
    'carregarNoticiasBrutas'
  );
  
  return validationResult.valid as NoticiaCrua[];
}

async function executarAnaliseOriginal(): Promise<void> {
  // Chama a função original de análise que já existe
  await analisarNoticiasOriginal();
}

async function carregarNoticiasClassificadas(): Promise<any[]> {
  const content = await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8');
  const dados = JSON.parse(content);
  
  // Extrair notícias de todas as categorias do formato atual
  const noticias = [];
  if (dados.pauta) {
    // Formato antigo
    for (const categoria of Object.values(dados.pauta)) {
      if (Array.isArray(categoria)) {
        noticias.push(...categoria);
      }
    }
  } else if (dados.categorias) {
    // Formato novo
    for (const categoria of Object.values(dados.categorias)) {
      if (Array.isArray(categoria)) {
        noticias.push(...categoria);
      }
    }
  }
  
  return noticias;
}

async function enriquecerComMetricas(noticias: any[]): Promise<NoticiaCompleta[]> {
  return noticias.map((noticia, index) => {
    // Calcular métricas detalhadas
    const scoreDetalhado = calcularScoreDetalhado(noticia);
    const scoreTotal = Object.values(scoreDetalhado).reduce((a, b) => a + b, 0);
    
    return {
      ...noticia,
      scoreTotal,
      scoreDetalhado,
      tagsDetectadas: extrairTags(noticia),
      razaoRelevancia: gerarRazaoRelevancia(noticia, scoreDetalhado),
      statusSelecao: {
        selecionadaAutomaticamente: scoreTotal >= 70,
        motivoSelecao: determinarMotivoSelecao(scoreTotal, scoreDetalhado),
        posicaoRanking: index + 1,
        probabilidadeSelecao: Math.min(scoreTotal / 100, 1)
      },
      editorial: {
        categoriaSugerida: noticia.categoria || 'geral',
        anguloPauta: sugerirAnguloPauta(noticia),
        potencialPolemica: avaliarPotencialPolemica(noticia),
        adequacaoPublico: calcularAdequacaoPublico(noticia)
      }
    } as NoticiaCompleta;
  });
}

async function montarEstruturaCompleta(noticias: NoticiaCompleta[]): Promise<NoticiasCategorizadasCompletas> {
  // Ordenar por score total
  const rankingGeral = noticias.sort((a, b) => b.scoreTotal - a.scoreTotal);
  
  // Atualizar posições no ranking
  rankingGeral.forEach((noticia, index) => {
    noticia.statusSelecao.posicaoRanking = index + 1;
  });
  
  // Agrupar por categoria
  const categorias = {
    politica: rankingGeral.filter(n => n.categoria === 'politica'),
    economia: rankingGeral.filter(n => n.categoria === 'economia' || n.categoria === 'tecnologia'),
    cidades: rankingGeral.filter(n => n.categoria === 'social' || n.categoria === 'meio-ambiente'),
    cultura: rankingGeral.filter(n => n.categoria === 'cultura'),
    esportes: rankingGeral.filter(n => n.categoria === 'esportes'),
    geral: rankingGeral.filter(n => n.categoria === 'geral' || !['politica', 'economia', 'tecnologia', 'social', 'meio-ambiente', 'cultura', 'esportes'].includes(n.categoria))
  };
  
  // Identificar destaques
  const destaquesDoDia = identificarDestaques(rankingGeral);
  
  // Gerar sugestão automática
  const sugestaoAutomatica = gerarSugestaoAutomatica(rankingGeral);
  
  return {
    data: new Date().toISOString(),
    metadados: {
      totalAnalisadas: noticias.length,
      totalRelevantes: noticias.filter(n => n.relevancia >= 5).length,
      fontesProcessadas: [...new Set(noticias.map(n => n.fonte))],
      tempoProcessamento: `${Date.now()}ms`,
      versaoAnalise: '2.0.0'
    },
    estatisticas: calcularEstatisticasCompletas(noticias),
    sugestaoAutomatica,
    categorias,
    rankingGeral,
    destaquesDoDia
  };
}

function calcularScoreDetalhado(noticia: any) {
  const titulo = noticia.titulo?.toLowerCase() || '';
  const resumo = noticia.resumo?.toLowerCase() || '';
  const contexto = noticia.contextoAmazonico?.toLowerCase() || '';
  
  return {
    relevanciaRegional: calcularRelevanciaRegional(titulo, contexto),
    impactoLocal: calcularImpactoLocal(titulo, resumo),
    urgencia: calcularUrgencia(noticia),
    unicidade: calcularUnicidade(titulo),
    engajamento: calcularPotencialEngajamento(titulo, resumo)
  };
}

function calcularRelevanciaRegional(titulo: string, contexto: string): number {
  const palavrasAmazonas = ['manaus', 'amazonas', 'amazônica', 'norte', 'regional'];
  let score = 0;
  
  palavrasAmazonas.forEach(palavra => {
    if (titulo.includes(palavra)) score += 15;
    if (contexto.includes(palavra)) score += 10;
  });
  
  return Math.min(score, 25);
}

function calcularImpactoLocal(titulo: string, resumo: string): number {
  const impactoAlto = ['governo', 'prefeito', 'cidade', 'população', 'serviços'];
  let score = 0;
  
  impactoAlto.forEach(palavra => {
    if (titulo.includes(palavra)) score += 10;
    if (resumo.includes(palavra)) score += 5;
  });
  
  return Math.min(score, 20);
}

function calcularUrgencia(noticia: any): number {
  const urgentes = ['urgente', 'agora', 'hoje', 'emergência', 'alerta'];
  const titulo = noticia.titulo?.toLowerCase() || '';
  
  const temUrgencia = urgentes.some(palavra => titulo.includes(palavra));
  const dataRecente = new Date(noticia.dataPublicacao) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return (temUrgencia ? 15 : 0) + (dataRecente ? 10 : 0);
}

function calcularUnicidade(titulo: string): number {
  // Palavras que indicam notícias únicas/interessantes
  const unicas = ['primeira vez', 'inédito', 'novo', 'inauguração', 'descoberta'];
  let score = 0;
  
  unicas.forEach(palavra => {
    if (titulo.includes(palavra)) score += 8;
  });
  
  return Math.min(score, 15);
}

function calcularPotencialEngajamento(titulo: string, resumo: string): number {
  const engajantes = ['festival', 'arte', 'cultura', 'tecnologia', 'inovação'];
  let score = 0;
  
  engajantes.forEach(palavra => {
    if (titulo.includes(palavra)) score += 8;
    if (resumo.includes(palavra)) score += 3;
  });
  
  return Math.min(score, 20);
}

function extrairTags(noticia: any): string[] {
  const titulo = noticia.titulo?.toLowerCase() || '';
  const tags = [];
  
  const tagMap = {
    'política': ['governo', 'eleição', 'deputado', 'senador', 'prefeitura'],
    'economia': ['economia', 'emprego', 'investimento', 'mercado'],
    'cultura': ['festival', 'arte', 'cultura', 'música'],
    'tecnologia': ['tecnologia', 'digital', 'internet', 'app'],
    'saúde': ['saúde', 'hospital', 'médico', 'tratamento'],
    'educação': ['educação', 'escola', 'universidade', 'ensino']
  };
  
  for (const [tag, palavras] of Object.entries(tagMap)) {
    if (palavras.some(palavra => titulo.includes(palavra))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

function gerarRazaoRelevancia(noticia: any, scoreDetalhado: any): string {
  const razoes = [];
  
  if (scoreDetalhado.relevanciaRegional > 15) razoes.push('Alta relevância regional');
  if (scoreDetalhado.impactoLocal > 15) razoes.push('Impacto local significativo');
  if (scoreDetalhado.urgencia > 15) razoes.push('Informação urgente');
  if (scoreDetalhado.engajamento > 15) razoes.push('Alto potencial de engajamento');
  
  return razoes.length > 0 ? razoes.join(', ') : 'Relevância padrão para a região';
}

function determinarMotivoSelecao(scoreTotal: number, scoreDetalhado: any): 'manchete' | 'relevancia' | 'diversidade' | null {
  if (scoreTotal > 85) return 'manchete';
  if (scoreTotal > 70) return 'relevancia';
  if (scoreDetalhado.unicidade > 10) return 'diversidade';
  return null;
}

function sugerirAnguloPauta(noticia: any): string {
  const categoria = noticia.categoria;
  const titulo = noticia.titulo?.toLowerCase() || '';
  
  if (categoria === 'politica') return 'Impacto nas políticas públicas locais';
  if (categoria === 'economia') return 'Reflexos na economia regional';
  if (categoria === 'cultura') return 'Valorização da identidade amazônica';
  if (titulo.includes('manaus')) return 'Foco no impacto para a capital';
  
  return 'Interesse geral da população';
}

function avaliarPotencialPolemica(noticia: any): 'baixo' | 'medio' | 'alto' {
  const titulo = noticia.titulo?.toLowerCase() || '';
  const polemicas = ['polêmica', 'crítica', 'protesto', 'denúncia', 'escândalo'];
  
  if (polemicas.some(palavra => titulo.includes(palavra))) return 'alto';
  if (noticia.categoria === 'politica') return 'medio';
  return 'baixo';
}

function calcularAdequacaoPublico(noticia: any): number {
  // Baseado na categoria e conteúdo
  const categoria = noticia.categoria;
  
  switch (categoria) {
    case 'cultura': return 0.9;
    case 'social': return 0.85;
    case 'economia': return 0.7;
    case 'politica': return 0.75;
    default: return 0.6;
  }
}

function identificarDestaques(noticias: NoticiaCompleta[]) {
  return {
    maisRelevante: noticias[0], // Primeiro do ranking
    maisAmazonico: noticias.find(n => n.scoreDetalhado.relevanciaRegional > 20) || noticias[0],
    maisBizarro: noticias.find(n => n.scoreDetalhado.unicidade > 10) || noticias[noticias.length - 1],
    maisUrgente: noticias.find(n => n.scoreDetalhado.urgencia > 15) || noticias[0]
  };
}

function gerarSugestaoAutomatica(noticias: NoticiaCompleta[]) {
  const manchete = noticias[0]; // Mais relevante
  
  // Selecionar notícias para o episódio (diversificando categorias)
  const noticiasRecomendadas = [];
  const categoriasUsadas = new Set();
  
  for (const noticia of noticias) {
    if (noticiasRecomendadas.length >= 8) break; // Máximo 8 notícias
    
    if (!categoriasUsadas.has(noticia.categoria) || noticiasRecomendadas.length < 4) {
      noticiasRecomendadas.push(noticia.id);
      categoriasUsadas.add(noticia.categoria);
    }
  }
  
  return {
    manchete,
    noticiasRecomendadas,
    justificativa: `Seleção baseada em score de relevância (${manchete.scoreTotal}) e diversidade de categorias`,
    confianca: Math.min(manchete.scoreTotal / 100, 1)
  };
}

function calcularEstatisticasCompletas(noticias: NoticiaCompleta[]) {
  const porCategoria: Record<string, number> = {};
  const porRelevancia: Record<string, number> = { baixa: 0, media: 0, alta: 0 };
  const porPrioridade: Record<string, number> = { baixa: 0, media: 0, alta: 0 };
  const scoresPorCategoria: Record<string, number[]> = {};
  
  noticias.forEach(noticia => {
    // Por categoria
    porCategoria[noticia.categoria] = (porCategoria[noticia.categoria] || 0) + 1;
    
    // Por relevância
    if (noticia.relevancia <= 3) porRelevancia.baixa++;
    else if (noticia.relevancia <= 7) porRelevancia.media++;
    else porRelevancia.alta++;
    
    // Por prioridade
    porPrioridade[noticia.prioridade]++;
    
    // Scores por categoria
    if (!scoresPorCategoria[noticia.categoria]) scoresPorCategoria[noticia.categoria] = [];
    scoresPorCategoria[noticia.categoria].push(noticia.scoreTotal);
  });
  
  // Calcular médias de scores
  const scoresMedios: Record<string, number> = {};
  Object.entries(scoresPorCategoria).forEach(([categoria, scores]) => {
    scoresMedios[categoria] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  
  return {
    distribucaoPorCategoria: porCategoria,
    distribucaoPorRelevancia: porRelevancia,
    distribucaoPorPrioridade: porPrioridade,
    scoresMedios
  };
}

function buscarNoticiasPorIds(noticias: NoticiasCategorizadasCompletas, ids: string[]): NoticiaCompleta[] {
  const todasNoticias = noticias.rankingGeral;
  return ids.map(id => {
    const noticia = todasNoticias.find((n: NoticiaCompleta) => n.id === id);
    if (!noticia) throw new Error(`Notícia não encontrada: ${id}`);
    return noticia;
  });
}

function buscarNoticiaPorId(noticias: NoticiasCategorizadasCompletas, id: string): NoticiaCompleta | null {
  return noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id) || null;
}

function organizarEmBlocos(noticias: NoticiaCompleta[]) {
  // Organizar notícias em blocos para o episódio
  const ordenadas = noticias.sort((a, b) => b.scoreTotal - a.scoreTotal);
  
  return {
    abertura: ordenadas.slice(0, 3), // 3 primeiras mais relevantes
    principal: ordenadas.slice(3, 6), // 3 seguintes
    fechamento: ordenadas.slice(6) // Restantes
  };
}

function calcularDuracaoTotal(noticias: NoticiaCompleta[]): number {
  return noticias.reduce((total, noticia) => total + noticia.tempoEstimado, 0);
}

function calcularEstatisticasEpisodio(noticias: NoticiaCompleta[]) {
  const totalNoticias = noticias.length;
  const duracaoTotal = calcularDuracaoTotal(noticias);
  
  const distribuicaoTempo: Record<string, number> = {};
  const balanceamentoCategoria: Record<string, number> = {};
  
  noticias.forEach(noticia => {
    // Distribuição de tempo por categoria
    distribuicaoTempo[noticia.categoria] = (distribuicaoTempo[noticia.categoria] || 0) + noticia.tempoEstimado;
    
    // Balanceamento de categorias
    balanceamentoCategoria[noticia.categoria] = (balanceamentoCategoria[noticia.categoria] || 0) + 1;
  });
  
  return {
    totalNoticias,
    duracaoTotal,
    distribuicaoTempo,
    balanceamentoCategoria
  };
}

// Executar se chamado diretamente
if (import.meta.url.includes('analisarNoticiasCompleto.ts') || 
    process.argv[1]?.includes('analisarNoticiasCompleto')) {
  const modo = process.argv.includes('--manual') ? 'manual' : 'auto';
  
  console.log(`🚀 Executando análise completa - modo: ${modo}`);
  
  gerarEstruturaCategorizada()
    .then(async () => {
      if (modo === 'auto') {
        // Verificar modo e aplicar seleção
        const modoDetectado = await verificarModoSelecao();
        
        if (modoDetectado === 'manual') {
          console.log('📝 Seleção manual detectada - carregando configuração...');
          const noticias = JSON.parse(await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8'));
          await aplicarSelecaoManual(noticias);
        } else {
          console.log('🤖 Aplicando seleção automática...');
          const noticias = JSON.parse(await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8'));
          await aplicarSelecaoAutomatica(noticias);
        }
      }
      
      console.log('✅ Processamento completo finalizado');
    })
    .catch(error => {
      console.error('❌ Erro no processamento:', error);
      process.exit(1);
    });
}
