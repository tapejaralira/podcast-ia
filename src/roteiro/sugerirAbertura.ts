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

// Base de dados local para efemérides brasileiras e amazônicas
const EFEMERIDES_FILE = path.join(config.paths.data, 'efemerides-brasileiras.json');

const FALLBACK_CURIOSIDADES: Efemerie[] = [
  {
    titulo: 'Encontro das Águas',
    texto: 'O famoso Encontro das Águas em Manaus, onde os rios Negro e Solimões correm lado a lado por quilômetros sem se misturar, é causado pela diferença de temperatura, velocidade e densidade das águas dos dois rios.',
    fonte: 'Instituto Nacional de Pesquisas da Amazônia (INPA)',
  },
  {
    titulo: 'Teatro Amazonas',
    texto: 'Inaugurado em 1896, o Teatro Amazonas foi construído durante o auge da economia da borracha. Sua cúpula tem 36.000 escamas cerâmicas nas cores da bandeira brasileira, representando a riqueza cultural da região.',
    fonte: 'Secretaria de Cultura do Amazonas',
  },
  {
    titulo: 'Maior Bacia Hidrográfica do Mundo',
    texto: 'A Bacia Amazônica cobre cerca de 7 milhões de km², sendo maior que toda a Europa. No Amazonas, esta rede fluvial é a principal via de transporte, conectando comunidades isoladas.',
    fonte: 'Agência Nacional de Águas (ANA)',
  }
];

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
 * Busca efemérides brasileiras locais primeiro, depois usa IA como fallback
 */
async function buscarEfemerideBrasileiraLocal(dia: number, mes: string): Promise<Efemerie | null> {
  try {
    const efemeridesData = await fs.readFile(EFEMERIDES_FILE, 'utf-8');
    const efemerides = JSON.parse(efemeridesData);
    
    // Mapear nome do mês para número
    const mesesMap: { [key: string]: string } = {
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
      'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
      'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };
    
    const numeroMes = mesesMap[mes.toLowerCase()] || '01';
    const chaveData = `${dia.toString().padStart(2, '0')}-${numeroMes}`;
    
    if (efemerides[chaveData] && efemerides[chaveData].length > 0) {
      // Pega a primeira efeméride da data (pode ser expandido para escolher a mais relevante)
      const efemeride = efemerides[chaveData][0];
      console.log(`[LOG] ✅ Efeméride brasileira encontrada localmente: ${efemeride.titulo}`);
      return {
        titulo: efemeride.titulo,
        texto: efemeride.texto,
        fonte: efemeride.fonte
      };
    }
    
    return null;
  } catch (error) {
    console.warn('[LOG] ⚠️ Erro ao ler base local de efemérides:', error);
    return null;
  }
}

/**
 * Busca efemérides brasileiras usando IA com prompts melhorados
 */
async function buscarEfemerideBrasileiraIA(dataFormatada: string): Promise<Efemerie | null> {
  console.log(` -> Buscando efemérides BRASILEIRAS para: ${dataFormatada}`);
  
  const promptBrasileiro = `
    IMPORTANTE: Procure APENAS por fatos históricos brasileiros ou pessoas brasileiras nascidas/falecidas em ${dataFormatada}.
    
    PRIORIDADE ABSOLUTA para eventos/pessoas BRASILEIRAS:
    - Nascimento ou morte de personalidades brasileiras importantes
    - Eventos históricos que ocorreram no Brasil
    - Datas comemorativas brasileiras oficiais
    - Marcos da história brasileira
    
    REJEITE automaticamente:
    - Eventos internacionais (mesmo que famosos)
    - Personalidades estrangeiras
    - Fatos que não tenham relação com o Brasil
    
    Se encontrar um fato brasileiro VERIFICÁVEL para ${dataFormatada}, retorne:
    {
      "encontrado": true,
      "titulo": "Nome do evento/pessoa brasileira",
      "texto": "Descrição focando na importância para o Brasil",
      "fonte": "Fonte confiável brasileira"
    }
    
    Se NÃO encontrar nada brasileiro verificável, retorne:
    {
      "encontrado": false
    }
    
    LEMBRE-SE: É melhor retornar "false" do que inventar ou incluir eventos não-brasileiros.
  `;
  
  try {
    const responseJson = await gerarConteudoIA(promptBrasileiro);
    const result = JSON.parse(responseJson);
    
    if (result.encontrado && result.titulo) {
      console.log(`[LOG] ✅ Efeméride brasileira encontrada via IA: ${result.titulo}`);
      return {
        titulo: result.titulo,
        texto: result.texto,
        fonte: result.fonte
      };
    }
    
    return null;
  } catch (error) {
    console.warn('[LOG] ⚠️ Erro na busca de efeméride brasileira via IA:', error);
    return null;
  }
}

/**
 * Retorna uma curiosidade amazônica rotativa
 */
function obterCuriosidadeAmazonicaRotativa(): Efemerie {
  // Usa o dia do mês para rotacionar as curiosidades
  const dataManaus = getDateTimeManaus();
  const indice = dataManaus.day % FALLBACK_CURIOSIDADES.length;
  return FALLBACK_CURIOSIDADES[indice];
}
/**
 * Interface para opções de efemérides para seleção manual
 */
interface OpcoesEfemerides {
  fatosBrasileiros: Efemerie[];
  efemeridesIA: Efemerie[];
  curiosidadesAmazonicas: Efemerie[];
  recomendacao: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
    motivo: string;
  };
}

