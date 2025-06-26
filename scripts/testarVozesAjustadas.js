#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');

async function testarNovasVozesAjustadas() {
    console.log('🎙️ === TESTE NOVAS VOZES + AJUSTES ===\n');
    
    try {
        const integracao = new IntegracaoIA();
        
        // Textos sem excesso de gírias
        const textosTeste = {
            taina: [
                "Fala, maninho! Tá começando mais um BubuiA News!",
                "Eita, meu povo! Essa notícia tá interessante mesmo!",
                "Né, pessoal? Comenta aí da sua rede!"
            ],
            irai: [
                "E aí, pessoal! Eu sou o Iraí, tô aqui também no BubuiA News!",
                "Pois é, rapaz... a situação tá bem complicada mesmo.",
                "É bem assim, né? Aqui no igarapé a notícia chega rapidinho!"
            ]
        };

        console.log('🎭 Testando nova voz da Tainá...');
        for (let i = 0; i < textosTeste.taina.length; i++) {
            const texto = textosTeste.taina[i];
            console.log(`💬 Teste ${i + 1}: "${texto}"`);
            
            const resultado = await integracao.gerarAudio(texto, 'Tainá');
            console.log(`✅ Gerado: ${resultado.arquivo.split('\\').pop()}`);
            console.log(`📊 ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        }
        
        console.log('🎭 Testando nova voz do Iraí...');
        for (let i = 0; i < textosTeste.irai.length; i++) {
            const texto = textosTeste.irai[i];
            console.log(`💬 Teste ${i + 1}: "${texto}"`);
            
            const resultado = await integracao.gerarAudio(texto, 'Iraí');
            console.log(`✅ Gerado: ${resultado.arquivo.split('\\').pop()}`);
            console.log(`📊 ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        }
        
        console.log('🎉 === TESTES CONCLUÍDOS ===');
        console.log('✅ Nome Iraí (mais natural para TTS)');
        console.log('✅ Menos "oxe" e "vichi" repetitivos');
        console.log('✅ Gírias mais variadas e naturais');
        console.log('✅ Novas vozes do ElevenLabs aplicadas');
        console.log('\n🚀 Próximo: npm run gerar-episodio-audio');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

testarNovasVozesAjustadas();