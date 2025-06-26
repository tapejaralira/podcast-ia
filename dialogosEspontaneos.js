const fs = require('fs');
const path = require('path');

class DialogosEspontaneos {
    constructor() {
        this.configuracoes = this.carregarConfiguracoes();
    }

    carregarConfiguracoes() {
        return {
            // Introdução oficial padronizada
            introducao_oficial: {
                taina_abertura: "Fala, maninho! Tá começando mais um *BubuiA News*...",
                iray_complemento: "...o podcast que te traz a notícia de dentro da rede!",
                taina_apresentacao: "Aqui quem fala é a Tai!",
                irai_apresentacao: "E eu sou o Iraí!",
                taina_convite: "Bora te contar o que rolou — e o que ainda vai dar o que falar — aqui no Amazonas e arredores."
            },

            // Interações espontâneas pós-introdução
            interacoes_pos_introducao: [
                // Perguntas aleatórias entre eles
                {
                    tipo: "pergunta_pessoal",
                    dialogos: [
                        {
                            taina: "Iraí, você tomou café hoje? Tá meio lerdo aí!",
                            irai: "Rapaz, Tai! Tomei sim, mas sabe como é... segunda-feira em Manaus né?"
                        },
                        {
                            irai: "Tai, você viu aquele temporal ontem?",
                            taina: "Eita, vi sim! Choveu que nem na enchente de 2012!"
                        },
                        {
                            taina: "Iraí, qual foi a última vez que você foi na Ponta Negra?",
                            irai: "Rapaz, faz tempo... da última vez que vi, tinha mais lixo que areia!"
                        },
                        {
                            irai: "Tai, você conseguiu passar na Constantino Nery hoje?",
                            taina: "Cabra danada, nem tentei! Deve estar um caos como sempre!"
                        }
                    ]
                },

                // Interação com audiência
                {
                    tipo: "audiencia",
                    dialogos: [
                        {
                            taina: "E aí, galera! Comenta aí nas redes sociais!",
                            irai: "Isso aí! Comenta aí da sua rede, maninho! Queremos saber o que vocês acham!"
                        },
                        {
                            irai: "Pessoal, mandem mensagem pra gente!",
                            taina: "É isso aí! Instagram, Facebook... onde vocês estiverem, comenta aí!"
                        },
                        {
                            taina: "Galera de Manaus, vocês que estão ouvindo...",
                            irai: "Manda um alô aí nos comentários! Queremos saber de que bairro vocês são!"
                        },
                        {
                            irai: "Quem tá ouvindo no busão levanta a mão!",
                            taina: "Né! Comenta aí da sua rede se você tá no trânsito ouvindo a gente!"
                        }
                    ]
                },

                // Brincadeiras com o editor
                {
                    tipo: "editor",
                    dialogos: [
                        {
                            taina: "Editor, você tá aí? Ou dormiu no ponto de novo?",
                            irai: "Deixa o coitado, Tai! Ele deve estar organizando as notícias... ou tomando açaí!"
                        },
                        {
                            irai: "Editor, bota uma trilha aí pra animar!",
                            taina: "É isso aí! Alguma coisa regional, né? Nada de sertanejo universitário!"
                        },
                        {
                            taina: "O editor hoje acordou inspirado, né Iray?",
                            irai: "Deve ter tomado guaraná de madrugada! Tá com energia!"
                        },
                        {
                            irai: "Editor, esqueceu de colocar a vinheta de novo?",
                            taina: "Rapaz, ele deve estar pensando no almoço já! Típico!"
                        }
                    ]
                },

                // Comentários aleatórios sobre Manaus
                {
                    tipo: "comentario_local",
                    dialogos: [
                        {
                            irai: "Tai, você viu como tá o tempo hoje?",
                            taina: "Rapaz, típico de Manaus né? De manhã sol, de tarde temporal!"
                        },
                        {
                            taina: "Iray, passou na Constantino Nery hoje?",
                            irai: "Passei não, mas já sei que tá engarrafada! Sempre tá!"
                        },
                        {
                            irai: "Tai, o que você acha desse calor?",
                            taina: "Rapaz, calor de derreter até o ferro do Teatro Amazonas!"
                        },
                        {
                            taina: "Iray, viu os buracos da Djalma Batista?",
                            irai: "Meu pai eterno, aquilo tá pior que cratera da lua!"
                        }
                    ]
                },

                // NOVO: Brincadeiras sobre Festival de Parintins
                {
                    tipo: "parintins",
                    dialogos: [
                        {
                            taina: "Eita, maninho! Já começou a preparação pro Festival!",
                            irai: "Bah, todo ano é a mesma empolgação... Garantido ou Caprichoso?"
                        },
                        {
                            taina: "Iraí, você precisa escolher um lado! Garantido no coração!",
                            irai: "Rapaz, os dois são bonitos... mas se é pra escolher..."
                        },
                        {
                            irai: "Explica aí essa paixão pelo Festival, Tai.",
                            taina: "O sangue indígena não deixa mentir! É tradição pura!"
                        },
                        {
                            taina: "Curumim, você perdeu muitos festivais morando no Sul!",
                            irai: "Pois é, né? Agora tenho que recuperar o tempo perdido!"
                        }
                    ]
                },

                // NOVO: Brincadeiras sobre ancestralidade indígena
                {
                    tipo: "ancestralidade_indigena",
                    dialogos: [
                        {
                            taina: "A floresta ensina quem sabe escutar, né maninho?",
                            irai: "É verdade! Essa sabedoria ancestral é impressionante."
                        },
                        {
                            taina: "Minha avó sempre dizia que as plantas falam com quem tem sangue da terra.",
                            irai: "Rapaz, que conhecimento profundo! Aprendo muito com você."
                        },
                        {
                            irai: "Tai, me ensina sobre essas tradições indígenas.",
                            taina: "Eita, é muito conhecimento! Vamos conversando aos poucos."
                        },
                        {
                            taina: "O sangue indígena corre nas veias, caboco!",
                            irai: "E a gente sente essa conexão especial que você tem com tudo isso."
                        }
                    ]
                },

                // NOVO: Brincadeiras sobre experiência Sul vs Norte
                {
                    tipo: "sul_norte",
                    dialogos: [
                        {
                            irai: "Bah, que saudade eu tinha desse calor de Manaus!",
                            taina: "Eita, o gaúcho tá falando! Mas aqui é que é bom mesmo!"
                        },
                        {
                            taina: "Conta aí como era o frio lá no Sul, Iraí.",
                            irai: "Barbaridade, Tai! Bem diferente desse nosso calor amazônico!"
                        },
                        {
                            irai: "Lá no Sul eles não entendem nosso jeito amazonense...",
                            taina: "Claro que não! Como vão entender quem nunca viu o Meeting das Águas?"
                        },
                        {
                            taina: "Tchê? Você tá em Manaus, caboco! Aqui é 'maninho'!",
                            irai: "Pois é, né? Três anos lá deixa marca mesmo!"
                        },
                        {
                            irai: "O Sul ensina, mas o Norte abraça!",
                            taina: "Agora sim você falou bonito! Bem-vindo de volta!"
                        }
                    ]
                }
            ],

            // Transições para o cardápio
            transicoes_cardapio: [
                {
                    taina: "Bom, chega de papo furado...",
                    irai: "É isso aí! Vamos ver o que temos no cardápio hoje!"
                },
                {
                    irai: "Falando em notícia...",
                    taina: "Bora ver o que rolou por aqui! Cardápio fresquinho!"
                },
                {
                    taina: "Agora sim, vamos ao que interessa!",
                    irai: "Cardápio do dia chegando aí, maninho!"
                },
                {
                    irai: "Chega de conversa fiada...",
                    taina: "Hora das notícias! Prepara o cafezinho que lá vamos nós!"
                }
            ]
        };
    }

