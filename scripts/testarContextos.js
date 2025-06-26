#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');

async function testarSomenteContextos() {
    console.log('🎯 === TESTE RÁPIDO - APENAS CONTEXTOS ===\n');

    try {
        const gerador = new GeradorRoteiro();

        // Testar classificação e comentários
        const noticiasTest = [
            "Festival de Parintins 2025 terá 15 apresentações especiais com alegorias gigantes",
            "Acidente grave na AM-010 deixa duas vítimas fatais e três feridos",
            "Buracos na Constantino Nery causam transtornos aos motoristas pela terceira vez",
            "Prefeitura de Manaus anuncia novas obras de infraestrutura na Zona Norte",
            "Nacional de Fast Clube contrata três jogadores para disputa da Série D"
        ];

        console.log('🔍 === ANÁLISE DE CONTEXTOS ===\n');

        for (let i = 0; i < noticiasTest.length; i++) {
            const noticia = noticiasTest[i];
            console.log(`📰 NOTÍCIA ${i + 1}:`);
            console.log(`"${noticia}"`);
            
            const processada = await gerador.processarNoticiaComContexto(noticia);
            
            console.log(`🎯 Contexto detectado: ${processada.contexto}`);
            console.log(`💬 Número de reações: ${processada.reacoes?.length || 0}`);
            
            if (processada.reacoes?.length > 0) {
                processada.reacoes.forEach((reacao, index) => {
                    const emoji = reacao.personagem === 'taina' ? '👩' : '👨';
                    console.log(`   ${emoji} ${reacao.personagem}: "${reacao.comentario}"`);
                });
            } else {
                console.log('   ℹ️ Sem reações geradas para este contexto');
            }
            
            // Mostrar configuração de voz se disponível
            if (processada.configVoz) {
                const configTaina = processada.configVoz.taina;
                const configIrai = processada.configVoz.irai;
                console.log(`🎵 Config Tainá: ${configTaina?.emocao || 'padrão'} | vel: ${configTaina?.velocidade || 1.0}`);
                console.log(`🎵 Config Iraí: ${configIrai?.emocao || 'padrão'} | vel: ${configIrai?.velocidade || 0.95}`);
            }
            
            console.log(''); // linha em branco
        }

        // Estatísticas finais
        console.log('📊 === ESTATÍSTICAS ===\n');
        
        const contextos = [];
        const reacoes = [];
        
        for (let noticia of noticiasTest) {
            const processada = await gerador.processarNoticiaComContexto(noticia);
            contextos.push(processada.contexto);
            reacoes.push(processada.reacoes?.length || 0);
        }
        
        const contextosUnicos = [...new Set(contextos)];
        const totalReacoes = reacoes.reduce((a, b) => a + b, 0);
        
        console.log(`🎯 Contextos detectados: ${contextosUnicos.length} únicos`);
        console.log(`   - ${contextosUnicos.join(', ')}`);
        console.log(`💬 Total de reações: ${totalReacoes}`);
        console.log(`📈 Taxa de reação: ${Math.round(totalReacoes / noticiasTest.length * 100)}%`);
        
        // Testar personalidades
        console.log('\n🎭 === TESTE DE PERSONALIDADES ===\n');
        
        let reacoesToina = 0;
        let reacoesIrai = 0;
        
        for (let noticia of noticiasTest) {
            const processada = await gerador.processarNoticiaComContexto(noticia);
            if (processada.reacoes) {
                reacoesToina += processada.reacoes.filter(r => r.personagem === 'taina').length;
                reacoesIrai += processada.reacoes.filter(r => r.personagem === 'irai').length;
            }
        }
        
        console.log(`👩 Tainá reagiu: ${reacoesToina} vezes`);
        console.log(`👨 Iraí reagiu: ${reacoesIrai} vezes`);
        console.log(`🎯 Tainá é ${reacoesToina > reacoesIrai ? 'mais' : 'menos'} reativa que o Iraí`);
        
        console.log('\n✅ === TESTE CONTEXTUAL CONCLUÍDO ===');
        console.log('💡 Sistema funcionando em modo fallback');
        console.log('🎙️ Para gerar áudio real, configure as APIs no .env');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
    testarSomenteContextos();
}

module.exports = testarSomenteContextos;