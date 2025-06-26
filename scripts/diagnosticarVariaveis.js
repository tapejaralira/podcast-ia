const fs = require('fs');
const path = require('path');

class DiagnosticadorVariaveis {
    constructor() {
        this.templatesPath = path.join(__dirname, '..', 'templates');
        this.dataPath = path.join(__dirname, '..', 'data');
    }

    async diagnosticar() {
        console.log('🔍 === DIAGNÓSTICO DE VARIÁVEIS UNDEFINED ===\n');

        try {
            // 1. Ler template
            const templatePath = path.join(this.templatesPath, 'roteiro-template-novo.md');
            const template = fs.readFileSync(templatePath, 'utf8');

            // 2. Extrair todas as variáveis {{}}
            const variaveisEncontradas = template.match(/\{\{[^}]+\}\}/g) || [];
            const variaveisUnicas = [...new Set(variaveisEncontradas)]
                .map(v => v.replace(/\{\{|\}\}/g, ''))
                .sort();

            console.log('📋 VARIÁVEIS ENCONTRADAS NO TEMPLATE:');
            variaveisUnicas.forEach((v, i) => {
                console.log(`${i + 1}. {{${v}}}`);
            });

            // 3. Verificar quais estão implementadas
            console.log('\n🔍 VERIFICANDO IMPLEMENTAÇÃO:\n');

            const implementadas = [];
            const naoImplementadas = [];

            variaveisUnicas.forEach(variavel => {
                if (this.verificarImplementacao(variavel)) {
                    implementadas.push(variavel);
                    console.log(`✅ {{${variavel}}} - IMPLEMENTADA`);
                } else {
                    naoImplementadas.push(variavel);
                    console.log(`❌ {{${variavel}}} - NÃO IMPLEMENTADA`);
                }
            });

            // 4. Criar implementação das faltantes
            if (naoImplementadas.length > 0) {
                console.log('\n🛠️ CRIANDO IMPLEMENTAÇÕES FALTANTES:\n');
                this.criarImplementacoes(naoImplementadas);
            }

            console.log('\n📊 RESUMO:');
            console.log(`✅ Implementadas: ${implementadas.length}`);
            console.log(`❌ Faltando: ${naoImplementadas.length}`);
            console.log(`📋 Total: ${variaveisUnicas.length}`);

        } catch (error) {
            console.error('❌ Erro no diagnóstico:', error.message);
        }
    }

    verificarImplementacao(variavel) {
        // Lista de variáveis que sabemos que estão implementadas
        const implementadasConhecidas = [
            'DATA',
            'INTRODUCAO_COMPLETA',
            'INTERACAO_ESPONTANEA',
            'TRANSICAO_CARDAPIO',
            'GIRIA_TAINA',
            'GIRIA_IRAI',
            'TIPO_INTERACAO',
            'CONFIGURACAO_TTS'
        ];

        return implementadasConhecidas.includes(variavel);
    }

    criarImplementacoes(variaveis) {
        const implementacoes = {
            'MANCHETE_PRINCIPAL': () => this.gerarManchete(),
            'CLIMA_MANAUS': () => this.gerarClima(),
            'TRANSITO_MANAUS': () => this.gerarTransito(),
            'EVENTO_DESTAQUE': () => this.gerarEvento(),
            'DESCRICAO_EVENTO': () => this.gerarDescricaoEvento(),
            'COMENTARIO_OUVINTE': () => this.gerarComentarioOuvinte(),
            'PIADA_LOCAL': () => this.gerarPiadaLocal(),
            'CURIOSIDADE_REGIONAL': () => this.gerarCuriosidadeRegional()
        };

        // Salvar implementações em arquivo
        const implementacoesCode = this.gerarCodigoImplementacoes(variaveis, implementacoes);
        
        const outputPath = path.join(__dirname, 'variaveisImplementadas.js');
        fs.writeFileSync(outputPath, implementacoesCode);
        
        console.log(`📝 Implementações criadas em: ${outputPath}`);
    }

    gerarCodigoImplementacoes(variaveis, implementacoes) {
        let code = `// Implementações automáticas das variáveis faltantes\n\n`;
        code += `class VariaveisImplementadas {\n`;
        
        variaveis.forEach(variavel => {
            if (implementacoes[variavel]) {
                code += `\n    ${variavel}() {\n`;
                code += `        ${implementacoes[variavel].toString().split('{')[1].split('}')[0]}\n`;
                code += `    }\n`;
            } else {
                code += `\n    ${variavel}() {\n`;
                code += `        // TODO: Implementar ${variavel}\n`;
                code += `        return "VALOR_TEMPORARIO_${variavel}";\n`;
                code += `    }\n`;
            }
        });
        
        code += `}\n\nmodule.exports = VariaveisImplementadas;`;
        return code;
    }

    gerarManchete() {
        const manchetes = [
            "Prefeitura anuncia obras na Constantino Nery",
            "Festival de Parintins tem nova programação",
            "Chuvas causam alagamentos na Zona Leste",
            "Teatro Amazonas recebe nova peça regional",
            "Mercado Municipal passa por revitalização"
        ];
        return manchetes[Math.floor(Math.random() * manchetes.length)];
    }

    gerarClima() {
        const climas = [
            "Sol pela manhã, pancadas de chuva à tarde - típico de Manaus!",
            "Calor de 34°C com sensação térmica de 42°C - só na Amazônia mesmo!",
            "Chuva forte prevista para hoje - preparem os guarda-chuvas!",
            "Tempo seco e muito calor - hidratem-se, meu povo!"
        ];
        return climas[Math.floor(Math.random() * climas.length)];
    }

    gerarTransito() {
        const transitos = [
            "Constantino Nery com lentidão no sentido Centro - como sempre!",
            "Torquato Tapajós fluindo bem neste momento",
            "Djalma Batista com aqueles buracos de sempre",
            "Zona Leste complicada por conta da chuva"
        ];
        return transitos[Math.floor(Math.random() * transitos.length)];
    }

    gerarEvento() {
        const eventos = [
            "Apresentação cultural no Largo de São Sebastião",
            "Festival gastronômico na Ponta Negra",
            "Show regional no Teatro Amazonas",
            "Feira de artesanato no Centro"
        ];
        return eventos[Math.floor(Math.random() * eventos.length)];
    }

    gerarDescricaoEvento() {
        return "Evento vai contar com várias atrações regionais e entrada gratuita para toda família!";
    }

    gerarComentarioOuvinte() {
        const comentarios = [
            "'Adoro o BubuiA News!' - Maria, do Coroado",
            "'Melhor podcast de Manaus!' - João, da Compensa", 
            "'Vocês alegram meu dia!' - Ana, do Centro",
            "'Notícia boa direto do igarapé!' - Pedro, da Cidade Nova"
        ];
        return comentarios[Math.floor(Math.random() * comentarios.length)];
    }

    gerarPiadaLocal() {
        const piadas = [
            "Trânsito mais lento que boto subindo corredeira!",
            "Chuva que nem enchente de 2012!",
            "Calor de derreter até o ferro do Teatro Amazonas!",
            "Buraco na rua maior que piscina natural!"
        ];
        return piadas[Math.floor(Math.random() * piadas.length)];
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
}

// Executar diagnóstico
const diagnosticador = new DiagnosticadorVariaveis();
diagnosticador.diagnosticar();