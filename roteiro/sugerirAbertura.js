// roteiro/sugerirAbertura.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// --- Configuração do Roteirista ---
// Mude para 'gemini' para testar a nova API, ou 'openai' para usar a padrão.
const SUGESTAO_API = 'gemini'; // Opções: 'openai', 'gemini'

// --- Configurações e Constantes ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAUTA_FILE = path.join(__dirname, '..', 'data', 'episodio-do-dia.json');
const SUGESTOES_FILE = path.join(__dirname, '..', 'data', 'sugestoes-abertura.json');
const FALLBACK_CURIOSIDADE = {
    titulo: "Curiosidade da Bubuia",
    texto: "O Teatro Amazonas, um dos cartões-postais de Manaus, foi inaugurado em 1896, no auge do Ciclo da Borracha, e sua cúpula é coberta com 36 mil escamas de cerâmica nas cores da bandeira do Brasil."
};

/**
 * Função genérica para chamar a API de IA configurada.
 * @param {string} prompt - O prompt a ser enviado para a IA.
 * @returns {Promise<string>} O conteúdo de texto da resposta da IA.
 */
async function gerarConteudoIA(prompt) {
    try {
        if (SUGESTAO_API === 'gemini') {
            console.log(`  -> Gerando conteúdo com Gemini...`);
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            // Gemini pode retornar o JSON dentro de um bloco de código, então limpamos isso.
            const text = response.text();
            return text.replace(/```json\n?|\n?```/g, '').trim();
        } else { // Padrão é OpenAI
            console.log(`  -> Gerando conteúdo com OpenAI...`);
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });
            return response.choices[0].message.content;
        }
    } catch (error) {
        console.error(`❌ Erro ao gerar conteúdo com ${SUGESTAO_API}: ${error.message}`);
        // Retorna um JSON de erro para não quebrar o fluxo principal
        return JSON.stringify({ encontrado: false, erro: error.message });
    }
}


// --- Funções Principais ---

/**
 * NOVA FUNÇÃO REFINADA
 * Tenta buscar um fato histórico real. Se não encontrar, gera uma mensagem de ouvinte como fallback.
 * @param {string[]} datasParaPesquisar - Um array de datas formatadas para a pesquisa.
 * @returns {Promise<object>} Um objeto com "titulo" e "texto".
 */
async function buscarFatoHistoricoComFallback(datasParaPesquisar) {
    console.log('[LOG] Buscando Efeméride Regional ESTRITAMENTE VERIFICÁVEL...');
    try {
        // 1. Itera sobre as datas fornecidas para encontrar um fato histórico.
        for (const data_formatada of datasParaPesquisar) {
            console.log(` -> Pesquisando para a data: ${data_formatada}`);
            const promptFatoReal = `
                Você é um pesquisador factual para o podcast "Bubuia News". Sua tarefa é encontrar UMA efeméride, fato histórico ou data comemorativa ESTRITAMENTE VERIFICÁVEL que é celebrada na data de ${data_formatada}.

                **REGRAS RÍGIDAS:**
                - **NÃO INVENTE NADA.** A informação deve ser um fato real, documentado e facilmente verificável em fontes confiáveis.
                - **FOCO NA VERACIDADE:** A prioridade máxima é a precisão factual. A criatividade não deve ser aplicada na geração do fato em si.

                **ORDEM DE PRIORIDADE DA BUSCA:**
                1.  **Prioridade 1 (Fato Histórico Local):** Busque por um fato histórico relevante que tenha acontecido em Manaus, no estado do Amazonas, ou sobre uma personalidade influente da região.
                2.  **Prioridade 2 (Fato Histórico Nacional):** Se não encontrar nada localmente relevante, busque por um fato histórico importante que tenha acontecido no Brasil.
                3.  **Prioridade 3 (Data Comemorativa Local):** Se não encontrar fatos históricos, busque por datas comemorativas específicas de Manaus ou do estado do Amazonas.
                4.  **Prioridade 4 (Data Comemorativa Nacional):** Se ainda assim não encontrar nada, busque por datas comemorativas celebradas no Brasil (ex: Dia do Bombeiro, Dia da Ciência, etc.) e explique brevemente o seu significado.

                **Formato da Resposta (JSON Obrigatório):**
                -   Se encontrar um fato ou data comemorativa VERIFICÁVEL: \`{ "encontrado": true, "titulo": "Um Título Factual e Direto", "texto": "Uma breve descrição do fato ou da data comemorativa, sem adornos ou ficção, ideal para um diálogo de 15 segundos." }\`
                -   Se, após uma busca real, você não encontrar NADA relevante para esta data: \`{ "encontrado": false }\`
            `;

            const responseJson = await gerarConteudoIA(promptFatoReal);
            const efemeride = JSON.parse(responseJson);

            // Se um fato foi encontrado, retorna imediatamente.
            if (efemeride.encontrado && efemeride.titulo) {
                console.log(`[LOG] ✅ Fato histórico encontrado para ${data_formatada}: "${efemeride.titulo}"`);
                return efemeride;
            }
        }


        // 2. Se o loop terminar sem encontrar fatos, usa o fallback.
        console.log('[LOG] Nenhum fato histórico encontrado. Gerando uma "Mensagem do Ouvinte" inspiradora como fallback.');
        
        const tituloFallback = "Mensagem da Bubuia";
        const promptCriativo = `
            Você é um roteirista criativo do podcast "Bubuia News". Sua tarefa é criar uma mensagem de ouvinte fictícia que soe autêntica, calorosa e que celebre a cultura de Manaus ou o próprio podcast.

            **Inspiração para a Mensagem:**
            -   Pode ser um elogio a um quadro do programa.
            -   Uma lembrança afetiva sobre um lugar em Manaus.
            -   Uma observação engraçada sobre o cotidiano manauara.
            -   Um agradecimento pela companhia do podcast.

            **Requisitos:**
            1.  **Autenticidade:** A mensagem deve parecer real, com linguagem coloquial.
            2.  **Conteúdo:** Máximo de 2 frases.
            3.  **Identificação:** Inclua um nome fictício e um bairro de Manaus ou cidade do Amazonas.

            **Formato da Resposta (JSON Obrigatório):**
            \`{ "titulo": "${tituloFallback}", "texto": "O conteúdo da mensagem gerada." }\`

            **Exemplo de Inspiração:** "Tainá e Iraí, vocês são demais! Ouvindo o Bubuia News, até o trânsito da Djalma Batista fica mais leve. Um abraço do Jeferson, aqui do Coroado."
        `;

        const responseJson = await gerarConteudoIA(promptCriativo);
        const efemeride = JSON.parse(responseJson);

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
