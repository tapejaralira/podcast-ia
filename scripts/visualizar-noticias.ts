#!/usr/bin/env node

// scripts/visualizar-noticias.ts

import { promises as fs } from 'fs';
import { 
  NoticiasCategorizadasCompletas, 
  NoticiaCompleta 
} from '../src/schemas/core.schemas.js';
import { 
  NoticiasCategorizadasCompletasSchema
} from '../src/schemas/core.schemas.js';
import { validateWithSchema } from '../src/utils/validation.js';
import { filePaths } from '../src/config.js';

/**
 * @ai-purpose Exibe notícias categorizadas de forma organizada e legível para curadoria
 * @ai-input-format NoticiasCategorizadasCompletas de noticias-categorizadas.json
 * @ai-output-format Saída formatada no console com estatísticas e ranking
 * @ai-dependencies Sistema de validação Zod, arquivo noticias-categorizadas.json
 * @ai-error-handling Try/catch com mensagens claras, fallback para estruturas incompletas
 * @ai-performance Execução instantânea local, sem limitações de performance
 * @ai-context Ferramenta de visualização para facilitar decisões editoriais
 * @ai-validation Entrada validada como NoticiasCategorizadasCompletas
 * @ai-side-effects Apenas output no console, sem modificação de arquivos
 * @ai-cost Zero custos - visualização local
 * @ai-quality-factors Clareza da apresentação (50%), organização lógica (30%), completude das informações (20%)
 * @ai-optimization-tips Use paginação para muitas notícias, cores para prioridades, filtragem por categoria
 * @ai-common-errors "File not found", "Invalid structure", "Empty categories"
 * @ai-debugging Verificar arquivo existe, validar estrutura carregada, testar com dados incompletos
 * @ai-monitoring Frequência de uso da visualização, categorias mais consultadas
 * @ai-scaling Máximo 500 notícias exibíveis sem perda de performance
 * @ai-business-impact Acelera processo de curadoria, melhora tomada de decisão editorial
 * @ai-example
 * ```bash
 * npm run visualizar
 * # Exibe todas as notícias organizadas por categoria e score
 * # Mostra estatísticas e ranking para facilitar seleção
 * ```
 */
async function visualizarNoticias(): Promise<void> {
  console.log('👁️  VISUALIZAÇÃO DE NOTÍCIAS CATEGORIZADAS\n');
  
  try {
    // Carregar notícias categorizadas
    const noticias = await carregarNoticiasCategorizadas();
    
    // Exibir estatísticas gerais
    exibirEstatisticasGerais(noticias);
    
    // Exibir sugestão automática
    exibirSugestaoAutomatica(noticias);
    
    // Exibir destaques do dia
    exibirDestaquesDoDia(noticias);
    
    // Exibir ranking geral
    exibirRankingGeral(noticias.rankingGeral);
    
    // Exibir por categorias
    exibirPorCategorias(noticias.categorias);
    
    // Informações finais
    exibirInformacoesFinal(noticias);
    
  } catch (error) {
    console.error('❌ Erro ao visualizar notícias:', error);
    console.error('💡 Execute primeiro: npm run analisar');
    process.exit(1);
  }
}

async function carregarNoticiasCategorizadas(): Promise<NoticiasCategorizadasCompletas> {
  const content = await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8');
  const dados = JSON.parse(content);
  
  return validateWithSchema(
    dados,
    NoticiasCategorizadasCompletasSchema,
    'visualizarNoticias.carregar'
  );
}

