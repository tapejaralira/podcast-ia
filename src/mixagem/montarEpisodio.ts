// mixagem/montarEpisodio.ts - Versão Simplificada com Estrutura Fixa
import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config.js';
import { getDataManaus } from '../utils/timezone.js';

// --- Configuração do FFmpeg ---
if (config.mixagem.ffmpegPath) {
    ffmpeg.setFfmpegPath(config.mixagem.ffmpegPath);
} else {
    console.warn("\n⚠️ AVISO: O caminho para o FFmpeg não foi configurado. O script pode falhar.");
    console.warn("   -> Defina a variável de ambiente FFMPEG_PATH ou edite 'src/config.ts'.");
}

const TEMP_DIR = path.join(config.paths.output.cache, 'mixagem-temp');

// --- Tipos e Interfaces Simplificadas ---

type NomeApresentador = 'tainá' | 'iraí';

interface TrilhaNoticia {
    id: string;
    arquivo: string;
    volume: string;
}

// --- Funções Auxiliares ---

function aplicarEfeitos(inputPath: string, outputPath: string, nomeApresentador: NomeApresentador): Promise<void> {
    return new Promise((resolve, reject) => {
        const filterChain = [
            'compand=attacks=0:points=-80/-90|-45/-15|-27/-9|-12/-5|0/-3|20/-1.5',
            'aecho=1:0.8:20:0.2'
        ];
        if (nomeApresentador === 'tainá') {
            filterChain.unshift('volume=2.0');
        } else if (nomeApresentador === 'iraí') {
            filterChain.unshift('volume=2.0');
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

async function obterDuracaoAudio(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err: any, metadata: any) => {
            if (err) {
                reject(new Error(`Erro ao obter duração de ${audioPath}: ${err.message}`));
            } else {
                const duracao = metadata.format.duration || 0;
                resolve(duracao);
            }
        });
    });
}

function concatenarAudios(listaDeAudios: string[], outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (listaDeAudios.length === 0) {
            resolve();
            return;
        }
        const command = ffmpeg();
        listaDeAudios.forEach(file => command.input(file));
        command
            .on('error', (err) => reject(new Error(`Erro no FFmpeg ao concatenar áudios: ${err.message}`)))
            .on('end', () => resolve())
            .mergeToFile(outputPath, TEMP_DIR);
    });
}

