// src/roteiro/sugerirAbertura.ts
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

import { config, filePaths } from '../config.js';
import { PautaDoDia, SugestoesAbertura, Efemerie, SugestaoGancho, NoticiaClassificada } from '../types.js';
import { generateHooksPrompt } from '../ai/prompts/generate-hooks.prompt.js';
import { renderTemplate } from '../ai/prompts/prompt-template.js';
import { AIPerformanceCollector } from '../ai/metrics/ai-performance.js';
import { getDataManaus, getDataCompletaManaus, getDateTimeManaus } from '../utils/timezone.js';

// Initialize AI metrics collector
const aiMetrics = new AIPerformanceCollector();

// --- Instâncias das APIs ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: config.ai.gemini.model });

// --- Caminhos (usando a configuração central) ---
const PAUTA_FILE = path.join(config.paths.data, 'noticias-categorizadas.json');
const SUGESTOES_FILE = path.join(config.paths.data, 'sugestoes-abertura.json');

const FALLBACK_CURIOSIDADE: Efemerie = {
  titulo: 'Curiosidade Amazônica',
  texto:
    'Manaus é conhecida como o "Portal de Entrada da Amazônia" e possui mais de 2 milhões de habitantes, sendo uma das maiores cidades da região amazônica. A cidade fica localizada na confluência dos rios Negro e Solimões, que formam o Rio Amazonas.',
  fonte: 'IBGE - Instituto Brasileiro de Geografia e Estatística',
};

/**
 * Função genérica para chamar a API de IA configurada.
 * @param prompt O prompt a ser enviado para a IA.
 * @returns O conteúdo de texto da resposta da IA.
 */
