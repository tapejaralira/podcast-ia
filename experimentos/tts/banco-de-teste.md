# Banco de teste de TTS

> **Texto fictício só para teste de voz. Não são notícias reais.** Estilo copiado dos roteiros do Bubuia News: duas vozes, fala informal, números por extenso, siglas e nomes locais. Locutores: **A** (Tainá, voz feminina) e **B** (Iraí, voz masculina). Marcadores de humor: `[sério]`, `[neutro]`, `[leve]`.

Todos os testes devem ser gerados **com as mesmas falas** em cada candidato. Registrar tempo de geração, custo e arquivo.

## Teste 1: bloco sério (~50 s)

`[sério]`
**A:** Pra primeira notícia de hoje, a Prefeitura de Manaus informou que três linhas de ônibus vão mudar de itinerário a partir da próxima segunda-feira, onze de agosto.
**B:** As linhas quatrocentos e sessenta e um, duzentos e cinco e duzentos e vinte e três passam a atender o Parque das Garças e a Nova Esperança, segundo o IMMU.
**A:** Olha, pra quem pega ônibus todo dia, vale ficar atento. O Instituto disse que vai ter agentes nos pontos pra orientar o pessoal.
**B:** E o recado é: confere o novo trajeto antes de sair de casa, pra não perder o horário.
**A:** Isso é sério, gente. Mudança de linha mexe com a rotina de muita gente.

## Teste 2: bloco leve (~50 s)

`[leve]`
**B:** Agora uma notícia mais animada: a Mostra de Teatro Águas de Manaus vai ter um show gratuito com itens do Caprichoso e do Garantido, neste domingo, no Anfiteatro da Ponta Negra!
**A:** Ai, que delícia! Começa às vinte horas, e antes tem a peça "Tucumã e Buriti", do Grupo Jurubebas, às dezessete horas.
**B:** A cunhã-poranga e o levantador de toadas vão estar lá, é pra quem sente saudade de Parintins.
**A:** Eu vou! E vocês? Conta pra gente se vão levar a família.

## Teste 3: ponte de transição e bloco neutro (~45 s)

`[neutro]`
**B:** Foi pesado, né, Tainá. Mas vamos mudar de assunto com calma.
**A:** Isso. Respira um pouco, que a próxima notícia é de utilidade pública: a Aleam aprovou um projeto sobre a distribuição de água em áreas atingidas pela cheia.
**B:** Segundo o G um, o texto prevê caminhões-pipa e estações móveis de tratamento em municípios do interior, como Manicoré e Humaitá.
**A:** Quem mora perto desses lugares pode ficar de olho nos avisos da Defesa Civil.

## Teste 4: palavras difíceis e números (~30 s, falas curtas)

**A:** Ponta Negra, Parintins, Tarumã-Açu, Aleam, IMMU, Semsa, Gaeco, Vasco Vasques.
**B:** Torquato Tapajós, Distrito Industrial, Educação Física, Caprichoso e Garantido, Compensa.
**A:** Dezessete mil quatrocentas e noventa e três inscrições. Sessenta vírgula sete por cento. Dez milhões de reais.
**B:** Trinta e dois órgãos, três mil seiscentas e cinquenta e duas vagas, vinte e um de agosto de dois mil e vinte e cinco.

## Teste 5: reações curtas e emoção (~20 s)

**A:** (surpresa) Nossa, sério? Não sabia disso!
**B:** (preocupado) Poxa, isso é complicado mesmo.
**A:** (animada) Que ótimo, gente! Era o que a gente queria ver.
**B:** (neutro) Bom, vamos acompanhar e trazer as atualizações.

## Teste 6: bloco longo ~2 min (estabilidade)

Concatenar os testes 1, 2 e 3 em sequência, com a ponte entre o 1 e o 2, e gerar numa única chamada (quando o candidato permitir) ou por bloco. Anotar se a voz **muda de timbre** ou **perde ritmo** ao longo do áudio.

## O que observar em cada áudio

Usar a ficha de escuta de `docs/estudo/10-nivel-0-e-plano-de-testes.md`. Além dela: o locutor A e o B soam como pessoas diferentes durante todo o áudio? Há cortes, ecos, respiração artificial, sílabas engolidas? Números e siglas foram lidos corretamente?

## Teste 7: bloco longo com marcas de expressão (~1 min 45 s)

Use **no máximo 1 marca a cada 2 ou 3 falas**, só em reação/comentário, nunca no meio dos fatos. Se só houver **uma voz**, apague "Tainá:" e "Iraí:" e cole tudo num bloco.

