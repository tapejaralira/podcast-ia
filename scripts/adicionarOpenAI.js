#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function adicionarChaveOpenAI() {
    console.log('🔧 === ADICIONANDO CHAVE OPENAI ===\n');
    
    const envPath = path.join(__dirname, '..', '.env');
    const chaveOpenAI = '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';
    
    try {
        if (!fs.existsSync(envPath)) {
            console.log('❌ Arquivo .env não encontrado!');
            console.log('💡 Execute primeiro: npm run configurar-apis');
            return;
        }
        
        console.log('📄 Lendo arquivo .env...');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Substituir placeholder pela chave real
        const chaveAnterior = envContent.includes('OPENAI_API_KEY=sua_chave_openai_aqui');
        const chaveExiste = envContent.includes('OPENAI_API_KEY=sk-proj-');
        
        if (chaveExiste) {
            console.log('⚠️ Chave OpenAI já configurada. Atualizando...');
            envContent = envContent.replace(
                /OPENAI_API_KEY=sk-proj-[^\n\r]*/,
                `OPENAI_API_KEY=${chaveOpenAI}`
            );
        } else if (chaveAnterior) {
            console.log('🔧 Substituindo placeholder pela chave real...');
            envContent = envContent.replace(
                'OPENAI_API_KEY=sua_chave_openai_aqui',
                `OPENAI_API_KEY=${chaveOpenAI}`
            );
        } else {
            console.log('➕ Adicionando chave OpenAI ao arquivo...');
            // Encontrar seção de IA e substituir
            const linhasIA = envContent.split('\n');
            const indiceIA = linhasIA.findIndex(linha => linha.includes('# 🧠 INTELIGÊNCIA ARTIFICIAL'));
            
            if (indiceIA !== -1) {
                // Encontrar próxima linha OPENAI_API_KEY ou adicionar
                let indiceChave = linhasIA.findIndex((linha, i) => i > indiceIA && linha.startsWith('OPENAI_API_KEY='));
                
                if (indiceChave !== -1) {
                    linhasIA[indiceChave] = `OPENAI_API_KEY=${chaveOpenAI}`;
                } else {
                    // Adicionar após o comentário da seção
                    linhasIA.splice(indiceIA + 2, 0, `OPENAI_API_KEY=${chaveOpenAI}`);
                }
                
                envContent = linhasIA.join('\n');
            }
        }
        
        // Também atualizar modo de operação para produção
        if (envContent.includes('MODO_OPERACAO=desenvolvimento')) {
            envContent = envContent.replace(
                'MODO_OPERACAO=desenvolvimento',
                'MODO_OPERACAO=producao'
            );
            console.log('🚀 Modo de operação alterado para produção');
        }
        
        // Salvar arquivo atualizado
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Chave OpenAI configurada com sucesso!');
        
        // Verificar configuração
        console.log('\n📊 === STATUS ATUALIZADO ===');
        require('dotenv').config();
        
        console.log('🗣️ TTS:', process.env.ELEVENLABS_API_KEY ? '✅ ElevenLabs configurado' : '❌ Não configurado');
        console.log('🧠 IA:', process.env.OPENAI_API_KEY ? '✅ OpenAI configurado' : '❌ Não configurado');
        console.log('📰 Notícias:', process.env.NEWSAPI_KEY ? '✅ NewsAPI configurado' : '🔄 Usando RSS');
        console.log('⚙️ Modo:', process.env.MODO_OPERACAO || 'desenvolvimento');
        
        console.log('\n🎉 === SISTEMA MELHORADO ===');
        console.log('✅ Agora você tem:');
        console.log('   🎙️ Vozes reais (ElevenLabs)');
        console.log('   🧠 IA avançada (OpenAI GPT-4)');
        console.log('   💬 Comentários únicos e naturais');
        console.log('   🎭 Personalidades mais humanas');
        
        console.log('\n🚀 Teste agora:');
        console.log('   npm run testar-todas-apis');
        console.log('   npm run gerar-audio-real');
        
    } catch (error) {
        console.error('❌ Erro ao configurar OpenAI:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    adicionarChaveOpenAI();
}

module.exports = { adicionarChaveOpenAI };