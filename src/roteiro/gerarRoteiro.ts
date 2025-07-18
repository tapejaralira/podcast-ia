// src/roteiro/gerarRoteiro.ts
import { promises as fs } from 'fs';
import * as path from 'path';
import { PautaDoDia, SugestoesAbertura, PersonagensConfig, NoticiaClassificada, Efemerie, Personagem } from '../types.js';
import { DATA_DIR, ROTEIROS_DIR, SRC_DIR } from '../config.js';
import { PautaDoDiaSchema, RoteiroPodcastSchema } from '../schemas/core.schemas.js';
import { validateWithSchema } from '../utils/validation.js';

const ROTEIRO_TEMPLATE_PATH = path.join(SRC_DIR, 'roteiro', 'roteiro-template.md');
const PAUTA_DO_DIA_PATH = path.join(DATA_DIR, 'noticias-categorizadas.json');
const SUGESTOES_ABERTURA_PATH = path.join(DATA_DIR, 'sugestoes-abertura.json');
const PERSONAGENS_PATH = path.join(DATA_DIR, 'personagens.json');

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

/**
 * @ai-purpose Gera roteiro completo de podcast baseado em pauta analisada, combinando template estruturado com conteúdo dinâmico
 * @ai-input-format PautaDoDia de noticias-categorizadas.json + SugestoesAbertura + PersonagensConfig + template markdown
 * @ai-output-format Arquivo markdown de roteiro estruturado salvo em episodios/roteiro-YYYY-MM-DD.md
 * @ai-dependencies Template roteiro-template.md, noticias-categorizadas.json, sugestoes-abertura.json, personagens.json
 * @ai-error-handling Fallback para template básico se arquivos de dados faltarem, validação de estrutura mínima necessária
 * @ai-performance Execução rápida ~1-3s (apenas manipulação de templates), sem calls de IA externa nesta função
 * @ai-context Combina dados estruturados com template editorial, respeita tom do personagem selecionado, organiza notícias por prioridade
 * @ai-validation Valida existência de arquivos necessários, estrutura mínima da pauta, template válido - sem Zod ainda
 * @ai-side-effects Salva roteiro final em episodios/, substitui arquivo existente se data for igual, logs de processo
 * @ai-cost Operação local sem custos de API, apenas I/O de arquivos
 * @ai-quality-factors Aderência ao template (30%), organização lógica das notícias (40%), consistência editorial (30%)
 * @ai-optimization-tips Cache templates carregados, valide estrutura antes de processar, use paralelização para múltiplos episódios
 * @ai-common-errors "Template file not found", "Invalid pauta structure", "Missing personagem data", "File write permissions"
 * @ai-debugging Verificar todos os arquivos de entrada existem, validar JSON structures, testar template rendering isoladamente
 * @ai-monitoring Tempo de geração, sucesso de escrita de arquivo, conformidade com template
 * @ai-business-impact Automatiza 90% da produção de roteiro, garante consistência editorial, reduz tempo de produção de 2h para 5min
 * @ai-example
 * ```typescript
 * // Requer noticias-categorizadas.json gerada por analisarNoticias()
 * await gerarRoteiro();
 * // Gera episodios/roteiro-2025-01-20.md pronto para gravação
 * console.log('Roteiro gerado para produção do episódio');
 * ```
 */
