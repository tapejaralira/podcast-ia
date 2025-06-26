#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');

async function testeRapido() {
    console.log('🎙️ === TESTE RÁPIDO ===\n');
    
    try {
        const integracao = new IntegracaoIA();
        console.log('\n✅ IntegracaoIA inicializada com sucesso!');
        console.log('🎯 Agora testando áudio...');
        
        await integracao.inicializarFetch();
        const resultado = await integracao.gerarAudio("Teste", "Tainá");
        
        console.log('\n🎉 SUCESSO TOTAL!');
        console.log(`Arquivo: ${resultado.arquivo}`);
        
    } catch (error) {
        console.error('\n❌ Erro:', error.message);
    }
}

testeRapido();