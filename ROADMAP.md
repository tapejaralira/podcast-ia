# 🎙️ Bubuia News - Roadmap do Projeto 2.0

> _"Notícia quente de dentro da rede."_

---

## 🚀 Visão Geral

Este documento descreve o planejamento e o status atual do sistema de automação do podcast **Bubuia News**. O projeto atingiu a maturidade, com um fluxo de trabalho totalmente funcional, desde a coleta de notícias até a geração do episódio de áudio final.

A arquitetura está dividida em **quatro fases principais**, todas agora concluídas:

1. **Coleta de Notícias**
2. **Curadoria de Pauta**
3. **Geração de Roteiro**
4. **Produção de Áudio**

---

## 🐟 FASE 1: Coleta de Notícias (O "Pescador")

**Status:** `100% CONCLUÍDO ✅`

O objetivo desta fase é buscar o máximo de notícias relevantes das principais fontes de Manaus e do Amazonas.

**Pipeline de Coletores:**

- ✅ **Orquestrador** (`buscarNoticias.js`): Gerencia todos os coletores de forma centralizada.
- ✅ **Sistema de "Memória"** (`estado_coleta.json`): Registra a data da última coleta e busca apenas notícias novas desde então.
- ✅ **Múltiplas Fontes:** Coletores robustos e individuais para 4 grandes portais (_G1 Amazonas, A Crítica, D24AM, Portal do Holanda_).
- ✅ **Filtro de Relevância Inicial:** Cada coletor já faz um pré-filtro por data, trazendo apenas notícias recentes.

**Resultado:**  
Geração do arquivo `data/noticias-recentes.json`, uma base de dados rica e atualizada.

---

## 📰 FASE 2: Curadoria de Pauta (O "Editor-Chefe Digital")

**Status:** `100% CONCLUÍDO ✅`

Esta é a fase inteligente do sistema, onde a pauta do episódio é definida com base em nossa linha editorial.

**Inteligência de Pauta:**

- ✅ **Classificação com IA** (`analisarNoticias.js`): Usa a API da OpenAI para classificar, filtrar e agrupar notícias de acordo com 7 categorias editoriais.
- ✅ **Agrupamento Semântico:** Agrupa notícias de diferentes fontes sobre o mesmo evento, criando "Super-Notícias".
- ✅ **Seleção de Cold Open:** Lógica avançada para escolher a melhor "isca" para o início do programa, com fallback para efemérides regionais.
- ✅ **Seleção com Diversidade:** O algoritmo seleciona as 4 notícias principais priorizando a variedade de temas.

**Resultado:**  
Geração do arquivo `data/episodio-do-dia.json`, uma pauta final e inteligente.

---

## 🎭 FASE 3: Geração de Roteiro (O "Diretor de Cena")

**Status:** `100% CONCLUÍDO ✅`

A fase criativa, onde transformamos a pauta em um diálogo vivo e pronto para ser interpretado.

**Arquitetura do Roteiro:**

- ✅ **Ficha de Personagens Detalhada** (`personagens.json`): A IA recebe um perfil completo de Tainá e Iraí para guiar a criação dos diálogos.
- ✅ **Geração de Diálogos com IA** (`gerarRoteiro.js`): Para cada notícia, o script cria um diálogo único e natural.
- ✅ **Busca Aprofundada:** O script busca o texto completo das notícias para enriquecer o roteiro.
- ✅ **Direção de Cena Dinâmica:** O sistema sorteia um "gancho" inicial diferente para cada notícia, evitando repetição.
- ✅ **Roteiro com SSML:** O prompt da IA já inclui tags SSML (`<break>`, `<emphasis>`), preparando o texto para uma interpretação de voz mais natural.

---

## 🎧 FASE 4: Produção de Áudio

**Status:** `100% CONCLUÍDO ✅`

Esta fase transforma o roteiro gerado em um episódio de áudio completo, mixado e pronto para ouvir.

**Geração e Montagem:**

- ✅ **Geração de Voz com IA** (`producao/gerarAudio.js`): Script lê o roteiro final, envia cada fala individualmente para a API da ElevenLabs e salva os arquivos de áudio.
- ✅ **Edição e Mixagem Automatizada** (`mixagem/montarEpisodio.js`): O script lê o roteiro como uma "partitura", juntando as falas, trilhas sonoras e vinhetas na ordem correta.
- ✅ **Efeitos de Estúdio:** Aplica automaticamente efeitos de compressão e reverb nas vozes para uma qualidade de áudio profissional.
- ✅ **Configuração Robusta:** O script aponta diretamente para uma instalação completa do FFmpeg, garantindo que todos os filtros funcionem de forma consistente.

**Resultado:**  
Geração de um arquivo `bubuia_news_AAAA-MM-DD.mp3` na pasta `episodios_finais`, pronto para ser distribuído.

---

## 📡 Próximos Passos (A Fronteira Final: Distribuição)

Com a pipeline de produção completa, o foco agora é levar o Bubuia News aos ouvintes.

- 🔄 **Geração de Feed RSS:**  
  Criar um script que, após a montagem do episódio, gere ou atualize um arquivo `rss.xml` com as informações do novo episódio (título, descrição, link para o arquivo `.mp3`, etc.). Isso é essencial para a distribuição em agregadores de podcast.

- 🔄 **Automatizar Publicação:**  
  Para uma automação completa, o próximo passo seria criar um script que faça o upload do áudio final e do feed RSS para uma plataforma de hospedagem de podcasts (_como Anchor/Spotify for Podcasters, Transistor.fm, etc._), utilizando a API da plataforma, se disponível.

- 🔄 **Monitoramento e Manutenção:**  
  Criar rotinas para monitorar a execução dos scripts e lidar com possíveis falhas (_ex: APIs fora do ar, mudanças na estrutura dos sites de notícias_).

---
