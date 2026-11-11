# 10 — Nível 0 e plano de testes (rascunho)

Fecha o estudo: define o que é o primeiro esqueleto ponta a ponta e como testamos cada decisão antes de escrever código de produção. Itens com ❓ dependem do Tap.

## Nível 0: definição

**Roda no PC do Tap (RTX 4060), um comando, resultado em arquivos.** Meta: um episódio curto, completo, ouvível do começo ao fim.

| Etapa | Nível 0 |
|-------|---------|
| Coleta | 1–2 fontes (hipótese: G1 Amazonas por RSS e A Crítica, as duas que aparecem nos roteiros mais recentes) |
| Limpeza e filtros | regras de código (D16): sem legenda de foto, sem "veja o vídeo", sem policial |
| Humor | pré-marcado por palavras-chave, corrigido pelo Tap (D18) |
| Seleção | o Tap escolhe **3 notícias** numa lista simples (Nível 1 sobe para 5–6) |
| Ordem | automática (D19) |
| Roteiro | **uma chamada por bloco**, briefing com parâmetros sorteados pelo código, 1–2 padrões de conversa, ponte quando houver salto de humor, saída com falas marcadas por locutor |
| Validação | números, nomes e datas do bloco devem existir no briefing; senão, regera (máx. 2x) |
| Voz | **um** candidato escolhido no teste T-A, dois locutores, por bloco |
| Montagem | vinheta de abertura + introdução fixa + blocos + encerramento fixo (ffmpeg, um comando) |
| Saída | `episodio-N.mp3` + `roteiro.md` + `custos.json` (tokens, caracteres/segundos de áudio, custo estimado) |
| Numeração/título | título do episódio = data (DD/MM) + 3 manchetes, como no feed antigo; contador só se o Tap quiser número |

**Fora do Nível 0:** cold open, trilha de fundo, vinheta por humor, capa, descrição, feed, redes, aprovação pelo celular, agendamento, nuvem, revisor de IA.

**Pronto quando:**
1. Um comando gera o mp3 de ~4–6 min sem intervenção após a seleção.
2. O Tap ouve e diz que está "no nível do antigo ou melhor" em naturalidade (ficha de escuta, nota ≥ 4 em naturalidade do diálogo).
3. Nenhuma afirmação sem base no briefing no roteiro (checagem automática + leitura do Tap).
4. O custo do episódio está registrado em `custos.json`.
5. Código novo ≤ ~500 linhas e nenhum arquivo > 250 linhas (orçamento de complexidade do 09).

## Plano de testes (antes do código)

| Teste | Pergunta | Material | Como medir |
|-------|----------|----------|------------|
| **T-A Voz** | Qual combinação soa natural em pt-BR com dois locutores e custa pouco? | O mesmo bloco de ~1 min de diálogo escolhido do Drive | ficha de escuta cega + custo por minuto + tempo de geração; candidatos: TTS de diálogo por API (Gemini, se acessível), ElevenLabs, modelos abertos que caibam em 8 GB (ex.: XTTS-v2 via PodVoice; checar VibeVoice, FireRedTTS-2, SoulX, Dia), NotebookLM só como referência |
| **T-B Roteiro** | Uma chamada por bloco, por episódio ou plano+blocos? | scraping de 05, 06 e 07/08 do Drive (e outros dias se existirem) | fidelidade (checagem automática + Tap), ficha de escuta, tamanho, custo de tokens, reprovações |
| **T-C Filtros** | As regras pegam o que o Tap evitava, sem derrubar o bom? | 43 notícias de `noticias-recentes.json` + scrapings do Drive; seleção antiga do Tap como gabarito | quantas o filtro derruba, acertos e falsos descartes |
| **T-D Volume** | Há 3 (depois 5–6) notícias boas todo dia útil? | coleta real de 2–4 semanas | contagem de candidatas úteis por dia |
| **T-E Transição** | Ordem por clima + ponte soa melhor que a ordem antiga? | notícias de 07/08 | ficha de escuta (transições), comparar com o roteiro antigo |
| **T-F Feed** | O feed antigo pode ser reaproveitado? | feed e contas existentes | publicar um mp3 de teste, ver se plataformas aceitam |
| **T-G Nuvem** (Nível 2) | Os coletores e o pipeline funcionam fora do PC? | workflow agendado ou servidor | sucesso das requisições, tempo, custo |

## Ficha de escuta (1 a 5, com comentário)

1. Naturalidade das **vozes** (parece pessoa ou robô?)
2. Naturalidade do **diálogo** (conversa de verdade ou leitura em revezamento?)
3. **Clareza e fidelidade** da informação (entendi a notícia? algo soou inventado?)
4. **Ritmo** (arrasta, atropela, pausas estranhas?)
5. **Transições** de uma notícia para outra (clima, conexão)
6. **Pronúncia** de nomes e siglas locais
7. Eu ouviria até o fim? (sim/não e por quê)
Anotar também: duração, trecho em que perdeu a atenção.

## Ordem sugerida

T-A e T-B primeiro (definem o coração do Nível 0), T-C em paralelo (só leitura de dados), T-D inicia cedo porque leva semanas, T-F antes do primeiro episódio real.
