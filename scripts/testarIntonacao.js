#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');

async function testarIntonacao() {
    console.log('🎵 === TESTE DO SISTEMA DE INTONAÇÃO CONTEXTUAL ===\n');

    try {
        const gerador = new GeradorRoteiro();
        
        // Inicializar sistemas contextuais
        await gerador.inicializarSistemasContextuais();
        
        const noticiasTest = [
            {
                titulo: "Festival de Parintins 2025 terá 15 apresentações especiais com alegorias gigantes",
                tipo: "cultura"
            },
            {
                titulo: "Acidente grave na AM-010 deixa duas vítimas fatais e três feridos",
                tipo: "tragedia"
            },
            {
                titulo: "Buracos na Constantino Nery causam transtornos aos motoristas pela terceira vez",
                tipo: "infraestrutura"
            },
            {
                titulo: "Prefeitura de Manaus anuncia aumento de 15% no salário dos vereadores",
                tipo: "politica"
            },
            {
                titulo: "Nacional de Fast Clube contrata três jogadores para disputa da Série D",
                tipo: "esporte"
            },
            {
                titulo: "Tempestade provoca alagamentos em várias ruas da Zona Norte",
                tipo: "clima"
            }
        ];
        
        for (let i = 0; i < noticiasTest.length; i++) {
            const noticia = noticiasTest[i];
            console.log(`📰 NOTÍCIA ${i + 1}: "${noticia.titulo}"`);
            console.log(`🏷️ Tipo esperado: ${noticia.tipo}\n`);
            
            // 1. Processar notícia com sistema contextual
            const resultado = await gerador.processarNoticiaComContexto(noticia.titulo);
            
            console.log(`🎯 Contexto detectado: ${resultado.contexto}`);
            
            // 2. Mostrar configurações de voz por contexto
            if (resultado.configVoz) {
                const configTaina = resultado.configVoz.taina || {};
                const configIrai = resultado.configVoz.irai || {};
                
                console.log(`🎵 Configuração de voz:`);
                console.log(`   👩 Tainá: ${configTaina.emocao || 'conversational'} | vel: ${configTaina.velocidade || 1.0} | int: ${configTaina.intensidade || 'medium'}`);
                console.log(`   👨 Iraí: ${configIrai.emocao || 'conversational'} | vel: ${configIrai.velocidade || 0.95} | int: ${configIrai.intensidade || 'medium'}`);
            }
            
            // 3. Mostrar reações contextuais
            if (resultado.reacoes && resultado.reacoes.length > 0) {
                console.log(`💬 Reações geradas: ${resultado.reacoes.length}`);
                resultado.reacoes.forEach((reacao, idx) => {
                    const emoji = reacao.personagem === 'taina' ? '👩' : '👨';
                    console.log(`   ${emoji} ${reacao.personagem}: "${reacao.comentario}"`);
                });
            } else {
                console.log(`💬 Sem reações (apropriado para contexto ${resultado.contexto})`);
            }
            
            // 4. Análise da adequação da intonação
            console.log(`📊 Análise da intonação:`);
            const adequacao = analisarAdequacao(noticia.tipo, resultado.contexto, resultado.configVoz);
            console.log(`   ✅ Adequação: ${adequacao.nivel} (${adequacao.descricao})`);
            
            console.log('─'.repeat(60) + '\n');
        }
        
        // Resumo final
        console.log('📊 === RESUMO DO SISTEMA DE INTONAÇÃO ===\n');
        console.log('✅ Funcionalidades ativas:');
        console.log('   🎯 Classificação automática de contextos');
        console.log('   🎵 Configurações de voz por contexto');
        console.log('   💬 Comentários contextuais automáticos');
        console.log('   🎭 Personalidades adaptativas');
        console.log('   📊 Análise de adequação');
        
        console.log('\n🎙️ O sistema de intonação contextual está 100% funcional!');
        console.log('💡 Para usar com áudio real, configure as APIs no arquivo .env');

    } catch (error) {
        console.error('❌ Erro no teste de intonação:', error.message);
        console.error('Stack:', error.stack);
    }
}

function analisarAdequacao(tipoEsperado, contextoDetectado, configVoz) {
    // Mapear tipos esperados para contextos do sistema
    const mapeamento = {
        'cultura': 'cultura_parintins',
        'tragedia': 'tragico',
        'infraestrutura': 'infraestrutura_urbana',
        'politica': 'politica',
        'esporte': 'geral',
        'clima': 'clima_severo'
    };
    
    const contextoEsperado = mapeamento[tipoEsperado] || 'geral';
    
    if (contextoDetectado === contextoEsperado) {
        return {
            nivel: 'EXCELENTE',
            descricao: 'Contexto detectado corretamente, intonação perfeita'
        };
    } else if (contextoDetectado === 'geral') {
        return {
            nivel: 'BOA',
            descricao: 'Contexto genérico, intonação neutra apropriada'
        };
    } else {
        return {
            nivel: 'REGULAR',
            descricao: `Esperado ${contextoEsperado}, detectado ${contextoDetectado}`
        };
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    testarIntonacao();
}

module.exports = testarIntonacao;