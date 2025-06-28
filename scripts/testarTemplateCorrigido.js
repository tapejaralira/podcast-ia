#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testarTemplateCorrigido() {
    console.log('🔧 === TESTE COM TEMPLATE CORRIGIDO ===\n');

    try {
        // Carregar template corrigido
        const templatePath = path.join(__dirname, '..', 'templates', 'roteiro-template-corrigido.md');
        
        if (!fs.existsSync(templatePath)) {
            console.error('❌ Template corrigido não encontrado!');
            return;
        }

        const template = fs.readFileSync(templatePath, 'utf8');
        console.log(`✅ Template carregado: ${template.length} caracteres`);

        // Simular substituições básicas
        let roteiro = template
            .replace(/\{\{DATA_FORMATADA\}\}/g, 'quarta-feira, 25 de junho de 2025')
            .replace(/\{\{TIPO_INTERACAO\}\}/g, 'teste')
            .replace(/\{\{APRESENTADOR_SECUNDARIO\}\}/g, 'E eu sou o Iraí!')
            .replace(/\{\{INTERACAO_ESPONTANEA\}\}/g, '**Tainá:** Eita, Iraí! Como tá o dia?\n**Iraí:** Tá bom, Tai! Vamos às notícias!')
            .replace(/\{\{TRANSICAO_CARDAPIO\}\}/g, '**Tainá:** Bora ver o cardápio!\n**Iraí:** Vamos nessa!')
            .replace(/\{\{GIRIA_TAINA\}\}/g, 'Eita')
            .replace(/\{\{MANCHETE_PRINCIPAL\}\}/g, 'Festival de Parintins 2025 confirmado')
            .replace(/\{\{MANCHETE_SECUNDARIA\}\}/g, 'Centro de Manaus recebe nova obra')
            .replace(/\{\{MANCHETE_TERCIARIA\}\}/g, 'Artesãos locais ganham destaque')
            .replace(/\{\{NOTICIA_ESPORTE\}\}/g, 'Nacional prepara time para temporada')
            .replace(/\{\{CURIOSIDADE_REGIONAL\}\}/g, 'O Teatro Amazonas é patrimônio histórico')
            .replace(/\{\{COMENTARIO_OUVINTE\}\}/g, '"Adoro o programa!" - Maria, Parintins')
            .replace(/\{\{NOTICIA_1\}\}/g, 'Festival de Parintins 2025 confirmado com novidades')
            .replace(/\{\{NOTICIA_2\}\}/g, 'Centro de Manaus recebe obra de revitalização')
            .replace(/\{\{NOTICIA_3\}\}/g, 'Artesãos locais ganham espaço em feira')
            .replace(/\{\{RESPOSTA_IRAI\}\}/g, 'Pois é, né? Que interessante!')
            .replace(/\{\{RESPOSTA_TAINA\}\}/g, 'Eita, né! Muito bom isso!')
            .replace(/\{\{COMENTARIO_RIVALIDADE\}\}/g, '**Tainá:** Garantido no coração!\n**Iraí:** Os dois bois são bonitos!')
            .replace(/\{\{COMENTARIO_BOI_TAINA\}\}/g, 'Vermelho e branco sempre!')
            .replace(/\{\{COMENTARIO_BOI_IRAY\}\}/g, 'Tradição é tradição, né?')
            .replace(/\{\{DIALOGO_CULTURA\}\}/g, '**Tainá:** A cultura amazônica é rica!\n**Iraí:** Verdade, Tai!')
            .replace(/\{\{ENCERRAMENTO_TAINA\}\}/g, 'Eita, foi massa estar com vocês!')
            .replace(/\{\{ENCERRAMENTO_IRAI\}\}/g, 'Até a próxima, pessoal!')
            .replace(/\{\{DESPEDIDA_CONJUNTA\}\}/g, '**Tainá:** BubuiA News!\n**Iraí:** Sempre no ar!')
            .replace(/\{\{DURACAO\}\}/g, '15-20 minutos')
            .replace(/\{\{OBSERVACOES_TECNICAS\}\}/g, 'Pausas naturais')
            .replace(/\{\{EFEITOS_SONOROS\}\}/g, 'Som ambiente de floresta')
            .replace(/\{\{TIMESTAMP\}\}/g, new Date().toISOString())
            .replace(/\{\{CONFIGURACAO_TTS\}\}/g, '{"taina":{"emocao":"excited"},"irai":{"emocao":"calm"}}');

        // Salvar roteiro de teste
        const testeOutput = path.join(__dirname, '..', 'debug_roteiro_corrigido.txt');
        fs.writeFileSync(testeOutput, roteiro);
        console.log(`💾 Roteiro teste salvo: ${testeOutput}`);

        // Analisar falas
        console.log('\n🎙️ === ANÁLISE DE FALAS ===');
        const linhas = roteiro.split('\n');
        const falas = [];

        linhas.forEach((linha, i) => {
            const match = linha.match(/\*\*(Tainá|Iraí):\*\*\s*(.+)/);
            if (match && match[2].trim()) {
                falas.push({
                    linha: i + 1,
                    personagem: match[1],
                    texto: match[2].trim()
                });
            }
        });

        console.log(`🎯 Total de falas encontradas: ${falas.length}`);
        
        const tainaFalas = falas.filter(f => f.personagem === 'Tainá').length;
        const iraiFalas = falas.filter(f => f.personagem === 'Iraí').length;
        
        console.log(`👩 Tainá: ${tainaFalas} falas`);
        console.log(`👨 Iraí: ${iraiFalas} falas`);

        if (falas.length > 0) {
            console.log('\n📋 Primeiras 5 falas:');
            falas.slice(0, 5).forEach(fala => {
                console.log(`${fala.personagem}: "${fala.texto.substring(0, 50)}..."`);
            });
            console.log('\n✅ Template funcionando corretamente!');
        } else {
            console.log('❌ Nenhuma fala encontrada no template!');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    testarTemplateCorrigido();
}

module.exports = testarTemplateCorrigido;