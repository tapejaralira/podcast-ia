#!/usr/bin/env node

// scripts/selecionar-noticias.ts

import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import { 
  NoticiasCategorizadasCompletas, 
  NoticiaCompleta, 
  SelecaoManual 
} from '../src/schemas/core.schemas.js';
import { 
  NoticiasCategorizadasCompletasSchema,
  SelecaoManualSchema 
} from '../src/schemas/core.schemas.js';
import { validateWithSchema } from '../src/utils/validation.js';
import { filePaths } from '../src/config.js';

/**
 * @ai-purpose Interface CLI interativa para seleção manual de notícias do episódio
 * @ai-input-format NoticiasCategorizadasCompletas de noticias-categorizadas.json
 * @ai-output-format SelecaoManual salva em selecao-manual.json
 * @ai-dependencies Inquirer para interface CLI, sistema de validação Zod
 * @ai-error-handling Try/catch com mensagens user-friendly, validação de seleções
 * @ai-performance Execução local instantânea, sem custos de rede
 * @ai-context Interface amigável para curadoria editorial com preview das sugestões IA
 * @ai-validation Entrada validada como NoticiasCategorizadasCompletas, saída como SelecaoManual
 * @ai-side-effects Salva arquivo selecao-manual.json, exibe estatísticas da seleção
 * @ai-cost Zero custos - operação local de interface
 * @ai-quality-factors UX da interface (40%), clareza das informações (35%), facilidade de seleção (25%)
 * @ai-optimization-tips Use paginação para listas grandes, cache de escolhas parciais, preview da seleção
 * @ai-common-errors "File not found noticias-categorizadas.json", "Invalid selection", "Empty category"
 * @ai-debugging Verificar arquivo de entrada existe, validar estrutura carregada, testar seleções individuais
 * @ai-monitoring Tempo de seleção por usuário, categorias mais escolhidas, taxa de uso vs automação
 * @ai-scaling Máximo 200 notícias exibíveis, usar filtros e busca para datasets grandes
 * @ai-business-impact Permite controle editorial total, melhora qualidade do episódio, reduz dependência da IA
 * @ai-example
 * ```bash
 * npm run selecionar
 * # Interface interativa para escolher manchete e notícias por categoria
 * # Salva selecao-manual.json para ser usado na próxima execução
 * ```
 */
async function interfaceSelecaoManual(): Promise<void> {
  console.log('📰 CURADORIA MANUAL - BUBUIA NEWS\n');
  console.log('🎯 Selecione as notícias para o episódio de hoje\n');
  
  try {
    // 1. Carregar notícias categorizadas
    const noticias = await carregarNoticiasCategorizadas();
    
    // 2. Exibir estatísticas gerais
    exibirEstatisticasGerais(noticias);
    
    // 3. Mostrar sugestão da IA
    await mostrarSugestaoIA(noticias);
    
    // 4. Confirmar se quer usar sugestão ou fazer seleção manual
    const { usarSugestao } = await inquirer.prompt([{
      type: 'confirm',
      name: 'usarSugestao',
      message: '🤖 Deseja usar a sugestão automática da IA?',
      default: false
    }]);
    
    if (usarSugestao) {
      await aplicarSugestaoIA(noticias);
      return;
    }
    
    // 5. Seleção manual completa
    await processarSelecaoManual(noticias);
    
  } catch (error) {
    console.error('❌ Erro na interface de seleção:', error);
    process.exit(1);
  }
}

async function carregarNoticiasCategorizadas(): Promise<NoticiasCategorizadasCompletas> {
  try {
    const content = await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8');
    const dados = JSON.parse(content);
    
    return validateWithSchema(
      dados,
      NoticiasCategorizadasCompletasSchema,
      'carregarNoticiasCategorizadas'
    );
  } catch (error) {
    console.error('❌ Erro ao carregar notícias categorizadas');
    console.error('💡 Execute primeiro: npm run analisar');
    throw error;
  }
}