// --- ESTRUTURA FIXA: Camada Vocal com 38 elementos ---
async function criarCamadaVocalFixa(episodioAudioDir: string, roteiro: string): Promise<string> {
    console.log('   -> Criando camada vocal fixa com estrutura predeterminada (38 elementos)...');
    
    // ⚡ Extrair todas as falas do roteiro (formato livre, mapeamento sequencial)
    console.log(`   -> Mapeamento sequencial baseado em arquivos existentes no diretório`);
    
    // ⚡ Mapear índices das falas para os elementos da camada vocal (ordem sequencial)
    const falaMap: { [key: string]: string } = {};
    const falaIndices = [
        'fala_00', 'fala_01', 'fala_02',  // Cold Open e Cardápio
        'fala_03', 'fala_04',             // Notícia 1
        'fala_05', 'fala_06',             // Notícia 2  
        'fala_07', 'fala_08',             // Notícia 3
        'fala_09', 'fala_10',             // Notícia 4
        'fala_11', 'fala_12'              // Notícia 5
    ];
    
    // ⚡ Usar ordem sequencial dos arquivos existentes
    for (const falaIndex of falaIndices) {
        falaMap[falaIndex] = `${falaIndex}_processada.mp3`;
    }
    
    const elementosVocais: string[] = [
        // 📍 Cold Open (elementos 1-6)
        // 1. silencio_3s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_3s.mp3'),
        
        // 2. fala_00 (Cold Open - parte 1)
        path.join(TEMP_DIR, falaMap['fala_00']),
        
        // 3. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 4. fala_01 (Cold Open - parte 2)
        path.join(TEMP_DIR, falaMap['fala_01']),
        
        // 5. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 📍 Cardápio (elementos 6-8)
        // 6. silencio_33s.mp3 ⚡ [CROSSFADE 1: abertura_fixa → introducao_fixa]
        path.join('assets', 'audio', 'assets', 'silencio_33s.mp3'),
        
        // 7. fala_02 (Cardápio)
        path.join(TEMP_DIR, falaMap['fala_02']),
        
        // 8. silencio_3s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_3s.mp3'),
        
        // 📍 Notícia 1 (elementos 9-14)
        // 9. virgula_sonora.mp3 ⚡ [CROSSFADE 2: introducao_fixa → trilha_noticia_1]
        path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'),
        
        // 10. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 11. fala_03 (Notícia 1 - apresentação)
        path.join(TEMP_DIR, falaMap['fala_03']),
        
        // 12. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 13. fala_04 (Notícia 1 - comentário)
        path.join(TEMP_DIR, falaMap['fala_04']),
        
        // 14. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 📍 Notícia 2 (elementos 15-20)
        // 15. virgula_sonora.mp3 ⚡ [CROSSFADE 3: trilha_noticia_1 → trilha_noticia_2]
        path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'),
        
        // 16. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 17. fala_05 (Notícia 2 - apresentação)
        path.join(TEMP_DIR, falaMap['fala_05']),
        
        // 18. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 19. fala_06 (Notícia 2 - comentário)
        path.join(TEMP_DIR, falaMap['fala_06']),
        
        // 20. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 📍 Notícia 3 (elementos 21-26)
        // 21. virgula_sonora.mp3 ⚡ [CROSSFADE 4: trilha_noticia_2 → trilha_noticia_3]
        path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'),
        
        // 22. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 23. fala_07 (Notícia 3 - apresentação)
        path.join(TEMP_DIR, falaMap['fala_07']),
        
        // 24. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 25. fala_08 (Notícia 3 - comentário)
        path.join(TEMP_DIR, falaMap['fala_08']),
        
        // 26. silencio_3s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_3s.mp3'),
        
        // 📍 Notícia 4 (elementos 27-32)
        // 27. virgula_sonora.mp3 ⚡ [CROSSFADE 5: trilha_noticia_3 → trilha_noticia_4]
        path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'),
        
        // 28. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 29. fala_09 (Notícia 4 - apresentação)
        path.join(TEMP_DIR, falaMap['fala_09']),
        
        // 30. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 31. fala_10 (Notícia 4 - comentário)
        path.join(TEMP_DIR, falaMap['fala_10']),
        
        // 32. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 📍 Notícia 5 (elementos 33-38)
        // 33. virgula_sonora.mp3 ⚡ [CROSSFADE 6: trilha_noticia_4 → trilha_noticia_5]
        path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'),
        
        // 34. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 35. fala_11 (Notícia 5 - apresentação)
        path.join(TEMP_DIR, falaMap['fala_11']),
        
        // 36. silencio_1s.mp3
        path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'),
        
        // 37. fala_12 (Notícia 5 - comentário)
        path.join(TEMP_DIR, falaMap['fala_12']),
        
        // 38. silencio_3s.mp3 ⚡ [CROSSFADE 7: trilha_noticia_5 → encerramento_fixo]
        path.join('assets', 'audio', 'assets', 'silencio_3s.mp3')
    ];
    
    console.log(`   -> Processando ${elementosVocais.length} elementos vocais...`);
    
    // Processar arquivos de fala (aplicar efeitos) se ainda não foram processados
    for (let i = 0; i <= 12; i++) {
        const numeroFala = String(i).padStart(2, '0');
        const arquivoProcessado = path.join(TEMP_DIR, `fala_${numeroFala}_processada.mp3`);
        
        // Verificar se já foi processado
        try {
            await fs.access(arquivoProcessado);
            console.log(`   -> Fala ${numeroFala} já processada`);
            continue;
        } catch {
            // Precisa processar
        }
        
        // Buscar arquivo original
        const arquivoTaina = path.join(episodioAudioDir, `fala_${numeroFala}_taina oliveira.mp3`);
        const arquivoIrai = path.join(episodioAudioDir, `fala_${numeroFala}_irai santos.mp3`);
        
        try {
            await fs.access(arquivoTaina);
            await aplicarEfeitos(arquivoTaina, arquivoProcessado, 'tainá');
            console.log(`   -> ✅ Fala ${numeroFala} (Tainá) processada`);
        } catch {
            try {
                await fs.access(arquivoIrai);
                await aplicarEfeitos(arquivoIrai, arquivoProcessado, 'iraí');
                console.log(`   -> ✅ Fala ${numeroFala} (Iraí) processada`);
            } catch {
                console.warn(`   ⚠️ Fala ${numeroFala} não encontrada, usando silêncio`);
                // Criar arquivo de silêncio de 1s como fallback
                const silencio1s = path.join('assets', 'audio', 'assets', 'silencio_1s.mp3');
                await fs.copyFile(silencio1s, arquivoProcessado);
            }
        }
    }
    
    const camadaVocalPath = path.join(TEMP_DIR, 'camada_vocal_fixa.mp3');
    await concatenarAudios(elementosVocais, camadaVocalPath);
    
    console.log(`   ✅ Camada vocal fixa criada com 38 elementos`);
    return camadaVocalPath;
}

