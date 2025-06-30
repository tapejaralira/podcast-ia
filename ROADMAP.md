# 🎙️ Bubuia News - Roadmap do Projeto 2.0

> _"Notícia quente de dentro da rede."_

---

## 🚀 Visão Geral

Este documento apresenta o planejamento e o status do sistema de automação do podcast **Bubuia News**.  
A arquitetura foi redesenhada para um fluxo modular e inteligente, dividido em **quatro fases principais**:

1. **Coleta de Notícias**
2. **Curadoria de Pauta**
3. **Geração de Roteiro**
4. **Produção de Áudio**

---

## 🐟 FASE 1: Coleta de Notícias (O "Pescador")

**Status:** `100% CONCLUÍDO` ✅

> Buscar o máximo de notícias relevantes das principais fontes de Manaus e do Amazonas.

### Pipeline de Coletores

- ✅ **Orquestrador** (`buscarNoticias.js`): Gerencia todos os coletores de forma centralizada.
- ✅ **Sistema de "Memória"** (`estado_coleta.json`): Registra a data da última coleta e busca apenas notícias novas, eficiente em execuções diárias e cobrindo fins de semana.
- ✅ **Múltiplas Fontes:** Coletores robustos para 4 grandes portais:
  - G1 Amazonas (via RSS)
  - A Crítica (Web Scraping)
  - D24AM (Web Scraping)
  - Portal do Holanda (Web Scraping)
- ✅ **Filtro de Relevância Inicial:** Cada coletor já faz pré-filtro por data, trazendo apenas notícias recentes.

**🗂️ Resultado:**  
Geração do arquivo `data/noticias-recentes.json`, uma base rica e atualizada para a próxima fase.

---

## 📰 FASE 2: Curadoria de Pauta (O "Editor-Chefe Digital")

**Status:** `100% CONCLUÍDO` ✅

> Fase inteligente onde a pauta do episódio é definida com base na linha editorial.

### Linha Editorial (Guia de Pauta 2.0)

- ✅ **Novas Categorias:** 7 categorias focadas no público-alvo.
- ✅ **Análise com IA** (`analisarNoticias.js`): Usa a API da OpenAI para classificar cada notícia, avaliar adequação para áudio e sentimento.
- ✅ **Controle de Qualidade:** IA descarta notícias com apelo visual, autopromoção ou desalinhadas com o tom do podcast.

### Inteligência de Pauta

- ✅ **Agrupamento Semântico:** Agrupa notícias de diferentes fontes sobre o mesmo evento, criando "Super-Notícias".
- ✅ **Seleção de Cold Open:** Lógica avançada para escolher a melhor "isca" para o início do programa, priorizando notícias bizarras ou de alto impacto.
- ✅ **Fallback do Cold Open:** Geração automática de efeméride regional como alternativa, com escolha pelo editor em `roteiro/config-roteiro.json`.
- ✅ **Seleção com Diversidade:** Algoritmo seleciona 4 notícias principais priorizando variedade de temas, evitando pautas monotemáticas.

**🗂️ Resultado:**  
Geração do arquivo `data/episodio-do-dia.json`, uma pauta final e inteligente.

---

## 🎭 FASE 3: Geração de Roteiro (O "Diretor de Cena")

**Status:** `100% CONCLUÍDO` ✅

> Transformar a pauta em um diálogo vivo e pronto para interpretação.

### Arquitetura do Roteiro

- ✅ **Ficha de Personagens Detalhada** (`personagens.json`): IA recebe perfil completo de Tainá e Iraí (histórico, gírias, dinâmica).
- ✅ **Geração de Diálogos com IA** (`gerarRoteiro.js`): Para cada notícia, script faz chamada à OpenAI para criar diálogo único.
- ✅ **Busca Aprofundada:** Script busca texto completo das notícias selecionadas, enriquecendo o roteiro.
- ✅ **Direção de Cena Dinâmica:** Sorteio de "gancho" inicial diferente para cada notícia (ex: "Comece com Tainá fazendo uma pergunta...", "Comece com Iraí sendo cético...").
- ✅ **Ênfase em "Super-Notícias":** Roteiro mais longo e aprofundado para notícias cobertas por múltiplas fontes.

### Preparação para Áudio

- ✅ **Roteiro com SSML:** Prompt da IA instrui a incluir tags SSML (`<break>`, `<emphasis>`, `<prosody>`), preparando o texto para voz natural.

---

## 🎧 FASE 4: Produção de Áudio e Publicação

**Status:** `90% CONCLUÍDO` 🎧

> Transformar o roteiro em um episódio de áudio completo.

### Geração de Áudio

- ✅ **Integração com ElevenLabs** (`producao/gerarAudio.js`): Script lê o roteiro final, envia cada fala para a API da ElevenLabs com voz e estilo corretos, salvando arquivos de áudio (`fala_01.mp3`, `fala_02.mp3`, ...).

### Edição Automatizada

- ✅ **Montagem com FFmpeg** (`mixagem/montarEpisodio.js`): Script lê o roteiro como "partitura", juntando falas, trilhas e vinhetas na ordem correta para montar o arquivo `episodio_final.mp3`.

### Distribuição

- 🔄 **Geração de Feed RSS:** Automatizar criação do feed para agregadores de podcast.
- 🔄 **Publicação:** Implementar automação para upload do episódio final nas plataformas (Spotify, etc.).

---

## 🔜 Próximos Passos (A Fronteira Final)

O foco agora é na **distribuição** do podcast:

- **Gerar Feed RSS:** Criar script que, após montagem do episódio, atualize um arquivo `rss.xml` com informações do novo episódio (título, descrição, link do `.mp3`).
- **Automatizar Publicação:** Criar script para upload do áudio e atualização do feed RSS na plataforma de hospedagem.  
  _Como alternativa, esta etapa pode ser manual._

---