function exibirEstatisticasGerais(noticias: NoticiasCategorizadasCompletas): void {
  const { metadados, estatisticas } = noticias;
  
  console.log('📊 ESTATÍSTICAS GERAIS');
  console.log('═'.repeat(50));
  console.log(`📈 Total analisadas: ${metadados.totalAnalisadas}`);
  console.log(`✅ Total relevantes: ${metadados.totalRelevantes}`);
  console.log(`📰 Fontes processadas: ${metadados.fontesProcessadas.length}`);
  console.log(`   ${metadados.fontesProcessadas.join(', ')}`);
  console.log(`⏱️  Processamento: ${metadados.tempoProcessamento}`);
  console.log(`🔢 Versão análise: ${metadados.versaoAnalise}\n`);
  
  console.log('📂 DISTRIBUIÇÃO POR CATEGORIA:');
  Object.entries(estatisticas.distribucaoPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .forEach(([categoria, qtd]) => {
      const barra = '█'.repeat(Math.max(1, Math.round(qtd / 3)));
      console.log(`   ${categoria.padEnd(15)}: ${qtd.toString().padStart(2)} ${barra}`);
    });
  
  console.log('\n🎯 DISTRIBUIÇÃO POR PRIORIDADE:');
  Object.entries(estatisticas.distribucaoPorPrioridade)
    .forEach(([prioridade, qtd]) => {
      const emoji = prioridade === 'alta' ? '🔴' : prioridade === 'media' ? '🟡' : '🟢';
      console.log(`   ${emoji} ${prioridade.padEnd(8)}: ${qtd} notícias`);
    });
  
  console.log('\n📈 SCORES MÉDIOS POR CATEGORIA:');
  Object.entries(estatisticas.scoresMedios)
    .sort(([,a], [,b]) => b - a)
    .forEach(([categoria, score]) => {
      console.log(`   ${categoria.padEnd(15)}: ${score.toFixed(1)}`);
    });
  
  console.log('\n');
}

function exibirSugestaoAutomatica(noticias: NoticiasCategorizadasCompletas): void {
  const { sugestaoAutomatica } = noticias;
  
  console.log('🤖 SUGESTÃO AUTOMÁTICA DA IA');
  console.log('═'.repeat(50));
  
  console.log('🎯 MANCHETE SUGERIDA:');
  const manchete = sugestaoAutomatica.manchete;
  console.log(`   📰 ${manchete.titulo}`);
  console.log(`   📊 Score: ${manchete.scoreTotal} | Categoria: ${manchete.categoria.toUpperCase()}`);
  console.log(`   ⏱️  Tempo: ${manchete.tempoEstimado}s | Prioridade: ${manchete.prioridade.toUpperCase()}`);
  console.log(`   🎯 ${manchete.razaoRelevancia}`);
  console.log(`   🌟 ${manchete.contextoAmazonico}\n`);
  
  console.log('📋 NOTÍCIAS RECOMENDADAS:');
  const recomendadas = sugestaoAutomatica.noticiasRecomendadas
    .map(id => noticias.rankingGeral.find((n: NoticiaCompleta) => n.id === id))
    .filter(Boolean) as NoticiaCompleta[];
  
  recomendadas.forEach((noticia, index) => {
    const emoji = noticia.prioridade === 'alta' ? '🔴' : noticia.prioridade === 'media' ? '🟡' : '🟢';
    console.log(`   ${(index + 1).toString().padStart(2)}. ${emoji} [${noticia.categoria.toUpperCase()}] ${noticia.titulo}`);
    console.log(`       📊 Score: ${noticia.scoreTotal} | ⏱️  ${noticia.tempoEstimado}s | 📰 ${noticia.fonte}`);
  });
  
  console.log(`\n💡 Justificativa: ${sugestaoAutomatica.justificativa}`);
  console.log(`🎯 Confiança: ${(sugestaoAutomatica.confianca * 100).toFixed(1)}%\n`);
}

function exibirDestaquesDoDia(noticias: NoticiasCategorizadasCompletas): void {
  const { destaquesDoDia } = noticias;
  
  console.log('⭐ DESTAQUES DO DIA');
  console.log('═'.repeat(50));
  
  const destaques = [
    { emoji: '🏆', label: 'Mais Relevante', noticia: destaquesDoDia.maisRelevante },
    { emoji: '🌳', label: 'Mais Amazônico', noticia: destaquesDoDia.maisAmazonico },
    { emoji: '🎭', label: 'Mais Bizarro', noticia: destaquesDoDia.maisBizarro },
    { emoji: '⚡', label: 'Mais Urgente', noticia: destaquesDoDia.maisUrgente }
  ];
  
  destaques.forEach(({ emoji, label, noticia }) => {
    console.log(`${emoji} ${label.toUpperCase()}:`);
    console.log(`   📰 ${noticia.titulo}`);
    console.log(`   📊 Score: ${noticia.scoreTotal} | 🏷️  ${noticia.categoria} | ⏱️  ${noticia.tempoEstimado}s\n`);
  });
}

function exibirRankingGeral(noticias: NoticiaCompleta[]): void {
  console.log('🏆 RANKING GERAL (TOP 15)');
  console.log('═'.repeat(70));
  
  const top15 = noticias.slice(0, 15);
  
  top15.forEach((noticia, index) => {
    const posicao = (index + 1).toString().padStart(2);
    const score = noticia.scoreTotal.toString().padStart(3);
    const emoji = noticia.prioridade === 'alta' ? '🔴' : noticia.prioridade === 'media' ? '🟡' : '🟢';
    const categoria = noticia.categoria.toUpperCase().padEnd(12);
    
    console.log(`${posicao}. ${emoji} [${categoria}] Score: ${score} | ${noticia.titulo}`);
    console.log(`    🎯 ${noticia.razaoRelevancia}`);
    console.log(`    📰 ${noticia.fonte} | ⏱️  ${noticia.tempoEstimado}s | 🌟 ${noticia.contextoAmazonico}\n`);
  });
}

function exibirPorCategorias(categorias: { [categoria: string]: NoticiaCompleta[] }): void {
  console.log('📂 NOTÍCIAS POR CATEGORIA');
  console.log('═'.repeat(70));
  
  Object.entries(categorias)
    .filter(([, noticias]) => noticias.length > 0)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([categoria, noticias]) => {
      console.log(`\n📂 ${categoria.toUpperCase()} (${noticias.length} notícias)`);
      console.log('─'.repeat(50));
      
      // Mostrar top 8 da categoria
      const topCategoria = noticias.slice(0, 8);
      
      topCategoria.forEach((noticia, index) => {
        const emoji = noticia.prioridade === 'alta' ? '🔴' : noticia.prioridade === 'media' ? '🟡' : '🟢';
        const selected = noticia.statusSelecao.selecionadaAutomaticamente ? '🤖' : '  ';
        
        console.log(`${selected} ${(index + 1).toString().padStart(2)}. ${emoji} ${noticia.titulo}`);
        console.log(`      📊 Score: ${noticia.scoreTotal} | ⏱️  ${noticia.tempoEstimado}s | 📰 ${noticia.fonte}`);
        console.log(`      🎯 ${noticia.razaoRelevancia}`);
        
        if (noticia.tagsDetectadas.length > 0) {
          console.log(`      🏷️  Tags: ${noticia.tagsDetectadas.join(', ')}`);
        }
        
        console.log();
      });
      
      if (noticias.length > 8) {
        console.log(`   ... e mais ${noticias.length - 8} notícias nesta categoria\n`);
      }
    });
}

