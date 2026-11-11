# STATUS — ponto de continuidade

> Primeiro arquivo a ler em toda sessão nova. Atualizar ao encerrar cada sessão. Manter curto: o detalhe vive nos arquivos 01–09.

**Última atualização:** 2026-11-11
**Fase:** A — Entender (estudo de viabilidade). Marco atual: M0 (estudo fechado).

## Resumo do projeto em 5 linhas

Bubuia News: podcast diário (10–15 min) de notícias do AM/Manaus, com coleta, seleção, roteiro, vozes e edição automatizados por IA. Papel humano: escolher notícias, revisar áudio, publicar. A versão antiga (neste repo, ~6 mil linhas TypeScript) ficou complexa e cara (ElevenLabs + LLM). Estamos refazendo o planejamento antes de qualquer código. Desejo: rodar na nuvem e decidir pelo celular.

## Feito até agora

- Estrutura do estudo criada em `docs/estudo/` (arquivos 01–09).
- Diagnóstico inicial do repositório antigo (arquivo 02) — baseado só em leitura de código, sem faturas nem medições.
- Plano de entregas em rascunho (M0–M9) e requisito de operação nuvem/celular (arquivo 06).
- `CLAUDE.md` e comandos `/retomar` e `/encerrar` para continuidade entre sessões.

## Decisões tomadas

- D01: estudo versionado em `docs/estudo/` (ver `07-decisoes.md`).

Nenhuma decisão de ferramenta, custo ou arquitetura ainda.

## Hipóteses ainda não validadas

- ElevenLabs é o maior custo (falta confirmar com faturas).
- Operar na nuvem com CI agendado + Telegram para decisões (falta testar T1–T5 em `06-operacao.md`).
- Coletores do antigo funcionam a partir de IP de nuvem (T1, maior risco).

## Próximos passos (em ordem)

1. Tap responder `08-perguntas-abertas.md` (especialmente orçamento, faturas, preferência por Telegram/servidor).
2. Teste T1 (coletores a partir da nuvem): tentado, inconclusivo — a rede da sessão do Claude não alcança os portais e o Tap não quis liberar hosts. Refazer num workflow de GitHub Actions (script mínimo de curl/fetch nos 4 endereços, sem IA paga) ou no PC do Tap.
3. Pesquisar preços atuais com fonte e data → preencher `03-custos-e-viabilidade.md`.
4. Comparar opções de voz e LLM com teste pequeno (custo estimado antes).
5. Fechar metas (orçamento, qualidade mínima) → registrar decisões D02–D06.

## Pendências com o Tap

Ver `08-perguntas-abertas.md` (19 perguntas; as de maior impacto: 1, 5, 6, 12, 16–18).

## Histórico de sessões

| Data | Resumo |
|------|--------|
| 2026-11-11 | Leitura do repo antigo, criação da estrutura do estudo, plano de entregas, requisito nuvem/celular, mecanismo de continuidade. |
