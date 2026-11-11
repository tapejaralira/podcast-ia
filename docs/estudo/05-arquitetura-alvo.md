# 05 — Arquitetura alvo

> Só princípios por enquanto. O desenho final depende das escolhas de 03 e 04.

## Princípios

1. **Um comando, um episódio**: `bubuia episodio --data AAAA-MM-DD` roda tudo, retomando de onde parou.
2. **Etapas como funções puras sobre arquivos**: cada etapa lê um arquivo e escreve outro (`coleta.json → selecao.json → roteiro.json → falas/*.mp3 → episodio.mp3`). Sem banco de dados.
3. **Pontos de parada humanos explícitos**: após seleção e após o áudio. O resto não pergunta nada.
4. **Idempotência e cache**: cada fala identificada por hash do texto+voz; nunca pagar duas vezes pelo mesmo áudio.
5. **Um arquivo de configuração**, sem duplicatas.
6. **Poucas dependências**; cada uma justificada.
7. **Prompts como arquivos de texto**, não uma infraestrutura de versionamento.
8. **Falha barulhenta e barata**: validar a saída do LLM (schema) e abortar antes da etapa cara (TTS).
9. **Teste a pipeline com um modo "dry-run"** que usa dados e vozes falsas (custo zero).

## Esboço de fluxo

```
fontes → [coletar] → [agrupar+ranquear] → (humano: aprova) → [roteiro LLM] → [validar]
       → [TTS por fala, com cache] → [mixar ffmpeg] → (humano: ouve) → [publicar feed]
```

## A decidir

- Linguagem (manter TypeScript ou não) — ver 07.
- Refatorar vs. recomeçar — ver 07.
- Onde roda a pipeline (máquina local vs. agendado na nuvem).

## Roteiro: o bloco como unidade (rascunho, 2026-11-11)

**Problema do projeto antigo:** o roteiro era certinho demais: um apresenta, o outro comenta, próxima notícia, o outro apresenta, o primeiro comenta. Funcionava, mas soava roteirizado.

**Ideia:** a unidade do roteiro é o **bloco de uma notícia**, escrito como uma conversa curta, não como dois monólogos.

Cada bloco recebe da pipeline um *briefing* pequeno:
- fatos da notícia (somente o que está nas fontes);
- humor do bloco: neutro, sério ou leve (D09);
- quem puxa o assunto (alternado ou sorteado, não sempre o mesmo);
- um **padrão de conversa** escolhido entre poucos: (1) um conta, o outro reage; (2) um conta, o outro pergunta, o primeiro explica; (3) os dois completam um ao outro; (4) leve discordância/opinião diferente; (5) notícia curta, só uma frase de reação.
- duração-alvo do bloco.

**Travas (a liberdade de conversa não pode virar liberdade de fatos):**
- Os apresentadores podem reagir, opinar com cautela, perguntar e explicar; **não podem acrescentar fatos, números, nomes ou datas que não estejam no briefing**.
- Validação automática barata: números, nomes próprios e datas citados no bloco precisam aparecer no briefing; se não, o bloco é regerado antes de pagar pela voz.
- O formato de saída precisa ser simples e compatível com a geração de voz (falas marcadas por locutor).

**Consequências a estudar:** conversas mais soltas tendem a ficar mais longas e a ter mais risco de alucinação; precisamos medir tamanho médio por bloco, custo de tokens e taxa de reprovação na validação. Cinco padrões de conversa provavelmente bastam para o Nível 1; no Nível 0 pode haver só um.
