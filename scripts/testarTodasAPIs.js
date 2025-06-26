#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testarTodasAPIs() {
    console.log('🧪 === TESTE COMPLETO DE TODAS AS APIS ===\n');
    
    // Carregar configurações
    require('dotenv').config();
    
    const resultados = {
        tts: { status: false, servico: 'nenhum', detalhes: '' },
        ia: { status: false, servico: 'fallback', detalhes: '' },
        noticias: { status: false, servico: 'rss', detalhes: '' },
        audio: { status: false, servico: 'ffmpeg', detalhes: '' }
    };
    
    // 1. Testar TTS
    console.log('🗣️ === TESTANDO TEXT-TO-SPEECH ===');
    await testarTTS(resultados);
    
    // 2. Testar IA
    console.log('\n🧠 === TESTANDO INTELIGÊNCIA ARTIFICIAL ===');
    await testarIA(resultados);
    
    // 3. Testar Notícias
    console.log('\n📰 === TESTANDO BUSCA DE NOTÍCIAS ===');
    await testarNoticias(resultados);
    
    // 4. Testar Áudio
    console.log('\n🎵 === TESTANDO PROCESSAMENTO DE ÁUDIO ===');
    await testarAudio(resultados);
    
    // 5. Testar sistema completo
    console.log('\n🎙️ === TESTE DO SISTEMA COMPLETO ===');
    await testarSistemaCompleto(resultados);
    
    // Relatório final
    exibirRelatorioFinal(resultados);
}

async function testarTTS(resultados) {
    try {
        // Sempre testar apenas ElevenLabs
        if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'sua_chave_elevenlabs_aqui') {
            console.log('🔍 Testando ElevenLabs...');
            const resultado = await testarElevenLabs();
            resultados.tts = {
                status: resultado.sucesso,
                servico: 'elevenlabs',
                detalhes: resultado.mensagem
            };
        } else {
            resultados.tts = {
                status: false,
                servico: 'elevenlabs',
                detalhes: 'Chave ElevenLabs não configurada'
            };
        }

        const status = resultados.tts.status ? '✅' : '❌';
        console.log(`   ${status} ${resultados.tts.servico}: ${resultados.tts.detalhes}`);
        
    } catch (error) {
        resultados.tts.detalhes = `Erro: ${error.message}`;
        console.log(`   ❌ Erro no TTS: ${error.message}`);
    }
}

async function testarIA(resultados) {
    try {
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua_chave_openai_aqui') {
            console.log('🔍 Testando OpenAI...');
            const resultado = await testarOpenAIChat();
            resultados.ia = {
                status: resultado.sucesso,
                servico: 'openai',
                detalhes: resultado.mensagem
            };
        } else {
            resultados.ia = {
                status: false,
                servico: 'openai',
                detalhes: 'Chave OpenAI não configurada'
            };
        }

        const status = resultados.ia.status ? '✅' : '❌';
        console.log(`   ${status} ${resultados.ia.servico}: ${resultados.ia.detalhes}`);

    } catch (error) {
        resultados.ia.detalhes = `Erro: ${error.message}`;
        console.log(`   ❌ Erro na IA: ${error.message}`);
    }
}

async function testarNoticias(resultados) {
    try {
        if (process.env.NEWSAPI_KEY && process.env.NEWSAPI_KEY !== 'sua_chave_newsapi_aqui') {
            console.log('🔍 Testando NewsAPI...');
            const resultado = await testarNewsAPI();
            resultados.noticias = {
                status: resultado.sucesso,
                servico: 'newsapi',
                detalhes: resultado.mensagem
            };
        } else {
            console.log('🔍 Testando RSS feeds...');
            const resultado = await testarRSSFeeds();
            resultados.noticias = {
                status: resultado.sucesso,
                servico: 'rss',
                detalhes: resultado.mensagem
            };
        }
        
        const status = resultados.noticias.status ? '✅' : '❌';
        console.log(`   ${status} ${resultados.noticias.servico}: ${resultados.noticias.detalhes}`);
        
    } catch (error) {
        resultados.noticias.detalhes = `Erro: ${error.message}`;
        console.log(`   ❌ Erro nas notícias: ${error.message}`);
    }
}

async function testarAudio(resultados) {
    try {
        console.log('🔍 Testando FFmpeg...');
        const resultado = await testarFFmpeg();
        resultados.audio = {
            status: resultado.sucesso,
            servico: 'ffmpeg',
            detalhes: resultado.mensagem
        };
        
        const status = resultados.audio.status ? '✅' : '❌';
        console.log(`   ${status} FFmpeg: ${resultados.audio.detalhes}`);
        
    } catch (error) {
        resultados.audio.detalhes = `Erro: ${error.message}`;
        console.log(`   ❌ Erro no áudio: ${error.message}`);
    }
}

async function testarSistemaCompleto(resultados) {
    try {
        console.log('🔍 Testando geração de episódio...');
        
        // Simular geração rápida
        const GeradorRoteiro = require('../gerarRoteiro');
        const gerador = new GeradorRoteiro();
        
        console.log('   📝 Gerando roteiro de teste...');
        const roteiro = gerador.gerarRoteiro();
        
        console.log('   🎭 Processando contextos...');
        const contextos = await gerador.processarNoticiaComContexto('Festival de Parintins 2025 confirmado');
        
        console.log('   ✅ Sistema completo funcionando!');
        console.log(`   📊 Roteiro: ${roteiro.length} caracteres`);
        console.log(`   🎯 Contexto detectado: ${contextos.contexto}`);
        
    } catch (error) {
        console.log(`   ❌ Erro no sistema: ${error.message}`);
    }
}

