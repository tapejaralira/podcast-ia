#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function substituirTemplate() {
    console.log('🔄 === SUBSTITUINDO TEMPLATE CORROMPIDO ===\n');

    try {
        const templateCorreto = path.join(__dirname, '..', 'templates', 'roteiro-template-corrigido.md');
        const templateAntigo = path.join(__dirname, '..', 'templates', 'roteiro-template-melhorado.md');
        
        if (!fs.existsSync(templateCorreto)) {
            console.error('❌ Template corrigido não encontrado!');
            return;
        }

        // Fazer backup do template antigo
        if (fs.existsSync(templateAntigo)) {
            const backup = templateAntigo.replace('.md', '_backup.md');
            fs.copyFileSync(templateAntigo, backup);
            console.log(`💾 Backup criado: ${path.basename(backup)}`);
        }

        // Copiar template corrigido sobre o antigo
        const templateCorretoConteudo = fs.readFileSync(templateCorreto, 'utf8');
        fs.writeFileSync(templateAntigo, templateCorretoConteudo);
        
        console.log('✅ Template substituído com sucesso!');
        console.log(`📄 ${path.basename(templateAntigo)} agora está correto`);

        // Verificar se está funcionando
        console.log('\n🧪 Testando template substituído...');
        const conteudo = fs.readFileSync(templateAntigo, 'utf8');
        const primeiraLinha = conteudo.split('\n')[0];
        
        if (primeiraLinha.includes('# 🎙️ BUBUIA NEWS - ROTEIRO DIÁRIO NOVO')) {
            console.log('✅ Template correto aplicado!');
            console.log(`📏 Tamanho: ${conteudo.length} caracteres`);
        } else {
            console.log('⚠️ Template pode ainda ter problemas');
            console.log(`Primeira linha: ${primeiraLinha}`);
        }

    } catch (error) {
        console.error('❌ Erro na substituição:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    substituirTemplate();
}

module.exports = substituirTemplate;