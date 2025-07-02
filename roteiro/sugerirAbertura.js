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
const FALLBACK_CURIOSIDADE = {
    titulo: "Curiosidade da Bubuia",
    texto: "O Teatro Amazonas, um dos cartões-postais de Manaus, foi inaugurado em 1896, no auge do Ciclo da Borracha, e sua cúpula é coberta com 36 mil escamas de cerâmica nas cores da bandeira do Brasil."
};


// --- Funções Principais ---

/**
 * NOVA FUNÇÃO REFINADA
 * Tenta buscar um fato histórico real. Se não encontrar, gera uma mensagem de ouvinte como fallback.
 * @param {string[]} datasParaPesquisar - Um array de datas formatadas para a pesquisa.
 * @returns {Promise<object>} Um objeto com "titulo" e "texto".
 */
async function buscarFatoHistoricoComFallback(datasParaPesquisar) {
    console.log('[LOG] Buscando Efeméride Regional VERIFICÁVEL...');
    try {
        // 1. Itera sobre as datas fornecidas para encontrar um fato histórico.
        for (const data_formatada of datasParaPesquisar) {
            console.log(` -> Pesquisando para a data: ${data_formatada}`);
            const promptFatoReal = `
                Você é um pesquisador para o podcast "Bubuia News". Sua tarefa é encontrar UMA efeméride ou fato histórico VERIFICÁVEL que aconteceu na data de ${data_formatada}, com forte conexão com a cidade de Manaus ou o estado do Amazonas.

                REGRAS:
                - A informação DEVE ser um fato real e histórico. Não invente.
                - O texto deve ser curto, ideal para um diálogo de 15 segundos.
                - Se encontrar um fato, retorne um objeto JSON com as chaves "titulo" e "texto".
                - Se, após a busca, você não encontrar NENHUM fato histórico relevante para esta data, retorne EXATAMENTE o seguinte objeto JSON: { "encontrado": false }
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: promptFatoReal }],
                response_format: { type: "json_object" },
            });

            const efemeride = JSON.parse(response.choices[0].message.content);

            // Se um fato foi encontrado, retorna imediatamente.
            if (efemeride.encontrado !== false && efemeride.titulo) {
                console.log(`[LOG] ✅ Fato histórico encontrado para ${data_formatada}: "${efemeride.titulo}"`);
                return efemeride;
            }
        }


        // 2. Se o loop terminar sem encontrar fatos, usa o fallback.
        console.log('[LOG] Nenhum fato histórico encontrado nas datas pesquisadas. Usando o fallback "Mensagem do Ouvinte".');
        
        const tituloFallback = "Mensagem do Ouvinte";
        const promptCriativo = `
            Gere uma mensagem curta e fictícia de um ouvinte para o podcast "Bubuia News".
            A mensagem deve:
            1. Ser um comentário rápido e positivo sobre a cidade de Manaus ou um elogio ao podcast.
            2. Incluir um nome fictício para o ouvinte e um bairro de Manaus ou cidade do Amazonas de onde ele(a) está falando.
            3. Ter no máximo duas frases e soar autêntica.

            Exemplo de texto a ser gerado: "Adoro começar meu dia com vocês! O Bubuia News é o melhor jeito de saber das coisas da nossa cidade. Um abraço, Carlos, lá do Parque 10."
        `;

        const promptFinal = `
            Você é um roteirista do podcast "Bubuia News".
            ${promptCriativo}
            Retorne um objeto JSON com as chaves "titulo" (use exatamente "${tituloFallback}") e "texto" (o conteúdo gerado).
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: promptFinal }],
            response_format: { type: "json_object" },
        });
        
        const efemeride = JSON.parse(response.choices[0].message.content);
        console.log(`[LOG] ✅ Fallback criativo gerado: "${efemeride.titulo}"`);
        return efemeride;

    } catch (error) {
        console.error('❌ Erro ao buscar efeméride/curiosidade:', error.message);
        // Retorna um fallback fixo em caso de falha total da API
        return FALLBACK_CURIOSIDADE;
    }
}


async function sugerirAberturas() {
    console.log('� Bubuia News - Iniciando geração de sugestões para o Cold Open...');
    
    let pauta;
    try {
        const pautaContent = await fs.readFile(PAUTA_FILE, 'utf-8');
        pauta = JSON.parse(pautaContent);
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de pauta: ${PAUTA_FILE}. Execute o 'analisarNoticias.js' primeiro.`);
        return;
    }

    // <<< LÓGICA DE DATAS DO FIM DE SEMANA >>>
    const hoje = new Date();
    const diaDaSemana = hoje.getDay(); // 0 = Domingo, 5 = Sexta-feira
    const datasParaPesquisar = [];
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    datasParaPesquisar.push(hoje.toLocaleDateString('pt-BR', options));

    if (diaDaSemana === 5) { // Se for sexta-feira
        console.log("[LOG] Hoje é sexta-feira! Buscando efemérides para o fim de semana inteiro.");
        const sabado = new Date(hoje);
        sabado.setDate(hoje.getDate() + 1);
        datasParaPesquisar.push(sabado.toLocaleDateString('pt-BR', options));

        const domingo = new Date(hoje);
        domingo.setDate(hoje.getDate() + 2);
        datasParaPesquisar.push(domingo.toLocaleDateString('pt-BR', options));
    }

    // Prepara as duas opções em paralelo
    const [noticiaColdOpen, efemeride] = await Promise.all([
        Promise.resolve(pauta.coldOpen), // A notícia já vem pronta da pauta
        buscarFatoHistoricoComFallback(datasParaPesquisar) // Usa a nova função com a lista de datas
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
