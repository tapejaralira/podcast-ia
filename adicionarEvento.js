const GerenciadorEventos = require('./gerenciadorEventos');

// Script para adicionar eventos manualmente
const gerenciador = new GerenciadorEventos();

const args = process.argv.slice(2);

if (args.length < 3) {
    console.log('📝 Uso: node adicionarEvento.js "Título" "Descrição" "YYYY-MM-DD" [categoria]');
    console.log('📝 Exemplo: node adicionarEvento.js "Show do Roberto Carlos" "Apresentação no Teatro Amazonas" "2025-07-15" "entretenimento"');
    console.log('📝 Categorias: cultura_regional, entretenimento, esportes, economia, educacao, geral');
    process.exit(1);
}

const [titulo, descricao, data, categoria = 'geral'] = args;

// Validar formato da data
if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    console.log('❌ Formato de data inválido! Use YYYY-MM-DD (ex: 2025-07-15)');
    process.exit(1);
}

// Validar se a data não é passada
const dataEvento = new Date(data);
const hoje = new Date();
if (dataEvento < hoje) {
    console.log('⚠️ Data do evento é passada! Tem certeza? (s/n)');
    // Em um script real, você poderia usar readline para confirmar
}

gerenciador.adicionarEventoManual(titulo, descricao, data, categoria);

// Mostrar próximos eventos
const proximosEventos = gerenciador.obterEventosProximos(30);
if (proximosEventos.length > 0) {
    console.log('\n📅 PRÓXIMOS EVENTOS:');
    proximosEventos.forEach(evento => {
        const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
        console.log(`• ${evento.titulo} - ${dataFormatada} (${evento.categoria})`);
    });
}

console.log('\n✅ Evento adicionado com sucesso!');