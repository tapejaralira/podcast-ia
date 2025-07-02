# 🎙️ Bubuia News - Podcast 100% Automatizado

> **"Notícia quente de dentro da rede."**

---

## 🤖 Sobre o Projeto

O **BubuiA News** é um podcast diário totalmente automatizado, que captura, roteiriza, narra e produz as notícias mais relevantes de Manaus e do Amazonas. Utiliza um pipeline de scripts em Node.js, Inteligência Artificial da OpenAI e ElevenLabs para transformar o noticiário do dia em um episódio de áudio completo e pronto para ser distribuído.

O projeto é dividido em quatro fases principais:

- **Coleta**
- **Curadoria**
- **Roteirização**
- **Produção de Áudio**

Cada uma com seus próprios módulos inteligentes.

---

## 🗣️ Os Apresentadores (IA)

As personalidades são o coração do Bubuia News. O roteiro é gerado com base em perfis detalhados para garantir diálogos autênticos e carismáticos.

- **👩‍🎤 Tainá Oliveira:**  
  Jovem produtora cultural de Parintins (24 anos), torcedora do Garantido, agora vive em Manaus. É energética, conectada e apaixonada pela cultura amazônica. O coração pulsante do programa.

- **👨‍🎤 Iraí Santos:**  
  Jornalista manauara de 28 anos, analítico e observador. Morou 3 anos no Sul para estudar, o que lhe deu uma perspectiva cultural mais ampla. É a voz da razão e do ceticismo bem-humorado do podcast.

---

## 🚀 Como Funciona: O Fluxo Automatizado

O sistema opera em uma pipeline de 4 etapas para transformar notícias brutas em um episódio de áudio completo.

### **Etapa 1: Coleta (O "Pescador")**

- **Script:** `noticias/buscarNoticias.js`
- **O que faz:** Orquestra múltiplos "coletores" (pequenos robôs na pasta `noticias/collectors/`). Cada coletor busca as manchetes mais recentes de um portal de notícias específico (G1 Amazonas, A Crítica, etc.).
- **Inteligência:** Possui uma "memória" (`data/estado_coleta.json`) que registra a data da última coleta. Assim, busca apenas as notícias publicadas desde a última execução.
- **Resultado:** Gera o arquivo `data/noticias-recentes.json` com dezenas de notícias brutas.

---

### **Etapa 2: Curadoria (O "Editor-Chefe Digital")**

- **Script:** `noticias/analisarNoticias.js`
- **O que faz:** Este é o cérebro editorial do projeto.
- **Classificação com IA:**  
  Lê todas as notícias brutas e, para cada uma, envia o título e resumo para a API da OpenAI. A IA classifica a notícia de acordo com nossa linha editorial (ex: 🚀 Tecnologia, 👽 Bizarrices da Bubuia).
- **Agrupamento Inteligente:**  
  Compara os títulos das notícias classificadas e agrupa aquelas que falam sobre o mesmo evento, criando "Super-Notícias".
- **Seleção da Pauta:**  
  Escolhe a melhor notícia para o "Cold Open" (abertura do programa) e as 4 notícias principais mais relevantes.
- **Resultado:** Gera o arquivo `data/episodio-do-dia.json`, a pauta final e inteligente para o episódio.

---

### **Etapa 3: Roteirização (O "Diretor de Cena")**

- **Script:** `roteiro/gerarRoteiro.js`
- **O que faz:** Transforma a pauta em um roteiro vivo.
- **Busca Aprofundada:**  
  Para cada notícia selecionada, visita os links e busca o texto completo da matéria.
- **Geração de Diálogo com IA:**  
  Envia para a OpenAI o texto completo, os perfis detalhados dos personagens e uma direção de cena, pedindo para criar um diálogo natural, com gírias, pausas e a personalidade de cada um.
- **Preparação para Áudio:**  
  O prompt instrui a IA a incluir tags SSML (`<break>`, `<emphasis>`) no diálogo, preparando o texto para ser interpretado com mais emoção pela API de Text-to-Speech.
- **Resultado:** Gera o arquivo de roteiro final do dia em Markdown na pasta `episodios/`.

---

### **Etapa 4: Produção de Áudio (O "Engenheiro de Som")**

- **Scripts:** `producao/gerarAudio.js` e `mixagem/montarEpisodio.js`
- **O que faz:** Converte o roteiro de texto em um episódio de áudio finalizado.
- **Geração de Voz com IA:**  
  O script `gerarAudio.js` lê o roteiro final, envia cada fala individualmente para a API da ElevenLabs e salva os arquivos de áudio na pasta `audios_gerados/`.
- **Mixagem Automatizada:**  
  O script `montarEpisodio.js` atua como um engenheiro de som. Ele lê o roteiro como uma "partitura", juntando as falas, trilhas sonoras, vinhetas e efeitos na ordem correta, usando `fluent-ffmpeg`.
- **Qualidade de Estúdio:**  
  Aplica automaticamente efeitos de compressão e normalização de áudio para garantir uma qualidade profissional e consistente.
- **Resultado:** Gera um arquivo `bubuia_news_AAAA-MM-DD.mp3` na pasta `episodios_finais/`, pronto para ser distribuído.

---

## 🛠️ Como Usar

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

### 2. Configuração do Ambiente

Renomeie o arquivo `.env.example` para `.env`.

Abra o arquivo `.env` e insira suas chaves de API:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Executando a Pipeline

Você pode executar cada etapa individualmente ou usar os comandos "mestres".

- **Coletar notícias:**
  ```bash
  npm run coletar
  ```
- **Analisar e criar a pauta:**
  ```bash
  npm run analisar
  ```
- **Gerar o roteiro em texto:**
  ```bash
  npm run roteirizar
  ```
- **Gerar os arquivos de áudio:**
  ```bash
  npm run audios
  ```
- **Montar o episódio final:**
  ```bash
  npm run montar
  ```

#### **Comandos Mestres**

- **Gerar a pauta completa (coleta + análise):**
  ```bash
  npm run pauta-completa
  ```
- **Gerar o roteiro a partir da pauta (coleta + análise + roteiro):**
  ```bash
  npm run episodio-completo
  ```
- **Produzir o áudio a partir do roteiro (geração de áudio + montagem):**
  ```bash
  npm run produzir
  ```

---

## 📁 Estrutura do Projeto

```
/podcast-ia/
│
├── 📁 audios/               # Vinhetas, trilhas e locuções base
├── 📁 audios_gerados/       # Áudios de falas gerados pela IA
├── 📁 data/                 # JSONs de estado e pautas
├── 📁 episodios/            # Roteiros finais em .md
├── 📁 episodios_finais/     # Arquivos .mp3 dos episódios prontos
├── 📁 mixagem/              # Script de montagem do áudio
├── 📁 noticias/             # Scripts de coleta e análise
├── 📁 producao/             # Script de geração de voz
└── 📁 roteiro/              # Scripts de geração de roteiro
```

---

## 📄 Licença

MIT License