// --- ESTRUTURA FIXA: Trilhas com timing predefinido ---
function extrairTrilhasDoRoteiro(roteiroContent: string): TrilhaNoticia[] {
    console.log('   -> Extraindo trilhas do roteiro (máximo 5 notícias)...');
    
    const trilhas: TrilhaNoticia[] = [];
    const blocos = roteiroContent.split('---');
    
    let trilhaCounter = 0;
    for (let i = 2; i < blocos.length && trilhaCounter < 5; i++) { // Pular Cold Open (0) e Cardápio (1)
        const bloco = blocos[i];
        if (bloco.trim().length === 0) continue;
        
        const linhas = bloco.split('\n');
        for (const linha of linhas) {
            const match = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            if (match) {
                trilhas.push({
                    id: `noticia_${trilhaCounter + 1}`,
                    arquivo: match[1],
                    volume: match[2]
                });
                console.log(`   -> Trilha ${trilhaCounter + 1}: ${match[1]} (${match[2]})`);
                trilhaCounter++;
                break;
            }
        }
    }
    
    // Garantir que temos exatamente 5 trilhas (usar fallback se necessário)
    while (trilhas.length < 5) {
        const fallbackId = trilhas.length + 1;
        trilhas.push({
            id: `noticia_${fallbackId}`,
            arquivo: 'trilha_noticia_generica.mp3', // arquivo de fallback
            volume: '-24dB'
        });
        console.log(`   -> Trilha ${fallbackId}: usando fallback`);
    }
    
    return trilhas.slice(0, 5); // Garantir máximo de 5
}

