// mixagem/montarEpisodio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// **CONFIGURAÇÃO MANUAL OBRIGATÓRIA**
// Cole aqui o caminho completo para o seu arquivo 'ffmpeg.exe' da versão completa.
// Use barras normais '/' em vez de barras invertidas '\'.
const FFMPEG_PATH = 'C:/Program Files/ffmpeg/bin/ffmpeg.exe'; // <-- CONFIRME SE ESTE CAMINHO ESTÁ CORRETO

// Define o caminho do FFmpeg para a biblioteca.
if (FFMPEG_PATH && FFMPEG_PATH.includes('caminho/para')) {
    console.warn("\n⚠️ AVISO: O caminho para o FFmpeg ainda não foi configurado. Edite a constante 'FFMPEG_PATH' no script 'montarEpisodio.js'.\n");
} else if (FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
    console.log(`[FFMPEG] Usando executável em: ${FFMPEG_PATH}`);
}

const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const AUDIOS_GERADOS_DIR = path.join(__dirname, '..', 'audios_gerados');
const ASSETS_AUDIO_DIR = path.join(__dirname, '..', 'audios');
const TEMP_DIR = path.join(__dirname, 'temp');
const FINAL_OUTPUT_DIR = path.join(__dirname, '..', 'episodios_finais');

/**
 * Normaliza strings removendo acentos para consistência de nomes de arquivo.
 * @param {string} str A string a ser normalizada.
 * @returns {string} A string sem acentos.
 */
function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- Funções Auxiliares do FFmpeg ---

/**
 * Aplica efeitos de áudio usando filtros nativos do FFmpeg.
 * @param {string} inputPath - Caminho do arquivo de áudio de entrada.
 * @param {string} outputPath - Caminho onde o arquivo processado será salvo.
 * @param {string} nomeApresentador - O nome do apresentador ('taina' ou 'irai').
 * @returns {Promise<void>}
 */
function aplicarEfeitos(inputPath, outputPath, nomeApresentador) {
    return new Promise((resolve, reject) => {
        // **LÓGICA DE FILTROS CORRIGIDA E SIMPLIFICADA**
        // Usando o filtro 'compand' para compressão e 'aecho' para um reverb sutil.
        // Estes filtros são universais e devem existir em qualquer build do FFmpeg.
        const filterChain = [
            // Compressor de áudio para dar "peso" e consistência à voz.
            'compand=attacks=0:points=-80/-90|-45/-15|-27/-9|-12/-5|0/-3|20/-1.5',
            // Normalização de loudness para um nível consistente.
            'loudnorm=I=-16:TP=-1.5:LRA=11',
            // Reverb de estúdio sutil.
            'aecho=1:0.8:20:0.2'
        ];

        // Adiciona o aumento de volume para a Tainá no início da cadeia de filtros.
        if (nomeApresentador === 'taina') {
            filterChain.unshift('volume=2.8');
        }

        const filterString = filterChain.join(',');
        console.log(`   [FX] Aplicando filtros em ${nomeApresentador}: ${filterString}`);

        ffmpeg(inputPath)
            .audioFilter(filterString)
            .on('error', (err) => reject(new Error(`Erro ao aplicar efeitos em ${inputPath}: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}


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
        
        command.input(`concat:${blocoFalas.join('|')}`);
        
        if (trilhaPath) {
            command.input(trilhaPath);
            command.complexFilter([
                `[1:a]volume=${volume}[bg]`,
                '[0:a][bg]amix=inputs=2:duration=first'
            ]);
        }
        
        command
            .on('start', (commandLine) => console.log(`  [FFMPEG] Executando mixagem: ${commandLine}`))
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
            .on('start', (commandLine) => console.log(`  [FFMPEG] Executando concatenação: ${commandLine}`))
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao concatenar blocos: ${err.message}`)))
            .on('end', () => resolve())
            .mergeToFile(outputPath, TEMP_DIR);
    });
}


// --- Função Principal ---
async function montarEpisodio() {
    console.log('\n🎧 Bubuia News - Iniciando montagem do episódio...');

    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(AUDIOS_GERADOS_DIR, `episodio-${dataDeHoje}`);
    
    try {
        await fs.access(episodioAudioDir);
    } catch (error) {
        console.error(`\n❌ ERRO: A pasta de áudios do dia não foi encontrada em '${episodioAudioDir}'.`);
        console.error("   -> Certifique-se de que você executou o script 'npm run gerar-audio' antes de tentar montar o episódio.");
        return; 
    }

    await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
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
    
    const blocosPrincipais = roteiroContent.split('---');

    for (let i = 0; i < blocosPrincipais.length; i++) {
        const bloco = blocosPrincipais[i];
        console.log(`\n🎬 Processando Bloco Principal ${i}...`);

        let falasSubBloco = [];
        let trilhaInfo = null;
        let subBlocoCounter = 0;

        const linhas = bloco.split('\n').filter(l => l.trim() !== '');

        async function processarSubBloco() {
            if (falasSubBloco.length === 0) return;

            const outputPathBloco = path.join(TEMP_DIR, `bloco_${i}_sub_${subBlocoCounter}.mp3`);
            subBlocoCounter++;

            if (trilhaInfo) {
                console.log(`   -> Mixando ${falasSubBloco.length} áudio(s) com trilha: ${path.basename(trilhaInfo.path)} a ${trilhaInfo.volume}`);
                await mixarBloco(falasSubBloco, trilhaInfo.path, trilhaInfo.volume, outputPathBloco);
            } else {
                console.log(`   -> Concatenando ${falasSubBloco.length} áudio(s) (sem trilha).`);
                await concatenarBlocos(falasSubBloco, outputPathBloco);
            }
            blocosDeAudioProcessados.push(outputPathBloco);
            
            falasSubBloco = [];
        }

        for (const linha of linhas) {
            const matchFala = linha.match(/^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:/);
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            const matchTrilhaFim = linha.match(/\[TRILHA_FIM:.*?\]/);
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);

            if (matchTrilhaInicio) {
                await processarSubBloco();
                trilhaInfo = { 
                    path: path.join(ASSETS_AUDIO_DIR, 'trilhas', matchTrilhaInicio[1]),
                    volume: matchTrilhaInicio[2]
                };
            } else if (matchTrilhaFim) {
                await processarSubBloco();
                trilhaInfo = null;
            } else if (matchAudio) {
                await processarSubBloco();
                const vinhetaPath = path.join(ASSETS_AUDIO_DIR, 'vinhetas', matchAudio[1]);
                falasSubBloco.push(vinhetaPath);
                await processarSubBloco();
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
                    falasSubBloco.push(caminhoProcessado);
                } catch (err) { 
                    console.warn(`   [AVISO] Falha ao processar o arquivo de fala: ${caminhoOriginal}`);
                    console.error(`     -> Erro detalhado: ${err.message}`);
                }
            }
        }
        await processarSubBloco();
    }

    if (blocosDeAudioProcessados.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado. Verifique o roteiro e a existência dos arquivos de áudio.');
        return;
    }

    console.log('\n🎬 Montando o episódio final a partir dos segmentos processados...');
    const outputFinal = path.join(FINAL_OUTPUT_DIR, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarBlocos(blocosDeAudioProcessados, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    console.log('🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}

montarEpisodio();
