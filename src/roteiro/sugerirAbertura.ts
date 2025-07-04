// src/roteiro/sugerirAbertura.ts
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

import { config } from '../config.js';
import { PautaDoDia, SugestoesAbertura, Efemerie, SugestaoGancho, NoticiaClassificada } from '../types.js';

// --- Instâncias das APIs ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: config.models.sugestao });

// --- Caminhos (usando a configuração central) ---
const PAUTA_FILE = path.join(config.paths.data, 'episodio-do-dia.json');
const SUGESTOES_FILE = path.join(config.paths.data, 'sugestoes-abertura.json');

const FALLBACK_CURIOSIDADE: Efemerie = {
  titulo: 'Curiosidade da Bubuia',
  texto:
    'O Teatro Amazonas, um dos cartões-postais de Manaus, foi inaugurado em 1896 e é um dos mais importantes teatros de ópera do Brasil, conhecido por sua arquitetura renascentista e pela cúpula com as cores da bandeira brasileira.',
  fonte: 'Conhecimento geral',
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
      // Remove o markdown ```json e ``` do início e fim da string
      return text.replace(/```json\n?|\n?```/g, '').trim();
    } else {
      console.log(`  -> Gerando conteúdo com OpenAI...`);
      const response = await openai.chat.completions.create({
        model: config.models.sugestao,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      return response.choices[0].message.content || '';
    }
  } catch (error) {
    console.error(`❌ Erro ao gerar conteúdo com ${config.apiProvider}:`, error);
    // Retorna um JSON de erro padronizado para não quebrar o parsing
    return JSON.stringify({ encontrado: false, erro: (error as Error).message });
  }
}

/**
 * Busca um fato histórico ou data comemorativa com fallback para uma curiosidade.
 * @param datasParaPesquisar Array de datas formatadas para a pesquisa.
 * @returns Um objeto Efemerie.
 */
async function buscarFatoHistoricoComFallback(datasParaPesquisar: string[]): Promise<Efemerie> {
  console.log('[LOG] Buscando Efeméride ESTRITAMENTE VERIFICÁVEL...');
  
  // Define um tipo local para a resposta da IA, que é mais complexa
  type RespostaEfemerieIA = { encontrado: boolean; } & Efemerie;

  try {
    for (const dataFormatada of datasParaPesquisar) {
      console.log(` -> Pesquisando para a data: ${dataFormatada}`);
      const promptFatoReal = `
        Encontre um fato histórico, evento importante ou data comemorativa RELEVANTE (nascimento/morte de figura importante, evento histórico, etc.) que ocorreu em ${dataFormatada}.
        A resposta DEVE ser um JSON com a seguinte estrutura:
        {
          "encontrado": boolean,
          "titulo": string (Ex: "Inauguração da Torre Eiffel"),
          "texto": string (um parágrafo explicando o fato),
          "fonte": string (URL da fonte ou nome do livro/documento)
        }
        Se NADA relevante for encontrado para esta data, retorne um JSON com "encontrado: false".
        Seja factual e verificável. Evite fatos obscuros ou irrelevantes.
        Priorize eventos relacionados ao Brasil ou de impacto global.
      `;

      const responseJson = await gerarConteudoIA(promptFatoReal);
      const efemerideResult: RespostaEfemerieIA = JSON.parse(responseJson);

      // Se a IA encontrou um fato válido, retorna o objeto no formato correto de Efemerie
      if (efemerideResult.encontrado && efemerideResult.titulo) {
        console.log(`[LOG] Efeméride encontrada: ${efemerideResult.titulo}`);
        return {
          titulo: efemerideResult.titulo,
          texto: efemerideResult.texto,
          fonte: efemerideResult.fonte,
        };
      }
    }

    console.log('[LOG] Nenhum fato histórico encontrado. Usando curiosidade sobre a Amazônia como fallback.');
    return FALLBACK_CURIOSIDADE; // Retorna o fallback se o loop terminar
  } catch (error) {
    console.error('❌ Erro ao buscar fato histórico:', error);
    return FALLBACK_CURIOSIDADE; // Retorna o fallback em caso de erro
  }
}

/**
 * Função principal que orquestra a geração de sugestões para a abertura.
 */
export async function sugerirAbertura(): Promise<void> {
  console.log('\n[ETAPA 3/6] Gerando sugestões de abertura...');
  try {
    const pautaRaw = await fs.readFile(PAUTA_FILE, 'utf-8');
    const pautaDoDia: PautaDoDia = JSON.parse(pautaRaw);

    // 1. Buscar Efeméride
    const hoje = new Date(pautaDoDia.data);
    const dia = hoje.getDate();
    const mes = hoje.toLocaleString('pt-BR', { month: 'long' });
    const efemeride = await buscarFatoHistoricoComFallback([`${dia} de ${mes}`]);

    // 2. Gerar Sugestões de Gancho com base na pauta
    const promptGanchos = `
      Você é um roteirista de podcast criativo. Crie 3 ganchos (aberturas) para o podcast Bubuia News com base na pauta do dia.
      O gancho principal deve ser o mais forte e direto.

      REGRAS:
      - Cada gancho deve ter no máximo 2 frases.
      - Para cada gancho, sugira uma trilha sonora da lista: [trilha_informativa_neutra, trilha_tecnologica_upbeat, trilha_divertida_pop, trilha_misteriosa_humor, trilha_tensao_leve, trilha_reflexiva, trilha_cultural_regional].
      - A resposta DEVE ser um objeto JSON com a estrutura: { sugestaoPrincipal: { gancho: string, trilhaSonora: string }, alternativas: [{ gancho: string, trilhaSonora: string }] }

      PAUTA DO DIA:
      - Manchete: ${pautaDoDia.manchete}
      - Política: ${pautaDoDia.pauta.politica.map(n => n.tituloPrincipal).join(', ') || 'N/A'}
      - Cidades: ${pautaDoDia.pauta.cidades.map(n => n.tituloPrincipal).join(', ') || 'N/A'}
      - Cultura: ${pautaDoDia.pauta.cultura.map(n => n.tituloPrincipal).join(', ') || 'N/A'}

      Responda APENAS com o objeto JSON.
    `;

    const ganchosJson = await gerarConteudoIA(promptGanchos);
    const sugestoes = JSON.parse(ganchosJson);

    // 3. Atualizar o arquivo da pauta com a efeméride encontrada
    pautaDoDia.efemerides = [efemeride];
    await fs.writeFile(PAUTA_FILE, JSON.stringify(pautaDoDia, null, 2));
    console.log(`[LOG] Arquivo de pauta (${path.basename(PAUTA_FILE)}) atualizado com a efeméride do dia.`);

    // 4. Salvar as sugestões de abertura
    await fs.writeFile(SUGESTOES_FILE, JSON.stringify(sugestoes, null, 2));
    console.log(`✅ Sugestões de abertura salvas em: ${path.basename(SUGESTOES_FILE)}`);

  } catch (error) {
    console.error('🔥 Erro fatal ao gerar sugestões de abertura:', error);
    throw error; // Propaga o erro para o pipeline principal
  }
}
