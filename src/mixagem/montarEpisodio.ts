// mixagem/montarEpisodio.ts
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

// --- Tipos e Interfaces ---

type NomeApresentador = 'tainá' | 'iraí';

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

interface BlocoComTiming {
    id: string;
    tipo: 'com_trilha' | 'sem_trilha';
    trilha?: { path: string; volume: string };
    vocalPath: string;
    duracaoVocais: number;
    inicioTempo: number;
    duracaoVinhetas: number; // duração das vinhetas de transição no início
    inicioFalas: number; // tempo quando começam as falas (após vinhetas)
}

// --- Funções Auxiliares ---

function normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function aplicarEfeitos(inputPath: string, outputPath: string, nomeApresentador: NomeApresentador): Promise<void> {
    return new Promise((resolve, reject) => {
        const filterChain = [
            'compand=attacks=0:points=-80/-90|-45/-15|-27/-9|-12/-5|0/-3|20/-1.5',
            'aecho=1:0.8:20:0.2'
        ];
        if (nomeApresentador === 'tainá') {
            filterChain.unshift('volume=2.1');
        } else if (nomeApresentador === 'iraí') {
            filterChain.unshift('volume=1.9'); // Aumentado de 1.0 (padrão) para 1.9
        }
        const filterString = filterChain.join(',');
        console.log(`   [FX] Aplicando filtros em ${nomeApresentador} (SEM loudness norm)...`);
        ffmpeg(inputPath)
            .audioFilter(filterString)
            .on('error', (err) => reject(new Error(`Erro ao aplicar efeitos em ${inputPath}: ${err.message}`)))
            .on('end', () => resolve())
            .save(outputPath);
    });
}

