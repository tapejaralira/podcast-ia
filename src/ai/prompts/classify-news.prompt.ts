/**
 * @fileoverview Prompt template para classificação de notícias
 * @ai-purpose Template estruturado para classificação de relevância de notícias amazônicas
 */

import { createPromptTemplate, PromptTemplate } from './prompt-template.js';

export const classifyNewsPrompt: PromptTemplate = createPromptTemplate(
  'classify-news',
  'Classificação de Notícias',
  `Você é o editor-chefe do podcast "Bubuia News" de Manaus. Sua tarefa é analisar e classificar uma notícia com um rigoroso controle de qualidade.

DADOS DA NOTÍCIA:
{{newsData}}

INSTRUÇÕES DE CLASSIFICAÇÃO:
Avalie esta notícia usando os critérios específicos do guia de classificação:

{{classificationGuide}}

RESPONDA APENAS EM JSON VÁLIDO no seguinte formato exato:
{
  "classification_id": "string (ID da categoria)",
  "is_adequate": boolean
}

CRITÉRIOS RIGOROSOS:
- Relevância para o público amazonense
- Qualidade jornalística
- Atualidade da informação
- Impacto regional

IMPORTANTE: Seja criterioso - prefira qualidade sobre quantidade.`,
  ['newsData', 'classificationGuide'],
  {
    description: 'Classifica notícias por relevância e adequação para podcast amazônico',
    constraints: [
      'Resposta deve ser JSON válido',
      'Foco em relevância regional',
      'Critérios jornalísticos rigorosos'
    ],
    examples: [
      {
        input: {
          newsData: 'Prefeito de Manaus anuncia nova obra...',
          classificationGuide: 'politica: Política local...'
        },
        expectedOutput: '{"classification_id": "politica", "is_adequate": true}'
      }
    ],
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 500
    }
  }
);
