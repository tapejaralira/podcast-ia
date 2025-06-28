const fs = require('fs');
const path = require('path');

class IntegracaoIA {
    constructor() {
        this.configPath = path.join(__dirname, 'config', 'ia-config.json');
        this.audiosPath = path.join(__dirname, 'audios');
        
        console.log(`🔧 Inicializando IntegracaoIA...`);
        console.log(`📁 Config path: ${this.configPath}`);
        console.log(`🎵 Audios path: ${this.audiosPath}`);
        
        // Criar diretório de áudios se não existir
        if (!fs.existsSync(this.audiosPath)) {
            fs.mkdirSync(this.audiosPath, { recursive: true });
            console.log('📁 Diretório audios criado');
        }
        
        // Carregar configurações com debug detalhado
        this.carregarConfiguracoes();
        
        // Importar node-fetch dinamicamente para compatibilidade
        this.fetch = null;
    }
    
    carregarConfiguracoes() {
        try {
            console.log(`🔧 Verificando arquivo: ${this.configPath}`);
            
            if (!fs.existsSync(this.configPath)) {
                throw new Error(`❌ Arquivo não encontrado: ${this.configPath}`);
            }
            
            const configData = fs.readFileSync(this.configPath, 'utf8');
            console.log(`✅ Arquivo lido, ${configData.length} caracteres`);
            
            this.config = JSON.parse(configData);
            console.log(`✅ JSON parseado, chaves: [${Object.keys(this.config).join(', ')}]`);
            
            if (!this.config.tts) {
                console.log('❌ Estrutura atual da config:');
                console.log(JSON.stringify(this.config, null, 2));
                throw new Error('Seção TTS não encontrada');
            }
            
            console.log(`✅ TTS encontrado, serviço: ${this.config.tts.servico_ativo}`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error.message);
            throw error;
        }
    }

    async inicializarFetch() {
        if (!this.fetch) {
            try {
                const { default: fetch } = await import('node-fetch');
                this.fetch = fetch;
                console.log('✅ Node-fetch inicializado');
            } catch (error) {
                console.error('❌ Erro ao importar node-fetch:', error.message);
                throw new Error('node-fetch não disponível');
            }
        }
    }

