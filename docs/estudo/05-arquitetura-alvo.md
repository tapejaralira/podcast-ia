# 05 — Arquitetura alvo

> Só princípios por enquanto. O desenho final depende das escolhas de 03 e 04.

## Princípios

1. **Um comando, um episódio**: `bubuia episodio --data AAAA-MM-DD` roda tudo, retomando de onde parou.
2. **Etapas como funções puras sobre arquivos**: cada etapa lê um arquivo e escreve outro (`coleta.json → selecao.json → roteiro.json → falas/*.mp3 → episodio.mp3`). Sem banco de dados.
3. **Pontos de parada humanos explícitos**: após seleção e após o áudio. O resto não pergunta nada.
4. **Idempotência e cache**: cada fala identificada por hash do texto+voz; nunca pagar duas vezes pelo mesmo áudio.
5. **Um arquivo de configuração**, sem duplicatas.
6. **Poucas dependências**; cada uma justificada.
7. **Prompts como arquivos de texto**, não uma infraestrutura de versionamento.
8. **Falha barulhenta e barata**: validar a saída do LLM (schema) e abortar antes da etapa cara (TTS).
9. **Teste a pipeline com um modo "dry-run"** que usa dados e vozes falsas (custo zero).

## Esboço de fluxo

```
fontes → [coletar] → [agrupar+ranquear] → (humano: aprova) → [roteiro LLM] → [validar]
       → [TTS por fala, com cache] → [mixar ffmpeg] → (humano: ouve) → [publicar feed]
```

## A decidir

- Linguagem (manter TypeScript ou não) — ver 07.
- Refatorar vs. recomeçar — ver 07.
- Onde roda a pipeline (máquina local vs. agendado na nuvem).

## Roteiro: o bloco como unidade (rascunho, 2026-11-11)

**Problema do projeto antigo:** o roteiro era certinho demais: um apresenta, o outro comenta, próxima notícia, o outro apresenta, o primeiro comenta. Funcionava, mas soava roteirizado.

**Ideia:** a unidade do roteiro é o **bloco de uma notícia**, escrito como uma conversa curta, não como dois monólogos.

Cada bloco recebe da pipeline um *briefing* pequeno:
- fatos da notícia (somente o que está nas fontes);
- humor do bloco: neutro, sério ou leve (D09);
- quem puxa o assunto (alternado ou sorteado, não sempre o mesmo);
- um **padrão de conversa** escolhido entre poucos: (1) um conta, o outro reage; (2) um conta, o outro pergunta, o primeiro explica; (3) os dois completam um ao outro; (4) leve discordância/opinião diferente; (5) notícia curta, só uma frase de reação.
- duração-alvo do bloco.

**Regra de ouro (Tap): o ponto central de todo bloco é informar o ouvinte sobre a notícia.** Opinião, pergunta e contraponto são permitidos, mas sempre atrelados à notícia; nunca viram conversa solta ou assunto próprio.

**Travas (a liberdade de conversa não pode virar liberdade de fatos):**
- Os apresentadores podem reagir, opinar com cautela, perguntar e explicar; **não podem acrescentar fatos, números, nomes ou datas que não estejam no briefing**.
- Validação automática barata: números, nomes próprios e datas citados no bloco precisam aparecer no briefing; se não, o bloco é regerado antes de pagar pela voz.
- O formato de saída precisa ser simples e compatível com a geração de voz (falas marcadas por locutor).

**Consequências a estudar:** conversas mais soltas tendem a ficar mais longas e a ter mais risco de alucinação; precisamos medir tamanho médio por bloco, custo de tokens e taxa de reprovação na validação. Cinco padrões de conversa provavelmente bastam para o Nível 1; no Nível 0 pode haver só um.

## Imprevisibilidade controlada (2026-11-11)

O Tap quer um episódio com "cara de imprevisível", sem papéis fixos. Hipótese de desenho: **a variação vem do código, não do acaso da IA**. Antes de cada bloco, o código sorteia parâmetros (quem puxa, padrão de conversa entre os 5 do rascunho acima, tamanho-alvo, se há comentário do outro, quantas trocas) e os coloca no briefing. Vantagens: variação garantida e reproduzível, custo zero, fácil de testar ("este bloco saiu com padrão 3 e Iraí puxando"). A personalidade entra no briefing como tendência ("Tainá costuma ser mais animada"), não como regra.

