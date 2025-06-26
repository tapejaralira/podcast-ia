#!/usr/bin/env node

const { IntegradorElevenLabs } = require('../integradorElevenLabs');
const GeradorRoteiro = require('../gerarRoteiro');
const fs = require('fs');
const path = require('path');

async function gerarEpisodioComAudioReal() {
    console.log('🎙️ === BUBUIA NEWS - EPISÓDIO COM ÁUDIO REAL ===\n');

    try {
        // 1. Inicializar sistemas
        const gerador = new GeradorRoteiro();
        const elevenlabs = new IntegradorElevenLabs();
        
        console.log('🔧 Inicializando sistemas...');
        await gerador.inicializarSistemasContextuais();
        
        // 2. Testar ElevenLabs primeiro
        console.log('\n🗣️ Testando conexão com ElevenLabs...');
        const elevenLabsFunciona = await elevenlabs.testarConexao();
        
        if (!elevenLabsFunciona) {
            console.log('⚠️ ElevenLabs não disponível, usando simulação');
        }
        
        // 3. Gerar roteiro contextual
        console.log('\n📝 Gerando roteiro contextual...');
        const roteiroData = await gerador.gerarRoteiroContextual();
        
        console.log(`✅ Roteiro gerado: ${roteiroData.texto.length} caracteres`);
        console.log(`🎯 Contextos utilizados: ${roteiroData.metadados.contextos_utilizados.join(', ')}`);
        
        // 4. Gerar áudio com ElevenLabs
        console.log('\n🎵 Gerando áudio com ElevenLabs...');
        const audioData = await elevenlabs.gerarEpisodioComAudio(roteiroData.texto);

        // 5. Mixar áudios individuais em um único arquivo MP3
        const MixadorAutomatico = require('../mixadorAutomatico');
        const mixador = new MixadorAutomatico();
        let arquivoMixado = null;
        try {
            arquivoMixado = await mixador.mixarAudios(audioData.segmentos, {
                titulo: roteiroData.metadados?.titulo || 'BubuiA News',
                episodio: roteiroData.metadados?.episodio || '',
                ...roteiroData.metadados
            });
            console.log(`\n✅ Áudio final mixado: ${arquivoMixado}`);
        } catch (mixErr) {
            console.log('⚠️ Não foi possível mixar automaticamente os áudios:', mixErr.message);
        }

        // 6. Processar resultados
        const episodioCompleto = {
            roteiro: roteiroData,
            audio: audioData,
            arquivoMixado,
            metadados: {
                timestamp: new Date().toISOString(),
                episodio: gerador.obterNumeroEpisodio(),
                duracao: audioData.duracao_total,
                servico_audio: audioData.servico,
                arquivos_reais: audioData.arquivos_gerados || 0
            }
        };
        
        // 7. Salvar episódio
        await salvarEpisodioCompleto(episodioCompleto);
        
        // 8. Relatório final
        exibirRelatorioFinal(episodioCompleto);
        
        return episodioCompleto;
        
    } catch (error) {
        console.error('❌ Erro na geração:', error.message);
        console.error('Stack:', error.stack);
    }
}

async function salvarEpisodioCompleto(episodio) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nomeArquivo = `episodio_${timestamp}.md`;
    const caminhoCompleto = path.join(__dirname, '..', 'episodios', nomeArquivo);
    
    // Garantir que o diretório existe
    const dirEpisodios = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dirEpisodios)) {
        fs.mkdirSync(dirEpisodios, { recursive: true });
    }
    
    const conteudoCompleto = gerarConteudoMarkdown(episodio);
    fs.writeFileSync(caminhoCompleto, conteudoCompleto);
    
    console.log(`\n📄 Episódio salvo: ${nomeArquivo}`);
    return caminhoCompleto;
}

