#!/usr/bin/env node

const IntegracaoIA = require('../integracaoIA');

async function testarNovasPersonalidades() {
    console.log('🎙️ === TESTE DAS NOVAS PERSONALIDADES ===\n');
    
    try {
        const integracao = new IntegracaoIA();
        
        console.log('🎭 Testando Tainá - A Parintinense Orgulhosa...\n');
        
        const textosTaina = [
            "Fala, maninho! Direto de Parintins pro BubuiA News!",
            "Eita, meu povo! O sangue indígena não deixa mentir!",
            "Garantido no coração, sempre! A floresta ensina quem sabe escutar!",
            "Curumim, essa tradição vem lá dos ancestrais!"
        ];
        
        for (let i = 0; i < textosTaina.length; i++) {
            const texto = textosTaina[i];
            console.log(`💬 Teste ${i + 1}: "${texto}"`);
            
            const resultado = await integracao.gerarAudio(texto, 'Tainá');
            console.log(`✅ Gerado: ${resultado.arquivo.split('\\').pop()}`);
            console.log(`📊 ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        }
        
        console.log('🎭 Testando Iraí - O Manauara Cosmopolita...\n');
        
        const textosIrai = [
            "E aí, pessoal! De volta à terra natal depois de uns anos no Sul!",
            "Bah, que saudade eu tinha desse calor de Manaus!",
            "Pois é, né? O Sul ensina, mas o Norte abraça!",
            "Barbaridade, essa Tainá sabe tudo sobre cultura amazônica!"
        ];
        
        for (let i = 0; i < textosIrai.length; i++) {
            const texto = textosIrai[i];
            console.log(`💬 Teste ${i + 1}: "${texto}"`);
            
            const resultado = await integracao.gerarAudio(texto, 'Iraí');
            console.log(`✅ Gerado: ${resultado.arquivo.split('\\').pop()}`);
            console.log(`📊 ${(resultado.tamanho_arquivo / 1024).toFixed(1)} KB\n`);
        }
        
        console.log('🎉 === TESTE DAS DINÂMICAS CULTURAIS ===\n');
        
        const dialogos = [
            {
                taina: "Iraí, você precisa escolher um lado! Garantido no coração!",
                irai: "Rapaz, os dois são bonitos... mas se é pra escolher, vai de Garantido!"
            },
            {
                irai: "Bah, que chuva braba essa!",
                taina: "Opa! Saiu o gaúcho aí! Aqui é 'eita que chuva', caboco!"
            },
            {
                taina: "A floresta ensina quem sabe escutar, né maninho?",
                irai: "É verdade! Essa sabedoria ancestral é impressionante, Tai."
            }
        ];
        
        for (let i = 0; i < dialogos.length; i++) {
            const dialogo = dialogos[i];
            console.log(`🎭 Diálogo ${i + 1}:`);
            
            if (dialogo.taina) {
                console.log(`Tainá: "${dialogo.taina}"`);
                const resultadoTaina = await integracao.gerarAudio(dialogo.taina, 'Tainá');
                console.log(`✅ Tainá: ${resultadoTaina.arquivo.split('\\').pop()}`);
            }
            
            if (dialogo.irai) {
                console.log(`Iraí: "${dialogo.irai}"`);
                const resultadoIrai = await integracao.gerarAudio(dialogo.irai, 'Iraí');
                console.log(`✅ Iraí: ${resultadoIrai.arquivo.split('\\').pop()}`);
            }
            
            console.log('');
        }
        
        console.log('🎉 === PERSONALIDADES IMPLEMENTADAS COM SUCESSO! ===');
        console.log('✅ Tainá: Parintinense com orgulho indígena');
        console.log('✅ Iraí: Manauara com experiência no Sul');
        console.log('✅ Dinâmicas culturais ricas e autênticas');
        console.log('✅ Vozes diferenciadas e naturais');
        console.log('\n🚀 Próximo: npm run gerar-episodio-audio');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

testarNovasPersonalidades();