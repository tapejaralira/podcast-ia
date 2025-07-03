// mixagem/montarEpisodio.ts
import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config.js';

// --- Configuração do FFmpeg ---
if (config.mixagem.ffmpegPath) {
    ffmpeg.setFfmpegPath(config.mixagem.ffmpegPath);
} else {
    console.warn("\n⚠️ AVISO: O caminho para o FFmpeg não foi configurado. O script pode falhar.");
    console.warn("   -> Defina a variável de ambiente FFMPEG_PATH ou edite 'src/config.ts'.");
}

const TEMP_DIR = path.join(config.paths.src, 'mixagem', 'temp');

// --- Tipos e Interfaces ---

type NomeApresentador = 'taina' | 'irai';

interface ParteDoBloco {
    type: 'vinheta' | 'trilha_inicio' | 'trilha_fim' | 'fala';
    file?: string;
    volume?: string;
    path?: string;
}

interface SegmentoMusical {
    id: string;
    trilha: { path: string; volume: string };
    vinheta: string | null;
    falas: string[];
}

// --- Funções Auxiliares ---

function normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function aplicarEfeitos(inputPath: string, outputPath: string, nomeApresentador: NomeApresentador): Promise<void> {
    return new Promise((resolve, reject) => {
        const filterChain = [
            'compand=attacks=0:points=-80/-90|-45/-15|-27/-9|-12/-5|0/-3|20/-1.5',
            'loudnorm=I=-16:TP=-1.5:LRA=11',
            'aecho=1:0.8:20:0.2'
        ];
        if (nomeApresentador === 'taina') {
            filterChain.unshift('volume=2.8');
        }
        const filterString = filterChain.join(',');
        console.log(`   [FX] Aplicando filtros em ${nomeApresentador}...`);
        ffmpeg(inputPath)
            .audioFilter(filterString)
            .on('error', (err) => reject(new Error(`Erro ao aplicar efeitos em ${inputPath}: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

function concatenarBlocos(listaDeBlocos: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (listaDeBlocos.length === 0) {
            resolve();
            return;
        }
        const command = ffmpeg();
        listaDeBlocos.forEach(file => command.input(file));
        command
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao concatenar blocos: ${err.message}`)))
            .on('end', () => resolve())
            .mergeToFile(outputPath, TEMP_DIR);
    });
}

