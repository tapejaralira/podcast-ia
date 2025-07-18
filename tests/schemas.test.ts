/**
 * @fileoverview Testes para schemas Zod
 * @ai-purpose Validação automática da integridade dos schemas principais
 */

import { describe, it, expect } from '@jest/globals';
import { 
  NoticiaCruaSchema, 
  PautaDoDiaSchema, 
  RoteiroPodcastSchema 
} from '../src/schemas/core.schemas.js';
import { validateWithSchema } from '../src/utils/validation.js';

describe('Schemas Zod - Validação de Dados', () => {
  describe('NoticiaCruaSchema', () => {
    it('deve validar notícia válida', () => {
      const noticiaValida = {
        titulo: 'Prefeito anuncia nova obra em Manaus',
        resumo: 'Projeto prevê revitalização do centro da cidade',
        link: 'https://exemplo.com/noticia',
        fonte: 'G1 Amazonas',
        dataPublicacao: '2025-07-17T10:00:00.000Z'
      };

      expect(() => validateWithSchema(
        noticiaValida, 
        NoticiaCruaSchema, 
        'test'
      )).not.toThrow();
    });

    it('deve rejeitar notícia com campos obrigatórios faltando', () => {
      const noticiaInvalida = {
        titulo: '',
        link: 'url-invalida',
        fonte: 'G1 Amazonas'
        // resumo e dataPublicacao faltando
      };

      expect(() => validateWithSchema(
        noticiaInvalida, 
        NoticiaCruaSchema, 
        'test'
      )).toThrow();
    });

    it('deve rejeitar URL inválida', () => {
      const noticiaComUrlInvalida = {
        titulo: 'Título válido',
        resumo: 'Resumo válido',
        link: 'não-é-uma-url',
        fonte: 'G1 Amazonas',
        dataPublicacao: '2025-07-17T10:00:00.000Z'
      };

      expect(() => validateWithSchema(
        noticiaComUrlInvalida, 
        NoticiaCruaSchema, 
        'test'
      )).toThrow();
    });
  });

  describe('PautaDoDiaSchema', () => {
    it('deve validar pauta básica válida', () => {
      const pautaValida = {
        data: '2025-07-17T10:00:00.000Z',
        manchete: 'Manchete do dia',
        efemerides: [
          { titulo: 'Histórico', texto: 'Acontecimento importante' }
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

      expect(() => validateWithSchema(
        pautaValida, 
        PautaDoDiaSchema, 
        'test'
      )).not.toThrow();
    });
  });

  describe('RoteiroPodcastSchema', () => {
    it('deve validar roteiro básico válido', () => {
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

      expect(() => validateWithSchema(
        roteiroValido, 
        RoteiroPodcastSchema, 
        'test'
      )).not.toThrow();
    });
  });
});
