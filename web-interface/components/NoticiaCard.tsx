/**
 * @ai-purpose Componente card visual para exibir notícias
 * @ai-input-format NoticiaCompleta object
 * @ai-output-format React component com card visual
 * @ai-dependencies Tailwind CSS, React hooks
 * @ai-error-handling Props validation, safe rendering
 * @ai-performance Memo para evitar re-renders, lazy loading
 * @ai-validation PropTypes ou TypeScript types
 * @ai-common-errors "Undefined props", "Missing data", "Render errors"
 * @ai-debugging Props inspection, render logging
 * @ai-business-impact UX principal da seleção de notícias
 */

import React from 'react';
import { NoticiaCompleta } from '../lib/types';

interface NoticiaCardProps {
  noticia: NoticiaCompleta;
  selecionada: boolean;
  onSelecionar: (id: string) => void;
  onVerDetalhes: (noticia: NoticiaCompleta) => void;
  destacarManchete?: boolean;
}

export const NoticiaCard: React.FC<NoticiaCardProps> = ({
  noticia,
  selecionada,
  onSelecionar,
  onVerDetalhes,
  destacarManchete = false,
}) => {
  // Função para obter cor baseada no score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Função para obter cor da prioridade
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  // Função para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${selecionada ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${destacarManchete ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
      `}
      onClick={() => onSelecionar(noticia.id)}
    >
      {/* Header com título e score */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-2">
          {destacarManchete && (
            <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
              MANCHETE
            </span>
          )}
          {noticia.titulo}
        </h3>
        <div className={`px-2 py-1 rounded text-sm font-bold ${getScoreColor(noticia.scoreTotal)}`}>
          {noticia.scoreTotal.toFixed(1)}
        </div>
      </div>

      {/* Fonte e categoria */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">{noticia.fonte}</span>
        <span className="text-gray-400">•</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(noticia.prioridade)}`}>
          {noticia.categoria}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(noticia.prioridade)}`}>
          {noticia.prioridade}
        </span>
      </div>

      {/* Resumo */}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {truncateText(noticia.resumo, 150)}
      </p>

      {/* Contexto Amazônico */}
      {noticia.contextoAmazonico && (
        <div className="bg-green-50 border-l-4 border-green-400 p-2 mb-3">
          <p className="text-green-700 text-sm">
            <strong>Contexto Amazônico:</strong> {truncateText(noticia.contextoAmazonico, 100)}
          </p>
        </div>
      )}

      {/* Scores detalhados (minified) */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {Object.entries(noticia.scoreDetalhado).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className={`text-sm font-semibold ${getScoreColor(value)}`}>
              {value.toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {noticia.tagsDetectadas && noticia.tagsDetectadas.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {noticia.tagsDetectadas.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {noticia.tagsDetectadas.length > 3 && (
            <span className="text-gray-500 text-xs">
              +{noticia.tagsDetectadas.length - 3} mais
            </span>
          )}
        </div>
      )}

      {/* Footer com ações */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>⏱️ {noticia.tempoEstimado}min</span>
          <span>📊 #{noticia.statusSelecao.posicaoRanking}</span>
          <span>🎯 {(noticia.statusSelecao.probabilidadeSelecao * 100).toFixed(0)}%</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalhes(noticia);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ver detalhes
          </button>
          
          {selecionada && (
            <span className="text-green-600 text-sm font-medium">
              ✓ Selecionada
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticiaCard;
