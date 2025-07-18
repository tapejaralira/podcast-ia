/**
 * @fileoverview Testes para schemas Zod
 * @ai-purpose Validação automática da integridade dos schemas principais
 */

import { 
  NoticiaCruaSchema, 
  PautaDoDiaSchema, 
  RoteiroPodcastSchema 
} from '../src/schemas/core.schemas.js';
import { validateWithSchema } from '../src/utils/validation.js';

// Simple test runner (no dependencies)
function runSchemaTests() {
  console.log('🧪 Executando testes de schemas...');
  
  // Test 1: NoticiaCruaSchema - Validação positiva
  try {
    const noticiaValida = {
      titulo: 'Prefeito anuncia nova obra em Manaus',
      resumo: 'Projeto prevê revitalização do centro da cidade',
      link: 'https://exemplo.com/noticia',
      fonte: 'G1 Amazonas',
      dataPublicacao: '2025-07-17T10:00:00.000Z'
    };

    validateWithSchema(noticiaValida, NoticiaCruaSchema, 'test.noticiaValida');
    console.log('✅ NoticiaCrua válida: PASS');
  } catch (error) {
    console.log('❌ NoticiaCrua válida: FAIL -', error.message);
  }

  // Test 2: NoticiaCruaSchema - Validação negativa
  try {
    const noticiaInvalida = {
      titulo: '',
      link: 'url-invalida',
      fonte: 'G1 Amazonas'
      // resumo e dataPublicacao faltando
    };

    validateWithSchema(noticiaInvalida, NoticiaCruaSchema, 'test.noticiaInvalida');
    console.log('❌ NoticiaCrua inválida: FAIL - Deveria ter rejeitado');
  } catch (error) {
    console.log('✅ NoticiaCrua inválida: PASS - Rejeitou corretamente');
  }

  // Test 3: PautaDoDiaSchema - Validação positiva
  try {
    const pautaValida = {
      data: '2025-07-17T10:00:00.000Z',
      manchete: 'Manchete do dia',
      efemerides: [
        { titulo: 'Histórico', texto: 'Acontecimento importante', fonte: 'Wikipedia' }
      ],
      pauta: {
        politica: [],
        economia: [],
        cidades: [],
        cultura: [],
        esportes: []
      },
      temaDestaque: 'Tema principal',
      duracaoTotal: 900,
      estatisticas: {
        totalNoticias: 0,
        noticiasPorCategoria: {},
        relevanciaMedia: 5
      }
    };

    validateWithSchema(pautaValida, PautaDoDiaSchema, 'test.pautaValida');
    console.log('✅ PautaDoDia válida: PASS');
  } catch (error) {
    console.log('❌ PautaDoDia válida: FAIL -', error.message);
  }

  // Test 4: RoteiroPodcastSchema - Validação positiva
  try {
    const roteiroValido = {
      episodio: {
        numero: 1,
        data: '2025-07-17T10:00:00.000Z',
        tema: 'Tema do episódio',
        duracaoEstimada: 900
      },
      abertura: {
        saudacao: 'Bom dia!',
        apresentacao: 'Eu sou a Keren',
        contextoDia: 'Hoje falaremos sobre...'
      },
      blocos: [
        {
          tipo: 'noticia',
          ordem: 1,
          locutor: 'irai',
          conteudo: 'Conteúdo da notícia',
          duracaoEstimada: 180
        }
      ],
      encerramento: {
        resumo: 'Resumo do episódio',
        chamada: 'Acompanhe o Bubuia News',
        despedida: 'Até a próxima!'
      },
      metadados: {
        versao: '2.0.0',
        geradoPor: 'test',
        timestamp: '2025-07-17T10:00:00.000Z'
      }
    };

    validateWithSchema(roteiroValido, RoteiroPodcastSchema, 'test.roteiroValido');
    console.log('✅ RoteiroPodcast válido: PASS');
  } catch (error) {
    console.log('❌ RoteiroPodcast válido: FAIL -', error.message);
  }

  console.log('🏁 Testes de schemas concluídos');
}

export { runSchemaTests };

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSchemaTests();
}
