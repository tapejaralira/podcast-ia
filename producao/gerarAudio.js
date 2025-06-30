// producao/gerarAudio.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// --- Configurações e Constantes ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CAMINHOS ATUALIZADOS: Apontam para as pastas corretas a partir de /producao
const ROTEIRO_DIR = path.join(__dirname, '..', 'episodios');
const TTS_CONFIG_FILE = path.join(__dirname, '..', 'data', 'tts-config.json');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'audios_gerados');

// --- Função para chamar a API do ElevenLabs ---
async function textoParaAudio(texto, voiceId, settings) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
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

        // Retorna o áudio como um buffer de dados
        return await response.arrayBuffer();
    } catch (error) {
        console.error('❌ Erro ao comunicar com a API do ElevenLabs:', error.message);
        return null;
    }
}

// --- Função Principal ---
async function gerarAudiosDoRoteiro() {
    console.log('🔊 Bubuia News - Iniciando geração de áudios...');

    // 1. Carregar configurações
    const ttsConfig = JSON.parse(await fs.readFile(TTS_CONFIG_FILE, 'utf-8'));
    const dataDeHoje = new Date().toISOString().split('T')[0];
    const roteiroFilename = path.join(ROTEIRO_DIR, `roteiro-${dataDeHoje}.md`);
    
    let roteiroContent;
    try {
        roteiroContent = await fs.readFile(roteiroFilename, 'utf-8');
    } catch (error) {
        console.error(`🔥 Erro ao ler o ficheiro de roteiro: ${roteiroFilename}. Execute o 'gerarRoteiro.js' primeiro.`);
        return;
    }

    // Cria a pasta de saída para o episódio de hoje
    const episodioAudioDir = path.join(AUDIO_OUTPUT_DIR, `episodio-${dataDeHoje}`);
    await fs.mkdir(episodioAudioDir, { recursive: true });

    // 2. Extrair as falas do roteiro
    const regexFalas = /^\*\*(Tainá|Iraí):\*\*\s*(.*)$/gm;
    const falas = [...roteiroContent.matchAll(regexFalas)];

    if (falas.length === 0) {
        console.warn('Nenhuma fala de apresentador encontrada no roteiro.');
        return;
    }

    console.log(`Encontradas ${falas.length} falas para gerar.`);

    // 3. Gerar cada áudio em sequência
    for (let i = 0; i < falas.length; i++) {
        const [_, nomeApresentador, textoFala] = falas[i];
        
        // Constrói o nome completo para buscar no JSON de configuração
        const nomeCompleto = nomeApresentador.includes('Tainá') ? 'Tainá Oliveira' : 'Iraí Santos';
        const voiceId = ttsConfig.voices[nomeCompleto];
        
        const textoLimpo = textoFala.replace(/<speak>|<\/speak>/g, '').trim();

        if (!voiceId) {
            console.warn(`  -> [AVISO] Voice ID não encontrado para ${nomeApresentador}. Pulando...`);
            continue;
        }

        console.log(`  -> Gerando áudio ${i + 1}/${falas.length} para ${nomeApresentador}...`);
        
        const audioBuffer = await textoParaAudio(textoLimpo, voiceId, ttsConfig.padrao_voice_settings);

        if (audioBuffer) {
            const numeroFala = String(i + 1).padStart(2, '0');
            const audioFilename = path.join(episodioAudioDir, `fala_${numeroFala}_${nomeApresentador.toLowerCase()}.mp3`);
            await fs.writeFile(audioFilename, Buffer.from(audioBuffer));
            console.log(`     -> Áudio salvo em: ${audioFilename}`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Geração de áudio finalizada com sucesso!');
}

gerarAudiosDoRoteiro();
