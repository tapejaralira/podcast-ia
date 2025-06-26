#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');
const fs = require('fs');
const path = require('path');

async function debugRoteiro() {
    console.log('🔍 === DEBUG DO ROTEIRO ===\n');

    try {
        const gerador = new GeradorRoteiro();

        // Gerar roteiro simples primeiro
        console.log('📝 Gerando roteiro...');
        const roteiro = gerador.gerarRoteiro();
        
        console.log(`✅ Roteiro gerado: ${roteiro.length} caracteres\n`);
        
        // Salvar em arquivo para análise
        const debugPath = path.join(__dirname, '..', 'debug_roteiro.txt');
        fs.writeFileSync(debugPath, roteiro);
        console.log(`💾 Roteiro salvo em: ${debugPath}\n`);
        
        // Analisar primeiras 20 linhas
        console.log('🔍 === PRIMEIRAS 20 LINHAS ===');
        const linhas = roteiro.split('\n');
        linhas.slice(0, 20).forEach((linha, i) => {
            const numero = (i + 1).toString().padStart(2, '0');
            console.log(`${numero}: ${linha}`);
        });
        
        // Procurar por padrões de fala
        console.log('\n🎙️ === BUSCANDO FALAS DOS APRESENTADORES ===');
        
        const falasEncontradas = [];
        linhas.forEach((linha, i) => {
            // Tentar diferentes patterns
            let match = null;
            
            if (linha.includes('**Tainá:**') || linha.includes('**Iraí:**')) {
                match = linha.match(/\*\*(Tainá|Iraí):\*\*\s*(.+)/);
                if (match) {
                    falasEncontradas.push({
                        linha: i + 1,
                        personagem: match[1],
                        texto: match[2],
                        pattern: 'markdown'
                    });
                }
            } else if (linha.includes('Tainá:') || linha.includes('Iraí:')) {
                match = linha.match(/(Tainá|Iraí):\s*(.+)/);
                if (match) {
                    falasEncontradas.push({
                        linha: i + 1,
                        personagem: match[1],
                        texto: match[2],
                        pattern: 'simples'
                    });
                }
            }
        });
        
        console.log(`🎯 Falas encontradas: ${falasEncontradas.length}`);
        
        if (falasEncontradas.length > 0) {
            console.log('\n📋 === PRIMEIRAS 10 FALAS ===');
            falasEncontradas.slice(0, 10).forEach(fala => {
                console.log(`Linha ${fala.linha} (${fala.pattern}): ${fala.personagem} - "${fala.texto.substring(0, 50)}..."`);
            });
            
            const tainaCount = falasEncontradas.filter(f => f.personagem === 'Tainá').length;
            const iraiCount = falasEncontradas.filter(f => f.personagem === 'Iraí').length;
            
            console.log(`\n📊 Contagem:`);
            console.log(`👩 Tainá: ${tainaCount} falas`);
            console.log(`👨 Iraí: ${iraiCount} falas`);
        } else {
            console.log('❌ Nenhuma fala encontrada!');
            
            // Mostrar linhas que contêm os nomes dos apresentadores
            console.log('\n🔍 Linhas que contêm "Tainá" ou "Iraí":');
            linhas.forEach((linha, i) => {
                if (linha.includes('Tainá') || linha.includes('Iraí')) {
                    console.log(`Linha ${i + 1}: ${linha}`);
                }
            });
        }
        
        // Verificar se o template está sendo usado corretamente
        console.log('\n📄 === VERIFICAÇÃO DO TEMPLATE ===');
        const templatesPath = path.join(__dirname, '..', 'templates');
        const files = fs.readdirSync(templatesPath);
        console.log('Templates disponíveis:', files);
        
        // Ler o template atual
        const templateAtual = path.join(templatesPath, 'roteiro-template-melhorado.md');
        if (fs.existsSync(templateAtual)) {
            const templateContent = fs.readFileSync(templateAtual, 'utf8');
            const templateLinhas = templateContent.split('\n').slice(0, 15);
            console.log('\nPrimeiras 15 linhas do template:');
            templateLinhas.forEach((linha, i) => {
                console.log(`${i + 1}: ${linha}`);
            });
        }

    } catch (error) {
        console.error('❌ Erro no debug:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    debugRoteiro();
}

module.exports = debugRoteiro;