    gerarIntroducaoCompleta() {
        const intro = this.configuracoes.introducao_oficial;
        
        let texto = `## 🎙️ INTRODUÇÃO OFICIAL\n\n`;
        texto += `**Tainá:** ${intro.taina_abertura}\n\n`;
        texto += `**Iray:** ${intro.iray_complemento}\n\n`;
        texto += `**Tainá:** ${intro.taina_apresentacao}\n\n`;
        texto += `**Iray:** ${intro.iray_apresentacao}\n\n`;
        texto += `**Tainá:** ${intro.taina_convite}\n\n`;

        return texto;
    }

    gerarInteracaoEspontanea() {
        const tipos = this.configuracoes.interacoes_pos_introducao;
        const tipoEscolhido = tipos[Math.floor(Math.random() * tipos.length)];
        const dialogoEscolhido = tipoEscolhido.dialogos[Math.floor(Math.random() * tipoEscolhido.dialogos.length)];

        let texto = `## 💬 INTERAÇÃO ESPONTÂNEA (${tipoEscolhido.tipo.toUpperCase()})\n\n`;
        
        if (dialogoEscolhido.taina && dialogoEscolhido.irai) {
            texto += `**Tainá:** ${dialogoEscolhido.taina}\n\n`;
            texto += `**Iray:** ${dialogoEscolhido.irai}\n\n`;
        } else if (dialogoEscolhido.irai && dialogoEscolhido.taina) {
            texto += `**Iray:** ${dialogoEscolhido.irai}\n\n`;
            texto += `**Tainá:** ${dialogoEscolhido.taina}\n\n`;
        }

        return { texto, tipo: tipoEscolhido.tipo };
    }

