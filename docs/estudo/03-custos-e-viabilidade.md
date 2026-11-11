# 03 — Custos e viabilidade

> **Nenhum preço aqui é definitivo.** Preencher a coluna "preço" a partir da página oficial de cada fornecedor, anotando data e URL. Este arquivo define o *modelo de cálculo*; os números entram na Fase B.

## Postura de custo (Tap, 2026-11-11)

**Sem teto mensal fechado por enquanto.** Regra de trabalho: **para cada etapa, buscar a alternativa mais barata que atenda a qualidade mínima**, medir o custo por episódio em cada teste e decidir com números. O maior custo antigo era o TTS (ElevenLabs).

## Metas (a definir com o Tap)

| Item | Valor |
|------|-------|
| Orçamento mensal máximo | ❓ R$ |
| Custo máximo por episódio | ❓ R$ (= orçamento ÷ ~30) |
| Receita esperada (se houver) | nenhuma prevista no curto prazo (D29) |

## Volumes de partida

| Variável | Valor | Origem |
|----------|-------|--------|
| Duração do episódio | 10–15 min (usar 12) | requisito |
| Palavras faladas/min (pt-BR) | ~150 | estimativa a validar nos áudios existentes |
| Palavras por episódio | ~1.800 | 12 × 150 |
| Caracteres por episódio (TTS) | ~11.000 | ~6 caracteres/palavra incl. espaço, a validar |
| Notícias coletadas/dia | ❓ | medir em `data/noticias-recentes.json` |
| Notícias no episódio | ❓ (ex.: 6–8) | editorial |
| Episódios/mês | 30 (diário) ou ~22 (dias úteis) ❓ | |

## Modelo de custo por episódio

```
custo_episodio = coleta + classificação_LLM + agrupamento + roteiro_LLM + TTS + mixagem + hospedagem_rateada + retrabalho
```

| Etapa | Driver de custo | Fórmula | Preço unitário | Custo/ep |
|-------|----------------|---------|----------------|----------|
| Coleta (scraping/RSS) | servidor | ~0 | — | — |
| Agrupar duplicatas | embeddings ou LLM barato | tokens × preço | ❓ | ❓ |
| Classificar/ranquear | LLM | tokens_in/out × preço | ❓ | ❓ |
| Roteiro | LLM | tokens_in/out × preço | ❓ | ❓ |
| Voz (TTS) | caracteres | chars × preço/char | ❓ | ❓ |
| Mixagem | CPU local/CI | ~0 | — | — |
| Hospedagem áudio + RSS | GB armazenado/transferido | | ❓ | ❓ |
| Retrabalho | fator multiplicador | × (1 + taxa de regeração) | ❓ | ❓ |

## Alavancas de redução (a testar, em ordem de impacto esperado)

1. **TTS** costuma ser a maior linha. Opções: plano com créditos mais baratos, modelo de voz mais econômico do mesmo fornecedor, outro fornecedor, voz open-source rodando local/GPU alugada, ou modelos de TTS "de diálogo" nativos para 2 vozes. Testar qualidade × custo.
2. **Não regerar áudio**: gerar fala por fala com cache por hash do texto; só regerar o que mudou.
3. **LLM em camadas**: modelo barato/rápido para classificar e agrupar; modelo melhor só para o roteiro final. Cache de prompts/contexto.
4. **Menos tokens**: enviar às etapas apenas título + resumo curto, não o texto integral de todas as notícias.
5. **Roteiro mais curto/estruturado**: menos caracteres = menos custo de voz.
6. **Roda em lote**: processar em API batch quando não houver urgência (costuma ter desconto).

## Cenários (preencher na Fase B)

| Cenário | LLM | Voz | Custo/ep | Custo/mês | Qualidade (1–5) |
|---------|-----|-----|----------|-----------|-----------------|
| Atual | Gemini/OpenAI | ElevenLabs multilingual_v2 | ❓ | ❓ | ❓ |
| Econômico | ❓ | ❓ | ❓ | ❓ | ❓ |
| Premium | ❓ | ❓ | ❓ | ❓ | ❓ |

## Critério de viabilidade

O projeto é viável se existir um cenário com **custo/mês ≤ orçamento** *e* qualidade ≥ mínima aceitável (definida em 01), com esforço de manutenção ≤ ❓ h/semana.

## Cenário ilustrativo (não verificado): TTS de diálogo via API do Gemini

Só para ordem de grandeza, a partir de números de agregadores (ver `04-ferramentas.md`): ~18.000 tokens de áudio por episódio de 12 min × US$ 20/1M ≈ **US$ 0,36/episódio**, ~**US$ 11/mês**. Comparar com o custo real antigo da ElevenLabs (faturas ainda pendentes) e com GPU alugada para modelo aberto. **Conferir na tabela oficial antes de usar.**

