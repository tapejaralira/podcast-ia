const fs = require('fs');
const path = require('path');

class SistemaRevisao {
    constructor() {
        this.revisaoPath = path.join(__dirname, 'revisao');
        this.logPath = path.join(__dirname, 'logs');
        this.criarDiretorios();
        
        this.historico = this.carregarHistorico();
        this.configuracoes = this.carregarConfiguracoes();
    }

    criarDiretorios() {
        const diretorios = [
            this.revisaoPath,
            this.logPath,
            path.join(this.revisaoPath, 'originais'),
            path.join(this.revisaoPath, 'corrigidos'),
            path.join(this.revisaoPath, 'aprovados'),
            path.join(this.logPath, 'aprendizado')
        ];

        diretorios.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    carregarHistorico() {
        const historicoFile = path.join(this.logPath, 'historico-aprendizado.json');
        
        try {
            return JSON.parse(fs.readFileSync(historicoFile, 'utf8'));
        } catch (error) {
            const historicoInicial = {
                episodios_processados: 0,
                correcoes_por_categoria: {
                    girias: { total: 0, exemplos: [] },
                    tom: { total: 0, exemplos: [] },
                    referencias_locais: { total: 0, exemplos: [] },
                    transicoes: { total: 0, exemplos: [] },
                    interacoes: { total: 0, exemplos: [] },
                    estrutura: { total: 0, exemplos: [] }
                },
                evolucao_qualidade: [],
                padroes_aprendidos: [],
                ultima_atualizacao: new Date().toISOString()
            };

            fs.writeFileSync(historicoFile, JSON.stringify(historicoInicial, null, 2));
            return historicoInicial;
        }
    }

    carregarConfiguracoes() {
        const configFile = path.join(__dirname, 'config', 'revisao-config.json');
        
        try {
            return JSON.parse(fs.readFileSync(configFile, 'utf8'));
        } catch (error) {
            const configPadrao = {
                modo_revisao: true,
                nivel_autonomia: 0, // 0-10 (0=sempre revisar, 10=totalmente autônomo)
                categorias_priorizadas: ['girias', 'referencias_locais', 'tom'],
                alertas_ativados: true,
                backup_automatico: true,
                comparacao_detalhada: true
            };

            fs.writeFileSync(configFile, JSON.stringify(configPadrao, null, 2));
            return configPadrao;
        }
    }

    // FASE 1: Gerar versão para revisão
    gerarVersaoRevisao(roteiro, metadados = {}) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const nomeArquivo = `episodio_${timestamp}`;
        
        // Salvar original
        const arquivoOriginal = path.join(this.revisaoPath, 'originais', `${nomeArquivo}_original.md`);
        const roteiroComMetadados = this.adicionarMetadadosRevisao(roteiro, metadados);
        
        fs.writeFileSync(arquivoOriginal, roteiroComMetadados);

        // Criar template para correção
        const arquivoCorrecao = path.join(this.revisaoPath, 'corrigidos', `${nomeArquivo}_corrigido.md`);
        const templateCorrecao = this.gerarTemplateCorrecao(roteiroComMetadados);
        
        fs.writeFileSync(arquivoCorrecao, templateCorrecao);

        // Criar arquivo de análise
        const arquivoAnalise = path.join(this.revisaoPath, `${nomeArquivo}_analise.json`);
        const analiseInicial = this.gerarAnaliseInicial(roteiro);
        
        fs.writeFileSync(arquivoAnalise, JSON.stringify(analiseInicial, null, 2));

        console.log('📝 === ROTEIRO PRONTO PARA REVISÃO ===');
        console.log(`📄 Original: ${arquivoOriginal}`);
        console.log(`✏️ Para editar: ${arquivoCorrecao}`);
        console.log(`📊 Análise: ${arquivoAnalise}`);
        console.log('\n🔍 INSTRUÇÕES:');
        console.log('1. Edite o arquivo *_corrigido.md com suas correções');
        console.log('2. Execute: npm run processar-correcao [nome-arquivo]');
        console.log('3. O sistema aprenderá com suas mudanças!');

        return {
            original: arquivoOriginal,
            correcao: arquivoCorrecao,
            analise: arquivoAnalise,
            nome: nomeArquivo
        };
    }

