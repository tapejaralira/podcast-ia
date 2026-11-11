# 01 — Visão e requisitos

> Rascunho a partir do que o Tap descreveu. Itens marcados ❓ precisam de confirmação.

## Visão

Podcast diário de notícias do Amazonas/Manaus, **Bubuia News**, 10–15 min por episódio, produzido de forma quase totalmente automática (coleta → seleção → roteiro → vozes → edição), com intervenção humana mínima.

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