function exibirEstatisticasGerais(noticias: NoticiasCategorizadasCompletas): void {
  const { metadados, estatisticas } = noticias;
  
  console.log('📊 ESTATÍSTICAS GERAIS:');
  console.log(`   📈 Total analisadas: ${metadados.totalAnalisadas}`);
  console.log(`   ✅ Total relevantes: ${metadados.totalRelevantes}`);
  console.log(`   📰 Fontes: ${metadados.fontesProcessadas.join(', ')}\n`);
  
  console.log('📂 DISTRIBUIÇÃO POR CATEGORIA:');
  Object.entries(estatisticas.distribucaoPorCategoria).forEach(([categoria, qtd]) => {
    console.log(`   ${categoria.padEnd(12)}: ${qtd} notícias`);
  });
  console.log();
}

async function mostrarSugestaoIA(noticias: NoticiasCategorizadasCompletas): Promise<void> {
  const { sugestaoAutomatica } = noticias;
  
  console.log('🤖 SUGESTÃO AUTOMÁTICA DA IA:\n');
  
  console.log('🎯 MANCHETE SUGERIDA:');
  console.log(`   ${sugestaoAutomatica.manchete.titulo}`);
  console.log(`   📊 Score: ${sugestaoAutomatica.manchete.scoreTotal} | ${sugestaoAutomatica.manchete.categoria.toUpperCase()}`);
  console.log(`   🎯 ${sugestaoAutomatica.manchete.razaoRelevancia}\n`);
  
  console.log('📋 NOTÍCIAS RECOMENDADAS:');
  const noticiasRecomendadas = sugestaoAutomatica.noticiasRecomendadas
    .map(id => noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id))
    .filter(Boolean) as NoticiaCompleta[];
  
  noticiasRecomendadas.forEach((noticia, index) => {
    console.log(`   ${index + 1}. [${noticia.categoria.toUpperCase()}] ${noticia.titulo}`);
    console.log(`      Score: ${noticia.scoreTotal} | ${noticia.prioridade.toUpperCase()}`);
  });
  
  console.log(`\n💡 ${sugestaoAutomatica.justificativa}`);
  console.log(`🎯 Confiança: ${(sugestaoAutomatica.confianca * 100).toFixed(1)}%\n`);
}

async function aplicarSugestaoIA(noticias: NoticiasCategorizadasCompletas): Promise<void> {
  console.log('🤖 Aplicando sugestão automática da IA...\n');
  
  const selecaoManual: SelecaoManual = {
    data: new Date().toISOString(),
    manchete: noticias.sugestaoAutomatica.manchete.id,
    noticiasEscolhidas: organizarNoticiasRecomendadas(noticias),
    observacoes: 'Seleção baseada na sugestão automática da IA'
  };
  
  await salvarSelecaoManual(selecaoManual);
  
  console.log('✅ Sugestão da IA aplicada com sucesso!');
  console.log('💡 Execute: npm run analisar para gerar o episódio');
}

function organizarNoticiasRecomendadas(noticias: NoticiasCategorizadasCompletas) {
  const noticiasRecomendadas = noticias.sugestaoAutomatica.noticiasRecomendadas
    .map(id => noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id))
    .filter(Boolean) as NoticiaCompleta[];
  
  // Organizar por categoria
  const porCategoria: { [categoria: string]: string[] } = {};
  
  noticiasRecomendadas.forEach(noticia => {
    const categoria = mapearCategoriaParaPauta(noticia.categoria);
    if (!porCategoria[categoria]) porCategoria[categoria] = [];
    porCategoria[categoria].push(noticia.id);
  });
  
  return Object.entries(porCategoria).map(([categoria, ids]) => ({
    categoria,
    ids
  }));
}

async function processarSelecaoManual(noticias: NoticiasCategorizadasCompletas): Promise<void> {
  console.log('📝 SELEÇÃO MANUAL INICIADA\n');
  
  // 1. Escolher manchete
  const manchete = await escolherManchete(noticias);
  
  // 2. Escolher notícias por categoria
  const noticiasEscolhidas = await escolherPorCategoria(noticias);
  
  // 3. Revisão final
  await exibirResumoSelecao(manchete, noticiasEscolhidas, noticias);
  
  const { confirmar } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmar',
    message: '✅ Confirma esta seleção?',
    default: true
  }]);
  
  if (!confirmar) {
    console.log('❌ Seleção cancelada');
    return;
  }
  
  // 4. Adicionar observações
  const { observacoes } = await inquirer.prompt([{
    type: 'input',
    name: 'observacoes',
    message: '📝 Observações sobre esta seleção (opcional):',
    default: ''
  }]);
  
  // 5. Salvar seleção
  const selecaoManual: SelecaoManual = {
    data: new Date().toISOString(),
    manchete: manchete.id,
    noticiasEscolhidas,
    observacoes: observacoes || undefined
  };
  
  await salvarSelecaoManual(selecaoManual);
  
  console.log('\n✅ Seleção manual salva com sucesso!');
  console.log('💡 Execute: npm run analisar para gerar o episódio');
}

