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

// --- Funções Auxiliares do FFmpeg ---

/**
 * Mixa um conjunto de arquivos de fala com uma trilha sonora de fundo.
 * @param {string[]} blocoFalas - Array de caminhos para os arquivos de áudio das falas.
 * @param {string} trilhaPath - Caminho para o arquivo da trilha sonora.
 * @param {string} volume - Volume da trilha sonora (ex: '-20dB' ou '0.1').
 * @param {string} outputPath - Caminho do arquivo de saída.
 * @returns {Promise<void>}
 */
function mixarBloco(blocoFalas, trilhaPath, volume, outputPath) {
    return new Promise((resolve, reject) => {
        if (blocoFalas.length === 0) {
            resolve();
            return;
        }

        const command = ffmpeg();
        
        // Adiciona as falas como uma entrada concatenada
        command.input(`concat:${blocoFalas.join('|')}`);
        
        // Adiciona a trilha sonora como uma segunda entrada, se fornecida
        if (trilhaPath) {
            command.input(trilhaPath);
            // Cria um filtro complexo para mixar os dois áudios
            // [0:a] é o áudio das falas, [1:a] é a trilha
            // O volume da trilha é ajustado e depois os dois são mixados
            // 'amix' mixa os áudios. 'duration=first' faz a mixagem durar o tempo do primeiro input (as falas).
            command.complexFilter([
                `[1:a]volume=${volume}[bg]`,
                '[0:a][bg]amix=inputs=2:duration=first'
            ]);
        }
        
        command
            .on('start', (commandLine) => console.log(`  [FFMPEG] Executando: ${commandLine}`))
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao mixar bloco: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

/**
 * Concatena uma lista de arquivos de áudio em um único arquivo.
 * @param {string[]} listaDeBlocos - Array de caminhos para os arquivos de áudio a serem concatenados.
 * @param {string} outputPath - Caminho do arquivo de saída final.
 * @returns {Promise<void>}
 */
function concatenarBlocos(listaDeBlocos, outputPath) {
    return new Promise((resolve, reject) => {
        if (listaDeBlocos.length === 0) {
            resolve();
            return;
        }
        const command = ffmpeg();
        listaDeBlocos.forEach(file => command.input(file));
        
        command
            .on('start', (commandLine) => console.log(`  [FFMPEG] Executando: ${commandLine}`))
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
    
    // Garante que a pasta temporária e de saída existam
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(FINAL_OUTPUT_DIR, { recursive: true });
    
    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    const blocosDeAudioProcessados = [];
    let falaCounter = 0;
    
    // Divide o roteiro em blocos principais (separados por '---')
    const blocosPrincipais = roteiroContent.split('---');

    for (let i = 0; i < blocosPrincipais.length; i++) {
        const bloco = blocosPrincipais[i];
        console.log(`\n🎬 Processando Bloco Principal ${i}...`);

        let falasSubBloco = [];
        let trilhaInfo = null;
        let subBlocoCounter = 0;

        const linhas = bloco.split('\n').filter(l => l.trim() !== '');

        // Função auxiliar para processar e salvar um sub-bloco de áudio
        async function processarSubBloco() {
            if (falasSubBloco.length === 0) return;

            const outputPathBloco = path.join(TEMP_DIR, `bloco_${i}_sub_${subBlocoCounter}.mp3`);
            subBlocoCounter++;

            if (trilhaInfo) {
                console.log(`   -> Mixando ${falasSubBloco.length} áudio(s) com trilha: ${path.basename(trilhaInfo.path)} a ${trilhaInfo.volume}`);
                await mixarBloco(falasSubBloco, trilhaInfo.path, trilhaInfo.volume, outputPathBloco);
            } else {
                console.log(`   -> Concatenando ${falasSubBloco.length} áudio(s) (sem trilha).`);
                // Usamos a função de concatenar para um único arquivo também, funciona como uma cópia.
                await concatenarBlocos(falasSubBloco, outputPathBloco);
            }
            blocosDeAudioProcessados.push(outputPathBloco);
            
            // Limpa para o próximo sub-bloco
            falasSubBloco = [];
            // Não reseta a trilha aqui, ela só é resetada no [TRILHA_FIM]
        }

        for (const linha of linhas) {
            const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            const matchTrilhaFim = linha.match(/\[TRILHA_FIM:.*?\]/);
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);

            if (matchTrilhaInicio) {
                await processarSubBloco(); // Processa o que estava antes da trilha
                trilhaInfo = { 
                    path: path.join(ASSETS_AUDIO_DIR, 'trilhas', matchTrilhaInicio[1]),
                    volume: matchTrilhaInicio[2]
                };
            } else if (matchTrilhaFim) {
                await processarSubBloco(); // Processa o conteúdo que estava com a trilha
                trilhaInfo = null; // Finaliza a trilha para os próximos áudios
            } else if (matchAudio) {
                await processarSubBloco(); // Processa o que veio antes da vinheta
                const vinhetaPath = path.join(ASSETS_AUDIO_DIR, 'vinhetas', matchAudio[1]);
                falasSubBloco.push(vinhetaPath);
                await processarSubBloco(); // Processa a vinheta como um bloco isolado
            } else if (matchFala) {
                falaCounter++;
                const nomeApresentador = matchFala[1].toLowerCase();
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeApresentador}.mp3`;
                const caminhoFala = path.join(episodioAudioDir, nomeArquivoFala);
                
                try {
                    await fs.access(caminhoFala); // Verifica se o arquivo de fala existe
                    falasSubBloco.push(caminhoFala);
                } catch {
                    console.warn(`   [AVISO] Arquivo de fala não encontrado, pulando: ${nomeArquivoFala}`);
                }
            }
        }
        await processarSubBloco(); // Processa qualquer áudio restante no final do bloco principal
    }

    if (blocosDeAudioProcessados.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado. Verifique o roteiro e a existência dos arquivos de áudio.');
        return;
    }

    // Etapa final: concatenar todos os sub-blocos processados
    console.log('\n🎬 Montando o episódio final a partir dos segmentos processados...');
    const outputFinal = path.join(FINAL_OUTPUT_DIR, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarBlocos(blocosDeAudioProcessados, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    // Limpa a pasta temporária
    console.log('🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}

montarEpisodio();