```
Tainá: Pra primeira notícia de hoje, a Prefeitura de Manaus informou que três linhas de ônibus vão mudar de itinerário a partir da próxima segunda-feira, onze de agosto.
Iraí: As linhas quatrocentos e sessenta e um, duzentos e cinco e duzentos e vinte e três passam a atender o Parque das Garças e a Nova Esperança, segundo o IMMU.
Tainá: <breath> Olha, pra quem pega ônibus todo dia, vale ficar atento. O Instituto disse que vai ter agentes nos pontos pra orientar o pessoal.
Iraí: E o recado é: confere o novo trajeto antes de sair de casa, pra não perder o horário.
Tainá: Isso é sério, gente. Mudança de linha mexe com a rotina de muita gente.
Iraí: <breath> Bom, vamos respirar um pouco e mudar de assunto, que a próxima é mais animada.
Tainá: <cheer> Isso! A Mostra de Teatro Águas de Manaus vai ter um show gratuito com itens do Caprichoso e do Garantido, neste domingo, no Anfiteatro da Ponta Negra!
Iraí: Começa às vinte horas, e antes tem a peça "Tucumã e Buriti", do Grupo Jurubebas, às dezessete horas. <laugh> É pra quem sente saudade de Parintins.
Tainá: <gasp> Eu vou! E vocês? Conta pra gente se vão levar a família.
Iraí: Mudando de novo, agora uma de utilidade pública: a Aleam aprovou um projeto sobre a distribuição de água em áreas atingidas pela cheia.
Tainá: Segundo o G um, o texto prevê caminhões-pipa e estações móveis de tratamento em municípios do interior, como Manicoré e Humaitá.
Iraí: Quem mora perto desses lugares pode ficar de olho nos avisos da Defesa Civil.
```

Observar: as marcas ficam naturais ou exageradas? A **ponte** (Iraí: "vamos respirar um pouco") soa bem após o bloco sério? A voz mantém o ritmo até o fim? Alguma marca foi **lida em voz alta** em vez de interpretada?

## Teste 8: conversa informal entre os dois (4 blocos, com marcas no meio/fim)

Objetivo: ouvir como soa **conversa** (não leitura de notícia) e se a transição entre blocos fica natural. Texto fictício e casual. **As marcas ficam no meio ou no fim da fala, não no começo**, porque no Teste 7 a marca no início de uma fala destoou da fala anterior do outro locutor. Cada fala reage ao que o outro acabou de dizer.

Speaker 1 = Tainá, Speaker 2 = Iraí. Para comparar, rode também uma versão **sem as marcas** (apague as partes entre `< >`). No campo **Style** de cada bloco, experimente: "conversa descontraída e rápida entre amigos, sem pausas longas entre as falas".

**Bloco 1, Tainá**
```
Gente, eu juro que hoje o calor em Manaus tava de outro mundo. Saí de casa onze horas e parecia que eu tava andando dentro de um forno, sabe? Aí eu pensei: ou chove daqui a pouco, ou eu viro tacacá derretido. E tu, Iraí, sobreviveu como? <laugh>
```

**Bloco 2, Iraí**
```
Sobrevivi no ar-condicionado, Tai, sem vergonha nenhuma. <breath> Mas olha, aí começou a armar aquele céu escuro lá pras duas da tarde, e eu falei: pronto, vai cair o mundo. E caiu mesmo! Só que aí o trânsito virou aquela loucura na Djalma Batista, né? Chuva em Manaus e engarrafamento são praticamente irmãos.
```

**Bloco 3, Tainá**
```
Pois é! Eu fiquei quarenta minutos parada no mesmo lugar, <argh> só olhando a chuva. Mas aí, vou te falar, saí do ônibus e a primeira coisa que eu fiz foi tomar um tacacá bem quentinho. Parece loucura com esse calor todo, mas é um dos melhores momentos do dia, né? Tu não concorda?
```

**Bloco 4, Iraí**
```
Concordo cem por cento! <laugh> Tacacá com pimenta, jambu deixando a língua formigando... é o tipo de coisa que só quem é daqui entende. Bom, falando em coisa boa da nossa terra, bora ver o que rolou de notícia hoje? Tem coisa importante pra contar pro pessoal.
```

**Observar:** a conversa soa como duas pessoas? A passagem de um bloco para o outro fica natural? As marcas no meio/fim soam melhor que no começo? O Style "conversa descontraída" muda o ritmo?

