# 🎙️ Bubuia News: Sua Central de Notícias Automatizada! 🤖

Bem-vindo ao **Bubuia News**, o projeto que transforma o caos da informação em um podcast diário, informativo e (às vezes) hilário! Cansado de rolar infinitamente por feeds de notícias? O Bubuia News faz o trabalho pesado para você: ele busca, analisa, roteiriza, narra e produz um episódio de podcast completo, tudo com o poder da IA.

![Bubuia News Thumbnail](img/thumbnail02.png)

## ✨ O que fazemos?

Nosso pipeline automatizado é o coração do projeto. Ele executa uma série de tarefas para entregar seu podcast fresquinho todos os dias:

1.  **Busca de Notícias**: Vasculhamos a web em busca das notícias mais quentes e relevantes.
2.  **Análise com IA**: Usamos modelos de linguagem para entender, classificar e resumir cada notícia.
3.  **Geração de Roteiro**: Criamos um roteiro dinâmico e coeso, com direito a aberturas criativas, blocos de notícias e encerramento.
4.  **Produção de Áudio (TTS)**: Damos voz ao roteiro com narrações geradas por IA, usando as vozes dos nossos personas.
5.  **Mixagem Profissional**: Juntamos tudo — narrações, trilhas sonoras e vinhetas — para criar um episódio com qualidade de estúdio.

## 🚀 Começando

Para colocar o Bubuia News para funcionar, você só precisa de alguns passos:

### Pré-requisitos

- Node.js (v18 ou superior)
- FFmpeg (instalado e acessível no PATH do sistema)
- Credenciais de API (para os serviços de IA que você usar)

### Instalação

1.  Clone este repositório:

    ```bash
    git clone https://github.com/seu-usuario/bubuia-news.git
    cd bubuia-news
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Configure suas chaves de API e outros parâmetros no arquivo `src/config.ts`.

### Executando o Pipeline

Para rodar o pipeline completo e gerar um novo episódio, execute:

```bash
npm start
```

O episódio final será salvo na pasta `episodios_finais`.

## 🛠️ Scripts Disponíveis

Você também pode executar cada etapa do pipeline individualmente:

- `npm run buscar`: Busca as notícias mais recentes.
- `npm run analisar`: Analisa as notícias baixadas.
- `npm run roteiro`: Gera o roteiro do dia.
- `npm run audio`: Gera os áudios para o roteiro.
- `npm run montar`: Monta o episódio final.
- `npm run lint`: Verifica a qualidade do código.
- `npm run format`: Formata o código usando Prettier.

## 📂 Estrutura do Projeto

```
podcast-ia/
├── src/                # Todo o código-fonte em TypeScript
│   ├── noticias/       # Módulos de busca e análise de notícias
│   ├── roteiro/        # Módulos de geração de roteiro
│   ├── producao/       # Módulo de geração de áudio (TTS)
│   ├── mixagem/        # Módulo de montagem do episódio
│   ├── config.ts       # Configurações centrais do projeto
│   ├── types.ts        # Tipos e interfaces
│   └── index.ts        # Orquestrador principal do pipeline
├── data/               # Dados gerados (notícias, pautas, roteiros)
├── audios/             # Arquivos de áudio base (trilhas, vinhetas)
├── audios_gerados/     # Áudios de narração gerados pela IA
├── episodios_finais/   # Onde a mágica acontece: seus podcasts!
├── package.json        # Dependências e scripts
└── tsconfig.json       # Configurações do TypeScript
```

## 🤝 Contribuindo

O Bubuia News é um projeto em constante evolução! Sinta-se à vontade para abrir _issues_ com sugestões, reportar bugs ou enviar _pull requests_ com melhorias.

---

Feito com ❤️, ☕ e muito código por [Tapejara Lira](https://github.com/tapejaralira).
