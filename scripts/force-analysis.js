import { analisarNoticias } from '../dist/noticias/analisarNoticias.js';

console.log('🔥 Forçando execução da análise...');

analisarNoticias()
    .then(() => {
        console.log('✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erro:', error);
        process.exit(1);
    });
