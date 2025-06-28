/**
 * Script de migração automática da estrutura do projeto BubuiA News.
 * - Move arquivos para as pastas recomendadas.
 * - Atualiza requires/imports nos arquivos JS.
 * - Exibe relatório das mudanças.
 */

const fs = require('fs');
const path = require('path');

const PROJETO_ROOT = path.join(__dirname, '..');

const MOVIMENTACOES = [
    // [arquivo, nova pasta]
    ['gerarRoteiro.js', 'core'],
    ['integracaoIA.js', 'core'],
    ['dialogosEspontaneos.js', 'core'],
    ['sistemaRevisao.js', 'core'],
    ['classificadorContextual.js', 'core'],
    ['comentariosContextuais.js', 'core'],
    ['gerenciadorEventos.js', 'core'],
    ['mixadorAutomatico.js', 'core'],
    ['geradorFalasIA.js', 'core'],
    ['integradorElevenLabs.js', 'core'],
    ['integracaoIAExtendida.js', 'core']
];

// Criar diretórios necessários
const DIRETORIOS = ['core', 'data', 'config', 'scripts', 'templates', 'episodios', 'audios', 'temp_audio', 'revisao', 'docs', 'logs'];

function criarDiretorios() {
    console.log('📁 Criando diretórios...');
    DIRETORIOS.forEach(dir => {
        const caminho = path.join(PROJETO_ROOT, dir);
        if (!fs.existsSync(caminho)) {
            fs.mkdirSync(caminho, { recursive: true });
            console.log(`✅ Criado: ${dir}/`);
        }
    });
}

function moverArquivo(nomeArquivo, novaPasta) {
    const origem = path.join(PROJETO_ROOT, nomeArquivo);
    const destinoDir = path.join(PROJETO_ROOT, novaPasta);
    const destino = path.join(destinoDir, nomeArquivo);

    try {
        if (!fs.existsSync(origem)) {
            console.log(`⚠️ Arquivo não encontrado: ${nomeArquivo}`);
            return false;
        }

        if (!fs.existsSync(destinoDir)) {
            fs.mkdirSync(destinoDir, { recursive: true });
        }

        fs.renameSync(origem, destino);
        console.log(`✅ Movido: ${nomeArquivo} -> ${novaPasta}/`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao mover ${nomeArquivo}:`, error.message);
        return false;
    }
}

function atualizarRequiresEmArquivo(arquivo) {
    try {
        let conteudo = fs.readFileSync(arquivo, 'utf8');
        
        // Atualizar requires para a pasta core
        conteudo = conteudo.replace(
            /require\(['"]\.\/([\w-]+)['"]\)/g,
            (match, nome) => {
                const arquivoCore = MOVIMENTACOES.find(([arq]) => arq === `${nome}.js`);
                if (arquivoCore && arquivoCore[1] === 'core') {
                    return `require('../core/${nome}')`;
                }
                return match;
            }
        );

        fs.writeFileSync(arquivo, conteudo, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Erro ao atualizar requires em ${arquivo}:`, error.message);
        return false;
    }
}

function atualizarTodosRequires() {
    console.log('\n📝 Atualizando requires...');
    
    // Lista de diretórios para verificar
    const diretoriosParaVerificar = ['core', 'scripts'];
    
    diretoriosParaVerificar.forEach(dir => {
        const diretorio = path.join(PROJETO_ROOT, dir);
        if (fs.existsSync(diretorio)) {
            fs.readdirSync(diretorio)
                .filter(f => f.endsWith('.js'))
                .forEach(arquivo => {
                    const caminhoCompleto = path.join(diretorio, arquivo);
                    if (atualizarRequiresEmArquivo(caminhoCompleto)) {
                        console.log(`✅ Requires atualizados: ${dir}/${arquivo}`);
                    }
                });
        }
    });
}

function criarArquivosFaltantes() {
    const arquivosFaltantes = MOVIMENTACOES.map(([arquivo, pasta]) => ({
        arquivo,
        caminho: path.join(PROJETO_ROOT, pasta, arquivo)
    }));

    arquivosFaltantes.forEach(({arquivo, caminho}) => {
        if (!fs.existsSync(caminho)) {
            const template = `// ${arquivo}\n// Arquivo criado pela migração\nmodule.exports = class {};\n`;
            fs.writeFileSync(caminho, template, 'utf8');
            console.log(`✅ Criado arquivo: ${arquivo}`);
        }
    });
}

function main() {
    console.log('🚚 Iniciando migração da estrutura do projeto...\n');
    
    // 1. Criar diretórios
    criarDiretorios();
    
    // 2. Mover arquivos
    console.log('\n📦 Movendo arquivos...');
    let movidos = 0;
    MOVIMENTACOES.forEach(([arquivo, pasta]) => {
        if (moverArquivo(arquivo, pasta)) {
            movidos++;
        }
    });
    
    // 3. Criar arquivos faltantes
    criarArquivosFaltantes();
    
    // 4. Atualizar requires
    atualizarTodosRequires();
    
    console.log('\n🎉 Migração concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   - ${DIRETORIOS.length} diretórios verificados`);
    console.log(`   - ${movidos} arquivos movidos`);
    console.log('\n⭐ Próximos passos:');
    console.log('   1. Execute: node diagnosticoEstrutura.js');
    console.log('   2. Verifique se todos os arquivos estão nos lugares corretos');
    console.log('   3. Teste o sistema para garantir que tudo continua funcionando');
}

if (require.main === module) {
    main();
}