    adicionarMetadadosRevisao(roteiro, metadados) {
        const header = `<!-- METADADOS DE REVISÃO -->
<!-- Data: ${new Date().toLocaleString('pt-BR')} -->
<!-- Episódio: ${this.historico.episodios_processados + 1} -->
<!-- Nível autonomia atual: ${this.configuracoes.nivel_autonomia}/10 -->
<!-- Necessita revisão: ${this.configuracoes.nivel_autonomia < 8 ? 'SIM' : 'NÃO'} -->

<!-- ÁREAS DE ATENÇÃO: -->
${this.gerarAreasAtencao()}

<!-- ================== ROTEIRO ================== -->

`;
        return header + roteiro;
    }

    gerarAreasAtencao() {
        const areas = [];
        
        if (this.historico.correcoes_por_categoria.girias.total > 3) {
            areas.push('<!-- ⚠️ GÍRIAS: Historicamente precisa ajustes -->');
        }
        
        if (this.historico.correcoes_por_categoria.referencias_locais.total > 2) {
            areas.push('<!-- ⚠️ REFERÊNCIAS LOCAIS: Verificar autenticidade -->');
        }
        
        if (this.configuracoes.nivel_autonomia < 5) {
            areas.push('<!-- ⚠️ REVISÃO COMPLETA: Sistema ainda aprendendo -->');
        }

        return areas.join('\n');
    }

    gerarTemplateCorrecao(roteiro) {
        return `<!-- =============================================== -->
<!-- ARQUIVO PARA SUAS CORREÇÕES - BUBUIA NEWS -->
<!-- =============================================== -->
<!-- 
INSTRUÇÕES PARA CORREÇÃO:

1. 📝 EDITE O TEXTO ABAIXO conforme necessário
2. 🏷️ MARQUE SUAS CORREÇÕES usando os comentários:
   <!-- CORRIGIDO: [categoria] - [explicação] -->
   
3. 📚 CATEGORIAS DISPONÍVEIS:
   - girias: Ajustes em gírias e expressões
   - tom: Mudanças no tom de voz/emoção
   - referencias_locais: Correções em referências de Manaus/Amazonas
   - transicoes: Melhorias nas transições entre blocos
   - interacoes: Ajustes nos diálogos entre personagens
   - estrutura: Mudanças na estrutura do roteiro
   - noticias: Ajustes no conteúdo das notícias
   - outros: Outras correções

4. 💡 EXEMPLO DE MARCAÇÃO:
   Texto original: "Vichi, tá chovendo!"
   Texto corrigido: "Oxe, tá um aguaceiro danado!" <!-- CORRIGIDO: girias - Tainá usa mais "oxe" que "vichi" -->

5. ✅ SALVE E EXECUTE: npm run processar-correcao [nome-arquivo]
-->

${roteiro}

<!-- =============================================== -->
<!-- FEEDBACK OPCIONAL: -->
<!-- 
Deixe comentários aqui sobre:
- O que funcionou bem
- O que precisa melhorar
- Sugestões para próximos episódios
-->

<!-- QUALIDADE GERAL (0-10): -->
<!-- PONTOS FORTES: -->
<!-- PONTOS FRACOS: -->
`;
    }

    gerarAnaliseInicial(roteiro) {
        return {
            timestamp: new Date().toISOString(),
            episodio_numero: this.historico.episodios_processados + 1,
            metricas_automaticas: {
                palavras_total: roteiro.split(' ').length,
                girias_detectadas: this.contarGirias(roteiro),
                referencias_locais: this.contarReferenciasLocais(roteiro),
                interacoes_entre_personagens: this.contarInteracoes(roteiro),
                blocos_detectados: this.contarBlocos(roteiro)
            },
            pontos_verificacao: {
                introducao_consistente: roteiro.includes('Fala, maninho! Tá começando mais um'),
                slogan_presente: roteiro.includes('notícia quente direto do igarapé'),
                interacao_espontanea: roteiro.includes('INTERAÇÃO ESPONTÂNEA'),
                referencias_manaus: this.temReferenciasManaus(roteiro),
                tom_adequado: this.verificarTom(roteiro)
            },
            alertas_automaticos: this.gerarAlertas(roteiro),
            sugestoes_melhoria: this.gerarSugestoes(roteiro)
        };
    }

