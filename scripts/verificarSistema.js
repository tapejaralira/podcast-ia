#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class VerificadorSistema {
    constructor() {
        this.erros = [];
        this.avisos = [];
        this.sucessos = [];
    }

    async verificarCompleto() {
        console.log('🔍 === VERIFICAÇÃO COMPLETA DO SISTEMA ===\n');

        try {
            // 1. Verificar arquivo principal
            this.verificarGerarRoteiro();
            
            // 2. Verificar dependências
            this.verificarDependencias();
            
            // 3. Verificar template
            this.verificarTemplate();
            
            // 4. Verificar arquivos de dados
            this.verificarArquivosDados();
            
            // 5. Relatório final
            this.gerarRelatorio();
            
        } catch (error) {
            console.error('❌ Erro na verificação:', error.message);
        }
    }

    verificarGerarRoteiro() {
        console.log('📝 Verificando gerarRoteiro.js...\n');
        
        try {
            const geradorPath = path.join(__dirname, '..', 'gerarRoteiro.js');
            const conteudo = fs.readFileSync(geradorPath, 'utf8');
            
            // Verificar se arquivo pode ser carregado
            try {
                delete require.cache[require.resolve(geradorPath)];
                const GeradorRoteiro = require(geradorPath);
                this.sucessos.push('✅ gerarRoteiro.js carrega sem erros de sintaxe');
                
                // Tentar instanciar
                const gerador = new GeradorRoteiro();
                this.sucessos.push('✅ GeradorRoteiro instancia corretamente');
                
                // Verificar métodos essenciais
                const metodosEssenciais = [
                    'gerarRoteiro',
                    'gerarGiriaTaina',
                    'gerarGiriaIrai',
                    'obterDataFormatada',
                    'gerarComentarioBoiTaina',
                    'gerarComentarioBoiIrai',
                    'gerarNoticia1',
                    'gerarNoticia2', 
                    'gerarNoticia3',
                    'gerarNoticiaEsporte',
                    'gerarEventoDestaque',
                    'gerarCuriosidadeRegional',
                    'obterComentarioOuvinte',
                    'gerarManchetePrincipal'
                ];
                
                metodosEssenciais.forEach(metodo => {
                    if (typeof gerador[metodo] === 'function') {
                        this.sucessos.push(`✅ Método ${metodo}() existe`);
                    } else {
                        this.erros.push(`❌ Método ${metodo}() não encontrado`);
                    }
                });
                
                // Verificar se métodos retornam valores válidos
                console.log('🧪 Testando métodos...');
                this.testarMetodos(gerador);
                
            } catch (instError) {
                this.erros.push(`❌ Erro ao instanciar GeradorRoteiro: ${instError.message}`);
            }
            
        } catch (loadError) {
            this.erros.push(`❌ Erro ao carregar gerarRoteiro.js: ${loadError.message}`);
        }
    }

    testarMetodos(gerador) {
        const metodosParaTestar = [
            'gerarGiriaTaina',
            'gerarGiriaIrai', 
            'obterDataFormatada',
            'gerarComentarioBoiTaina',
            'gerarEventoDestaque',
            'gerarCuriosidadeRegional',
            'gerarManchetePrincipal'
        ];

        metodosParaTestar.forEach(metodo => {
            try {
                const resultado = gerador[metodo]();
                if (resultado && resultado.length > 0) {
                    this.sucessos.push(`✅ ${metodo}() retorna: "${resultado.substring(0, 30)}..."`);
                } else {
                    this.avisos.push(`⚠️ ${metodo}() retorna valor vazio`);
                }
            } catch (error) {
                this.erros.push(`❌ Erro ao executar ${metodo}(): ${error.message}`);
            }
        });
    }

    verificarDependencias() {
        console.log('\n📦 Verificando dependências...\n');
        
        const dependencias = [
            'dialogosEspontaneos.js',
            'integracaoIA.js', 
            'gerenciadorEventos.js',
            'sistemaRevisao.js'
        ];

        dependencias.forEach(dep => {
            try {
                const depPath = path.join(__dirname, '..', dep);
                if (fs.existsSync(depPath)) {
                    // Tentar carregar
                    delete require.cache[require.resolve(depPath)];
                    require(depPath);
                    this.sucessos.push(`✅ ${dep} carrega corretamente`);
                } else {
                    this.erros.push(`❌ ${dep} não encontrado`);
                }
            } catch (error) {
                this.erros.push(`❌ Erro em ${dep}: ${error.message}`);
            }
        });
    }

    verificarTemplate() {
        console.log('\n📄 Verificando template...\n');
        
        try {
            const templatePath = path.join(__dirname, '..', 'templates', 'roteiro-template-novo.md');
            
            if (fs.existsSync(templatePath)) {
                const template = fs.readFileSync(templatePath, 'utf8');
                
                // Verificar variáveis no template
                const variaveisEncontradas = template.match(/\{\{[^}]+\}\}/g) || [];
                const variaveisUnicas = [...new Set(variaveisEncontradas)];
                
                this.sucessos.push(`✅ Template encontrado com ${variaveisUnicas.length} variáveis`);
                
                // Verificar se há variáveis problemáticas
                const variaveisProblematicas = variaveisUnicas.filter(v => 
                    v.includes('undefined') || 
                    v.includes('${') ||
                    v.length < 4
                );
                
                if (variaveisProblematicas.length > 0) {
                    this.erros.push(`❌ Variáveis problemáticas no template: ${variaveisProblematicas.join(', ')}`);
                } else {
                    this.sucessos.push('✅ Todas as variáveis do template estão bem formatadas');
                }
                
            } else {
                this.erros.push('❌ Template roteiro-template-novo.md não encontrado');
            }
            
        } catch (error) {
            this.erros.push(`❌ Erro ao verificar template: ${error.message}`);
        }
    }

    verificarArquivosDados() {
        console.log('\n📊 Verificando arquivos de dados...\n');
        
        const arquivosDados = [
            'data/personagens.json',
            'data/girias.json',
            'data/podcast-config.json'
        ];

        arquivosDados.forEach(arquivo => {
            try {
                const caminhoArquivo = path.join(__dirname, '..', arquivo);
                
                if (fs.existsSync(caminhoArquivo)) {
                    const conteudo = fs.readFileSync(caminhoArquivo, 'utf8');
                    JSON.parse(conteudo); // Verificar se é JSON válido
                    this.sucessos.push(`✅ ${arquivo} é um JSON válido`);
                } else {
                    this.avisos.push(`⚠️ ${arquivo} não encontrado (pode usar fallback)`);
                }
                
            } catch (error) {
                this.erros.push(`❌ Erro em ${arquivo}: ${error.message}`);
            }
        });
    }

    gerarRelatorio() {
        console.log('\n📋 === RELATÓRIO DE VERIFICAÇÃO ===\n');
        
        console.log(`✅ SUCESSOS (${this.sucessos.length}):`);
        this.sucessos.forEach(sucesso => console.log(`  ${sucesso}`));
        
        if (this.avisos.length > 0) {
            console.log(`\n⚠️ AVISOS (${this.avisos.length}):`);
            this.avisos.forEach(aviso => console.log(`  ${aviso}`));
        }
        
        if (this.erros.length > 0) {
            console.log(`\n❌ ERROS (${this.erros.length}):`);
            this.erros.forEach(erro => console.log(`  ${erro}`));
            console.log('\n🚨 CORREÇÕES NECESSÁRIAS ANTES DO TESTE!');
        } else {
            console.log('\n🎉 SISTEMA PRONTO PARA TESTE!');
            console.log('💡 Execute: npm run teste-episodio');
        }
        
        // Salvar relatório
        const relatorio = {
            timestamp: new Date().toISOString(),
            sucessos: this.sucessos,
            avisos: this.avisos,
            erros: this.erros,
            status: this.erros.length === 0 ? 'PRONTO' : 'PRECISA_CORRECAO'
        };
        
        const relatorioPath = path.join(__dirname, '..', 'verificacao-sistema.json');
        fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2));
        console.log(`\n📄 Relatório salvo em: verificacao-sistema.json`);
    }
}

// Executar verificação
const verificador = new VerificadorSistema();
verificador.verificarCompleto();