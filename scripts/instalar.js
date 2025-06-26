#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 === INSTALAÇÃO DO BUBUIA NEWS ===\n');

function instalarDependencias() {
    console.log('📦 Instalando dependências...');
    
    try {
        // Verificar se package.json tem as dependências corretas
        const packagePath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Adicionar dependências se não existirem
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        
        const dependenciasNecessarias = {
            "axios": "^1.6.0",
            "openai": "^4.0.0",
            "fluent-ffmpeg": "^2.1.2",
            "dotenv": "^16.3.1"
        };
        
        let precisaAtualizar = false;
        Object.keys(dependenciasNecessarias).forEach(dep => {
            if (!packageJson.dependencies[dep]) {
                packageJson.dependencies[dep] = dependenciasNecessarias[dep];
                precisaAtualizar = true;
            }
        });
        
        if (precisaAtualizar) {
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            console.log('✅ package.json atualizado');
        }
        
        // Instalar dependências
        console.log('⏳ Executando npm install...');
        execSync('npm install', { stdio: 'inherit', cwd: path.dirname(packagePath) });
        console.log('✅ Dependências instaladas!');
        
    } catch (error) {
        console.log('⚠️ Erro na instalação:', error.message);
        console.log('💡 Execute manualmente: npm install');
    }
}

function configurarAmbiente() {
    console.log('\n🔧 Configurando ambiente...');
    
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    if (!fs.existsSync(envPath)) {
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ Arquivo .env criado a partir do .env.example');
        } else {
            // Criar .env básico
            const envContent = `# BubuiA News - Configurações
OPENAI_API_KEY=sua_chave_openai_aqui
ELEVENLABS_API_KEY=sua_chave_elevenlabs_aqui
USE_FALLBACK=true
NODE_ENV=development
DEBUG_MODE=true
`;
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Arquivo .env criado');
        }
    } else {
        console.log('ℹ️ Arquivo .env já existe');
    }
}

function criarDiretorios() {
    console.log('\n📁 Criando estrutura de diretórios...');
    
    const diretorios = [
        'data',
        'audios',
        'temp_audio',
        'episodios',
        'testes',
        'revisao/originais',
        'revisao/corrigidos'
    ];
    
    diretorios.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Criado: ${dir}/`);
        }
    });
}

function verificarSistema() {
    console.log('\n🔍 Verificando sistema...');
    
    try {
        // Tentar carregar módulos principais
        const GeradorRoteiro = require('../gerarRoteiro');
        console.log('✅ GeradorRoteiro carregado');
        
        // Verificar se consegue instanciar
        const gerador = new GeradorRoteiro();
        console.log('✅ GeradorRoteiro instanciado');
        
        console.log('✅ Sistema funcionando!');
        
    } catch (error) {
        console.log('⚠️ Erro na verificação:', error.message);
        console.log('💡 Algumas funcionalidades podem não estar disponíveis');
    }
}

function mostrarProximosPassos() {
    console.log('\n🎯 === PRÓXIMOS PASSOS ===\n');
    
    console.log('1. 🔑 CONFIGURAR APIs (opcional):');
    console.log('   - Edite o arquivo .env');
    console.log('   - Adicione sua chave OpenAI (para IA avançada)');
    console.log('   - Adicione sua chave ElevenLabs (para síntese de voz)');
    console.log('   - URLs: https://platform.openai.com e https://elevenlabs.io\n');
    
    console.log('2. 🧪 TESTAR O SISTEMA:');
    console.log('   npm run verificar-sistema');
    console.log('   npm run teste-contextual\n');
    
    console.log('3. 🎙️ GERAR PRIMEIRO EPISÓDIO:');
    console.log('   npm run gerar-episodio-completo\n');
    
    console.log('4. 📺 MODO SIMPLES (funciona sem APIs):');
    console.log('   npm run teste-episodio\n');
    
    console.log('💡 O sistema funciona em modo fallback mesmo sem APIs!');
    console.log('🎉 BubuiA News pronto para usar!');
}

// Executar instalação
async function main() {
    try {
        instalarDependencias();
        configurarAmbiente();
        criarDiretorios();
        verificarSistema();
        mostrarProximosPassos();
        
    } catch (error) {
        console.error('❌ Erro na instalação:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;