#!/usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

class MixadorAutomatico {
    constructor() {
        this.audioTempPath = path.join(__dirname, 'temp_audio');
        this.audiosPath = path.join(__dirname, 'audios');
        
        // Criar diretórios se não existirem
        [this.audioTempPath, this.audiosPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async criarEpisodioCompleto(segmentos, metadados = {}) {
        console.log('🎵 Iniciando mixagem automática...');
        
        try {
            // 1. Processar segmentos e calcular timeline
            const timeline = await this.processarSegmentos(segmentos);
            
            // 2. Executar mixagem
            const arquivoFinal = await this.mixarTimeline(timeline, metadados);
            
            // 3. Limpar arquivos temporários
            this.limparArquivosTemp();
            
            console.log(`✅ Episódio mixado: ${arquivoFinal}`);
            return arquivoFinal;
            
        } catch (error) {
            console.error('❌ Erro na mixagem:', error.message);
            throw error;
        }
    }

    async mixarAudios(segmentos, metadados = {}) {
        // Alias para compatibilidade com o sistema
        return this.criarEpisodioCompleto(segmentos, metadados);
    }

    async processarSegmentos(segmentos) {
        let timeline = [];
        let tempoAtual = 0;

        for (let i = 0; i < segmentos.length; i++) {
            const segmento = segmentos[i];
            const proximoSegmento = segmentos[i + 1];

            // Adicionar segmento de áudio
            timeline.push({
                tipo: 'audio',
                arquivo: segmento.arquivo,
                inicio: tempoAtual,
                fim: tempoAtual + segmento.duracao,
                personagem: segmento.personagem,
                bloco: segmento.bloco
            });

            tempoAtual += segmento.duracao;

            // Calcular pausa inteligente
            if (proximoSegmento) {
                const pausa = this.calcularPausa(segmento, proximoSegmento);
                
                if (pausa > 0) {
                    timeline.push({
                        tipo: 'silencio',
                        inicio: tempoAtual,
                        fim: tempoAtual + pausa,
                        duracao: pausa
                    });
                    tempoAtual += pausa;
                }
            }
        }

        return timeline;
    }

    calcularPausa(segmentoAtual, proximoSegmento) {
        let pausa = 0.5; // Base padrão

        // Análise do conteúdo atual
        if (segmentoAtual.texto) {
            if (segmentoAtual.texto.includes('?')) pausa += 0.3; // Pergunta
            if (segmentoAtual.texto.includes('!')) pausa += 0.2; // Exclamação
            if (segmentoAtual.texto.includes('...')) pausa += 0.4; // Reticências
        }

        // Mudança de bloco
        if (segmentoAtual.bloco !== proximoSegmento.bloco) {
            pausa += 0.8;
        }

        // Mudança de apresentador
        if (segmentoAtual.personagem !== proximoSegmento.personagem) {
            pausa += 0.3;
        }

        // Características por personagem
        if (segmentoAtual.personagem === 'taina') {
            // Tainá mais dramática
            if (segmentoAtual.emocao === 'excited') pausa += 0.2;
            if (segmentoAtual.texto && segmentoAtual.texto.includes('eita')) pausa += 0.3;
        }

        if (proximoSegmento.personagem === 'irai') {
            // Iraí mais pausado
            pausa += 0.2;
        }

        // Contexto específico
        if (segmentoAtual.contexto === 'tragico') pausa += 0.5;
        if (segmentoAtual.contexto === 'cultura_parintins') pausa -= 0.1; // Mais dinâmico

        return Math.max(0.2, Math.min(pausa, 2.0)); // Entre 0.2s e 2s
    }

    async mixarTimeline(timeline, metadados) {
        return new Promise((resolve, reject) => {
            const dataAtual = new Date().toISOString().split('T')[0];
            const arquivoSaida = path.join(this.audiosPath, `bubuia_news_${dataAtual}_completo.mp3`);

            // Filtrar apenas segmentos de áudio
            const segmentosAudio = timeline.filter(item => item.tipo === 'audio');
            
            if (segmentosAudio.length === 0) {
                return reject(new Error('Nenhum segmento de áudio encontrado'));
            }

            let comando = ffmpeg();

            // Adicionar todos os arquivos de entrada
            segmentosAudio.forEach(segmento => {
                if (fs.existsSync(segmento.arquivo)) {
                    comando = comando.input(segmento.arquivo);
                }
            });

            // Criar filtro complexo para posicionamento temporal
            let filtroComplexo = '';
            let inputsValidos = 0;

            segmentosAudio.forEach((segmento, index) => {
                if (fs.existsSync(segmento.arquivo)) {
                    const delayMs = Math.round(segmento.inicio * 1000);
                    filtroComplexo += `[${inputsValidos}:a]adelay=${delayMs}|${delayMs}[a${inputsValidos}];`;
                    inputsValidos++;
                }
            });

            // Mixar todos os áudios
            if (inputsValidos > 0) {
                filtroComplexo += Array.from({length: inputsValidos}, (_, i) => `[a${i}]`).join('') + 
                    `amix=inputs=${inputsValidos}:duration=longest[out]`;

                comando
                    .complexFilter(filtroComplexo)
                    .outputOptions(['-map', '[out]'])
                    .outputOptions(['-codec:a', 'libmp3lame'])
                    .outputOptions(['-b:a', '192k'])
                    .output(arquivoSaida)
                    .on('start', (commandLine) => {
                        console.log('🎵 Executando mixagem...');
                    })
                    .on('progress', (progress) => {
                        if (progress.percent) {
                            console.log(`⏳ Progresso: ${Math.round(progress.percent)}%`);
                        }
                    })
                    .on('end', () => {
                        console.log('✅ Mixagem concluída!');
                        this.adicionarMetadados(arquivoSaida, metadados);
                        resolve(arquivoSaida);
                    })
                    .on('error', (error) => {
                        console.error('❌ Erro na mixagem:', error.message);
                        reject(error);
                    })
                    .run();
            } else {
                reject(new Error('Nenhum arquivo de áudio válido encontrado'));
            }
        });
    }

    async adicionarMetadados(arquivo, metadados) {
        if (!metadados.titulo && !metadados.episodio) return;

        try {
            const arquivoTemp = arquivo.replace('.mp3', '_temp.mp3');
            
            await new Promise((resolve, reject) => {
                ffmpeg(arquivo)
                    .outputOptions([
                        '-metadata', `title=${metadados.titulo || 'BubuiA News'}`,
                        '-metadata', `artist=Tainá & Iraí`,
                        '-metadata', `album=BubuiA News Podcast`,
                        '-metadata', `genre=News & Politics`,
                        '-metadata', `comment=Notícia quente direto do igarapé`,
                        '-codec', 'copy'
                    ])
                    .output(arquivoTemp)
                    .on('end', () => {
                        fs.renameSync(arquivoTemp, arquivo);
                        console.log('📝 Metadados adicionados');
                        resolve();
                    })
                    .on('error', reject)
                    .run();
            });
        } catch (error) {
            console.log('⚠️ Erro ao adicionar metadados:', error.message);
        }
    }

    async analisarDuracaoAudio(arquivo) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(arquivo, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    const duracao = metadata.format.duration;
                    resolve(duracao);
                }
            });
        });
    }

    async normalizarVolume(segmentos) {
        console.log('🔊 Normalizando volumes...');
        
        for (let segmento of segmentos) {
            if (fs.existsSync(segmento.arquivo)) {
                const arquivoNormalizado = segmento.arquivo.replace('.mp3', '_norm.mp3');
                
                await new Promise((resolve, reject) => {
                    ffmpeg(segmento.arquivo)
                        .audioFilters('loudnorm')
                        .output(arquivoNormalizado)
                        .on('end', () => {
                            fs.renameSync(arquivoNormalizado, segmento.arquivo);
                            resolve();
                        })
                        .on('error', reject)
                        .run();
                });
            }
        }
    }

    limparArquivosTemp() {
        try {
            if (fs.existsSync(this.audioTempPath)) {
                const arquivos = fs.readdirSync(this.audioTempPath);
                arquivos.forEach(arquivo => {
                    const caminhoCompleto = path.join(this.audioTempPath, arquivo);
                    fs.unlinkSync(caminhoCompleto);
                });
            }
        } catch (error) {
            console.log('⚠️ Erro ao limpar arquivos temporários:', error.message);
        }
    }

    async criarVinhetas() {
        // Gerar vinhetas simples se não existirem
        const vinhetaAbertura = path.join(this.audiosPath, 'vinheta_abertura.mp3');
        const vinhetaEncerramento = path.join(this.audiosPath, 'vinheta_encerramento.mp3');
        
        // TODO: Implementar geração de vinhetas ou usar arquivos existentes
        return {
            abertura: vinhetaAbertura,
            encerramento: vinhetaEncerramento
        };
    }

    async adicionarVinhetas(timeline, vinhetas) {
        // Adicionar vinheta de abertura
        if (fs.existsSync(vinhetas.abertura)) {
            const duracaoAbertura = await this.analisarDuracaoAudio(vinhetas.abertura);
            
            // Mover toda timeline para frente
            timeline.forEach(item => {
                item.inicio += duracaoAbertura;
                item.fim += duracaoAbertura;
            });
            
            // Inserir vinheta no início
            timeline.unshift({
                tipo: 'audio',
                arquivo: vinhetas.abertura,
                inicio: 0,
                fim: duracaoAbertura,
                personagem: 'vinheta',
                bloco: 'abertura'
            });
        }
        
        // Adicionar vinheta de encerramento
        if (fs.existsSync(vinhetas.encerramento)) {
            const tempoFinal = Math.max(...timeline.map(item => item.fim));
            const duracaoEncerramento = await this.analisarDuracaoAudio(vinhetas.encerramento);
            
            timeline.push({
                tipo: 'audio',
                arquivo: vinhetas.encerramento,
                inicio: tempoFinal + 0.5,
                fim: tempoFinal + 0.5 + duracaoEncerramento,
                personagem: 'vinheta',
                bloco: 'encerramento'
            });
        }
        
        return timeline;
    }
}

module.exports = MixadorAutomatico;