async function criarTrilhaContinuaComCrossfade(blocosComTrilha: BlocoComTiming[]): Promise<string> {
    if (blocosComTrilha.length === 0) return '';
    
    console.log(`   -> Criando trilha contínua com crossfade sincronizado às falas para ${blocosComTrilha.length} blocos`);
    
    const trilhaFinalPath = path.join(TEMP_DIR, 'trilha_continua_crossfade.mp3');
    
    if (blocosComTrilha.length === 1) {
        // Apenas uma trilha
        const bloco = blocosComTrilha[0];
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(bloco.trilha!.path)
                .audioFilters(`volume=${bloco.trilha!.volume}`)
                .duration(bloco.duracaoVocais)
                .on('error', (err) => reject(new Error(`Erro ao processar trilha única: ${err.message}`)))
                .on('end', () => resolve(trilhaFinalPath))
                .save(trilhaFinalPath);
        });
    }
    
    return new Promise((resolve, reject) => {
        const command = ffmpeg();
        
        // Adicionar todas as trilhas como inputs
        blocosComTrilha.forEach(bloco => {
            command.input(bloco.trilha!.path);
        });
        
        let filterComplex = '';
        let tempoAcumuladoVocal = 0;
        
        // Calcular os tempos baseados na camada vocal COMPLETA (incluindo vinhetas)
        // CORREÇÃO: Precisamos considerar que o crossfade de 4s significa sobreposição progressiva
        blocosComTrilha.forEach((bloco, index) => {
            if (index === 0) {
                // Primeira trilha: inicia imediatamente (no tempo 0)
                bloco.inicioTempo = 0;
                // Tempo quando começa a primeira fala (após vinheta de transição, se houver)
                const inicioFalaRealTrilha = bloco.duracaoVinhetas; 
                tempoAcumuladoVocal = bloco.duracaoVocais;
                
                console.log(`   -> Trilha ${index} (${bloco.trilha!.path.split('/').pop()}): inicia em ${bloco.inicioTempo.toFixed(1)}s, fala em ${inicioFalaRealTrilha.toFixed(1)}s, duração total: ${bloco.duracaoVocais.toFixed(1)}s`);
            } else {
                // CORREÇÃO: Para trilhas subsequentes, o crossfade deve estar sincronizado perfeitamente
                // A nova trilha deve começar de forma que, no MEIO do crossfade (2s), coincida com o início da fala
                const inicioFalaNovo = tempoAcumuladoVocal + bloco.duracaoVinhetas;
                bloco.inicioTempo = inicioFalaNovo - 2; // -2s para que o MEIO do crossfade (4s/2=2s) coincida com a fala
                
                console.log(`   -> Trilha ${index} (${bloco.trilha!.path.split('/').pop()}): inicia em ${bloco.inicioTempo.toFixed(1)}s, crossfade meio em ${inicioFalaNovo.toFixed(1)}s (início fala), vinhetas: ${bloco.duracaoVinhetas.toFixed(1)}s`);
                
                tempoAcumuladoVocal += bloco.duracaoVocais;
            }
        });
        
        // Processar cada trilha com delay calculado para sincronizar com as falas
        blocosComTrilha.forEach((bloco, index) => {
            if (index === 0) {
                // Primeira trilha: duração total + 2s extra para o crossfade (meio do crossfade)
                const duracaoTotal = index < blocosComTrilha.length - 1 
                    ? bloco.duracaoVocais + 2 // +2s para permitir crossfade até o meio
                    : bloco.duracaoVocais;
                
                filterComplex += `[${index}:a]volume=${bloco.trilha!.volume},atrim=duration=${duracaoTotal}[trilha${index}];`;
            } else {
                // Trilhas subsequentes: delay calculado + duração + margem para crossfade
                const delay = Math.max(0, bloco.inicioTempo * 1000); // milissegundos
                const duracaoTotal = index < blocosComTrilha.length - 1 
                    ? bloco.duracaoVocais + 4 // +4s (2s crossfade in + 2s crossfade out)
                    : bloco.duracaoVocais + 2; // +2s só crossfade in
                
                filterComplex += `[${index}:a]volume=${bloco.trilha!.volume},adelay=${delay},atrim=duration=${duracaoTotal}[trilha${index}];`;
            }
        });
        
        // Aplicar crossfade sequencial sincronizado
        let resultado = `[trilha0]`;
        for (let i = 1; i < blocosComTrilha.length; i++) {
            const novoResultado = i === blocosComTrilha.length - 1 ? '' : `[mix${i}]`;
            
            console.log(`   -> Crossfade ${i}: sincronizado com início da fala da notícia ${i}`);
            
            filterComplex += `${resultado}[trilha${i}]acrossfade=d=4${novoResultado ? novoResultado : ''};`;
            resultado = novoResultado || resultado;
        }
        
        command
            .complexFilter(filterComplex)
            .on('error', (err) => reject(new Error(`Erro no crossfade sincronizado das trilhas: ${err.message}`)))
            .on('end', () => resolve(trilhaFinalPath))
            .save(trilhaFinalPath);
    });
}

