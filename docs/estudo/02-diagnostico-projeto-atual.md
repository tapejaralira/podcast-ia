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

## Estrutura real dos episódios (as-is): 5 roteiros mais recentes, 30/07 a 07/08/2025

Fonte: Drive do Tap, `roteiro-2025-07-30`, `08-01`, `08-03`, `08-06`, `08-07`, mais `scraping-2025-08-07` (notícias brutas). Descrição do que existia, **sem juízo sobre o que queremos**. Leitura corta o final dos arquivos (encerramento não visto).

### Esqueleto fixo (igual nos 5)

| Parte | Como era |
|-------|----------|
| Cabeçalho | Nº do episódio + título sugerido pela IA |
| Bloco 0, cold open | Sempre **efeméride** (5 de 5), Tainá puxa (~100 palavras) e Iraí reage (~40). Frase de ligação regional ("ainda mais aqui na Amazônia") em todos |
| Áudio | `vinheta_abertura.mp3` |
| Bloco 1 | `introducao_fixa.mp3` + **Iraí** lê o cardápio (sempre ele): 5 chamadas numa frase corrida |
| Bloco 2 | **5 notícias**, cada uma entre `[TRILHA_INICIO: arquivo.mp3, -24dB]` e `[TRILHA_FIM]` |
| Bloco 3 | `encerramento_*.mp3` (texto não visto) |

### Dentro de cada notícia (padrão rígido)

1. **Quem lê alterna sempre**: N1 Tainá, N2 Iraí, N3 Tainá, N4 Iraí, N5 Tainá (5 de 5 episódios).
2. Abertura numerada e formulaica: "Pra primeira notícia de hoje…", "Na sequência…", "A terceira matéria…", "Chegando à quarta…", "E pra última matéria…".
3. **Monólogo** de ~120–250 palavras parafraseando a matéria, em geral com atribuição ("Segundo o G1 / A Crítica / Portal do Holanda").
4. **Pergunta-gancho** do leitor ("Que massa, né, Iraí?", "Complicado, né?", "Importante, né?").
5. **Reação** do outro, de 1 a 3 frases: concorda + generaliza + fecha com esperança ("vamo torcer", "tomara que…"). Estimativa visual: ~85% do texto do bloco é monólogo, ~15% reação.
6. Categoria de trilha por humor (`tensao_leve`, `eventos`, `politica`, `neutra`, `tecnologica_upbeat`, `cultural`).

### Estilo de texto (marcas de "fala para TTS")

Números por extenso e "G um"/"I,M,M,U," para forçar leitura certa; reticências para pausas; "tá/pra/vamo". Gírias regionais bem mais contidas que no roteiro de junho. Maiúsculas ocasionais para ênfase.

### Notícias brutas versus roteiro (07/08)

- O `scraping` traz **efeméride + manchete + 5 notícias**, cada uma com URL e texto integral (1 a 3 mil caracteres) por fonte, **sujo**: legendas de foto, títulos repetidos, listas coladas, uma letra faltando ("●emini").
- Mesmo trecho aparece duplicado em fontes diferentes quando a notícia tem duas fontes (a do boi tinha A Crítica + G1: boa base para fusão).
- **A "manchete" do dia (médico preso) virou a última notícia do roteiro**, e duas das 5 notícias eram o mesmo incêndio (agrupamento não funcionou).
- O roteiro é **fiel à fonte** nos fatos conferidos; acrescenta pouco, p.ex. "o link na descrição do podcast", que não está na matéria.

### Fatos que já estavam fora do padrão

- **Numeração de episódios inconsistente**: 12 (30/07), 112 (01/08), 17 (03/08), 82 (06/08), 16 (07/08).
- Notícia de 01/08 sobre a cheia: **um único parágrafo** com ~10 números (534.829 pessoas, 133 mil famílias, 62 municípios, toneladas, lei nº…), difícil de ouvir; mistura número por extenso e algarismos.
- Episódio de 30/07: notícias 4 e 5 (câmara/estágio) têm texto **genérico e vago** ("Secretaria do Amazonas"), com detalhes que **não consegui conferir** (parece completado a partir de um título); verificar com o `scraping` de 30/07 se existir.
- Chamadas como "comentem aí embaixo" (06/08), sem canal de comentários definido.
- Efemérides conferidas de memória: Selo Postal (01/08), Amizade (30/07), Capoeirista (03/08) e Lei Maria da Penha (07/08) parecem corretas. A de 06/08 ("Dia Nacional dos Profissionais da Educação", com número de lei) **não consegui confirmar**; checar.
- Linha editorial: 06/08 tem tráfico de drogas, incêndio com vítima descrita em detalhe (queimaduras, gravidez) e 07/08 tem o médico preso, ou seja, **conteúdo policial/gráfico entrou** em episódios recentes.

## Ordem das notícias no sistema antigo (código + dados, 2026-11-11)

- A seleção manual salvava **uma manchete + ids agrupados por categoria** (`data/selecao-manual.json`: p.ex. cidades×3, política×2), **sem uma ordem explícita** de leitura. O código montava a lista como "manchete primeiro, depois as escolhidas, depois as restantes" e o prompt mandava "respeitar EXATAMENTE a ordem".
- Na prática a ordem final variou: em **06/08** a manchete (operação contra o tráfico) foi a **primeira**; em **07/08** a manchete (médico preso) foi a **última**. Não sei se foi reordenação na interface ou a IA ter reorganizado; vale confirmar com o Tap.
- O Tap lembra de reordenar manualmente pela interface e de haver uma notícia principal que, "se não me engano", era a primeira.

