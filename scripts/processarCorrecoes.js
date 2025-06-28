#!/usr/bin/env node

const path = require('path');
const SistemaRevisao = require('../sistemaRevisao');

// Script para processar correções
const nomeArquivo = process.argv[2];

if (!nomeArquivo) {
    console.log('❌ Uso: npm run processar-correcao [nome-arquivo]');
    console.log('📝 Exemplo: npm run processar-correcao episodio_2024-12-19T10-30-00');
    process.exit(1);
}

async function processarCorrecoes() {
    try {
        console.log('🔍 === PROCESSANDO CORREÇÕES ===');
        
        const sistemaRevisao = new SistemaRevisao();
        const relatorio = sistemaRevisao.processarCorrecoes(nomeArquivo);
        
        console.log('\n📊 === RELATÓRIO DE APRENDIZADO ===');
        console.log(`📈 Total de correções: ${relatorio.resumo.total_correcoes}`);
        console.log(`🎯 Nível de correções: ${relatorio.resumo.nivel_correcoes}`);
        console.log(`⭐ Qualidade estimada: ${relatorio.resumo.qualidade_estimada}/10`);
        
        if (relatorio.detalhes_correcoes.length > 0) {
            console.log('\n🔧 Correções por categoria:');
            const categorias = {};
            relatorio.detalhes_correcoes.forEach(correcao => {
                if (!categorias[correcao.categoria]) categorias[correcao.categoria] = 0;
                categorias[correcao.categoria]++;
            });
            
            Object.entries(categorias).forEach(([cat, count]) => {
                console.log(`  ${cat}: ${count} correção(ões)`);
            });
        }
        
        if (relatorio.proximos_passos.length > 0) {
            console.log('\n💡 Próximos passos sugeridos:');
            relatorio.proximos_passos.forEach(passo => {
                console.log(`  • ${passo}`);
            });
        }
        
        console.log(`\n✅ Processamento concluído! Relatório salvo em:`);
        console.log(`📄 ${relatorio.arquivo}`);
        
        // Mostrar evolução
        const estatisticas = sistemaRevisao.obterEstatisticas();
        console.log(`\n📈 EVOLUÇÃO DO SISTEMA:`);
        console.log(`🎯 Nível autonomia atual: ${estatisticas.nivel_autonomia}/10`);
        console.log(`📚 Episódios processados: ${estatisticas.episodios_processados}`);
        
        if (estatisticas.nivel_autonomia >= 8) {
            console.log('\n🎉 PARABÉNS! Sistema próximo da autonomia total!');
            console.log('🤖 Em breve não precisará mais de revisões manuais.');
        } else if (estatisticas.nivel_autonomia >= 5) {
            console.log('\n📈 PROGRESSO BOM! Sistema aprendendo rapidamente.');
            console.log('📝 Continue com as revisões para acelerar o aprendizado.');
        } else {
            console.log('\n📚 FASE DE APRENDIZADO: Sistema ainda precisa de orientação.');
            console.log('🔍 Revise episódios com atenção para melhor evolução.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar correções:', error.message);
        process.exit(1);
    }
}

processarCorrecoes();