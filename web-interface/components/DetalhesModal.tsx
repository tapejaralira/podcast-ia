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
                <span>{noticia.tempoEstimado} min</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {(noticia.scoreTotal || noticia.relevanceScore) && (
                <div className={`text-2xl font-bold ${getScoreColor(noticia.scoreTotal || noticia.relevanceScore)}`}>
                  {(noticia.scoreTotal || noticia.relevanceScore).toFixed(1)}
                </div>
              )}
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

            {/* Scores */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise de Relevância</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {noticia.scoreTotal && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700 mb-1">Score Total</div>
                    <div className={`text-xl font-bold ${getScoreColor(noticia.scoreTotal)}`}>
                      {noticia.scoreTotal.toFixed(1)}/10
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-700 mb-1">Relevância</div>
                  <div className={`text-xl font-bold ${getScoreColor(noticia.relevancia)}`}>
                    {noticia.relevancia.toFixed(1)}/10
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-700 mb-1">Score de Relevância</div>
                  <div className={`text-xl font-bold ${getScoreColor(noticia.relevanceScore)}`}>
                    {noticia.relevanceScore.toFixed(1)}/10
                  </div>
                </div>
              </div>
            </section>

            {/* Classificação */}
            {noticia.classification && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Classificação</h3>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="font-medium text-blue-700">{noticia.classification.label}</div>
                  <div className={`text-sm mt-1 ${noticia.classification.isAdequate ? 'text-green-600' : 'text-red-600'}`}>
                    {noticia.classification.isAdequate ? '✓ Adequada' : '✗ Não adequada'} para o público
                  </div>
                </div>
              </section>
            )}

            {/* Fontes e Links */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fontes e Links</h3>
              
              {/* Múltiplas fontes */}
              {noticia.fontes && noticia.fontes.length > 1 ? (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Fontes Consolidadas ({noticia.fontes.length}):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {noticia.fontes.map((fonte, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {fonte}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Fonte:</h4>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {noticia.fonte}
                  </span>
                </div>
              )}

              {/* Múltiplos links */}
              {noticia.links && noticia.links.length > 0 ? (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Links Originais ({noticia.links.length}):
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {noticia.links.map((link, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 mt-1 min-w-[20px]">
                          {index + 1}.
                        </span>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                        >
                          {link}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (noticia.url || noticia.link) ? (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Link Original:</h4>
                  <a
                    href={noticia.url || noticia.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {noticia.url || noticia.link}
                  </a>
                </div>
              ) : null}
            </section>
          </div>

          {/* Footer com ações */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {noticia.dataPublicacao ? (
                <>Data: {new Date(noticia.dataPublicacao).toLocaleDateString('pt-BR')}</>
              ) : (
                'Sem data de publicação'
              )}
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