## Como alimentar a IA do roteiro (estudo, nada decidido)

Contexto: IA no roteiro é inevitável (D17); o resto antes dela é código (D16). Perguntas em aberto e opções:

**1. O que a IA recebe de cada notícia**
- (a) texto bruto integral (caro, sujo, convida a copiar frases);
- (b) texto limpo e cortado por código em ~1.000–1.500 caracteres, mantendo o início e as frases com números/nomes (hipótese preferida a testar);
- (c) uma "ficha" com quem/o quê/quando/onde/números extraída antes (por regra onde der; por IA barata só se necessário).

**2. Quantas chamadas**
- (A) uma chamada com todas as notícias → fluxo mais contínuo e ligações entre notícias, mas saída longa, risco maior de invenção, e erro obriga a regerar tudo;
- (B) uma chamada por bloco → controle, regeração isolada, custo previsível, mas perde continuidade (mitigar passando um resumo de 1–2 linhas do bloco anterior);
- (C) híbrido: uma chamada curta de *plano do episódio* (ordem, transições, parâmetros sorteados, ganchos entre notícias) e depois uma chamada por bloco seguindo o plano.

**3. Como medir** (mesmos 5 dias de notícias, três variantes): fidelidade aos fatos (checagem automática de números/nomes + leitura humana), naturalidade (ficha de escuta do Tap), tamanho e duração, custo de tokens, taxa de reprovação na validação, esforço para corrigir um erro.

**4. Itens decididos que valem para qualquer variante:** texto falado (números por extenso, siglas lidas), citação da fonte, nenhum fato fora do briefing, sem papéis fixos.

## Transições de clima entre notícias (proposta, 2026-11-11)

**Problema (Tap):** passar de uma notícia séria direto para uma leve, "com o astral lá em cima", soa esquisito. A tentativa anterior não ficou natural.

**Exemplo real do sistema antigo (roteiro 07/08/2025):** N3 "moradores com problemas respiratórios por causa do incêndio" → N4 "Google libera Gemini grátis para estudantes", com reação "Que massa, né?". Nos 5 roteiros mais recentes as "transições" eram só ordinais ("Na sequência…", "Chegando à quarta…"), sem nenhuma ponte de clima. Hipótese: cada bloco era escrito sem conhecer o vizinho, e a ordem seguia a seleção, não o clima.

**Solução em três camadas, da mais simples à mais elaborada. Nenhuma exige IA extra.**

1. **Ordenar pelo clima (código).** Cada notícia selecionada tem um humor entre os três da D09 (sério, neutro, leve). O código ordena para evitar saltos sério→leve ou leve→sério: usa o neutro como degrau, agrupa os sérios, deixa os leves juntos. Meta de curva: começar com utilidade pública/neutra, concentrar os sérios no meio, terminar leve ou neutro. Quando o grupo selecionado não permitir (p.ex. 1 leve e 4 sérias), aceita-se 1 salto e entra a camada 2.
   - *Como saber o humor sem IA:* regras por palavra-chave e seção (acidente, morte, incêndio, cheia → sério; festival, show, estreia, curiosidade → leve; resto neutro) já vêm pré-marcadas na lista de candidatas; o Tap corrige com um toque ao selecionar.
2. **Ponte de transição só quando há salto (parte do bloco seguinte).** O briefing do bloco inclui `humor_anterior` e `humor_atual`. Uma tabela de 3×3 dá o tipo de ponte:
   - mesmo humor → só um conector curto ("e por falar em…" quando houver ligação, ou nada);
   - sério→neutro ou leve→neutro → ponte curta de mudança de assunto;
   - sério→leve → "respiro": uma frase reconhecendo o peso da anterior e virando a chave com calma, sem festa imediata;
   - neutro/leve→sério → aviso de mudança de tom, sem choque.
   A IA escreve a ponte no estilo dos apresentadores, dentro do bloco (1–2 frases no início), então **continua sendo uma chamada por bloco**, sem etapa nova.
