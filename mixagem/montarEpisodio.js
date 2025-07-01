// mixagem/montarEpisodio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FFMPEG_PATH = 'C:/Program Files/ffmpeg/bin/ffmpeg.exe';

if (FFMPEG_PATH && !FFMPEG_PATH.includes('caminho/para')) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
} else {
    console.warn("\n⚠️ AVISO: O caminho para o FFmpeg não foi configurado. O script pode falhar.");
}

const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const AUDIOS_GERADOS_DIR = path.join(__dirname, '..', 'audios_gerados');
const ASSETS_AUDIO_DIR = path.join(__dirname, '..', 'audios');
const TEMP_DIR = path.join(__dirname, 'temp');
const FINAL_OUTPUT_DIR = path.join(__dirname, '..', 'episodios_finais');

function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- Funções Auxiliares do FFmpeg ---

function aplicarEfeitos(inputPath, outputPath, nomeApresentador) {
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

function concatenarBlocos(listaDeBlocos, outputPath) {
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

function mixarComTrilha(blocoFalasPath, trilhaInfo, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`   -> Mixando bloco com trilha: ${path.basename(trilhaInfo.path)}`);
        ffmpeg()
            .input(blocoFalasPath)
            .input(trilhaInfo.path)
            .complexFilter([
                `[1:a]volume=${trilhaInfo.volume}[bg]`,
                `[0:a][bg]amix=inputs=2:duration=first`
            ])
            .on('error', (err) => reject(new Error(`Erro ao mixar com trilha: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

// --- Função Principal ---
async function montarEpisodio() {
    console.log('\n🎧 Bubuia News - Iniciando montagem do episódio...');

    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(AUDIOS_GERADOS_DIR, `episodio-${dataDeHoje}`);
    
    const silencio3s = path.join(ASSETS_AUDIO_DIR, 'assets', 'silencio_3s.mp3');

    try {
        await fs.access(episodioAudioDir);
        await fs.access(silencio3s);
    } catch (error) {
        if (error.code === 'ENOENT' && error.path === silencio3s) {
            console.error(`\n❌ ERRO: Arquivo de silêncio não encontrado em '${silencio3s}'.`);
        } else {
            console.error(`\n❌ ERRO: A pasta de áudios do dia não foi encontrada em '${episodioAudioDir}'.`);
        }
        return; 
    }

    await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(FINAL_OUTPUT_DIR, { recursive: true });

    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}.`);
        return;
    }

    const blocosDeAudioProcessados = [];
    let falaCounter = 0;
    const blocosPrincipais = roteiroContent.split('---');

    for (let i = 0; i < blocosPrincipais.length; i++) {
        const bloco = blocosPrincipais[i];
        if (bloco.trim().length === 0) continue;
        console.log(`\n🎬 Processando Bloco Principal ${i}...`);

        let subBlocoFalas = [];
        let trilhaInfo = null;
        let subBlocoCounter = 0;

        const linhas = bloco.split('\n').filter(l => l.trim() !== '');

        async function finalizarSubBloco() {
            if (subBlocoFalas.length === 0) return;

            const subBlocoPath = path.join(TEMP_DIR, `sub_bloco_${i}_${subBlocoCounter}.mp3`);
            await concatenarBlocos(subBlocoFalas, subBlocoPath);

            if (trilhaInfo) {
                const subBlocoMixadoPath = path.join(TEMP_DIR, `sub_bloco_mixado_${i}_${subBlocoCounter}.mp3`);
                await mixarComTrilha(subBlocoPath, trilhaInfo, subBlocoMixadoPath);
                blocosDeAudioProcessados.push(subBlocoMixadoPath);
            } else {
                blocosDeAudioProcessados.push(subBlocoPath);
            }

            subBlocoFalas = [];
            subBlocoCounter++;
        }

        for (const linha of linhas) {
            const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            const matchTrilhaFim = linha.match(/\[TRILHA_FIM:.*?\]/);
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);

            if (matchAudio) {
                await finalizarSubBloco();
                trilhaInfo = null;
                blocosDeAudioProcessados.push(path.join(ASSETS_AUDIO_DIR, 'vinhetas', matchAudio[1]));
            } else if (matchTrilhaInicio) {
                await finalizarSubBloco();
                trilhaInfo = { path: path.join(ASSETS_AUDIO_DIR, 'trilhas', matchTrilhaInicio[1]), volume: matchTrilhaInicio[2] };
                subBlocoFalas.push(silencio3s);
            } else if (matchTrilhaFim) {
                await finalizarSubBloco();
                trilhaInfo = null;
            } else if (matchFala) {
                falaCounter++;
                const nomeApresentadorRaw = matchFala[1].toLowerCase();
                const nomeApresentador = normalizeString(nomeApresentadorRaw);
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
                const caminhoOriginal = path.join(episodioAudioDir, nomeArquivoFala);
                const caminhoProcessado = path.join(TEMP_DIR, `fala_${numeroFala}_${nomeApresentador}_fx.mp3`);
                
                try {
                    await fs.access(caminhoOriginal);
                    await aplicarEfeitos(caminhoOriginal, caminhoProcessado, nomeApresentador);
                    subBlocoFalas.push(caminhoProcessado);
                } catch (err) { 
                    console.warn(`   [AVISO] Falha ao processar o arquivo de fala: ${caminhoOriginal}`);
                }
            }
        }
        await finalizarSubBloco();
    }

    if (blocosDeAudioProcessados.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado.');
        return;
    }

    console.log('\n🎬 Montando o episódio final...');
    const outputFinal = path.join(FINAL_OUTPUT_DIR, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarBlocos(blocosDeAudioProcessados, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    console.log('🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}

montarEpisodio();
