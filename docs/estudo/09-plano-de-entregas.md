# 09 — Plano de entregas (rascunho)

Regra: **um marco só começa quando o anterior funciona de verdade**, medido pelo critério de pronto. Cada marco tem teto de custo e de tamanho de código. Nada fora deste plano entra sem decisão registrada em `07-decisoes.md`.

## Níveis de operação

- **Nível 0 — Manual assistido**: roda sob comando, resultado em arquivos. Serve para validar qualidade e custo.
- **Nível 1 — Semiautomático na nuvem**: roda agendado fora do seu PC; você aprova pelo celular.
- **Nível 2 — Automático**: só pede sua decisão nos dois pontos de revisão; tem alertas e teto de gasto.
- **Nível 3 — Extras**: tudo que estava no roadmap antigo (redes sociais, YouTube, analytics...).

## Marcos

| Marco | Nível | Entrega mínima | Pronto quando | Fora do marco |
|-------|-------|----------------|---------------|---------------|
| M0 | — | Estudo fechado: metas, custo por episódio, ferramentas e onde roda decididos | D02–D06 registradas | código |
| M1 | 0 | Coletar notícias e agrupar duplicatas num arquivo, **sem IA paga** | lista do dia gerada em 1 comando; coletores testados também fora do seu PC | roteiro, voz |
| M2 | 0 | Proposta de seleção + sua aprovação | você escolhe as notícias em ≤ 5 min | interface elaborada |
| M3 | 0 | Roteiro de 10–15 min validado por schema | fatos conferem com as fontes; custo de LLM medido | efemérides, sugestões de abertura |
| M4 | 0 | Áudio por fala, com cache | custo por episódio dentro da meta; sem regeração desnecessária | estilos de voz múltiplos |
| M5 | 0 | Mixagem final com vinheta | episódio ouvível do início ao fim | trilhas por bloco |
| M6 | 0 | Feed RSS publicado e aceito pelas plataformas | 1 episódio real no ar | — |
| M7 | 1 | Pipeline rodando na nuvem, agendado | gera proposta de seleção sem seu PC ligado | — |
| M8 | 1 | Aprovação de seleção e de áudio pelo celular | você aprova/recusa pelo telefone | — |
| M9 | 2 | Alertas, teto de gasto, retomada após falha | 7 dias seguidos sem intervenção técnica | — |

Observação: M7/M8 podem ser antecipados se o teste de viabilidade da nuvem (arquivo 06) mostrar que é simples; mas M1–M6 devem estar validados primeiro, mesmo rodando manualmente.

## Depois do M9 (lista de espera, não planejar agora)

Redes sociais, YouTube, chatbots, analytics, personalização, múltiplos shows, auto-otimização de prompts.

## Orçamento de complexidade (para não repetir o erro)

- Código novo total até M6: meta de ≤ ~1.500 linhas ❓ (ajustar).
- Nenhum arquivo acima de ~250 linhas sem justificativa.
- Dependências novas exigem uma linha no registro de decisões.
