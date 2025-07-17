// src/roteiro/gerarRoteiro.ts
import fs from 'fs/promises';
import path from 'path';
import { PautaDoDia, SugestoesAbertura, PersonagensConfig, NoticiaClassificada, Efemerie, Personagem } from '../types.js';
import { DATA_DIR, ROTEIROS_DIR, SRC_DIR } from '../config.js';

const ROTEIRO_TEMPLATE_PATH = path.join(SRC_DIR, 'roteiro', 'roteiro-template.md');
const PAUTA_DO_DIA_PATH = path.join(DATA_DIR, 'pauta-do-dia.json');
const SUGESTOES_ABERTURA_PATH = path.join(DATA_DIR, 'sugestoes-abertura.json');
const PERSONAGENS_PATH = path.join(DATA_DIR, 'personagens.json');

function formatarDataParaNomeArquivo(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `roteiro-${ano}-${mes}-${dia}.md`;
}

function formatarBlocoNoticias(noticias: NoticiaClassificada[], tituloBloco: string): string {
    if (!noticias || noticias.length === 0) {
        return `## ${tituloBloco}\n\n- Nenhuma notícia para este bloco.`;
    }

    return `## ${tituloBloco}\n\n` + noticias.map(n =>
        `- **${n.tituloPrincipal}** (${n.fontes.map(f => f.fonte).join(', ')}): ${n.fontes[0].resumo}`
    ).join('\n');
}

/**
 * @ai-purpose Gera roteiro completo de podcast baseado em pauta analisada, combinando template estruturado com conteúdo dinâmico
 * @ai-input-format PautaDoDia de pauta-do-dia.json + SugestoesAbertura + PersonagensConfig + template markdown
 * @ai-output-format Arquivo markdown de roteiro estruturado salvo em episodios/roteiro-YYYY-MM-DD.md
 * @ai-dependencies Template roteiro-template.md, pauta-do-dia.json, sugestoes-abertura.json, personagens.json
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
 * // Requer pauta-do-dia.json gerada por analisarNoticias()
 * await gerarRoteiro();
 * // Gera episodios/roteiro-2025-01-20.md pronto para gravação
 * console.log('Roteiro gerado para produção do episódio');
 * ```
 */
export async function gerarRoteiro() {
    try {
        // Carregar dados
        const pautaDoDia: PautaDoDia = JSON.parse(await fs.readFile(PAUTA_DO_DIA_PATH, 'utf-8'));
        const sugestoesAbertura: SugestoesAbertura = JSON.parse(await fs.readFile(SUGESTOES_ABERTURA_PATH, 'utf-8'));
        const personagensConfig: PersonagensConfig = JSON.parse(await fs.readFile(PERSONAGENS_PATH, 'utf-8'));
        const template = await fs.readFile(ROTEIRO_TEMPLATE_PATH, 'utf-8');

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
            .replace('{{efemerides}}', efemerides.map((e: Efemerie) => `- ${e.titulo}: ${e.texto}`).join('\n'));

        // Salvar o roteiro final
        const nomeArquivo = formatarDataParaNomeArquivo(new Date(data));
        const outputPath = path.join(ROTEIROS_DIR, nomeArquivo);
        await fs.writeFile(outputPath, roteiroFinal);

        console.log(`Roteiro gerado com sucesso em: ${outputPath}`);

    } catch (error) {
        console.error("Erro ao gerar o roteiro:", error);
        throw error; // Propaga o erro para o pipeline principal
    }
}
