#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');
const path = require('path');

async function testarElevenLabsSimples() {
    console.log('🎙️ === TESTE SIMPLES ELEVENLABS ===\n');
    
    try {
        console.log('🔧 Inicializando sistema...');
        const integracao = new IntegracaoIA();
        
        // Texto simples para teste
        const textoTeste = "Fala, maninho! Teste do BubuiA News!";
        
        console.log('🎭 Testando voz da Tainá...');
        console.log(`💬 Texto: "${textoTeste}"`);
        
        const resultado = await integracao.gerarAudio(textoTeste, 'Tainá');
        
        console.log(`✅ Sucesso!`);
        console.log(`📄 Arquivo: ${path.basename(resultado.arquivo)}`);
        console.log(`📊 Tamanho: ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB`);
        console.log(`⏱️ Duração estimada: ${resultado.duracao_estimada}s`);
        console.log(`🎙️ Serviço: ${resultado.servico}`);
        console.log(`🎭 Voice ID: ${resultado.voice_id}`);
        
        console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('✅ ElevenLabs funcionando perfeitamente');
        console.log('✅ Áudio salvo na pasta /audios');
        console.log('\n💡 Próximo passo: npm run gerar-episodio');
        
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        
        if (error.message.includes('node-fetch')) {
            console.log('\n🔧 SOLUÇÃO:');
            console.log('npm install node-fetch@3.3.2');
        } else if (error.message.includes('401') || error.message.includes('API')) {
            console.log('\n🔧 POSSÍVEIS CAUSAS:');
            console.log('1. API key incorreta ou expirada');
            console.log('2. Sem créditos na conta ElevenLabs');
            console.log('3. Problema de conexão com internet');
        } else {
            console.log('\n🔧 VERIFICAR:');
            console.log('1. Arquivo config/ia-config.json existe');
            console.log('2. Permissões de escrita na pasta');
            console.log('3. Conexão com internet');
        }
        
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    testarElevenLabsSimples();
}