# Bubuia News — instruções para o Claude

Podcast diário de notícias do Amazonas/Manaus, produzido quase todo por automação e IA. O dono do projeto é o Tap. **Idioma de trabalho: português do Brasil.**

## Fase atual

**Estudo de viabilidade e recomeço — ainda não estamos desenvolvendo.** O código em `src/` e `web-interface/` é a versão antiga, que ficou complexa e cara. Serve de referência e matéria-prima, não é para ser expandido.

## Ao iniciar qualquer sessão (obrigatório)

1. Leia `docs/estudo/STATUS.md` — onde paramos, o que foi decidido, qual é o próximo passo.
2. Leia `docs/estudo/README.md` (índice) e os arquivos do estudo relevantes à tarefa.
3. Resuma ao Tap em poucas linhas onde estamos e proponha o próximo passo. Não recomece análises já feitas.

## Ao encerrar ou quando o Tap pedir para parar

Atualize `docs/estudo/STATUS.md` (o que mudou, decisões novas, próximos passos, perguntas pendentes), registre decisões em `docs/estudo/07-decisoes.md`, faça commit e push na branch da sessão.

## Regras do projeto

- **Simplicidade é requisito.** Nenhuma funcionalidade ou módulo novo sem entrega mínima que o exija, conforme `docs/estudo/09-plano-de-entregas.md`. Um marco só começa quando o anterior funciona.
- **Nada de código novo até o estudo chegar ao suficiente para o Nível 0** (ver `docs/estudo/09-plano-de-entregas.md`) sem o Tap pedir explicitamente. Princípio: esqueleto ponta a ponta mínimo primeiro, complexidade depois.
- **Custo é critério de decisão.** Nenhuma chamada paga (TTS, LLM) em teste sem estimar o custo antes e avisar o Tap.
- **Preços e versões de ferramentas só entram nos documentos verificados em fonte oficial, com data e URL.** Nunca de memória.
- **Decisões** vão para `docs/estudo/07-decisoes.md` (ID, data, contexto, opções, escolha, motivo). Não reabrir decisão registrada sem motivo novo.
- **Dúvidas que dependem do Tap** vão para `docs/estudo/08-perguntas-abertas.md`.
- Não inventar dados do projeto antigo: medir ou perguntar.
- Segredos (chaves de API) nunca no repositório.
- Não criar pull request nem mesclar sem o Tap pedir.

## Mapa do repositório

- `docs/estudo/` — estudo vivo (fonte da verdade do planejamento). `STATUS.md` é o ponto de entrada.
- `docs/*.md` (fora de `estudo/`) — documentação antiga; considerar obsoleta até revisão.
- `src/`, `web-interface/`, `data/`, `assets/` — projeto antigo (referência).
- `ROADMAP.md` — roadmap antigo, superado por `docs/estudo/09-plano-de-entregas.md`.

## Comandos úteis

- `/retomar` — carrega o contexto e resume o estado.
- `/encerrar` — salva o estado da sessão nos documentos e faz commit/push.
