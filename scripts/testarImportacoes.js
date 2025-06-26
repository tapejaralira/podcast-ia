#!/usr/bin/env node

// Script para testar todas as importações de uma vez

async function testarTodasImportacoes() {
    console.log('🔍 === TESTE COMPLETO DE IMPORTAÇÕES ===\n');
    
    const modulos = [
        { nome: 'GeradorFalasIA', arquivo: '../geradorFalasIA', destructuring: true },
        { nome: 'ClassificadorContextual', arquivo: '../classificadorContextual', destructuring: false },
        { nome: 'IntegracaoIAExtendida', arquivo: '../integracaoIAExtendida', destructuring: false }
    ];
    
    const resultados = {};
    
    for (const modulo of modulos) {
        try {
            console.log(`📦 Testando ${modulo.nome}...`);
            
            let ClasseImportada;
            if (modulo.destructuring) {
                const moduleExports = require(modulo.arquivo);
                ClasseImportada = moduleExports[modulo.nome];
            } else {
                ClasseImportada = require(modulo.arquivo);
            }
            
            console.log(`   Tipo: ${typeof ClasseImportada}`);
            console.log(`   É construtor: ${typeof ClasseImportada === 'function'}`);
            
            if (typeof ClasseImportada === 'function') {
                const instancia = new ClasseImportada();
                console.log(`   ✅ Instanciação bem-sucedida`);
                
                const metodos = Object.getOwnPropertyNames(Object.getPrototypeOf(instancia));
                console.log(`   Métodos: ${metodos.length} encontrados`);
                
                resultados[modulo.nome] = { sucesso: true, instancia, metodos };
            } else {
                console.log(`   ❌ Não é uma classe válida`);
                resultados[modulo.nome] = { sucesso: false, erro: 'Não é função' };
            }
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            resultados[modulo.nome] = { sucesso: false, erro: error.message };
        }
        
        console.log('');
    }
    
    // Teste de integração
    console.log('🔗 === TESTE DE INTEGRAÇÃO ===\n');
    
    try {
        if (resultados.GeradorFalasIA?.sucesso && resultados.ClassificadorContextual?.sucesso) {
            console.log('🧪 Testando workflow completo...');
            
            const geradorFalas = resultados.GeradorFalasIA.instancia;
            const classificador = resultados.ClassificadorContextual.instancia;
            
            // Teste rápido de classificação
            const contexto = await classificador.classificarNoticia({
                titulo: 'Festival de Parintins 2025',
                categoria: 'cultura'
            });
            
            console.log(`✅ Classificação funcionando: ${contexto}`);
            
            // Teste rápido de geração de falas
            const falas = await geradorFalas.gerarIntroducao();
            console.log(`✅ Geração de falas funcionando: ${falas.length} falas`);
            
            console.log('🎉 Integração completa funcionando!');
            
        } else {
            console.log('❌ Problemas nas importações impedem teste de integração');
        }
        
    } catch (error) {
        console.log(`❌ Erro na integração: ${error.message}`);
    }
    
    // Relatório final
    console.log('\n📊 === RELATÓRIO FINAL ===');
    
    for (const [nome, resultado] of Object.entries(resultados)) {
        const status = resultado.sucesso ? '✅' : '❌';
        console.log(`${status} ${nome}: ${resultado.sucesso ? 'OK' : resultado.erro}`);
    }
    
    const todosSucesso = Object.values(resultados).every(r => r.sucesso);
    
    if (todosSucesso) {
        console.log('\n🎉 Todos os módulos funcionando!');
        console.log('🚀 Execute: npm run gerar-episodio-ia');
    } else {
        console.log('\n⚠️ Alguns módulos precisam de correção');
        console.log('🔧 Verifique os erros acima');
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    testarTodasImportacoes().catch(console.error);
}

module.exports = { testarTodasImportacoes };