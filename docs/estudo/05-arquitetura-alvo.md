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
