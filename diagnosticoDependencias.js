#!/usr/bin/env node

const path = require('path');

function checarMetodo(obj, metodo) {
    return obj && typeof obj[metodo] === 'function';
}

console.log('🔍 === DIAGNÓSTICO DE DEPENDÊNCIAS INTERNAS ===\n');

let erros = 0;

try {
    const GeradorRoteiro = require('./gerarRoteiro');
    const gerador = new GeradorRoteiro();
    console.log('✅ GeradorRoteiro importado');
    if (checarMetodo(gerador, 'gerarRoteiro')) {
        console.log('   ✅ gerarRoteiro() disponível');
    } else {
        console.log('   ❌ gerarRoteiro() NÃO encontrado'); erros++;
    }
    if (checarMetodo(gerador, 'gerarEpisodioCompleto')) {
        console.log('   ✅ gerarEpisodioCompleto() disponível');
    } else {
        console.log('   ❌ gerarEpisodioCompleto() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar GeradorRoteiro:', e.message); erros++;
}

try {
    const ClassificadorContextual = require('./classificadorContextual');
    const classificador = new ClassificadorContextual();
    console.log('✅ ClassificadorContextual importado');
    if (checarMetodo(classificador, 'classificarNoticia')) {
        console.log('   ✅ classificarNoticia() disponível');
    } else {
        console.log('   ❌ classificarNoticia() NÃO encontrado'); erros++;
    }
    if (checarMetodo(classificador, 'obterConfiguracaoVoz')) {
        console.log('   ✅ obterConfiguracaoVoz() disponível');
    } else {
        console.log('   ❌ obterConfiguracaoVoz() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar ClassificadorContextual:', e.message); erros++;
}

try {
    const IntegracaoIA = require('./integracaoIA');
    const ia = new IntegracaoIA();
    console.log('✅ IntegracaoIA importado');
    if (checarMetodo(ia, 'processarRoteiroCompleto')) {
        console.log('   ✅ processarRoteiroCompleto() disponível');
    } else {
        console.log('   ❌ processarRoteiroCompleto() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar IntegracaoIA:', e.message); erros++;
}

try {
    const IntegradorElevenLabs = require('./integradorElevenLabs');
    if (IntegradorElevenLabs && (IntegradorElevenLabs.IntegradorElevenLabs || IntegradorElevenLabs)) {
        const Integrador = IntegradorElevenLabs.IntegradorElevenLabs || IntegradorElevenLabs;
        const integrador = new Integrador();
        console.log('✅ IntegradorElevenLabs importado');
        if (checarMetodo(integrador, 'gerarAudioTTS')) {
            console.log('   ✅ gerarAudioTTS() disponível');
        } else {
            console.log('   ❌ gerarAudioTTS() NÃO encontrado'); erros++;
        }
    } else {
        console.log('❌ IntegradorElevenLabs não exporta classe'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar IntegradorElevenLabs:', e.message); erros++;
}

try {
    const GeradorFalasIA = require('./geradorFalasIA');
    const geradorFalas = GeradorFalasIA.GeradorFalasIA || GeradorFalasIA;
    const falas = new geradorFalas();
    console.log('✅ GeradorFalasIA importado');
    if (checarMetodo(falas, 'gerarRoteiroCompleto')) {
        console.log('   ✅ gerarRoteiroCompleto() disponível');
    } else {
        console.log('   ❌ gerarRoteiroCompleto() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar GeradorFalasIA:', e.message); erros++;
}

try {
    const ComentariosContextuais = require('./comentariosContextuais');
    const comentarios = new ComentariosContextuais();
    console.log('✅ ComentariosContextuais importado');
    if (checarMetodo(comentarios, 'processarNoticiaComReacao')) {
        console.log('   ✅ processarNoticiaComReacao() disponível');
    } else {
        console.log('   ❌ processarNoticiaComReacao() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar ComentariosContextuais:', e.message); erros++;
}

try {
    const MixadorAutomatico = require('./mixadorAutomatico');
    const mixador = new MixadorAutomatico();
    console.log('✅ MixadorAutomatico importado');
    if (checarMetodo(mixador, 'mixarAudios')) {
        console.log('   ✅ mixarAudios() disponível');
    } else {
        console.log('   ❌ mixarAudios() NÃO encontrado'); erros++;
    }
} catch (e) {
    console.log('❌ Erro ao importar MixadorAutomatico:', e.message); erros++;
}

console.log('\n📊 Resumo de dependências:');
if (erros === 0) {
    console.log('🎉 Todas as dependências internas estão OK!');
} else {
    console.log(`⚠️ Foram encontrados ${erros} problemas de dependência interna.`);
}
