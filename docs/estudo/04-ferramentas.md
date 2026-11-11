# 04 — Ferramentas

Para cada etapa: opções, critérios, teste feito, escolha. Preços/versões verificados em fonte oficial com data (ver arquivo 03).

## Critérios de avaliação (peso a definir)

Qualidade pt-BR · custo/episódio · simplicidade de integração · confiabilidade/limites · licença/uso comercial · risco de lock-in.

## Etapas

### 1. Coleta de notícias
Opções: RSS onde existir · scraping (cheerio, atual) · APIs de notícias · Google News RSS por busca (Manaus/Amazonas).
Teste: quantas notícias/dia por fonte, taxa de falha, necessidade de manutenção quando o site muda.

Achados do Tap sobre coleta (2026-11-11): nem todo site podia ser lido automaticamente; no fim só 2–3 fontes funcionavam, e isso limitava o projeto. Sites mudam o layout e o scraping quebra. Linhas a pesquisar (**nada verificado ainda**): feeds RSS/Atom oficiais dos portais; sitemaps de notícias; agregadores com feed por busca ("Manaus", "Amazonas"); sites de órgãos públicos (prefeitura, governo do estado, defesa civil, concessionárias) que têm utilidade pública e costumam publicar em formato estável; checar termos de uso de cada fonte.

### 2. Agrupamento de duplicatas
Opções: similaridade de título (fuzzy, sem custo) · embeddings + limiar · LLM barato para confirmar pares.
Teste: precisão num conjunto de 1 semana rotulado à mão.

### 3. Ranqueamento/seleção

**Proposta (a validar) para não depender de IA para decidir relevância:** o sistema propõe, o Tap decide.
0. **Normalização por código (D16)**: tirar legendas de foto ("Foto:"), títulos repetidos, listas coladas, texto cortado; juntar fontes da mesma notícia.
0b. **Descartar por código notícias que dependem de imagem/vídeo**: expressões como "veja o vídeo", "confira as fotos", "assista", "veja imagens", "clique para ver", textos curtíssimos que só legendam mídia.
1. **Filtro de exclusão por regra** (custo zero): corta policial/criminalidade por seção do site, palavras-chave e lista de termos.
2. **Pontuação simples por regra** (custo zero): bônus para palavras de utilidade pública (água, energia, transporte, saúde, clima, vagas/concursos, benefícios), tecnologia e cultura; bônus por quantas fontes cobriram o mesmo fato; bônus por recência; menção explícita a Manaus/Amazonas.
3. **Lista curta (15–20 candidatas) para o Tap escolher 5–6** em poucos minutos, pelo celular.
4. **Opcional, só depois do Nível 0:** uma única chamada barata de IA que lê só os títulos em lote para reclassificar. Não uma chamada por notícia.
5. **Depois:** registrar o que o Tap escolhe e rejeita; esse histórico é o melhor material para ajustar as regras.

Opções: regras simples (fonte, palavras-chave, recência, nº de fontes que cobriram) · LLM só para desempate.
Observação: "mesma notícia em N sites" já é um bom sinal de relevância e é grátis.

### 4. Roteiro (LLM)
Opções: Gemini (Flash/Pro) · Claude · GPT · modelos abertos.
Teste: mesmo conjunto de notícias → comparar fidelidade aos fatos, naturalidade do diálogo, tamanho, custo.

### 5. Voz (TTS) — maior alavanca de custo
Opções: ElevenLabs (atual) · outros TTS comerciais · TTS open-source · modelos de diálogo multi-locutor.
Teste: mesmo trecho de 1 min, 2 vozes, avaliado às cegas; registrar custo por minuto.

Pontos a pesquisar nesta etapa (relato do Tap, 2026-11-11; **verificar nas páginas oficiais, nada confirmado aqui**):
- Hoje a voz é gerada **por trecho** (fala a fala), com configuração própria por trecho. Funcionava; as marcas de entonação dentro do texto funcionavam pouco.
- Já existem formas de **duas vozes dialogando de forma mais natural** (geração de diálogo multi-locutor)? Em quais provedores, com português do Brasil, a que custo e com que controle de emoção por trecho?
- Notícias pedem pouca variação emocional; a nuance fica nos comentários (notícia pesada vs. alegre). Medir quanto a configuração por trecho melhora o resultado percebido frente a uma voz fixa.

