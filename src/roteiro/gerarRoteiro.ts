// src/roteiro/gerarRoteiro.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai'; // <-- MUDANÇA: Importa Gemini
// Tipos corrigidos e limpos
import { NoticiasCategorizadas, NoticiaCompleta } from '../types.js';
import { config, filePaths } from '../config.js';
import { PautaDoDiaSchema, RoteiroPodcastSchema } from '../schemas/core.schemas.js';
import { validateWithSchema } from '../utils/validation.js';

// --- IMPLEMENTAÇÃO COM GEMINI ---
const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey);
const geminiModel = genAI.getGenerativeModel({ model: config.ai.gemini.model });

const carregarDadosNoticias = async (): Promise<NoticiasCategorizadas> => {
  const data = await fs.readFile(filePaths.noticiasCategorizadasFile, 'utf-8');
  return JSON.parse(data);
};

// A função agora aceita quatro parâmetros: 'noticias', 'template', 'personagens' e 'sugestoesAbertura'
async function gerarRoteiroComIA(noticias: NoticiasParaRoteiro, template: string, personagens: any, sugestoesAbertura: any): Promise<string> {
  console.log('🤖 Chamando API do Gemini para gerar roteiro com contexto completo...');
  
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
      **Gírias Comuns:** ${p.girias.join(', ')}
    `).join('\n')}
    ---

    **Efeméride do Dia (Use no Cold Open):**
    ${sugestoesAbertura.efemeride ? `
    - **Título:** ${sugestoesAbertura.efemeride.titulo}
    - **Fato:** ${sugestoesAbertura.efemeride.texto}
    ` : 'Use curiosidade amazônica como fallback.'}

    **Sugestões de Abertura:**
    ${sugestoesAbertura.ganchos ? sugestoesAbertura.ganchos.map((g: any, i: number) => `
    ${i + 1}. **${g.tipo}**: ${g.texto}
    `).join('\n') : 'Nenhuma sugestão específica disponível.'}
    ---

    **Template do Roteiro (Preencha EXATAMENTE esta estrutura):**
    ---
    ${template}
    ---

    **Dados das Notícias para usar:**
    - **Manchete Principal:** ${noticias.manchete.titulo}
    - **Notícias Selecionadas (use as 5 primeiras):**
      ${noticias.noticias.slice(0, 5).map((n: NoticiaCompleta, i: number) => `
      ${i + 1}. **${n.titulo}** (Categoria: ${n.categoria})
         Resumo: ${n.resumo?.substring(0, 200)}...
      `).join('\n')}
    ---

    **Instruções CRÍTICAS:**
    
    1. **PREENCHA O TEMPLATE**: Substitua TODOS os {{placeholders}} pelos valores corretos:
       - {{data}}: Use a data atual
       - {{numeroEpisodio}}: Use um número sequencial
       - {{tituloSugerido}}: Crie um título baseado na manchete
       - {{tipoColdOpen}}: Baseado na efeméride ou sugestão
       - {{apresentadorColdOpen}}: Tainá ou Iraí
       - {{textoColdOpen}}: Texto da abertura baseado na efeméride
       - {{apresentadorCardapio}}: O outro apresentador (alternância)
       - {{cardapioNoticias}}: Lista rápida das 5 notícias do episódio
       
    2. **ESTRUTURA DAS 5 NOTÍCIAS**: Para cada notícia (1 a 5):
       - {{noticiaX_categoria}}: Use o emoji da classificação
       - {{noticiaX_titulo}}: Título da notícia
       - {{noticiaX_trilha}}: Nome do arquivo de trilha baseado na categoria
       - {{noticiaX_volume}}: Volume da trilha (ex: -10dB)
       - {{noticiaX_apresentador}}: Tainá, Iraí, Tainá, Iraí, Tainá (alternância)
       - {{noticiaX_texto_completo}}: Texto completo de 40-60 segundos
       - {{noticiaX_comentarista}}: Iraí, Tainá, Iraí, Tainá, Iraí (alternância inversa)
       - {{noticiaX_comentario}}: Comentário de 20-30 segundos
    
    3. **MAPEAMENTO DE TRILHAS POR CATEGORIA:**
       - ⚫️ (Segurança): trilha_seria.mp3, -12dB
       - 🟡 (Política): trilha_politica.mp3, -10dB
       - 🔴 (Urgente): trilha_tensao.mp3, -8dB
       - 🚀 (Tecnologia): trilha_animada.mp3, -10dB
       - 🎬 (Entretenimento): trilha_cultural.mp3, -10dB
       - 🎭 (Cultura): trilha_eventos.mp3, -10dB
       - 📰 (Geral): trilha_neutra.mp3, -10dB
    
    4. **ALTERNÂNCIA DE APRESENTADORES:**
       - Notícia 1: Tainá apresenta, Iraí comenta
       - Notícia 2: Iraí apresenta, Tainá comenta
       - Notícia 3: Tainá apresenta, Iraí comenta
       - Notícia 4: Iraí apresenta, Tainá comenta
       - Notícia 5: Tainá apresenta, Iraí comenta
    
    5. **TEXTOS COMPLETOS E CONTEXTUALIZADOS**: Cada texto deve ser auto-suficiente para TTS.
    
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
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `roteiro-${ano}-${mes}-${dia}.md`;
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
        
        // 4. Preparar notícias para o roteiro
        const noticiasParaRoteiro = prepararNoticiasParaRoteiro(noticiasData);
        console.log('📋 Notícias preparadas para roteiro:', {
            manchete: noticiasParaRoteiro.manchete.titulo,
            totalNoticias: noticiasParaRoteiro.noticias.length
        });
        
        // 4. Gerar roteiro usando IA (agora com o contexto dos personagens)
        const roteiro = await gerarRoteiroComIA(noticiasParaRoteiro, template, fichaPersonagens, sugestoesAbertura);
        console.log('✨ Roteiro gerado com sucesso');
        
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

// Interface corrigida para usar o tipo NoticiaCompleta
interface NoticiasParaRoteiro {
    manchete: NoticiaCompleta;
    noticias: NoticiaCompleta[];
}

// Função corrigida para usar o tipo correto e adicionar verificação de segurança
function prepararNoticiasParaRoteiro(dados: NoticiasCategorizadas): NoticiasParaRoteiro {
    // Verificação para evitar erro se rankingGeral não existir ou estiver vazio
    if (!dados.rankingGeral || dados.rankingGeral.length === 0) {
        throw new Error('Não há notícias no ranking geral para preparar o roteiro.');
    }
    
    // Usar ranking geral que já está ordenado por relevância e seleção manual
    const [manchete, ...noticias] = dados.rankingGeral;
    
    return {
        manchete,
        noticias: noticias.slice(0, 9) // Limitar a 10 notícias no total (1 manchete + 9)
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
