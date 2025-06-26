#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');

async function testarSistemaCompleto() {
    console.log('🤖 === TESTE DO SISTEMA CONTEXTUAL COMPLETO ===\n');

    try {
        const gerador = new GeradorRoteiro();

        // 1. TESTE DE CLASSIFICAÇÃO DE CONTEXTOS
        console.log('🔍 Testando classificação de contextos...');
        
        const noticiasTest = [
            "Festival de Parintins 2025 terá 15 apresentações especiais",
            "Acidente na AM-010 deixa duas vítimas fatais",
            "Rua da Constantino Nery apresenta novos buracos após chuva",
            "Prefeitura anuncia obras na Zona Norte"
        ];

        for (let noticia of noticiasTest) {
            const processada = await gerador.processarNoticiaComContexto(noticia);
            console.log(`📰 "${noticia.substring(0, 40)}..."`);
            console.log(`🎯 Contexto: ${processada.contexto}`);
            console.log(`💬 Reações: ${processada.reacoes?.length || 0}`);
            if (processada.reacoes?.length > 0) {
                processada.reacoes.forEach(r => {
                    console.log(`   ${r.personagem}: "${r.comentario}"`);
                });
            }
            console.log('');
        }

        // 2. TESTE DE GERAÇÃO COMPLETA (MODO SIMULAÇÃO)
        console.log('🎙️ Testando geração de episódio completo (simulação)...');
        
        const episodioCompleto = await gerador.gerarEpisodioCompleto();
        
        console.log(`✅ Roteiro gerado: ${episodioCompleto.roteiro.texto.length} caracteres`);
        console.log(`🎵 Áudio simulado: ${episodioCompleto.audio.tipo}`);
        console.log(`⏱️ Duração estimada: ${episodioCompleto.audio.duracao_total}`);
        console.log(`📊 Contextos utilizados: ${episodioCompleto.roteiro.metadados.contextos_utilizados.join(', ')}`);
        
        // Mostrar detalhes da simulação
        if (episodioCompleto.audio.tipo === 'simulacao') {
            console.log(`🎭 Segmentos de áudio: ${episodioCompleto.audio.segmentos}`);
            console.log(`👩 Falas da Tainá: ${episodioCompleto.audio.personagens.taina}`);
            console.log(`👨 Falas do Iraí: ${episodioCompleto.audio.personagens.irai}`);
        }

        // 3. SALVAR RESULTADOS
        const fs = require('fs');
        const path = require('path');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultadosPath = path.join(__dirname, '..', 'testes', `teste_contextual_${timestamp}.json`);
        
        // Criar diretório se não existir
        const testesDir = path.dirname(resultadosPath);
        if (!fs.existsSync(testesDir)) {
            fs.mkdirSync(testesDir, { recursive: true });
        }
        
        fs.writeFileSync(resultadosPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            noticias_teste: noticiasTest.map((noticia, index) => ({
                noticia,
                contexto_detectado: 'teste_' + index
            })),
            episodio_completo: {
                duracao_estimada: episodioCompleto.audio.duracao_total || '15-20 min',
                contextos_utilizados: episodioCompleto.roteiro.metadados.contextos_utilizados,
                audio_simulado: episodioCompleto.audio.tipo === 'simulacao',
                segmentos_audio: episodioCompleto.audio.segmentos || 0,
                personagens: episodioCompleto.audio.personagens || {}
            },
            status: 'sucesso'
        }, null, 2));

        console.log(`📄 Resultados salvos em: ${resultadosPath}`);
        console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO!');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
    testarSistemaCompleto();
}

module.exports = testarSistemaCompleto;