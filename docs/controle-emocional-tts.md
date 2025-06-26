# 🎭 SISTEMA DE CONTROLE EMOCIONAL TTS - BUBUIA NEWS

## 🎯 Como Funciona o Sistema Inteligente de Tom

O BubuiA News agora possui um sistema avançado que **automaticamente detecta o tipo de notícia e ajusta o tom de voz** dos apresentadores. Aqui está como funciona:

---

## 🎪 TIPOS DE TOM AUTOMÁTICO

### 🎉 **ABERTURA - SEMPRE ALEGRE**

**Detecção:** Quando texto contém "começando mais um BubuiA News" ou é primeira fala
**Configuração TTS:**

```xml
<amazon:emotion name="excited" intensity="high">
<prosody rate="1.1" pitch="medium">
Fala maninho, tá começando mais um BubuiA News!
</prosody>
</amazon:emotion>
```

**Resultado:** Voz animada, energética, contagiante

---

### 😔 **NOTÍCIAS SÉRIAS - TOM RESPEITOSO**

**Detecção:** Palavras como "acidente", "morte", "crime", "tragédia"
**Configuração TTS:**

```xml
<amazon:emotion name="conversational" intensity="medium">
<prosody rate="0.9" pitch="low">
Infelizmente, temos que informar sobre um acidente...
</prosody>
</amazon:emotion>
```

**Resultado:** Voz mais baixa, pausada, respeitosa

---

### 🎊 **NOTÍCIAS POSITIVAS - TOM ANIMADO**

**Detecção:** Palavras como "festival", "vitória", "sucesso", "inauguração"
**Configuração TTS:**

```xml
<amazon:emotion name="excited" intensity="medium">
<prosody rate="1.05" pitch="medium">
Que notícia boa, pessoal! Temos um novo festival chegando!
</prosody>
</amazon:emotion>
```

**Resultado:** Voz positiva, animada, mas controlada

---

### 🔥 **CULTURA REGIONAL - MÁXIMA EMPOLGAÇÃO**

**Detecção:** Palavras como "Parintins", "boi", "Garantido", "Caprichoso"
**Configuração TTS:**

```xml
<amazon:emotion name="excited" intensity="high">
<emphasis level="strong">
<prosody rate="1.2" pitch="high">
Oxe, maninho! Parintins tá chegando e a coisa vai pegar fogo!
</prosody>
</emphasis>
</amazon:emotion>
```

**Resultado:** Máxima empolgação, velocidade alta, ênfase forte

---

## 🎭 PERSONALIDADES DIFERENCIADAS

### 👩‍🎤 **TAINÁ (Mais Animada)**

- **Tom base:** Excited
- **Velocidade:** +10% mais rápida
- **Pitch:** Medium/High
- **Estilo de piada:** Comparações engraçadas

### 👨‍🎤 **IRAY (Mais Reflexivo)**

- **Tom base:** Conversational
- **Velocidade:** Normal
- **Pitch:** Low/Medium
- **Estilo de piada:** Observações irônicas

---

## 😄 SISTEMA DE PIADAS REGIONAIS

### 🌧️ **Sobre o Clima:**

```
"Vichi maninho, essa chuva tá que nem tucumã maduro - caindo direto!"
"Oxe, com essa chuva aí, até os peixes tão com medo de sair de casa!"
```

### 🚗 **Sobre Trânsito:**

```
"Esse trânsito tá mais lento que boto subindo corredeira!"
"Vichi, tá mais parado que jacaré tomando sol!"
```

### 🎭 **Sobre Parintins:**

```
"Aí sim, maninho! Parintins é onde o coração bate mais forte!"
"Curumím, em Parintins até os peixes sabem dançar!"
```

---

## ⚙️ CONFIGURAÇÃO TÉCNICA

### 📊 **Parâmetros de Controle:**

```json
{
  "velocidade": "0.9 a 1.2",
  "pitch": "low, medium, high",
  "emocao": "conversational, excited",
  "intensidade": "medium, high",
  "enfase": "moderate, strong"
}
```

### 🎯 **Detecção de Contexto:**

```javascript
// Exemplo de detecção automática
if (texto.includes("acidente")) {
  tom = "serio";
  velocidade = "0.9";
  pitch = "low";
} else if (texto.includes("festival")) {
  tom = "animado";
  velocidade = "1.1";
  pitch = "medium";
}
```

---

## 🚀 EXEMPLOS PRÁTICOS

### 📰 **Notícia Séria:**

**Entrada:** "Acidente na AM-010 deixa três feridos"
**TTS Gerado:**

```xml
<amazon:emotion name="conversational" intensity="medium">
<prosody rate="0.9" pitch="low">
Infelizmente, pessoal, temos que informar sobre um acidente na AM-010 que deixou três pessoas feridas.
</prosody>
</amazon:emotion>
```

### 🎉 **Notícia Alegre:**

**Entrada:** "Festival de Inverno começa amanhã em Manaus"
**TTS Gerado:**

```xml
<amazon:emotion name="excited" intensity="medium">
<prosody rate="1.05" pitch="medium">
<emphasis level="moderate">Oxe</emphasis>, que notícia boa! Festival de Inverno começa amanhã em Manaus!
</prosody>
</amazon:emotion>
```

### 🔥 **Parintins:**

**Entrada:** "Boi Garantido apresenta nova toada"
**TTS Gerado:**

```xml
<amazon:emotion name="excited" intensity="high">
<emphasis level="strong">
<prosody rate="1.2" pitch="high">
<emphasis level="moderate">Cabra danada</emphasis>, o Boi Garantido apresenta nova toada! Isso é demais, maninho!
</prosody>
</emphasis>
</amazon:emotion>
```

---

## 🎛️ COMO USAR

### 1. **Automático** (Recomendado)

O sistema detecta o tom automaticamente baseado no conteúdo:

```bash
npm run gerar-roteiro
```

### 2. **Manual** (Para casos específicos)

```javascript
const contexto = {
  secao: "abertura",
  tom_forcado: "alegre",
};
```

### 3. **Configuração**

Edite `config/tts-emocional.json` para ajustar intensidades e triggers.

---

**🎙️ Resultado: Vozes naturais que se adaptam ao conteúdo, criando uma experiência auditiva muito mais envolvente e profissional!**
