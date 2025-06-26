#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

class IntegradorElevenLabs {
    constructor() {
        require('dotenv').config();
        // Carregar config JSON se existir
        let config = {};
        try {
            config = require('./config/ia-config.json');
        } catch (e) {}
        this.apiKey = process.env.ELEVENLABS_API_KEY || config.tts?.elevenlabs?.api_key;
        this.vozes = {
            taina: config.tts?.elevenlabs?.voice_taina || process.env.ELEVENLABS_VOICE_TAINA || 'pNInz6obpgDQGcFmaJgB',
            irai: config.tts?.elevenlabs?.voice_irai || process.env.ELEVENLABS_VOICE_IRAI || 'XB0fDUnXU5powFXDhCwa'
        };
        this.baseURL = 'https://api.elevenlabs.io/v1';
    }

    async gerarAudioTTS(texto, personagem, configVoz = {}) {
        if (!this.apiKey || this.apiKey === 'sua_chave_elevenlabs_aqui') {
            console.log('⚠️ ElevenLabs não configurado, usando simulação');
            return this.simularAudio(texto, personagem);
        }

        try {
            console.log(`🗣️ Gerando áudio para ${personagem}: "${texto.substring(0, 30)}..."`);
            
            // Corrigir nome do personagem para buscar voz correta
            let personagemKey = personagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (personagemKey.includes('taina')) personagemKey = 'taina';
            else if (personagemKey.includes('irai')) personagemKey = 'irai';

            const voiceId = this.vozes[personagemKey] || this.vozes.taina;
            const audioData = await this.chamarElevenLabsAPI(texto, voiceId, configVoz);
            
            // Salvar arquivo de áudio
            const nomeArquivo = `${personagem}_${Date.now()}.mp3`;
            const caminhoCompleto = path.join(__dirname, '..', 'temp_audio', nomeArquivo);
            
            // Garantir que o diretório existe
            const dirAudio = path.dirname(caminhoCompleto);
            if (!fs.existsSync(dirAudio)) {
                fs.mkdirSync(dirAudio, { recursive: true });
            }
            
            fs.writeFileSync(caminhoCompleto, audioData);
            
            console.log(`✅ Áudio gerado: ${nomeArquivo}`);
            
            return {
                arquivo: caminhoCompleto,
                duracao: this.calcularDuracao(texto),
                personagem,
                texto: texto.substring(0, 50) + '...',
                servico: 'elevenlabs',
                existe: true
            };
            
        } catch (error) {
            console.log(`❌ Erro no ElevenLabs: ${error.message}`);
            return this.simularAudio(texto, personagem);
        }
    }