async function escolherManchete(noticias: NoticiasCategorizadasCompletas): Promise<NoticiaCompleta> {
  console.log('🎯 ESCOLHA DA MANCHETE\n');
  
  // Mostrar top 15 notícias mais relevantes
  const topNoticias = noticias.rankingGeral.slice(0, 15);
  
  const choices = topNoticias.map((noticia, index) => ({
    name: `${index + 1}. [${noticia.categoria.toUpperCase()}] ${noticia.titulo}\n    📊 Score: ${noticia.scoreTotal} | ${noticia.prioridade.toUpperCase()} | ${noticia.fonte}\n    🎯 ${noticia.razaoRelevancia}`,
    value: noticia,
    short: `${index + 1}. ${noticia.titulo.substring(0, 50)}...`
  }));
  
  const { manchete } = await inquirer.prompt([{
    type: 'list',
    name: 'manchete',
    message: '🎯 Escolha a MANCHETE do episódio:',
    choices,
    pageSize: 10
  }]);
  
  return manchete;
}

async function escolherPorCategoria(noticias: NoticiasCategorizadasCompletas): Promise<{ categoria: string; ids: string[] }[]> {
  const selecoes: { categoria: string; ids: string[] }[] = [];
  
  const categoriasDisponiveis = Object.entries(noticias.categorias)
    .filter(([, noticiasCategoria]) => noticiasCategoria.length > 0);
  
  for (const [categoria, noticiasCategoria] of categoriasDisponiveis) {
    console.log(`\n📂 CATEGORIA: ${categoria.toUpperCase()}`);
    console.log(`   ${noticiasCategoria.length} notícias disponíveis\n`);
    
    if (noticiasCategoria.length === 0) {
      console.log('   ⚠️  Nenhuma notícia disponível nesta categoria\n');
      continue;
    }
    
    // Perguntar se quer incluir notícias desta categoria
    const { incluirCategoria } = await inquirer.prompt([{
      type: 'confirm',
      name: 'incluirCategoria',
      message: `Incluir notícias de ${categoria}?`,
      default: true
    }]);
    
    if (!incluirCategoria) {
      continue;
    }
    
    // Mostrar notícias da categoria organizadas por score
    const choices = noticiasCategoria.map((noticia, index) => ({
      name: `[${noticia.prioridade.toUpperCase()}] ${noticia.titulo}\n    📊 Score: ${noticia.scoreTotal} | ${noticia.fonte}\n    🎯 ${noticia.razaoRelevancia}\n    ⏱️  ${noticia.tempoEstimado}s | 🌟 ${noticia.contextoAmazonico}`,
      value: noticia.id,
      checked: noticia.statusSelecao.selecionadaAutomaticamente // Pre-selecionar sugestões da IA
    }));
    
    const { escolhidas } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'escolhidas',
      message: `Escolha notícias para ${categoria} (recomendado: 2-4):`,
      choices,
      pageSize: 8,
      validate: (answer) => {
        if (answer.length > 6) {
          return 'Máximo de 6 notícias por categoria para manter episódio equilibrado';
        }
        return true;
      }
    }]);
    
    if (escolhidas.length > 0) {
      selecoes.push({
        categoria,
        ids: escolhidas
      });
    }
  }
  
  return selecoes;
}

