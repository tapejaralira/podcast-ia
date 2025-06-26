#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ConfiguradorAPIs {
    constructor() {
        this.configPath = path.join(__dirname, '..', '.env');
        this.chaveElevenLabs = 'sk-c0e3b4671a2ac26d7b1b14a26dbed2b3e93e51c88dc14ce2'; // Chave fornecida
    }
    
    async configurarTodasAPIs() {
        console.log('🔧 === CONFIGURAÇÃO COMPLETA DE APIS ===\n');
        
        // 1. Verificar arquivo .env
        await this.verificarEnv();
        
        // 2. Aplicar chave do ElevenLabs já fornecida
        await this.aplicarChaveElevenLabs();
        
        // 3. Mostrar status das configurações
        await this.mostrarStatusAPIs();
        
        console.log('\n✅ Configuração inicial aplicada!');
        console.log('💡 Para completar, adicione as outras chaves conforme necessário');
    }
    
    async verificarEnv() {
        console.log('📄 Verificando arquivo .env...');
        
        if (!fs.existsSync(this.configPath)) {
            console.log('📝 Criando arquivo .env...');
            const template = this.getEnvTemplate();
            fs.writeFileSync(this.configPath, template);
            console.log('✅ Arquivo .env criado!');
        } else {
            console.log('✅ Arquivo .env já existe!');
        }
    }

    async aplicarChaveElevenLabs() {
        console.log('\n🗣️ Aplicando chave do ElevenLabs...');
        
        let envContent = fs.readFileSync(this.configPath, 'utf8');
        
        // Substituir placeholder pela chave real
        envContent = envContent.replace(
            'ELEVENLABS_API_KEY=sua_chave_elevenlabs_aqui',
            `ELEVENLABS_API_KEY=${this.chaveElevenLabs}`
        );
        
        // Configurar modo de operação para usar ElevenLabs
        envContent = envContent.replace(
            'MODO_OPERACAO=desenvolvimento',
            'MODO_OPERACAO=producao'
        );
        
        fs.writeFileSync(this.configPath, envContent);
        console.log('✅ Chave ElevenLabs configurada!');
    }

    async mostrarStatusAPIs() {
        console.log('\n📊 === STATUS DAS APIS ===');
        
        require('dotenv').config();
        
        // Status do TTS
        if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'sua_chave_elevenlabs_aqui') {
            console.log('🗣️ TTS: ✅ ElevenLabs configurado');
        } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua_chave_openai_aqui') {
            console.log('🗣️ TTS: ✅ OpenAI TTS disponível');
        } else {
            console.log('🗣️ TTS: 🔄 Usando Piper (local)');
        }
        
        // Status da IA
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua_chave_openai_aqui') {
            console.log('🧠 IA: ✅ OpenAI configurado');
        } else {
            console.log('🧠 IA: 🔄 Usando fallback (comentários pré-definidos)');
        }
        
        // Status das notícias
        if (process.env.NEWSAPI_KEY && process.env.NEWSAPI_KEY !== 'sua_chave_newsapi_aqui') {
            console.log('📰 Notícias: ✅ NewsAPI configurado');
        } else {
            console.log('📰 Notícias: 🔄 Usando RSS feeds (gratuito)');
        }
        
        console.log('\n🎯 Recomendações para melhorar:');
        
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sua_chave_openai_aqui') {
            console.log('   📝 Configure OpenAI para comentários mais únicos');
            console.log('      https://platform.openai.com/api-keys');
        }
        
        if (!process.env.NEWSAPI_KEY || process.env.NEWSAPI_KEY === 'sua_chave_newsapi_aqui') {
            console.log('   📰 Configure NewsAPI para mais notícias automáticas');
            console.log('      https://newsapi.org/register (1000 requests gratuitos/dia)');
        }
    }
    
    getEnvTemplate() {
        return `# 🎙️ BUBUIA NEWS - CONFIGURAÇÃO DE APIS
# Criado automaticamente em ${new Date().toISOString()}

# ===========================================
# 🗣️ TEXT-TO-SPEECH (Escolha uma opção)
# ===========================================

# OPÇÃO 1: ElevenLabs (Recomendado - Melhor qualidade)
ELEVENLABS_API_KEY=sua_chave_elevenlabs_aqui
ELEVENLABS_VOICE_TAINA=pNInz6obpgDQGcFmaJgB
ELEVENLABS_VOICE_IRAI=XB0fDUnXU5powFXDhCwa

# OPÇÃO 2: OpenAI TTS (Boa qualidade, integrado)
OPENAI_TTS_MODEL=tts-1
OPENAI_VOICE_TAINA=nova
OPENAI_VOICE_IRAI=onyx

# OPÇÃO 3: Piper TTS (Gratuito, local)
PIPER_MODEL_PATH=./models/piper
PIPER_VOICE_TAINA=pt_BR-female-medium
PIPER_VOICE_IRAI=pt_BR-male-medium

# ===========================================
# 🧠 INTELIGÊNCIA ARTIFICIAL
# ===========================================

# OpenAI (Recomendado para comentários únicos)
OPENAI_API_KEY=sua_chave_openai_aqui
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=150

# ===========================================
# 📰 NOTÍCIAS AUTOMÁTICAS
# ===========================================

# NewsAPI (1000 requests gratuitos/dia)
NEWSAPI_KEY=sua_chave_newsapi_aqui
NEWSAPI_COUNTRY=br
NEWSAPI_LANGUAGE=pt

# RSS Feeds (100% Gratuito)
RSS_FEEDS=https://www.acritica.com/feed,https://portaldoholanda.com.br/feed,https://amazonasatual.com.br/feed

# ===========================================
# ⚙️ CONFIGURAÇÕES GERAIS
# ===========================================

# Modo de operação
MODO_OPERACAO=desenvolvimento
# producao = usar APIs reais
# desenvolvimento = usar fallbacks quando necessário
# teste = logs detalhados

# Configurações de áudio
AUDIO_QUALITY=high
AUDIO_FORMAT=mp3
SAMPLE_RATE=44100
AUDIO_BITRATE=128k

# Configurações do podcast
EPISODIOS_POR_SEMANA=5
DURACAO_ALVO_MINUTOS=15
AUTO_PUBLICAR=false

# ===========================================
# 🔧 CONFIGURAÇÕES AVANÇADAS
# ===========================================

# Controle de qualidade
REVISAR_ROTEIRO=true
NIVEL_AUTONOMIA=7
# 0 = totalmente manual
# 10 = totalmente automático

# Debug e logs
LOG_LEVEL=info
SALVAR_LOGS=true
DEBUG_APIS=false

# Backup e segurança
BACKUP_EPISODIOS=true
BACKUP_ROTEIROS=true

# Configurações de voz por contexto
USE_VOICE_CONTEXT=true
VOICE_SPEED_VARIATION=true
VOICE_EMOTION_CONTEXT=true

# Cache para otimização
CACHE_TTS_ENABLED=true
CACHE_NEWS_ENABLED=true
CACHE_DURATION_HOURS=24
`;
    }
}

// Executar configuração
if (require.main === module) {
    const configurador = new ConfiguradorAPIs();
    configurador.configurarTodasAPIs().catch(console.error);
}

module.exports = { ConfiguradorAPIs };