    gerarTransicaoCardapio() {
        const transicoes = this.configuracoes.transicoes_cardapio;
        const transicaoEscolhida = transicoes[Math.floor(Math.random() * transicoes.length)];

        let texto = `## 🔄 TRANSIÇÃO PARA CARDÁPIO\n\n`;
        texto += `**Tainá:** ${transicaoEscolhida.taina}\n\n`;
        texto += `**Iray:** ${transicaoEscolhida.irai}\n\n`;

        return texto;
    }

    // Gera configurações de TTS específicas para cada tipo de interação
    obterConfiguracaoTTS(tipo) {
        const configuracoes = {
            pergunta_pessoal: {
                taina: {
                    emocao: 'conversational',
                    intensidade: 'medium',
                    velocidade: '1.0',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'conversational',
                    intensidade: 'medium',
                    velocidade: '0.95',
                    pitch: 'medium'
                }
            },
            audiencia: {
                taina: {
                    emocao: 'excited',
                    intensidade: 'high',
                    velocidade: '1.1',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'excited',
                    intensidade: 'medium',
                    velocidade: '1.05',
                    pitch: 'medium'
                }
            },
            editor: {
                taina: {
                    emocao: 'conversational',
                    intensidade: 'high',
                    velocidade: '1.1',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'conversational',
                    intensidade: 'medium',
                    velocidade: '1.0',
                    pitch: 'medium'
                }
            },
            comentario_local: {
                taina: {
                    emocao: 'conversational',
                    intensidade: 'medium',
                    velocidade: '1.0',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'conversational',
                    intensidade: 'medium',
                    velocidade: '0.95',
                    pitch: 'medium'
                }
            },
            parintins: {
                taina: {
                    emocao: 'excited',
                    intensidade: 'high',
                    velocidade: '1.15',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'curious',
                    intensidade: 'medium',
                    velocidade: '0.95',
                    pitch: 'medium'
                }
            },
            ancestralidade_indigena: {
                taina: {
                    emocao: 'proud',
                    intensidade: 'medium',
                    velocidade: '1.0',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'respectful',
                    intensidade: 'medium',
                    velocidade: '0.9',
                    pitch: 'medium'
                }
            },
            sul_norte: {
                taina: {
                    emocao: 'playful',
                    intensidade: 'medium',
                    velocidade: '1.1',
                    pitch: 'medium'
                },
                irai: {
                    emocao: 'nostalgic',
                    intensidade: 'medium',
                    velocidade: '0.95',
                    pitch: 'medium'
                }
            }
        };

        return configuracoes[tipo] || configuracoes.pergunta_pessoal;
    }
}

module.exports = DialogosEspontaneos;