    prepararTextoParaTTS(roteiro, personagem, contexto = {}) {
        const personagens = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'data', 'personagens.json'), 'utf8'
        ));
        
        const podcastConfig = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'data', 'podcast-config.json'), 'utf8'
        ));

        const dadosPersonagem = personagens.personagens.find(p => 
            p.nome.toLowerCase().includes(personagem.toLowerCase())
        );

        if (!dadosPersonagem) return roteiro;

        let textoPreparado = roteiro;
        
        // 1. DETECTAR CONTEXTO E DEFINIR TOM
        const tonalidade = this.detectarTonalidade(textoPreparado, contexto);
        
        // 2. APLICAR CONFIGURAÇÕES DE TOM
        textoPreparado = this.aplicarConfiguracaoTom(textoPreparado, tonalidade, personagem);
        
        // 3. ADICIONAR PAUSAS APÓS GÍRIAS
        dadosPersonagem.gírias?.forEach(giria => {
            const regex = new RegExp(`\\b${giria}\\b`, 'gi');
            textoPreparado = textoPreparado.replace(regex, `${giria}<break time="0.3s"/>`);
        });

        // 4. ADICIONAR ÊNFASES BASEADAS NO TOM
        textoPreparado = this.adicionarEnfases(textoPreparado, tonalidade);
        
        // 5. AJUSTAR VELOCIDADE E PITCH POR PERSONALIDADE E TOM
        const configVoz = this.obterConfiguracaoVoz(personagem, tonalidade, dadosPersonagem);
        textoPreparado = `<prosody rate="${configVoz.velocidade}" pitch="${configVoz.pitch}">${textoPreparado}</prosody>`;

        return textoPreparado;
    }

    // NOVO: Geração de áudio ElevenLabs
    async gerarAudioElevenLabs(texto, personagem, contexto = {}) {
        // Garantir que fetch está disponível
        if (!this.fetch) {
            await this.inicializarFetch();
        }

        // Corrigir nome do personagem para buscar config correta
        let personagemKey = personagem.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (personagemKey.includes('taina')) personagemKey = 'taina';
        else if (personagemKey.includes('irai')) personagemKey = 'irai';

        const config = this.config.tts.elevenlabs;
        // Usar os IDs do config
        const voiceId = personagemKey === 'taina' ? config.voice_taina : config.voice_irai;

        // Buscar configuração contextual de voz (velocidade, emoção, etc)
        let configVoz = {};
        if (contexto && contexto.configVoz && contexto.configVoz[personagemKey]) {
            configVoz = contexto.configVoz[personagemKey];
        } else if (this.config.configuracoes_personagens && this.config.configuracoes_personagens[personagemKey]) {
            configVoz = this.config.configuracoes_personagens[personagemKey];
        } else {
            throw new Error(`Configuração de voz não encontrada para o personagem: ${personagemKey}`);
        }

        // Parâmetros ElevenLabs
        const payload = {
            text: texto,
            model_id: config.modelo,
            voice_settings: {
                stability: config.stability ?? 0.5,
                similarity_boost: config.similarity_boost ?? 0.8,
                style: config.style ?? 0.3,
                use_speaker_boost: config.use_speaker_boost ?? true
            }
        };

        // Ajustar style/intonation/contexto se vier do contexto
        if (configVoz.velocidade_fala) payload.voice_settings.style = configVoz.velocidade_fala;
        if (configVoz.emocao) payload.voice_settings.emotion = configVoz.emocao;
        if (configVoz.intensidade) payload.voice_settings.intensity = configVoz.intensidade;

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const headers = {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': config.api_key
        };

        console.log(`🎙️ Chamando ElevenLabs para ${personagem} (voice: ${voiceId})...`);
        try {
            const response = await this.fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
            }

            // Salvar áudio
            const audioBuffer = await response.arrayBuffer();
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const nomeArquivo = `${personagemKey}_${timestamp}.mp3`;
            const caminhoArquivo = path.join(this.audiosPath, nomeArquivo);

            fs.writeFileSync(caminhoArquivo, Buffer.from(audioBuffer));

            return {
                arquivo: caminhoArquivo,
                personagem: personagem,
                texto: texto,
                duracao_estimada: Math.ceil(texto.length / 10), // estimativa simples
                servico: 'elevenlabs',
                voice_id: voiceId,
                tamanho_arquivo: Buffer.from(audioBuffer).length
            };

        } catch (error) {
            console.error(`❌ Erro na API ElevenLabs:`, error.message);
            throw error;
        }
    }

    async processarRoteiroCompleto(roteiroPath) {
        const roteiro = fs.readFileSync(roteiroPath, 'utf8');
        const audiosGerados = [];

        const falasTaina = this.extrairFalas(roteiro, 'Tainá');
        const falasIray = this.extrairFalas(roteiro, 'Iray');

        console.log(`🎯 Encontradas ${falasTaina.length} falas da Tainá`);
        console.log(`🎯 Encontradas ${falasIray.length} falas do Iray`);

        // Gera áudios para Tainá
        for (let i = 0; i < falasTaina.length; i++) {
            const contexto = this.identificarContextoFala(falasTaina[i], i, 'Tainá');
            const textoPreparado = this.prepararTextoParaTTS(falasTaina[i], 'Tainá', contexto);
            const audio = await this.gerarAudio(textoPreparado, 'Tainá');
            audiosGerados.push({
                personagem: 'Tainá',
                ordem: i,
                texto: falasTaina[i],
                contexto: contexto,
                tonalidade: contexto.tonalidade,
                arquivo: audio.arquivo,
                timestamp: new Date().toISOString()
            });
        }

        // Gera áudios para Iray
        for (let i = 0; i < falasIray.length; i++) {
            const contexto = this.identificarContextoFala(falasIray[i], i, 'Iray');
            const textoPreparado = this.prepararTextoParaTTS(falasIray[i], 'Iray', contexto);
            const audio = await this.gerarAudio(textoPreparado, 'Iray');
            audiosGerados.push({
                personagem: 'Iray',
                ordem: i,
                texto: falasIray[i],
                contexto: contexto,
                tonalidade: contexto.tonalidade,
                arquivo: audio.arquivo,
                timestamp: new Date().toISOString()
            });
        }

        const infoAudios = {
            roteiro_origem: roteiroPath,
            data_processamento: new Date().toISOString(),
            total_audios: audiosGerados.length,
            audios: audiosGerados
        };

        const infoFile = path.join(this.audioPath, `info_${Date.now()}.json`);
        fs.writeFileSync(infoFile, JSON.stringify(infoAudios, null, 2));

        console.log(`✅ ${audiosGerados.length} áudios processados!`);
        console.log(`📄 Informações salvas em: ${infoFile}`);

        return infoAudios;
    }

    extrairFalas(roteiro, personagem) {
        const regex = new RegExp(`\\*\\*${personagem}:\\*\\*\\s*([^*]+)`, 'g');
        const falas = [];
        let match;

        while ((match = regex.exec(roteiro)) !== null) {
            falas.push(match[1].trim());
        }

        return falas;
    }

    // NOVO: Método principal para gerar áudio (multi-serviço)
    async gerarAudio(texto, personagem, contexto = {}) {
        const config = this.config.tts;
        // Forçar uso do ElevenLabs
        const servicoAtivo = 'elevenlabs';

        console.log(`🎙️ Gerando áudio para ${personagem} usando ElevenLabs...`);

        // Preparar texto com TTS emocional/contextual
        const textoPreparado = this.prepararTextoParaTTS(texto, personagem, contexto);

        try {
            let resultado;
            resultado = await this.gerarAudioElevenLabs(textoPreparado, personagem, contexto);

            console.log(`✅ Áudio gerado: ${resultado.arquivo}`);
            return resultado;

        } catch (error) {
            console.error(`❌ Erro ao gerar áudio para ${personagem}:`, error.message);
            throw error;
        }
    }

    // NOVO: Detecta tonalidade baseada no conteúdo
    detectarTonalidade(texto, contexto) {
        const textoLower = texto.toLowerCase();
        
        // ABERTURA - SEMPRE ALEGRE
        if (contexto.secao === 'abertura' || textoLower.includes('começando mais um bubuia news')) {
            return {
                tipo: 'alegre',
                intensidade: 'alta',
                humor: true,
                energia: 'alta'
            };
        }
        
        // NOTÍCIAS SÉRIAS
        const palavrasSerias = [
            'acidente', 'morte', 'morreu', 'faleceu', 'tragédia', 'crime', 'assassinato',
            'roubo', 'assalto', 'violência', 'agressão', 'prisão', 'preso',
            'problema', 'crise', 'desemprego', 'inflação', 'alta dos preços',
            'enchente', 'desastre', 'emergência', 'hospital', 'doença'
        ];
        
        const temPalavraSeria = palavrasSerias.some(palavra => textoLower.includes(palavra));
        
        if (temPalavraSeria) {
            return {
                tipo: 'serio',
                intensidade: 'media',
                humor: false,
                energia: 'baixa'
            };
        }
        
        // NOTÍCIAS POSITIVAS/LEVES
        const palavrasPositivas = [
            'festa', 'festival', 'show', 'celebração', 'inauguração',
            'sucesso', 'vitória', 'ganhou', 'prêmio', 'reconhecimento',
            'melhoria', 'crescimento', 'desenvolvimento', 'progresso',
            'cultura', 'arte', 'música', 'diversão', 'entretenimento',
            'esporte', 'campeonato', 'conquista'
        ];
        
        const temPalavraPositiva = palavrasPositivas.some(palavra => textoLower.includes(palavra));
        
        if (temPalavraPositiva) {
            return {
                tipo: 'animado',
                intensidade: 'alta',
                humor: true,
                energia: 'alta'
            };
        }
        
        // INTERAÇÃO ENTRE PERSONAGENS - BRINCALHONA E SARCÁSTICA
        if (contexto.secao === 'interacao' || textoLower.includes('né') || textoLower.includes('concordo')) {
            return {
                tipo: 'brincalhao',
                intensidade: 'media',
                humor: true,
                energia: 'media',
                sarcasmo: true
            };
        }
        
        // PARINTINS/CULTURA REGIONAL - SUPER ANIMADO
        if (textoLower.includes('parintins') || textoLower.includes('boi') || 
            textoLower.includes('garantido') || textoLower.includes('caprichoso')) {
            return {
                tipo: 'empolgado',
                intensidade: 'maxima',
                humor: true,
                energia: 'maxima'
            };
        }
        
        // PADRÃO - CONVERSACIONAL
        return {
            tipo: 'conversacional',
            intensidade: 'media',
            humor: false,
            energia: 'media'
        };
    }

    // NOVO: Aplica configurações específicas de tom
    aplicarConfiguracaoTom(texto, tonalidade, personagem) {
        let textoComTom = texto;
        
        switch (tonalidade.tipo) {
            case 'alegre':
                // Adiciona entusiasmo na voz
                textoComTom = `<amazon:emotion name="excited" intensity="${tonalidade.intensidade}">${texto}</amazon:emotion>`;
                break;
                
            case 'serio':
                // Tom mais sóbrio e respeitoso
                textoComTom = `<amazon:emotion name="conversational" intensity="medium">${texto}</amazon:emotion>`;
                break;
                
            case 'animado':
                // Tom positivo e energético
                textoComTom = `<amazon:emotion name="excited" intensity="${tonalidade.intensidade}">${texto}</amazon:emotion>`;
                break;
                
            case 'brincalhao':
                // Tom descontraído e levemente sarcástico para interações
                textoComTom = `<amazon:emotion name="conversational" intensity="medium"><prosody rate="1.0" pitch="medium">${texto}</prosody></amazon:emotion>`;
                break;
                
            case 'empolgado':
                // Máxima empolgação para cultura regional
                textoComTom = `<amazon:emotion name="excited" intensity="high"><emphasis level="strong">${texto}</emphasis></amazon:emotion>`;
                break;
                
            default:
                // Tom conversacional natural
                textoComTom = `<amazon:emotion name="conversational" intensity="medium">${texto}</amazon:emotion>`;
        }
        
        return textoComTom;
    }

    // NOVO: Adiciona ênfases baseadas no tom
    adicionarEnfases(texto, tonalidade) {
        let textoComEnfase = texto;
        
        // Enfatizar palavras importantes baseado na tonalidade
        if (tonalidade.humor) {
            // Adiciona ênfase em gírias para humor
            const giriasParaEnfase = ['oxe', 'vichi', 'cabra danada', 'meu pai eterno'];
            giriasParaEnfase.forEach(giria => {
                const regex = new RegExp(`\\b${giria}\\b`, 'gi');
                textoComEnfase = textoComEnfase.replace(regex, `<emphasis level="moderate">${giria}</emphasis>`);
            });
        }
        
        if (tonalidade.tipo === 'serio') {
            // Enfatiza palavras-chave em notícias sérias
            textoComEnfase = textoComEnfase.replace(/\*\*(.*?)\*\*/g, '<emphasis level="strong">$1</emphasis>');
        }
        
        return textoComEnfase;
    }

    // NOVO: Configuração de voz por personalidade e tom
    obterConfiguracaoVoz(personagem, tonalidade, dadosPersonagem) {
        const baseConfig = {
            velocidade: '1.0',
            pitch: 'medium'
        };
        
        // Ajustes por personalidade
        const isAnimado = dadosPersonagem.personalidade?.includes('animado');
        
        // Ajustes por tonalidade
        switch (tonalidade.energia) {
            case 'maxima':
                baseConfig.velocidade = isAnimado ? '1.2' : '1.1';
                baseConfig.pitch = 'high';
                break;
            case 'alta':
                baseConfig.velocidade = isAnimado ? '1.1' : '1.05';
                baseConfig.pitch = 'medium';
                break;
            case 'baixa':
                baseConfig.velocidade = '0.9';
                baseConfig.pitch = 'low';
                break;
            default:
                baseConfig.velocidade = isAnimado ? '1.05' : '1.0';
                baseConfig.pitch = 'medium';
        }
        
        return baseConfig;
    }

    // NOVO: Identifica contexto da fala para aplicar tom correto
    identificarContextoFala(texto, ordem, personagem) {
        const textoLower = texto.toLowerCase();
        
        // Identificar seção do podcast
        let secao = 'geral';
        if (textoLower.includes('começando mais um bubuia news') || ordem === 0) {
            secao = 'abertura';
        } else if (textoLower.includes('tchau') || textoLower.includes('até a próxima')) {
            secao = 'encerramento';
        } else if (textoLower.includes('esporte') || textoLower.includes('campeonato')) {
            secao = 'esportes';
        } else if (textoLower.includes('evento') || textoLower.includes('festival')) {
            secao = 'eventos';
        } else if (textoLower.includes('comentário') || textoLower.includes('ouvinte')) {
            secao = 'interacao';
        } else if (this.ehInteracaoEntrePersonagens(texto)) {
            secao = 'interacao';
        }
        
        return {
            secao,
            ordem,
            personagem,
            necessita_piada: this.precisaPiada(texto, secao),
            tonalidade: secao // Será refinado no detectarTonalidade
        };
    }

    // NOVO: Determina se contexto permite/precisa de piada regional
    precisaPiada(texto, secao) {
        const textoLower = texto.toLowerCase();
        
        // Seções que permitem humor
        const secoesComHumor = ['abertura', 'esportes', 'eventos', 'interacao'];
        if (!secoesComHumor.includes(secao)) return false;
        
        // Assuntos que permitem piada regional
        const assuntosComHumor = [
            'parintins', 'boi', 'garantido', 'caprichoso', 'festival',
            'chuva', 'calor', 'trânsito', 'feira', 'comida típica',
            'açaí', 'tucumã', 'tambaqui', 'pirarucu'
        ];
        
        return assuntosComHumor.some(assunto => textoLower.includes(assunto));
    }

    // NOVO: Gera piadas regionais contextuais específicas de Manaus
    gerarPiadaRegional(texto, personagem) {
        const textoLower = texto.toLowerCase();
        const piadasManaus = {
            chuva: [
                "Vichi maninho, essa chuva tá que nem tucumã maduro - caindo direto!",
                "Oxe, com essa chuva aí, até os peixes tão com medo de sair de casa!",
                "Rapaz, choveu tanto que até o Meeting das Águas ficou confuso!",
                "Meu pai eterno, chuva dessa nem no tempo de Noé!"
            ],
            calor: [
                "Cabra danada, tá mais quente que fogueira de São João!",
                "Meu pai eterno, tá um calor que nem o garantido vermelho!",
                "Vichi, tá tão quente que o asfalto da Torquato tá derretendo!",
                "Oxe, esse sol tá mais forte que motor de rabeta no rio!"
            ],
            transito: [
                "Esse trânsito tá mais lento que boto subindo corredeira!",
                "Vichi, tá mais parado que jacaré tomando sol na beirada!",
                "Rapaz, esse congestionamento na Constantino Nery tá pior que enchente!",
                "Meu pai eterno, ônibus mais lotado que canoa na época da piracema!"
            ],
            onibus: [
                "Oxe, ônibus mais apertado que sardinha na lata!",
                "Vichi, tá mais cheio que barco na festa do Çairé!",
                "Rapaz, dentro desse ônibus nem formiga cabe mais!",
                "Cabra danada, parece elevador do Amazonas Shopping na Black Friday!"
            ],
            buracos: [
                "Meu pai eterno, buraco na rua maior que igarapé!",
                "Vichi, esses buracos na Djalma Batista parecem cratera da lua!",
                "Oxe, buraco tão grande que dá pra pescar tambaqui dentro!",
                "Rapaz, essa rua tá mais furada que peneira de açaí!"
            ],
            alagamento: [
                "Cabra danada, alagou tanto que parece época da cheia no interior!",
                "Vichi, água na rua subindo mais que rio em época de inverno!",
                "Oxe, tá parecendo Veneza, só que com jacaré no lugar de gondoleiro!",
                "Rapaz, até os carros viraram barco nessa enchente urbana!"
            ],
            seguranca_compensa: [
                "Vichi, na Compensa até os bandidos andam com medo! (risos)",
                "Oxe, lá é mais perigoso que nadar com piranha!",
                "Rapaz, na Compensa até o GPS pede pra voltar!",
                "Meu pai eterno, lá é terra de ninguém mesmo!"
            ],
            seguranca_zona_leste: [
                "Cabra danada, Zona Leste é aventura que não recomendo!",
                "Vichi, lá é mais arriscado que pescar jacaré de mão!",
                "Oxe, na Zona Leste até os criminosos fazem seguro de vida!",
                "Rapaz, lá o perigo anda solto que nem capivara no pasto!"
            ],
            ponta_negra: [
                "Meu pai eterno, na Ponta Negra tem mais coisa boiando que tronco no rio!",
                "Vichi, praia da Ponta Negra virou depósito flutuante!",
                "Oxe, lá boia tanta coisa que parece feira livre aquática!",
                "Rapaz, na Ponta Negra até o lixo sabe nadar!"
            ],
            parintins: [
                "Aí sim, maninho! Parintins é onde o coração bate mais forte!",
                "Curumím, em Parintins até os peixes sabem dançar!",
                "Vichi, Festival de Parintins é melhor que Copa do Mundo!",
                "Oxe, em Parintins até a lua para pra assistir o boi!"
            ],
            interior: [
                "Presidente Figueiredo, terra das cachoeiras e da paz, maninho!",
                "Rio Preto da Eva, onde o açaí é mais doce e a vida mais calma!",
                "No interior é diferente, caboco - lá ainda tem sossego!",
                "Vichi, cidade pequena onde todo mundo se conhece desde criança!"
            ],
            amazonia: [
                "Meu pai eterno, aqui na Amazônia a natureza é que manda!",
                "Vichi, floresta tão grande que nem Deus conhece tudo!",
                "Oxe, aqui tem bicho que a ciência ainda não descobriu!",
                "Rapaz, Amazônia é o pulmão do mundo mesmo!"
            ]
        };
        
        // Busca piadas por categoria
        for (const [categoria, piadas] of Object.entries(piadasManaus)) {
            if (this.temPalavraChaveCategoria(textoLower, categoria)) {
                const piadaEscolhida = piadas[Math.floor(Math.random() * piadas.length)];
                return this.ajustarPiadaPorPersonagem(piadaEscolhida, personagem);
            }
        }
        
        return null;
    }

    // NOVO: Verifica palavras-chave por categoria
    temPalavraChaveCategoria(textoLower, categoria) {
        const palavrasChave = {
            chuva: ['chuva', 'chove', 'chovendo', 'aguaceiro', 'temporal', 'garoa'],
            calor: ['calor', 'quente', 'sol', 'temperatura', 'abafado', 'sufoco'],
            transito: ['trânsito', 'congestionamento', 'engarrafamento', 'trânsito parado', 'constantino nery', 'torquato'],
            onibus: ['ônibus', 'coletivo', 'transporte público', 'lotado', 'cheio'],
            buracos: ['buraco', 'cratera', 'rua', 'asfalto', 'djalma batista', 'esburacado'],
            alagamento: ['alagamento', 'alagou', 'enchente', 'água na rua', 'inundação'],
            seguranca_compensa: ['compensa', 'violência', 'assalto', 'crime', 'segurança'],
            seguranca_zona_leste: ['zona leste', 'perigoso', 'violento', 'criminalidade'],
            ponta_negra: ['ponta negra', 'praia', 'boiando', 'lixo', 'rio negro'],
            parintins: ['parintins', 'boi', 'garantido', 'caprichoso', 'festival'],
            interior: ['presidente figueiredo', 'rio preto da eva', 'interior', 'cachoeira'],
            amazonia: ['amazônia', 'floresta', 'natureza', 'biodiversidade', 'pulmão do mundo']
        };
        
        const palavras = palavrasChave[categoria] || [];
        return palavras.some(palavra => textoLower.includes(palavra));
    }

    // NOVO: Ajusta piada conforme personalidade do personagem
    ajustarPiadaPorPersonagem(piada, personagem) {
        if (personagem.toLowerCase().includes('taina')) {
            // Tainá é mais animada e usa mais "oxe"
            return piada.replace(/Vichi/g, 'Oxe').replace(/Rapaz/g, 'Cabra danada');
        } else {
            // Iray é mais reflexivo e usa mais "vichi"
            return piada.replace(/Oxe/g, 'Vichi').replace(/Cabra danada/g, 'Rapaz');
        }
    }

    // NOVO: Gera interação sarcástica entre personagens
    gerarInteracaoSarcastica(contexto, personagem) {
        const interacoesSarcasticas = {
            concordancia: [
                "Ah tá, né? Como se fosse fácil assim...",
                "Claro, porque sempre funciona desse jeito em Manaus, né?",
                "Uhum, fala isso pra quem pega ônibus todo dia!",
                "É bem assim mesmo... quando não é o contrário!"
            ],
            discordancia: [
                "Eita, aí você forçou a amizade, né maninho?",
                "Oxe, será que a gente tá falando da mesma Manaus?",
                "Vichi, você deve morar em outra cidade!",
                "Rapaz, conta outra que essa eu não acredito!"
            ],
            ironia: [
                "Ah sim, porque tudo sempre dá certo aqui, né?",
                "Claro, igual aquele buraco da Djalma Batista que 'vão arrumar'!",
                "Uhum, tipo quando dizem que o ônibus vai chegar no horário!",
                "É, igual a promessa de asfaltar a cidade toda!"
            ]
        };
        
        const categoria = Math.random() > 0.6 ? 'concordancia' : 
                         Math.random() > 0.3 ? 'discordancia' : 'ironia';
        
        const frases = interacoesSarcasticas[categoria];
        return frases[Math.floor(Math.random() * frases.length)];
    }

    // NOVO: Detecta se é interação entre personagens
    ehInteracaoEntrePersonagens(texto) {
        const indicadoresInteracao = [
            'né', 'concordo', 'discordo', 'também acho', 'é isso mesmo',
            'não sei não', 'será?', 'pode ser', 'ih rapaz', 'eita',
            'é bem assim', 'pois é', 'exatamente', 'com certeza',
            'ah tá', 'claro', 'obvio', 'lógico'
        ];
        
        const textoLower = texto.toLowerCase();
        return indicadoresInteracao.some(indicador => textoLower.includes(indicador));
    }
}

module.exports = IntegracaoIA;