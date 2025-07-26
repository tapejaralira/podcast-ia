/**
 * @ai-purpose Componente para seleção visual de efemérides/fatos históricos
 * @ai-input-format OpcoesEfemerides com categorias e recomendação
 * @ai-output-format Callback com efeméride selecionada
 * @ai-dependencies SugestoesAbertura types
 * @ai-error-handling Fallbacks para dados indisponíveis
 * @ai-performance Renderização otimizada, memoization
 * @ai-validation Validação de tipos e dados
 * @ai-common-errors "Missing data", "Invalid selection"
 * @ai-debugging Props inspection, selection state
 * @ai-business-impact Seleção editorial de abertura do podcast
 */

'use client';

import React from 'react';
import { OpcoesEfemerides, Efemeride } from '../lib/types';

interface EfemerideSelectorProps {
  opcoes: OpcoesEfemerides;
  selecionada: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
  } | null;
  onSelecionar: (tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas', indice: number, efemeride: Efemeride) => void;
}

const EfemeridesSelector: React.FC<EfemerideSelectorProps> = ({
  opcoes,
  selecionada,
  onSelecionar
}) => {
  const renderizarCategoria = (
    titulo: string,
    descricao: string,
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas',
    items: Efemeride[],
    icone: string,
    corFundo: string,
    corBorda: string
  ) => (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <span className="text-xl mr-2">{icone}</span>
        <div>
          <h4 className="font-semibold text-gray-900">{titulo}</h4>
          <p className="text-sm text-gray-600">{descricao}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map((efemeride, index) => {
          const estaSelecionada = selecionada?.tipo === tipo && selecionada?.indice === index;
          const ehRecomendada = opcoes.recomendacao.tipo === tipo && opcoes.recomendacao.indice === index;
          
          return (
            <div
              key={index}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${estaSelecionada 
                  ? `${corBorda} ${corFundo} shadow-md` 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
              onClick={() => onSelecionar(tipo, index, efemeride)}
            >
              {ehRecomendada && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ⭐ Recomendada
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-2">{efemeride.titulo}</h5>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">{efemeride.texto}</p>
                  <p className="text-xs text-gray-500 italic">Fonte: {efemeride.fonte}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${estaSelecionada 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                    }
                  `}>
                    {estaSelecionada && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!opcoes) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        Nenhuma efeméride disponível
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📅 Seleção de Efeméride para Abertura
        </h3>
        <p className="text-sm text-gray-600">
          Escolha um fato histórico ou curiosidade para iniciar o podcast. 
          A opção recomendada está destacada.
        </p>
      </div>

      {renderizarCategoria(
        'Fatos Brasileiros',
        'Eventos históricos reais verificados na base de dados local',
        'fatosBrasileiros',
        opcoes.fatosBrasileiros,
        '🇧🇷',
        'bg-green-50',
        'border-green-300'
      )}

      {renderizarCategoria(
        'Efemérides via IA',
        'Fatos brasileiros e datas comemorativas encontrados via IA',
        'efemeridesIA',
        opcoes.efemeridesIA,
        '🤖',
        'bg-blue-50',
        'border-blue-300'
      )}

      {renderizarCategoria(
        'Curiosidades Amazônicas',
        'Curiosidades sobre a Amazônia sempre disponíveis',
        'curiosidadesAmazonicas',
        opcoes.curiosidadesAmazonicas,
        '🌳',
        'bg-amber-50',
        'border-amber-300'
      )}

      {opcoes.recomendacao && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-green-600 mr-2">💡</div>
            <div>
              <p className="text-sm font-medium text-green-800">Recomendação do Sistema:</p>
              <p className="text-sm text-green-700">{opcoes.recomendacao.motivo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EfemeridesSelector;
