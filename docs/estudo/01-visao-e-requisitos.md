# 01 — Visão e requisitos

> Rascunho a partir do que o Tap descreveu. Itens marcados ❓ precisam de confirmação.

## Visão

Podcast diário de notícias do Amazonas/Manaus, **Bubuia News**, 10–15 min por episódio, produzido de forma quase totalmente automática (coleta → seleção → roteiro → vozes → edição), com intervenção humana mínima.

## Origem, público e propósito (palavras do Tap, 2026-11-11)

- A ideia nasceu de o Tap ouvir podcasts de notícias nacionais e de política internacional e sentir falta de algo equivalente sobre o Amazonas/Manaus. Praticamente não existe um podcast assim.
- **Público principal: jovens** que querem se informar rápido sobre as principais notícias de Manaus e do Amazonas.
- **Estilo:** 10–15 min, direto, sem enrolação, dinâmico e fácil de ouvir; conteúdo não extenso.
- **Apresentadores (ideia original):** dois, um homem e uma mulher, com personalidade e trejeitos amazônicos. ❓ Ainda é requisito da primeira versão ou pode vir depois (ver princípio abaixo)?
- **Princípio de desenvolvimento definido pelo Tap:** primeiro fazer *todas* as etapas funcionarem juntas no nível mínimo; só depois aumentar a complexidade. O erro do projeto anterior foi construir cada etapa já na forma final imaginada.
- ❓ Público existente ou projeto novo? Meta de sucesso em 6 meses? (perguntas em aberto)

## Formato do episódio (versão antiga, relatado pelo Tap e conferido em `assets/templates/roteiro-template.md`)

Duas apresentadoras/apresentadores: Tainá (energética, gírias locais) e Iraí (calmo, analítico).

1. **Cold open** (0–20 s): trivia/curiosidade/pergunta. Prioridade em cascata: fato histórico do dia (efeméride) → curiosidade → pergunta para puxar conversa.
2. **Vinheta de abertura** (áudio pré-gravado).
3. **Apresentação** dos dois e **cardápio** de notícias (um deles resume o que vem).
4. "Bora para as notícias" + **vinheta de transição**.
5. **Giro de notícias**: um apresentador conta a notícia, o outro comenta (bate-bola). Entre as notícias, uma **vírgula sonora**.
6. **Vinheta** ao fim das notícias.
7. **Encerramento**: pedido para seguir e compartilhar, despedida.

### Lições dessa estrutura

- **O cold open foi a parte mais difícil**: fazer a IA trazer um fato do dia só se realmente existir, sem inventar, e cair para curiosidade ou pergunta quando não houver. Cascata de regras + risco de alucinação = muita complexidade para pouco valor.
- Hipótese para o Nível 0: **sem cold open** (ou só pergunta/curiosidade fixa de uma lista curada, nunca gerada). Reintroduzir depois, com efemérides vindas de uma base de dados verificada e não da memória da IA. ❓ Confirmar com o Tap.
- A estrutura em si (abertura → cardápio → notícias em bate-bola → encerramento) é simples e pode ser um template fixo; a complexidade veio das variações.

## Papel humano (alvo)

- Escolher/aprovar as notícias do dia.
- Revisar o áudio final.
- Publicar.

Todo o resto automático.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|----|-----------|-----------|
| F1 | Coletar notícias de fontes do AM diariamente | essencial |
| F2 | Agrupar notícias duplicadas (mesmo fato, vários sites) | essencial |
| F3 | Ranquear por relevância e propor seleção | essencial |
| F4 | Interface simples para o Tap aprovar/trocar notícias | essencial |
| F5 | Gerar roteiro para 2 apresentadores (10–15 min) | essencial |
| F6 | Sintetizar vozes dos 2 apresentadores | essencial |
| F7 | Montar episódio (vozes + vinhetas/trilha) | essencial |
| F8 | Publicar (feed RSS → plataformas) | essencial |
| F10 | Rodar na nuvem, sem o PC do Tap ligado | desejado ❓ viabilidade (ver 06) |
| F11 | Aprovar seleção e áudio pelo celular | desejado ❓ viabilidade (ver 06) |
| F9 | Distribuição em redes sociais, YouTube, chatbots, analytics | ❓ adiado (v2+) |

## Requisitos não funcionais

- **Custo**: meta de custo por episódio e por mês ❓ (definir no arquivo 03).
- **Manutenibilidade**: um único desenvolvedor deve entender o sistema inteiro em poucas horas.
- **Qualidade editorial**: fatos fiéis às fontes; sem alucinação; atribuição de fonte ❓.
- **Qualidade de áudio**: voz natural em português brasileiro, sotaque/ritmo aceitável ❓ (nível mínimo aceitável?).
- **Tempo de pipeline**: do início ao áudio pronto em até ❓ minutos.

## Questões legais/éticas a tratar (levantar, não resolver aqui)

- Uso de conteúdo de portais de notícia (scraping, resumo, atribuição, direitos autorais).
- Divulgar que vozes e roteiro são gerados por IA.
- Termos de uso das plataformas de TTS para uso comercial/monetização.

## Fora de escopo (por ora)

Chatbots, analytics cross-platform, multi-show, CI/CD sofisticado, auto-otimização de prompts — estavam no ROADMAP antigo e contribuíram para a complexidade.
