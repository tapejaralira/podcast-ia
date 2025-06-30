// mixagem/montarEpisodio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const AUDIOS_GERADOS_DIR = path.join(__dirname, '..', 'audios_gerados');
const ASSETS_AUDIO_DIR = path.join(__dirname, '..', 'audios');
const TEMP_DIR = path.join(__dirname, 'temp'); // Pasta temporária para os blocos
const FINAL_OUTPUT_DIR = path.join(__dirname, '..', 'episodios_finais');

// --- Função para mixar um bloco de áudio ---
function mixarBloco(blocoFalas, trilhaPath, volume, outputPath) {
    return new Promise((resolve, reject) => {
        const command = ffmpeg();
        
        // Adiciona as falas como uma entrada concatenada
        command.input(`concat:${blocoFalas.join('|')}`);
        
        // Adiciona a trilha sonora como uma segunda entrada
        if (trilhaPath) {
            command.input(trilhaPath);
            // Cria um filtro complexo para mixar os dois áudios
            // [0:a] é o áudio das falas, [1:a] é a trilha
            // O volume da trilha é ajustado e depois os dois são mixados
            command.complexFilter([
                `[1:a]volume=${volume}[bg]`,
                '[0:a][bg]amix=inputs=2:duration=first'
            ]);
        }
        
        command
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao mixar bloco: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

// --- Função para concatenar os blocos finais ---
function concatenarBlocos(listaDeBlocos, outputPath) {
    return new Promise((resolve, reject) => {
        const command = ffmpeg();
        listaDeBlocos.forEach(file => command.input(file));
        
        command
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao concatenar blocos: ${err.message}`)))
            .on('end', () => resolve())
            .mergeToFile(outputPath, TEMP_DIR);
    });
}


// --- Função Principal ---
async function montarEpisodio() {
    console.log('🎧 Bubuia News - Iniciando montagem do episódio...');

    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(AUDIOS_GERADOS_DIR, `episodio-${dataDeHoje}`);
    
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    const blocos = roteiroContent.split('---');
    let falaCounter = 0;
    const blocosDeAudioProcessados = [];

    for (let i = 0; i < blocos.length; i++) {
        const bloco = blocos[i];
        const falasDoBloco = [];
        let trilhaInfo = null;

        // Procura por vinhetas ou falas no bloco
        const linhas = bloco.split('\n').filter(l => l.trim() !== '');

        for (const linha of linhas) {
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);
            const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
            const matchTrilha = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);

            if (matchTrilha) {
                trilhaInfo = { 
                    path: path.join(ASSETS_AUDIO_DIR, 'trilhas', matchTrilha[1]),
                    volume: matchTrilha[2]
                };
            }

            if (matchAudio) {
                falasDoBloco.push(path.join(ASSETS_AUDIO_DIR, 'vinhetas', matchAudio[1]));
            } else if (matchFala) {
                falaCounter++;
                const nomeApresentador = matchFala[1].toLowerCase();
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
                falasDoBloco.push(path.join(episodioAudioDir, nomeArquivoFala));
            }
        }

        if (falasDoBloco.length > 0) {
            const outputPathBloco = path.join(TEMP_DIR, `bloco_${i}.mp3`);
            console.log(`\n🎬 Processando Bloco ${i}...`);
            if (trilhaInfo) {
                console.log(`   -> Mixando com trilha: ${path.basename(trilhaInfo.path)} a ${trilhaInfo.volume}`);
                await mixarBloco(falasDoBloco, trilhaInfo.path, trilhaInfo.volume, outputPathBloco);
            } else {
                console.log('   -> Concatenando falas/vinhetas (sem trilha).');
                await concatenarBlocos(falasDoBloco, outputPathBloco);
            }
            blocosDeAudioProcessados.push(outputPathBloco);
        }
    }

    if (blocosDeAudioProcessados.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado. Verifique o roteiro.');
        return;
    }

    // Etapa final: concatenar todos os blocos processados
    console.log('\n🎬 Montando o episódio final...');
    await fs.mkdir(FINAL_OUTPUT_DIR, { recursive: true });
    const outputFinal = path.join(FINAL_OUTPUT_DIR, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarBlocos(blocosDeAudioProcessados, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    // Limpa a pasta temporária
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
}

montarEpisodio();
