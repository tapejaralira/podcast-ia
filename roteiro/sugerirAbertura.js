// roteiro/sugerirAbertura.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import 'dotenv/config';

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAUTA_FILE = path.join(__dirname, '..', 'data', 'episodio-do-dia.json');
const SUGESTOES_FILE = path.join(__dirname, '..', 'data', 'sugestoes-abertura.json');

// --- Funções Principais ---

async function gerarEfeméride(data_formatada) {
    console.log('[LOG] Buscando Efeméride Regional para a data...');
    try {
        const prompt = `Você é um pesquisador para o podcast "Bubuia News". Hoje é ${data_formatada}.
Sua tarefa é encontrar UMA efeméride ou fato histórico curioso que aconteceu nesta data, com forte conexão com Manaus ou o estado do Amazonas.
Retorne um objeto JSON com duas chaves: "titulo" (um título curto para o fato) e "texto" (um parágrafo explicando a efeméride).
Se não encontrar nada relevante, retorne um objeto com a chave "texto" contendo uma curiosidade geral sobre a cultura ou fauna amazônica.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('❌ Erro ao gerar efeméride:', error.message);
        return { titulo: "Curiosidade do Dia", texto: "O tacacá, uma das iguarias mais famosas do Amazonas, é feito com tucupi, goma de tapioca, jambu e camarão seco." };
    }
}

async function sugerirAberturas() {
    console.log('💡 Bubuia News - Iniciando geração de sugestões para o Cold Open...');
    
    let pauta;
    try {
        const pautaContent = await fs.readFile(PAUTA_FILE, 'utf-8');
        pauta = JSON.parse(pautaContent);
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de pauta: ${PAUTA_FILE}. Execute o 'analisarNoticias.js' primeiro.`);
        return;
    }

    const dataAtualString = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric'});

    // Prepara as duas opções em paralelo
    const [noticiaColdOpen, efemeride] = await Promise.all([
        Promise.resolve(pauta.coldOpen), // A notícia já vem pronta da pauta
        gerarEfeméride(dataAtualString)
    ]);

    const sugestoes = {
        noticia: noticiaColdOpen,
        efemeride: efemeride
    };

    await fs.writeFile(SUGESTOES_FILE, JSON.stringify(sugestoes, null, 2));

    console.log('\n✅ Sugestões para o Cold Open geradas com sucesso!');
    console.log('Abra o arquivo "data/sugestoes-abertura.json" para ver as opções.');
    console.log('Depois, edite o arquivo "roteiro/config-roteiro.json" para escolher sua prioridade ("noticia" ou "efemeride").');
    console.log('Finalmente, rode "npm run roteirizar" para gerar o roteiro final.');
}

sugerirAberturas();