## O feed antigo no ar (Anchor / Spotify for Creators), lido em 2026-11-11

Fonte: o Tap salvou o XML do feed `https://anchor.fm/s/107ba8788/podcast/rss` em PDF (o domínio não abre pela rede da sessão). **9 episódios publicados, de 28/07 a 07/08/2025; nenhum depois.**

**Programa:** "BubuiA News"; descrição "Resumo diário de notícias direto e leve, focado no que realmente importa para quem vive em Manaus e no Amazonas."; idioma pt-br; categoria News > Daily News; não explícito; capa única hospedada pelo Anchor; gerador "Anchor Podcasts".

| Episódio (título no feed) | Publicado | Duração | Arquivo |
|---------------------------|-----------|---------|---------|
| 28/07 - Complexo Hípico Pioneiro em Manaus e Vagas na Ufam no Interior | 28/07 | 9:31 | 9,1 MB |
| 29/07 - Manaus ganha primeiro centro público para atendimento de crianças com autismo | 29/07 | 9:59 | 9,6 MB |
| 30/07 - Falta d'água em Manaus, o Fim do Samba Manaus e Vagas de Estágio! | 30/07 | 8:46 | 8,4 MB |
| 31/07 - Evasão Escolar no AM, Festa do Cupuaçu e Empreendedorismo local! | 31/07 | 6:14 | 6,0 MB |
| 01/08 - Alerta no PIM, Cheia no AM e Último Dia para a UEA! | 03/08 | 6:23 | 5,9 MB |
| 04/08 - Educação em Alerta e Direitos do Consumidor | 04/08 | 5:50 | 5,5 MB |
| 05/08 - Estiagem Moderada, Obras e Cultura | 05/08 | 7:15 | 6,8 MB |
| 06/08 - Incêndio no Distrito, Operação e Revitalização do Centro | 06/08 | 6:33 | 6,4 MB |
| 07/08 - Médico Preso, Rescaldo de Incêndio e Show dos Bois | 07/08 | 7:08 | 6,8 MB |

**Achados**
- **Duração real média ≈ 7:30** (5:50 a 9:59), **não 8–9 min** como eu estimara pelo texto. Os três primeiros tinham 9–10 min; **depois de 31/07 ficaram em ~6–7 min**. Meta de ~10 min (D27) exige mais conteúdo ou ritmo mais lento do que o episódio publicado.
- Arquivo MP3 de ~128 kbps (inferido de tamanho ÷ duração); referência para a saída da mixagem.
- **Títulos do feed usam data (DD/MM) + 3 manchetes**, não número de episódio. A numeração caótica dos roteiros (12, 112, 82…) nunca foi para o ouvinte: para o feed, **data basta**.
- O episódio de "01/08" saiu em **03/08** (atraso de 2 dias); só há episódios em dias úteis, sem fim de semana, de 28/07 a 07/08 (um dia, 01/08, saiu depois).
- Horário de publicação no feed: ~05:00–06:30 GMT, ou seja **1h–2h30 da manhã em Manaus**: provavelmente agendado ou enviado na madrugada.
- **Descrição de cada episódio (padrão):** frase de abertura com dia da semana e efeméride ("Quinta-feira com as principais notícias… no dia em que a Lei Maria da Penha completa mais um ano…"), 2–3 frases de chamada, **um parágrafo curto por notícia com título em negrito**, lista **"Fontes das notícias" com links** para as matérias (G1 Amazonas, A Crítica, Portal do Holanda) e hashtags (#Notícias #Podcast #BubuiaNews #Manaus…), com emojis. Isso já era a citação de fontes (D30) publicada.
- Fontes realmente citadas nos 3 episódios lidos: **G1 Amazonas e A Crítica** em todos, **Portal do Holanda** em 05/08.
- **Parou em 07/08/2025.** Por quê? (pergunta 60).

## Como a coleta incremental funcionava (código + estado, 2026-11-11)

- O estado ficava em `data/estado_coleta.json` (`ultimaColetaManaus: "06/08/2025 01:14:51"`). Cada coleta lia essa data e buscava as notícias **publicadas depois dela**; na falta do estado, usava um padrão de X horas. Havia também um conjunto de URLs já vistas para não duplicar.
- Isso confirma o relato do Tap: a próxima varredura ia da última coleta até agora.
- **Fragilidades prováveis (a confirmar):**
  1. O filtro usa a **data de publicação informada pelo site**, e o coletor **descarta o item se não achar data**. Em `d24am.ts` o código converte só dia/mês/ano (sem hora), o que daria meia-noite e derrubaria o item de qualquer coleta feita depois: **provável explicação de o D24am quase não aparecer** nos dados.
  2. **Um único relógio para todas as fontes:** se um site falhava numa coleta, as notícias dele daquele intervalo se perdiam, porque o relógio avançava para todos.
  3. Notícia publicada antes do horário da coleta mas só "indexada" depois (atraso do site) podia ficar de fora.
  4. A hora salva parece ser a do fim da coleta; qualquer notícia publicada durante a própria coleta corre o risco de cair no vão.

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
