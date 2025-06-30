// mixagem/montarEpisodio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos dos diretórios
const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const AUDIOS_GERADOS_DIR = path.join(__dirname, '..', 'audios_gerados');
const ASSETS_AUDIO_DIR = path.join(__dirname, '..', 'audios');
const FINAL_OUTPUT_DIR = path.join(__dirname, '..', 'episodios_finais');

// --- Função Principal ---
async function montarEpisodio() {
    console.log('🎧 Bubuia News - Iniciando montagem do episódio...');

    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(AUDIOS_GERADOS_DIR, `episodio-${dataDeHoje}`);
    
    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    // 1. Criar a "playlist" de áudios principais
    const playlist = [];
    let falaCounter = 1;

    const linhas = roteiroContent.split('\n');

    for (const linha of linhas) {
        // Encontra marcadores de áudio (vinhetas)
        const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);
        if (matchAudio) {
            const nomeVinheta = matchAudio[1];
            // Assumimos que as vinhetas estão em audios/vinhetas/
            const caminhoVinheta = path.join(ASSETS_AUDIO_DIR, 'vinhetas', nomeVinheta);
            playlist.push(caminhoVinheta);
            console.log(`  -> Adicionando à playlist: Vinheta (${nomeVinheta})`);
            continue;
        }

        // Encontra falas dos apresentadores
        const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
        if (matchFala) {
            const nomeApresentador = matchFala[1].toLowerCase();
            const numeroFala = String(falaCounter).padStart(2, '0');
            const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
            const caminhoFala = path.join(episodioAudioDir, nomeArquivoFala);
            playlist.push(caminhoFala);
            console.log(`  -> Adicionando à playlist: Fala ${falaCounter} (${nomeApresentador})`);
            falaCounter++;
        }
    }

    if (playlist.length === 0) {
        console.error('❌ Nenhuma fala ou vinheta encontrada para montar o episódio.');
        return;
    }

    // 2. Usar FFmpeg para juntar os áudios
    console.log('\n🎬 Iniciando a concatenação com FFmpeg...');
    await fs.mkdir(FINAL_OUTPUT_DIR, { recursive: true });
    const outputFinal = path.join(FINAL_OUTPUT_DIR, `bubuia_news_${dataDeHoje}.mp3`);

    const command = ffmpeg();
    playlist.forEach(file => {
        command.input(file);
    });

    command
        .on('error', (err) => {
            console.error('❌ Erro no FFmpeg:', err.message);
        })
        .on('end', () => {
            console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
        })
        .mergeToFile(outputFinal, FINAL_OUTPUT_DIR);
}

montarEpisodio();