    async chamarElevenLabsAPI(texto, voiceId, configVoz) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                text: texto,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: configVoz.stability || 0.5,
                    similarity_boost: configVoz.similarity_boost || 0.8,
                    style: configVoz.style || 0.3,
                    use_speaker_boost: true,
                    // Adicionar emoção/contexto se vier
                    ...(configVoz.emocao ? { emotion: configVoz.emocao } : {}),
                    ...(configVoz.intensidade ? { intensity: configVoz.intensidade } : {})
                }
            });

            const options = {
                hostname: 'api.elevenlabs.io',
                port: 443,
                path: `/v1/text-to-speech/${voiceId}`,
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey,
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                const chunks = [];
                
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const audioBuffer = Buffer.concat(chunks);
                        resolve(audioBuffer);
                    } else {
                        reject(new Error(`ElevenLabs API erro: ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    simularAudio(texto, personagem) {
        console.log(`🔄 Simulando áudio para ${personagem}`);
        return {
            arquivo: `[SIMULADO] ${personagem}_${Date.now()}.mp3`,
            duracao: this.calcularDuracao(texto),
            personagem,
            texto: texto.substring(0, 50) + '...',
            servico: 'simulacao',
            existe: false
        };
    }

    calcularDuracao(texto) {
        // Estimativa: ~150 palavras por minuto, ~5 caracteres por palavra
        const caracteresSegundos = texto.length / (150 * 5 / 60);
        return Math.max(1, Math.round(caracteresSegundos));
    }

    async testarConexao() {
        console.log('🧪 === TESTE DO ELEVENLABS ===\n');
        
        if (!this.apiKey || this.apiKey === 'sua_chave_elevenlabs_aqui') {
            console.log('❌ Chave do ElevenLabs não configurada');
            return false;
        }

        try {
            console.log('🔍 Testando conexão com ElevenLabs...');
            
            // Teste com frase curta
            const resultado = await this.gerarAudioTTS(
                'Olá, este é um teste do BubuiA News!', 
                'taina'
            );
            
            if (resultado.existe) {
                console.log('✅ ElevenLabs funcionando perfeitamente!');
                console.log(`📂 Arquivo gerado: ${path.basename(resultado.arquivo)}`);
                console.log(`⏱️ Duração estimada: ${resultado.duracao} segundos`);
                return true;
            } else {
                console.log('⚠️ ElevenLabs não disponível, usando simulação');
                return false;
            }
            
        } catch (error) {
            console.log(`❌ Erro no teste: ${error.message}`);
            return false;
        }
    }

    async gerarEpisodioComAudio(roteiro) {
        console.log('🎙️ === GERAÇÃO DE ÁUDIO COM ELEVENLABS ===\n');
        
        const GeradorRoteiro = require('./gerarRoteiro.js');
        const gerador = new GeradorRoteiro();
        
        // Quebrar roteiro em segmentos
        const segmentos = gerador.quebrarRoteiroEmSegmentos(roteiro);
        console.log(`📝 Processando ${segmentos.length} segmentos de áudio...`);
        
        const segmentosAudio = [];
        let totalDuracao = 0;
        
        for (let i = 0; i < segmentos.length; i++) {
            const segmento = segmentos[i];
            console.log(`\n🎵 Segmento ${i + 1}/${segmentos.length}: ${segmento.personagem}`);
            
            // Gerar configuração de voz baseada no contexto
            const configVoz = this.obterConfigVozPorContexto(segmento.bloco);
            
            const audioSegmento = await this.gerarAudioTTS(
                segmento.texto, 
                segmento.personagem, 
                configVoz
            );
            
            segmentosAudio.push(audioSegmento);
            totalDuracao += audioSegmento.duracao;
            
            // Progresso
            const progresso = Math.round((i + 1) / segmentos.length * 100);
            console.log(`   📊 Progresso: ${progresso}%`);
        }
        
        const duracaoFormatada = `${Math.floor(totalDuracao / 60)}:${(totalDuracao % 60).toString().padStart(2, '0')}`;
        
        console.log(`\n✅ Áudio completo gerado!`);
        console.log(`⏱️ Duração total: ${duracaoFormatada}`);
        console.log(`🎵 Segmentos: ${segmentosAudio.length}`);
        
        return {
            segmentos: segmentosAudio,
            duracao_total: duracaoFormatada,
            duracao_segundos: totalDuracao,
            servico: 'elevenlabs',
            arquivos_gerados: segmentosAudio.filter(s => s.existe).length
        };
    }

    obterConfigVozPorContexto(bloco) {
        const configuracoes = {
            'introducao': { stability: 0.6, similarity_boost: 0.6 },
            'manchetes': { stability: 0.5, similarity_boost: 0.7 },
            'esportes': { stability: 0.4, similarity_boost: 0.8, style: 0.2 },
            'cultura': { stability: 0.3, similarity_boost: 0.9, style: 0.4 },
            'encerramento': { stability: 0.7, similarity_boost: 0.5 },
            'default': { stability: 0.5, similarity_boost: 0.6 }
        };
        
        return configuracoes[bloco] || configuracoes.default;
    }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
    const integrador = new IntegradorElevenLabs();
    integrador.testarConexao().catch(console.error);
}

module.exports = { IntegradorElevenLabs };