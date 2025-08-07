// src/roteiro/gerarRoteiro.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai'; // <-- MUDANÇA: Importa Gemini
// Tipos corrigidos e limpos
import { NoticiasCategorizadas, NoticiaCompleta } from '../types.js';
import { config, filePaths } from '../config.js';
import { PautaDoDiaSchema, RoteiroPodcastSchema } from '../schemas/core.schemas.js';
import { validateWithSchema } from '../utils/validation.js';
import { getDataManaus, getDataCompletaManaus } from '../utils/timezone.js';

// === INTEGRAÇÃO COM SISTEMA DE SELEÇÃO MANUAL ===

interface SelecaoManual {
  data: string;
  manchete: {
    id: string;
    titulo: string;
    categoria: string;
  };
  // Dados completos da manchete selecionada
  mancheteCompleta: NoticiaCompleta;
  noticiasEscolhidas: Array<{
    categoria: string;
    ids: string[];
    total: number;
  }>;
  // Array com dados completos de todas as notícias selecionadas
  noticiasCompletas: NoticiaCompleta[];
  observacoes?: string;
  efemerideSelecionada?: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
    efemeride: {
      titulo: string;
      texto: string;
      fonte: string;
    };
  };
}

async function verificarSelecaoManual(): Promise<SelecaoManual | null> {
  try {
    console.log('📝 Verificando seleção manual...');
    const content = await fs.readFile(filePaths.selecaoManualFile, 'utf-8');
    const selecao = JSON.parse(content);
    
    // Verificar se é uma seleção válida e recente
    const dataSelecao = new Date(selecao.data);
    const hoje = new Date();
    const mesmoDia = dataSelecao.toDateString() === hoje.toDateString();
    
    if (mesmoDia && selecao.manchete?.id && Array.isArray(selecao.noticiasEscolhidas)) {
      console.log('✅ Seleção manual encontrada e válida');
      return selecao;
    }
    
    console.log('ℹ️ Nenhuma seleção manual válida encontrada');
    return null;
  } catch (error) {
    console.log('ℹ️ Nenhuma seleção manual encontrada');
    return null;
  }
}

async function aplicarSelecaoManualNoRoteiro(noticias: NoticiaCompleta[], selecao: SelecaoManual): Promise<NoticiaCompleta[]> {
    console.log('📝 Aplicando seleção manual no gerador de roteiro...');
    
    // Se a seleção tem dados completos, usar diretamente
    if (selecao.mancheteCompleta && selecao.noticiasCompletas) {
        console.log('✅ Usando dados completos da seleção manual');
        console.log(`   Manchete: ${selecao.mancheteCompleta.titulo}`);
        console.log(`   Notícias selecionadas: ${selecao.noticiasCompletas.length}`);
        
        // Retornar manchete + notícias selecionadas diretamente dos dados salvos
        return [selecao.mancheteCompleta, ...selecao.noticiasCompletas];
    }
    
    // Fallback para compatibilidade com formato antigo
    console.log('⚠️ Usando fallback para formato antigo da seleção manual');
    
    // Encontrar a manchete selecionada
    const manchete = noticias.find(n => n.id === selecao.manchete.id);
    if (!manchete) {
        console.warn('⚠️ Manchete selecionada não encontrada, usando primeira do ranking');
        return noticias; // Retorna ordem original se não encontrar
    }
    
    // Coletar todos os IDs das notícias escolhidas
    const todosOsIdsEscolhidos: string[] = [];
    for (const categoria of selecao.noticiasEscolhidas) {
        todosOsIdsEscolhidos.push(...categoria.ids);
    }
    
    // Encontrar as notícias selecionadas
    const noticiasEscolhidas = noticias.filter(n => 
        todosOsIdsEscolhidos.includes(n.id)
    );
    
    // Ordenar notícias: manchete primeiro, depois selecionadas, depois restantes
    const noticiasOrdenadas = [
        manchete,
        ...noticiasEscolhidas.filter(n => n.id !== manchete.id),
        ...noticias.filter(n => 
            n.id !== manchete.id && 
            !todosOsIdsEscolhidos.includes(n.id)
        )
    ];
    
    console.log(`✅ Seleção manual aplicada no roteiro:`);
    console.log(`   Manchete: ${manchete.titulo}`);
    console.log(`   Notícias selecionadas: ${noticiasEscolhidas.length}`);
    console.log(`   Total reordenado: ${noticiasOrdenadas.length}`);
    
    return noticiasOrdenadas;
}

// === GERAÇÃO DE ROTEIRO ===

// --- IMPLEMENTAÇÃO COM GEMINI ---
const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey);
const geminiModel = genAI.getGenerativeModel({ model: config.ai.gemini.model });

// Interface para notícia com conteúdo completo
interface NoticiaComConteudo extends NoticiaCompleta {
  conteudoCompleto?: string;
  fontesUtilizadas?: string[];    // ✅ NOVO: Lista de fontes realmente utilizadas no scraping
  statusScraping?: 'sucesso' | 'falhou' | 'vazio';
}

