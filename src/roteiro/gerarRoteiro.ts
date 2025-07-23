// src/roteiro/gerarRoteiro.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { PautaDoDia, SugestoesAbertura, PersonagensConfig, NoticiaClassificada, Efemerie, Personagem } from '../types.js';
import { config, filePaths } from '../config.js';
import { PautaDoDiaSchema, RoteiroPodcastSchema } from '../schemas/core.schemas.js';
import { validateWithSchema } from '../utils/validation.js';

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
            totalNoticias: noticiasData.rankingGeral.length,
            categorias: Object.keys(noticiasData.categorias).length
        });
        
        // 2. Carregar templates e configurações
        const template = await fs.readFile(filePaths.roteiroTemplatePath, 'utf-8');
        console.log('📝 Template de roteiro carregado');
        
        // 3. Preparar notícias para o roteiro
        const noticiasParaRoteiro = prepararNoticiasParaRoteiro(noticiasData);
        console.log('📋 Notícias preparadas para roteiro:', {
            manchete: noticiasParaRoteiro.manchete.titulo,
            totalNoticias: noticiasParaRoteiro.noticias.length
        });
        
        // 4. Gerar roteiro usando IA
        const roteiro = await gerarRoteiroComIA(noticiasParaRoteiro, template);
        console.log('✨ Roteiro gerado com sucesso');
        
        // 5. Salvar roteiro
        const outputPath = path.join(config.paths.output, 'roteiro.md');
        await fs.writeFile(outputPath, roteiro, 'utf-8');
        console.log(`💾 Roteiro salvo em: ${outputPath}`);
        
        return roteiro;
    } catch (error) {
        console.error('❌ Erro ao gerar roteiro:', error);
        throw error;
    }
}

interface NoticiasParaRoteiro {
    manchete: NoticiaEnriquecida;
    noticias: NoticiaEnriquecida[];
}

function prepararNoticiasParaRoteiro(dados: PautaDoDia): NoticiasParaRoteiro {
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