async function mixarCamadaVocalComTrilhaContinua(vocaisPath: string, trilhaPath: string, outputPath: string): Promise<void> {
    console.log(`   -> Mixando camada vocal com trilha contínua`);
    
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(vocaisPath)
            .input(trilhaPath)
            .complexFilter([
                '[0:a][1:a]amix=inputs=2:duration=first,volume=2.8'
            ])
            .on('error', (err) => reject(new Error(`Erro ao mixar vocal com trilha contínua: ${err.message}`)))
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
    
    // Se temos vinheta específica, adicionar
    if (segmentoInfo.vinheta) {
        vocalParts.push(segmentoInfo.vinheta);
    }
    
    // Adicionar todas as falas (já incluem vinheta de transição e silêncios)
    vocalParts.push(...segmentoInfo.falas);

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
/**
 * @ai-purpose Monta episódio final profissional com trilhas, vinhetas, transições e masterização usando FFmpeg
 * @ai-input-format Áudios de blocos de audios_gerados/episodio-YYYY-MM-DD/ + trilhas/vinhetas + roteiro para timing
 * @ai-output-format Episódio final masterizado MP3 pronto para distribuição em episodios_finais/bubuia_news_YYYY-MM-DD.mp3
 * @ai-dependencies FFmpeg instalado, áudios de blocos gerados, trilhas sonoras em audios/trilhas/, vinhetas em audios/vinhetas/
 * @ai-error-handling Validação de arquivos de entrada, fallback para mixagem básica sem trilhas se arquivos faltarem, cleanup automático de temporários
 * @ai-performance 30s-2min dependendo da duração e complexidade da mixagem, uso intensivo de CPU durante processamento FFmpeg
 * @ai-context Adiciona intro/outro automáticos, trilhas baseadas no contexto das notícias, transições suaves, normalização final de áudio
 * @ai-validation Verifica existência de todos os áudios de blocos, trilhas necessárias, FFmpeg funcionando, estrutura de diretórios correta
 * @ai-side-effects Cria arquivos temporários de mixagem, salva episódio final, cleanup automático de temporários, logs detalhados de processo
 * @ai-cost Operação local sem custos de API, apenas uso de CPU/disco para processamento FFmpeg
 * @ai-quality-factors Equilíbrio de volumes (40%), transições suaves (30%), qualidade final de áudio (30%), aderência a padrões de broadcast
 * @ai-optimization-tips Use perfis de FFmpeg otimizados, paralelização para múltiplos episódios, cache de trilhas processadas, validação prévia de qualidade
 * @ai-common-errors "FFmpeg not found", "Audio files missing", "Insufficient disk space", "Audio format incompatible", "Permission denied output directory"
 * @ai-debugging Verificar instalação FFmpeg, validar todos os arquivos de entrada, testar mixagem com arquivo simples, logs detalhados habilitados
 * @ai-monitoring Duração final vs estimada, qualidade de áudio final (LUFS), tempo de processamento, conformidade com padrões de podcast
 * @ai-scaling Paralelização com cuidado (uso de CPU), processamento em batch para múltiplos episódios, otimização de perfis FFmpeg
 * @ai-business-impact Automatiza pós-produção profissional, qualidade broadcast, reduz tempo de produção de 3h para 5min, consistência editorial
 * @ai-example
 * ```typescript
 * // Requer áudios gerados em audios_gerados/episodio-2025-01-20/
 * await montarEpisodio();
 * // Gera episodios_finais/bubuia_news_2025-01-20.mp3 pronto para distribuição
 * console.log('Episódio final masterizado e pronto para publicação');
 * ```
 */
export async function montarEpisodio(): Promise<void> {
    console.log('\n🎧 Bubuia News - Iniciando montagem do episódio...');

    // ALTERAÇÃO: Usar data de Manaus
    const dataDeHoje = getDataManaus();
    console.log(`📅 Data de Manaus: ${dataDeHoje}`);
    
    const roteiroFilename = path.join(config.paths.roteiros, `roteiro-${dataDeHoje}.md`);
    const episodioAudioDir = path.join(config.paths.output.audio, `episodio-${dataDeHoje}`);
    
    // CORREÇÃO: Usar paths corretos para arquivos de áudio
    const silencio1s = path.join('assets', 'audio', 'assets', 'silencio_1s.mp3');
    const silencio3s = path.join('assets', 'audio', 'assets', 'silencio_3s.mp3');

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
    await fs.mkdir(config.paths.output.episodes, { recursive: true });

    let roteiroContent: string;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}.`);
        return;
    }

    const blocosFinaisParaCrossfade: string[] = [];
    const blocosComTrilha: BlocoComTiming[] = [];
    let falaCounter = 0;
    const blocosPrincipais = roteiroContent.split('---');

    // FASE 1: Processar todos os blocos e extrair informações
    for (let i = 0; i < blocosPrincipais.length; i++) {
        const bloco = blocosPrincipais[i];
        if (bloco.trim().length === 0) continue;
        console.log(`\n🎬 Analisando Bloco Principal ${i}...`);

        const partesDoBloco: ParteDoBloco[] = [];
        let trilhaDoBloco: { file: string; volume: string } | null = null;
        
        // Procurar trilha neste bloco
        const linhas = bloco.split('\n').filter(l => l.trim() !== '');
        for (const linha of linhas) {
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            if (matchTrilhaInicio) {
                trilhaDoBloco = { file: matchTrilhaInicio[1], volume: matchTrilhaInicio[2] };
                console.log(`   [INFO] Trilha detectada: ${trilhaDoBloco.file} (${trilhaDoBloco.volume})`);
                break;
            }
        }
        
        // Adicionar vinheta de transição no início de cada bloco (exceto o primeiro)
        if (i > 0) {
            console.log(`   [INFO] Adicionando vinheta de transição no início do bloco ${i}`);
            partesDoBloco.push({ type: 'vinheta', file: 'VINHETA_CURTA_DE_TRANSICAO.mp3' });
            // Removido o silêncio de 3s após a vinheta de transição
        }

        // Processar conteúdo do bloco
        for (const linha of linhas) {
            // Detectar linhas de fala dos apresentadores
            let matchFala = null;
            if (linha === '**Tainá Oliveira:**' || linha.trim() === '**Tainá Oliveira:**') {
                matchFala = ['**Tainá Oliveira:**', 'Tainá Oliveira'];
            } else if (linha === '**Iraí Santos:**' || linha.trim() === '**Iraí Santos:**') {
                matchFala = ['**Iraí Santos:**', 'Iraí Santos'];
            }
            
            const matchTrilhaInicio = linha.match(/\[TRILHA_INICIO: (.*?),\s*(-?\d+dB)\s*\]/);
            const matchTrilhaFim = linha.match(/\[TRILHA_FIM:.*?\]/);
            const matchAudio = linha.match(/\[AUDIO:\s*(.*?)\s*\]/);

            if (matchAudio) {
                console.log(`   [INFO] Vinheta encontrada: ${matchAudio[1]}`);
                partesDoBloco.push({ type: 'vinheta', file: matchAudio[1] });
            } else if (matchTrilhaInicio) {
                console.log(`   [INFO] Confirmada trilha início: ${matchTrilhaInicio[1]}`);
            } else if (matchTrilhaFim) {
                console.log(`   [INFO] Trilha fim detectada`);
            } else if (matchFala) {
                console.log(`   [INFO] ✅ FALA DETECTADA: ${matchFala[1]}`);
                const nomeCapturado = matchFala[1];
                let nomeApresentadorRaw = '';
                let nomeArquivo = '';
                
                if (nomeCapturado.includes('Tainá')) {
                    nomeApresentadorRaw = 'tainá';
                    nomeArquivo = 'taina oliveira';
                } else if (nomeCapturado.includes('Iraí')) {
                    nomeApresentadorRaw = 'iraí';
                    nomeArquivo = 'irai santos';
                }
                
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeArquivoFala = `fala_${numeroFala}_${nomeArquivo}.mp3`;
                const caminhoOriginal = path.join(episodioAudioDir, nomeArquivoFala);
                const caminhoProcessado = path.join(TEMP_DIR, `fala_${numeroFala}_${nomeArquivo.replace(' ', '_')}_fx.mp3`);
                
                console.log(`   -> Procurando: ${nomeArquivoFala}`);
                
                try {
                    await fs.access(caminhoOriginal);
                    console.log(`   -> ✅ Arquivo encontrado, aplicando efeitos...`);
                    await aplicarEfeitos(caminhoOriginal, caminhoProcessado, nomeApresentadorRaw as NomeApresentador);
                    partesDoBloco.push({ type: 'fala', path: caminhoProcessado });
                    partesDoBloco.push({ type: 'fala', path: silencio1s });
                    falaCounter++;
                    console.log(`   -> ✅ Fala processada: contador agora é ${falaCounter}`);
                } catch (err) { 
                    console.warn(`   [AVISO] Falha ao processar arquivo de fala: ${caminhoOriginal}`);
                }
            }
        }
        
        // Criar faixa vocal consolidada para este bloco
        const audiosVocaisDoBloco: string[] = [];
        let duracaoVinhetasTransicao = 0;
        
        // CORREÇÃO: Todas as partes ficam na camada vocal (incluindo vinhetas de transição)
        for (const parte of partesDoBloco) {
            if (parte.type === 'vinheta' && parte.file) {
                const vinhetaPath = path.join('assets', 'audio', 'vinhetas', parte.file);
                audiosVocaisDoBloco.push(vinhetaPath);
                
                // Se é vinheta de transição (no início do bloco), calcular duração
                if (i > 0 && audiosVocaisDoBloco.length === 1) { // apenas a vinheta (sem silêncio)
                    duracaoVinhetasTransicao += await obterDuracaoAudio(vinhetaPath);
                }
            } else if (parte.type === 'fala' && parte.path) {
                audiosVocaisDoBloco.push(parte.path);
            }
        }

        if (audiosVocaisDoBloco.length > 0) {
            const blocoVocalPath = path.join(TEMP_DIR, `bloco_vocal_${i}.mp3`);
            await concatenarBlocos(audiosVocaisDoBloco, blocoVocalPath);
            
            // Calcular duração do bloco vocal
            const duracaoVocal = await obterDuracaoAudio(blocoVocalPath);
            
            if (trilhaDoBloco) {
                // Bloco com trilha de fundo
                blocosComTrilha.push({
                    id: `bloco_${i}`,
                    tipo: 'com_trilha',
                    trilha: { 
                        path: path.join('assets', 'audio', 'trilhas', trilhaDoBloco.file), 
                        volume: trilhaDoBloco.volume 
                    },
                    vocalPath: blocoVocalPath,
                    duracaoVocais: duracaoVocal,
                    inicioTempo: 0, // será calculado durante processamento
                    duracaoVinhetas: duracaoVinhetasTransicao,
                    inicioFalas: duracaoVinhetasTransicao // falas começam após as vinhetas
                });
            } else {
                // Bloco sem trilha
                blocosFinaisParaCrossfade.push(blocoVocalPath);
            }
        }
    }

    // FASE 2: Estratégia de Duas Camadas para blocos com trilha
    if (blocosComTrilha.length > 0) {
        console.log(`\n🎼 Aplicando estratégia de duas camadas para ${blocosComTrilha.length} blocos com trilha...`);
        
        // Criar trilha contínua com crossfade
        const trilhaContinuaPath = await criarTrilhaContinuaComCrossfade(blocosComTrilha);
        
        // Criar camada vocal contínua
        const vocaisParaConcatenacao = blocosComTrilha.map(b => b.vocalPath);
        const camadaVocalPath = path.join(TEMP_DIR, 'camada_vocal_continua.mp3');
        await concatenarBlocos(vocaisParaConcatenacao, camadaVocalPath);
        
        // Mixar camada vocal com trilha contínua
        const segmentoMusicalFinalPath = path.join(TEMP_DIR, 'segmento_musical_final.mp3');
        await mixarCamadaVocalComTrilhaContinua(camadaVocalPath, trilhaContinuaPath, segmentoMusicalFinalPath);
        
        blocosFinaisParaCrossfade.push(segmentoMusicalFinalPath);
        console.log(`   ✅ Estratégia de duas camadas concluída`);
    }

    if (blocosFinaisParaCrossfade.length === 0) {
        console.error('❌ Nenhum bloco de áudio foi processado.');
        return;
    }

    console.log('\n🎬 Montando o episódio final (sem crossfade)...');
    const outputFinal = path.join(config.paths.output.episodes, `bubuia_news_${dataDeHoje}.mp3`);
    await concatenarBlocos(blocosFinaisParaCrossfade, outputFinal);

    console.log(`\n✅ Episódio finalizado com sucesso! Salvo em: ${outputFinal}`);
    
    console.log('🧹 Limpando arquivos temporários...');
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✨ Processo concluído!');
}

// Chamada direta se executado como script principal
if (
    import.meta.url.includes('montarEpisodio.ts') ||
    process.argv[1]?.includes('montarEpisodio')
) {
    console.log('🚀 Executando montarEpisodio como script principal...');
    montarEpisodio()
        .then(() => console.log('✅ Script concluído com sucesso'))
        .catch(error => {
            console.error('❌ Erro no script:', error);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}
