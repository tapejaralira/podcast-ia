#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');

async function testarEpisodioReal() {
    console.log('🎙️ === BUBUIA NEWS - PRIMEIRO EPISÓDIO REAL ===\n');
    
    try {
        const gerador = new GeradorRoteiro();
        
        console.log('🔧 Iniciando geração de episódio completo...');
        console.log('📅 Data:', new Date().toLocaleDateString('pt-BR'));
        console.log('🎭 Personagens: Tainá (Parintins) + Iraí (Manaus)\n');
        
        // Gerar episódio completo
        const resultado = await gerador.gerarEpisodioCompleto({ gerarAudio: true });
        
        console.log('🎉 === EPISÓDIO GERADO COM SUCESSO! ===\n');
        
        if (resultado.modo === 'revisao') {
            console.log('📝 MODO REVISÃO ATIVO (sistema ainda aprendendo)\n');
            
            console.log('📄 Arquivos gerados:');
            console.log(`  📰 Original: ${resultado.arquivos.original}`);
            console.log(`  ✏️ Para editar: ${resultado.arquivos.correcao}`);
            console.log(`  📊 Análise: ${resultado.arquivos.analise}`);
            
            if (resultado.audios && resultado.audios.length > 0) {
                console.log(`\n🎵 Áudios gerados: ${resultado.audios.length} arquivos`);
                console.log('📁 Pasta: ./audios/');
                resultado.audios.forEach((audio, i) => {
                    console.log(`  ${i + 1}. ${audio.split('\\').pop()}`);
                });
            }
            
            console.log('\n📋 PRÓXIMOS PASSOS:');
            console.log('1. 📖 Leia o arquivo *_original.md');
            console.log('2. 🎧 Escute os áudios gerados');
            console.log('3. ✏️ Faça correções no arquivo *_corrigido.md');
            console.log('4. 🔄 Execute: npm run processar-correcao [nome-arquivo]');
            
            console.log('\n💡 DICAS PARA REVISÃO:');
            console.log('• Marque correções com: <!-- CORRIGIDO: categoria - explicação -->');
            console.log('• Categorias: girias, tom, referencias_locais, transicoes, interacoes');
            console.log('• Sistema vai aprender com suas correções!');
            
        } else {
            console.log('🤖 MODO AUTÔNOMO (sistema experiente)');
            console.log(`📄 Roteiro final: ${resultado.roteiro}`);
            
            if (resultado.audios) {
                console.log(`🎵 Áudios: ${resultado.audios.length} arquivos`);
            }
        }
        
        console.log('\n🎯 CARACTERÍSTICAS DO EPISÓDIO:');
        console.log('✅ Tainá: Parintinense, orgulho indígena, animada');
        console.log('✅ Iraí: Manauara raiz, experiência no Sul (sutil)');
        console.log('✅ Vozes diferenciadas (velocidade, tom, pausas)');
        console.log('✅ Cultura amazônica autêntica');
        console.log('✅ Interações naturais e regionais');
        
        console.log('\n🚀 TESTE REALIZADO COM SUCESSO!');
        console.log('📺 BubuiA News pronto para avaliação!');
        
    } catch (error) {
        console.error('\n❌ Erro na geração:', error.message);
        console.error('📍 Stack:', error.stack);
        
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Verificar se tem notícias na pasta data/');
        console.log('2. Verificar configuração do TTS');
        console.log('3. Verificar conexão com internet');
        console.log('4. Execute: npm run diagnosticar');
        
        process.exit(1);
    }
}

// Executar teste
if (require.main === module) {
    testarEpisodioReal();
}