import { buscarNoticias } from './noticias/buscarNoticias.js';
import { analisarNoticias } from './noticias/analisarNoticias.js';
import { sugerirAbertura } from './roteiro/sugerirAbertura.js';
import { gerarRoteiro } from './roteiro/gerarRoteiro.js';
import { gerarAudiosDoRoteiro } from './producao/gerarAudio.js';
import { montarEpisodio } from './mixagem/montarEpisodio.js';

async function main() {
    console.log("🚀 Iniciando o pipeline de produção do Bubuia News...");

    try {
        console.log('\n[ETAPA 1/6] Buscando notícias...');
        await buscarNoticias();

        console.log('\n[ETAPA 2/6] Analisando e classificando notícias...');
        await analisarNoticias();

        console.log('\n[ETAPA 3/6] Gerando sugestão de abertura...');
        await sugerirAbertura();

        console.log('\n[ETAPA 4/6] Gerando roteiro do episódio...');
        await gerarRoteiro();

        console.log('\n[ETAPA 5/6] Gerando áudios do roteiro...');
        await gerarAudiosDoRoteiro();

        console.log('\n[ETAPA 6/6] Montando o episódio final...');
        await montarEpisodio();

        console.log("\n✅ Pipeline finalizado com sucesso! O episódio está pronto.");
    } catch (error) {
        console.error("\n🔥 Ocorreu um erro fatal no pipeline:", error);
        process.exit(1);
    }
}

main();
