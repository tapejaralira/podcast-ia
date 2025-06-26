#!/usr/bin/env node

const GeradorRoteiro = require('../gerarRoteiro');
const fs = require('fs');
const path = require('path');

async function gerarEpisodioCompleto() {
    console.log('🎙️ === BUBUIA NEWS - GERAÇÃO DE EPISÓDIO COMPLETO ===\n');

    try {
        const gerador = new GeradorRoteiro();

        console.log('🔧 Inicializando sistemas...');
        console.log('📅 Data:', gerador.obterDataFormatada());
        console.log('🎭 Apresentadores: Tainá (Parintins) + Iraí (Manaus)\n');

        // Gerar episódio completo com contextos
        const episodio = await gerador.gerarEpisodioCompleto();

        // Salvar roteiro
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const roteiroPath = path.join(__dirname, '..', 'episodios', `episodio_${timestamp}.md`);
        
        // Criar diretório se não existir
        const episodiosDir = path.dirname(roteiroPath);
        if (!fs.existsSync(episodiosDir)) {
            fs.mkdirSync(episodiosDir, { recursive: true });
        }

        // Formatar roteiro com metadados
        const nomeArquivoAudio = typeof episodio.audio === 'string' ? 
            path.basename(episodio.audio) : 
            episodio.audio.arquivo_simulado || 'episodio_simulado.mp3';

        const roteiroCompleto = `<!-- EPISÓDIO CONTEXTUAL AUTOMÁTICO -->
<!-- Data: ${new Date().toLocaleString('pt-BR')} -->
<!-- Contextos utilizados: ${episodio.roteiro.metadados.contextos_utilizados.join(', ')} -->
<!-- Áudio: ${nomeArquivoAudio} -->

${episodio.roteiro.texto}

---

## 📊 ANÁLISE TÉCNICA

**Contextos detectados:** ${episodio.roteiro.metadados.contextos_utilizados.length}
**Arquivo de áudio:** ${nomeArquivoAudio}
**Tipo de geração:** ${episodio.audio.tipo || 'real'}
**Timestamp:** ${episodio.timestamp}

### 🎯 Contextos por notícia:
${episodio.roteiro.contextos.map(c => 
    `- **${c.contexto}**: "${c.noticia.substring(0, 50)}..."`
).join('\n')}

### 💬 Reações geradas:
${episodio.roteiro.contextos.map(c => 
    c.reacoes?.length > 0 ? 
    `- **${c.noticia.substring(0, 30)}...**: ${c.reacoes.length} reação(ões)` : 
    `- **${c.noticia.substring(0, 30)}...**: Sem reações`
).join('\n')}

### 🎵 Simulação de áudio:
${episodio.audio.tipo === 'simulacao' ? `
- **Segmentos:** ${episodio.audio.segmentos}
- **Duração:** ${episodio.audio.duracao_total}
- **Falas Tainá:** ${episodio.audio.personagens.taina}
- **Falas Iraí:** ${episodio.audio.personagens.irai}
- **Blocos:** ${episodio.audio.blocos.join(', ')}
` : 'Áudio real gerado'}
`;

        fs.writeFileSync(roteiroPath, roteiroCompleto);

        // Relatório final
        console.log('✅ === EPISÓDIO GERADO COM SUCESSO! ===\n');
        console.log(`📄 Roteiro: ${roteiroPath}`);
        
        if (episodio.audio.tipo === 'simulacao') {
            console.log(`🎵 Áudio: Simulação (${episodio.audio.duracao_total})`);
            console.log(`📊 Segmentos: ${episodio.audio.segmentos}`);
            console.log(`👩 Tainá: ${episodio.audio.personagens.taina} falas | 👨 Iraí: ${episodio.audio.personagens.irai} falas`);
        } else {
            console.log(`🎵 Áudio: ${episodio.audio}`);
        }
        
        console.log(`📊 Contextos: ${episodio.roteiro.metadados.contextos_utilizados.length} diferentes`);
        console.log(`💬 Reações: ${episodio.roteiro.contextos.reduce((total, c) => total + (c.reacoes?.length || 0), 0)} geradas`);
        
        console.log('\n🎯 Contextos utilizados:');
        episodio.roteiro.metadados.contextos_utilizados.forEach(contexto => {
            console.log(`   - ${contexto}`);
        });

        console.log('\n🎉 BubuiA News pronto para o ar!');
        console.log('💡 Execute: npm run gerar-audio para criar o arquivo de áudio final');

        return episodio;

    } catch (error) {
        console.error('❌ Erro na geração:', error.message);
        console.error('📍 Stack:', error.stack);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    gerarEpisodioCompleto().catch(console.error);
}

module.exports = gerarEpisodioCompleto;