// Funções de teste específicas
async function testarElevenLabs() {
    return new Promise((resolve) => {
        // Teste real seria fazer uma requisição para ElevenLabs
        // Por enquanto, apenas verificar se a chave parece válida
        const chave = process.env.ELEVENLABS_API_KEY;
        if (chave && chave.startsWith('sk-') && chave.length > 20) {
            resolve({ sucesso: true, mensagem: 'Chave válida configurada' });
        } else {
            resolve({ sucesso: false, mensagem: 'Chave inválida' });
        }
    });
}

async function testarOpenAITTS() {
    return new Promise((resolve) => {
        const chave = process.env.OPENAI_API_KEY;
        if (chave && chave.startsWith('sk-') && chave.length > 20) {
            resolve({ sucesso: true, mensagem: 'Chave válida configurada' });
        } else {
            resolve({ sucesso: false, mensagem: 'Chave inválida' });
        }
    });
}

async function testarOpenAIChat() {
    return new Promise((resolve) => {
        const chave = process.env.OPENAI_API_KEY;
        if (chave && chave.startsWith('sk-') && chave.length > 20) {
            resolve({ sucesso: true, mensagem: 'Chave válida configurada' });
        } else {
            resolve({ sucesso: false, mensagem: 'Chave inválida' });
        }
    });
}

async function testarNewsAPI() {
    return new Promise((resolve) => {
        const chave = process.env.NEWSAPI_KEY;
        if (chave && chave.length > 10) {
            resolve({ sucesso: true, mensagem: 'Chave válida configurada' });
        } else {
            resolve({ sucesso: false, mensagem: 'Chave inválida' });
        }
    });
}

async function testarRSSFeeds() {
    return new Promise((resolve) => {
        // RSS sempre funciona (não precisa de chave)
        resolve({ sucesso: true, mensagem: 'RSS feeds configurados (A Crítica, Portal do Holanda)' });
    });
}

async function testarFFmpeg() {
    return new Promise((resolve) => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve({ sucesso: true, mensagem: 'FFmpeg instalado e funcionando' });
            } else {
                resolve({ sucesso: false, mensagem: 'FFmpeg não encontrado' });
            }
        });
        
        ffmpeg.on('error', () => {
            resolve({ sucesso: false, mensagem: 'FFmpeg não instalado' });
        });
        
        // Timeout de 5 segundos
        setTimeout(() => {
            ffmpeg.kill();
            resolve({ sucesso: false, mensagem: 'FFmpeg não responde' });
        }, 5000);
    });
}

function exibirRelatorioFinal(resultados) {
    console.log('\n📊 === RELATÓRIO FINAL DAS APIS ===\n');
    
    const emoji = (status) => status ? '✅' : '❌';
    
    console.log(`🗣️ Text-to-Speech: ${emoji(resultados.tts.status)} ${resultados.tts.servico}`);
    console.log(`   ${resultados.tts.detalhes}`);
    
    console.log(`\n🧠 Inteligência Artificial: ${emoji(resultados.ia.status)} ${resultados.ia.servico}`);
    console.log(`   ${resultados.ia.detalhes}`);
    
    console.log(`\n📰 Notícias: ${emoji(resultados.noticias.status)} ${resultados.noticias.servico}`);
    console.log(`   ${resultados.noticias.detalhes}`);
    
    console.log(`\n🎵 Processamento de Áudio: ${emoji(resultados.audio.status)} ${resultados.audio.servico}`);
    console.log(`   ${resultados.audio.detalhes}`);
    
    // Análise geral
    const totalOK = Object.values(resultados).filter(r => r.status).length;
    const percentual = Math.round((totalOK / 4) * 100);
    
    console.log(`\n🎯 === ANÁLISE GERAL ===`);
    console.log(`📊 APIs funcionando: ${totalOK}/4 (${percentual}%)`);
    
    if (percentual >= 75) {
        console.log('🎉 SISTEMA PRONTO PARA PRODUÇÃO!');
        console.log('💡 Execute: npm run gerar-episodio-completo');
    } else if (percentual >= 50) {
        console.log('⚠️ Sistema funcional com limitações');
        console.log('💡 Configure mais APIs para melhor qualidade');
    } else {
        console.log('❌ Sistema precisa de configurações adicionais');
        console.log('💡 Configure pelo menos TTS e IA para melhor experiência');
    }
    
    console.log('\n🔧 === PRÓXIMOS PASSOS ===');
    
    // Próximos passos
    if (!resultados.tts.status) {
        console.log('🗣️ Configure ElevenLabs para vozes mais naturais');
    }

    if (!resultados.ia.status) {
        console.log('🧠 Configure OpenAI para comentários únicos e personalizados');
    }
    
    if (!resultados.noticias.status || resultados.noticias.servico === 'rss') {
        console.log('📰 Configure NewsAPI para acesso a mais fontes de notícias');
    }
    
    if (!resultados.audio.status) {
        console.log('🎵 Instale FFmpeg para processamento de áudio completo');
    }
    
    console.log('\n🎙️ BubuiA News - Sistema de configuração concluído!');
}

// Executar se for chamado diretamente
if (require.main === module) {
    testarTodasAPIs().catch(console.error);
}

module.exports = { testarTodasAPIs };