function concatenarComCrossfade(listaDeBlocos: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (listaDeBlocos.length === 0) return resolve();
        if (listaDeBlocos.length === 1) {
            return fs.copyFile(listaDeBlocos[0], outputPath).then(resolve).catch(reject);
        }

        const command = ffmpeg();
        listaDeBlocos.forEach(file => command.input(file));

        let filter = '';
        let lastStream = '[0:a]';
        for (let i = 1; i < listaDeBlocos.length; i++) {
            const currentStream = `[${i}:a]`;
            const nextStream = `[a${i}]`;
            filter += `${lastStream}${currentStream}acrossfade=d=${config.mixagem.crossfadeDuration}${ i === listaDeBlocos.length - 1 ? '' : nextStream};`;
            lastStream = nextStream;
        }
        
        command
            .complexFilter(filter)
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao aplicar crossfade: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

async function mixarSegmentoMusical(segmentoInfo: SegmentoMusical, outputPath: string): Promise<void> {
    console.log(`   -> Mixando segmento musical para a trilha: ${path.basename(segmentoInfo.trilha.path)}`);

    const vocalParts: string[] = [];
    if (segmentoInfo.vinheta) {
        vocalParts.push(segmentoInfo.vinheta);
    }
    
    const silencioPath = path.join(config.paths.audios, 'assets', 'silencio_3s.mp3');
    vocalParts.push(silencioPath);
    vocalParts.push(...segmentoInfo.falas);
    vocalParts.push(silencioPath);

    const vocalTrackPath = path.join(TEMP_DIR, `vocal_track_${segmentoInfo.id}.mp3`);
    await concatenarBlocos(vocalParts, vocalTrackPath);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(vocalTrackPath)
            .input(segmentoInfo.trilha.path)
            .complexFilter([
                `[1:a]volume=${segmentoInfo.trilha.volume}[bg]`,
                `[0:a][bg]amix=inputs=2:duration=first,volume=2.8` 
            ])
            .on('error', (err) => reject(new Error(`Erro ao mixar segmento musical: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

// --- Função Principal ---
export async function montarEpisodio(): Promise<void> {
    console.log('\n🎧 Bubuia News - Iniciando montagem do episódio...');

    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(config.paths.roteirosDir, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(config.paths.audioOutputDir, `episodio-${dataDeHoje}`);
    
    const silencio1s = path.join(config.paths.audios, 'assets', 'silencio_1s.mp3');
    const silencio3s = path.join(config.paths.audios, 'assets', 'silencio_3s.mp3');

    try {
        await fs.access(episodioAudioDir);
        await fs.access(silencio3s);
        await fs.access(silencio1s);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
             if (error.path === silencio1s) {
                console.error(`\n❌ ERRO: Arquivo de silêncio curto não encontrado em '${silencio1s}'.`);
             } else if (error.path === silencio3s) {
                console.error(`\n❌ ERRO: Arquivo de silêncio longo não encontrado em '${silencio3s}'.`);
             } else {
                console.error(`\n❌ ERRO: A pasta de áudios do dia não foi encontrada em '${episodioAudioDir}'. Execute o script de geração de áudio primeiro.`);
             }
        }
        return; 
    }

    await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(config.paths.episodios_finais, { recursive: true });

    let roteiroContent: string;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}.`);
        return;
    }

    const blocosFinaisParaCrossfade: string[] = [];
    let falaCounter = 0;
    const blocosPrincipais = roteiroContent.split('---');

    for (let i = 0; i < blocosPrincipais.length; i++) {
        const bloco = blocosPrincipais[i];
        if (bloco.trim().length === 0) continue;
        console.log(`\n🎬 Processando e consolidando o Bloco Principal ${i}...`);

        const partesDoBloco: ParteDoBloco[] = [];
        const linhas = bloco.split('\n').filter(l => l.trim() !== '');

        for (const linha of linhas) {
            const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            const matchTrilhaFim = linha.match(/\[TRILHA_FIM:.*?\]/);
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);

            if (matchAudio) {
                partesDoBloco.push({ type: 'vinheta', file: matchAudio[1] });
            } else if (matchTrilhaInicio) {
                partesDoBloco.push({ type: 'trilha_inicio', file: matchTrilhaInicio[1], volume: matchTrilhaInicio[2] });
            } else if (matchTrilhaFim) {
                partesDoBloco.push({ type: 'trilha_fim' });
            } else if (matchFala) {
                falaCounter++;
                const nomeApresentadorRaw = matchFala[1].toLowerCase() as NomeApresentador;
                const nomeApresentador = normalizeString(nomeApresentadorRaw);
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
                const caminhoOriginal = path.join(episodioAudioDir, nomeArquivoFala);
                const caminhoProcessado = path.join(TEMP_DIR, `fala_${numeroFala}_${nomeApresentador}_fx.mp3`);
                
                try {
                    await fs.access(caminhoOriginal);
                    await aplicarEfeitos(caminhoOriginal, caminhoProcessado, nomeApresentadorRaw);
                    partesDoBloco.push({ type: 'fala', path: caminhoProcessado });
                    partesDoBloco.push({ type: 'fala', path: silencio1s });
                } catch (err) { 
                    console.warn(`   [AVISO] Falha ao processar o arquivo de fala: ${caminhoOriginal}`);
                }
            }
        }
        
        const audiosConsolidadosDoBloco: string[] = [];
        let segmentoMusical: SegmentoMusical | null = null;
        for (let j = 0; j < partesDoBloco.length; j++) {
            const parte = partesDoBloco[j];

            if (parte.type === 'trilha_inicio' && parte.file && parte.volume) {
                segmentoMusical = {
                    id: `${i}_${j}`,
                    trilha: { path: path.join(config.paths.audios, 'trilhas', parte.file), volume: parte.volume },
                    vinheta: null,
                    falas: []
                };
                const parteAnterior = partesDoBloco[j-1];
                if (j > 0 && parteAnterior.type === 'vinheta' && parteAnterior.file?.includes('TRANSICAO')) {
                    segmentoMusical.vinheta = audiosConsolidadosDoBloco.pop() || null;
                }
            } else if (parte.type === 'trilha_fim') {
                if (segmentoMusical) {
                    const outputPath = path.join(TEMP_DIR, `segmento_musical_${segmentoMusical.id}.mp3`);
                    await mixarSegmentoMusical(segmentoMusical, outputPath);
                    audiosConsolidadosDoBloco.push(outputPath);
                    segmentoMusical = null;
                }
            } else if (segmentoMusical) {
                if(parte.type === 'fala' && parte.path) {
                    segmentoMusical.falas.push(parte.path);
                }
            } else {
                if (parte.type === 'vinheta' && parte.file) {
                    audiosConsolidadosDoBloco.push(path.join(config.paths.audios, 'vinhetas', parte.file));
                } else if (parte.type === 'fala' && parte.path) {
                    audiosConsolidadosDoBloco.push(parte.path);
                }
            }
        }
        if (segmentoMusical) {
            const outputPath = path.join(TEMP_DIR, `segmento_musical_${segmentoMusical.id}.mp3`);
            await mixarSegmentoMusical(segmentoMusical, outputPath);
            audiosConsolidadosDoBloco.push(outputPath);
        }

        if (audiosConsolidadosDoBloco.length > 0) {
            const blocoConsolidadoPath = path.join(TEMP_DIR, `bloco_final_${i}.mp3`);
            await concatenarBlocos(audiosConsolidadosDoBloco, blocoConsolidadoPath);
            blocosFinaisParaCrossfade.push(blocoConsolidadoPath);
        }
    }

    if (blocosFinaisParaCrossfade.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado.');
        return;
    }

    console.log('\n🎬 Montando o episódio final com crossfade entre os blocos...');
    const outputFinal = path.join(config.paths.episodios_finais, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarComCrossfade(blocosFinaisParaCrossfade, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    console.log('🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}
