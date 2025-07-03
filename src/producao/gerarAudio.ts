// producao/gerarAudio.ts
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import { config } from '../config.js';
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
export async function gerarAudiosDoRoteiro(): Promise<void> {
    console.log('🔊 Bubuia News - Iniciando geração de áudios...');

    const ttsConfig: TtsConfig = JSON.parse(await fs.readFile(config.paths.ttsConfigFile, 'utf-8'));
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(config.paths.roteirosDir, `roteiro-${dataDeHoje}.md`);
    
    let roteiroContent: string;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    const episodioAudioDir = path.join(config.paths.audioOutputDir, `episodio-${dataDeHoje}`);
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
