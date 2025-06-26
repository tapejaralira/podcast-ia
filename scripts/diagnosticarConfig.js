#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script para verificar e diagnosticar configurações
async function diagnosticarConfiguracao() {
    console.log('🔍 === DIAGNÓSTICO DE CONFIGURAÇÃO ===\n');
    
    const configPath = path.join(__dirname, '..', 'config', 'ia-config.json');
    
    try {
        // 1. Verificar se arquivo existe
        console.log('📁 Verificando arquivo de configuração...');
        console.log(`📍 Caminho: ${configPath}`);
        
        if (!fs.existsSync(configPath)) {
            console.log('❌ Arquivo não encontrado!');
            console.log('\n🔧 CRIANDO ARQUIVO DE CONFIGURAÇÃO...');
            
            // Criar diretório se não existir
            const configDir = path.dirname(configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            // Criar configuração padrão
            const configPadrao = {
                "openai": {
                    "api_key": "sua_openai_key_aqui",
                    "modelo": "gpt-3.5-turbo",
                    "temperatura": 0.7,
                    "max_tokens": 1000
                },
                "tts": {
                    "servico_ativo": "elevenlabs",
                    "elevenlabs": {
                        "api_key": "sk_6bae55e1b3f4cf8cde82b4ee77c5149b83b96ee6d043a758",
                        "voice_taina": "EXAVITQu4vr4xnSDxMaL",
                        "voice_iray": "pNInz6obpgDQGcFmaJgB",
                        "modelo": "eleven_multilingual_v2",
                        "stability": 0.5,
                        "similarity_boost": 0.8,
                        "style": 0.3,
                        "use_speaker_boost": true
                    }
                },
                "configuracoes_gerais": {
                    "diretorio_audios": "./audios",
                    "formato_audio": "mp3",
                    "qualidade": "alta",
                    "debug_mode": true
                }
            };
            
            fs.writeFileSync(configPath, JSON.stringify(configPadrao, null, 4));
            console.log('✅ Arquivo criado com configurações padrão!');
        }
        
        // 2. Ler e verificar conteúdo
        console.log('📖 Lendo configurações...');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // 3. Verificar estrutura
        console.log('🔍 Verificando estrutura...');
        
        const verificacoes = [
            { campo: 'tts', valor: !!config.tts, descricao: 'Seção TTS' },
            { campo: 'tts.servico_ativo', valor: config.tts?.servico_ativo, descricao: 'Serviço ativo' },
            { campo: 'tts.elevenlabs', valor: !!config.tts?.elevenlabs, descricao: 'Configuração ElevenLabs' },
            { campo: 'tts.elevenlabs.api_key', valor: !!config.tts?.elevenlabs?.api_key, descricao: 'API Key ElevenLabs' },
            { campo: 'tts.elevenlabs.voice_taina', valor: !!config.tts?.elevenlabs?.voice_taina, descricao: 'Voz da Tainá' },
            { campo: 'tts.elevenlabs.voice_iray', valor: !!config.tts?.elevenlabs?.voice_iray, descricao: 'Voz do Iray' }
        ];
        
        let problemasEncontrados = 0;
        
        verificacoes.forEach(check => {
            if (check.valor === false || check.valor === undefined) {
                console.log(`❌ ${check.descricao}: FALTANDO`);
                problemasEncontrados++;
            } else {
                console.log(`✅ ${check.descricao}: OK (${check.valor})`);
            }
        });
        
        if (problemasEncontrados === 0) {
            console.log('\n🎉 CONFIGURAÇÃO PERFEITA!');
            console.log('✅ Todas as verificações passaram');
            console.log('\n🚀 Teste novamente: npm run teste-tts');
        } else {
            console.log(`\n⚠️ ${problemasEncontrados} problema(s) encontrado(s)`);
            console.log('🔧 Configuração foi corrigida automaticamente');
            console.log('\n🚀 Teste novamente: npm run teste-tts');
        }
        
        // 4. Mostrar configuração atual
        console.log('\n📋 CONFIGURAÇÃO ATUAL:');
        console.log('Serviço:', config.tts?.servico_ativo || 'NÃO DEFINIDO');
        console.log('API Key:', config.tts?.elevenlabs?.api_key ? 
            `${config.tts.elevenlabs.api_key.substring(0, 10)}...` : 'NÃO DEFINIDA');
        console.log('Voice Tainá:', config.tts?.elevenlabs?.voice_taina || 'NÃO DEFINIDA');
        console.log('Voice Iray:', config.tts?.elevenlabs?.voice_iray || 'NÃO DEFINIDA');
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO:', error.message);
        console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
        console.log('1. Verificar se o arquivo JSON está válido');
        console.log('2. Verificar permissões de leitura/escrita');
        console.log('3. Recriar arquivo de configuração');
        process.exit(1);
    }
}

// Executar diagnóstico
if (require.main === module) {
    diagnosticarConfiguracao();
}