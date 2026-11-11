# 06 — Operação

Como o episódio sai todos os dias.

## Rotina diária desejada (rascunho)

| Hora | Quem | O quê |
|------|------|-------|
| ❓ 05:00 | automático | coleta + agrupamento + proposta de seleção |
| ❓ 07:00 | Tap | aprova/troca notícias (≤ 5 min) |
| automático | | roteiro → vozes → mixagem |
| ❓ 09:00 | Tap | ouve, aprova (≤ 15 min) |
| automático | | publica no feed |

## Requisito do Tap: operar na nuvem, decidir pelo celular

Desejo: o computador do Tap não precisa estar ligado. Seleção de notícias, revisão do áudio e publicação são decididas pelo celular. **Hipótese a validar, não decisão.**

### O que precisa existir

1. **Execução agendada fora do PC** (roda sozinha de manhã).
2. **Armazenamento** de estado (JSON) e de áudios que sobrevive entre execuções.
3. **Canal de decisão no celular**: receber a proposta de notícias, aprovar/trocar, ouvir o episódio, aprovar.
4. **Retomada**: a pipeline para em cada ponto humano e continua depois que o Tap responde (horas depois).
5. **Segredos** (chaves de API) guardados fora do código.

### Opções de execução

| Opção | Vantagens | Riscos / custos a verificar |
|-------|-----------|-----------------------------|
| A. Tarefa agendada em CI (ex.: GitHub Actions com cron) | sem servidor para manter; já está no GitHub; ffmpeg disponível | limite de minutos gratuitos; tempo máximo por job; receber resposta do Tap exige disparar novo job; IPs de CI podem ser bloqueados por sites de notícia |
| B. VPS pequeno ligado 24h | fluxo simples, bot sempre ativo, estado em disco | custo fixo mensal; manutenção do servidor (atualizações, segurança) |
| C. Funções serverless + armazenamento de objetos | paga só pelo uso | mais peças para configurar; limite de tempo por execução; pode complicar o ffmpeg |

Primeira inclinação (a testar): **A para rodar a pipeline + um canal de decisão leve**, porque é a que menos código e manutenção exige. Cai para B se a resposta do Tap precisar chegar em tempo real e A ficar desajeitada.

### Opções de canal no celular

| Opção | Como funciona | Custo de desenvolvimento |
|-------|--------------|--------------------------|
| Bot de Telegram | envia lista de notícias com botões; envia o áudio para ouvir; botões aprovar/recusar | baixo: sem interface para construir; áudio de 10–15 min em mp3 comprimido cabe no limite de arquivo de bots (verificar) |
| Página web simples (PWA) | abre no navegador do celular, lista com checkboxes e player | médio: front-end + hospedagem + autenticação |
| E-mail com links de aprovação | links que disparam a próxima etapa | baixo, mas pouco prático para escolher notícias |
| Planilha/arquivo editado no celular | edita um arquivo e a pipeline lê | baixo, mas desajeitado |

Inclinação inicial: **Telegram** (ou similar) no M8; a interface web atual do repositório deixa de ser prioridade.

### Testes de viabilidade (antes de decidir)

- [ ] T1: os 4 coletores funcionam a partir de IP de nuvem/CI, sem bloqueio?
- [ ] T2: ffmpeg + geração de um episódio cabe no tempo e na memória do ambiente escolhido?
- [ ] T3: um bot recebe aprovação do celular e retoma a pipeline? Latência aceitável?
- [ ] T4: o áudio de 12 min é entregue e tocável no celular?
- [ ] T5: custo mensal real do ambiente (execução + armazenamento + banda).

## A definir

- **Onde roda**: ver opções acima; como o Tap é avisado (Telegram, e-mail, push).
- **Chaves e segredos**: onde ficam, rotação.
- **Monitoramento mínimo**: pipeline falhou? custo do dia acima do limite? Alerta simples.
- **Teto de gasto**: limite diário/mensal nas contas de API para evitar surpresas.
- **Plano B**: se um coletor quebra ou a API cai — publicar episódio reduzido? pular o dia?
- **Backup**: dados e episódios.
- **Checklist editorial** de revisão (fatos, nomes, pronúncia de termos locais, conteúdo sensível).
- **Pronúncia**: dicionário de termos manauaras/indígenas/siglas para o TTS.