    // FASE 2: Processar correções e aprender
    processarCorrecoes(nomeArquivo) {
        console.log(`🔍 Processando correções do episódio: ${nomeArquivo}`);
        
        const arquivoOriginal = path.join(this.revisaoPath, 'originais', `${nomeArquivo}_original.md`);
        const arquivoCorrigido = path.join(this.revisaoPath, 'corrigidos', `${nomeArquivo}_corrigido.md`);
        
        if (!fs.existsSync(arquivoOriginal) || !fs.existsSync(arquivoCorrigido)) {
            throw new Error('Arquivos original ou corrigido não encontrados!');
        }

        const textoOriginal = fs.readFileSync(arquivoOriginal, 'utf8');
        const textoCorrigido = fs.readFileSync(arquivoCorrigido, 'utf8');

        // Analisar diferenças
        const diferencas = this.analisarDiferencas(textoOriginal, textoCorrigido);
        
        // Extrair padrões de aprendizado
        const padroes = this.extrairPadroes(diferencas);
        
        // Atualizar histórico
        this.atualizarHistorico(padroes);
        
        // Gerar relatório de aprendizado
        const relatorio = this.gerarRelatorioAprendizado(nomeArquivo, diferencas, padroes);
        
        // Salvar versão aprovada
        const arquivoAprovado = path.join(this.revisaoPath, 'aprovados', `${nomeArquivo}_final.md`);
        fs.writeFileSync(arquivoAprovado, textoCorrigido);

        // Atualizar nível de autonomia
        this.atualizarNivelAutonomia(padroes);

        console.log('✅ Correções processadas e padrões aprendidos!');
        console.log(`📊 Relatório: ${relatorio.arquivo}`);
        console.log(`🎯 Nível autonomia: ${this.configuracoes.nivel_autonomia}/10`);
        console.log(`📈 Episódios processados: ${this.historico.episodios_processados}`);

        return relatorio;
    }

    analisarDiferencas(original, corrigido) {
        const diferencas = [];
        const linhasOriginais = original.split('\n');
        const linhasCorrigidas = corrigido.split('\n');

        // Buscar comentários de correção
        const comentariosCorrecao = corrigido.match(/<!-- CORRIGIDO:.*?-->/g) || [];
        
        comentariosCorrecao.forEach(comentario => {
            const match = comentario.match(/<!-- CORRIGIDO:\s*(\w+)\s*-\s*(.*?)\s*-->/);
            if (match) {
                diferencas.push({
                    categoria: match[1],
                    explicacao: match[2],
                    comentario_completo: comentario
                });
            }
        });

        // Buscar mudanças textuais (simplificado)
        const mudancasTextuais = this.compararTextos(original, corrigido);
        
        return {
            comentarios_marcados: diferencas,
            mudancas_textuais: mudancasTextuais,
            total_correcoes: diferencas.length
        };
    }

    compararTextos(original, corrigido) {
        // Implementação simplificada - em produção usar lib como 'diff'
        const palavrasOriginais = original.split(/\s+/);
        const palavrasCorrigidas = corrigido.split(/\s+/);
        
        const mudancas = [];
        
        // Comparação básica de comprimento e palavras-chave
        if (palavrasOriginais.length !== palavrasCorrigidas.length) {
            mudancas.push({
                tipo: 'estrutura',
                detalhes: `Mudança no tamanho: ${palavrasOriginais.length} → ${palavrasCorrigidas.length} palavras`
            });
        }

        return mudancas;
    }

    extrairPadroes(diferencas) {
        const padroes = {
            categorias_corrigidas: {},
            padroes_identificados: [],
            nivel_correcoes: 'baixo' // baixo, medio, alto
        };

        // Contar correções por categoria
        diferencas.comentarios_marcados.forEach(correcao => {
            if (!padroes.categorias_corrigidas[correcao.categoria]) {
                padroes.categorias_corrigidas[correcao.categoria] = [];
            }
            padroes.categorias_corrigidas[correcao.categoria].push(correcao.explicacao);
        });

        // Determinar nível de correções
        const totalCorrecoes = diferencas.total_correcoes;
        if (totalCorrecoes <= 2) padroes.nivel_correcoes = 'baixo';
        else if (totalCorrecoes <= 5) padroes.nivel_correcoes = 'medio';
        else padroes.nivel_correcoes = 'alto';

        // Identificar padrões específicos
        Object.keys(padroes.categorias_corrigidas).forEach(categoria => {
            const correcoes = padroes.categorias_corrigidas[categoria];
            if (correcoes.length > 1) {
                padroes.padroes_identificados.push({
                    categoria,
                    frequencia: correcoes.length,
                    necessita_atencao: true
                });
            }
        });

        return padroes;
    }