// Função para extrair conteúdo de diferentes sites de notícias
async function extrairConteudoNoticia(url: string, titulo: string): Promise<{conteudo: string | null, status: string}> {
  try {
    console.log(`📄 [SCRAPING] Buscando conteúdo: ${titulo}`);
    console.log(`🔗 [SCRAPING] URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Seletores comuns para diferentes sites de notícias
    const seletores = [
      'article p',
      '.content p',
      '.post-content p',
      '.entry-content p',
      '.article-content p',
      '.news-content p',
      '.texto p',
      '.materia p',
      '.noticia-texto p',
      '.story-content p',
      '.text p',
      'div[class*="content"] p',
      'div[class*="texto"] p',
      'div[class*="article"] p',
      '.main-content p',
      '#content p'
    ];
    
    let conteudo = '';
    let seletorUsado = '';
    
    for (const seletor of seletores) {
      const paragrafos = $(seletor);
      if (paragrafos.length > 0) {
        paragrafos.each((_, element) => {
          const texto = $(element).text().trim();
          if (texto.length > 30) { // Filtrar parágrafos muito curtos
            conteudo += texto + '\n\n';
          }
        });
        if (conteudo.length > 200) {
          seletorUsado = seletor;
          break; // Para no primeiro seletor que encontrar conteúdo suficiente
        }
      }
    }
    
    // Fallback: tentar pegar todo o texto do body
    if (conteudo.length < 200) {
      console.log(`⚠️ [SCRAPING] Conteúdo insuficiente (${conteudo.length} chars), tentando fallback...`);
      const bodyText = $('body').text()
        .replace(/\s+/g, ' ')
        .trim();
      conteudo = bodyText.substring(0, 3000); // Limitar para evitar muito ruído
      seletorUsado = 'body (fallback)';
    }
    
    // Limpeza final
    conteudo = conteudo
      .replace(/\n{3,}/g, '\n\n') // Remover quebras excessivas
      .replace(/\s{2,}/g, ' ') // Remover espaços excessivos
      .trim();
    
    if (conteudo.length > 100) {
      console.log(`✅ [SCRAPING] Sucesso! ${conteudo.length} caracteres extraídos`);
      console.log(`🎯 [SCRAPING] Seletor usado: ${seletorUsado}`);
      console.log(`📝 [SCRAPING] Preview: ${conteudo.substring(0, 150)}...`);
      return { conteudo, status: 'sucesso' };
    } else {
      console.log(`❌ [SCRAPING] Conteúdo insuficiente: ${conteudo.length} caracteres`);
      return { conteudo: null, status: 'vazio' };
    }
    
  } catch (error) {
    console.error(`❌ [SCRAPING] Erro ao extrair ${url}:`, (error as Error).message);
    return { conteudo: null, status: 'falhou' };
  }
}

// ✅ NOVA FUNÇÃO: Extrair conteúdo de múltiplos links
async function extrairConteudoCompleto(noticia: NoticiaCompleta): Promise<{conteudo: string, fontesUtilizadas: string[]}> {
  let conteudoCompleto = '';
  const fontesUtilizadas: string[] = [];
  
  // Se a notícia tem múltiplos links, processar todos
  const links = noticia.links && noticia.links.length > 0 ? noticia.links : [noticia.link];
  const fontes = noticia.fontes && noticia.fontes.length > 0 ? noticia.fontes : [noticia.fonte];
  
  console.log(`📄 [SCRAPING] Processando ${links.length} link(s) para: ${noticia.titulo}`);
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const fonte = fontes[i] || fontes[0] || 'Fonte não identificada';
    
    if (!link || link.trim() === '') {
      console.log(`⚠️ [SCRAPING] Link ${i + 1} vazio, pulando...`);
      continue;
    }
    
    console.log(`🔗 [SCRAPING] Link ${i + 1}/${links.length}: ${fonte}`);
    
    const { conteudo, status } = await extrairConteudoNoticia(link, noticia.titulo);
    
    if (status === 'sucesso' && conteudo) {
      conteudoCompleto += `\n\n=== FONTE: ${fonte} ===\n${conteudo}`;
      fontesUtilizadas.push(`${fonte}: ${link}`);
      console.log(`✅ [SCRAPING] Sucesso na fonte ${fonte} (${conteudo.length} chars)`);
    } else {
      console.log(`❌ [SCRAPING] Falha na fonte ${fonte}: ${status}`);
    }
    
    // Delay entre requisições para não sobrecarregar servidores
    if (i < links.length - 1) {
      console.log(`⏳ [SCRAPING] Aguardando 2s antes do próximo link...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Se não conseguiu extrair nada, usar o resumo original
  if (conteudoCompleto.trim() === '') {
    console.log(`⚠️ [SCRAPING] Nenhum conteúdo extraído, usando resumo original`);
    conteudoCompleto = noticia.resumo;
    fontesUtilizadas.push(`${noticia.fonte}: resumo original`);
  }
  
  return {
    conteudo: conteudoCompleto.trim(),
    fontesUtilizadas
  };
}

// Função para enriquecer notícias com conteúdo completo
async function enriquecerNoticiasComConteudo(noticias: NoticiaCompleta[]): Promise<NoticiaComConteudo[]> {
  const noticiasEnriquecidas: NoticiaComConteudo[] = [];
  
  console.log(`\n🔍 [SCRAPING] Iniciando extração de conteúdo para ${noticias.length} notícias...`);
  
  for (let i = 0; i < noticias.length; i++) {
    const noticia = noticias[i];
    console.log(`\n📰 [SCRAPING] Processando ${i + 1}/${noticias.length}: ${noticia.titulo}`);
    
    // ✅ USANDO NOVA FUNÇÃO: Processar múltiplos links
    const { conteudo, fontesUtilizadas } = await extrairConteudoCompleto(noticia);
    
    noticiasEnriquecidas.push({
      ...noticia,
      conteudoCompleto: conteudo,
      fontesUtilizadas: fontesUtilizadas,
      statusScraping: conteudo.length > 100 ? 'sucesso' : 'vazio'
    });
    
    // Delay para não sobrecarregar os servidores
    console.log(`⏳ [SCRAPING] Aguardando 2 segundos antes da próxima requisição...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Relatório final
  const sucessos = noticiasEnriquecidas.filter(n => n.statusScraping === 'sucesso').length;
  const falhas = noticiasEnriquecidas.filter(n => n.statusScraping === 'falhou').length;
  const vazios = noticiasEnriquecidas.filter(n => n.statusScraping === 'vazio').length;
  
  console.log(`\n📊 [SCRAPING] Relatório Final:`);
  console.log(`✅ Sucessos: ${sucessos}/${noticias.length}`);
  console.log(`❌ Falhas: ${falhas}/${noticias.length}`);
  console.log(`⚠️ Vazios: ${vazios}/${noticias.length}`);
  
  return noticiasEnriquecidas;
}

const carregarDadosNoticias = async (): Promise<NoticiasCategorizadas> => {
  const data = await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8');
  return JSON.parse(data);
};

// A função agora aceita quatro parâmetros: 'noticias', 'template', 'personagens' e 'sugestoesAbertura'
async function gerarRoteiroComIA(noticias: NoticiasParaRoteiro, template: string, personagens: any, sugestoesAbertura: any): Promise<string> {
  console.log('🤖 Chamando API do Gemini para gerar roteiro...');
  
  // O prompt foi enriquecido com sugestões de abertura e efemérides
  const prompt = `
    Você é um roteirista de podcast especialista em criar conteúdo estruturado e otimizado para TTS.

    **Contexto dos Personagens e do Podcast:**
    ---
    **Podcast:** ${personagens.podcast.nome} - ${personagens.podcast.slogan}
    **Identidade:** ${personagens.podcast.identidade}

    **Apresentadores:**
    ${personagens.apresentadores.map((p: any) => `
    - **Nome:** ${p.nome}
      **Perfil:** ${p.perfil_geral}
      **Tom de Voz:** ${p.tom_de_voz}
      **Expressões Regionais:** ${p.expressoes_regionais?.join(', ') || 'Nenhuma específica'}
    `).join('\n')}
    ---

    **Efeméride do Dia (Use no Cold Open):**
    ${sugestoesAbertura.efemeride ? `
    - **Título:** ${sugestoesAbertura.efemeride.titulo}
    - **Fato:** ${sugestoesAbertura.efemeride.texto}
    - **Fonte:** ${sugestoesAbertura.efemeride.fonte}
    ` : 'Use curiosidade amazônica como fallback.'}

    **INSTRUÇÕES PARA O COLD OPEN:**
    - Use a efeméride/curiosidade acima como base
    - Um apresentador conta a curiosidade (35-45 segundos) de forma super casual
    - O outro reage naturalmente (20-25 segundos)
    - IMPORTANTE: É uma conversa APENAS ENTRE ELES - não se dirijam à audiência ainda
    - Use linguagem super informal: "Cara", "Mano", "Tu sabia que...", "Nossa"
    - NÃO conecte com as notícias - é só uma curiosidade entre amigos
    - Tom: descontraído, amigável, como uma conversa antes do trabalho começar
    - APLIQUE todas as regras de formatação TTS (números por extenso, quebras de linha, pontuação natural)
    
    **INSTRUÇÕES PARA AS NOTÍCIAS (DO CARDÁPIO EM DIANTE):**
    - Agora sim podem falar DIRETAMENTE para os ouvintes do podcast
    - Tom profissional mas próximo, como apresentadores experientes
    - Podem interagir com a audiência: "Pessoal", "Galera", "Vocês que tão ouvindo"
    - Use linguagem informal amazônica mas mantenha clareza jornalística
    ---

    **Template do Roteiro (Preencha EXATAMENTE esta estrutura):**
    ---
    ${template}
    ---

    **Dados das Notícias (COM CONTEÚDO COMPLETO DE MÚLTIPLAS FONTES):**
    - **Manchete Principal:** ${noticias.manchete.titulo}
    - **Fontes da Manchete:** ${noticias.manchete.fontesUtilizadas?.join('; ') || noticias.manchete.fonte}
    - **Status Scraping Manchete:** ${noticias.manchete.statusScraping || 'não verificado'}
    
    - **Notícias Selecionadas (use as 5 primeiras):**
      ${noticias.noticias.slice(0, 5).map((n: NoticiaComConteudo, i: number) => `
      ${i + 1}. **${n.titulo}** (Categoria: ${n.categoria})
         **Fontes Consultadas:** ${n.fontesUtilizadas?.length || 0} fonte(s)
         ${n.fontesUtilizadas?.map(fonte => `   - ${fonte}`).join('\n         ') || `   - ${n.fonte}`}
         
         **Status Scraping:** ${n.statusScraping || 'não verificado'}
         
         **CONTEÚDO COMPLETO CONSOLIDADO:**
         ${n.conteudoCompleto ? n.conteudoCompleto.substring(0, 2000) + '...' : 'Conteúdo não disponível - usar resumo: ' + n.resumo?.substring(0, 200)}
      `).join('\n')}
    
    **INSTRUÇÕES CRÍTICAS SOBRE CONTEÚDO E FONTES:**
    - Use APENAS informações do conteúdo completo extraído fornecido acima
    - Quando apropriado, mencione as fontes: "Segundo informações do G1 e A Crítica..."
    - Priorize sempre o conteúdo completo sobre o resumo original
    - NÃO invente fatos, datas, nomes ou detalhes não mencionados no conteúdo
    - Se múltiplas fontes têm perspectivas diferentes, use a informação mais completa
    - Para o episódio final, compile uma lista de todas as fontes utilizadas
    - Mantenha absoluta fidelidade aos fatos apresentados no conteúdo extraído
    - Se o conteúdo for limitado ou o scraping falhou, foque apenas no que está disponível
    - Mencione a fonte da notícia quando apropriado
    ---

    **Instruções CRÍTICAS:**
    
    1. **PREENCHA O TEMPLATE**: Substitua TODOS os {{placeholders}} pelos valores corretos:
       - {{data}}: Use a data atual
       - {{numeroEpisodio}}: Use um número sequencial
       - {{tituloSugerido}}: Crie um título baseado na manchete
       - {{tipoColdOpen}}: Baseado na efeméride ou sugestão
       - {{apresentadorColdOpen}}: Tainá ou Iraí (quem vai apresentar a curiosidade)
       - {{apresentadorReagente}}: O outro apresentador (quem vai reagir)
       - {{textoColdOpen}}: Texto da curiosidade/efeméride (35-45 segundos, bem formatado para TTS)
       - {{reacaoColdOpen}}: Reação natural do outro apresentador (20-25 segundos, com pausas naturais)
       - {{apresentadorCardapio}}: O outro apresentador (alternância)
       - {{cardapioNoticias}}: Lista rápida das 5 notícias do episódio
       
       **IMPORTANTE**: Para cada notícia (1-5), o {{noticiaX_texto_completo}} deve SEMPRE começar com uma frase de contexto específica da posição da notícia:
       - Notícia 1: Frase da categoria "PRIMEIRA NOTÍCIA"
       - Notícia 2: Frase da categoria "SEGUNDA NOTÍCIA"  
       - Notícia 3: Frase da categoria "TERCEIRA NOTÍCIA"
       - Notícia 4: Frase da categoria "QUARTA NOTÍCIA"
       - Notícia 5: Frase da categoria "QUINTA NOTÍCIA (ÚLTIMA)"
       
    2. **COLD OPEN ESPECIAL**: 
       - Deve ser TOTALMENTE independente das notícias do dia
       - Uma curiosidade, efeméride ou data comemorativa
       - Diálogo CASUAL e NATURAL entre os dois apresentadores como amigos conversando
       - O primeiro apresentador compartilha a curiosidade como se estivesse contando para um amigo
       - O segundo reage de forma natural usando sua personalidade (pode ser surpresa, interesse, comentário adicional)
       - NÃO deve fazer gancho com as notícias do episódio
       - NÃO se dirijam à audiência - falem entre vocês
       - Use linguagem informal: "Cara", "Mano", "Tu sabia que...", "Nossa", "Sério?"
       - Exemplo de estrutura:
         * Apresentador 1: "Cara, tu sabia que hoje faz duzentos anos que..." [conta a curiosidade]
         * Apresentador 2: "Sério? Nossa, que massa! Eu não sabia disso..." [reação natural e casual]
       
    3. **ESTRUTURA DAS 5 NOTÍCIAS COM GANCHOS NATURAIS**: Para cada notícia (1 a 5):
       - {{noticiaX_categoria}}: Use o emoji da classificação
       - {{noticiaX_titulo}}: Título da notícia
       - {{noticiaX_trilha}}: Nome do arquivo de trilha baseado na categoria
       - {{noticiaX_volume}}: Volume da trilha (ex: -24dB)
       - {{noticiaX_apresentador}}: Tainá, Iraí, Tainá, Iraí, Tainá (alternância)
       - {{noticiaX_contexto}}: Frase de contexto/introdução específica para a posição da notícia
       - {{noticiaX_texto_completo}}: Texto completo EXTENSO de 80-120 segundos + GANCHO NATURAL ao final
       - {{noticiaX_comentarista}}: Iraí, Tainá, Iraí, Tainá, Iraí (alternância inversa)
       - {{noticiaX_comentario}}: Comentário de 25-35 segundos
    
    **FRASES DE CONTEXTO POR POSIÇÃO (Use como inspiração variada):**
    
    **PRIMEIRA NOTÍCIA:**
    - "Para a primeira notícia de hoje..."
    - "Vamos começar com uma notícia que..."
    - "A primeira matéria fala sobre..."
    - "Para abrir o noticiário de hoje..."
    - "Começamos com uma informação importante sobre..."
    - "A primeira notícia que trouxemos hoje..."
    - "Para iniciar, vamos falar sobre..."
    - "Nossa matéria de abertura trata de..."
    
    **SEGUNDA NOTÍCIA:**
    - "A segunda notícia de hoje..."
    - "Na sequência, temos uma matéria sobre..."
    - "Agora, vamos para a segunda informação..."
    - "A próxima notícia fala sobre..."
    - "Em seguida, trouxemos uma matéria que..."
    - "A segunda matéria do dia aborda..."
    - "Continuando, temos uma notícia sobre..."
    - "Para a segunda matéria, selecionamos..."
    
    **TERCEIRA NOTÍCIA:**
    - "A terceira matéria de hoje fala sobre..."
    - "Olha essa próxima notícia..."
    - "Na terceira notícia, vamos abordar..."
    - "Chegamos à terceira matéria do dia..."
    - "A próxima informação que trouxemos..."
    - "Para a terceira notícia, selecionamos..."
    - "Agora, a terceira matéria fala sobre..."
    - "Nossa terceira informação trata de..."
    
    **QUARTA NOTÍCIA:**
    - "A quarta notícia de hoje..."
    - "Chegando à quarta matéria..."
    - "A próxima informação fala sobre..."
    - "Na quarta notícia do dia..."
    - "Continuando com a quarta matéria..."
    - "A penúltima notícia que trouxemos..."
    - "Para a quarta matéria, temos..."
    - "Agora, vamos para a quarta informação..."
    
    **QUINTA NOTÍCIA (ÚLTIMA):**
    - "E para a última matéria de hoje..."
    - "Para encerrar o noticiário..."
    - "A quinta e última notícia..."
    - "Para fechar, trouxemos uma matéria sobre..."
    - "E por último, vamos falar sobre..."
    - "A última informação do dia trata de..."
    - "Para concluir o BubuiA News de hoje..."
    - "E fechando o nosso noticiário..."
    
    **INSTRUÇÕES PARA USO DOS CONTEXTOS:**
    - Use APENAS UMA frase de contexto por notícia
    - Respeite EXATAMENTE a ordem: 1ª, 2ª, 3ª, 4ª, 5ª notícia
    - Varie as frases ao longo do episódio - não repita o mesmo estilo
    - A frase de contexto deve vir IMEDIATAMENTE antes do texto principal
    - Mantenha naturalidade e fluidez na transição
    - NÃO use contexto repetitivo como "a próxima" para todas
    
    **GANCHOS NATURAIS PARA TRANSIÇÃO (Use como inspiração variada):**
    
    **Chamadas Diretas ao Colega:**
    - "O que você acha, [Nome]?"
    - "E aí, [Nome], qual sua opinião?"
    - "Interessante né, [Nome]?"
    - "Bacana né, [Nome]?"
    - "Complicado né, [Nome]?"
    - "É tenso né, [Nome]?"
    - "Que massa né, [Nome]?"
    - "É uma boa né, [Nome]?"
    - "Preocupante né, [Nome]?"
    - "Animador né, [Nome]?"
    
    **Chamadas à Audiência:**
    - "Gente, qual a opinião de vocês?"
    - "E vocês aí, o que acham?"
    - "Pessoal, comentem aí embaixo!"
    - "Uma pena né, pessoal?"
    - "Que alegria né, galera?"
    - "Complicado isso aí, gente!"
    - "Importante demais isso, pessoal!"
    - "Vamos torcer né, galera?"
    
    **Reflexões Abertas:**
    - "Fica a reflexão..."
    - "É pra pensar né..."
    - "Bom saber disso..."
    - "Vamos acompanhar os desdobramentos..."
    - "Esperamos que dê certo..."
    - "Tomara que melhore..."
    - "É aguardar e ver..."
    - "Vamos ver no que vai dar..."
    
    **Conectores Regionais:**
    - "Aí sim, meu!"
    - "É isso aí, cabra!"
    - "Boa, caboclo!"
    - "Essa é nossa região!"
    - "Assim que é!"
    - "Desse jeito mesmo!"
    
    **IMPORTANTE SOBRE OS GANCHOS:**
    - Use APENAS UM gancho por notícia (no final do texto principal)
    - Varie os tipos de gancho ao longo do episódio
    - Adapte o tom do gancho ao conteúdo da notícia:
      * Notícias positivas: "Bacana né", "Que massa", "Animador"
      * Notícias negativas: "Complicado né", "Uma pena", "Preocupante"
      * Notícias neutras: "Interessante né", "O que você acha"
    - Use os nomes dos apresentadores nos ganchos diretos
    - Mantenha naturalidade e espontaneidade
    - NÃO force ganchos - use apenas quando soar natural
    
    4. **MAPEAMENTO DE TRILHAS POR CATEGORIA:**
       - ⚫️ (Segurança): trilha_tensao_leve.mp3, -24dB
       - 🟡 (Política): trilha_politica.mp3, -24dB
       - 🔴 (Urgente): trilha_tensao_leve.mp3, -24dB
       - 🚀 (Tecnologia): trilha_tecnologica_upbeat.mp3, -24dB
       - 🎬 (Entretenimento): trilha_cultural.mp3, -24dB
       - 🎭 (Cultura): trilha_eventos.mp3, -24dB
       - 📰 (Geral): trilha_neutra.mp3, -24dB
    
    5. **ALTERNÂNCIA DE APRESENTADORES:**
       - DEVE HAVER ALTERNÂNCIA: um apresentador apresenta uma notícia, o outro comenta
       - ENTÃO O OUTRO apresenta a próxima notícia, e o primeiro comenta
       - Continue alternando ao longo das 5 notícias
       - Não importa quem começa, mas mantenha a alternância consistente
       - CARDÁPIO: pode ser apresentado por qualquer um dos dois
       - TAMANHOS: Apresentação (texto extenso), Comentário (texto mais rápido)
    
    6. **TEXTOS COMPLETOS E CONTEXTUALIZADOS**: 
       - Cada texto deve ser auto-suficiente para TTS
       - **INICIAR SEMPRE COM UMA FRASE DE CONTEXTO** específica da posição da notícia
       - TEXTOS PRINCIPAIS devem ser EXTENSOS e INFORMATIVOS (80-120 segundos)
       - Incluir contexto, detalhes, impactos, consequências
       - Explicar siglas e conceitos quando necessário
       - Adicionar informações complementares relevantes
       - Contextualizar historicamente quando aplicável
       - Mencionar próximos passos ou desdobramentos esperados
       - **TERMINAR COM UM GANCHO NATURAL** para o comentarista
    
    7. **FORMATAÇÃO ESPECIAL PARA TTS**:
       **Pausas e Ênfases com Pontuação:**
       - Use "..." para pausas curtas e respiração: "E então... a decisão foi tomada"
       - Use vírgulas para pausas naturais: "Segundo o G1, a medida entra em vigor"
       - Use pontos finais para pausas longas e quebras de linha
       - Use exclamações para ênfase e energia: "Que massa!"
       - Use interrogações para perguntas retóricas: "E agora?"
       - Use dois pontos para introduzir informações: "O resultado foi:"
       - Use ponto e vírgula para pausas médias entre ideias relacionadas
       - Use travessão para inserir comentários: "A decisão — que foi polêmica — já está valendo"
       
       **Ênfases com CAIXA ALTA:**
       - Use CAIXA ALTA para palavras que precisam de ênfase MAIOR: "Isso é MUITO importante!"
       - Para destacar números impressionantes: "São SESSENTA MIL pessoas beneficiadas"
       - Para enfatizar superlativos: "É a MAIOR obra já construída na região"
       - Para destacar urgência: "A situação é CRÍTICA e precisa de atenção IMEDIATA"
       - Para enfatizar negações importantes: "NÃO há previsão de retorno do serviço"
       - Para destacar conquistas: "APROVADO por unanimidade no Senado"
       - Para enfatizar exclusividade: "PRIMEIRA vez que isso acontece na história"
       
       **Formatação de Números e Valores:**
       - Números sempre por extenso: "103,14" = "cento e três vírgula quatorze"
       - Percentuais por extenso: "25%" = "vinte e cinco por cento"
       - Anos por extenso: "2025" = "dois mil e vinte e cinco"
       - Datas por extenso: "23/07" = "vinte e três de julho"
       - Horas por extenso: "14h30" = "quatorze horas e trinta minutos"
       - Valores monetários: "R$ 1.500" = "mil e quinhentos reais"
       - Milhões/bilhões: "R$ 2,5 mi" = "dois vírgula cinco milhões de reais"
       
       **Exemplos de Uso de Pontuação para TTS:**
       - Pausa reflexiva: "É... Complicado isso aí"
       - Ênfase: "Olha só! Que notícia massa!"
       - Introdução: "E agora... Vamos pra próxima matéria"
       - Surpresa: "Nossa! Tu acredita nisso?"
       - Confirmação: "Exato... É isso mesmo"
       - Transição: "Mas aí... Aconteceu o seguinte"
       - Hesitação: "Bom... Não sei se..."
       - Conclusão: "Então... É isso pessoal"

       **EXCEÇÕES - MANTER COMO ESTÃO (não converter por extenso):**
       - Portais de notícias: "G1", "R7", "UOL", "CNN", "BBC"
       - Siglas governamentais: "IBGE", "CNJ", "STF", "TCE", "MPF", "PF"
       - Órgãos estaduais: "SSP", "SEDECTI", "SEMULSP", "DEHS"
       - Canais de TV: "TV Globo", "SBT", "Record TV"
       - Redes sociais: "Instagram", "Facebook", "Twitter", "WhatsApp"
       - Tecnologia: "WiFi", "GPS", "USB", "HTML", "API"
       - Marcas conhecidas: "iPhone", "Android", "Windows"
       
       **IMPORTANTE**: Use pontuação variada e natural para criar ritmo, pausas e ênfases que tornem a leitura mais expressiva e humana. O TTS se beneficia muito de pontuação bem aplicada para soar mais natural.
    
    8. **DIRETRIZES DE LINGUAGEM INFORMAL AMAZÔNICA**:
       **Contrações e Informalidade:**
       - Use "tá" no lugar de "está"
       - Use "tão" no lugar de "estão"
       - Use "pra" no lugar de "para"
       - Use "pro" no lugar de "para o"
       - Use "pros" no lugar de "para os"
       - Use "pras" no lugar de "para as"
       - Use "dum" no lugar de "de um"
       - Use "duma" no lugar de "de uma"
       - Use "duns" no lugar de "de uns"
       - Use "dumas" no lugar de "de umas"
       - Use "vamo" ocasionalmente no lugar de "vamos"
       
       **Gírias e Expressões Locais:**
       - Use "massa" no lugar de "legal", "bacana", "interessante"
       - Use "da hora" como alternativa para "legal"
       - Use "tenso" no lugar de "complicado", "difícil"
       - Use "osso" para situações muito difíceis
       - Use "eita!" como interjeição de surpresa
       - Use "rapaz!" ou "meu!" para dar ênfase
       - Use "mesmo" no lugar de "realmente"
       - Use "de verdade" no lugar de "realmente"
       
       **Conectivos Informais:**
       - Use "e mais" no lugar de "além disso"
       - Use "mas aí" no lugar de "por outro lado", "entretanto"
       - Use "então" no lugar de "portanto"
       - Use "assim" no lugar de "dessa forma"
       
       **Intensificadores Regionais:**
       - Use "demais" para intensificar: "massa demais", "importante demais"
       - Use "mesmo" para confirmar: "é bom mesmo", "é sério mesmo"
       - Use "aí" em expressões: "que massa, né?", "tenso aí!"
       
       **Mantenha Sempre:**
       - "tu" no lugar de "você"
       - "né?" no final das frases
       - Linguagem próxima e calorosa típica da região
       
       **Exemplo de texto EXTENSO bem formatado para TTS COM CONTEXTO, LINGUAGEM INFORMAL, PONTUAÇÃO EXPRESSIVA E GANCHO:**
       "Pra primeira notícia de hoje... O Tribunal de Justiça do Amazonas anunciou uma nova medida que vai impactar diretamente o cotidiano dos manauaras.
       
       A decisão — que entra em vigor na próxima segunda-feira, dia vinte e seis de julho — estabelece novos prazos pros processos administrativos. Segundo informações do G1... O prazo passa de sessenta pra noventa dias!
       
       Isso representa um aumento de cinquenta por cento no tempo de tramitação! A medida afeta aproximadamente dois mil processos que tão atualmente em andamento no tribunal.
       
       De acordo com a assessoria do TJ-AM, a mudança foi necessária devido ao aumento significativo no volume de processos... Que cresceu quarenta por cento nos últimos dois anos. O tribunal também informou que tá contratando novos servidores pra lidar com a demanda crescente.
       
       Pros cidadãos que têm processos em andamento, a orientação é: acompanhar o andamento pelo site oficial ou procurar a defensoria pública em casos de dúvidas. A nova medida também estabelece que processos urgentes vão ter tratamento prioritário... Mantendo o prazo original de sessenta dias.
       
       Tenso né, Iraí?"
       
       **Resposta de comentário (informal, natural e com pontuação expressiva):**
       "Mesmo, Tainá... Mais tempo esperando né? E pra quem já tá com pressa... Isso vai ser osso! Mas pelo menos os casos urgentes vão ter prioridade... É uma coisa boa."
    
    **REGRA UNIVERSAL**: Aplique TODAS as formatações de TTS (números por extenso, quebras de linha após pontuação) em TODOS os textos do roteiro - cold open, cardápio, contextos, notícias, ganchos e comentários. PORÉM, mantenha as EXCEÇÕES listadas acima (portais de notícias como G1, siglas governamentais, etc.) sem conversão para preservar a naturalidade da leitura. Use pontuação natural (vírgulas, pontos, exclamações, interrogações) para criar pausas naturais na fala.
    
    **IMPORTANTE SOBRE CONTEXTOS**: Cada notícia DEVE começar com uma frase de contexto específica para sua posição (primeira, segunda, terceira, quarta, quinta). Varie sempre as frases de contexto para evitar repetições. Os contextos devem soar naturais e ajudar na fluidez do roteiro.
    
    **IMPORTANTE SOBRE GANCHOS**: Os ganchos devem soar naturais e espontâneos, como se os apresentadores tivessem mesmo conversando. VARIE o tipo de gancho baseado no tom da notícia e USE APENAS quando soar natural - nem toda notícia precisa ter gancho. Alterne entre chamadas diretas ao colega, chamadas à audiência e reflexões abertas. Quando usar, coloque apenas UM gancho por notícia, no final do texto principal.
    
    **IMPORTANTE SOBRE TOM EMOCIONAL**: Adapte o tom conforme a gravidade da notícia:
    - **Notícias graves/trágicas**: Tom sério, respeitoso, sem forçar alegria
    - **Notícias positivas**: Tom animado e otimista, pode usar "que massa!"
    - **Notícias técnicas/neutras**: Tom didático e explicativo
    - **Notícias polêmicas**: Tom equilibrado, apresente os fatos sem tomar partido
    - **SEMPRE mantenha**: Respeito e humanidade em qualquer assunto
    
    IMPORTANTE: Retorne APENAS o roteiro preenchido, sem explicações adicionais.
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const roteiroGerado = response.text();

  if (!roteiroGerado) {
    throw new Error('A API do Gemini não retornou um roteiro.');
  }
  
  console.log('✅ Roteiro recebido do Gemini.');
  return roteiroGerado;
}


const ROTEIRO_TEMPLATE_PATH = filePaths.roteiroTemplateFile;
const PAUTA_DO_DIA_PATH = filePaths.noticiasCategorizadasFile;
const SUGESTOES_ABERTURA_PATH = filePaths.sugestoesAberturaFile;
const PERSONAGENS_PATH = filePaths.personagensFile;

function formatarDataParaNomeArquivo(data: Date): string {
  // ALTERAÇÃO: Usar data de Manaus
  const dataManaus = getDataManaus();
  return `roteiro-${dataManaus}.md`;
}

function formatarBlocoNoticias(noticias: any[], tituloBloco: string): string {
    if (!noticias || noticias.length === 0) {
        return `## ${tituloBloco}\n\n- Nenhuma notícia para este bloco.`;
    }

    return `## ${tituloBloco}\n\n` + noticias.map(n =>
        `- **${n.titulo || n.tituloPrincipal || 'Sem título'}**: ${n.resumo || 'Sem resumo'}`
    ).join('\n');
}

// === FUNÇÕES DE CONVERSÃO PARA COMPATIBILIDADE ===

function converterNoticiasSelecionadasParaPauta(noticiasSelecionadas: any): any {
    // Converter do novo formato para formato compatível com template
    const { manchete, blocos, episodio } = noticiasSelecionadas;
    
    // Combinar todos os blocos em categorias
    const todasNoticias = [
        ...blocos.abertura || [],
        ...blocos.principal || [],
        ...blocos.fechamento || []
    ];
    
    // Organizar por categoria
    const pauta = {
        politica: todasNoticias.filter((n: any) => n.categoria === 'politica'),
        economia: todasNoticias.filter((n: any) => ['economia', 'tecnologia'].includes(n.categoria)),
        cidades: todasNoticias.filter((n: any) => ['social', 'meio-ambiente', 'geral'].includes(n.categoria)),
        cultura: todasNoticias.filter((n: any) => n.categoria === 'cultura'),
        esportes: todasNoticias.filter((n: any) => n.categoria === 'esportes')
    };
    
    return {
        data: episodio.dataEpisodio,
        manchete: manchete.titulo,
        efemerides: [], // Não há efemérides no novo formato
        pauta,
        temaDestaque: episodio.tema,
        duracaoTotal: episodio.duracaoEstimada,
        estatisticas: {
            totalNoticias: todasNoticias.length,
            noticiasPorCategoria: {},
            relevanciaMedia: 7
        }
    };
}

function converterFormatoAntigo(pautaAntiga: any): any {
    // Se já está no formato antigo, retornar como está
    if (pautaAntiga.manchete && pautaAntiga.pauta) {
        return pautaAntiga;
    }
    
    // Se é formato novo, converter
    if (pautaAntiga.sugestaoAutomatica) {
        const { sugestaoAutomatica, categorias } = pautaAntiga;
        
        return {
            data: pautaAntiga.data,
            manchete: sugestaoAutomatica.manchete.titulo,
            efemerides: [],
            pauta: {
                politica: categorias.politica || [],
                economia: [...(categorias.economia || []), ...(categorias.tecnologia || [])],
                cidades: [...(categorias.cidades || []), ...(categorias.geral || [])],
                cultura: categorias.cultura || [],
                esportes: categorias.esportes || []
            },
            temaDestaque: sugestaoAutomatica.manchete.categoria,
            duracaoTotal: 900,
            estatisticas: pautaAntiga.estatisticas || {}
        };
    }
    
    // Fallback padrão
    return pautaAntiga;
}

/**
 * @ai-purpose Gera roteiro do podcast a partir das notícias selecionadas
 * @ai-input-format PautaDoDia com notícias categorizadas e seleção manual opcional
 * @ai-output-format RoteiroPodcast com texto formatado para TTS
 * @ai-dependencies OpenAI API, templates de roteiro
 * @ai-error-handling Try/catch com logs estruturados
 * @ai-performance ~30s para geração completa
 * @ai-validation PautaDoDiaSchema para entrada, RoteiroPodcastSchema para saída
 */
export async function gerarRoteiro() {
    try {
        console.log('🎬 Iniciando geração do roteiro...');
        
        // 1. Carregar dados das notícias
        const noticiasData = await carregarDadosNoticias();
        console.log('📊 Dados carregados:', {
            totalNoticias: noticiasData.rankingGeral?.length || 0,
            categorias: Object.keys(noticiasData.categorias).length
        });
        
        // 2. Carregar templates e configurações
        const template = await fs.readFile(ROTEIRO_TEMPLATE_PATH, 'utf-8');
        const fichaPersonagens = JSON.parse(await fs.readFile(PERSONAGENS_PATH, 'utf-8'));
        console.log('🎭 Ficha de personagens carregada');
        
        // 3. Carregar sugestões de abertura (efemérides e ganchos)
        let sugestoesAbertura = {};
        try {
            sugestoesAbertura = JSON.parse(await fs.readFile(SUGESTOES_ABERTURA_PATH, 'utf-8'));
            console.log('🎯 Sugestões de abertura carregadas');
        } catch (error) {
            console.log('⚠️ Sugestões de abertura não encontradas. Execute primeiro: npx tsx src/roteiro/sugerirAbertura.ts');
        }
        
        // 3.1. Verificar se há seleção manual e usar efeméride selecionada
        const selecaoManual = await verificarSelecaoManual();
        if (selecaoManual?.efemerideSelecionada) {
            console.log('📅 Usando efeméride selecionada manualmente:', selecaoManual.efemerideSelecionada.efemeride.titulo);
            sugestoesAbertura = {
                ...sugestoesAbertura,
                efemeride: selecaoManual.efemerideSelecionada.efemeride
            };
        }
        
        // 4. Preparar notícias para o roteiro
        const noticiasParaRoteiro = await prepararNoticiasParaRoteiro(noticiasData, selecaoManual);
        console.log('📋 Notícias preparadas para roteiro:', {
            manchete: noticiasParaRoteiro.manchete.titulo,
            totalNoticias: noticiasParaRoteiro.noticias.length
        });
        
        // 4. Salvar SCRAPING das 5 notícias selecionadas
        await salvarScrapingNoticiasSelecionadas(noticiasParaRoteiro);

        // 5. Gerar roteiro usando IA (agora com o contexto dos personagens)
        const roteiro = await gerarRoteiroComIA(noticiasParaRoteiro, template, fichaPersonagens, sugestoesAbertura);
        console.log('✨ Roteiro gerado com sucesso');
// Salva o conteúdo de scraping das 5 notícias selecionadas em um arquivo markdown
async function salvarScrapingNoticiasSelecionadas(noticiasParaRoteiro: NoticiasParaRoteiro) {
    const dataManaus = getDataManaus();
    const outputDir = filePaths.roteiroOutputDir;
    const scrapingPath = path.join(outputDir, `scraping-${dataManaus}.md`);

    const manchete = noticiasParaRoteiro.manchete;
    const noticias = noticiasParaRoteiro.noticias.slice(0, 5);

    let md = `# SCRAPING - ${dataManaus}\n\n`;
    md += `## Manchete\n`;
    md += `### ${manchete.titulo}\n`;
    md += `Fontes: ${(manchete.fontesUtilizadas || []).join('; ') || manchete.fonte || ''}\n`;
    md += `\n**Conteúdo:**\n\n`;
    md += `${manchete.conteudoCompleto || 'Sem conteúdo extraído.'}\n\n`;

    noticias.forEach((n, idx) => {
        md += `---\n\n## Notícia ${idx + 1}\n`;
        md += `### ${n.titulo}\n`;
        md += `Fontes: ${(n.fontesUtilizadas || []).join('; ') || n.fonte || ''}\n`;
        md += `\n**Conteúdo:**\n\n`;
        md += `${n.conteudoCompleto || 'Sem conteúdo extraído.'}\n\n`;
    });

    await fs.mkdir(path.dirname(scrapingPath), { recursive: true });
    await fs.writeFile(scrapingPath, md, 'utf-8');
    console.log(`📝 Arquivo de scraping salvo em: ${scrapingPath}`);
}
        
        // 5. Salvar roteiro
        const outputPath = path.join(filePaths.roteiroOutputDir, formatarDataParaNomeArquivo(new Date()));
        
        // Garante que o diretório de saída exista antes de escrever o arquivo
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        
        await fs.writeFile(outputPath, roteiro, 'utf-8');
        console.log(`💾 Roteiro salvo em: ${outputPath}`);
        
        return roteiro;
    } catch (error) {
        console.error('❌ Erro ao gerar roteiro:', error);
        throw error;
    }
}

// Interface corrigida para usar o tipo NoticiaComConteudo
interface NoticiasParaRoteiro {
    manchete: NoticiaComConteudo;
    noticias: NoticiaComConteudo[];
}

// Função corrigida para usar o tipo correto e adicionar verificação de segurança
async function prepararNoticiasParaRoteiro(dados: NoticiasCategorizadas, selecaoManual?: SelecaoManual | null): Promise<NoticiasParaRoteiro> {
    // Verificação para evitar erro se rankingGeral não existir ou estiver vazio
    if (!dados.rankingGeral || dados.rankingGeral.length === 0) {
        throw new Error('Não há notícias no ranking geral para preparar o roteiro.');
    }
    
    // 🆕 NOVO: Verificar e aplicar seleção manual
    let noticiasParaProcessar = dados.rankingGeral;
    let limitarNoticiasSelcionadas = false;
    
    if (selecaoManual) {
        console.log('📝 Aplicando seleção manual ao roteiro...');
        noticiasParaProcessar = await aplicarSelecaoManualNoRoteiro(dados.rankingGeral, selecaoManual);
        limitarNoticiasSelcionadas = true;
    } else {
        console.log('📋 Usando ranking automático (sem seleção manual)');
    }
    
    // ✅ CORREÇÃO: Respeitar seleção manual
    let noticiasSelecionadas: NoticiaCompleta[];
    
    if (limitarNoticiasSelcionadas && selecaoManual) {
        // Usar dados completos da seleção manual se disponíveis
        if (selecaoManual.mancheteCompleta && selecaoManual.noticiasCompletas) {
            const totalSelecionadas = selecaoManual.noticiasCompletas.length + 1; // +1 para a manchete
            console.log(`📊 Seleção manual (dados completos): ${totalSelecionadas} notícias (1 manchete + ${selecaoManual.noticiasCompletas.length} selecionadas)`);
            
            // Usar diretamente os dados da seleção - não precisa mais buscar no ranking
            noticiasSelecionadas = noticiasParaProcessar.slice(0, totalSelecionadas);
        } else {
            // Fallback para formato antigo
            const totalIdsEscolhidos = selecaoManual.noticiasEscolhidas.reduce((total, categoria) => total + categoria.total, 0);
            const totalComManchete = totalIdsEscolhidos + 1; // +1 para a manchete
            
            console.log(`📊 Seleção manual (formato antigo): ${totalComManchete} notícias (1 manchete + ${totalIdsEscolhidos} selecionadas)`);
            
            // As notícias já foram filtradas e ordenadas por aplicarSelecaoManualNoRoteiro
            // Pegar apenas manchete + notícias selecionadas (que estão nas primeiras posições)
            noticiasSelecionadas = noticiasParaProcessar.slice(0, totalComManchete);
        }
    } else {
        // Modo automático: pegar 10 notícias
        console.log('📊 Modo automático: 10 notícias (1 manchete + 9 outras)');
        const [manchete, ...noticias] = noticiasParaProcessar;
        noticiasSelecionadas = [manchete, ...noticias.slice(0, 9)];
    }
    
    console.log('📄 Buscando conteúdo completo das notícias...');
    const noticiasComConteudo = await enriquecerNoticiasComConteudo(noticiasSelecionadas);
    
    return {
        manchete: noticiasComConteudo[0],
        noticias: noticiasComConteudo.slice(1)
    };
}

// Chamada direta se executado como script principal
if (
    import.meta.url.includes('gerarRoteiro.ts') ||
    process.argv[1]?.includes('gerarRoteiro')
) {
    console.log('🚀 Executando gerarRoteiro como script principal...');
    gerarRoteiro()
        .then(() => console.log('✅ Script concluído com sucesso'))
        .catch(error => {
            console.error('❌ Erro no script:', error);
            console.error('Stack:', error.stack);
            process.exit(1);
        });
}
