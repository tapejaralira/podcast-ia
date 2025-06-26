#!/usr/bin/env node

// Script para verificar e corrigir importações

async function verificarImportacoes() {
    console.log('🔍 === VERIFICANDO IMPORTAÇÕES ===\n');
    
    try {
        // Testar importação da IntegracaoIA
        console.log('1. Testando IntegracaoIA original...');
        const integracaoModule = require('../integracaoIA');
        console.log('   Tipo:', typeof integracaoModule);
        console.log('   É classe?', typeof integracaoModule === 'function');
        
        // Testar importação da IntegracaoIAExtendida
        console.log('\n2. Testando IntegracaoIAExtendida...');
        const IntegracaoIAExtendida = require('../integracaoIAExtendida');
        console.log('   Tipo:', typeof IntegracaoIAExtendida);
        console.log('   É classe?', typeof IntegracaoIAExtendida === 'function');
        
        // Testar instanciação da versão estendida
        console.log('\n3. Testando instanciação da versão estendida...');
        const ia = new IntegracaoIAExtendida();
        console.log('   ✅ IntegracaoIAExtendida instanciada com sucesso');
        console.log('   Métodos disponíveis:', Object.getOwnPropertyNames(Object.getPrototypeOf(ia)));
        
        // Testar método gerarTexto
        console.log('\n4. Testando método gerarTexto...');
        if (typeof ia.gerarTexto === 'function') {
            console.log('   ✅ Método gerarTexto disponível');
            
            // Teste rápido
            const resultado = await ia.gerarTexto('Teste rápido', 10);
            console.log('   ✅ Método executado, tipo resultado:', typeof resultado);
        } else {
            console.log('   ❌ Método gerarTexto não encontrado');
        }
        
        console.log('\n✅ Verificação concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
        console.log('\n🔧 Tentando corrigir...');
        await corrigirImportacoes();
    }
}

async function corrigirImportacoes() {
    const fs = require('fs');
    const path = require('path');
    
    console.log('🔧 Corrigindo arquivo integracaoIA.js...');
    
    const caminhoIntegracao = path.join(__dirname, '..', 'integracaoIA.js');
    
    if (!fs.existsSync(caminhoIntegracao)) {
        console.log('❌ Arquivo integracaoIA.js não encontrado');
        return;
    }
    
    let conteudo = fs.readFileSync(caminhoIntegracao, 'utf8');
    
    // Verificar se tem export correto
    if (conteudo.includes('module.exports = { IntegracaoIA }')) {
        console.log('🔄 Corrigindo exportação...');
        conteudo = conteudo.replace('module.exports = { IntegracaoIA }', 'module.exports = IntegracaoIA');
        fs.writeFileSync(caminhoIntegracao, conteudo);
        console.log('✅ Exportação corrigida');
    } else if (conteudo.includes('module.exports = IntegracaoIA')) {
        console.log('✅ Exportação já está correta');
    } else {
        console.log('⚠️ Padrão de exportação não reconhecido');
        
        // Adicionar exportação no final se não existir
        if (!conteudo.includes('module.exports')) {
            conteudo += '\n\nmodule.exports = IntegracaoIA;\n';
            fs.writeFileSync(caminhoIntegracao, conteudo);
            console.log('✅ Exportação adicionada');
        }
    }
    
    // Testar novamente
    console.log('\n🧪 Testando após correção...');
    try {
        delete require.cache[require.resolve('../integracaoIA')];
        const IntegracaoIA = require('../integracaoIA');
        const ia = new IntegracaoIA();
        console.log('✅ Correção bem-sucedida!');
    } catch (error) {
        console.log('❌ Ainda há problemas:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    verificarImportacoes().catch(console.error);
}

module.exports = { verificarImportacoes };