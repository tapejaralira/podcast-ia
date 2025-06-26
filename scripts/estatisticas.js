#!/usr/bin/env node

const SistemaRevisao = require('../sistemaRevisao');

async function mostrarEstatisticas() {
    try {
        console.log('📊 === ESTATÍSTICAS DO BUBUIA NEWS ===\n');
        
        const sistemaRevisao = new SistemaRevisao();
        const stats = sistemaRevisao.obterEstatisticas();
        
        // Informações gerais
        console.log('🎙️ INFORMAÇÕES GERAIS:');
        console.log(`📺 Episódios processados: ${stats.episodios_processados}`);
        console.log(`🤖 Nível de autonomia: ${stats.nivel_autonomia}/10`);
        console.log(`🔧 Total de correções: ${stats.total_correcoes}`);
        
        // Status atual
        const precisaRevisao = stats.nivel_autonomia < 8;
        console.log(`📝 Status: ${precisaRevisao ? 'MODO REVISÃO' : 'MODO AUTÔNOMO'}`);
        
        // Áreas problemáticas
        if (stats.areas_problematicas.length > 0) {
            console.log('\n⚠️ ÁREAS QUE PRECISAM ATENÇÃO:');
            stats.areas_problematicas.slice(0, 5).forEach((area, index) => {
                console.log(`${index + 1}. ${area.categoria}: ${area.total_correcoes} correções`);
            });
        }
        
        // Evolução recente
        if (stats.evolucao_recente.length > 0) {
            console.log('\n📈 EVOLUÇÃO RECENTE:');
            stats.evolucao_recente.forEach(ep => {
                const data = new Date(ep.data).toLocaleDateString('pt-BR');
                console.log(`  Ep.${ep.episodio} (${data}): ${ep.total_correcoes} correções, qualidade ${ep.nivel_qualidade}/10`);
            });
        }
        
        // Histórico detalhado por categoria
        console.log('\n📋 CORREÇÕES POR CATEGORIA:');
        Object.entries(sistemaRevisao.historico.correcoes_por_categoria).forEach(([categoria, dados]) => {
            if (dados.total > 0) {
                console.log(`  ${categoria}: ${dados.total} correções`);
                if (dados.exemplos.length > 0) {
                    console.log(`    Últimos exemplos: ${dados.exemplos.slice(-2).join(', ')}`);
                }
            }
        });
        
        // Previsões e sugestões
        console.log('\n🔮 PREVISÕES:');
        if (stats.nivel_autonomia < 3) {
            console.log('  📚 Ainda em fase inicial de aprendizado');
            console.log('  ⏱️ Estimativa: 10-15 episódios para autonomia básica');
        } else if (stats.nivel_autonomia < 6) {
            console.log('  📈 Progresso bom, aprendendo padrões');
            console.log('  ⏱️ Estimativa: 5-8 episódios para autonomia avançada');
        } else if (stats.nivel_autonomia < 8) {
            console.log('  🚀 Quase autônomo, poucas correções necessárias');
            console.log('  ⏱️ Estimativa: 2-4 episódios para autonomia total');
        } else {
            console.log('  🤖 Sistema autônomo! Funcionando independentemente');
            console.log('  ✅ Revisões esporádicas recomendadas');
        }
        
        // Próximos passos
        console.log('\n💡 PRÓXIMOS PASSOS RECOMENDADOS:');
        if (precisaRevisao) {
            console.log('  1. Gere próximo episódio: npm run gerar-episodio');
            console.log('  2. Revise e corrija o arquivo *_corrigido.md');
            console.log('  3. Processe correções: npm run processar-correcao [nome]');
            console.log('  4. Monitore evolução: npm run estatisticas');
        } else {
            console.log('  1. Sistema pode funcionar autonomamente');
            console.log('  2. Gere episódios: npm run gerar-episodio');
            console.log('  3. Monitore qualidade ocasionalmente');
            console.log('  4. Faça ajustes finos se necessário');
        }
        
        console.log('\n✅ Relatório de estatísticas concluído!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar estatísticas:', error.message);
        process.exit(1);
    }
}

mostrarEstatisticas();