// src/roteiro/gerarRoteiro.ts
import fs from 'fs/promises';
import path from 'path';
import { PautaDoDia, SugestoesAbertura, PersonagensConfig, NoticiaClassificada, Efemerie, Personagem } from '../types.js';
import { DATA_DIR, EPISODIOS_DIR, SRC_DIR } from '../config.js';

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
        const outputPath = path.join(EPISODIOS_DIR, nomeArquivo);
        await fs.writeFile(outputPath, roteiroFinal);

        console.log(`Roteiro gerado com sucesso em: ${outputPath}`);

    } catch (error) {
        console.error("Erro ao gerar o roteiro:", error);
        throw error; // Propaga o erro para o pipeline principal
    }
}
