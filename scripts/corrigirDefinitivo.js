#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function corrigirGerarRoteiro() {
    console.log('🔧 === CORRIGINDO GERARROTEIRO.JS ===\n');
    
    try {
        const geradorPath = path.join(__dirname, '..', 'gerarRoteiro.js');
        let conteudo = fs.readFileSync(geradorPath, 'utf8');
        
        // Remover implementações problemáticas se existirem
        if (conteudo.includes('// === IMPLEMENTAÇÕES DE TODAS AS VARIÁVEIS ===')) {
            console.log('🧹 Removendo implementações problemáticas...');
            const inicioImplementacoes = conteudo.indexOf('// === IMPLEMENTAÇÕES DE TODAS AS VARIÁVEIS ===');
            const fimImplementacoes = conteudo.indexOf('// === FIM DAS IMPLEMENTAÇÕES ===') + '// === FIM DAS IMPLEMENTAÇÕES ==='.length;
            
            if (inicioImplementacoes !== -1 && fimImplementacoes !== -1) {
                conteudo = conteudo.slice(0, inicioImplementacoes) + conteudo.slice(fimImplementacoes);
            }
        }
        
        // Encontrar o final da classe (antes do último })
        const ultimaChave = conteudo.lastIndexOf('}');
        const ultimaLinhaClasse = conteudo.lastIndexOf('\n', ultimaChave);
        
        // Implementações corretas
        const implementacoes = `
    // === IMPLEMENTAÇÕES DE TODAS AS VARIÁVEIS ===
    
    obterApresentador() {
        return Math.random() > 0.5 ? 'Tainá' : 'Iraí';
    }
    
    obterApresentadorPrincipal() {
        return 'Tainá';
    }
    
    obterApresentadorSecundario() {
        return 'Iraí';
    }

    gerarComentarioBoiTaina() {
        const comentarios = [
            "Garantido no coração sempre, né meu povo!",
            "Vermelho e branco é a nossa paixão!",
            "O sangue indígena pulsa forte no Festival!",
            "Parintins é magia pura, maninho!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }
    
    gerarComentarioBoiIrai() {
        const comentarios = [
            "Rapaz, os dois bois são impressionantes!",
            "Pois é, né? O Festival é patrimônio nosso!",
            "É massa ver toda essa cultura amazônica!",
            "Barbaridade, que espetáculo!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioIraiManchete() {
        const comentarios = [
            "Pois é, rapaz... a situação tá bem assim mesmo.",
            "É bem assim que acontece aqui em Manaus, né?",
            "Rapaz, isso aí é típico da nossa região.",
            "Caboco, essa história é interessante mesmo!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }
    
    gerarComentarioTaina() {
        const comentarios = [
            "Eita, meu povo! Que história essa!",
            "Né, pessoal? A gente sempre traz o que tá rolando!",
            "Massa demais essa notícia!",
            "Maninho, isso aí é importante de saber!"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioOuvinte() {
        const comentarios = [
            "'Adoro vocês!' - Maria, do Coroado",
            "'Melhor podcast de Manaus!' - João, da Compensa",
            "'BubuiA News sempre no meu coração!' - Ana, da Cidade Nova",
            "'Notícia quente direto do igarapé!' - Pedro, do Centro"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarComentarioRivalidade() {
        const rivalidades = [
            {
                taina: "Iraí, você tem que escolher um lado no Festival!",
                irai: "Rapaz, os dois bois são bonitos, né?"
            },
            {
                irai: "Essa Tainá não sossega com o Garantido!",
                taina: "Né que é! Vermelho e branco no coração!"
            }
        ];
        const escolhida = rivalidades[Math.floor(Math.random() * rivalidades.length)];
        return \`**Tainá:** \${escolhida.taina}\\n**Iraí:** \${escolhida.irai}\`;
    }

    gerarDespedidaConjunta() {
        const despedidas = [
            "**Tainá:** Valeu, meu povo!\\n**Iraí:** Até a próxima, pessoal!",
            "**Iraí:** Foi massa estar com vocês!\\n**Tainá:** BubuiA News sempre no ar!",
            "**Tainá:** Comenta aí da sua rede!\\n**Iraí:** E não esqueçam de compartilhar!"
        ];
        return despedidas[Math.floor(Math.random() * despedidas.length)];
    }
    
    gerarEncerramentoTaina() {
        const encerramentos = [
            "Eita, meu povo! Foi massa demais estar com vocês hoje!",
            "Né, pessoal? O BubuiA News tá sempre aqui pra vocês!",
            "Massa! Até o próximo episódio, maninho!"
        ];
        return encerramentos[Math.floor(Math.random() * encerramentos.length)];
    }
    
    gerarEncerramentoIrai() {
        const encerramentos = [
            "Pois é, né? Foi ótimo estar aqui com vocês hoje!",
            "Rapaz, sempre bom conversar com vocês!",
            "É bem assim mesmo, caboco! Até a próxima!"
        ];
        return encerramentos[Math.floor(Math.random() * encerramentos.length)];
    }

    gerarDialogoCultura() {
        const dialogos = [
            {
                taina: "A floresta ensina quem sabe escutar, né maninho?",
                irai: "É verdade! Essa sabedoria ancestral é impressionante."
            },
            {
                irai: "Conta aí sobre essas tradições de Parintins, Tai.",
                taina: "Eita! É muita história bonita do meu povo!"
            }
        ];
        const escolhido = dialogos[Math.floor(Math.random() * dialogos.length)];
        return \`**Tainá:** \${escolhido.taina}\\n**Iraí:** \${escolhido.irai}\`;
    }

    gerarNoticia1() {
        const noticias = [
            "Prefeitura anuncia obras na Constantino Nery para melhorar trânsito",
            "Teatro Amazonas recebe espetáculo regional neste fim de semana",
            "Mercado Municipal passa por revitalização em nova fase"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }
    
    gerarNoticia2() {
        const noticias = [
            "Festival de Parintins divulga programação oficial de 2025",
            "Feira de artesanato amazônico acontece na Ponta Negra",
            "Centro Cultural recebe exposição sobre cultura indígena"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }
    
    gerarNoticia3() {
        const noticias = [
            "Chuvas causam alagamentos pontuais na Zona Leste",
            "Inauguração de nova unidade de saúde na Compensa",
            "Projeto de preservação do Meeting das Águas ganha força"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }
    
    gerarNoticiaEsporte() {
        const noticias = [
            "Nacional prepara elenco para temporada 2025",
            "Fast Clube anuncia contratações para a Série D",
            "Campeonato Amazonense divulga tabela de jogos"
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    gerarEventoDestaque() {
        const eventos = [
            "Festival gastronômico na Ponta Negra",
            "Show regional no Largo de São Sebastião",
            "Feira de artesanato no Centro Histórico",
            "Apresentação cultural no Teatro Amazonas"
        ];
        return eventos[Math.floor(Math.random() * eventos.length)];
    }

    gerarCuriosidadeRegional() {
        const curiosidades = [
            "Você sabia que o Meeting das Águas pode ser visto do espaço?",
            "O Teatro Amazonas foi construído no auge da borracha!",
            "Parintins é conhecida mundialmente pelo Boi-Bumbá!",
            "Manaus é a porta de entrada para a maior floresta do mundo!"
        ];
        return curiosidades[Math.floor(Math.random() * curiosidades.length)];
    }

    obterListaGiriasTaina() {
        return "eita, né, meu povo, massa, danado, maninho, curumim";
    }
    
    obterListaGiriasIrai() {
        return "rapaz, pois é, né, caboco, massa, maninho, barbaridade";
    }

    gerarManchetePrincipal() {
        const manchetes = [
            "Obras na Constantino Nery prometem melhorar trânsito",
            "Festival de Parintins 2025 terá novidades especiais",
            "Teatro Amazonas completa mais um ano de história",
            "Mercado Municipal ganha cara nova com revitalização"
        ];
        return manchetes[Math.floor(Math.random() * manchetes.length)];
    }

    gerarRespostaTaina() {
        const respostas = [
            "Eita, né! É bem assim mesmo!",
            "Massa, Iraí! Concordo contigo!",
            "Né, meu povo? Exatamente isso!"
        ];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }
    
    gerarRespostaIrai() {
        const respostas = [
            "Pois é, Tai! É exatamente assim!",
            "Rapaz, você falou tudo!",
            "É bem assim mesmo, né?"
        ];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }

    obterDuracao() {
        return "15-20 minutos";
    }
    
    obterTimestamp() {
        return new Date().toISOString();
    }
    
    obterTemasPrincipais() {
        return "Notícias locais, cultura amazônica, eventos regionais";
    }
    
    obterTimeFoco() {
        return Math.random() > 0.5 ? "Garantido" : "Caprichoso";
    }

    obterEfeitosSonoros() {
        return "Som ambiente de floresta, vinhetas regionais";
    }
    
    obterObservacoesTecnicas() {
        return "Pausas naturais, variação de velocidade por personagem, ênfase em gírias regionais";
    }

    // === FIM DAS IMPLEMENTAÇÕES ===
`;

        // Inserir no local correto
        const novoConteudo = conteudo.slice(0, ultimaLinhaClasse) + 
                            implementacoes + 
                            conteudo.slice(ultimaLinhaClasse);
        
        // Salvar arquivo corrigido
        fs.writeFileSync(geradorPath, novoConteudo);
        
        console.log('✅ Arquivo gerarRoteiro.js corrigido com sucesso!');
        console.log('📊 30 métodos implementados corretamente');
        console.log('🎯 Agora execute: npm run teste-episodio');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir:', error.message);
        process.exit(1);
    }
}

// Executar correção
corrigirGerarRoteiro();