#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const arquivosPrincipais = [
    'core/gerarRoteiro.js',
    'core/classificadorContextual.js',
    'core/integradorElevenLabs.js',
    'core/integracaoIA.js',
    'core/integracaoIAExtendida.js',
    'core/geradorFalasIA.js',
    'scripts/gerarEpisodioComIA.js',
    'scripts/gerarEpisodioAudioReal.js',
    'scripts/gerarEpisodioSimples.js',
    'scripts/testarImportacoes.js',
    'scripts/verificarImportacoes.js',
    'scripts/verificarOpenAI.js',
    'scripts/adicionarOpenAI.js',
    'scripts/instalarFFmpeg.js',
    'core/comentariosContextuais.js',
    'core/mixadorAutomatico.js',
    'core/gerenciadorEventos.js',
    'core/dialogosEspontaneos.js',
    'core/sistemaRevisao.js'
];

const pastasPrincipais = [
    'data',
    'templates',
    'episodios',
    'audios',
    'temp_audio',
    'config',
    'revisao',
    'scripts',
    'docs'
];

function checarArquivo(arquivo) {
    return fs.existsSync(path.join(__dirname, arquivo));
}

function checarPasta(pasta) {
    const caminho = path.join(__dirname, pasta);
    return fs.existsSync(caminho) && fs.lstatSync(caminho).isDirectory();
}

function testarRequire(arquivo) {
    try {
        require(path.join(__dirname, arquivo));
        return true;
    } catch (error) {
        return error.message;
    }
}

console.log('🔍 === DIAGNÓSTICO DA ESTRUTURA DO PROJETO ===\n');

// Checar arquivos principais
console.log('📄 Arquivos principais:');
let arquivosOk = 0;
for (const arquivo of arquivosPrincipais) {
    if (checarArquivo(arquivo)) {
        console.log(`   ✅ ${arquivo}`);
        arquivosOk++;
    } else {
        console.log(`   ❌ ${arquivo} (NÃO ENCONTRADO)`);
    }
}

// Checar pastas principais
console.log('\n📁 Pastas principais:');
let pastasOk = 0;
for (const pasta of pastasPrincipais) {
    if (checarPasta(pasta)) {
        console.log(`   ✅ ${pasta}/`);
        pastasOk++;
    } else {
        console.log(`   ❌ ${pasta}/ (NÃO ENCONTRADA)`);
    }
}

// Testar require dos módulos principais
console.log('\n🧪 Testando require dos módulos:');
for (const arquivo of arquivosPrincipais) {
    if (checarArquivo(arquivo)) {
        const resultado = testarRequire(arquivo);
        if (resultado === true) {
            console.log(`   ✅ require('${arquivo}') OK`);
        } else {
            console.log(`   ❌ require('${arquivo}') ERRO: ${resultado}`);
        }
    }
}

console.log('\n📊 Resumo:');
console.log(`   Arquivos encontrados: ${arquivosOk}/${arquivosPrincipais.length}`);
console.log(`   Pastas encontradas: ${pastasOk}/${pastasPrincipais.length}`);

if (arquivosOk === arquivosPrincipais.length && pastasOk === pastasPrincipais.length) {
    console.log('\n🎉 Estrutura básica do projeto está OK!');
} else {
    console.log('\n⚠️ Há arquivos ou pastas faltando. Corrija antes de rodar o sistema completo.');
}

console.log('\n🧩 Diagnóstico concluído.');
console.log('\n🧩 Diagnóstico concluído.');
