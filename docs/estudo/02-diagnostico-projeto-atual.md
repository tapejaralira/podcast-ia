# 02 — Diagnóstico do projeto atual

Fonte: leitura do repositório (commit `70891c2`). Observações factuais; julgamentos marcados como tal.

## Inventário

- **Linguagem/stack**: TypeScript (tsx), Node, Zod, ffmpeg (fluent-ffmpeg), cheerio/axios (scraping), rss-parser, Next.js em `web-interface/`.
- **Tamanho**: ~6.000 linhas em `src/`. Maiores arquivos: `roteiro/gerarRoteiro.ts` (982), `mixagem/montarEpisodio.ts` (632), `noticias/analisarNoticias.ts` (576), `types.ts` (566), `roteiro/sugerirAbertura.ts` (493).
- **Fontes de notícia (4 coletores)**: G1 Amazonas, A Crítica, D24am, Portal do Holanda.
- **IA de texto**: Gemini e/ou OpenAI (alternável por `API_PROVIDER`).
- **Voz**: ElevenLabs, modelo `eleven_multilingual_v2`, 2 vozes (Tainá Oliveira, Iraí Santos), 5 estilos de voz com parâmetros diferentes.
- **Estado/dados**: arquivos JSON em `data/` (notícias, seleção manual, estado de coleta, efemérides, sugestões de abertura, personagens).
- **Pipeline**: `coletar → analisar → abertura → roteirizar → audios → montar`, scripts npm separados.

## Sinais de complexidade (julgamento)

| Sinal | Evidência |
|-------|-----------|
| Configuração duplicada | `src/config.ts` e `src/config-clean.ts` |
| Script apontando para arquivo inexistente | `analisar:completo` e `analisar:manual` → `analisarNoticiasCompleto.ts` (não existe) |
| Script específico de Windows | `resetar` usa `del ... 2>nul` |
| Código morto na UI | `web-interface/app/page-old.tsx`, `page-new.tsx` ao lado de `page.tsx` |
| Excesso de documentação voltada a IA | `docs/AI_*.md` (4 arquivos), `MIGRATION_SUMMARY`, `IMPLEMENTACAO_CONCLUIDA` |
| Infra de "métricas de IA", versionamento de prompts, A/B planejado | `src/ai/metrics/`, `ROADMAP` fases 3–6 |
| Funções muito grandes | `gerarRoteiro.ts` com ~1.000 linhas |
| Pipeline em muitos passos manuais | seis comandos separados, sem orquestrador único (`index.ts` só 37 linhas) |
| Roadmap muito além do núcleo | distribuição social, chatbots, multi-show |

## Origem dos custos (a confirmar com faturas reais)

1. **ElevenLabs**: cobrança por caractere/crédito; episódio de 10–15 min deve ter na ordem de 1.500–2.300 palavras faladas *(medir com dado real: caracteres dos roteiros gerados)*; regerar falas por ajuste de estilo multiplica o gasto.
2. **LLM**: classificação de cada notícia + roteiro + sugestões de abertura; quanto de contexto é enviado por chamada?
3. **Retrabalho**: quantas regenerações por episódio acontecem hoje? ❓

## Achados adicionais (2026-11-11)

- **Personalidades (`data/personagens.json`, ~11,6 mil caracteres)**: cada apresentador tem perfil, tom, expressões, especialidades, estilo de interação e ~40 frases de exemplo de reações em 6 emoções. Se isso entra inteiro em cada chamada de IA, é custo repetido de tokens em todo episódio, e as frases de exemplo tendem a ser copiadas. Hipótese: um "cartão" de ~10 linhas por apresentador + 2–3 falas de exemplo basta para o Nível 0. Medir isso depois.
- **Volume de notícias (amostra antiga, só 2 dias de agosto/2025)**: 43 itens coletados (G1 Amazonas 17, A Crítica 16, Portal do Holanda 10; D24am não aparece), ~20/dia. É uma amostra pequena e antiga; não prova que há 5–6 notícias *relevantes* por dia. Precisa de coleta de pelo menos 2–4 semanas para responder.
- **Estilos de voz (`data/tts-config.json`)**: 5 presets de `stability`/`style` do ElevenLabs, aplicados por trecho. O Tap relata que a configuração *por trecho* funcionava e importava (notícia pesada vs. alegre, sobretudo nos comentários), enquanto as "marcas no texto" não funcionavam bem e o texto longo de personalidade atrapalhava. Hipótese: reduzir para ~3 humores por fala, escolhidos pelo roteiro. Validar em teste cego.
- **Efemérides (`data/efemerides-brasileiras.json`, 689 bytes)**: contém só uma data (05-08). Não é uma base utilizável ainda.

## O que vale aproveitar (hipóteses)

- Os 4 coletores (pequenos, 50–110 linhas) e a lógica de fontes.
- Templates de roteiro e a definição dos personagens/tom.
- Assets de áudio (vinheta, silêncios) e a ideia de mixagem com ffmpeg.
- Interface web de seleção, **se** a seleção ficar mesmo no escopo (ou substituir por algo mais simples).
- Validação com Zod nas saídas do LLM (estrutura de roteiro).

## O que provavelmente descartar

Sistema de métricas/A-B de prompts, camada duplicada de config, UI antiga, documentos de "contexto para IA", automações de roadmap futuro.

## Tarefas para fechar este diagnóstico

- [ ] Medir caracteres do último roteiro e duração do áudio final.
- [ ] Levantar gasto real: faturas ElevenLabs e Gemini/OpenAI dos últimos meses.
- [ ] Rodar o pipeline atual ponta a ponta uma vez e cronometrar.
- [ ] Listar quais passos o Tap faz à mão hoje.
