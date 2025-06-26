#!/usr/bin/env node

const { GeradorFalasIA } = require('../geradorFalasIA');
const fs = require('fs');
const path = require('path');

async function gerarEpisodioSemClassificador() {
    console.log('🧠 === BUBUIA NEWS - EPISÓDIO SIMPLIFICADO COM IA ===\n');
    
    try {
        // Verificar se OpenAI está configurada
        require('dotenv').config();
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sua_chave_openai_aqui') {
            console.log('⚠️ OpenAI não configurada. Execute: npm run adicionar-openai');
            return;
        }
        
        // Inicializar gerador de falas
        console.log('🔧 Inicializando gerador de falas...');
        const geradorFalas = new GeradorFalasIA();
        
        // Contexto do episódio
        const hoje = new Date();
        const contextoEpisodio = {
            episodio: Math.ceil((hoje - new Date(hoje.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 7)),
            data: hoje.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
        
        console.log(`📅 Episódio #${contextoEpisodio.episodio} - ${contextoEpisodio.data}`);
        
        // Notícias com contextos pré-definidos
        const noticias = [
            {
                titulo: "Festival de Parintins 2025 terá 15 apresentações especiais com alegorias gigantes",
                categoria: "cultura",
                contexto: "cultura_parintins",
                fonte: "Portal do Holanda"
            },
            {
                titulo: "Buracos na Constantino Nery causam transtornos aos motoristas pela terceira vez",
                categoria: "infraestrutura", 
                contexto: "infraestrutura_urbana",
                fonte: "A Crítica"
            },
            {
                titulo: "Nacional de Fast Clube contrata três jogadores para disputa da Série D",
                categoria: "esporte",
                contexto: "geral",
                fonte: "Esporte Amazonas"
            },
            {
                titulo: "Centro Histórico de Manaus recebe projeto de revitalização com R$ 50 milhões",
                categoria: "infraestrutura",
                contexto: "infraestrutura_urbana",
                fonte: "G1 Amazonas"
            }
        ];
        
        console.log(`📰 Notícias selecionadas: ${noticias.length}`);
        
        // Mostrar contextos
        console.log('\n🎯 Contextos das notícias:');
        noticias.forEach(noticia => {
            console.log(`   📌 "${noticia.titulo.substring(0, 40)}..." → ${noticia.contexto}`);
        });
        
        // Gerar roteiro com IA
        console.log('\n🧠 Gerando falas personalizadas com GPT-4...');
        console.log('   👩 Tainá: Parintinense expressiva, defensora do Garantido');
        console.log('   👨 Iraí: Manauara reflexivo, diplomático');
        
        const roteiroIA = await geradorFalas.gerarRoteiroCompleto(noticias, contextoEpisodio);
        
        // Salvar roteiro
        const timestamp = hoje.toISOString().split('T')[0];
        const nomeArquivo = `episodio_ia_${timestamp}_${contextoEpisodio.episodio}.md`;
        const caminhoArquivo = path.join(__dirname, '..', 'episodios', nomeArquivo);
        
        // Garantir que diretório existe
        const dirEpisodios = path.dirname(caminhoArquivo);
        if (!fs.existsSync(dirEpisodios)) {
            fs.mkdirSync(dirEpisodios, { recursive: true });
        }
        
        fs.writeFileSync(caminhoArquivo, roteiroIA);
        console.log(`\n✅ Roteiro salvo: ${path.basename(nomeArquivo)}`);
        
        // Análise do roteiro gerado
        const segmentos = extrairSegmentosDoRoteiro(roteiroIA);
        const estatisticas = analisarEstatisticas(segmentos);
        
        console.log('\n📊 === ANÁLISE DO ROTEIRO GERADO ===');
        console.log(`📝 Total de falas: ${segmentos.length}`);
        console.log(`👩 Tainá: ${estatisticas.taina} falas (${Math.round(estatisticas.taina/segmentos.length*100)}%)`);
        console.log(`👨 Iraí: ${estatisticas.irai} falas (${Math.round(estatisticas.irai/segmentos.length*100)}%)`);
        console.log(`⏱️ Duração estimada: ${Math.ceil(segmentos.length * 3.5)} segundos`);
        
        // Mostrar exemplo de falas geradas
        console.log('\n💬 === PRIMEIRAS FALAS GERADAS ===');
        segmentos.slice(0, 6).forEach((seg, i) => {
            const nome = seg.personagem === 'taina' ? '👩 Tainá' : '👨 Iraí';
            console.log(`${i+1}. ${nome}: "${seg.texto.substring(0, 45)}..."`);
        });
        
        console.log('\n🎉 === EPISÓDIO COM IA GERADO COM SUCESSO! ===');
        console.log('📄 Arquivo salvo com roteiro único e personalizado');
        console.log('🚀 Próximo passo: npm run gerar-audio-real');
        
        return {
            roteiro: roteiroIA,
            arquivo: caminhoArquivo,
            segmentos: segmentos,
            estatisticas: estatisticas
        };
        
    } catch (error) {
        console.error('❌ Erro na geração com IA:', error.message);
        console.log('💡 Tentando modo fallback...');
        return await gerarEpisodioFallback();
    }
}

async function gerarEpisodioFallback() {
    console.log('\n🔄 === MODO FALLBACK ATIVADO ===');
    console.log('Gerando episódio com sistema pré-definido...');
    
    // Usar sistema anterior se IA falhar
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec('npm run gerar-episodio-completo', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no fallback:', error.message);
                reject(error);
            } else {
                console.log('✅ Fallback executado com sucesso');
                resolve({ modo: 'fallback', stdout });
            }
        });
    });
}

function extrairSegmentosDoRoteiro(roteiro) {
    const segmentos = [];
    const linhas = roteiro.split('\n');
    
    linhas.forEach((linha, index) => {
        const match = linha.match(/^\*\*(Tainá|Iraí):\*\*\s*(.+)/);
        if (match) {
            segmentos.push({
                personagem: match[1].toLowerCase() === 'tainá' ? 'taina' : 'irai',
                texto: match[2].trim(),
                linha: index + 1
            });
        }
    });
    
    return segmentos;
}

function analisarEstatisticas(segmentos) {
    const tainaFalas = segmentos.filter(s => s.personagem === 'taina').length;
    const iraiFalas = segmentos.filter(s => s.personagem === 'irai').length;
    
    return {
        taina: tainaFalas,
        irai: iraiFalas,
        total: segmentos.length,
        equilibrio: Math.abs(tainaFalas - iraiFalas) <= 2
    };
}

// Executar se for chamado diretamente
if (require.main === module) {
    gerarEpisodioSemClassificador().catch(console.error);
}

module.exports = { gerarEpisodioSemClassificador };