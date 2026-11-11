# 04 — Ferramentas

Para cada etapa: opções, critérios, teste feito, escolha. Preços/versões verificados em fonte oficial com data (ver arquivo 03).

## Critérios de avaliação (peso a definir)

Qualidade pt-BR · custo/episódio · simplicidade de integração · confiabilidade/limites · licença/uso comercial · risco de lock-in.

## Etapas

### 1. Coleta de notícias
Opções: RSS onde existir · scraping (cheerio, atual) · APIs de notícias · Google News RSS por busca (Manaus/Amazonas).
Teste: quantas notícias/dia por fonte, taxa de falha, necessidade de manutenção quando o site muda.

Achados do Tap sobre coleta (2026-11-11): nem todo site podia ser lido automaticamente; no fim só 2–3 fontes funcionavam, e isso limitava o projeto. Sites mudam o layout e o scraping quebra. Linhas a pesquisar (**nada verificado ainda**): feeds RSS/Atom oficiais dos portais; sitemaps de notícias; agregadores com feed por busca ("Manaus", "Amazonas"); sites de órgãos públicos (prefeitura, governo do estado, defesa civil, concessionárias) que têm utilidade pública e costumam publicar em formato estável; checar termos de uso de cada fonte.

### 2. Agrupamento de duplicatas
Opções: similaridade de título (fuzzy, sem custo) · embeddings + limiar · LLM barato para confirmar pares.
Teste: precisão num conjunto de 1 semana rotulado à mão.

### 3. Ranqueamento/seleção

**Proposta (a validar) para não depender de IA para decidir relevância:** o sistema propõe, o Tap decide.
1. **Filtro de exclusão por regra** (custo zero): corta policial/criminalidade por seção do site, palavras-chave e lista de termos.
2. **Pontuação simples por regra** (custo zero): bônus para palavras de utilidade pública (água, energia, transporte, saúde, clima, vagas/concursos, benefícios), tecnologia e cultura; bônus por quantas fontes cobriram o mesmo fato; bônus por recência; menção explícita a Manaus/Amazonas.
3. **Lista curta (15–20 candidatas) para o Tap escolher 5–6** em poucos minutos, pelo celular.
4. **Opcional, só depois do Nível 0:** uma única chamada barata de IA que lê só os títulos em lote para reclassificar. Não uma chamada por notícia.
5. **Depois:** registrar o que o Tap escolhe e rejeita; esse histórico é o melhor material para ajustar as regras.

Opções: regras simples (fonte, palavras-chave, recência, nº de fontes que cobriram) · LLM só para desempate.
Observação: "mesma notícia em N sites" já é um bom sinal de relevância e é grátis.

### 4. Roteiro (LLM)
Opções: Gemini (Flash/Pro) · Claude · GPT · modelos abertos.
Teste: mesmo conjunto de notícias → comparar fidelidade aos fatos, naturalidade do diálogo, tamanho, custo.

### 5. Voz (TTS) — maior alavanca de custo
Opções: ElevenLabs (atual) · outros TTS comerciais · TTS open-source · modelos de diálogo multi-locutor.
Teste: mesmo trecho de 1 min, 2 vozes, avaliado às cegas; registrar custo por minuto.

Pontos a pesquisar nesta etapa (relato do Tap, 2026-11-11; **verificar nas páginas oficiais, nada confirmado aqui**):
- Hoje a voz é gerada **por trecho** (fala a fala), com configuração própria por trecho. Funcionava; as marcas de entonação dentro do texto funcionavam pouco.
- Já existem formas de **duas vozes dialogando de forma mais natural** (geração de diálogo multi-locutor)? Em quais provedores, com português do Brasil, a que custo e com que controle de emoção por trecho?
- Notícias pedem pouca variação emocional; a nuance fica nos comentários (notícia pesada vs. alegre). Medir quanto a configuração por trecho melhora o resultado percebido frente a uma voz fixa.

Hipótese a testar (não decidida): **gerar o diálogo por bloco de notícia**, não fala a fala nem o episódio inteiro. Cada bloco (notícia + comentário) seria um trecho contínuo de duas vozes conversando, com duração conhecida depois de gerado; as vinhetas fixas e a vírgula sonora entram **entre blocos**, que já eram os pontos naturais. Isso tentaria juntar naturalidade (conversa contínua dentro do bloco) com edição simples (cortes só nas fronteiras). Comparar nos testes: (a) fala a fala, (b) diálogo por bloco, (c) episódio inteiro, em naturalidade, custo, facilidade de corrigir um erro (regerar só um bloco) e controle de humor.

### 6. Mixagem
Opções: ffmpeg (atual) · biblioteca de áudio em Python (pydub). Provavelmente manter ffmpeg com um único comando/filtro por episódio.

### 7. Hospedagem e publicação
Opções: host de podcast (gratuito/pago) · bucket de objetos + RSS próprio · GitHub Pages/Releases para o feed.
Teste: aceitação do feed por Spotify/Apple/YouTube Music; custo de armazenamento/banda.

### 8. Orquestração/execução
Opções: um único script + cron local · GitHub Actions agendado · serviço agendado em nuvem.

### 9. Interface de curadoria
Opções: mini-app web (atual) · arquivo markdown/JSON editado à mão · bot de Telegram/WhatsApp com botões · planilha.

## Matriz de decisão (preencher)

| Etapa | Opção A | Opção B | Opção C | Escolha | Motivo |
|-------|---------|---------|---------|---------|--------|
| Coleta | | | | | |
| Agrupamento | | | | | |
| Ranqueamento | | | | | |
| Roteiro | | | | | |
| Voz | | | | | |
| Mixagem | | | | | |
| Hospedagem | | | | | |
| Orquestração | | | | | |
| Curadoria | | | | | |
