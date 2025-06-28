# 🎙️ BUBUIA NEWS - ROADMAP COMPLETO

_"Notícia quente direto do igarapé."_

## ✅ FASE 1 — Preparação e organização

**Status: 100% IMPLEMENTADO**

- ✅ Estrutura de pastas criada (/data, /templates, /audios, /config, /scripts, /revisao, /docs)
- ✅ personagens.json com perfis do Iray e da Tainá
- ✅ eventos.json com sistema dinâmico de eventos
- ✅ girias.json com bordões e expressões por personagem
- ✅ roteiro-template.md com placeholders e estrutura diária completa
- ✅ Scripts Node.js: gerarRoteiro.js, gerenciadorEventos.js, integracaoIA.js, scripts/processarCorrecoes.js, scripts/verificarImportacoes.js
- 🔄 **NOVA FUNCIONALIDADE:** Sistema automático de detecção de eventos
- 🔄 **NOVA FUNCIONALIDADE:** Script para adicionar eventos manuais

## 🔊 FASE 2 — Voz e narração

**Status: ESTRUTURA PRONTA**

- ✅ Sistema de integração configurado para ElevenLabs
- ✅ Configuração personalizada por personagem (Tainá/Iraí)
- ✅ Preparação de texto com gírias e pausas naturais
- ✅ SSML para entonações e regionalismo
- 🔄 **PRÓXIMO:** Criar contas e configurar APIs reais
- 🔄 **NOVA SUGESTÃO:** Sistema de templates de voz por emoção

> **Atenção:** Atualmente, apenas ElevenLabs está ativo como serviço de TTS. Integrações com Azure e Google foram removidas.

## 🧠 FASE 3 — Geração do conteúdo (roteiro)

**Status: BASE IMPLEMENTADA**

- ✅ Sistema de detecção automática de eventos em notícias
- ✅ Template dinâmico com 30+ placeholders
- ✅ Lógica de personalidade por apresentador
- ✅ Comentários de ouvintes automáticos
- 🔄 **PRÓXIMO:** Integrar APIs de notícias reais
- 🔄 **NOVA SUGESTÃO:** Sistema de humor contextual (clima, feriados)

## 🎙️ FASE 4 — Montagem do episódio

**Status: ARQUITETURA PRONTA**

- ✅ Sistema de processamento de roteiro para áudios
- ✅ Separação automática de falas por personagem
- ✅ Configurações de qualidade e formato
- 🔄 **PRÓXIMO:** Implementar FFmpeg para junção de áudios
- 🔄 **NOVA SUGESTÃO:** Sistema de vinhetas dinâmicas por tema

## 📤 FASE 5 — Publicação e distribuição

**Status: PLANEJAMENTO**

- 🔄 **SUGESTÃO:** GitHub Actions para automação diária
- 🔄 **SUGESTÃO:** RSS feed automático
- 🔄 **SUGESTÃO:** Upload para Spotify/Apple Podcasts
- 🔄 **NOVA FUNCIONALIDADE:** Sistema de metadados automático

## 📲 FASE 6 — Interação com redes sociais e ouvintes

**Status: BASE CRIADA**

- ✅ Sistema de comentários de ouvintes no JSON
- ✅ Integração automática nos roteiros
- 🔄 **PRÓXIMO:** API para receber comentários reais
- 🔄 **NOVA SUGESTÃO:** Bot do WhatsApp para receber mensagens

## 🛠️ FASE 7 — Ajustes e melhorias contínuas

**Status: SISTEMAS PRONTOS**

- ✅ Configurações flexíveis por arquivo JSON
- ✅ Sistema de logs e debugging
- ✅ Fallbacks para quando faltam dados
- 🔄 **NOVA SUGESTÃO:** Dashboard web para monitoramento

---

## 🚀 NOVAS FUNCIONALIDADES IMPLEMENTADAS

### 🎯 **Sistema de Eventos Inteligente**

- **Detecção automática** de eventos em notícias
- **Extração de datas** em múltiplos formatos
- **Categorização automática** por tipo de evento
- **Relevância calculada** por critérios regionais
- **Limpeza automática** de eventos passados

### 🤖 **IA e TTS Avançado**

- **TTS exclusivo:** ElevenLabs
- **Preparação inteligente** de texto para naturalidade
- **Configurações por personalidade** de cada apresentador
- **SSML personalizado** com pausas e entonações

### 📋 **Sistema de Roteiros Dinâmicos**

- **30+ placeholders** específicos
- **Diálogos naturais** gerados automaticamente
- **Variações aleatórias** para não repetir conteúdo
- **Contextualização regional** automática

---

## 💡 SUGESTÕES EXTRAS PARA NATURALIDADE

### 🎭 **Personalidades Ainda Mais Humanas**

```javascript
// Exemplos de novos campos para personagens.json:
{
  "humor_do_dia": ["animado", "reflexivo", "empolgado"],
  "react_to_weather": {
    "chuva": "oxe, tá caindo o mundo aqui!",
    "sol": "que calor absurdo, meu pai!"
  },
  "referencias_locais": [
    "ponte Rio Negro", "mercado municipal",
    "teatro amazonas", "ponta negra"
  ]
}
```

### 📱 **Interação em Tempo Real**

- **WhatsApp Bot** para receber áudios dos ouvintes
- **Sistema de enquetes** diárias
- **Comentários por voz** integrados ao roteiro

### 🎵 **Trilha Sonora Inteligente**

- **Música de fundo** que muda por assunto
- **Vinhetas personalizadas** por categoria de notícia
- **Efeitos sonoros** regionais (chuva da floresta, rio, etc.)

### 📊 **Analytics e Melhoria Contínua**

- **Dashboard** mostrando engajamento por tema
- **A/B testing** de estilos de apresentação
- **Feedback automático** da comunidade

---

## 🛠️ COMO USAR O SISTEMA ATUAL

### **1. Gerar Roteiro Simples:**

```bash
cd "c:\Meu Drive\podcast-ia"
node gerarRoteiro.js
```

### **2. Adicionar Evento Manual:**

```bash
node adicionarEvento.js "Festival de Inverno" "Grande festival com artistas locais" "2025-07-20" "entretenimento"
```

### **3. Processamento Completo com Eventos:**

```bash
# O script já detecta eventos automaticamente
node gerarRoteiro.js
```

### **4. Configurar APIs (quando estiver pronto):**

```bash
# Edite: config/ia-config.json
# Adicione suas chaves de API
```

**🎉 O sistema está 70% pronto e super escalável para evoluir!**
