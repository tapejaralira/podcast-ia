#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function instalarFFmpeg() {
    console.log('🎵 === INSTALAÇÃO AUTOMÁTICA DO FFMPEG ===\n');
    
    try {
        // 1. Verificar se já está instalado
        console.log('🔍 Verificando se FFmpeg já está instalado...');
        const jaInstalado = await verificarFFmpeg();
        
        if (jaInstalado) {
            console.log('✅ FFmpeg já está instalado e funcionando!');
            return true;
        }
        
        // 2. Detectar sistema operacional
        const plataforma = process.platform;
        console.log(`🖥️ Sistema detectado: ${plataforma}`);
        
        // 3. Instalar conforme a plataforma
        switch (plataforma) {
            case 'win32':
                await instalarFFmpegWindows();
                break;
            case 'darwin':
                await instalarFFmpegMac();
                break;
            case 'linux':
                await instalarFFmpegLinux();
                break;
            default:
                console.log('❌ Sistema operacional não suportado para instalação automática');
                mostrarInstrucoesManual();
                return false;
        }
        
        // 4. Verificar instalação
        console.log('\n🧪 Verificando instalação...');
        const sucesso = await verificarFFmpeg();
        
        if (sucesso) {
            console.log('🎉 FFmpeg instalado com sucesso!');
            console.log('✅ Sistema agora está 100% funcional');
            return true;
        } else {
            console.log('❌ Falha na instalação automática');
            mostrarInstrucoesManual();
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro na instalação:', error.message);
        mostrarInstrucoesManual();
        return false;
    }
}

async function verificarFFmpeg() {
    return new Promise((resolve) => {
        const ffmpeg = spawn('ffmpeg', ['-version']);
        
        ffmpeg.on('close', (code) => {
            resolve(code === 0);
        });
        
        ffmpeg.on('error', () => {
            resolve(false);
        });
        
        // Timeout de 5 segundos
        setTimeout(() => {
            ffmpeg.kill();
            resolve(false);
        }, 5000);
    });
}

async function instalarFFmpegWindows() {
    console.log('🔧 Instalando FFmpeg no Windows...');
    
    // Verificar se o Chocolatey está disponível
    const temChocolatey = await verificarComando('choco');
    
    if (temChocolatey) {
        console.log('📦 Usando Chocolatey para instalar FFmpeg...');
        await executarComando('choco install ffmpeg -y');
    } else {
        console.log('⚠️ Chocolatey não encontrado');
        console.log('📝 Instruções para instalação manual:');
        console.log('   1. Baixe FFmpeg de: https://ffmpeg.org/download.html#build-windows');
        console.log('   2. Extraia para C:\\ffmpeg');
        console.log('   3. Adicione C:\\ffmpeg\\bin ao PATH do sistema');
        console.log('   4. Reinicie o terminal');
        return false;
    }
}

async function instalarFFmpegMac() {
    console.log('🔧 Instalando FFmpeg no macOS...');
    
    // Verificar se o Homebrew está disponível
    const temHomebrew = await verificarComando('brew');
    
    if (temHomebrew) {
        console.log('🍺 Usando Homebrew para instalar FFmpeg...');
        await executarComando('brew install ffmpeg');
    } else {
        console.log('⚠️ Homebrew não encontrado');
        console.log('📝 Instale primeiro o Homebrew:');
        console.log('   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        return false;
    }
}

async function instalarFFmpegLinux() {
    console.log('🔧 Instalando FFmpeg no Linux...');
    
    // Tentar diferentes gerenciadores de pacote
    const gerenciadores = [
        { comando: 'apt-get', install: 'sudo apt-get update && sudo apt-get install -y ffmpeg' },
        { comando: 'yum', install: 'sudo yum install -y ffmpeg' },
        { comando: 'dnf', install: 'sudo dnf install -y ffmpeg' },
        { comando: 'pacman', install: 'sudo pacman -S ffmpeg' }
    ];
    
    for (let gerenciador of gerenciadores) {
        const disponivel = await verificarComando(gerenciador.comando);
        if (disponivel) {
            console.log(`📦 Usando ${gerenciador.comando} para instalar FFmpeg...`);
            await executarComando(gerenciador.install);
            return;
        }
    }
    
    console.log('❌ Nenhum gerenciador de pacotes conhecido encontrado');
    mostrarInstrucoesManual();
}

async function verificarComando(comando) {
    return new Promise((resolve) => {
        exec(`which ${comando}`, (error) => {
            resolve(!error);
        });
    });
}

async function executarComando(comando) {
    return new Promise((resolve, reject) => {
        console.log(`⚡ Executando: ${comando}`);
        
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Erro: ${error.message}`);
                reject(error);
            } else {
                console.log('✅ Comando executado com sucesso');
                if (stdout) console.log(stdout);
                resolve(stdout);
            }
        });
    });
}

function mostrarInstrucoesManual() {
    console.log('\n📋 === INSTALAÇÃO MANUAL DO FFMPEG ===');
    console.log('');
    console.log('🪟 **Windows:**');
    console.log('   1. Baixe: https://ffmpeg.org/download.html#build-windows');
    console.log('   2. Extraia para C:\\ffmpeg');
    console.log('   3. Adicione C:\\ffmpeg\\bin ao PATH');
    console.log('');
    console.log('🍎 **macOS:**');
    console.log('   brew install ffmpeg');
    console.log('');
    console.log('🐧 **Linux:**');
    console.log('   sudo apt install ffmpeg  # Ubuntu/Debian');
    console.log('   sudo yum install ffmpeg  # CentOS/RHEL');
    console.log('');
    console.log('💡 **Após instalar, execute:**');
    console.log('   npm run testar-todas-apis');
    console.log('');
    console.log('⚠️ **Nota:** FFmpeg não é obrigatório para geração de episódios');
    console.log('   O sistema funciona perfeitamente sem ele para áudio individual');
}

// Executar se for chamado diretamente
if (require.main === module) {
    instalarFFmpeg().then(sucesso => {
        if (sucesso) {
            console.log('\n🚀 Execute agora: npm run testar-todas-apis');
        } else {
            console.log('\n🎙️ Sistema funciona mesmo sem FFmpeg!');
            console.log('🚀 Execute: npm run gerar-audio-real');
        }
    }).catch(console.error);
}

module.exports = { instalarFFmpeg };