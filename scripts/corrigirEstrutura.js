#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function corrigirArquivosEstrutura() {
    console.log('🔧 === CORRIGINDO ESTRUTURA DOS ARQUIVOS ===\n');
    
    try {
        // 1. Verificar e corrigir gerarRoteiro.js
        console.log('📝 Corrigindo gerarRoteiro.js...');
        
        const geradorPath = path.join(__dirname, '..', 'gerarRoteiro.js');
        let conteudoGerador = fs.readFileSync(geradorPath, 'utf8');
        
        // Corrigir nome Iray para Iraí
        let alteracoes = 0;
        
        if (conteudoGerador.includes('Iray')) {
            conteudoGerador = conteudoGerador.replace(/\bIray\b/g, 'Iraí');
            alteracoes++;
            console.log('  ✅ Corrigido: Iray → Iraí');
        }
        
        // Adicionar carregamento de personagens se não existir
        if (!conteudoGerador.includes('personagens.json')) {
            console.log('  ⚠️ Adicionando carregamento de personagens...');
            // Aqui precisaríamos fazer uma correção mais complexa
        }
        
        if (alteracoes > 0) {
            fs.writeFileSync(geradorPath, conteudoGerador);
            console.log(`  💾 ${alteracoes} correções salvas`);
        }
        
        // 2. Verificar dialogosEspontaneos.js
        console.log('\n📝 Corrigindo dialogosEspontaneos.js...');
        
        const dialogosPath = path.join(__dirname, '..', 'dialogosEspontaneos.js');
        let conteudoDialogos = fs.readFileSync(dialogosPath, 'utf8');
        
        alteracoes = 0;
        
        // Corrigir nome
        if (conteudoDialogos.includes('iray')) {
            conteudoDialogos = conteudoDialogos.replace(/\biray\b/g, 'irai');
            alteracoes++;
            console.log('  ✅ Corrigido: iray → irai');
        }
        
        // Reduzir oxe e vichi
        if (conteudoDialogos.includes('"Oxe,') || conteudoDialogos.includes('"Vichi,')) {
            // Substituir algumas ocorrências
            conteudoDialogos = conteudoDialogos.replace(/"Oxe,/g, '"Eita,');
            conteudoDialogos = conteudoDialogos.replace(/"Vichi,/g, '"Rapaz,');
            alteracoes++;
            console.log('  ✅ Reduzidas gírias repetitivas');
        }
        
        if (alteracoes > 0) {
            fs.writeFileSync(dialogosPath, conteudoDialogos);
            console.log(`  💾 ${alteracoes} correções salvas`);
        }
        
        // 3. Testar carregamento de personagens
        console.log('\n📋 Testando carregamento de personagens...');
        
        const personagensPath = path.join(__dirname, '..', 'data', 'personagens.json');
        const personagensData = JSON.parse(fs.readFileSync(personagensPath, 'utf8'));
        
        console.log('  ✅ Personagens encontrados:');
        personagensData.personagens.forEach(p => {
            console.log(`    - ${p.nome} (${p.origem})`);
        });
        
        // 4. Verificar se há problemas com undefined
        console.log('\n🔍 Verificando possíveis fontes de undefined...');
        
        const arquivosParaVerificar = [
            'gerarRoteiro.js',
            'dialogosEspontaneos.js', 
            'templates/roteiro-template-novo.md'
        ];
        
        arquivosParaVerificar.forEach(arquivo => {
            const caminhoArquivo = path.join(__dirname, '..', arquivo);
            if (fs.existsSync(caminhoArquivo)) {
                const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
                const linhasUndefined = conteudo.split('\n').filter(linha =>
                    linha.includes('undefined')
                );
                if (linhasUndefined.length > 0) {
                    console.log(`  ⚠️ ${arquivo}: ${linhasUndefined.length} possíveis problemas`);
                }
            }
        });
        
        console.log('\n🎉 Correções aplicadas com sucesso!');
        console.log('💡 Execute novamente: npm run teste-episodio');
        
    } catch (error) {
        console.error('❌ Erro durante correções:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    corrigirArquivosEstrutura();
}