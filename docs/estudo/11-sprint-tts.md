# 11 — Sprint de TTS: validar a voz primeiro

**Direção do Tap (2026-11-11):** o TTS decide se o projeto vai adiante: soa natural? dá para automatizar? dá para baixar o custo, idealmente a zero? Então se testa **primeiro**, com roteiro de teste, e o resto do estudo segue com algo concreto na mão.

## Por que concordo (e por que primeiro)

- É a **premissa mais arriscada**: maior custo antigo, maior incerteza de qualidade em pt-BR e a que **muda a arquitetura** (fala a fala × por bloco, PC com GPU × nuvem, cache, custo por episódio).
- As outras etapas (coleta, filtros, ordem, roteiro por IA) já se mostraram viáveis ou são código comum; a **naturalidade da voz** é a que ainda ninguém garantiu.
- Se nenhum caminho passar nos critérios, é melhor saber **antes** de construir o resto.

## Ressalvas

1. **Critérios antes dos testes.** "Natural", "automático" e "barato" precisam de nota de corte; senão qualquer resultado parece bom ou ruim demais.
2. **Roteiro de teste realista, não aleatório.** Usar o estilo dos roteiros reais (siglas, nomes locais, números, reações), senão o teste não reproduz o problema (pronúncia de "Tarumã-Açu", "IMMU", "Caprichoso e Garantido"). O banco de teste está em `experimentos/tts/banco-de-teste.md`.
3. **"Custo zero" é uma meta, não uma garantia.** Pode haver zero de dinheiro (modelo local, cota gratuita) mas com custo de tempo/configuração, ou cota gratuita com termos que mudam. Por isso a decisão usa uma **escada de custo**, abaixo.

## Critérios de passagem (rascunho; ❓ = Tap define)

| Critério | Passa se |
|----------|----------|
| Naturalidade das vozes | nota média ≥ 4/5 na ficha de escuta (arquivo 10) por ao menos 1 combinação de duas vozes |
| Naturalidade do diálogo | ≥ 4/5, sem soar "dois leitores" |
| pt-BR | sotaque e pronúncia aceitáveis; nomes locais do banco de teste ≤ 2 erros por minuto ❓ |
| Duas vozes distintas | homem e mulher claramente diferentes; timbre jovem é bônus (D26) |
| Automação | gera o áudio por **script/API/linha de comando**, sem clique manual |
| Tempo | gera 10 min de áudio em ≤ ❓ min (sugestão: ≤ 30) |
| Hardware | roda na RTX 4060 (8 GB) **ou** em serviço de nuvem |
| Licença | uso não comercial aceito (D29) mas preferir comercial claro |
| Custo | ver escada |

**Escada de custo:** (1) **zero**: modelo local ou cota gratuita sustentável; (2) **centavos por episódio**; (3) valor próximo do atual da ElevenLabs. Quanto mais alto o degrau, mais precisa compensar em qualidade e menos dias por semana (D27).

## Candidatos, em camadas

**Observação:** itens marcados (M) vêm do meu conhecimento prévio, **não verificado nesta sessão**; (P) vêm da pesquisa desta sessão (ver 04); todos exigem teste.

| Camada | Candidato | Por que testar | Dúvidas |
|--------|-----------|----------------|---------|
| Referência (teto de qualidade) | ElevenLabs (já usado) | benchmark do que "bom" soa | custo atual |
| Referência (manual) | NotebookLM Audio Overview | já ouvido pelo Tap; naturalidade de diálogo | não é pipeline (reescreve) |
| Nuvem, diálogo | TTS do Gemini com dois locutores (P) | leitura do **nosso** texto, API, nuvem | preços, idiomas e cota gratuita (a oficial está em `ai.google.dev`, ainda não aberta) |
| Nuvem, voz neural | TTS neural de grandes provedores com vozes pt-BR (M), ex. serviços de voz da Microsoft e do Google | cotas gratuitas mensais costumam existir; vozes estáveis | termos de uso e limite gratuito |
| Local, leve | Piper (M), Kokoro (M) | rodam em CPU/GPU modesta; podem ter vozes pt-BR | podem soar menos naturais |
| Local, clonagem | XTTS-v2 (M, P), F5-TTS (M) | boa naturalidade em alguns idiomas; cabem em 8 GB | licença; português; velocidade |
| Local, diálogo | VibeVoice, FireRedTTS-2, SoulX-Podcast, Dia (P) | foco em conversa entre dois locutores | português? memória de vídeo? |
| Estúdio local | VoiceStudio/OmniVoice (P) | tudo em um | pesos não comerciais; API de síntese não documentada |

## Como rodar (quem faz o quê)

- **Eu (nesta nuvem, sem GPU):** preparo o banco de teste, a ficha de escuta, os roteiros dos scripts de teste, instruções passo a passo para cada candidato e, depois, **analiso os arquivos de áudio** que o Tap devolver (duração, volume, silêncios, pausas) com ferramentas próprias. Não consigo ouvir nem rodar modelos de GPU.
- **Tap (no PC com RTX 4060 ou nos sites):** executa os testes seguindo as instruções, salva os áudios e os coloca no Drive (`testes de audio/` já existe) ou aqui; ouve às cegas e preenche a ficha.
- **Registro:** cada teste anota candidato, versão, configuração, tempo de geração, custo, notas e o arquivo gerado, na tabela abaixo.

## Testes rápidos possíveis agora (sem programar)

Tamanho do banco de teste: **~2.000 caracteres** nos testes 1 a 5 (~605 + 445 + 424 + 396 + 157), ou seja, bem pequeno: custo de teste muito baixo em qualquer serviço pago. (Estimativa de custo antes de cada chamada paga: regra do projeto.)