/**
 * Busca todas as opções de efemérides para seleção manual
 */
async function buscarTodasOpcoesEfemerides(datasParaPesquisar: string[]): Promise<OpcoesEfemerides> {
  console.log('[LOG] 🔍 Buscando TODAS as opções de efemérides para seleção manual...');
  
  const dataManaus = getDateTimeManaus();
  const dia = dataManaus.day;
  const mes = dataManaus.toFormat('MMMM', { locale: 'pt-BR' });

  const opcoes: OpcoesEfemerides = {
    fatosBrasileiros: [],
    efemeridesIA: [],
    curiosidadesAmazonicas: FALLBACK_CURIOSIDADES, // Sempre disponível
    recomendacao: {
      tipo: 'curiosidadesAmazonicas',
      indice: 0,
      motivo: 'Fallback padrão'
    }
  };

  try {
    // OPÇÃO 1: Base local de efemérides brasileiras
    console.log(`\n📚 [OPÇÃO 1] Consultando base local brasileira para: ${dia} de ${mes}`);
    const efemeridesLocal = await buscarEfemerideBrasileiraLocal(dia, mes);
    if (efemeridesLocal) {
      opcoes.fatosBrasileiros.push(efemeridesLocal);
      opcoes.recomendacao = {
        tipo: 'fatosBrasileiros',
        indice: 0,
        motivo: 'Fato brasileiro verificado encontrado na base local'
      };
      console.log(`   ✅ Encontrado: ${efemeridesLocal.titulo}`);
    } else {
      console.log(`   ❌ Nenhum fato brasileiro encontrado na base local para esta data`);
    }

    // OPÇÃO 2: Busca de efemérides brasileiras via IA
    console.log(`\n🤖 [OPÇÃO 2] Buscando efemérides brasileiras via IA...`);
    for (const dataFormatada of datasParaPesquisar) {
      console.log(`   -> Pesquisando fatos brasileiros para: ${dataFormatada}`);
      const efemeridesBrasil = await buscarEfemerideBrasileiraIA(dataFormatada);
      if (efemeridesBrasil) {
        opcoes.efemeridesIA.push(efemeridesBrasil);
        console.log(`   ✅ Encontrado: ${efemeridesBrasil.titulo}`);
        
        // Se não temos fato local, esta vira a recomendação
        if (opcoes.fatosBrasileiros.length === 0) {
          opcoes.recomendacao = {
            tipo: 'efemeridesIA',
            indice: 0,
            motivo: 'Efeméride brasileira encontrada via IA'
          };
        }
      } else {
        console.log(`   ❌ Nenhuma efeméride brasileira encontrada via IA para ${dataFormatada}`);
      }
    }

    // OPÇÃO 3: Datas comemorativas brasileiras via IA
    console.log(`\n🎉 [OPÇÃO 3] Buscando datas comemorativas brasileiras...`);
    for (const dataFormatada of datasParaPesquisar) {
      console.log(`   -> Pesquisando datas comemorativas para: ${dataFormatada}`);
      const promptDataComemorativa = `
        Procure por datas comemorativas BRASILEIRAS celebradas em ${dataFormatada}:
        
        FOQUE APENAS EM:
        - Dias de profissões reconhecidas no Brasil
        - Datas comemorativas nacionais brasileiras
        - Dias estabelecidos por leis federais/estaduais brasileiras
        - Datas relacionadas à cultura ou sociedade brasileira
        
        Se encontrar uma data comemorativa brasileira para ${dataFormatada}:
        {
          "encontrado": true,
          "titulo": "Nome da data comemorativa",
          "texto": "Explicação da importância, conectando com o Brasil/Amazonas quando possível",
          "fonte": "Fonte oficial brasileira"
        }
        
        Se não encontrar nada especificamente brasileiro:
        {
          "encontrado": false
        }
      `;

      try {
        const responseJson = await gerarConteudoIA(promptDataComemorativa);
        const dataComemoResult = JSON.parse(responseJson);

        if (dataComemoResult.encontrado && dataComemoResult.titulo) {
          const dataComemo = {
            titulo: dataComemoResult.titulo,
            texto: dataComemoResult.texto,
            fonte: dataComemoResult.fonte,
          };
          opcoes.efemeridesIA.push(dataComemo);
          console.log(`   ✅ Encontrado: ${dataComemo.titulo}`);
          
          // Se não temos nem fato local nem efeméride, esta vira a recomendação
          if (opcoes.fatosBrasileiros.length === 0 && opcoes.efemeridesIA.length === 1) {
            opcoes.recomendacao = {
              tipo: 'efemeridesIA',
              indice: opcoes.efemeridesIA.length - 1,
              motivo: 'Data comemorativa brasileira encontrada'
            };
          }
        } else {
          console.log(`   ❌ Nenhuma data comemorativa encontrada para ${dataFormatada}`);
        }
      } catch (error) {
        console.warn(`   ⚠️ Erro na busca de data comemorativa para ${dataFormatada}:`, error);
      }
    }

    // Relatório final
    console.log(`\n📊 [RELATÓRIO] Opções encontradas:`);
    console.log(`   📚 Fatos Brasileiros (base local): ${opcoes.fatosBrasileiros.length}`);
    console.log(`   🤖 Efemérides via IA: ${opcoes.efemeridesIA.length}`);
    console.log(`   🌳 Curiosidades Amazônicas: ${opcoes.curiosidadesAmazonicas.length}`);
    console.log(`   🎯 Recomendação: ${opcoes.recomendacao.tipo} (${opcoes.recomendacao.motivo})`);

    return opcoes;
    
  } catch (error) {
    console.error('❌ Erro ao buscar opções de efemérides:', error);
    return opcoes; // Retorna com apenas as curiosidades amazônicas
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

    // 1. Buscar TODAS as opções de efemérides para seleção manual
    const dataManaus = getDateTimeManaus();
    const dia = dataManaus.day;
    const mes = dataManaus.toFormat('MMMM', { locale: 'pt-BR' });
    console.log(`[LOG] Buscando todas as opções de efemérides para: ${dia} de ${mes} (Data de Manaus: ${getDataCompletaManaus()})`);
    
    const opcoesEfemerides = await buscarTodasOpcoesEfemerides([`${dia} de ${mes}`]);

    // 2. Usar a recomendação automática como padrão
    let efemerideEscolhida: Efemerie;
    switch (opcoesEfemerides.recomendacao.tipo) {
      case 'fatosBrasileiros':
        efemerideEscolhida = opcoesEfemerides.fatosBrasileiros[opcoesEfemerides.recomendacao.indice];
        break;
      case 'efemeridesIA':
        efemerideEscolhida = opcoesEfemerides.efemeridesIA[opcoesEfemerides.recomendacao.indice];
        break;
      case 'curiosidadesAmazonicas':
        efemerideEscolhida = opcoesEfemerides.curiosidadesAmazonicas[opcoesEfemerides.recomendacao.indice];
        break;
    }

    console.log(`[LOG] ✅ Efeméride recomendada selecionada: ${efemerideEscolhida.titulo}`);

    // 3. Gerar Sugestões de Gancho com base na pauta usando template estruturado
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

    // 4. Atualizar o arquivo da pauta com a efeméride escolhida
    pautaDoDia.efemerides = [efemerideEscolhida];
    await fs.writeFile(PAUTA_FILE, JSON.stringify(pautaDoDia, null, 2));
    console.log(`[LOG] Arquivo de pauta (${path.basename(PAUTA_FILE)}) atualizado com a efemeride selecionada.`);

    // 5. Incluir TODAS as opções de efemérides no arquivo de sugestões para seleção manual
    const sugestoesCompletas = {
      ...sugestoes,
      efemeride: efemerideEscolhida, // A escolhida automaticamente
      opcoesEfemerides: opcoesEfemerides, // TODAS as opções para seleção manual
      instrucoes: {
        como_escolher: "Para mudar a efeméride, edite o campo 'efemeride' acima copiando uma das opções de 'opcoesEfemerides'",
        categorias: {
          fatosBrasileiros: "Eventos históricos reais verificados na base de dados local",
          efemeridesIA: "Fatos brasileiros e datas comemorativas encontrados via IA",
          curiosidadesAmazonicas: "Curiosidades sobre a Amazônia sempre disponíveis"
        }
      }
    };
    
    await fs.writeFile(SUGESTOES_FILE, JSON.stringify(sugestoesCompletas, null, 2));
    console.log(`✅ Sugestões de abertura salvas em: ${path.basename(SUGESTOES_FILE)}`);
    
    // 6. Exibir resumo das opções encontradas
    console.log(`\n📋 [RESUMO] Opções disponíveis para seleção manual:`);
    
    if (opcoesEfemerides.fatosBrasileiros.length > 0) {
      console.log(`\n📚 FATOS BRASILEIROS (${opcoesEfemerides.fatosBrasileiros.length}):`);
      opcoesEfemerides.fatosBrasileiros.forEach((fato, i) => {
        console.log(`   ${i + 1}. ${fato.titulo}`);
      });
    }
    
    if (opcoesEfemerides.efemeridesIA.length > 0) {
      console.log(`\n🤖 EFEMÉRIDES VIA IA (${opcoesEfemerides.efemeridesIA.length}):`);
      opcoesEfemerides.efemeridesIA.forEach((efem, i) => {
        console.log(`   ${i + 1}. ${efem.titulo}`);
      });
    }
    
    console.log(`\n🌳 CURIOSIDADES AMAZÔNICAS (${opcoesEfemerides.curiosidadesAmazonicas.length}):`);
    opcoesEfemerides.curiosidadesAmazonicas.forEach((cur, i) => {
      console.log(`   ${i + 1}. ${cur.titulo}`);
    });
    
    console.log(`\n🎯 ESCOLHA AUTOMÁTICA: ${efemerideEscolhida.titulo}`);
    console.log(`💡 Para mudar: edite o campo 'efemeride' em ${path.basename(SUGESTOES_FILE)}`);

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
