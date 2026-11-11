# 08 — Perguntas abertas

Preciso das respostas do Tap (ou de dados do computador dele) para avançar.

## Negócio

1. Qual orçamento mensal total você aceita gastar (APIs + hospedagem)? E existe plano de monetização?
2. Diário todos os dias, ou dias úteis? Pode ter dias sem episódio?
3. O objetivo é audiência real (publicar de verdade) ou ainda é um projeto/portfólio experimental?
4. Quão natural precisa ser a voz? A ElevenLabs foi uma exigência de qualidade ou só a primeira que você testou?

## Dados reais do projeto atual

5. Quanto você gastou nos últimos meses em ElevenLabs e em Gemini/OpenAI (print da fatura)?
6. Quantos episódios completos já foram gerados, e há algum áudio final que posso ouvir/avaliar como referência de qualidade esperada?
7. Quanto tempo você levava por episódio entre seleção, revisão e publicação?
8. O que mais te irritou na operação: custo, bugs, tempo de ajuste, qualidade do roteiro, qualidade da voz?

## Editorial

9. Quais fontes são indispensáveis? Há outras (rádio, órgãos oficiais, redes) que deveriam entrar?
10. Estrutura fixa do episódio (cold open, blocos, efemérides, encerramento) é importante ou pode ser simplificada?
11. Os personagens/apresentadores (Tainá e Iraí) e o tom ("bubuia") são identidade fixa?

## Técnico

12. Onde você quer rodar: no seu PC (Windows, pelos scripts atuais) ou agendado na nuvem?
13. Aceita trocar de linguagem se for vantajoso, ou prefere manter TypeScript?
14. Já tem hospedagem/feed definido, ou isso ainda está aberto?

## Operação pelo celular e na nuvem

16. Você usa Telegram (ou WhatsApp) no dia a dia? Receber a lista de notícias e o áudio por lá seria confortável?
17. Quanto você aceita gastar por mês só com a infraestrutura (servidor/agendador)?
18. Você prefere zero manutenção de servidor, mesmo que menos flexível, ou aceita cuidar de um servidor pequeno?
19. Em que horário você consegue decidir? A resposta pode chegar horas depois do aviso?

## Legal

15. Já pensou em como lidar com direitos dos portais de notícia (apenas resumo + link/atribuição)?

## Formato do episódio (levantadas em 2026-11-11)

20. Nível 0 sem cold open (começa direto na abertura e cardápio) é aceitável? Se quiser algo no início, serve uma pergunta/curiosidade fixa de uma lista curada?
21. Quantas notícias por episódio? O bate-bola (comentário do outro apresentador) é essencial desde o início?
22. As duas vozes são essenciais já no Nível 0, ou uma voz só no começo?
23. O pedido de seguir/compartilhar e a despedida podem ser texto fixo gravado uma vez, sem passar pela IA?
24. A vinheta de abertura, a de transição e a vírgula sonora já existem em áudio pronto (só há `virgula_sonora.mp3` no repositório)?

## Áudio de referência e apresentadores (2026-11-11)

25. Se enviar um episódio antigo: eu não consigo *ouvir* áudio. Posso medir objetivamente (duração, volume, silêncios, estrutura) com ffmpeg e analisar a transcrição/roteiro, mas naturalidade, emoção e "cara de robô" só você julga. Você topa julgar com uma ficha de escuta que eu monto? Existe o roteiro (texto) do episódio?
26. Dos traços da Tainá e do Iraí, quais são inegociáveis (ex.: idade/origem, gírias, jeito de reagir)? O resto pode ser cortado.
27. Os 5–6 itens do dia incluem notícias leves/curiosidades locais ou só "hard news"?

## Voz (2026-11-11)

28. Das vozes ElevenLabs que você usou, alguma ficou boa o suficiente para manter (Tainá/Iraí atuais)? O que faltava: idade jovem, sotaque, ritmo?
29. Aceita voz mais neutra/madura se o texto for bom, ou o timbre jovem é inegociável?

30. Nos trechos de comentário, quantos "humores" distintos você sentia necessidade (ex.: neutro, sério/pesado, leve/alegre)? Mais que isso era exagero?

## Notícias e fontes (2026-11-11)

