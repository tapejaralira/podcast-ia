// src/roteiro/sugerirAbertura.ts
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

import { config } from '../config.js';
import { PautaDoDia, Sugestoes, SugestaoAbertura, Efemerie } from '../types.js';

// --- Instâncias das APIs ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: config.models.sugestao });

// --- Caminhos (usando a configuração central) ---
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const PAUTA_FILE = path.join(PROJECT_ROOT, config.paths.data, 'episodio-do-dia.json');
const SUGESTOES_FILE = path.join(PROJECT_ROOT, config.paths.data, 'sugestoes-abertura.json');

const FALLBACK_CURIOSIDADE: Efemerie = {
    titulo: "Curiosidade da Bubuia",
    texto: "O Teatro Amazonas, um dos cartões-postais de Manaus, foi inaugurado em 1896..."
};

/**
 * Função genérica para chamar a API de IA configurada.
 * @param prompt O prompt a ser enviado para a IA.
 * @returns O conteúdo de texto da resposta da IA.
 */
async function gerarConteudoIA(prompt: string): Promise<string> {
    try {
        if (config.apiProvider === 'gemini') {
            console.log(`  -> Gerando conteúdo com Gemini...`);
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text.replace(/```json\n?|\n?```/g, '').trim();
        } else {
            console.log(`  -> Gerando conteúdo com OpenAI...`);
            const response = await openai.chat.completions.create({
                model: config.models.sugestao,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });
            return response.choices[0].message.content || '';
        }
    } catch (error) {
        console.error(`❌ Erro ao gerar conteúdo com ${config.apiProvider}:`, error);
        return JSON.stringify({ encontrado: false, erro: (error as Error).message });
    }
}

/**
 * Busca um fato histórico ou data comemorativa com fallback para mensagem de ouvinte.
 * @param datasParaPesquisar Array de datas formatadas para a pesquisa.
 * @returns Um objeto com "titulo" e "texto".
 */
async function buscarFatoHistoricoComFallback(datasParaPesquisar: string[]): Promise<Efemerie> {
    console.log('[LOG] Buscando Efeméride ESTRITAMENTE VERIFICÁVEL...');
    try {
        for (const data_formatada of datasParaPesquisar) {
            console.log(` -> Pesquisando para a data: ${data_formatada}`);
            const promptFatoReal = `... prompt ...`; // O prompt longo permanece o mesmo

            const responseJson = await gerarConteudoIA(promptFatoReal);
            const efemeride: Efemerie = JSON.parse(responseJson);

            if (efemeride.encontrado && efemeride.titulo) {
                console.log(`[LOG] ✅ Fato encontrado para ${data_formatada}: "${efemeride.titulo}"`);
                return efemeride;
            }
        }

        console.log('[LOG] Nenhum fato encontrado. Gerando "Mensagem do Ouvinte" como fallback.');
        const tituloFallback = "Mensagem da Bubuia";
        const promptCriativo = `... prompt ...`; // O prompt longo permanece o mesmo

        const responseJson = await gerarConteudoIA(promptCriativo);
        const fallback: Efemerie = JSON.parse(responseJson);

        console.log(`[LOG] ✅ Fallback criativo gerado: "${fallback.titulo}"`);
        return fallback;

    } catch (error) {
        console.error('❌ Erro ao buscar efeméride/curiosidade:', error);
        return FALLBACK_CURIOSIDADE;
    }
}

/**
 * Função principal que orquestra a geração de sugestões para a abertura.
 */
export async function sugerirAbertura() {
    console.log('💡 Bubuia News - Gerando sugestões para o Cold Open...');
    
    let pauta: PautaDoDia;
    try {
        const pautaContent = await fs.readFile(PAUTA_FILE, 'utf-8');
        pauta = JSON.parse(pautaContent) as PautaDoDia;
    } catch (error) {
        console.error(`🔥 Erro ao ler o arquivo de pauta: ${PAUTA_FILE}.`);
        return;
    }

    const hoje = new Date();
    const diaDaSemana = hoje.getDay();
    const datasParaPesquisar: string[] = [hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })];

    if (diaDaSemana === 5) { // Sexta-feira
        console.log("[LOG] Sexta-feira! Buscando efemérides para o fim de semana.");
        const sabado = new Date(hoje);
        sabado.setDate(hoje.getDate() + 1);
        datasParaPesquisar.push(sabado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }));
        const domingo = new Date(hoje);
        domingo.setDate(hoje.getDate() + 2);
        datasParaPesquisar.push(domingo.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }));
    }

    const [noticiaColdOpen, efemeride] = await Promise.all([
        Promise.resolve(pauta.coldOpen),
        buscarFatoHistoricoComFallback(datasParaPesquisar)
    ]);

    const sugestoes: Sugestoes = {
        noticia: noticiaColdOpen,
        efemeride: efemeride
    };

    await fs.writeFile(SUGESTOES_FILE, JSON.stringify(sugestoes, null, 2));

    console.log('\n✅ Sugestões para o Cold Open geradas com sucesso!');
    console.log(`   - Notícia: ${sugestoes.noticia?.titulo_principal || 'Nenhuma'}`)
    console.log(`   - Efeméride: ${sugestoes.efemeride?.titulo || 'Nenhuma'}`)
    console.log(`
Abra o arquivo "${config.paths.data}/sugestoes-abertura.json" para ver as opções.`);
}
