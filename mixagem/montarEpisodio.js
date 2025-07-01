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

/**
 * **NOVA FUNÇÃO DE MIXAGEM:** Cria um segmento musical completo com transição, pausa e falas sobre a trilha.
 */
async function mixarSegmentoMusical(segmentoInfo, outputPath) {
    console.log(`   -> Mixando segmento musical para a trilha: ${path.basename(segmentoInfo.trilha.path)}`);

    // 1. Criar o "trilho vocal" juntando a vinheta, o silêncio e as falas.
    const vocalParts = [];
    if (segmentoInfo.vinheta) {
        vocalParts.push(segmentoInfo.vinheta);
    }
    
    // Usa o caminho para o arquivo de silêncio pré-criado
    const silencioPath = path.join(ASSETS_AUDIO_DIR, 'assets', 'silencio_3s.mp3');
    vocalParts.push(silencioPath);
    vocalParts.push(...segmentoInfo.falas);

    const vocalTrackPath = path.join(TEMP_DIR, `vocal_track_${segmentoInfo.id}.mp3`);
    await concatenarBlocos(vocalParts, vocalTrackPath);

    // 2. Mixar o trilho vocal com a trilha de fundo.
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(vocalTrackPath)
            .input(segmentoInfo.trilha.path)
            .complexFilter([
                `[1:a]volume=${segmentoInfo.trilha.volume}[bg]`,
                `[0:a][bg]amix=inputs=2:duration=first`
            ])
            .on('error', (err) => reject(new Error(`Erro ao mixar segmento musical: ${err.message}`)))
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
            console.error("   -> Por favor, crie um arquivo MP3 de 3 segundos de silêncio e salve-o nesta pasta.");
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

        let partesDoBloco = [];
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
                const nomeApresentadorRaw = matchFala[1].toLowerCase();
                const nomeApresentador = normalizeString(nomeApresentadorRaw);
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
                const caminhoOriginal = path.join(episodioAudioDir, nomeArquivoFala);
                const caminhoProcessado = path.join(TEMP_DIR, `fala_${numeroFala}_${nomeApresentador}_fx.mp3`);
                
                try {
                    await fs.access(caminhoOriginal);
                    await aplicarEfeitos(caminhoOriginal, caminhoProcessado, nomeApresentador);
                    partesDoBloco.push({ type: 'fala', path: caminhoProcessado });
                } catch (err) { 
                    console.warn(`   [AVISO] Falha ao processar o arquivo de fala: ${caminhoOriginal}`);
                }
            }
        }

        // **NOVA LÓGICA DE MONTAGEM**
        let segmentoMusical = null;
        for (let j = 0; j < partesDoBloco.length; j++) {
            const parte = partesDoBloco[j];

            if (parte.type === 'trilha_inicio') {
                segmentoMusical = {
                    id: `${i}_${j}`,
                    trilha: { path: path.join(ASSETS_AUDIO_DIR, 'trilhas', parte.file), volume: parte.volume },
                    vinheta: null,
                    pausa: 3,
                    falas: []
                };
                
                if (j > 0 && partesDoBloco[j-1].type === 'vinheta' && partesDoBloco[j-1].file.includes('TRANSICAO')) {
                    segmentoMusical.vinheta = blocosDeAudioProcessados.pop();
                }
            } else if (parte.type === 'trilha_fim') {
                if (segmentoMusical) {
                    const outputPath = path.join(TEMP_DIR, `segmento_musical_${segmentoMusical.id}.mp3`);
                    await mixarSegmentoMusical(segmentoMusical, outputPath);
                    blocosDeAudioProcessados.push(outputPath);
                    segmentoMusical = null;
                }
            } else if (segmentoMusical) {
                if(parte.type === 'fala') {
                    segmentoMusical.falas.push(parte.path);
                }
            } else {
                if (parte.type === 'vinheta') {
                    blocosDeAudioProcessados.push(path.join(ASSETS_AUDIO_DIR, 'vinhetas', parte.file));
                } else if (parte.type === 'fala') {
                    blocosDeAudioProcessados.push(parte.path);
                }
            }
        }
        if (segmentoMusical) {
            const outputPath = path.join(TEMP_DIR, `segmento_musical_${segmentoMusical.id}.mp3`);
            await mixarSegmentoMusical(segmentoMusical, outputPath);
            blocosDeAudioProcessados.push(outputPath);
        }
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
