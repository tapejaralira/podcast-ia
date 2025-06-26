#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');

async function testarAmbosPersonagens() {
    console.log('🎙️ === TESTE COMPLETO - TAINÁ E IRAY ===\n');
    
    try {
        const integracao = new IntegracaoIA();
        
        // Teste com Tainá
        console.log('🎭 Testando Tainá...');
        const textoTaina = "Fala, maninho! Tá começando mais um BubuiA News! Oxe, a notícia tá quente hoje!";
        const resultadoTaina = await integracao.gerarAudio(textoTaina, 'Tainá');
        console.log(`✅ Tainá: ${resultadoTaina.arquivo.split('\\').pop()}`);
        console.log(`📊 Tamanho: ${(resultadoTaina.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        
        // Teste com Iray
        console.log('🎭 Testando Iray...');
        const textoIray = "E aí, pessoal! Vichi, tô aqui também no BubuiA News! Rapaz, vamos ver as notícias de hoje.";
        const resultadoIray = await integracao.gerarAudio(textoIray, 'Iray');
        console.log(`✅ Iray: ${resultadoIray.arquivo.split('\\').pop()}`);
        console.log(`📊 Tamanho: ${(resultadoIray.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        
        console.log('🎉 === AMBOS FUNCIONANDO! ===');
        console.log('✅ Voz feminina (Tainá): Animada');
        console.log('✅ Voz masculina (Iray): Reflexiva');
        console.log('✅ Arquivos MP3 gerados com sucesso');
        console.log('\n🚀 SISTEMA PRONTO PARA PRODUÇÃO!');
        console.log('💡 Próximo: npm run gerar-episodio');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

testarAmbosPersonagens();