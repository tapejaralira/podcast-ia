#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');
const path = require('path');

async function testarElevenLabs() {
    console.log('🎙️ === TESTE COMPLETO ELEVENLABS ===\n');
    
    try {
        const integracao = new IntegracaoIA();
        
        // Textos de teste específicos
        const textosTeste = {
            taina: {
                abertura: "Fala, maninho! Tá começando mais um BubuiA News!",
                giria: "Oxe, essa notícia tá quente mesmo!",
                piada: "Rapaz, esse trânsito na Constantino Nery tá pior que enchente!"
            },
            irai: {
                abertura: "E aí, pessoal! Vichi, tô aqui também no BubuiA News!",
                reflexao: "É bem assim mesmo, caboco. A situação tá complicada.",
                comentario: "Pois é, aqui no igarapé a notícia chega rapidinho!"
            }
        };

        console.log('🎭 Testando voz da Tainá...\n');
        
        for (const [tipo, texto] of Object.entries(textosTeste.taina)) {
            console.log(`📝 Gerando: ${tipo}`);
            console.log(`💬 Texto: "${texto}"`);
            
            const contexto = { secao: tipo === 'abertura' ? 'abertura' : 'geral' };
            const resultado = await integracao.gerarAudio(texto, 'Tainá', contexto);
            
            console.log(`✅ Arquivo: ${path.basename(resultado.arquivo)}`);
            console.log(`📊 Tamanho: ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB`);
            console.log(`⏱️ Duração estimada: ${resultado.duracao_estimada}s\n`);
        }

        console.log('🎭 Testando voz do Iraí...\n');
        
        for (const [tipo, texto] of Object.entries(textosTeste.irai)) {
            console.log(`📝 Gerando: ${tipo}`);
            console.log(`💬 Texto: "${texto}"`);
            
            const contexto = { secao: tipo === 'abertura' ? 'abertura' : 'geral' };
            const resultado = await integracao.gerarAudio(texto, 'Iraí', contexto);
            
            console.log(`✅ Arquivo: ${path.basename(resultado.arquivo)}`);
            console.log(`📊 Tamanho: ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB`);
            console.log(`⏱️ Duração estimada: ${resultado.duracao_estimada}s\n`);
        }

        console.log('🎉 === TESTE CONCLUÍDO COM SUCESSO! ===');
        console.log('✅ ElevenLabs configurado e funcionando');
        console.log('✅ Vozes da Tainá e Iray testadas');
        console.log('✅ Áudios salvos na pasta /audios');
        console.log('\n💡 Próximo passo: npm run gerar-episodio --com-audio');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verifique se a API key está correta');
        console.log('2. Verifique sua conexão com internet');
        console.log('3. Verifique se tem créditos no ElevenLabs');
        console.log('4. Execute: npm install node-fetch');
        process.exit(1);
    }
}

// Verificar se foi chamado diretamente
if (require.main === module) {
    testarElevenLabs();
}