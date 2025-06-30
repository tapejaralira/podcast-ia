# 🎙️ Bubuia News - Roadmap do Projeto 2.0

> **"Notícia quente de dentro da rede."**

---

## 🚀 Visão Geral

Este documento descreve o planejamento e o status atual do sistema de automação do podcast **Bubuia News**.  
A arquitetura foi redefinida para um fluxo de trabalho modular e inteligente, dividido em três fases principais:

- **Coleta de Notícias**
- **Curadoria de Pauta**
- **Geração de Roteiro**

---

## 🐟 FASE 1: Coleta de Notícias (O "Pescador")

**Status:** 100% CONCLUÍDO ✅

O objetivo desta fase é buscar o máximo de notícias relevantes das principais fontes de Manaus e do Amazonas.

### Pipeline de Coletores

- ✅ **Orquestrador (`buscarNoticias.js`):** Gerencia todos os coletores de forma centralizada.
- ✅ **Sistema de "Memória" (`estado_coleta.json`):** Registra a data da última coleta e busca apenas notícias novas desde então, eficiente em execuções diárias e capaz de cobrir fins de semana.
- ✅ **Múltiplas Fontes:** Coletores robustos e individuais para 4 grandes portais:
  - G1 Amazonas (via RSS)
  - A Crítica (via Web Scraping)
  - D24AM (via Web Scraping)
  - Portal do Holanda (via Web Scraping)
- ✅ **Filtro de Relevância Inicial:** Cada coletor já faz um pré-filtro por data, trazendo apenas notícias recentes.

**Resultado:**  
Geração do arquivo `data/noticias-recentes.json`, uma base de dados rica e atualizada para a próxima fase.

---

## 📰 FASE 2: Curadoria de Pauta (O "Editor-Chefe Digital")

**Status:** 95% CONCLUÍDO 🛠️

Esta é a fase mais inteligente do sistema, onde a pauta do episódio é definida com base em nossa linha editorial.

### Linha Editorial (Guia de Pauta 2.0)

- ✅ **Novas Categorias:** 7 novas categorias focadas no público-alvo:
  - Segurança de Impacto
  - Política de Baré
  - Perrengues da Cidade
  - Tecnologia
  - Cultura Pop
  - Rolê Cultural
  - Bizarrices da Bubuia
- ✅ **Análise com IA (`analisarNoticias.js`):** Usa a API da OpenAI para classificar cada notícia, avaliar sua adequação para áudio e seu sentimento.
- ✅ **Controle de Qualidade:** A IA descarta notícias com apelo visual, autopromoção ou temas desalinhados com o tom do podcast.

### Inteligência de Pauta

- ✅ **Agrupamento Semântico:** Agrupa notícias de diferentes fontes sobre o mesmo evento, criando "Super-Notícias" mais completas.
- ✅ **Seleção de Cold Open:** Lógica avançada para escolher a melhor "isca" para o início do programa, priorizando notícias bizarras, com alto potencial de gancho e sentimento leve.
- ✅ **Seleção com Diversidade:** O algoritmo seleciona as 4 notícias principais priorizando a variedade de temas, evitando pautas monotemáticas.

**Resultado:**  
Geração do arquivo `data/episodio-do-dia.json`, uma pauta final e inteligente.

---

## 🎭 FASE 3: Geração de Roteiro (O "Diretor de Cena")

**Status:** 90% CONCLUÍDO 🎭

A fase criativa, onde transformamos a pauta em um diálogo vivo e pronto para ser interpretado.

### Arquitetura do Roteiro

- ✅ **Ficha de Personagens Detalhada (`personagens.json`):** A IA recebe um perfil completo de Tainá e Iraí, incluindo histórico, gírias, como se chamam e a dinâmica entre eles.
- ✅ **Geração de Diálogos com IA (`gerarRoteiro.js`):** Para cada notícia, o script faz uma chamada à OpenAI para criar um diálogo único.
- ✅ **Busca Aprofundada:** O script busca o texto completo das notícias selecionadas, dando mais "munição" para a IA criar um roteiro rico.
- ✅ **Direção de Cena Dinâmica:** Para evitar repetição, o script sorteia um "gancho" inicial diferente para cada notícia (ex: "Comece com Tainá fazendo uma pergunta...", "Comece com Iraí sendo cético...").
- ✅ **Ênfase em "Super-Notícias":** O roteiro gerado é mais longo e aprofundado para as notícias que foram cobertas por múltiplas fontes.

### Preparação para Áudio (ElevenLabs)

- ✅ **Roteiro com SSML:** O prompt da IA já a instrui a incluir tags SSML (`<break>`, `<emphasis>`), preparando o texto para uma interpretação de voz mais natural.

---

## 🔜 Próximos Passos

- 🔄 **Fallback do Cold Open:** Implementar lógica para gerar conteúdo alternativo (ex: "Efeméride Regional") quando nenhuma notícia adequada for encontrada.
- 🔄 **Ajustes Finos de SSML:** Refinar os prompts para usar mais recursos do SSML, como `<prosody>` para controlar tom e ritmo da voz conforme a categoria da notícia.

---

## 🛠️ FASE 4: Produção e Publicação (Próximas Fronteiras)

**Status:** PLANEJADO 📝

Esta fase se concentrará em transformar o roteiro gerado em um episódio de áudio completo e publicá-lo.

### Geração de Áudio

- 🔄 **Integração com ElevenLabs:** Criar o script que lê o roteiro, envia cada fala para a API do ElevenLabs e salva os arquivos de áudio (`fala_01.mp3`, `fala_02.mp3`).

### Edição Automatizada

- 🔄 **Montagem com FFmpeg:** Criar um script que leia o roteiro em Markdown como uma "partitura", juntando as falas, trilhas sonoras e vinhetas na ordem correta para montar o `episodio_final.mp3`.

### Distribuição

- 🔄 **Geração de Feed RSS:** Automatizar a criação do feed para os agregadores de podcast.
- 🔄 **Publicação:** Implementar automação para upload do episódio final para as plataformas (Spotify, etc.).

---
