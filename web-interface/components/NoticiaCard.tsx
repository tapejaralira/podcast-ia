/**
 * @ai-purpose Componente card visual para exibir notícias
 */

import React from 'react';
import { NoticiaCompleta } from '../lib/types';

interface NoticiaCardProps {
  noticia: NoticiaCompleta;
  selecionada: boolean;
  onSelecionar: (id: string) => void;
  isManchete: boolean;
  onSetManchete: (id: string) => void;
  mostrarResumo?: boolean; // Nova prop opcional
}

export const NoticiaCard: React.FC<NoticiaCardProps> = ({
  noticia,
  selecionada,
  onSelecionar,
  isManchete,
  onSetManchete,
  mostrarResumo = true, // Padrão é mostrar o resumo
}) => {
  const handleMancheteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o card seja selecionado/desselecionado
    onSetManchete(noticia.id);
  };

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all duration-200 
        ${selecionada ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${isManchete ? 'ring-2 ring-yellow-500' : ''}
      `}
      onClick={() => onSelecionar(noticia.id)}
    >
      <div className="flex justify-between items-start">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-4">
          {noticia.titulo}
        </h3>
        {/* Botão de Manchete */}
        <button
          onClick={handleMancheteClick}
          className={`p-1 rounded-full transition-colors ${
            isManchete ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
          title="Marcar como manchete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isManchete ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Fonte(s) e categoria */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Mostrar múltiplas fontes se disponível */}
          {noticia.fontes && noticia.fontes.length > 1 ? (
            <div className="flex flex-wrap gap-1">
              <span className="text-sm text-gray-600 font-medium">
                {noticia.fontes.length} fontes:
              </span>
              {noticia.fontes.map((fonte, index) => (
                <span key={index} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {fonte}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-600">{noticia.fonte}</span>
          )}
          <span className="text-gray-400">•</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {noticia.categoria}
          </span>
        </div>

        {/* Links múltiplos */}
        {noticia.links && noticia.links.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">
              {noticia.links.length === 1 ? 'Link:' : `${noticia.links.length} links:`}
            </span>
            <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
              {noticia.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                  title={link}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Fallback para link único (compatibilidade) */}
        {(!noticia.links || noticia.links.length === 0) && noticia.url && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Link:</span>
            <a
              href={noticia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
              title={noticia.url}
            >
              {noticia.url}
            </a>
          </div>
        )}
      </div>

      {/* Resumo - apenas se mostrarResumo for true */}
      {mostrarResumo && (
        <p className="text-gray-700 text-sm">
          {noticia.resumo}
        </p>
      )}

      {/* Informações adicionais se disponíveis */}
      {(noticia.relevanceScore || noticia.classification) && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
          {noticia.relevanceScore && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              Relevância: {noticia.relevanceScore}
            </span>
          )}
          {noticia.classification && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {typeof noticia.classification === 'object' 
                ? noticia.classification.label 
                : noticia.classification}
            </span>
          )}
        </div>
      )}

      {/* Status de seleção */}
      {selecionada && (
        <div className="mt-2 text-green-600 text-sm font-medium">
          ✓ Selecionada
        </div>
      )}
    </div>
  );
};

export default NoticiaCard;
