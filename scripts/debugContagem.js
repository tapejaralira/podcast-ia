#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');

async function debugContagem() {
    console.log('🔍 === DEBUG ESPECÍFICO DA CONTAGEM ===\n');

    try {
        const gerador = new GeradorRoteiro();

        // Gerar roteiro
        const roteiro = gerador.gerarRoteiro();
        
        // Quebrar em segmentos com debug detalhado
        console.log('📝 Analisando quebra de roteiro...');
        const segmentos = gerador.quebrarRoteiroEmSegmentos(roteiro);
        
        console.log(`\n📊 === ANÁLISE DETALHADA ===`);
        console.log(`Total de segmentos detectados: ${segmentos.length}`);
        
        // Agrupar por personagem
        const porPersonagem = {};
        segmentos.forEach(seg => {
            if (!porPersonagem[seg.personagem]) {
                porPersonagem[seg.personagem] = [];
            }
            porPersonagem[seg.personagem].push(seg);
        });
        
        console.log('\n👥 Segmentos por personagem:');
        Object.keys(porPersonagem).forEach(personagem => {
            const count = porPersonagem[personagem].length;
            console.log(`   ${personagem}: ${count} segmentos`);
            
            // Mostrar primeiros 3 segmentos de cada personagem
            if (count > 0) {
                console.log('      Exemplos:');
                porPersonagem[personagem].slice(0, 3).forEach((seg, i) => {
                    console.log(`      ${i + 1}. "${seg.texto.substring(0, 40)}..."`);
                });
            }
        });
        
        // Investigar a estrutura dos segmentos para encontrar a inconsistência
        console.log('\n🔬 === INVESTIGAÇÃO DETALHADA DOS SEGMENTOS ===');
        
        if (segmentos.length > 0) {
            const primeiroSegmento = segmentos[0];
            console.log('Estrutura do primeiro segmento:');
            console.log(JSON.stringify(primeiroSegmento, null, 2));
            
            console.log('\nPrimeiros 3 segmentos:');
            segmentos.slice(0, 3).forEach((seg, i) => {
                console.log(`${i + 1}. personagem: "${seg.personagem}" (tipo: ${typeof seg.personagem})`);
                console.log(`   texto: "${seg.texto?.substring(0, 30)}..."`);
                console.log(`   Object.keys: ${Object.keys(seg).join(', ')}`);
            });
            
            // Testar diferentes filtros
            console.log('\n🧪 Testando filtros:');
            const teste1 = segmentos.filter(s => s.personagem === 'taina');
            const teste2 = segmentos.filter(s => s.personagem === 'tainá'); // com acento
            const teste3 = segmentos.filter(s => s.personagem?.toLowerCase() === 'taina');
            const teste4 = segmentos.filter(s => s.personagem?.includes('taina'));
            
            console.log(`   s.personagem === 'taina': ${teste1.length}`);
            console.log(`   s.personagem === 'tainá': ${teste2.length}`);
            console.log(`   s.personagem?.toLowerCase() === 'taina': ${teste3.length}`);
            console.log(`   s.personagem?.includes('taina'): ${teste4.length}`);
        }
        
        // Verificar segmentos específicos de Tainá e Iraí - usar mesma lógica do sistema
        const tainaSegmentos = segmentos.filter(s => s.personagem === 'taina');
        const iraiSegmentos = segmentos.filter(s => s.personagem === 'irai');
        
        console.log(`\n🎯 Contagem específica (mesma lógica do sistema):`);
        console.log(`👩 Tainá: ${tainaSegmentos.length} segmentos`);
        console.log(`👨 Iraí: ${iraiSegmentos.length} segmentos`);
        
        // Verificar se os personagens estão corretos nos segmentos
        console.log('\n🔍 Verificação de personagens nos segmentos:');
        const personagensUnicos = [...new Set(segmentos.map(s => s.personagem))];
        console.log(`Personagens encontrados: ${personagensUnicos.join(', ')}`);
        
        personagensUnicos.forEach(personagem => {
            const count = segmentos.filter(s => s.personagem === personagem).length;
            console.log(`   ${personagem}: ${count} segmentos`);
        });
        
        if (tainaSegmentos.length > 0) {
            console.log('\n👩 Primeiras falas da Tainá:');
            tainaSegmentos.slice(0, 3).forEach((seg, i) => {
                console.log(`   ${i + 1}. Linha ${seg.linha}: "${seg.texto}"`);
            });
        }
        
        if (iraiSegmentos.length > 0) {
            console.log('\n👨 Primeiras falas do Iraí:');
            iraiSegmentos.slice(0, 3).forEach((seg, i) => {
                console.log(`   ${i + 1}. Linha ${seg.linha}: "${seg.texto}"`);
            });
        }
        
        // Simular processo de áudio
        console.log('\n🎵 === SIMULAÇÃO DO PROCESSO DE ÁUDIO ===');
        const segmentosAudio = [];
        
        for (let segmento of segmentos) {
            const audioSegmento = await gerador.simularAudioSegmento(segmento, {});
            segmentosAudio.push(audioSegmento);
        }
        
        const relatorio = gerador.gerarRelatorioAudio(segmentosAudio, {});
        
        console.log('\n📊 Resultado final:');
        console.log(`   Segmentos processados: ${relatorio.segmentos}`);
        console.log(`   Tainá no áudio: ${relatorio.personagens.taina}`);
        console.log(`   Iraí no áudio: ${relatorio.personagens.irai}`);

    } catch (error) {
        console.error('❌ Erro no debug:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    debugContagem();
}

module.exports = debugContagem;