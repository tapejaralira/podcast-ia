# Interface Web - Curadoria de Notícias

## 🎯 Visão Geral

Interface web moderna e intuitiva para seleção manual de notícias do **Podcast Bubuia News**. Desenvolvida em Next.js + TypeScript, oferece uma experiência visual rica para curadoria editorial.

## ✨ Funcionalidades

### 📰 Visualização Rica de Notícias

- **Cards visuais** com todas as informações relevantes
- **Scores detalhados** de análise (relevância, impacto, urgência, etc.)
- **Contexto amazônico** destacado
- **Tags automáticas** e categorização
- **Preview expandido** com modal de detalhes

### 🎯 Seleção Intuitiva

- **Seleção por mouse** - clique para selecionar/deselecionar
- **Seleção de manchete** destacada visualmente
- **Contador em tempo real** de notícias selecionadas
- **Estimativa de duração** do episódio

### 🔍 Filtros e Busca

- **Busca textual** por título, resumo ou fonte
- **Filtro por score mínimo** (slider interativo)
- **Ordenação** por score, relevância ou categoria
- **Navegação por abas** de categorias

### 📊 Estatísticas em Tempo Real

- **Resumo da seleção** atual
- **Duração estimada** do episódio
- **Distribuição por categorias**
- **Campo de observações** editoriais

### 🤖 Sugestões Inteligentes

- **Manchete recomendada** pela IA
- **Justificativa** da sugestão
- **Nível de confiança** da recomendação

## 🚀 Como Usar

### 1. Iniciar a Interface

cd "c:\Meu Drive\podcast-ia\web-interface" ; npm run dev  

Acesse: http://localhost:3000

### 2. Processo de Curadoria

#### **Passo 1: Análise Geral**

- Revise as **estatísticas** do dia (total de notícias, distribuição)
- Observe a **sugestão de manchete** da IA
- Navegue pelas **abas de categorias**

#### **Passo 2: Seleção de Manchete**

- Clique na notícia sugerida ou escolha outra
- A manchete selecionada fica **destacada em amarelo**

#### **Passo 3: Seleção de Notícias**

- **Clique nos cards** para selecionar notícias
- Use **"Ver detalhes"** para análise aprofundada
- Monitore a **duração estimada** no painel lateral

#### **Passo 4: Filtros e Refinamento**

- Use a **busca** para encontrar temas específicos
- Ajuste o **score mínimo** para filtrar qualidade
- **Ordene** conforme necessidade editorial

#### **Passo 5: Finalização**

- Adicione **observações** no campo de notas
- Clique **"Salvar Seleção"** para persistir

### 3. Navegação Avançada

#### **Modal de Detalhes** (Clique em "Ver detalhes")

- **Resumo completo** da notícia
- **Análise editorial** detalhada
- **Scores por dimensão** (regional, local, urgência, etc.)
- **Contexto amazônico** expandido
- **Link para fonte** original
- **Seleção direta** do modal

#### **Filtros Inteligentes**

- **Score mínimo**: Filtra apenas notícias de alta qualidade
- **Busca**: Pesquisa em títulos, resumos e fontes
- **Ordenação**: Prioriza por diferentes critérios

## 🛠️ Arquitetura Técnica

### Frontend (Next.js)

```
app/
├── page.tsx              # Página principal
├── api/
│   ├── noticias/         # API para carregar notícias
│   └── selecao/          # API para salvar/carregar seleção
components/
├── NoticiaCard.tsx       # Card visual de notícia
└── DetalhesModal.tsx     # Modal de detalhes expandidos
lib/
├── types.ts              # Tipos TypeScript
└── api.ts                # Serviços de API
```

### Backend Integration

- **Leitura automática** de `data/noticias-categorizadas.json`
- **Compatibilidade** com formato antigo (conversão automática)
- **Persistência** em `data/selecao-manual.json`

### Tipos de Dados

```typescript
interface NoticiaCompleta {
  id: string;
  titulo: string;
  resumo: string;
  categoria: string;
  fonte: string;
  scoreTotal: number;
  scoreDetalhado: {
    relevanciaRegional: number;
    impactoLocal: number;
    urgencia: number;
    unicidade: number;
    engajamento: number;
  };
  contextoAmazonico: string;
  // ... outros campos
}
```

## 🔗 Integração com Pipeline

### Entrada

- **Lê**: `data/noticias-categorizadas.json` (formato novo)
- **Fallback**: Arquivos de pauta antigas (conversão automática)

### Saída

- **Grava**: `data/selecao-manual.json`
- **Formato**: Compatível com pipeline de produção
- **Estrutura**:
  ```json
  {
    "data": "2025-07-18",
    "manchete": { "id": "...", "titulo": "...", "categoria": "..." },
    "noticiasEscolhidas": [
      { "categoria": "politica", "ids": ["..."], "total": 2 }
    ],
    "estatisticas": {
      "totalNoticias": 8,
      "duracaoEstimada": 240,
      "categorias": 4
    },
    "observacoes": "Notas do editor..."
  }
  ```

---

**Última atualização**: Julho 2025
