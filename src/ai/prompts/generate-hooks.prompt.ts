/**
 * @fileoverview Prompt template para geração de ganchos de abertura
 * @ai-purpose Template estruturado para criar aberturas criativas do podcast
 */

import { createPromptTemplate, PromptTemplate } from './prompt-template.js';

export const generateHooksPrompt: PromptTemplate = createPromptTemplate(
  'generate-hooks',
  'Geração de Ganchos de Abertura',
  `Você é um roteirista de podcast criativo. Crie 3 ganchos (aberturas) para o podcast Bubuia News com base na pauta do dia.

PAUTA DO DIA:
{{pautaContent}}

ESTILO DO PODCAST:
- Tom: Informativo mas descontraído
- Público: Jovens e adultos de Manaus
- Duração do gancho: 30-45 segundos
- Personalidade: Regional amazonense, autêntico

INSTRUÇÕES:
1. Crie 3 ganchos distintos em estilos diferentes:
   - Gancho 1: Direto e impactante
   - Gancho 2: Storytelling/narrativo  
   - Gancho 3: Pergunta reflexiva

2. Cada gancho deve:
   - Começar de forma envolvente
   - Conectar com a realidade amazônica
   - Criar curiosidade sobre as notícias
   - Ser natural para locução

FORMATO DA RESPOSTA:
{
  "ganchos": [
    {
      "tipo": "impactante",
      "texto": "...",
      "trilha_sugerida": "trilha_tensao_leve.mp3"
    },
    {
      "tipo": "narrativo", 
      "texto": "...",
      "trilha_sugerida": "trilha_reflexiva.mp3"
    },
    {
      "tipo": "reflexivo",
      "texto": "...", 
      "trilha_sugerida": "trilha_informativa_neutra.mp3"
    }
  ]
}`,
  ['pautaContent'],
  {
    description: 'Gera ganchos criativos para abertura do podcast Bubuia News',
    constraints: [
      'Resposta deve ser JSON válido',
      '3 ganchos em estilos diferentes',
      'Tom regional amazonense',
      'Duração 30-45 segundos cada'
    ],
    examples: [
      {
        input: {
          pautaContent: 'Política: Nova obra em Manaus...'
        },
        expectedOutput: '{"ganchos": [{"tipo": "impactante", "texto": "Manaus acorda hoje com uma nova promessa...", "trilha_sugerida": "trilha_tensao_leve.mp3"}]}'
      }
    ],
    config: {
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 1000
    }
  }
);
