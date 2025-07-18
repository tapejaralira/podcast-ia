/**
 * @ai-purpose Modal para exibir detalhes completos da notícia
 * @ai-input-format NoticiaCompleta object, controle de visibilidade
 * @ai-output-format Modal overlay com detalhes expandidos
 * @ai-dependencies React, Portal para modal, Tailwind
 * @ai-error-handling Null checks, safe rendering
 * @ai-performance Conditional rendering, escape handling
 * @ai-validation Props validation, data presence
 * @ai-common-errors "Portal errors", "Click outside", "Keyboard navigation"
 * @ai-debugging Modal state, event handling
 * @ai-business-impact Detailed review antes da seleção
 */

import React, { useEffect } from 'react';
import { NoticiaCompleta } from '../lib/types';

interface DetalhesModalProps {
  noticia: NoticiaCompleta | null;
  isOpen: boolean;
  onClose: () => void;
  onSelecionar?: (id: string) => void;
  selecionada?: boolean;
}

export const DetalhesModal: React.FC<DetalhesModalProps> = ({
  noticia,
  isOpen,
  onClose,
  onSelecionar,
  selecionada = false,
}) => {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !noticia) return null;

  // Função para obter cor baseada no score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
            <div className="flex-1 mr-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {noticia.titulo}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{noticia.fonte}</span>
                <span>•</span>
                <span className="capitalize">{noticia.categoria}</span>
                <span>•</span>
                <span className="capitalize">{noticia.prioridade} prioridade</span>
                <span>•</span>
                <span>{noticia.tempoEstimado} min</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${getScoreColor(noticia.scoreTotal)}`}>
                {noticia.scoreTotal.toFixed(1)}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-4 space-y-6">
            {/* Resumo */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumo</h3>
              <p className="text-gray-700 leading-relaxed">{noticia.resumo}</p>
            </section>

            {/* Contexto Amazônico */}
            {noticia.contextoAmazonico && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contexto Amazônico</h3>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <p className="text-green-800">{noticia.contextoAmazonico}</p>
                </div>
              </section>
            )}

            {/* Scores Detalhados */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise Detalhada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(noticia.scoreDetalhado).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={`text-xl font-bold ${getScoreColor(value)}`}>
                      {value.toFixed(1)}/10
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Razão da Relevância */}
            {noticia.razaoRelevancia && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Por que é Relevante</h3>
                <p className="text-gray-700 leading-relaxed">{noticia.razaoRelevancia}</p>
              </section>
            )}

            {/* Status de Seleção */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Status da Análise</h3>
              <div className="bg-blue-50 p-4 rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Posição no Ranking:</span>
                    <div className="font-bold text-blue-700">#{noticia.statusSelecao.posicaoRanking}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Probabilidade de Seleção:</span>
                    <div className="font-bold text-blue-700">
                      {(noticia.statusSelecao.probabilidadeSelecao * 100).toFixed(1)}%
                    </div>
                  </div>
                  {noticia.statusSelecao.motivoSelecao && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Motivo da Seleção Automática:</span>
                      <div className="font-medium text-blue-700 capitalize">
                        {noticia.statusSelecao.motivoSelecao}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Informações Editoriais */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise Editorial</h3>
              <div className="bg-purple-50 p-4 rounded space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Ângulo da Pauta:</span>
                  <div className="font-medium text-purple-700">{noticia.editorial.anguloPauta}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Potencial de Polêmica:</span>
                  <div className={`font-medium capitalize ${
                    noticia.editorial.potencialPolemica === 'alto' ? 'text-red-600' :
                    noticia.editorial.potencialPolemica === 'medio' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {noticia.editorial.potencialPolemica}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Adequação ao Público:</span>
                  <div className="font-medium text-purple-700">
                    {noticia.editorial.adequacaoPublico}/10
                  </div>
                </div>
              </div>
            </section>

            {/* Tags */}
            {noticia.tagsDetectadas && noticia.tagsDetectadas.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags Detectadas</h3>
                <div className="flex flex-wrap gap-2">
                  {noticia.tagsDetectadas.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Link Original */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fonte Original</h3>
              <a
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {noticia.url}
              </a>
            </section>
          </div>

          {/* Footer com ações */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Data: {new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR')}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              
              {onSelecionar && (
                <button
                  onClick={() => {
                    onSelecionar(noticia.id);
                    onClose();
                  }}
                  className={`px-4 py-2 rounded transition-colors ${
                    selecionada
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {selecionada ? 'Remover Seleção' : 'Selecionar Notícia'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesModal;
