#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function verificarOpenAI() {
    console.log('🔍 === VERIFICANDO CONFIGURAÇÃO OPENAI ===\n');
    
    try {
        // Carregar .env
        require('dotenv').config();
        
        const envPath = path.join(__dirname, '..', '.env');
        
        if (!fs.existsSync(envPath)) {
            console.log('❌ Arquivo .env não encontrado!');
            console.log('💡 Execute: npm run configurar-apis');
            return;
        }
        
        console.log('📄 Verificando arquivo .env...');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Verificar se a chave está no arquivo
        const linhaOpenAI = envContent.split('\n').find(linha => linha.startsWith('OPENAI_API_KEY='));
        
        if (!linhaOpenAI) {
            console.log('❌ OPENAI_API_KEY não encontrada no .env');
            console.log('💡 Execute: npm run adicionar-openai');
            return;
        }
        
        console.log('📋 Linha encontrada:', linhaOpenAI.substring(0, 30) + '...');
        
        // Verificar se a variável de ambiente foi carregada
        console.log('\n🔧 Verificando variável de ambiente...');
        const chaveEnv = process.env.OPENAI_API_KEY;
        
        if (!chaveEnv) {
            console.log('❌ Variável OPENAI_API_KEY não carregada');
            console.log('💡 Problema no carregamento do .env');
        } else if (chaveEnv === 'sua_chave_openai_aqui') {
            console.log('❌ Chave ainda é placeholder');
            console.log('💡 Execute: npm run adicionar-openai');
        } else if (chaveEnv.startsWith('sk-proj-')) {
            console.log('✅ Chave OpenAI válida detectada');
            console.log(`📏 Tamanho: ${chaveEnv.length} caracteres`);
            console.log(`🔑 Início: ${chaveEnv.substring(0, 15)}...`);
            
            // Testar conexão
            console.log('\n🧪 Testando conexão com OpenAI...');
            testarConexaoOpenAI(chaveEnv);
        } else {
            console.log('⚠️ Formato de chave não reconhecido');
            console.log(`📏 Tamanho: ${chaveEnv.length} caracteres`);
            console.log(`🔑 Início: ${chaveEnv.substring(0, 10)}...`);
        }
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
    }
}

async function testarConexaoOpenAI(apiKey) {
    try {
        // Verificar se fetch está disponível
        if (typeof global.fetch === 'undefined') {
            console.log('⚠️ Fetch não disponível, não é possível testar conexão');
            return;
        }
        
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Conexão com OpenAI funcionando!');
            
            // Testar geração de texto simples
            console.log('\n🎯 Testando geração de texto...');
            const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: 'Diga apenas "Olá do BubuiA News!"'
                        }
                    ],
                    max_tokens: 20
                })
            });
            
            if (testResponse.ok) {
                const data = await testResponse.json();
                const resposta = data.choices[0]?.message?.content?.trim();
                console.log('✅ Teste de geração bem-sucedido!');
                console.log(`🤖 Resposta: "${resposta}"`);
                
                console.log('\n🎉 OpenAI configurada e funcionando!');
                console.log('💡 Execute: npm run gerar-episodio-ia');
            } else {
                console.log('❌ Erro na geração de texto:', testResponse.status);
            }
            
        } else {
            console.log('❌ Erro na conexão:', response.status);
            if (response.status === 401) {
                console.log('🔑 Chave API inválida ou expirada');
            } else if (response.status === 429) {
                console.log('⏰ Rate limit atingido');
            }
        }
        
    } catch (error) {
        console.log('❌ Erro na conexão:', error.message);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    verificarOpenAI();
}

module.exports = { verificarOpenAI };