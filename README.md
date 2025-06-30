# 🎙️ Bubuia News - Podcast Automatizado

> **"Notícia quente de dentro da rede."**

---

## 🤖 Sobre o Projeto

O **BubuiA News** é um podcast diário totalmente automatizado, que captura e roteiriza as notícias mais relevantes de Manaus e do Amazonas. Utiliza um pipeline de scripts em Node.js e Inteligência Artificial da OpenAI para transformar o noticiário do dia em um roteiro dinâmico, pronto para ser interpretado por nossos apresentadores de IA: **Tainá Oliveira** e **Iraí Santos**.

O projeto é dividido em três fases principais:

- **Coleta**
- **Curadoria**
- **Roteirização**

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

O sistema opera em uma pipeline de 3 etapas para transformar notícias brutas em um roteiro completo.

### **Etapa 1: Coleta (O "Pescador")**

- **Script:** `noticias/buscarNoticias.js`
- **O que faz:** Orquestra múltiplos "coletores" (pequenos robôs na pasta `noticias/collectors/`). Cada coletor busca as manchetes mais recentes de um portal de notícias específico (G1 Amazonas, A Crítica, etc.).
- **Inteligência:** Possui uma "memória" (`data/estado_coleta.json`) que registra a data da última coleta. Assim, busca apenas as notícias publicadas desde a última execução, sendo eficiente mesmo após um fim de semana.
- **Resultado:** Gera o arquivo `data/noticias-recentes.json` com dezenas de notícias brutas.

---

### **Etapa 2: Curadoria (O "Editor-Chefe Digital")**

- **Script:** `noticias/analisarNoticias.js`
- **O que faz:** Este é o cérebro editorial do projeto.
- **Classificação com IA:**  
  Lê todas as notícias brutas e, para cada uma, envia o título e resumo para a API da OpenAI.  
  A IA classifica a notícia de acordo com nossa linha editorial (ex: 🚀 Tecnologia, 👽 Bizarrices da Bubuia) e verifica se ela é adequada para áudio.
- **Agrupamento Inteligente:**  
  Compara os títulos das notícias classificadas e agrupa aquelas que falam sobre o mesmo evento, criando "Super-Notícias" com informações de múltiplas fontes.
- **Seleção da Pauta:**  
  Escolhe a melhor notícia para o "Cold Open" (abertura do programa) e as 4 notícias principais mais relevantes, priorizando a diversidade de temas.
- **Resultado:** Gera o arquivo `data/episodio-do-dia.json`, a pauta final e inteligente para o episódio.

---

### **Etapa 3: Roteirização (O "Diretor de Cena")**

- **Script:** `roteiro/gerarRoteiro.js`
- **O que faz:** Transforma a pauta em um roteiro vivo.
- **Busca Aprofundada:**  
  Para cada notícia selecionada, visita os links e busca o texto completo da matéria.
- **Direção de Cena:**  
  Sorteia uma "cena" de uma lista de interações possíveis (ex: "Comece com Tainá fazendo uma pergunta...", "Comece com Iraí sendo cético...") para garantir variedade.
- **Geração de Diálogo com IA:**  
  Envia para a OpenAI o texto completo, os perfis detalhados dos personagens e a direção da cena, pedindo para criar um diálogo natural, com gírias, pausas e a personalidade de cada um.
- **Preparação para Áudio:**  
  O prompt instrui a IA a incluir tags SSML (`<break>`, `<emphasis>`) no diálogo, preparando o texto para ser interpretado com mais emoção pela API do ElevenLabs.
- **Resultado:** Gera o arquivo de roteiro final do dia em Markdown na pasta `episodios/`.

---

## 🛠️ Como Usar

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

### 2. Configuração do Ambiente

Renomeie o arquivo `.env.example` para `.env`.

Abra o arquivo `.env` e insira sua chave da API da OpenAI:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Executando a Pipeline

Você pode executar cada etapa individualmente ou usar os comandos "mestres".

- **Coletar notícias:**
  ```bash
  npm run coletar
  ```
- **Analisar a pauta:**
  ```bash
  npm run analisar
  ```
- **Gerar o roteiro:**
  ```bash
  npm run roteirizar
  ```

#### **Comandos Mestres**

- **Para gerar a pauta completa (coleta + análise):**
  ```bash
  npm run pauta-completa
  ```
- **Para gerar o episódio completo do início ao fim:**
  ```bash
  npm run episodio-completo
  ```

---

## 📁 Estrutura do Projeto

```
/podcast-ia/
│
├── 📁 data/
│   ├── episodio-do-dia.json
│   ├── estado_coleta.json
│   ├── noticias-recentes.json
│   └── personagens.json
│
├── 📁 episodios/
│   └── (Roteiros finais em .md são salvos aqui)
│
├── 📁 noticias/
│   ├── analisarNoticias.js
│   ├── buscarNoticias.js
│   └── 📁 collectors/
│       ├── acritica.js
│       ├── d24am.js
│       ├── g1amazonas.js
│       └── portaldoholanda.js
│
└── 📁 roteiro/
    ├── gerarRoteiro.js
    └── roteiro-template.md
```

---

## 📄 Licença

MIT License
