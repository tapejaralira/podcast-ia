#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');
const path = require('path');

async function testarTTSComDebug() {
    console.log('🎙️ === TESTE TTS COM DEBUG DETALHADO ===\n');
    
    try {
        console.log('🔧 Passo 1: Inicializando IntegracaoIA...');
        const integracao = new IntegracaoIA();
        
        console.log('🔧 Passo 2: Verificando configurações...');
        console.log('Config carregada:', {
            tts_existe: !!integracao.config?.tts,
            servico_ativo: integracao.config?.tts?.servico_ativo,
            elevenlabs_existe: !!integracao.config?.tts?.elevenlabs,
            api_key_existe: !!integracao.config?.tts?.elevenlabs?.api_key
        });
        
        if (!integracao.config?.tts) {
            throw new Error('Configuração TTS não encontrada - execute npm run diagnosticar');
        }
        
        console.log('🔧 Passo 3: Inicializando fetch...');
        await integracao.inicializarFetch();
        
        console.log('🔧 Passo 4: Testando geração de áudio...');
        const textoTeste = "Fala, maninho! Teste do BubuiA News!";
        console.log(`💬 Texto: "${textoTeste}"`);
        
        console.log('🎭 Gerando áudio para Tainá...');
        const resultado = await integracao.gerarAudio(textoTeste, 'Tainá');
        
        console.log('\n🎉 === SUCESSO TOTAL! ===');
        console.log(`✅ Arquivo gerado: ${path.basename(resultado.arquivo)}`);
        console.log(`📊 Tamanho: ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB`);
        console.log(`⏱️ Duração estimada: ${resultado.duracao_estimada}s`);
        console.log(`🎙️ Serviço: ${resultado.servico}`);
        console.log(`🎭 Voice ID: ${resultado.voice_id}`);
        
        console.log('\n🎵 PRÓXIMOS PASSOS:');
        console.log('1. Escute o arquivo MP3 gerado');
        console.log('2. Execute: npm run gerar-episodio');
        console.log('3. Teste episódio completo com áudio');
        
    } catch (error) {
        console.error('\n❌ ERRO DETALHADO:', error.message);
        console.error('📍 Stack:', error.stack);
        
        if (error.message.includes('fetch')) {
            console.log('\n🔧 PROBLEMA COM FETCH:');
            console.log('Executar: npm install node-fetch@3.3.2 --save');
        } else if (error.message.includes('API')) {
            console.log('\n🔧 PROBLEMA COM API ELEVENLABS:');
            console.log('1. Verificar conexão internet');
            console.log('2. Verificar créditos na conta ElevenLabs');
            console.log('3. Testar API key em elevenlabs.io');
        } else if (error.message.includes('tts')) {
            console.log('\n🔧 PROBLEMA DE CONFIGURAÇÃO:');
            console.log('Execute: npm run diagnosticar');
        } else {
            console.log('\n🔧 ERRO DESCONHECIDO:');
            console.log('1. Verificar permissões de arquivo');
            console.log('2. Verificar espaço em disco');
            console.log('3. Reiniciar terminal');
        }
        
        process.exit(1);
    }
}

// Executar teste
if (require.main === module) {
    testarTTSComDebug();
}