31. Quais 2–3 fontes funcionavam de verdade? E quais falharam (D24am, outras)?
32. Que outras fontes você gostaria de ter (órgãos públicos, rádios, blogs, redes)?
33. Concorda com a proposta D13: o sistema só filtra e pontua por regra, e você escolhe? Quantos minutos por dia você aceita gastar nisso?
34. Lista de palavras/temas a evitar e a priorizar: você consegue listar 10–15 de cada, para começarmos as regras?
35. A fusão da mesma notícia de várias fontes é essencial já na primeira versão ou pode esperar?

## Arquivos locais do projeto antigo (2026-11-11)

36. **Pendente, sem pressa:** o Tap vai procurar no computador (e em outros lugares onde possa ter salvo) os arquivos não versionados do podcast-ia: roteiros gerados, notícias brutas, logs da coleta, áudios de episódios. Usar só como pesquisa, nunca como direção. Observação: a pasta `podcast-app` do Remote Control **não** é este projeto; a pasta do podcast-ia não está na lista de pastas compartilhadas.
- Resposta à pergunta 31 (fontes que funcionavam): o Tap não lembra, o processo era automático. Só se descobre com os logs ou testando de novo.

## Diálogo e filtros (2026-11-11)

37. Nas notícias que você descartava por depender de imagem/vídeo: lembra expressões típicas além de "veja o vídeo" e "olhe as imagens"? Quantas por dia isso derrubava?
38. Para o roteiro, prefere que testemos primeiro uma chamada por bloco (mais controle) ou uma só para o episódio (mais fluido)? Pode ser decidido depois do teste.

## Transições (2026-11-11)

39. Você aceitaria marcar o humor (sério/neutro/leve) de cada notícia com um toque ao selecionar, com sugestão pré-preenchida por regra? Ou prefere que o sistema decida sozinho, mesmo errando às vezes?
40. Existe uma "curva" que você achava ideal para o episódio (ex.: começar com utilidade pública, notícias pesadas no meio, fechar leve)?

## Ordem e autonomia (2026-11-11)

41. Em 07/08 a manchete foi a última notícia do roteiro, mas em 06/08 foi a primeira. Você reordenou pela interface nesses dias, ou a ordem final vinha da IA?
42. A primeira notícia deveria ser sempre a mais importante, ou a mais útil, ou a mais "gostosa de ouvir"? Isso muda a regra de gancho.
43. Qual grau de autonomia te agrada como destino: (1) você escolhe, ordem automática; (2) sistema escolhe, você só veta; (3) tudo automático, você só veta até um horário?

## Descrição, capa e feed (2026-11-11)

44. A descrição do episódio, para você, é só a lista das notícias do dia (com links) ou precisa de texto "chamativo" escrito? Se for lista, o template resolve sem IA.
45. Capa: identidade visual fixa com a numeração, ou uma imagem diferente por episódio? Você já tem a arte/thumbnail (há `thumbnail01/02.png` no repositório)?
46. Você já tem hospedagem ou conta em plataforma de podcast (Spotify for Creators etc.)? O feed de antes chegou a ser publicado em algum lugar?

## Confiança e publicação sem revisão (2026-11-11)

47. Para você confiar a ponto de não revisar, qual seria o critério? Ex.: "14 dias seguidos sem eu precisar mudar nada".
48. Se o sistema achar que algo está duvidoso, prefere que ele **pule o episódio do dia** ou publique uma versão reduzida (menos notícias)?
49. Aceita ouvir por amostragem (ex.: 1 episódio por semana) mesmo no modo automático?

50. Que tipos de erro mais te preocupariam num episódio publicado sem você ouvir (fato errado, tom inadequado, nome/pronúncia, notícia pesada demais, voz falhando)? Isso define o que o revisor precisa pegar.

51. **Monetização:** o Bubuia News pode vir a ter anúncio, patrocínio ou outra receita? Isso decide se modelos de voz com licença "não comercial" (como o padrão do VoiceStudio/OmniVoice) podem ser usados.

52. No experimento do Google, você usou só o texto do roteiro ou também deu instruções de personalização (foco, tom)? O áudio respeitou o conteúdo ou reinterpretou? Ainda tem algum desses áudios salvos para eu medir duração?
53. Para eu conferir preço e idiomas do TTS do Gemini nas páginas oficiais, o domínio `ai.google.dev` precisa ser liberado na rede desta sessão. Você autoriza isso quando eu pedir?

- Resposta à 52: o Tap não lembra como fez o experimento no Google; o áudio não está à mão. A decisão sobre liberar `ai.google.dev` (pergunta 53) está em aberto: Tap pediu explicação; sugerido deixar para a fase de teste de vozes.