async function gerarConteudoIA(prompt: string): Promise<string> {
  const startTime = Date.now();
  
  try {
    if ('gemini' === 'gemini') {
      console.log(`  -> Gerando conteúdo com Gemini...`);
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Track successful metric
      await aiMetrics.trackAIUsage(
        'text-generation',
        'gemini-2.0-flash',
        true,
        Date.now() - startTime,
        8, // quality estimate
        prompt.length / 4, // inputTokens estimate
        text.length / 4, // outputTokens estimate
        undefined, // errorType
        { operation: 'generate-hooks' }
      );
      
      // Remove o markdown ```json e ``` do início e fim da string
      return text.replace(/```json\n?|\n?```/g, '').trim();
    } else {
      console.log(`  -> Gerando conteúdo com OpenAI...`);
      const response = await openai.chat.completions.create({
        model: config.ai.gemini.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      
      const content = response.choices[0].message.content || '';
      
      // Track successful metric
      await aiMetrics.trackAIUsage(
        'text-generation',
        config.ai.gemini.model,
        true,
        Date.now() - startTime,
        8, // quality estimate
        prompt.length / 4, // inputTokens estimate
        content.length / 4, // outputTokens estimate
        undefined, // errorType
        { operation: 'generate-hooks' }
      );
      
      return content;
    }
  } catch (error) {
    console.error(`❌ Erro ao gerar conteúdo com ${'gemini'}:`, error);
    
    // Track failed metric
    await aiMetrics.trackAIUsage(
      'text-generation',
      'gemini-2.0-flash',
      false,
      Date.now() - startTime,
      undefined, // quality
      prompt.length / 4, // inputTokens estimate
      undefined, // outputTokens
      'api_error',
      { operation: 'generate-hooks', error: (error as Error).message }
    );
    
    // Retorna um JSON de erro padronizado para não quebrar o parsing
    return JSON.stringify({ encontrado: false, erro: (error as Error).message });
  }
}

/**
 * Busca um fato histórico ou data comemorativa com fallback para uma curiosidade.
 * Prioriza informações verificáveis e usa fallback quando há dúvidas.
 * @param datasParaPesquisar Array de datas formatadas para a pesquisa.
 * @returns Um objeto Efemerie.
 */
async function buscarFatoHistoricoComFallback(datasParaPesquisar: string[]): Promise<Efemerie> {
  console.log('[LOG] Buscando Efeméride com sistema de prioridades e validação rigorosa...');
  
  // Define um tipo local para a resposta da IA, que é mais complexa
  type RespostaEfemerieIA = { encontrado: boolean; } & Efemerie;

  try {
    // PRIORIDADE 1: Buscar fatos históricos importantes (com validação extra)
    for (const dataFormatada of datasParaPesquisar) {
      console.log(` -> [PRIORIDADE 1] Pesquisando fatos históricos para: ${dataFormatada}`);
      const promptFatoReal = `
        AVISO IMPORTANTE: Como modelo de IA, você pode ter limitações de acesso a dados históricos precisos.
        
        Pergunta: Existe um fato histórico AMPLAMENTE CONHECIDO que ocorreu EXATAMENTE em ${dataFormatada}?
        
        SEJA EXTREMAMENTE CONSERVADOR:
        - Se você não tem 100% de certeza da data exata, responda "encontrado: false"
        - Apenas eventos MUITO FAMOSOS e AMPLAMENTE DOCUMENTADOS
        - Se há QUALQUER dúvida, prefira responder "false"
        
        Formato:
        {
          "encontrado": boolean,
          "titulo": string,
          "texto": string,
          "fonte": string
        }
        
        Exemplos de eventos que devem retornar "false" por incerteza de data:
        - Eventos regionais pouco conhecidos
        - Datas que você não tem certeza absoluta
        - Fatos que podem ter ocorrido em data aproximada
      `;

      const responseJson = await gerarConteudoIA(promptFatoReal);
      const efemerideResult: RespostaEfemerieIA = JSON.parse(responseJson);

      // Validação extra: rejeitar alguns resultados comuns que podem estar incorretos
      if (efemerideResult.encontrado && efemerideResult.titulo) {
        // Lista de títulos que frequentemente têm datas incorretas
        const titulosProblematicos = [
          'revolução constitucionalista',
          'colônia agrícola',
          'rebelião',
          'rotary club',
          'fundação de'
        ];
        
        const tituloLower = efemerideResult.titulo.toLowerCase();
        const temTituloProblematico = titulosProblematicos.some(termo => 
          tituloLower.includes(termo)
        );
        
        if (temTituloProblematico) {
          console.log(`[LOG] ⚠️ Título potencialmente problemático rejeitado: ${efemerideResult.titulo}`);
        } else {
          console.log(`[LOG] ✅ Fato histórico encontrado: ${efemerideResult.titulo}`);
          return {
            titulo: efemerideResult.titulo,
            texto: efemerideResult.texto,
            fonte: efemerideResult.fonte,
          };
        }
      }
    }

    // PRIORIDADE 2: Buscar datas comemorativas oficiais (mais conservador)
    for (const dataFormatada of datasParaPesquisar) {
      console.log(` -> [PRIORIDADE 2] Pesquisando datas comemorativas para: ${dataFormatada}`);
      const promptDataComemorativa = `
        Pergunta específica: Que datas comemorativas são celebradas em ${dataFormatada}?
        
        Procure por datas comemorativas OFICIAIS estabelecidas no Brasil, incluindo:
        - Dias de profissões (Dia do Guarda Rodoviário, Dia do Professor, etc.)
        - Dias temáticos nacionais (Dia do Idoso, Dia da Mulher, etc.)
        - Datas estabelecidas por leis federais, estaduais ou municipais
        - Datas reconhecidas por organizações oficiais
        
        INSTRUÇÕES:
        - Se existe uma data comemorativa conhecida para ${dataFormatada}, retorne "encontrado: true"
        - Inclua datas de profissões, grupos sociais, temas de conscientização
        - Não precisa ser extremamente famosa, pode ser uma data comemorativa oficial menor
        - Se não souber de nenhuma, retorne "encontrado: false"
        
        Formato de resposta:
        {
          "encontrado": boolean,
          "titulo": string (Ex: "Dia do Guarda Rodoviário"),
          "texto": string (explicação sobre a data e sua importância para a sociedade),
          "fonte": string (referência simples - Ex: "Polícia Rodoviária Federal" ou "Calendário Oficial")
        }
        
        Exemplos de datas que DEVEM ser encontradas se existirem:
        - Dia do Guarda Rodoviário (23 de julho)
        - Dia do Policial Rodoviário  
        - Dia do Idoso Institucionalizado
        - Outras datas profissionais ou temáticas
      `;

      const responseJson2 = await gerarConteudoIA(promptDataComemorativa);
      const dataComemoResult: RespostaEfemerieIA = JSON.parse(responseJson2);

      if (dataComemoResult.encontrado && dataComemoResult.titulo) {
        console.log(`[LOG] 🎉 Data comemorativa encontrada: ${dataComemoResult.titulo}`);
        return {
          titulo: dataComemoResult.titulo,
          texto: dataComemoResult.texto,
          fonte: dataComemoResult.fonte,
        };
      }
    }

    // PRIORIDADE 3: Fallback - Curiosidade Amazônica Verificável
    console.log('[LOG] ⚠️ Nenhum fato histórico ou data comemorativa VERIFICÁVEL encontrada para esta data.');
    console.log('[LOG] ℹ️ Usando curiosidade amazônica verificável como fallback.');
    return FALLBACK_CURIOSIDADE;
    
  } catch (error) {
    console.error('❌ Erro ao buscar fato histórico ou data comemorativa:', error);
    console.log('[LOG] ℹ️ Usando fallback devido a erro na busca.');
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

    // 1. Buscar Efeméride (usando data de Manaus, não do arquivo)
    const dataManaus = getDateTimeManaus();
    const dia = dataManaus.day;
    const mes = dataManaus.toFormat('MMMM', { locale: 'pt-BR' });
    console.log(`[LOG] Buscando efemérides para: ${dia} de ${mes} (Data de Manaus: ${getDataCompletaManaus()})`);
    const efemeride = await buscarFatoHistoricoComFallback([`${dia} de ${mes}`]);

    // 2. Gerar Sugestões de Gancho com base na pauta usando template estruturado
    const pautaContent = `
      - Manchete: ${pautaDoDia.manchete}
      - Política: ${pautaDoDia.categorias.politica.map((n: any) => n.titulo || n.tituloPrincipal).join(', ') || 'N/A'}
      - Cidades: ${pautaDoDia.categorias.cidades.map((n: any) => n.titulo || n.tituloPrincipal).join(', ') || 'N/A'}
      - Cultura: ${pautaDoDia.categorias.cultura.map((n: any) => n.titulo || n.tituloPrincipal).join(', ') || 'N/A'}
    `;

    const promptGanchos = renderTemplate(generateHooksPrompt, {
        pautaContent: pautaContent
    });

    const ganchosJson = await gerarConteudoIA(promptGanchos);
    const sugestoes = JSON.parse(ganchosJson);

    // 3. Atualizar o arquivo da pauta com a efeméride encontrada
    pautaDoDia.efemerides = [efemeride];
    await fs.writeFile(PAUTA_FILE, JSON.stringify(pautaDoDia, null, 2));
    console.log(`[LOG] Arquivo de pauta (${path.basename(PAUTA_FILE)}) atualizado com a efemeride do dia.`);

    // 4. Incluir a efeméride no objeto de sugestões e salvar
    const sugestoesCompletas = {
      ...sugestoes,
      efemeride: efemeride
    };
    await fs.writeFile(SUGESTOES_FILE, JSON.stringify(sugestoesCompletas, null, 2));
    console.log(`✅ Sugestões de abertura salvas em: ${path.basename(SUGESTOES_FILE)}`);

  } catch (error) {
    console.error('🔥 Erro fatal ao gerar sugestões de abertura:', error);
    throw error; // Propaga o erro para o pipeline principal
  }
}

// === DETECÇÃO ROBUSTA DE EXECUÇÃO DIRETA ===
if (
  import.meta.url.includes('sugerirAbertura.ts') ||
  process.argv[1]?.includes('sugerirAbertura')
) {
  console.log('🚀 Iniciando sistema de sugestões de abertura...');
  console.log(`📅 Data de Manaus: ${getDataCompletaManaus()} (${getDataManaus()})`);

  (async () => {
    try {
      console.log('📂 Carregando dados da pauta...');
      
      await sugerirAbertura();
      
      console.log('\n🎉 Sugestões de abertura geradas com sucesso!');
      console.log('💡 Agora você pode executar: npx tsx src/roteiro/gerarRoteiro.ts');
    } catch (error) {
      console.error('\n❌ Erro durante a geração de sugestões:', (error as Error).message);
      console.error('Stack:', (error as Error).stack);
      process.exit(1);
    }
  })();
}