function gerarConteudoMarkdown(episodio) {
    const audio = episodio.audio;
    const metadados = episodio.metadados;
    
    return `# 🎙️ BubuiA News - Episódio #${metadados.episodio}

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Duração:** ${metadados.duracao}  
**Serviço de Áudio:** ${metadados.servico_audio}  
**Arquivos de Áudio:** ${metadados.arquivos_reais} gerados

---

## 📝 ROTEIRO

${episodio.roteiro.texto}

---

## 🎵 DETALHES DO ÁUDIO

### Configuração Técnica:
- **Serviço:** ${audio.servico}
- **Segmentos:** ${audio.segmentos.length}
- **Duração Total:** ${audio.duracao_total}
- **Arquivos Reais:** ${audio.arquivos_gerados || 0}/${audio.segmentos.length}

### Segmentos de Áudio:
${audio.segmentos.map((seg, i) => `
**${i + 1}. ${seg.personagem}** (${seg.duracao}s)
- Texto: "${seg.texto}"
- Arquivo: ${seg.arquivo}
- Status: ${seg.existe ? '✅ Real' : '🔄 Simulado'}
`).join('')}

---

## 📊 ANÁLISE CONTEXTUAL

### Contextos Utilizados:
${episodio.roteiro.metadados.contextos_utilizados.map(ctx => `- ${ctx}`).join('\n')}

### Reações Geradas:
${episodio.roteiro.contextos.map(c => 
    `**${c.noticia.substring(0, 50)}...**
- Contexto: ${c.contexto}
- Reações: ${c.reacoes?.length || 0}
${c.reacoes?.map(r => `  - ${r.personagem}: "${r.comentario}"`).join('\n') || '  - Nenhuma reação'}`
).join('\n\n')}

---

## 🔧 METADADOS TÉCNICOS

**Timestamp:** ${metadados.timestamp}  
**Modo:** ${process.env.MODO_OPERACAO || 'desenvolvimento'}  
**APIs Utilizadas:**
- TTS: ${audio.servico}
- IA: ${process.env.OPENAI_API_KEY ? 'OpenAI' : 'Fallback'}
- Notícias: ${process.env.NEWSAPI_KEY ? 'NewsAPI' : 'RSS'}

**Qualidade do Áudio:**
- Taxa de Sucesso: ${Math.round((audio.arquivos_gerados || 0) / audio.segmentos.length * 100)}%
- Tipo: ${audio.servico === 'elevenlabs' ? 'Profissional (ElevenLabs)' : 'Simulado'}

---

_Gerado automaticamente pelo BubuiA News AI System_
`;
}

function exibirRelatorioFinal(episodio) {
    const audio = episodio.audio;
    const metadados = episodio.metadados;
    
    console.log('\n🎉 === EPISÓDIO GERADO COM SUCESSO! ===\n');
    
    console.log(`📊 **Episódio #${metadados.episodio}**`);
    console.log(`⏱️ **Duração:** ${metadados.duracao}`);
    console.log(`🎵 **Serviço:** ${metadados.servico_audio}`);
    
    if (audio.servico === 'elevenlabs') {
        console.log(`✅ **Áudio Real:** ${audio.arquivos_gerados}/${audio.segmentos.length} arquivos`);
        console.log(`📈 **Taxa de Sucesso:** ${Math.round((audio.arquivos_gerados || 0) / audio.segmentos.length * 100)}%`);
    } else {
        console.log(`🔄 **Áudio Simulado:** ${audio.segmentos.length} segmentos`);
    }
    
    console.log(`\n🎭 **Estatísticas dos Apresentadores:**`);
    const tainaSegmentos = audio.segmentos.filter(s => s.personagem === 'taina').length;
    const iraiSegmentos = audio.segmentos.filter(s => s.personagem === 'irai').length;
    console.log(`👩 Tainá: ${tainaSegmentos} falas`);
    console.log(`👨 Iraí: ${iraiSegmentos} falas`);
    
    console.log(`\n🎯 **Contextos Detectados:**`);
    episodio.roteiro.metadados.contextos_utilizados.forEach(ctx => {
        console.log(`   - ${ctx}`);
    });
    
    console.log(`\n💬 **Reações Contextuais:**`);
    const totalReacoes = episodio.roteiro.contextos.reduce((total, c) => total + (c.reacoes?.length || 0), 0);
    console.log(`   Total: ${totalReacoes} reações geradas`);
    
    if (audio.servico === 'elevenlabs' && audio.arquivos_gerados > 0) {
        console.log('\n🎵 **Arquivos de Áudio Gerados:**');
        audio.segmentos.filter(s => s.existe).slice(0, 5).forEach((seg, i) => {
            console.log(`   ${i + 1}. ${path.basename(seg.arquivo)} (${seg.duracao}s)`);
        });
        if (audio.arquivos_gerados > 5) {
            console.log(`   ... e mais ${audio.arquivos_gerados - 5} arquivos`);
        }
    }
    
    console.log('\n🚀 **Próximos Passos:**');
    if (audio.servico === 'elevenlabs') {
        console.log('   🎵 Mixar arquivos de áudio individuais');
        console.log('   📤 Publicar episódio completo');
        console.log('   📱 Compartilhar nas redes sociais');
    } else {
        console.log('   🔧 Configure ElevenLabs para áudio real');
        console.log('   🧠 Configure OpenAI para comentários únicos');
        console.log('   📰 Configure NewsAPI para mais notícias');
    }
    
    console.log('\n🎙️ **BubuiA News - Episódio pronto!** 📻✨');
}

// Executar se for chamado diretamente
if (require.main === module) {
    gerarEpisodioComAudioReal().catch(console.error);
}

module.exports = { gerarEpisodioComAudioReal };