async function calcularTemposDeTransicaoFixos(camadaVocalPath: string): Promise<number[]> {
    console.log('   -> Calculando tempos de transição fixos baseados nas durações reais dos áudios...');
    
    // Obter duração real da camada vocal completa
    const duracaoTotalVocal = await obterDuracaoAudio(camadaVocalPath);
    console.log(`   -> Duração total da camada vocal: ${duracaoTotalVocal.toFixed(1)}s`);
    
    // Calcular durações reais dos elementos de áudio
    const duracaoSilencio3s = await obterDuracaoAudio(path.join('assets', 'audio', 'assets', 'silencio_3s.mp3'));
    const duracaoSilencio1s = await obterDuracaoAudio(path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'));
    const duracaoSilencio33s = await obterDuracaoAudio(path.join('assets', 'audio', 'assets', 'silencio_33s.mp3'));
    const duracaoVirgulaSonora = await obterDuracaoAudio(path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'));
    
    console.log(`   -> Durações reais: silencio_3s=${duracaoSilencio3s.toFixed(1)}s, silencio_1s=${duracaoSilencio1s.toFixed(1)}s, silencio_33s=${duracaoSilencio33s.toFixed(1)}s, virgula_sonora=${duracaoVirgulaSonora.toFixed(1)}s`);
    
    // Calcular durações aproximadas das falas (fallback se não conseguir ler)
    const duracoesFalas: { [key: string]: number } = {};
    
    // Obter durações reais de todas as falas processadas
    for (let i = 0; i <= 12; i++) {
        const numeroFala = String(i).padStart(2, '0');
        const falaKey = `fala_${numeroFala}`;
        try {
            duracoesFalas[falaKey] = await obterDuracaoAudio(path.join(TEMP_DIR, `${falaKey}_processada.mp3`));
            console.log(`   -> Duração real ${falaKey}: ${duracoesFalas[falaKey].toFixed(1)}s`);
        } catch (error) {
            duracoesFalas[falaKey] = 20; // fallback
            console.log(`   -> Duração estimada ${falaKey}: 20.0s (fallback)`);
        }
    }
    
    // Usar durações reais das falas principais
    const duracaoFala00 = duracoesFalas['fala_00'];
    const duracaoFala01 = duracoesFalas['fala_01'];
    const duracaoFala02 = duracoesFalas['fala_02'];
    
    // Calcular tempos baseados na estrutura vocal real (analisando crossfades)
    
    // ⚡ DEBUG: Calcular elemento por elemento para verificar
    console.log(`   -> DEBUG: Verificando durações elemento por elemento...`);
    let tempoAcumulado = 0;
    
    // Elemento 1: silencio_3s
    tempoAcumulado += duracaoSilencio3s;
    console.log(`      Elemento 1 (silencio_3s): 0.0s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 2: fala_00
    const inicioFala00 = tempoAcumulado;
    tempoAcumulado += duracaoFala00;
    console.log(`      Elemento 2 (fala_00): ${inicioFala00.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 3: silencio_1s
    const inicioSilencio1 = tempoAcumulado;
    tempoAcumulado += duracaoSilencio1s;
    console.log(`      Elemento 3 (silencio_1s): ${inicioSilencio1.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 4: fala_01
    const inicioFala01 = tempoAcumulado;
    tempoAcumulado += duracaoFala01;
    console.log(`      Elemento 4 (fala_01): ${inicioFala01.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 5: silencio_1s
    const inicioSilencio2 = tempoAcumulado;
    tempoAcumulado += duracaoSilencio1s;
    console.log(`      Elemento 5 (silencio_1s): ${inicioSilencio2.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 6: silencio_33s ⚡ [CROSSFADE 1: abertura_fixa → introducao_fixa]
    const inicioSilencio33s = tempoAcumulado; // introducao_fixa INICIA aqui
    tempoAcumulado += duracaoSilencio33s;
    console.log(`      Elemento 6 (silencio_33s - CROSSFADE 1): ${inicioSilencio33s.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 7: fala_02
    const inicioFala02 = tempoAcumulado;
    tempoAcumulado += duracaoFala02;
    console.log(`      Elemento 7 (fala_02): ${inicioFala02.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 8: silencio_3s
    const inicioSilencio3Final = tempoAcumulado;
    tempoAcumulado += duracaoSilencio3s;
    console.log(`      Elemento 8 (silencio_3s): ${inicioSilencio3Final.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    // Elemento 9: virgula_sonora ⚡ [CROSSFADE 2: introducao_fixa → trilha_noticia_1]
    const inicioVirgulaSonora9 = tempoAcumulado; // introducao_fixa TERMINA aqui, trilha_noticia_1 INICIA
    tempoAcumulado += duracaoVirgulaSonora;
    console.log(`      Elemento 9 (virgula_sonora - CROSSFADE 2): ${inicioVirgulaSonora9.toFixed(1)}s - ${tempoAcumulado.toFixed(1)}s`);
    
    const inicioNoticia1 = tempoAcumulado; // Após elemento 9
    
    // Estrutura de cada notícia: silencio_1s + fala_A + silencio_1s + fala_B + silencio_1s + virgula_sonora
    // Usar durações reais das falas em vez de estimativas
    const duracaoSegmentoNoticia1 = duracaoSilencio1s + duracoesFalas['fala_03'] + duracaoSilencio1s + duracoesFalas['fala_04'] + duracaoSilencio1s + duracaoVirgulaSonora;
    const duracaoSegmentoNoticia2 = duracaoSilencio1s + duracoesFalas['fala_05'] + duracaoSilencio1s + duracoesFalas['fala_06'] + duracaoSilencio1s + duracaoVirgulaSonora;
    const duracaoSegmentoNoticia3 = duracaoSilencio1s + duracoesFalas['fala_07'] + duracaoSilencio1s + duracoesFalas['fala_08'] + duracaoSilencio1s + duracaoSilencio3s + duracaoVirgulaSonora;
    const duracaoSegmentoNoticia4 = duracaoSilencio1s + duracoesFalas['fala_09'] + duracaoSilencio1s + duracoesFalas['fala_10'] + duracaoSilencio1s + duracaoVirgulaSonora;
    const duracaoSegmentoNoticia5 = duracaoSilencio1s + duracoesFalas['fala_11'] + duracaoSilencio1s + duracoesFalas['fala_12'] + duracaoSilencio3s; // Última sem virgula_sonora
    
    console.log(`   -> Durações reais dos segmentos: n1=${duracaoSegmentoNoticia1.toFixed(1)}s, n2=${duracaoSegmentoNoticia2.toFixed(1)}s, n3=${duracaoSegmentoNoticia3.toFixed(1)}s, n4=${duracaoSegmentoNoticia4.toFixed(1)}s, n5=${duracaoSegmentoNoticia5.toFixed(1)}s`);
    
    // Calcular tempos de início de cada trilha baseado nos crossfades
    const tempos = [
        0, // abertura_fixa inicia com elemento 1 e termina no elemento 6
        inicioSilencio33s, // introducao_fixa inicia no elemento 6 e termina no elemento 9
        inicioVirgulaSonora9, // trilha_noticia_1 inicia no elemento 9 (crossfade 2)
        inicioNoticia1 + duracaoSegmentoNoticia1, // trilha notícia 2 após notícia 1
        inicioNoticia1 + duracaoSegmentoNoticia1 + duracaoSegmentoNoticia2, // trilha notícia 3 após notícia 2
        inicioNoticia1 + duracaoSegmentoNoticia1 + duracaoSegmentoNoticia2 + duracaoSegmentoNoticia3, // trilha notícia 4 após notícia 3
        inicioNoticia1 + duracaoSegmentoNoticia1 + duracaoSegmentoNoticia2 + duracaoSegmentoNoticia3 + duracaoSegmentoNoticia4, // trilha notícia 5 após notícia 4
        inicioNoticia1 + duracaoSegmentoNoticia1 + duracaoSegmentoNoticia2 + duracaoSegmentoNoticia3 + duracaoSegmentoNoticia4 + duracaoSegmentoNoticia5 // encerramento após todas as notícias
    ];
    
    console.log('   -> Tempos de início das trilhas calculados (baseado nos crossfades):');
    console.log(`      Abertura (elementos 1-5): ${tempos[0].toFixed(1)}s`);
    console.log(`      Introdução (elementos 6-8, crossfade 1): ${tempos[1].toFixed(1)}s`);
    console.log(`      Trilha notícia 1 (elemento 9, crossfade 2): ${tempos[2].toFixed(1)}s`);
    console.log(`      Trilha notícia 2 (elemento 15, crossfade 3): ${tempos[3].toFixed(1)}s`);
    console.log(`      Trilha notícia 3 (elemento 21, crossfade 4): ${tempos[4].toFixed(1)}s`);
    console.log(`      Trilha notícia 4 (elemento 27, crossfade 5): ${tempos[5].toFixed(1)}s`);
    console.log(`      Trilha notícia 5 (elemento 33, crossfade 6): ${tempos[6].toFixed(1)}s`);
    console.log(`      Encerramento (após elemento 38, crossfade 7): ${tempos[7].toFixed(1)}s`);
    
    return tempos;
}

async function criarTrilhaContinuaComCrossfadeFixo(trilhas: TrilhaNoticia[], temposTransicao: number[]): Promise<string> {
    console.log('   -> Criando trilha contínua sequencial simples (concatenação)...');
    
    const trilhaFinalPath = path.join(TEMP_DIR, 'trilha_continua_fixa.mp3');
    
    // Calcular durações de cada segmento
    const duracaoAbertura = temposTransicao[1] - temposTransicao[0]; // até introdução
    const duracaoIntroducao = temposTransicao[2] - temposTransicao[1]; // até notícia 1
    const duracaoNoticia1 = temposTransicao[3] - temposTransicao[2]; // até notícia 2
    const duracaoNoticia2 = temposTransicao[4] - temposTransicao[3]; // até notícia 3
    const duracaoNoticia3 = temposTransicao[5] - temposTransicao[4]; // até notícia 4
    const duracaoNoticia4 = temposTransicao[6] - temposTransicao[5]; // até notícia 5
    const duracaoNoticia5 = temposTransicao[7] - temposTransicao[6]; // até encerramento
    const duracaoEncerramento = 30; // 30 segundos para encerramento
    
    console.log(`   -> Durações calculadas: abertura=${duracaoAbertura.toFixed(1)}s, intro=${duracaoIntroducao.toFixed(1)}s, n1=${duracaoNoticia1.toFixed(1)}s, n2=${duracaoNoticia2.toFixed(1)}s, n3=${duracaoNoticia3.toFixed(1)}s, n4=${duracaoNoticia4.toFixed(1)}s, n5=${duracaoNoticia5.toFixed(1)}s`);
    console.log(`   -> SEQUÊNCIA CROSSFADES: abertura(elementos 1-5) → intro(elementos 6-9) → notícia1(elemento 10+)...`);
    console.log(`   -> ⚡ DEBUG CRÍTICO: introducao_fixa deveria começar aos ${temposTransicao[1].toFixed(1)}s e durar ${duracaoIntroducao.toFixed(1)}s`);
    
    // Criar segmentos individuais primeiro
    const segmentos: string[] = [];
    
    // 1. Segmento abertura
    const segAbertura = path.join(TEMP_DIR, 'seg_abertura.mp3');
    console.log(`   -> Criando segmento abertura: ${duracaoAbertura.toFixed(1)}s`);
    await criarSegmentoTrilha(path.join('assets', 'audio', 'trilhas', 'abertura_fixa.mp3'), duracaoAbertura, '-24dB', segAbertura);
    segmentos.push(segAbertura);
    
    // 2. Segmento introdução (volume +1dB)
    const segIntroducao = path.join(TEMP_DIR, 'seg_introducao.mp3');
    console.log(`   -> ⚡ Criando segmento introdução: ${duracaoIntroducao.toFixed(1)}s (posição na concatenação: após ${duracaoAbertura.toFixed(1)}s)`);
    await criarSegmentoTrilha(path.join('assets', 'audio', 'trilhas', 'introducao_fixa.mp3'), duracaoIntroducao, '+1dB', segIntroducao);
    segmentos.push(segIntroducao);
    
    // 3-7. Segmentos das notícias
    const duracoes = [duracaoNoticia1, duracaoNoticia2, duracaoNoticia3, duracaoNoticia4, duracaoNoticia5];
    for (let i = 0; i < trilhas.length; i++) {
        const segNoticia = path.join(TEMP_DIR, `seg_noticia_${i + 1}.mp3`);
        await criarSegmentoTrilha(
            path.join('assets', 'audio', 'trilhas', trilhas[i].arquivo), 
            duracoes[i], 
            trilhas[i].volume, 
            segNoticia
        );
        segmentos.push(segNoticia);
    }
    
    // 8. Segmento encerramento
    const segEncerramento = path.join(TEMP_DIR, 'seg_encerramento.mp3');
    await criarSegmentoTrilha(path.join('assets', 'audio', 'trilhas', 'encerramento_fixo.mp3'), duracaoEncerramento, '0dB', segEncerramento);
    segmentos.push(segEncerramento);
    
    // Concatenar todos os segmentos sequencialmente
    console.log(`   -> Concatenando ${segmentos.length} segmentos em sequência...`);
    await concatenarAudios(segmentos, trilhaFinalPath);
    
    return trilhaFinalPath;
}

// Nova função auxiliar para criar segmentos de trilha com duração exata e fade out
async function criarSegmentoTrilha(inputPath: string, duracao: number, volume: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`      -> Criando segmento: ${inputPath} com duração ${duracao.toFixed(1)}s + fade out 6s`);
        
        // Calcular quando o fade out deve começar (6 segundos antes do fim)
        const fadeStartTime = Math.max(0, duracao - 6);
        
        ffmpeg()
            .input(inputPath)
            .audioFilters([
                `volume=${volume}`,
                `atrim=duration=${duracao}`, // Cortar na duração exata
                `afade=t=out:st=${fadeStartTime}:d=6` // Fade out de 6s
            ])
            .audioChannels(2) // Garantir estéreo
            .on('error', (err) => reject(new Error(`Erro ao criar segmento ${outputPath}: ${err.message}`)))
            .on('end', async () => {
                // Verificar duração real do segmento criado
                try {
                    const duracaoReal = await obterDuracaoAudio(outputPath);
                    console.log(`      ✅ Segmento criado: ${outputPath} - duração real: ${duracaoReal.toFixed(1)}s com fade out`);
                } catch (error) {
                    console.log(`      ✅ Segmento criado: ${outputPath} com fade out`);
                }
                resolve();
            })
            .save(outputPath);
    });
}

async function mixarCamadaVocalComTrilhaContinua(vocaisPath: string, trilhaPath: string, outputPath: string): Promise<void> {
    console.log('   -> Mixando camada vocal com trilha contínua (simples)...');
    
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(vocaisPath)
            .input(trilhaPath)
            .complexFilter([
                '[0:a][1:a]amix=inputs=2:duration=longest,volume=2.8'
            ])
            .audioChannels(2) // Garantir estéreo
            .on('error', (err) => reject(new Error(`Erro ao mixar vocal com trilha: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

// --- Função Principal Simplificada ---
/**
 * @ai-purpose Monta episódio final com estrutura fixa de 13 áudios e duas camadas sincronizadas
 * @ai-architecture Camada vocal fixa (38 elementos) + Camada trilha (8 elementos com crossfade)
 * @ai-simplification Reduz dependência do roteiro para apenas extrair trilhas das 5 notícias
 */
export async function montarEpisodio(): Promise<void> {
    console.log('\n🎧 Bubuia News - Montagem Simplificada (Estrutura Fixa)...');

    const dataDeHoje = getDataManaus();
    console.log(`📅 Data de Manaus: ${dataDeHoje}`);
    
    const roteiroFilename = path.join(config.paths.roteiros, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(config.paths.output.audio, `episodio-${dataDeHoje}`);
    
    // Verificação de arquivos necessários
    try {
        await fs.access(episodioAudioDir);
        await fs.access(path.join('assets', 'audio', 'assets', 'silencio_1s.mp3'));
        await fs.access(path.join('assets', 'audio', 'assets', 'silencio_3s.mp3'));
        await fs.access(path.join('assets', 'audio', 'assets', 'silencio_33s.mp3'));
        await fs.access(path.join('assets', 'audio', 'assets', 'virgula_sonora.mp3'));
    } catch (error: any) {
        console.error(`\n❌ ERRO: Arquivos necessários não encontrados.`);
        console.error(`   -> Verifique: ${error.path}`);
        return; 
    }

    // Setup
    await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.mkdir(config.paths.output.episodes, { recursive: true });

    // Ler roteiro apenas para extrair trilhas
    let roteiroContent: string;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`❌ Erro ao ler roteiro: ${roteiroFilename}`);
        return;
    }

    console.log('\n🎤 FASE 1: Criando Camada Vocal Fixa...');
    const camadaVocalPath = await criarCamadaVocalFixa(episodioAudioDir, roteiroContent);
    
    console.log('\n🎵 FASE 2: Criando Camada de Trilhas...');
    const trilhas = extrairTrilhasDoRoteiro(roteiroContent);
    const temposTransicao = await calcularTemposDeTransicaoFixos(camadaVocalPath);
    const trilhaContinuaPath = await criarTrilhaContinuaComCrossfadeFixo(trilhas, temposTransicao);
    
    console.log('\n🎧 FASE 3: Mixagem Final das Duas Camadas...');
    const outputFinal = path.join(config.paths.output.episodes, `bubuia_news_${dataDeHoje}.mp3`);
    await mixarCamadaVocalComTrilhaContinua(camadaVocalPath, trilhaContinuaPath, outputFinal);

    console.log(`\n✅ Episódio finalizado com estrutura simplificada!`);
    console.log(`   -> Camada vocal: 38 elementos fixos`);
    console.log(`   -> Camada trilha: 8 elementos com crossfade`);
    console.log(`   -> Arquivo final: ${outputFinal}`);
    
    // DEBUG: Verificar duração final vs esperada
    try {
        const duracaoFinal = await obterDuracaoAudio(outputFinal);
        const duracaoTrilha = await obterDuracaoAudio(trilhaContinuaPath);
        console.log(`\n🔍 DEBUG DURAÇÃO:`);
        console.log(`   -> Duração final mixada: ${duracaoFinal.toFixed(1)}s`);
        console.log(`   -> Duração trilha concatenada: ${duracaoTrilha.toFixed(1)}s`);
        console.log(`   -> Encerramento deveria começar aos 519.9s`);
    } catch (error) {
        console.log(`\n⚠️ Erro ao verificar durações: ${error}`);
    }
    
    console.log('\n🧹 Limpando arquivos temporários...');
    // Comentando limpeza para debug
    // await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}

// Chamada direta se executado como script principal
if (
    import.meta.url.includes('montarEpisodio.ts') ||
    process.argv[1]?.includes('montarEpisodio')
) {
    console.log('🚀 Executando montarEpisodio simplificado...');
    montarEpisodio()
        .then(() => console.log('✅ Script concluído com sucesso'))
        .catch(error => {
            console.error('❌ Erro no script:', error);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}