function exibirInformacoesFinal(noticias: NoticiasCategorizadasCompletas): void {
  console.log('💡 INFORMAÇÕES FINAIS');
  console.log('═'.repeat(50));
  
  const totalSelecionadas = noticias.rankingGeral
    .filter(n => n.statusSelecao.selecionadaAutomaticamente).length;
  
  const duracaoTotal = noticias.rankingGeral
    .filter(n => n.statusSelecao.selecionadaAutomaticamente)
    .reduce((total, n) => total + n.tempoEstimado, 0);
  
  console.log(`🤖 Notícias selecionadas automaticamente: ${totalSelecionadas}`);
  console.log(`⏱️  Duração estimada (seleção automática): ${Math.round(duracaoTotal / 60)} min ${duracaoTotal % 60}s`);
  console.log(`📈 Score médio das selecionadas: ${calcularScoreMedio(noticias).toFixed(1)}`);
  
  console.log('\n🛠️  PRÓXIMOS PASSOS:');
  console.log('   📝 Para seleção manual: npm run selecionar');
  console.log('   🤖 Para usar automático: npm run analisar');
  console.log('   📊 Para ver esta visualização: npm run visualizar\n');
  
  console.log('📄 ARQUIVOS:');
  console.log(`   📊 Análise completa: ${filePaths.noticiasCategorizadasFile}`);
  console.log(`   🎯 Episódio final: ${filePaths.noticiasSelecionadasFile}`);
  console.log(`   📝 Seleção manual: ${filePaths.selecaoManualFile}\n`);
}

function calcularScoreMedio(noticias: NoticiasCategorizadasCompletas): number {
  const selecionadas = noticias.rankingGeral
    .filter(n => n.statusSelecao.selecionadaAutomaticamente);
  
  if (selecionadas.length === 0) return 0;
  
  const somaScores = selecionadas.reduce((soma, n) => soma + n.scoreTotal, 0);
  return somaScores / selecionadas.length;
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  visualizarNoticias()
    .then(() => {
      console.log('✅ Visualização concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    });
}