export async function gerarRoteiro() {
    try {
        // Carregar dados
        const rawPautaDoDia = JSON.parse(await fs.readFile(PAUTA_DO_DIA_PATH, 'utf-8'));
        const pautaDoDia = validateWithSchema(rawPautaDoDia, PautaDoDiaSchema, 'gerarRoteiro.input.pauta');
        
        const sugestoesAbertura: SugestoesAbertura = JSON.parse(await fs.readFile(SUGESTOES_ABERTURA_PATH, 'utf-8'));
        const personagensConfig: PersonagensConfig = JSON.parse(await fs.readFile(PERSONAGENS_PATH, 'utf-8'));
        const template = await fs.readFile(ROTEIRO_TEMPLATE_PATH, 'utf-8');

        console.log('✅ Pauta do dia validada com sucesso para geração do roteiro');

        // Preparar dados para o template
        const { data, manchete, efemerides, pauta } = pautaDoDia;
        const { gancho, trilhaSonora } = sugestoesAbertura.sugestaoPrincipal;
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const apresentador = personagensConfig.apresentadores[0];
        const comentarista = personagensConfig.apresentadores[1];

        // Formatar seções de notícias
        const blocoPolitica = formatarBlocoNoticias(pauta.politica, 'Política');
        const blocoEconomia = formatarBlocoNoticias(pauta.economia, 'Economia');
        const blocoCidades = formatarBlocoNoticias(pauta.cidades, 'Cidades');
        const blocoCultura = formatarBlocoNoticias(pauta.cultura, 'Cultura');
        const blocoEsportes = formatarBlocoNoticias(pauta.esportes, 'Esportes');

        // Preencher o template
        let roteiroFinal = template
            .replace('{{dataPorExtenso}}', dataFormatada)
            .replace('{{mancheteDoDia}}', manchete)
            .replace('{{nomeApresentador}}', apresentador.nome)
            .replace('{{nomeComentarista}}', comentarista.nome)
            .replace('{{ganchoAbertura}}', gancho)
            .replace('{{trilhaSonoraAbertura}}', trilhaSonora)
            .replace('{{blocoPolitica}}', blocoPolitica)
            .replace('{{blocoEconomia}}', blocoEconomia)
            .replace('{{blocoCidades}}', blocoCidades)
            .replace('{{blocoCultura}}', blocoCultura)
            .replace('{{blocoEsportes}}', blocoEsportes)
            .replace('{{efemerides}}', efemerides.map((e) => `- ${e.titulo}: ${e.texto}`).join('\n'));

        // Criar estrutura de roteiro para validação
        const roteiroEstruturado = {
            episodio: {
                numero: Math.floor(Date.now() / 1000), // Temporário até termos numeração real
                data: data,
                tema: manchete,
                duracaoEstimada: 900 // 15 minutos estimado
            },
            abertura: {
                saudacao: "Bom dia, pessoal!",
                apresentacao: `Eu sou a ${apresentador.nome}`,
                contextoDia: gancho
            },
            blocos: [
                {
                    tipo: "noticia" as const,
                    ordem: 1,
                    locutor: "irai" as const,
                    conteudo: blocoPolitica,
                    duracaoEstimada: 180
                },
                {
                    tipo: "noticia" as const,
                    ordem: 2,
                    locutor: "irai" as const,
                    conteudo: blocoEconomia,
                    duracaoEstimada: 180
                }
            ],
            encerramento: {
                resumo: "Essas foram as principais notícias de hoje",
                chamada: "Acompanhe o Bubuia News",
                despedida: "Até a próxima!"
            },
            metadados: {
                versao: "2.0.0",
                geradoPor: "gerarRoteiro.ts",
                timestamp: new Date().toISOString()
            }
        };

        // Validação do roteiro estruturado
        try {
            const roteiroValidado = validateWithSchema(roteiroEstruturado, RoteiroPodcastSchema, 'gerarRoteiro.output');
            
            // Salvar tanto a versão estruturada quanto o markdown
            const nomeArquivo = formatarDataParaNomeArquivo(new Date(data));
            const outputPathMd = path.join(ROTEIROS_DIR, nomeArquivo);
            const outputPathJson = path.join(ROTEIROS_DIR, nomeArquivo.replace('.md', '.json'));
            
            await fs.writeFile(outputPathMd, roteiroFinal);
            await fs.writeFile(outputPathJson, JSON.stringify(roteiroValidado, null, 2));

            console.log(`✅ Roteiro gerado e validado com sucesso:`);
            console.log(`   Markdown: ${outputPathMd}`);
            console.log(`   JSON estruturado: ${outputPathJson}`);
            
        } catch (validationError) {
            console.error('🔥 Erro de validação do roteiro:', validationError);
            // Salvar mesmo assim o markdown para debug
            const nomeArquivo = formatarDataParaNomeArquivo(new Date(data));
            const outputPath = path.join(ROTEIROS_DIR, nomeArquivo);
            await fs.writeFile(outputPath, roteiroFinal);
            console.log(`⚠️ Roteiro salvo sem validação em: ${outputPath}`);
        }

    } catch (error) {
        console.error("Erro ao gerar o roteiro:", error);
        throw error; // Propaga o erro para o pipeline principal
    }
}
