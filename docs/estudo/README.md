# Estudo de Recomeço — Bubuia News

Documento vivo. Objetivo: decidir **o que construir, com quais ferramentas, a que custo e como operar**, *antes* de escrever ou reformular código.

> **Retomando o trabalho?** Comece por [STATUS.md](STATUS.md) (ou use o comando `/retomar`).

## Como este estudo funciona

Cada arquivo responde a uma pergunta. A ordem importa: não avançamos para a próxima sem fechar a anterior (ou registrar a dúvida em `08-perguntas-abertas.md`).

| # | Arquivo | Pergunta que responde | Status |
|---|---------|----------------------|--------|
| 01 | [visao-e-requisitos](01-visao-e-requisitos.md) | O que é o produto e o que é "bom o suficiente"? | rascunho |
| 02 | [diagnostico-projeto-atual](02-diagnostico-projeto-atual.md) | O que existe, o que vale manter, onde está a complexidade e o custo? | rascunho (dados do repo) |
| 03 | [custos-e-viabilidade](03-custos-e-viabilidade.md) | Quanto custa por episódio / por mês e qual meta é sustentável? | modelo montado, preços a verificar |
| 04 | [ferramentas](04-ferramentas.md) | Que opções existem por etapa (LLM, voz, hospedagem...) e qual escolher? | matriz vazia |
| 05 | [arquitetura-alvo](05-arquitetura-alvo.md) | Qual o desenho mais simples que atende os requisitos? | princípios |
| 06 | [operacao](06-operacao.md) | Como rodar todo dia, monitorar, revisar e publicar? | esqueleto |
| 07 | [decisoes](07-decisoes.md) | O que foi decidido, quando e por quê? | vazio |
| 08 | [perguntas-abertas](08-perguntas-abertas.md) | O que preciso do Tap para avançar? | preenchido |
| 09 | [plano-de-entregas](09-plano-de-entregas.md) | Em que ordem e com que entregas mínimas construir? | rascunho |

## Regras de trabalho

1. **Números antes de opinião**: toda escolha de ferramenta passa pelo custo por episódio (arquivo 03).
2. **Preços marcados com data e fonte**; nada de preço de memória — verificar na página oficial antes de decidir.
3. **Simplicidade é requisito**: se uma etapa pode ser manual barata ou um script de 50 linhas, ela não ganha um módulo de 900.
4. **Decisões ficam registradas** em `07-decisoes.md` (formato curto: contexto, opções, escolha, motivo).
5. **Só depois** de fechar 01–06 decidimos entre refatorar o repo atual ou recomeçar.

## Fases

- **Fase A — Entender** (01, 02): requisitos e diagnóstico.
- **Fase B — Dimensionar** (03, 04): custos e ferramentas, com testes pequenos de qualidade (ex.: 1 episódio de teste por combinação de voz/LLM).
- **Fase C — Desenhar** (05, 06): arquitetura e operação.
- **Fase D — Decidir** (07): refatorar vs. recomeçar, e plano de implementação em marcos curtos.
