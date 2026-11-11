# STATUS — ponto de continuidade

> Primeiro arquivo a ler em toda sessão nova. Atualizar ao encerrar cada sessão. Manter curto: o detalhe vive nos arquivos 01–09.

**Última atualização:** 2026-11-11
**Fase:** A — Entender, quase fechada. OK do Tap em D08/D13/D14/D18/D19/D20/D22/D24; novas D25–D30 (PC local primeiro, naturalidade, 5 dias úteis, ~10 min, 10–20 min/dia, sem patrocínio, postura legal). Próximo: `10-nivel-0-e-plano-de-testes.md`.
**Fase (anterior):** A — Entender (estudo de viabilidade). Conversa geral por etapa em andamento: etapa 1 (visão/público) e formato do episódio respondidos; respondido: 5–6 notícias, comentários entre apresentadores essenciais, personalidades são parte da identidade (mas enxugar). Naturalidade do diálogo é a melhoria nº 1 desejada (hipótese: diálogo por bloco). Próxima: etapa 3 (notícias/fontes/relevância) e perguntas 20–27.
**Princípio do Tap:** esqueleto ponta a ponta mínimo primeiro, complexidade depois (ver `09-plano-de-entregas.md` v2, substitui os marcos M0–M9).

## Resumo do projeto em 5 linhas

Bubuia News: podcast diário (10–15 min) de notícias do AM/Manaus, com coleta, seleção, roteiro, vozes e edição automatizados por IA. Papel humano: escolher notícias, revisar áudio, publicar. A versão antiga (neste repo, ~6 mil linhas TypeScript) ficou complexa e cara (ElevenLabs + LLM). Estamos refazendo o planejamento antes de qualquer código. Desejo: rodar na nuvem e decidir pelo celular.

## Feito até agora

- Estrutura do estudo criada em `docs/estudo/` (arquivos 01–09).
- Diagnóstico inicial do repositório antigo (arquivo 02) — baseado só em leitura de código, sem faturas nem medições.
- Plano de entregas em rascunho v2 (níveis 0–3, esqueleto ponta a ponta) e requisito de operação nuvem/celular (arquivo 06).
- `CLAUDE.md` e comandos `/retomar` e `/encerrar` para continuidade entre sessões.

## Decisões tomadas

- D01: estudo versionado em `docs/estudo/` (ver `07-decisoes.md`).
- D06/D07 (adotadas): personalidade no texto curto + configuração de voz por trecho com poucos humores; episódio antigo = benchmark de qualidade. D08 (cold open fora do Nível 0) proposta. D09 (3 humores) e D10 (sem vinhetas por humor nem trilha variável) adotadas. D13/D14 (propostas): relevância por regras + curadoria humana; Nível 0 com 1–2 fontes estáveis. Pesquisa VoiceStudio feita (04): licença não comercial dos pesos e sem API de síntese documentada; ainda não testado. D24 (proposta: testar TTS de diálogo por API, candidato Gemini; NotebookLM só como referência), D23 (adotada: sem teto fixo; alternativa mais barata por etapa; TTS aberto na lista de testes), D22 (proposta: revisor de IA opcional, só se as checagens de código tiverem lacuna), D21 (adotada: meta final sem revisão, por degraus medidos), D20 (proposta: destino = ecossistema completo por degraus; descrição/capa/numeração por template), D19 (proposta: ordem automática + intervenção por exceção + escada de autonomia), D18 (proposta: ordem por clima + ponte só quando há salto), D15 (sem papéis fixos), D16 (filtro/limpeza por código), D17 (IA só no roteiro) adotadas; como alimentar a IA do roteiro está em estudo (05). D11/D12: cada notícia é um bloco de conversa solta (ver 05, seção roteiro).

Nenhuma decisão de ferramenta ou custo ainda.

## Hipóteses ainda não validadas

- ElevenLabs é o maior custo (falta confirmar com faturas).
- Operar na nuvem com CI agendado + Telegram para decisões (falta testar T1–T5 em `06-operacao.md`).
- Coletores do antigo funcionam a partir de IP de nuvem (T1, maior risco).

## Próximos passos (em ordem)

0. **Combinado com o Tap (2026-11-11):** nenhum teste ou liberação de rede até concluirmos uma conversa geral sobre o projeto: como cada etapa funciona, como desenvolver e o que o Tap espera. Os testes (T1 etc.) ficam adiados, não descartados.
1. Conversa guiada por etapa, registrando as respostas no estudo (arquivos 01, 05, 06) e em `08-perguntas-abertas.md`.
2. Teste T1 (coletores a partir da nuvem): tentado, inconclusivo — a rede da sessão do Claude não alcança os portais e o Tap não quis liberar hosts. Refazer num workflow de GitHub Actions (script mínimo de curl/fetch nos 4 endereços, sem IA paga) ou no PC do Tap.
3. Pesquisar preços atuais com fonte e data → preencher `03-custos-e-viabilidade.md`.
4. Comparar opções de voz e LLM com teste pequeno (custo estimado antes).
5. Fechar metas (orçamento, qualidade mínima) → registrar decisões D02–D06.

## Pendências com o Tap

- Feed antigo lido (PDF): 9 episódios 28/07–07/08/2025, ~7:30 em média, descrição com fontes. Faltam respostas 59–63 (como publicava, por que parou, horário, audiência, mp3s).

- Google Drive conectado (leitura); pasta `scripts` com ~25 roteiros de jun–ago/2025; 8 lidos e analisados em `02-diagnostico` (seção "Estrutura real dos episódios" = padrão as-is, 5 mais recentes + scraping de 07/08) (episódios de ~8–9 min, bate-bola rígido nos mais recentes, invenções no cold open). Faltam áudios e logs de coleta.
- Tap vai procurar arquivos locais antigos (roteiros, notícias brutas, logs de coleta, áudios) e enviar se achar; sem pressa (pergunta 36).

Ver `08-perguntas-abertas.md` (19 perguntas; as de maior impacto: 1, 5, 6, 12, 16–18).

## Histórico de sessões

| Data | Resumo |
|------|--------|
| 2026-11-11 | Leitura do repo antigo, criação da estrutura do estudo, plano de entregas, requisito nuvem/celular, mecanismo de continuidade. |
