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
| D08 | 2026-11-11 | **Cold open fora do Nível 0**; volta depois com efemérides de base verificada (hipótese, falta resposta do Tap à pergunta 20) | adotada (OK do Tap, 2026-11-11) |
| D09 | 2026-11-11 | **Três humores por fala: neutro, sério, leve.** Nada além disso | adotada |
| D10 | 2026-11-11 | **Sem vinhetas por humor/tema e sem trilha de fundo variável** (a detecção automática de humor/tema para escolher áudio de edição foi complexa demais). Nível 0 usa poucas vinhetas **fixas**; naturalidade do diálogo tem prioridade sobre enfeites de edição | adotada |
| D11 | 2026-11-11 | **Cada notícia é um bloco de conversa**, com diálogo mais solto e variável dentro do bloco, em vez do revezamento rígido "um fala, o outro comenta". Direção adotada; **geração das vozes por bloco** ainda é hipótese a testar (ver 04) | adotada (direção) |
| D12 | 2026-11-11 | **Todo bloco serve a informar sobre a notícia**: apresentadores podem opinar, perguntar e dar contrapontos, sempre atrelados à notícia e sem inventar fatos | adotada |
| D13 | 2026-11-11 | **Relevância: regras simples + curadoria humana; sem chamadas de IA para ranquear no Nível 0.** O sistema filtra (exclui policial) e pontua por regra; o Tap escolhe as 5–6 | adotada (OK do Tap, 2026-11-11) |
| D14 | 2026-11-11 | **Nível 0 usa só as 1–2 fontes que funcionam de forma estável**, de preferência por feed; mais fontes e fusão de notícias iguais ficam para o Nível 1 | adotada (OK do Tap, 2026-11-11) |
| D15 | 2026-11-11 | **Sem papéis fixos**: quem abre, quem lê e quem comenta não é regra. A personalidade (Tainá extrovertida, Iraí mais certinho) é tendência, não script. O revezamento rígido existia só para facilitar a edição. Meta: diálogo dinâmico, imprevisível e natural, sempre a serviço da notícia (D12) | adotada |
| D16 | 2026-11-11 | **Filtragem e limpeza das notícias feitas por código, sem IA**: descartar notícias que dependem de imagem/vídeo ("veja o vídeo", "confira as fotos"), policiais e gráficas (D13), e normalizar o texto bruto (legendas, duplicatas, lixo) | adotada (direção) |
| D17 | 2026-11-11 | **IA só no roteiro.** Nada de IA para ler e classificar todas as notícias. Como alimentar a IA do roteiro é tema de estudo (ver 05) | adotada (direção) |
| D18 | 2026-11-11 | **Transição de clima**: (1) o código ordena as notícias evitando saltos de humor, (2) quando houver salto, o bloco seguinte começa com uma ponte curta escolhida por uma tabela humor-anterior × humor-atual, (3) voz neutra na ponte. Humor pré-marcado por regras e corrigido pelo Tap, sem IA | adotada (OK do Tap, 2026-11-11) |
| D19 | 2026-11-11 | **Ordem automática por regras** (gancho primeiro, clima agrupado, leve no fim, afinidade) e **intervenção humana por exceção** (tornar principal, subir/descer, tirar). Escada de autonomia: Tap escolhe + ordem automática → sistema escolhe e Tap veta → Tap só veta | adotada (OK do Tap, 2026-11-11) |
| D20 | 2026-11-11 | **O destino é o ecossistema completo da visão original**, construído por degraus. **Descrição do episódio, capa e numeração por template/contador, sem IA**; redes sociais só no Nível 3, depois de a rotina rodar estável | adotada (OK do Tap, 2026-11-11) |
| D21 | 2026-11-11 | **Meta final: operação sem revisão humana**, alcançada por degraus; subir de degrau só com critério medido (taxa de intervenção) e redes de segurança automáticas com disjuntor (na dúvida, não publica) | adotada (direção); limiares a definir |
| D22 | 2026-11-11 | **Emenda à D17**: IA no roteiro e, **se os testes mostrarem lacuna nas checagens de código**, também num revisor de IA com papel estreito (apontar problemas, não reescrever), uma chamada por episódio, máximo 2 regerações. Fora do Nível 0 | adotada (OK do Tap, 2026-11-11) |
| D23 | 2026-11-11 | **Custo: sem teto fixo agora; buscar a alternativa mais barata por etapa que atenda a qualidade mínima**, medindo custo por episódio. TTS aberto/local entra na lista de testes (ver 04), com ressalvas de GPU, licença e consentimento de voz | adotada |
| D24 | 2026-11-11 | **Prioridade de teste de voz: TTS de diálogo por API em nuvem (candidato Gemini), por bloco**, ao lado de ElevenLabs e de modelos abertos. NotebookLM Audio Overview fica como referência de naturalidade, **não** como ferramenta do pipeline (reescreve o conteúdo e a automação exige API Enterprise) | adotada (OK do Tap, 2026-11-11) |
| D25 | 2026-11-11 | **Nível 0 e 1 rodam no PC do Tap (RTX 4060)**; operar na nuvem sem depender do PC é o objetivo do Nível 2 | adotada |
| D26 | 2026-11-11 | **Prioridade de qualidade: soar natural**, tanto nas vozes quanto no texto. O timbre jovem é negociável conforme a ferramenta | adotada |
| D27 | 2026-11-11 | **Frequência: 5 dias úteis**; se as notícias forem fracas demais ou o custo inviável, reduzir para 2x ou 1x por semana. **Duração: em torno de 10 min**, para mais ou para menos | adotada |
| D28 | 2026-11-11 | **Tempo do Tap na operação: 10 a 20 min/dia, 5 dias/semana**; no desenvolvimento ele dedica mais. O desenho da revisão cabe nesse orçamento (ouvir um episódio inteiro já consome ~10 min, ver 06) | adotada |
| D29 | 2026-11-11 | **Sem patrocínio/anúncio previsto no curto prazo** (talvez no futuro distante). Voz com licença "não comercial" não está descartada agora, mas preferir licenças comerciais claras para não bloquear o futuro | adotada |
| D30 | 2026-11-11 | **Postura legal (entendimento do Tap, a verificar):** resumir e comentar notícias é permitido desde que citando as fontes; o sistema sempre cita o veículo e nunca copia o texto integral | adotada como regra de trabalho; verificação jurídica pendente |
| D31 | 2026-11-11 | **Três horários configuráveis (corte, geração, publicação) e janela de notícias por episódio.** Começar pela opção C: corte ~21h, seleção do Tap à noite, geração de madrugada, publicação agendada ~6h30; título com a data de publicação; ajustar com dados de audiência. Enquadrar como "o que aconteceu ontem e o que importa hoje" e dar peso à utilidade pública do dia | proposta |
| D32 | 2026-11-11 | **Coleta incremental**: marca d'água por fonte (início da coleta), margem de sobreposição com deduplicação por URL, campo `visto_em`, nenhum item descartado por falta de data, banco simples de itens vistos com situação e histórico | adotada (OK do Tap, 2026-11-11) |