Hipótese a testar (não decidida): **gerar o diálogo por bloco de notícia**, não fala a fala nem o episódio inteiro. Cada bloco (notícia + comentário) seria um trecho contínuo de duas vozes conversando, com duração conhecida depois de gerado; as vinhetas fixas e a vírgula sonora entram **entre blocos**, que já eram os pontos naturais. Isso tentaria juntar naturalidade (conversa contínua dentro do bloco) com edição simples (cortes só nas fronteiras). Comparar nos testes: (a) fala a fala, (b) diálogo por bloco, (c) episódio inteiro, em naturalidade, custo, facilidade de corrigir um erro (regerar só um bloco) e controle de humor.

#### Pesquisa preliminar: TTS de código aberto/local (2026-11-11, **não verificado, só para a lista de testes**)

Origem: duas buscas na web. Os dados vêm de páginas de modelos e de agregadores; **nada foi ouvido nem confirmado em português do Brasil**. Cada item precisa de teste curto de qualidade, checagem de licença para uso comercial e de requisito de hardware.

| Candidato | O que a fonte diz | Dúvidas a resolver |
|-----------|-------------------|--------------------|
| [Coqui XTTS-v2](https://sol.sbc.org.br/index.php/stil/article/download/44625/44388/) | modelo multilíngue de clonagem de voz, comparado com ElevenLabs num artigo brasileiro (STIL) | manutenção atual; licença; qualidade pt-BR |
| [PodVoice](https://awesome.ecosyste.ms/projects/github.com%2Faman179102%2Fpodvoice) | CLI local que transforma roteiro em Markdown em áudio multi-locutor usando XTTS v2 | qualidade pt-BR; naturalidade do diálogo |
| [VibeVoice (Microsoft)](https://www.kdnuggets.com/top-5-text-to-speech-open-source-models) | feito para conversas longas com vários locutores | suporta português? versão em tempo real é de um só locutor |
| [FireRedTTS-2](https://theresanaiforthat.com/company/fireredteam/repository/FireRedTTS2) | diálogo multi-locutor longo, Apache-2.0 | português? |
| [SoulX-Podcast 1.7B](https://www.sourcepulse.org/projects/17732759) | multi-turno, multi-locutor, pensado para podcast | português? |
| [Dia (Nari Labs)](https://awesome.ecosyste.ms/api/v1/projects/github.com%2Fdevnen%2Fdia-tts-server) | diálogo entre locutores, Apache-2.0, existe servidor próprio | português? |
| [Rápido TTS](https://huggingface.co/edwixx/rapido-tts), [Kitsune-TTS](https://huggingface.co/Heitorkk2/Kitsune-TTS-V1), [Phonon-40m pt](https://huggingface.co/gradium/phonon-40m-pt) | modelos pequenos com português; Rápido tem 1 voz e a clonagem ainda é plano | só uma voz? qualidade para notícia? |
| [Fish Audio S2 Pro](https://fish.audio/pt/blog/text-to-speech-multiple-voices/) | multi-locutor, mas licença de pesquisa; uso comercial exige licença paga | provavelmente fora |

#### Pesquisa dirigida: VoiceStudio (debpalash), 2026-11-11

Fontes: [repositório](https://github.com/debpalash/VoiceStudio), [README](https://raw.githubusercontent.com/debpalash/VoiceStudio/HEAD/README.md), [inventário de licenças](https://raw.githubusercontent.com/debpalash/VoiceStudio/HEAD/docs/licensing/model-inventory.md), [doc da API de fala](https://raw.githubusercontent.com/debpalash/VoiceStudio/HEAD/docs/speech-platform.md), mais agregadores e resenhas (ex.: [Instagit](https://instagit.com/debpalash/VoiceStudio.md), [newreleases](https://newreleases.io/project/github/debpalash/VoiceStudio/release/v0.3.15), [aitoolly](https://aitoolly.com/ai-news/article/2026-10-15-voicestudio-emerges-as-an-open-source-fully-local-elevenlabs-alternative-supporting-646-languages)). **As páginas foram resumidas por uma ferramenta automática; confirmar tudo lendo os arquivos originais.**

- **O que é:** estúdio de voz local, de código aberto ("alternativa local ao ElevenLabs"), antigo OmniVoice-Studio. Clonagem de voz, **criação de voz por descrição em texto**, dublagem de vídeo, transcrição, ditado e narração de audiolivros em lote. Desktop, CLI, Docker e MCP.
- **Motor padrão:** OmniVoice (k2-fsa). O Model Manager oferece "dezenas" de outros motores (cita CosyVoice GGUF).
- **Idiomas:** anuncia "646 idiomas", **sem dizer nada sobre a qualidade em português do Brasil**. Há README traduzido, que é a documentação, não a voz.
- **Hardware:** NVIDIA (CUDA), AMD (ROCm, experimental), Apple (Metal), Vulkan em motores GGUF; **sem GPU roda na CPU, "mais lento"**. Sem números de VRAM/velocidade na página (há `docs/performance.md` e `docs/benchmarks.md` para ler).
- **Licença:** o aplicativo é AGPL-3.0, mas **pesos e saídas têm licenças próprias**. O inventário de licenças do próprio projeto classifica **OmniVoice, OmniVoice-GGUF, NLLB e Llama-OuteTTS como não comerciais** e diz que **nenhum registro está liberado para uso comercial**. Para o Bubuia News isso importa se houver monetização. Existe versão paga fechada (VoiceStudio Pro, com licença comercial para trabalho com clientes; preço não encontrado).
- **API para automação:** a doc da API local descreve só **transcrição de fala** (endpoint `/v1/audio/transcriptions`, porta 3900); **não encontrei endpoint de síntese de voz documentado** nesse arquivo. Pode existir em outro doc; verificar antes de contar com isso.
- **Diálogo/emoção:** há guias de dublagem multi-locutor e de fala expressiva, mas sem detalhes na página; não é, até onde vi, um gerador de diálogo de podcast.
- **Discrepâncias a conferir:** estrelas no GitHub (~108 mil numa leitura, ~17,7 mil em outra), versão (v0.5.3 numa fonte; v0.3.x em outras) e estado ("beta ativo" numa resenha, "estável" para várias plataformas no README).
- **Leitura preliminar:** ferramenta interessante e muito ativa, mas para o nosso caso há três bloqueios a resolver antes de testar: (1) qualidade em pt-BR, (2) **licença comercial dos pesos**, (3) **API de síntese para automação**. Se (2) e (3) falharem, serve só para experimentos pessoais, ou o modelo subjacente (k2-fsa/OmniVoice) pode ser usado direto, sujeito à mesma licença.

**Ponto estrutural:** rodar modelo aberto exige **GPU**. Isso conflita com "não depender do meu computador": ou o PC do Tap tem GPU e fica ligado, ou se **aluga GPU por minutos** na nuvem só para gerar o áudio do dia (custo por uso, a levantar). Comparar no arquivo 03: TTS pago por caractere × GPU alugada × GPU própria.

**Ressalvas:** clonar voz de pessoa real levanta questão de consentimento e legal; vozes dos apresentadores devem ser sintéticas ou de uso autorizado. Os candidatos de diálogo (VibeVoice, SoulX, Dia, FireRed) também precisam provar **português** antes de qualquer outra coisa.

### 6. Mixagem
Opções: ffmpeg (atual) · biblioteca de áudio em Python (pydub). Provavelmente manter ffmpeg com um único comando/filtro por episódio.

### 7. Hospedagem e publicação
Opções: host de podcast (gratuito/pago) · bucket de objetos + RSS próprio · GitHub Pages/Releases para o feed.
Teste: aceitação do feed por Spotify/Apple/YouTube Music; custo de armazenamento/banda.

### 8. Orquestração/execução
Opções: um único script + cron local · GitHub Actions agendado · serviço agendado em nuvem.

### 9. Interface de curadoria
Opções: mini-app web (atual) · arquivo markdown/JSON editado à mão · bot de Telegram/WhatsApp com botões · planilha.

## Matriz de decisão (preencher)

| Etapa | Opção A | Opção B | Opção C | Escolha | Motivo |
|-------|---------|---------|---------|---------|--------|
| Coleta | | | | | |
| Agrupamento | | | | | |
| Ranqueamento | | | | | |
| Roteiro | | | | | |
| Voz | | | | | |
| Mixagem | | | | | |
| Hospedagem | | | | | |
| Orquestração | | | | | |
| Curadoria | | | | | |
