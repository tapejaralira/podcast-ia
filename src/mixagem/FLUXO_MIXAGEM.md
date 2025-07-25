# 🎬 Fluxo Completo de Mixagem - montarEpisodio.ts

## 📋 **ANÁLISE SEMÂNTICA DO PROCESSAMENTO DE ÁUDIO**

_Documento técnico detalhando cada etapa do processo de mixagem na sequência exata de execução_

---

## 🔧 **1. PREPARAÇÃO INICIAL**

```
1. Valida FFmpeg instalado
2. Cria diretório temporário para processamento: output/cache/mixagem-temp/
3. Define data de Manaus para localizar arquivos do episódio
4. Localiza pasta: output/audio/episodio-YYYY-MM-DD/
5. Carrega roteiro: output/scripts/roteiro-YYYY-MM-DD.md
6. Valida arquivos de silêncio: assets/audio/assets/silencio_1s.mp3 e silencio_3s.mp3
```

---

## 📋 **2. DIVISÃO EM BLOCOS PRINCIPAIS**

O roteiro é dividido pelos separadores `---` criando blocos temáticos:

```
- Bloco 0: Cold Open (Alexandre Dumas)
- Bloco 1: Manchete (Normas carregamento elétrico)
- Bloco 2: Cultura (Festival Cirandas)
- Bloco 3: Economia (Viaturas inteligentes)
- Bloco 4: Cidades (Limpeza igarapés)
- Bloco N: Outros blocos conforme roteiro
```

---

## 🎯 **3. PROCESSAMENTO DE CADA BLOCO**

### **3.1 DETECÇÃO DE ELEMENTOS**

Escaneia linha por linha procurando padrões específicos:

| Padrão                                       | Detecção                 | Ação                        |
| -------------------------------------------- | ------------------------ | --------------------------- |
| `[AUDIO: vinheta.mp3]`                       | ✅ Vinheta               | Adiciona vinheta standalone |
| `[TRILHA_INICIO: trilha_eventos.mp3, -24dB]` | ✅ Início trilha musical | Inicia segmento musical     |
| `**Tainá Oliveira:**`                        | ✅ Fala da Tainá         | Processa fala + efeitos     |
| `**Iraí Santos:**`                           | ✅ Fala do Iraí          | Processa fala + efeitos     |
| `[TRILHA_FIM]`                               | ✅ Fim da trilha musical | Finaliza segmento musical   |

### **3.2 PROCESSAMENTO DE FALAS**

Para cada fala detectada:

```typescript
1. Localiza arquivo: fala_XX_taina_oliveira.mp3 ou fala_XX_irai_santos.mp3
2. Aplica efeitos de áudio:
   - Compressão: 'compand=attacks=0:points=-80/-90|-45/-15|-27/-9|-12/-5|0/-3|20/-1.5'
   - Loudness: 'loudnorm=I=-16:TP=-1.5:LRA=11' (padrão broadcast)
   - Echo: 'aecho=1:0.8:20:0.2' (adiciona espacialidade)
   - Volume extra para Tainá: 'volume=2.8' (compensação tonal)
3. Salva versão processada: fala_XX_taina_oliveira_fx.mp3
4. Adiciona silêncio de 1s após cada fala
```

### **3.3 CRIAÇÃO DE SEGMENTOS MUSICAIS**

Quando encontra `[TRILHA_INICIO: arquivo.mp3, volume]`:

```typescript
1. Cria "segmento musical" que contém:
   - Trilha de fundo: assets/audio/trilhas/arquivo.mp3 com volume especificado
   - Vinheta opcional: se houver [AUDIO: TRANSICAO_X.mp3] antes da trilha
   - Array de falas: coletadas entre TRILHA_INICIO e TRILHA_FIM

2. Coleta todas as falas até encontrar [TRILHA_FIM]

3. Monta camada vocal (em ordem):
   - Vinheta de transição (se existir)
   - Silêncio 3s (entrada suave)
   - Fala 1 + Silêncio 1s
   - Fala 2 + Silêncio 1s
   - Fala N + Silêncio 1s
   - Silêncio 3s final (saída suave)

4. Mixagem trilha + vozes:
   - Trilha de fundo: volume conforme especificado (ex: -24dB)
   - Camada vocal: volume +2.8dB final
   - Duração: primeira camada (vozes) determina duração total
   - FFmpeg: '[1:a]volume=VOLUME[bg]; [0:a][bg]amix=inputs=2:duration=first,volume=2.8'
```

### **3.4 CONSOLIDAÇÃO DO BLOCO**

Cada bloco principal se torna um arquivo único:

```
Elementos processados em ordem:
├─ Vinhetas standalone (fora de segmentos musicais)
├─ Segmentos musicais mixados (trilha + falas + silêncios)
├─ Falas standalone (sem trilha de fundo)
└─ Resultado: bloco_final_X.mp3
```

---

## 🔗 **4. MONTAGEM FINAL**

### **4.1 CROSSFADE ENTRE BLOCOS**

Todos os blocos são unidos com crossfade suave:

```typescript
- Duração do crossfade: config.mixagem.crossfadeDuration (padrão ~2s)
- FFmpeg filter: '[0:a][1:a]acrossfade=d=DURATION[a1]; [a1][2:a]acrossfade=d=DURATION[a2]...'
- Transição: Bloco anterior diminui volume / Bloco seguinte aumenta volume
- Resultado: transições profissionais sem cortes abruptos
```

