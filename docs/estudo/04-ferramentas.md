# 04 — Ferramentas

Para cada etapa: opções, critérios, teste feito, escolha. Preços/versões verificados em fonte oficial com data (ver arquivo 03).

## Critérios de avaliação (peso a definir)

Qualidade pt-BR · custo/episódio · simplicidade de integração · confiabilidade/limites · licença/uso comercial · risco de lock-in.

## Etapas

### 1. Coleta de notícias
Opções: RSS onde existir · scraping (cheerio, atual) · APIs de notícias · Google News RSS por busca (Manaus/Amazonas).
Teste: quantas notícias/dia por fonte, taxa de falha, necessidade de manutenção quando o site muda.

### 2. Agrupamento de duplicatas
Opções: similaridade de título (fuzzy, sem custo) · embeddings + limiar · LLM barato para confirmar pares.
Teste: precisão num conjunto de 1 semana rotulado à mão.

### 3. Ranqueamento/seleção
Opções: regras simples (fonte, palavras-chave, recência, nº de fontes que cobriram) · LLM só para desempate.
Observação: "mesma notícia em N sites" já é um bom sinal de relevância e é grátis.

### 4. Roteiro (LLM)
Opções: Gemini (Flash/Pro) · Claude · GPT · modelos abertos.
Teste: mesmo conjunto de notícias → comparar fidelidade aos fatos, naturalidade do diálogo, tamanho, custo.

### 5. Voz (TTS) — maior alavanca de custo
Opções: ElevenLabs (atual) · outros TTS comerciais · TTS open-source · modelos de diálogo multi-locutor.
Teste: mesmo trecho de 1 min, 2 vozes, avaliado às cegas; registrar custo por minuto.

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
