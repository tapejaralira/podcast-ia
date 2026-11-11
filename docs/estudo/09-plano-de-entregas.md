# 09 — Plano de entregas (rascunho v2)

## Princípio central (definido pelo Tap)

> Fazer **todas as etapas funcionarem juntas no nível mínimo** antes de aprofundar qualquer uma. Nunca construir uma etapa já na forma final imaginada.

Isso é um *esqueleto ponta a ponta* (walking skeleton): um episódio ruim, simples e **completo**, do começo ao fim, vale mais do que uma etapa perfeita e as outras inexistentes. Só depois de ele existir sabemos qual etapa realmente precisa melhorar.

*(v1 deste plano separava marcos por etapa — coleta, depois roteiro, depois voz... Isso foi superado por este princípio.)*

## Regras

1. Um nível só começa quando o anterior funciona de ponta a ponta.
2. Cada melhoria é escolhida pela **dor real** observada no nível anterior, não pela imaginação.
3. Cada nível tem critério de pronto, teto de custo por episódio e teto de tamanho de código.
4. Tudo que não está no nível atual vai para a lista de espera.

## Níveis

### Nível 0 — Esqueleto mínimo (todas as etapas, nada sofisticado)

Meta: gerar **um episódio curto completo** com um único comando, rodando manualmente.

| Etapa | Versão mínima (sugestão a discutir) |
|-------|-------------------------------------|
| Coleta | 1–2 fontes, preferindo RSS; salva título, link e resumo |
| Agrupar | nenhum ou comparação simples de títulos |
| Seleção | o Tap escolhe numa lista simples (arquivo ou terminal); ou as N primeiras |
| Roteiro | **um** prompt, **uma** chamada de LLM, formato fixo, ~5 min |
| Voz | **um** provedor, vozes padrão, sem estilos |
| Mixagem | concatenar falas com uma vinheta (um comando ffmpeg) |
| Publicação | mp3 pronto; feed vem depois |

Pronto quando: um mp3 de ~5 min, ouvível do início ao fim, saiu de um comando. Custo desse episódio medido e anotado.

### Nível 1 — Primeiro episódio de verdade

Escolher, com base no que doeu no Nível 0, **uma ou duas** melhorias entre: duração 10–15 min, qualidade do roteiro, voz/apresentadores com personalidade, agrupamento de duplicatas, mais fontes. Publicar feed e colocar 1 episódio real no ar.

### Nível 2 — Rotina diária

Automação agendada, aprovação pelo celular, cache de áudio, alertas e teto de gasto.

### Nível 3 — Extras (lista de espera)

Redes sociais, YouTube, chatbots, analytics, personalização, múltiplos shows, auto-otimização.

## Estudo antes do Nível 0

O estudo (arquivos 01–08) precisa só do suficiente para escolher as ferramentas do Nível 0 e um teto de custo. O resto da pesquisa pode esperar a dor real aparecer.

## Orçamento de complexidade

- Nível 0 inteiro: meta de ≤ ~500 linhas de código ❓ (ajustar).
- Nenhum arquivo acima de ~250 linhas sem justificativa.
- Dependência nova exige uma linha em `07-decisoes.md`.
