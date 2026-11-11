# 07 — Registro de decisões

Formato: **ID · data · decisão** — contexto, opções, escolha, motivo.

| ID | Data | Decisão | Status |
|----|------|---------|--------|
| D01 | 2026-11-11 | Estudo documentado em `docs/estudo/`, versionado no repositório | adotada |
| D02 | — | Refatorar o repo atual vs. recomeçar | pendente (após 01–06) |
| D03 | — | Provedor de voz | pendente (04) |
| D04 | — | Provedor de LLM e estratégia em camadas | pendente (04) |
| D05 | — | Onde publicar o feed | pendente (04) |
| D06 | 2026-11-11 | **Personalidade vive no texto curto, não em um texto enorme de perfil.** O que a voz recebe é **configuração por trecho** (uma marca de humor por fala: neutro / sério / leve), decidida pelo roteiro, principalmente nos comentários. Sem dezenas de estilos nem perfis longos (hipótese a confirmar em teste de áudio) | adotada (direção) |
| D07 | 2026-11-11 | **O episódio antigo é o benchmark de qualidade**: a nova versão busca resultado equivalente com menos complexidade e custo | adotada |
| D08 | 2026-11-11 | **Cold open fora do Nível 0**; volta depois com efemérides de base verificada (hipótese, falta resposta do Tap à pergunta 20) | proposta |
| D09 | 2026-11-11 | **Três humores por fala: neutro, sério, leve.** Nada além disso | adotada |
| D10 | 2026-11-11 | **Sem vinhetas por humor/tema e sem trilha de fundo variável** (a detecção automática de humor/tema para escolher áudio de edição foi complexa demais). Nível 0 usa poucas vinhetas **fixas**; naturalidade do diálogo tem prioridade sobre enfeites de edição | adotada |
| D11 | 2026-11-11 | **Cada notícia é um bloco de conversa**, com diálogo mais solto e variável dentro do bloco, em vez do revezamento rígido "um fala, o outro comenta". Direção adotada; **geração das vozes por bloco** ainda é hipótese a testar (ver 04) | adotada (direção) |
| D12 | 2026-11-11 | **Todo bloco serve a informar sobre a notícia**: apresentadores podem opinar, perguntar e dar contrapontos, sempre atrelados à notícia e sem inventar fatos | adotada |
| D13 | 2026-11-11 | **Relevância: regras simples + curadoria humana; sem chamadas de IA para ranquear no Nível 0.** O sistema filtra (exclui policial) e pontua por regra; o Tap escolhe as 5–6 | proposta (aguarda confirmação do Tap) |
| D14 | 2026-11-11 | **Nível 0 usa só as 1–2 fontes que funcionam de forma estável**, de preferência por feed; mais fontes e fusão de notícias iguais ficam para o Nível 1 | proposta |
| D15 | 2026-11-11 | **Sem papéis fixos**: quem abre, quem lê e quem comenta não é regra. A personalidade (Tainá extrovertida, Iraí mais certinho) é tendência, não script. O revezamento rígido existia só para facilitar a edição. Meta: diálogo dinâmico, imprevisível e natural, sempre a serviço da notícia (D12) | adotada |
| D16 | 2026-11-11 | **Filtragem e limpeza das notícias feitas por código, sem IA**: descartar notícias que dependem de imagem/vídeo ("veja o vídeo", "confira as fotos"), policiais e gráficas (D13), e normalizar o texto bruto (legendas, duplicatas, lixo) | adotada (direção) |
| D17 | 2026-11-11 | **IA só no roteiro.** Nada de IA para ler e classificar todas as notícias. Como alimentar a IA do roteiro é tema de estudo (ver 05) | adotada (direção) |
| D18 | 2026-11-11 | **Transição de clima**: (1) o código ordena as notícias evitando saltos de humor, (2) quando houver salto, o bloco seguinte começa com uma ponte curta escolhida por uma tabela humor-anterior × humor-atual, (3) voz neutra na ponte. Humor pré-marcado por regras e corrigido pelo Tap, sem IA | proposta (aguarda confirmação do Tap) |
| D19 | 2026-11-11 | **Ordem automática por regras** (gancho primeiro, clima agrupado, leve no fim, afinidade) e **intervenção humana por exceção** (tornar principal, subir/descer, tirar). Escada de autonomia: Tap escolhe + ordem automática → sistema escolhe e Tap veta → Tap só veta | proposta (aguarda confirmação do Tap) |

