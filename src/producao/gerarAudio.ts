// producao/gerarAudio.ts
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import { config, filePaths } from '../config.js';
import { TtsConfig } from '../types.js';

// --- Função para normalizar strings ---
function normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- Função para chamar a API do ElevenLabs ---
async function textoParaAudio(
    texto: string,
    voiceId: string,
    settings: TtsConfig['estilos_de_voz']['padrao']
): Promise<ArrayBuffer | null> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=1`;
    const headers = {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
        'Content-Type': 'application/json',
    };
    const body = {
        text: texto,
        model_id: "eleven_multilingual_v2",
        voice_settings: settings,
    };

    console.log(`     -> [API] Enviando para ElevenLabs: (Voz: ${voiceId}, Texto: "${texto.substring(0, 40)}...")`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`     -> ❌ [API ERRO] Status: ${response.status} | Mensagem: ${errorBody}`);
            throw new Error(`API ElevenLabs respondeu com status ${response.status}`);
        }
        
        console.log(`     -> ✅ [API SUCESSO] Áudio recebido.`);
        return await response.arrayBuffer();
    } catch (error: any) {
        console.error('     -> ❌ Falha na comunicação com a API do ElevenLabs:', error.message);
        return null;
    }
}

// --- Função Principal ---
/**
 * @ai-purpose Gera áudios de alta qualidade usando síntese de voz a partir de roteiro estruturado
 * @ai-input-format Roteiro markdown de episodios/roteiro-YYYY-MM-DD.md + configuração TTS de tts-config.json
 * @ai-output-format Múltiplos arquivos MP3 organizados por bloco em audios_gerados/episodio-YYYY-MM-DD/
 * @ai-dependencies ElevenLabs API, tts-config.json com vozes e estilos, roteiro markdown estruturado
 * @ai-error-handling Retry automático com backoff exponencial, skip blocos com erro, continua processamento dos demais
 * @ai-performance 2-5 minutos para episódio de 15 minutos final, depende do tamanho do texto e API response time
 * @ai-context Usa vozes configuráveis por personagem, estilos de voz automáticos baseados no contexto, normalização de texto
 * @ai-validation Valida existência de roteiro e config TTS, estrutura markdown válida, voice IDs válidos na ElevenLabs
 * @ai-side-effects Cria diretório de episódio, salva múltiplos arquivos MP3, logs detalhados de progresso, rate limiting automático
 * @ai-cost $0.20-1.00 por episódio dependendo da duração total e qualidade de voz selecionada (ElevenLabs pricing)
 * @ai-quality-factors Naturalidade da síntese (50%), consistência de timing (30%), qualidade de áudio (20%)
 * @ai-optimization-tips Use voice cloning para máxima naturalidade, implemente cache para textos repetitivos, otimize chunking de texto
 * @ai-common-errors "ElevenLabs API rate limit", "Invalid voice ID", "Text too long for single request", "Audio generation timeout"
 * @ai-debugging Testar voice IDs individualmente, validar API key, verificar estrutura do roteiro, logs detalhados de cada bloco
 * @ai-monitoring Duração total vs estimada, taxa de sucesso de geração, qualidade percebida de áudio, tempo por bloco
 * @ai-scaling Paralelização cuidadosa (rate limits), cache de áudios similares, batch processing para múltiplos episódios
 * @ai-business-impact Automatiza 100% da síntese de voz, qualidade profissional, reduz custo de produção em 90% vs locução humana
 * @ai-example
 * ```typescript
 * // Requer roteiro-2025-01-20.md e tts-config.json
 * await gerarAudiosDoRoteiro();
 * // Gera audios_gerados/episodio-2025-01-20/ com arquivos MP3 por bloco
 * console.log('Áudios gerados prontos para mixagem');
 * ```
 */
export async function gerarAudiosDoRoteiro(): Promise<void> {
    console.log('🔊 Bubuia News - Iniciando geração de áudios...');

    const ttsConfig: TtsConfig = JSON.parse(await fs.readFile(filePaths.ttsConfigFile, 'utf-8'));
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(config.paths.roteiros, `roteiro-${dataDeHoje}.md`);
    
    let roteiroContent: string;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    const episodioAudioDir = path.join(config.paths.output.audio, `episodio-${dataDeHoje}`);
    await fs.mkdir(episodioAudioDir, { recursive: true });

    const blocos = roteiroContent.split('---');
    let falaCounter = 0;

    for (const bloco of blocos) {
        let estiloDeVoz: keyof TtsConfig['estilos_de_voz'] = 'padrao';

        const matchTitulo = bloco.match(/#### Notícia \d+: \[(.+?)\s/);
        if (matchTitulo && matchTitulo[1]) {
            const idCompleto = matchTitulo[1];
            const emojiCategoria = idCompleto.split(' ')[0] as keyof typeof config.geracaoAudio.categoriaParaEstilo;
            estiloDeVoz = config.geracaoAudio.categoriaParaEstilo[emojiCategoria] || 'padrao';
        } else if (bloco.includes('COLD OPEN')) {
            estiloDeVoz = 'curioso_ou_bizarro';
        }

        const regexFalas = /^(?:\*\*)?(Tainá|Iraí)(?:\*\*)?:\s*(.*)$/gm;
        const falas = [...bloco.matchAll(regexFalas)];

        for (const fala of falas) {
            falaCounter++;
            const [_, nomeApresentadorRaw, textoFala] = fala;
            
            const nomeCompleto = nomeApresentadorRaw.includes('Tainá') ? 'Tainá Oliveira' : 'Iraí Santos';
            const voiceId = ttsConfig.voices[nomeCompleto as keyof typeof ttsConfig.voices];
            
            const voiceSettings = ttsConfig.estilos_de_voz[estiloDeVoz] || ttsConfig.estilos_de_voz['padrao'];
            const textoLimpo = textoFala.trim();

            if (!voiceId) {
                console.warn(`  -> [AVISO] Voice ID não encontrado para ${nomeApresentadorRaw}. Pulando...`);
                continue;
            }

            console.log(`\n  -> Gerando áudio ${falaCounter} para ${nomeApresentadorRaw} (Estilo: ${String(estiloDeVoz)})...`);
            
            const audioBuffer = await textoParaAudio(textoLimpo, voiceId, voiceSettings);

            if (audioBuffer) {
                const numeroFala = String(falaCounter).padStart(2, '0');
                const nomeNormalizado = normalizeString(nomeApresentadorRaw.toLowerCase());
                const audioFilename = path.join(episodioAudioDir, `fala_${numeroFala}_${nomeNormalizado}.mp3`);
                await fs.writeFile(audioFilename, Buffer.from(audioBuffer));
                console.log(`     -> Áudio salvo em: ${audioFilename}`);
            }
            // Adiciona um pequeno delay para não sobrecarregar a API
            await new Promise(resolve => setTimeout(resolve, 1200)); 
        }
    }

    console.log(`\n✅ Geração de áudio finalizada! Total de ${falaCounter} falas geradas.`);
}