3. **Voz e áudio acompanham sem complicar.** A fala de ponte usa a configuração de voz "neutro" (degrau entre sério e leve); a primeira fala do bloco leve após um sério pode ser neutra e subir. Uma pausa levemente maior entre blocos depois de notícia séria. Sem vinheta/trilha variável (D10).

**Regra extra:** o último bloco antes do encerramento não deve ser o mais pesado; se for, o encerramento abre com uma frase neutra de fechamento, não com animação.

**Teste barato:** pegar as notícias de 07/08 (ou de outro dia do Drive), gerar a ordem por clima, comparar com a ordem original e ouvir/ler as pontes; o Tap avalia na ficha de escuta se o salto ficou natural.

**O que NÃO fazer (lições da tentativa anterior):** classificar humor e tema de cada notícia com chamadas de IA, escolher vinheta por humor, trilha de fundo variável. Esses itens custaram complexidade sem resolver a naturalidade.

## Ordem dos blocos e grau de intervenção (proposta, 2026-11-11)

**Objetivo do Tap:** menos interferência manual; o que der, automático e sem IA.

**Ordem automática por regras (código):**
1. **Primeiro**, a notícia de maior pontuação entre as de humor neutro ou sério e de utilidade pública (o "gancho" do episódio). Se a manchete for muito pesada, entra em segundo, depois de uma neutra.
2. **Meio**: as demais por pontuação, **agrupadas por clima** (D18) e por afinidade (mesmo assunto, mesma categoria ou mesma cobertura), para as ligações "por falar nisso" saírem naturais.
3. **Fim**: leve ou neutra (D18).
4. Notícia de **continuação** (assunto já coberto ontem) vem marcada como atualização.

**Intervenção humana por exceção:** a lista chega já ordenada. O Tap só mexe se discordar, com controles mínimos no celular: "tornar principal", subir/descer um lugar e "tirar da lista". Sem arrastar nem redesenhar tudo.

**Escada de autonomia** (cada degrau só depois de o anterior se provar):
- *Degrau 1 (Nível 0/1):* o Tap escolhe as 5–6 notícias (D13); a **ordem é automática**.
- *Degrau 2:* o sistema também **escolhe** as 5–6 por regras; o Tap só veta ou troca (aprovação por exceção).
- *Degrau 3:* sem ação do Tap salvo se ele vetar até um horário; o histórico de trocas do Tap ajusta as regras.
Registrar o que o Tap muda é o dado que mostra se o degrau seguinte já compensa.

## Meta de longo prazo: confiança suficiente para não revisar (2026-11-11)

O Tap quer chegar a um ponto em que **confia tanto no processo que não precisa revisar nada**. Para isso a confiança tem que ser **medida**, não sentida. Rascunho de critérios (limiares ❓ a definir com o Tap):

- **Métrica base:** taxa de intervenção do Tap = fração de episódios/blocos em que ele trocou, reordenou, vetou ou reprovou algo. O sistema registra cada mudança.
- **Subir um degrau da escada (D19)** só quando, por N dias seguidos (❓ ex.: 14), a intervenção ficou abaixo de um limite (❓ ex.: ≤ 1 pequena troca por semana) e nenhuma reprovação por erro factual ou de áudio ocorreu.
- **Redes de segurança antes de publicar sem humano** (sempre automáticas, no código):
  1. validação de fatos do bloco contra o briefing (números, nomes, datas);
  2. checagem do áudio (duração dentro da faixa, sem trechos vazios, volume dentro do padrão);
  3. checagem de conteúdo (nada policial/gráfico fora das regras, nenhum termo de uma lista de bloqueio);
  4. **disjuntor**: se qualquer checagem falhar, o episódio **não publica** e avisa o Tap; melhor pular o dia do que publicar erro.
- **Amostragem:** mesmo em modo automático, o Tap pode ouvir por amostragem (ex.: 1 episódio por semana) para recalibrar, em vez de revisar todos.
- **Responsabilidade editorial:** publicar sem revisão humana significa que erros factuais vão ao ar; as redes de segurança precisam ser bem mais estritas que as de hoje. Isso entra na avaliação legal/ética do estudo.