### **4.2 ARQUIVO FINAL**

```
Resultado: output/episodes/bubuia_news_YYYY-MM-DD.mp3
├─ Todos os blocos unidos sequencialmente
├─ Transições suaves entre cada bloco
├─ Áudio normalizado e masterizado
└─ Pronto para distribuição em plataformas
```

---

## 🧹 **5. LIMPEZA**

Remove todos os arquivos temporários:

```
- output/cache/mixagem-temp/fala_XX_*_fx.mp3 (falas processadas)
- output/cache/mixagem-temp/vocal_track_*.mp3 (camadas vocais)
- output/cache/mixagem-temp/segmento_musical_*.mp3 (segmentos mixados)
- output/cache/mixagem-temp/bloco_final_*.mp3 (blocos consolidados)
- Mantém apenas: output/episodes/bubuia_news_YYYY-MM-DD.mp3
```

---

## 🎧 **ESTRUTURA FINAL TÍPICA DO EPISÓDIO**

```
🎙️ EPISÓDIO FINAL (bubuia_news_2025-07-24.mp3):

├─ BLOCO 0: Cold Open
│  ├─ Vinheta: vinheta_abertura.mp3
│  ├─ Tainá fala sobre Alexandre Dumas
│  └─ Iraí responde com contexto local
│
├─ ╲ CROSSFADE 2s ╱
│
├─ BLOCO 1: Manchete Principal
│  ├─ Trilha: trilha_tecnologica_upbeat.mp3 (-24dB)
│  ├─ ├─ Silêncio 3s
│  ├─ ├─ Tainá apresenta notícia
│  ├─ ├─ Silêncio 1s
│  ├─ ├─ Iraí comenta e analisa
│  ├─ ├─ Silêncio 1s
│  └─ └─ Silêncio 3s
│
├─ ╲ CROSSFADE 2s ╱
│
├─ BLOCO 2: Cultura
│  ├─ Vinheta: introducao_fixa.mp3
│  ├─ Trilha: trilha_eventos.mp3 (-24dB)
│  ├─ ├─ Silêncio 3s
│  ├─ ├─ Iraí apresenta evento cultural
│  ├─ ├─ Silêncio 1s
│  ├─ ├─ Tainá contextualiza importância
│  ├─ ├─ Silêncio 1s
│  └─ └─ Silêncio 3s
│
├─ ╲ CROSSFADE 2s ╱
│
└─ BLOCO N: Encerramento
   ├─ Trilha: trilha_neutra.mp3 (-24dB)
   ├─ ├─ Comentários finais
   ├─ └─ Despedida dos apresentadores
   └─ Vinheta: encerramento_fixo.mp3
```

---

## 📊 **CONFIGURAÇÕES CRÍTICAS ATUAIS**

### **Volumes e Timing:**

```typescript
- Trilhas de fundo: Conforme roteiro (ex: -24dB)
- Vozes processadas: +2.8dB boost final
- Tainá específico: +2.8dB adicional (compensação tonal)
- Silêncios entre falas: 1 segundo
- Silêncios início/fim trilhas: 3 segundos
- Crossfade entre blocos: config.mixagem.crossfadeDuration
```

### **Efeitos de Voz:**

```typescript
- Compressão: Dynamic range control para broadcast
- Loudness: -16 LUFS (padrão EBU R128)
- Echo: Espacialidade sutil (delay 20ms, decay 0.2)
- Normalização: True peak -1.5dB
```

### **Paths de Arquivos:**

```
Entrada:
├─ Falas: output/audio/episodio-YYYY-MM-DD/fala_XX_nome.mp3
├─ Trilhas: assets/audio/trilhas/trilha_*.mp3
├─ Vinhetas: assets/audio/vinhetas/vinheta_*.mp3
├─ Silêncios: assets/audio/assets/silencio_*s.mp3
└─ Roteiro: output/scripts/roteiro-YYYY-MM-DD.md

Temporários:
└─ output/cache/mixagem-temp/[arquivos processados]

Saída:
└─ output/episodes/bubuia_news_YYYY-MM-DD.mp3
```

---

## 🎯 **PONTOS DE MELHORIA IDENTIFICADOS**

### **Volumes e Balanceamento:**

1. **Volume das trilhas**: Atualmente fixo conforme roteiro
2. **Balanceamento dinâmico**: Poderia ajustar conforme conteúdo
3. **Compressão multibanda**: Para melhor presença vocal

### **Timing e Transições:**

1. **Silêncios**: 1s entre falas, 3s início/fim de trilhas (fixos)
2. **Crossfade**: Duração uniforme entre todos os blocos
3. **Fades**: Entrada e saída de trilhas poderiam ser mais dinâmicos

### **Processamento de Voz:**

1. **Efeitos uniformes**: Ambos apresentadores têm mesmo processamento
2. **EQ específico**: Poderia otimizar para características vocais individuais
3. **Ambientação**: Reverb/espacialização poderia variar por bloco

### **Estrutura de Blocos:**

1. **Ordem de processamento**: Linear bloco por bloco
2. **Detecção de padrões**: String matching funciona mas poderia ser mais flexível
3. **Validação**: Verificação de arquivos poderia ser mais robusta

---

**📝 Documento criado em:** 24 de julho de 2025  
**🎯 Propósito:** Referência técnica para melhorias futuras na mixagem  
**🔄 Status:** Baseado na versão atual funcional do pipeline
