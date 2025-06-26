# 🎙️ CONFIGURAÇÃO TTS ELEVENLABS - PASSO A PASSO

## ✅ **CONFIGURAÇÃO CONCLUÍDA!**

### 🔑 **API Key Configurada:**

- **Serviço:** ElevenLabs
- **Key:** `sk_6bae55e1...` (configurada)
- **Status:** ✅ Ativa

### 🎭 **Vozes Selecionadas:**

- **Tainá (Feminina, Animada):** `UPTmB6OygMADpd4LOwE5`
- **Iray (Masculina, Reflexiva):** `UPTmB6OygMADpd4LOwE5`

---

## 🚀 **PRÓXIMOS PASSOS:**

### **1. Instalar Dependências:**

```bash
cd "c:\Meu Drive\podcast-ia"
npm install
```

### **2. Testar TTS:**

```bash
npm run teste-tts
```

### **3. Se Funcionar, Gerar Episódio Completo:**

```bash
npm run gerar-episodio --com-audio
```

---

## 🎛️ **CONFIGURAÇÕES APLICADAS:**

### **📊 Qualidade de Voz:**

- **Estabilidade:** 0.5 (natural)
- **Similaridade:** 0.8 (alta fidelidade)
- **Estilo:** 0.3 (moderado)
- **Speaker Boost:** Ativado

### **🎭 Personalidades:**

- **Tainá:** Velocidade +10%, tom animado
- **Iray:** Velocidade -5%, tom reflexivo

---

## 🧪 **TESTES INCLUÍDOS:**

### **📝 Textos de Teste:**

1. **Abertura:** "Fala, maninho! Tá começando mais um BubuiA News!"
2. **Gírias:** "Oxe, essa notícia tá quente mesmo!"
3. **Regional:** "Rapaz, esse trânsito na Constantino Nery tá pior que enchente!"

### **🎯 Verificações:**

- ✅ Conexão com API
- ✅ Geração de arquivos MP3
- ✅ Qualidade de áudio
- ✅ Diferenciação entre vozes
- ✅ Sistema de pausas

---

## 🔧 **TROUBLESHOOTING:**

### **❌ Se der erro de API:**

- Verificar conexão internet
- Verificar créditos ElevenLabs
- Verificar se API key está correta

### **❌ Se não instalar dependências:**

```bash
npm install node-fetch --save
npm install @azure/cognitiveservices-speech-sdk --save
```

### **❌ Se arquivo não for gerado:**

- Verificar pasta `/audios` existe
- Verificar permissões de escrita
- Verificar espaço em disco

---

## 📊 **INFORMAÇÕES DA CONTA:**

### **🎁 Plano Gratuito ElevenLabs:**

- **Limite:** 10.000 caracteres/mês
- **Qualidade:** Alta
- **Vozes:** Premium incluídas
- **Suficiente para:** ~20-30 episódios teste

### **💰 Estimativa de Uso:**

- **1 episódio:** ~300-500 caracteres
- **1 mês (30 episódios):** ~15.000 caracteres
- **Recomendação:** Upgrade para plano pago quando escalar

---

## 🎉 **PRÓXIMA FASE:**

Após confirmar que o TTS funciona:

1. 🎵 **Gerar episódio completo com áudio**
2. 🎧 **Testar qualidade e timing**
3. 📝 **Fazer primeira revisão manual**
4. 🤖 **Iniciar processo de aprendizado**

**"Maninho, agora o BubuiA News tem voz de verdade! Bora testar?" 🎙️**
