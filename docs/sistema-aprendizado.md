# 🎓 SISTEMA DE APRENDIZADO EVOLUTIVO - BUBUIA NEWS

## 🎯 **OBJETIVO DO SISTEMA**

Criar um **sistema de IA que aprende com suas correções** e evolui até funcionar autonomamente, reduzindo gradualmente a necessidade de revisão manual.

---

## 🔄 **FLUXO COMPLETO DO SISTEMA**

### **FASE 1: GERAÇÃO COM REVISÃO (Nível 0-5)**

```
1. Sistema gera roteiro
2. Cria arquivo original + template para correção
3. Você edita e marca correções
4. Sistema processa e aprende padrões
5. Nível de autonomia aumenta gradualmente
```

### **FASE 2: SEMI-AUTONOMIA (Nível 6-7)**

```
1. Sistema gera roteiros com mais qualidade
2. Revisões ocasionais ainda necessárias
3. Correções mais pontuais e específicas
4. Aprendizado refinado de detalhes
```

### **FASE 3: AUTONOMIA TOTAL (Nível 8-10)**

```
1. Sistema gera episódios finais diretamente
2. Revisões esporádicas ou desnecessárias
3. Qualidade consistente e profissional
4. Funcionamento independente
```

---

## 📝 **COMO FAZER CORREÇÕES**

### **1. Gerar Episódio para Revisão:**

```bash
npm run gerar-episodio
```

### **2. Arquivos Gerados:**

- **`*_original.md`** - Versão original do sistema
- **`*_corrigido.md`** - Para suas edições (**ESTE você edita**)
- **`*_analise.json`** - Análise automática do sistema

### **3. Como Marcar Correções:**

#### **✅ FORMATO CORRETO:**

```markdown
Texto original: "Vichi, tá chovendo!"
Texto corrigido: "Oxe, tá um aguaceiro danado!" <!-- CORRIGIDO: girias - Tainá usa mais "oxe" que "vichi" -->
```

#### **📚 CATEGORIAS DISPONÍVEIS:**

- **`girias`** - Correções em gírias e expressões regionais
- **`tom`** - Ajustes no tom de voz/emoção do TTS
- **`referencias_locais`** - Correções em referências de Manaus/Amazonas
- **`transicoes`** - Melhorias nas transições entre blocos
- **`interacoes`** - Ajustes nos diálogos entre personagens
- **`estrutura`** - Mudanças na estrutura do roteiro
- **`noticias`** - Ajustes no conteúdo das notícias
- **`outros`** - Outras correções

### **4. Processar Correções:**

```bash
npm run processar-correcao episodio_2024-12-19T10-30-00
```

---

## 🧠 **COMO O SISTEMA APRENDE**

### **📊 ANÁLISE DE PADRÕES:**

- **Conta correções** por categoria
- **Identifica frequência** de problemas
- **Extrai regras** de suas correções
- **Ajusta algoritmos** automaticamente

### **📈 EVOLUÇÃO DA AUTONOMIA:**

```javascript
// Lógica de aprendizado
if (correções <= 1) {
  autonomia += 0.5; // Melhora significativa
} else if (correções <= 3) {
  autonomia += 0.2; // Melhora gradual
} else if (correções > 5) {
  autonomia -= 0.3; // Regressão, precisa mais aprendizado
}
```

### **🎯 PESOS POR CATEGORIA:**

- **Referencias locais:** 1.5 (prioridade alta)
- **Tom:** 1.2 (importante para naturalidade)
- **Gírias:** 1.0 (base)
- **Estrutura:** 1.3 (fundamental)
- **Outros:** 0.5 (menos crítico)

---

## 📊 **MONITORAMENTO E ESTATÍSTICAS**

### **Ver Progresso Atual:**

```bash
npm run estatisticas
```

### **Exemplo de Saída:**

```
📊 === ESTATÍSTICAS DO BUBUIA NEWS ===

🎙️ INFORMAÇÕES GERAIS:
📺 Episódios processados: 8
🤖 Nível de autonomia: 6.5/10
🔧 Total de correções: 23
📝 Status: MODO REVISÃO

⚠️ ÁREAS QUE PRECISAM ATENÇÃO:
1. girias: 8 correções
2. referencias_locais: 6 correções
3. tom: 4 correções

📈 EVOLUÇÃO RECENTE:
  Ep.6 (18/12/2024): 4 correções, qualidade 7/10
  Ep.7 (19/12/2024): 2 correções, qualidade 8/10
  Ep.8 (19/12/2024): 1 correção, qualidade 9/10

🔮 PREVISÕES:
  🚀 Quase autônomo, poucas correções necessárias
  ⏱️ Estimativa: 2-4 episódios para autonomia total
```

---

## 🎛️ **CONFIGURAÇÕES AVANÇADAS**

### **Ajustar Sensibilidade:**

Edite `config/revisao-config.json`:

```json
{
  "nivel_autonomia": 0,
  "limiar_autonomia": 8,
  "peso_correcoes": {
    "girias": 1.0,
    "referencias_locais": 1.5,
    "tom": 1.2
  }
}
```

### **Personalizar Aprendizado:**

- **`limiar_autonomia`** - Quando vira autônomo (padrão: 8)
- **`peso_correcoes`** - Importância de cada categoria
- **`incremento_melhoria`** - Velocidade de evolução

---

## 🚀 **COMANDOS PRINCIPAIS**

### **📝 Workflow Completo:**

```bash
# 1. Gerar episódio
npm run gerar-episodio

# 2. Editar arquivo *_corrigido.md
# (Usar seu editor preferido)

# 3. Processar correções
npm run processar-correcao [nome-episodio]

# 4. Ver evolução
npm run estatisticas

# 5. Repetir até autonomia total
```

### **🤖 Quando Autônomo:**

```bash
# Gerar episódios diretamente
npm run gerar-episodio

# Monitorar qualidade ocasionalmente
npm run estatisticas
```

---

## 🎯 **METAS E EXPECTATIVAS**

### **🌱 NÍVEIS 0-3: Aprendizado Inicial**

- **15-20 correções** por episódio
- **Foco:** Estrutura básica e gírias
- **Tempo:** 10-15 episódios

### **📚 NÍVEIS 4-6: Refinamento**

- **5-10 correções** por episódio
- **Foco:** Tom e referências locais
- **Tempo:** 5-8 episódios

### **🚀 NÍVEIS 7-8: Quase Autônomo**

- **1-3 correções** por episódio
- **Foco:** Detalhes finos
- **Tempo:** 2-4 episódios

### **🤖 NÍVEIS 9-10: Autonomia Total**

- **0-1 correção** esporádica
- **Foco:** Monitoramento de qualidade
- **Tempo:** Funcionamento indefinido

---

## 💡 **DICAS PARA ACELERAR O APRENDIZADO**

### **✅ MELHORES PRÁTICAS:**

1. **Seja específico** nas explicações das correções
2. **Use categorias corretas** para facilitar aprendizado
3. **Mantenha consistência** nas suas preferências
4. **Processe correções imediatamente** após editar

### **⚠️ EVITAR:**

1. **Correções contraditórias** entre episódios
2. **Mudanças de estilo** drásticas
3. **Explicações vagas** nas correções
4. **Pular processamento** de correções

### **🎯 FOCO NAS PRIORIDADES:**

1. **Referencias locais** (peso 1.5)
2. **Estrutura** (peso 1.3)
3. **Tom** (peso 1.2)
4. **Gírias** (peso 1.0)

---

**🎉 Resultado: Um sistema que aprende com você e evolui até funcionar sozinho, mantendo sempre a qualidade e autenticidade do BubuiA News!**
