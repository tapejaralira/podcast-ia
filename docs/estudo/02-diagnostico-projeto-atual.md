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

## Análise de roteiros antigos (pesquisa, 2026-11-11)

**Fonte:** pasta `scripts` do Google Drive do Tap (≈ 25 roteiros `.md`, de 27/06/2025 a 07/08/2025). Lidos 3: `roteiro-2025-06-27` (o mais antigo), `2025-07-26` (ep. 14) e `2025-08-07` (ep. 16). **Amostra pequena; é pesquisa, não decisão.** A leitura corta o final dos arquivos (encerramento não visto).

**Tamanho:** ~8–10 mil caracteres por arquivo, incluindo marcação. Estimativa grosseira de ~1.200–1.400 palavras faladas, ou seja **~8–9 min**, abaixo dos 10–15 min do objetivo. Confirmar com a duração real dos áudios.

**Evolução do estilo**
- *27/06 (mais antigo):* diálogo vivo e com ida e volta dentro do bloco (várias falas por notícia, perguntas ao ouvinte, "hot take"), mas **gírias em excesso** ("Curumím", "Maninha", "Parente", "Caboco" quase a cada fala: caricatura, o "forçado demais"), marcas de SSML (`<emphasis>`, `<break>`) dentro do texto e **placeholders não preenchidos** (`{{NOTICIA_1_TRILHA}}`).
- *26/07 e 07/08 (mais recentes):* estrutura rígida **"um apresentador lê a notícia inteira em monólogo; o outro dá uma reação de uma ou duas frases"**. Reações genéricas e repetidas ("Que massa, né?", "Tenso demais", "Complicado demais"). Soa mais como dois leitores do que como conversa. É o oposto do que o Tap quer melhorar (D11).

**Fidelidade e invenção**
- 27/06: o cold open traz a criação da Zona Franca de Manaus como "hoje, 29 de junho"; pelo que sei a criação é de **fevereiro de 1967**, então a data parece errada (verificar). E o roteiro diz "**recebemos uma mensagem do nosso ouvinte João**", o que parece invenção. Os dois exemplos confirmam o risco do cold open e da conversa solta (D08, D12).
- 26/07 e 07/08: o texto das notícias segue as fontes e **cita o veículo** ("Segundo o jornal A Crítica", "Segundo o G1"). Bom padrão a manter. Efemérides desses dias (Dia dos Avós, Lei Maria da Penha) estavam corretas.

**Outros achados**
- Números escritos por extenso, pausas com reticências e "tá/pra/vamo" para guiar o TTS: boas práticas de texto falado.
- Telefone e site lidos por extenso numa notícia de utilidade pública: informação útil, mas pesada para áudio.
- Erro de concordância ("trezentos áreas").
- **Vestígios de complexidade:** marcas `[TRILHA_INICIO: trilha_tensao_leve.mp3, -24dB]` por notícia (a trilha por humor, cortada em D10), emojis de categoria vazando para os títulos com erro de codificação, e na 07/08 **duas notícias sobre o mesmo incêndio** como itens separados (agrupamento não funcionou).
- Fontes visíveis nessas amostras: só **A Crítica** e **G1**, coerente com o relato de 2–3 fontes.
- Linha editorial: o episódio de 07/08 inclui **três notícias de caráter policial/sinistro** (incêndio, moradores afetados, médico preso), apesar de o Tap relatar que evitava policiais. Pode ser que a regra tenha vindo depois ou que a seleção automática tenha sido menos filtrada nesse dia.
- Cada episódio tem número e título sugerido (ep. 14 em 26/07, ep. 16 em 07/08).

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