async function exibirResumoSelecao(
  manchete: NoticiaCompleta, 
  noticiasEscolhidas: { categoria: string; ids: string[] }[],
  noticias: NoticiasCategorizadasCompletas
): Promise<void> {
  console.log('\n📋 RESUMO DA SELEÇÃO:\n');
  
  console.log('🎯 MANCHETE:');
  console.log(`   ${manchete.titulo}\n`);
  
  let totalNoticias = 1; // Manchete
  let duracaoTotal = manchete.tempoEstimado;
  
  console.log('📰 NOTÍCIAS POR CATEGORIA:');
  for (const { categoria, ids } of noticiasEscolhidas) {
    console.log(`\n   📂 ${categoria.toUpperCase()} (${ids.length} notícias):`);
    
    ids.forEach(id => {
      const noticia = noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id);
      if (noticia) {
        console.log(`      • ${noticia.titulo}`);
        console.log(`        ⏱️  ${noticia.tempoEstimado}s | Score: ${noticia.scoreTotal}`);
        totalNoticias++;
        duracaoTotal += noticia.tempoEstimado;
      }
    });
  }
  
  console.log(`\n📊 ESTATÍSTICAS DA SELEÇÃO:`);
  console.log(`   📰 Total de notícias: ${totalNoticias}`);
  console.log(`   ⏱️  Duração estimada: ${Math.round(duracaoTotal / 60)} min ${duracaoTotal % 60}s`);
  console.log(`   📈 Score médio: ${calcularScoreMedio(manchete, noticiasEscolhidas, noticias).toFixed(1)}\n`);
}

function calcularScoreMedio(
  manchete: NoticiaCompleta,
  noticiasEscolhidas: { categoria: string; ids: string[] }[],
  noticias: NoticiasCategorizadasCompletas
): number {
  const todasEscolhidas = [manchete];
  
  noticiasEscolhidas.forEach(({ ids }) => {
    ids.forEach(id => {
      const noticia = noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id);
      if (noticia) todasEscolhidas.push(noticia);
    });
  });
  
  const somaScores = todasEscolhidas.reduce((soma, noticia) => soma + noticia.scoreTotal, 0);
  return somaScores / todasEscolhidas.length;
}

async function salvarSelecaoManual(selecao: SelecaoManual): Promise<void> {
  const selecaoValidada = validateWithSchema(
    selecao,
    SelecaoManualSchema,
    'salvarSelecaoManual'
  );
  
  await fs.writeFile(
    filePaths.selecaoManualFile,
    JSON.stringify(selecaoValidada, null, 2)
  );
}

function mapearCategoriaParaPauta(categoria: string): string {
  const mapeamento: { [key: string]: string } = {
    'politica': 'politica',
    'economia': 'economia',
    'tecnologia': 'economia',
    'meio-ambiente': 'cidades',
    'social': 'cidades',
    'cultura': 'cultura',
    'esportes': 'esportes',
    'geral': 'cidades'
  };
  
  return mapeamento[categoria] || 'cidades';
}

// Executar se chamado diretamente
if (import.meta.url.includes('selecionar-noticias.ts') || process.argv[1]?.includes('selecionar-noticias')) {
  console.log('🚀 Iniciando sistema de seleção manual...');
  
  (async () => {
    try {
      // Carrega dados das notícias categorizadas
      console.log('📂 Carregando dados...');
      const dados = await carregarNoticiasCategorizadas()
      
      // Inicia interface de seleção manual com dados carregados
      console.log('🎯 Iniciando seleção manual...');
      await interfaceSelecaoManual()
      
      console.log('\n🎉 Seleção manual concluída!')
      console.log('💡 Próximo passo: Gerar roteiro com as notícias selecionadas')
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('metadados: Required') || 
            error.message.includes('categorias: Required') ||
            error.message.includes('carregarNoticiasCategorizadas falhou')) {
          console.log('\n⚠️ Dados estão no formato antigo (PautaDoDia).')
          console.log('📋 Para usar com dados atuais, execute:')
          console.log('   node selecionar-adaptado.mjs')
          console.log('\n💡 Para usar este script, é necessário dados no novo formato.')
          console.log('   Execute: npm run analisar:completo')
        } else {
          console.error('\n❌ Erro durante a seleção:', error.message);
          console.error('Stack:', error.stack);
        }
      } else {
        console.error('\n❌ Erro desconhecido:', error);
      }
      process.exit(1);
    }
  })();
}
