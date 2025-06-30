// producao/gerarAudio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const TTS_CONFIG_FILE = path.join(__dirname, '..', 'data', 'tts-config.json');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'audios_gerados');

// Mapeia a categoria da pauta para o estilo de voz definido no config
const CATEGORIA_PARA_ESTILO = {
    '⚫️': 'serio_ou_analitico',
    '🟡': 'serio_ou_analitico',
    '🔴': 'indignado_leve',
    '🚀': 'animado',
    '🎬': 'animado',
    '🎭': 'animado',
    '👽': 'curioso_ou_bizarro'
};

// --- Função para chamar a API do ElevenLabs ---
async function textoParaAudio(texto, voiceId, settings) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=1`;
    const headers = {
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
    };
    const body = {
        text: texto,
        model_id: "eleven_multilingual_v2",
        voice_settings: settings,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API ElevenLabs respondeu com status ${response.status}: ${errorBody}`);
        }
        return await response.arrayBuffer();
    } catch (error) {
        console.error('❌ Erro ao comunicar com a API do ElevenLabs:', error.message);
        return null;
    }
}

// --- Função Principal ---
async function gerarAudiosDoRoteiro() {
    console.log('🔊 Bubuia News - Iniciando geração de áudios...');

    const ttsConfig = JSON.parse(await fs.readFile(TTS_CONFIG_FILE, 'utf-8'));
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    
    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute os passos anteriores primeiro.`);
        return;
    }

    const episodioAudioDir = path.join(AUDIO_OUTPUT_DIR, `episodio-${dataDeHoje}`);
    await fs.mkdir(episodioAudioDir, { recursive: true });

    const blocos = roteiroContent.split('---');
    let falaCounter = 0;

    for (const bloco of blocos) {
        let estiloDeVoz = 'padrao';

        // **NOVA LÓGICA:** Extrai o emoji diretamente do título do bloco
        const matchTitulo = bloco.match(/#### Notícia \d+: \[(.+?)\s/);
        if (matchTitulo && matchTitulo[1]) {
            const emojiCategoria = matchTitulo[1];
            estiloDeVoz = CATEGORIA_PARA_ESTILO[emojiCategoria] || 'padrao';
        } else if (bloco.includes('COLD OPEN')) {
            estiloDeVoz = 'curioso_ou_bizarro';
        }

        const regexFalas = /^\*\*(Tainá|Iraí):\*\*\s*(.*)$/gm;
        const falas = [...bloco.matchAll(regexFalas)];

        for (const fala of falas) {
            falaCounter++;
            const [_, nomeApresentador, textoFala] = fala;
            
            const nomeCompleto = nomeApresentador.includes('Tainá') ? 'Tainá Oliveira' : 'Iraí Santos';
            const voiceId = ttsConfig.voices[nomeCompleto];
            
            // **LÓGICA DINÂMICA DE VOZ**
            const voiceSettings = ttsConfig.estilos_de_voz[estiloDeVoz] || ttsConfig.estilos_de_voz['padrao'];
            
            const textoLimpo = textoFala.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

            if (!voiceId) {
                console.warn(`  -> [AVISO] Voice ID não encontrado para ${nomeApresentador}. Pulando...`);
                continue;
            }

            console.log(`  -> Gerando áudio ${falaCounter} para ${nomeApresentador} (Estilo: ${estiloDeVoz})...`);
            
            const audioBuffer = await textoParaAudio(textoLimpo, voiceId, voiceSettings);

            if (audioBuffer) {
                const numeroFala = String(falaCounter).padStart(2, '0');
                const audioFilename = path.join(episodioAudioDir, `fala_${numeroFala}_${nomeApresentador.toLowerCase()}.mp3`);
                await fs.writeFile(audioFilename, Buffer.from(audioBuffer));
                console.log(`     -> Áudio salvo em: ${audioFilename}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
    }

    console.log(`\n✅ Geração de áudio finalizada! Total de ${falaCounter} falas geradas.`);
}

gerarAudiosDoRoteiro();