    atualizarHistorico(padroes) {
        this.historico.episodios_processados++;
        
        // Atualizar contadores por categoria
        Object.keys(padroes.categorias_corrigidas).forEach(categoria => {
            if (!this.historico.correcoes_por_categoria[categoria]) {
                this.historico.correcoes_por_categoria[categoria] = { total: 0, exemplos: [] };
            }
            
            const correcoes = padroes.categorias_corrigidas[categoria];
            this.historico.correcoes_por_categoria[categoria].total += correcoes.length;
            this.historico.correcoes_por_categoria[categoria].exemplos.push(...correcoes.slice(0, 3)); // Máximo 3 exemplos
        });

        // Adicionar à evolução
        this.historico.evolucao_qualidade.push({
            episodio: this.historico.episodios_processados,
            data: new Date().toISOString(),
            total_correcoes: Object.values(padroes.categorias_corrigidas).flat().length,
            nivel_qualidade: this.calcularNivelQualidade(padroes),
            categorias_afetadas: Object.keys(padroes.categorias_corrigidas)
        });

        // Salvar histórico atualizado
        const historicoFile = path.join(this.logPath, 'historico-aprendizado.json');
        this.historico.ultima_atualizacao = new Date().toISOString();
        fs.writeFileSync(historicoFile, JSON.stringify(this.historico, null, 2));
    }

    atualizarNivelAutonomia(padroes) {
        const nivelAtual = this.configuracoes.nivel_autonomia;
        let novoNivel = nivelAtual;

        // Lógica de evolução da autonomia
        const totalCorrecoes = Object.values(padroes.categorias_corrigidas).flat().length;
        
        if (totalCorrecoes <= 1) {
            novoNivel = Math.min(10, nivelAtual + 0.5); // Melhora gradual
        } else if (totalCorrecoes <= 3) {
            novoNivel = Math.min(10, nivelAtual + 0.2); // Melhora lenta
        } else if (totalCorrecoes > 5) {
            novoNivel = Math.max(0, nivelAtual - 0.3); // Regressão se muitas correções
        }

        this.configuracoes.nivel_autonomia = Math.round(novoNivel * 10) / 10; // 1 casa decimal
        
        // Salvar configurações
        const configFile = path.join(__dirname, 'config', 'revisao-config.json');
        fs.writeFileSync(configFile, JSON.stringify(this.configuracoes, null, 2));

        console.log(`📈 Nível autonomia: ${nivelAtual} → ${this.configuracoes.nivel_autonomia}`);
    }

    // Métodos auxiliares
    contarGirias(texto) {
        const girias = ['oxe', 'vichi', 'cabra danada', 'meu pai eterno', 'rapaz'];
        return girias.reduce((count, giria) => {
            return count + (texto.toLowerCase().match(new RegExp(giria, 'g')) || []).length;
        }, 0);
    }

    contarReferenciasLocais(texto) {
        const referencias = ['manaus', 'constantino nery', 'ponta negra', 'djalma batista', 'parintins'];
        return referencias.reduce((count, ref) => {
            return count + (texto.toLowerCase().match(new RegExp(ref, 'g')) || []).length;
        }, 0);
    }

    contarInteracoes(texto) {
        return (texto.match(/\*\*Tainá:\*\*|\*\*Iray:\*\*/g) || []).length;
    }

