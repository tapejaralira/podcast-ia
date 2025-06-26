#!/usr/bin/env node

const { GeradorFalasIA } = require('../geradorFalasIA');
const ClassificadorContextual = require('../classificadorContextualCorrigido');
const fs = require('fs');
const path = require('path');

async function gerarEpisodioComIA() {
    console.log('🧠 === BUBUIA NEWS - EPISÓDIO GERADO POR IA ===\n');
    
    try {
        // Verificar se OpenAI está configurada
        require('dotenv').config();
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sua_chave_openai_aqui') {
            console.log('⚠️ OpenAI não configurada. Execute: npm run adicionar-openai');
            return;
        }
        
        // Inicializar sistemas
        console.log('🔧 Inicializando sistemas de IA...');
        const geradorFalas = new GeradorFalasIA();
        const classificador = new ClassificadorContextual();
        
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
        
        // Buscar/simular notícias
        const noticias = await obterNoticias();
        console.log(`📰 Notícias selecionadas: ${noticias.length}`);
        
        // Classificar contextos das notícias
        console.log('\n🎯 Classificando contextos...');
        for (let noticia of noticias) {
            try {
                // Garantir que estamos passando um objeto com titulo
                const noticiaObj = typeof noticia === 'string' ? { titulo: noticia } : noticia;
                noticia.contexto = await classificador.classificarNoticia(noticiaObj);
                console.log(`   📌 "${noticia.titulo.substring(0, 40)}..." → ${noticia.contexto}`);
            } catch (error) {
                console.log(`   ⚠️ Erro ao classificar notícia, usando contexto geral: ${error.message}`);
                noticia.contexto = 'geral';
            }
        }
        
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
        
        // Análise de qualidade
        const qualidade = analisarQualidadeRoteiro(segmentos, noticias);
        console.log('\n🎯 === ANÁLISE DE QUALIDADE ===');
        console.log(`📊 Diversidade de falas: ${qualidade.diversidade}%`);
        console.log(`🎭 Personalidades distintas: ${qualidade.personalidades ? '✅' : '❌'}`);
        console.log(`📰 Notícias abordadas: ${qualidade.noticias_abordadas}/${noticias.length}`);
        
        console.log('\n🎉 === EPISÓDIO COM IA GERADO COM SUCESSO! ===');
        console.log('📄 Arquivo salvo com roteiro único e personalizado');
        console.log('🚀 Próximo passo: npm run gerar-audio-real');
        
        return {
            roteiro: roteiroIA,
            arquivo: caminhoArquivo,
            segmentos: segmentos,
            estatisticas: estatisticas,
            qualidade: qualidade
        };
        
    } catch (error) {
        console.error('❌ Erro na geração com IA:', error.message);
        console.log('💡 Dicas para resolver:');
        console.log('   1. Verifique sua chave OpenAI');
        console.log('   2. Teste: npm run testar-todas-apis');
        console.log('   3. Fallback: npm run gerar-episodio-completo');
        throw error;
    }
}

async function obterNoticias() {
    // Por enquanto usar notícias de exemplo
    // TODO: Integrar com RSS/NewsAPI em versão futura
    const noticiasExemplo = [
        {
            titulo: "Festival de Parintins 2025 terá 15 apresentações especiais com alegorias gigantes e novas coreografias",
            categoria: "cultura",
            fonte: "Portal do Holanda"
        },
        {
            titulo: "Buracos na Constantino Nery causam transtornos aos motoristas pela terceira vez consecutiva",
            categoria: "infraestrutura", 
            fonte: "A Crítica"
        },
        {
            titulo: "Nacional de Fast Clube contrata três jogadores para disputa da Série D do Brasileirão",
            categoria: "esporte",
            fonte: "Esporte Amazonas"
        },
        {
            titulo: "Centro Histórico de Manaus recebe projeto de revitalização urbana com investimento de R$ 50 milhões",
            categoria: "infraestrutura",
            fonte: "G1 Amazonas"
        },
        {
            titulo: "Artesãos indígenas do Alto Solimões ganham espaço em feira internacional de artesanato",
            categoria: "cultura",
            fonte: "Amazonas Atual"
        }
    ];
    
    // Embaralhar e pegar 4 notícias
    const noticiasShuffled = noticiasExemplo.sort(() => 0.5 - Math.random());
    return noticiasShuffled.slice(0, 4);
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
        equilibrio: Math.abs(tainaFalas - iraiFalas) <= 2 // Diferença máxima de 2 falas
    };
}

function analisarQualidadeRoteiro(segmentos, noticias) {
    // Calcular diversidade de vocabulário
    const todasPalavras = segmentos.map(s => s.texto.toLowerCase()).join(' ').split(' ');
    const palavrasUnicas = new Set(todasPalavras);
    const diversidade = Math.round((palavrasUnicas.size / todasPalavras.length) * 100);
    
    // Verificar personalidades distintas
    const falasTaina = segmentos.filter(s => s.personagem === 'taina');
    const falasIrai = segmentos.filter(s => s.personagem === 'irai');
    
    const vocabularioTaina = new Set(falasTaina.map(s => s.texto.toLowerCase()).join(' ').split(' '));
    const vocabularioIrai = new Set(falasIrai.map(s => s.texto.toLowerCase()).join(' ').split(' '));
    
    // Palavras características da Tainá
    const giriasTaina = ['eita', 'meu povo', 'maninho', 'garantido', 'rapaz'];
    const temGiriasTaina = giriasTaina.some(giria => 
        Array.from(vocabularioTaina).some(palavra => palavra.includes(giria))
    );
    
    // Verificar se notícias foram abordadas
    const roteiroTexto = segmentos.map(s => s.texto).join(' ').toLowerCase();
    const noticiasAbordadas = noticias.filter(noticia => {
        const palavrasChave = noticia.titulo.toLowerCase().split(' ').slice(0, 3);
        return palavrasChave.some(palavra => roteiroTexto.includes(palavra));
    }).length;
    
    return {
        diversidade,
        personalidades: temGiriasTaina && vocabularioTaina.size !== vocabularioIrai.size,
        noticias_abordadas: noticiasAbordadas
    };
}

// Executar se for chamado diretamente
if (require.main === module) {
    gerarEpisodioComIA().catch(console.error);
}

module.exports = { gerarEpisodioComIA };