1. **Playground de fala do Google AI Studio** (M, não verificado): interface web com Gmail, sem chave, para testar voz com dois locutores colando o texto. Usar uma conta Google normal (ex.: a do feed do podcast, não a do Chat se for conta de trabalho/escola).
2. **Demonstrações no navegador** de modelos abertos (ex.: XTTS, F5-TTS, Kokoro em páginas de demonstração gratuitas, como as do Hugging Face), **só para ouvir a qualidade**, sem instalar nada. Não testam automação.
3. **ElevenLabs** (referência): se a conta antiga ainda tiver créditos, gerar só os testes 1 a 3 com as mesmas falas para ter o "teto".
4. **OpenAI**: só se ainda houver crédito; é voz única por chamada (sem diálogo), prioridade baixa.
**Achado (2026-11-11, prints do Tap no celular):** o **Google AI Studio tem um playground de fala** (modelo "Gemini 3.8 Flash" aparece na tela inicial). A tela de fala funciona por **blocos de fala**: cada bloco tem um locutor com voz própria (ex.: "Speaker 1 - Aoede"), um seletor **Style**, o botão **+ Expression**, "Add speech block", "Run", player e download. Já abre com um áudio de exemplo em inglês de 28 s. Isso confirma que dá para montar diálogo de dois locutores e configurar estilo/expressão **por trecho**. Ainda não testado em pt-BR.
**Achado 2 (2026-11-11, print de "Speaker settings"):** a tela de voz tem **busca em "2.000+ vozes"** com filtros (Idioma, Gênero, Tom, Estilo, Caso de uso) e um botão "+ New voice". Com o filtro **Portuguese** ligado, aparece **"No voices match your search. Link a Paid Key to explore more voices."**: na conta gratuita, a biblioteca de vozes marcadas como portuguesas **só abre com chave paga vinculada** (cobrança ativada). Isso **não prova** que o português não funcione: as vozes padrão gratuitas (ex.: Aoede) podem ler texto em português; falta ouvir. Pendente: testar sem o filtro e julgar o sotaque; só considerar vincular chave paga depois dos testes gratuitos e com limite de gasto.
**Achado 3 (print do Tap):** o AI Studio oferece **marcas de expressão inline** (visíveis: `argh`, `breath`, `cackle`, `cheer`, mais outras; exemplos de uso `<gasp>`, `<laugh>`), inseridas digitando `<`. Em inglês; **a testar em pt-BR**, com e sem marcas (Teste 5 do banco). Relevante para as reações curtas e para a ponte de clima (D18); o Tap relata que marcas no texto funcionavam pouco na ElevenLabs.
5. **Azure/Microsoft**: deixar para depois (exige cadastro com cartão); não é necessário agora.

## Ordem sugerida

1. **Tap define os critérios** (a tabela acima, ajustando os ❓).
2. **Nuvem barata primeiro** (menos atrito): TTS neural com cota gratuita e, quando possível, o TTS do Gemini.
3. **Local leve** (Piper, Kokoro) para ver o piso grátis.
4. **Local de maior qualidade** (XTTS-v2, F5-TTS) e **modelos de diálogo** se a VRAM e o português permitirem.
5. **ElevenLabs** e **NotebookLM** como teto.
6. Comparar às cegas e decidir pela regra abaixo.

## Regra de decisão

- Se algum candidato passar em naturalidade, pt-BR, automação, hardware e licença **no degrau de custo ≤ 2**: seguir para o resto do estudo/Nível 0 com ele.
- Se só passar no degrau 3 (custo atual): reduzir frequência/duração (D27) e reavaliar o custo mensal real antes de seguir.
- Se **nenhum** passar: opções (a) manter ElevenLabs só para o que importa (ex.: apenas blocos principais) e reduzir dias/semana, (b) esperar modelos melhores e retestar em alguns meses, (c) pausar o projeto. Decidir com o Tap.

## Resultados (preencher)

| Data | Candidato | Config | Naturalidade voz | Naturalidade diálogo | pt-BR/pronúncia | Automação? | Tempo p/ 10 min | Custo | Licença | Veredito |
|------|-----------|--------|------------------|----------------------|-----------------|------------|-----------------|-------|---------|----------|
| 2026-11-11 | Gemini TTS (AI Studio, gratuito, playground) | voz padrão Aoede, 1 locutor, Teste 1 (bloco sério, sem marcas) | **bom** (voz de mulher adulta, não jovem) | não avaliado (1 voz) | **sem sotaque estranho; leu direito** | manual por ora (playground); API a confirmar | não medido | gratuito no playground | a verificar | **positivo; seguir testando** |

**Observações do Tap sobre o primeiro teste (2026-11-11):** o resultado foi "bem bom"; as expressões ficaram ótimas; leu "direitinho, sem sotaque"; timbre mais adulto que o desejado (aceitável, D26). Por ora só consegue testar com **uma voz** (verificar se o segundo locutor exige algo na conta gratuita ou se foi dificuldade no celular).

**Resultados dos testes A–D com uma voz (Tap, 2026-11-11):** "bem positivos". Dá para notar **leve sotaque nos R**, que o Tap atribui à voz ser originalmente em inglês. A **voz masculina gratuita ficou boa**; as **femininas gratuitas ainda precisam de uma melhor**. **Sem marcas** já há nuances; **com marcas** ficou "bem melhor, mais expressivo": o modelo realizou o que a marca pedia. Próximo: texto mais longo com marcas (Teste 7 do banco). Pendentes: lista completa de marcas, resposta à pergunta 71 (segundo locutor), áudios no Drive, lista de erros de pronúncia do teste A.