    contarBlocos(texto) {
        return (texto.match(/##\s+/g) || []).length;
    }

    temReferenciasManaus(texto) {
        return texto.toLowerCase().includes('manaus') || 
               texto.toLowerCase().includes('amazonas') ||
               texto.toLowerCase().includes('ponta negra');
    }

    verificarTom(texto) {
        // Verificação básica se tem gírias e tom regional
        return this.contarGirias(texto) > 5 && this.temReferenciasManaus(texto);
    }

    gerarAlertas(roteiro) {
        const alertas = [];
        
        if (this.contarGirias(roteiro) < 5) {
            alertas.push('⚠️ Poucas gírias regionais detectadas');
        }
        
        if (!roteiro.includes('BubuiA News')) {
            alertas.push('⚠️ Nome do podcast não mencionado');
        }
        
        if (this.contarInteracoes(roteiro) < 10) {
            alertas.push('⚠️ Poucas interações entre apresentadores');
        }

        return alertas;
    }

    gerarSugestoes(roteiro) {
        const sugestoes = [];
        
        if (this.contarReferenciasLocais(roteiro) < 3) {
            sugestoes.push('💡 Adicionar mais referências locais de Manaus');
        }
        
        if (!roteiro.includes('comenta aí')) {
            sugestoes.push('💡 Incluir chamada para interação com audiência');
        }

        return sugestoes;
    }

    calcularNivelQualidade(padroes) {
        const totalCorrecoes = Object.values(padroes.categorias_corrigidas).flat().length;
        
        if (totalCorrecoes === 0) return 10;
        if (totalCorrecoes <= 2) return 8;
        if (totalCorrecoes <= 5) return 6;
        return 4;
    }

    // FASE 3: Relatórios e estatísticas
    gerarRelatorioAprendizado(nomeArquivo, diferencas, padroes) {
        const relatorio = {
            episodio: nomeArquivo,
            data_processamento: new Date().toISOString(),
            resumo: {
                total_correcoes: diferencas.total_correcoes,
                nivel_correcoes: padroes.nivel_correcoes,
                qualidade_estimada: this.calcularNivelQualidade(padroes)
            },
            detalhes_correcoes: diferencas.comentarios_marcados,
            padroes_identificados: padroes.padroes_identificados,
            evolucao_autonomia: {
                nivel_anterior: this.configuracoes.nivel_autonomia,
                nivel_atual: this.configuracoes.nivel_autonomia,
                episodios_processados: this.historico.episodios_processados
            },
            proximos_passos: this.sugerirProximosPassos(padroes)
        };

        const arquivoRelatorio = path.join(this.logPath, 'aprendizado', `relatorio_${nomeArquivo}.json`);
        fs.writeFileSync(arquivoRelatorio, JSON.stringify(relatorio, null, 2));

        return { ...relatorio, arquivo: arquivoRelatorio };
    }

    sugerirProximosPassos(padroes) {
        const sugestoes = [];
        
        Object.keys(padroes.categorias_corrigidas).forEach(categoria => {
            const freq = padroes.categorias_corrigidas[categoria].length;
            if (freq > 2) {
                sugestoes.push(`Focar em melhorar: ${categoria} (${freq} correções)`);
            }
        });

        if (this.configuracoes.nivel_autonomia < 5) {
            sugestoes.push('Continuar revisões detalhadas - sistema ainda aprendendo');
        } else if (this.configuracoes.nivel_autonomia > 8) {
            sugestoes.push('Considerar reduzir frequência de revisões');
        }

        return sugestoes;
    }

    // Verificar se precisa revisão baseado no nível de autonomia
    precisaRevisao() {
        return this.configuracoes.nivel_autonomia < 8;
    }

    obterEstatisticas() {
        return {
            episodios_processados: this.historico.episodios_processados,
            nivel_autonomia: this.configuracoes.nivel_autonomia,
            total_correcoes: Object.values(this.historico.correcoes_por_categoria)
                .reduce((total, cat) => total + cat.total, 0),
            evolucao_recente: this.historico.evolucao_qualidade.slice(-5),
            areas_problematicas: this.identificarAreasProblematicas()
        };
    }

    identificarAreasProblematicas() {
        const areas = [];
        Object.keys(this.historico.correcoes_por_categoria).forEach(categoria => {
            const dados = this.historico.correcoes_por_categoria[categoria];
            if (dados.total > 5) {
                areas.push({
                    categoria,
                    total_correcoes: dados.total,
                    precisa_atencao: true
                });
            }
        });

        return areas.sort((a, b) => b.total_correcoes - a.total_correcoes);
    }
}

module.exports = SistemaRevisao;