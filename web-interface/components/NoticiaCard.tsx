/**
 * @ai-purpose Componente card visual para exibir notícias
 */

import React from 'react';
import { NoticiaSimplificada } from '../lib/types';

interface NoticiaCardProps {
  noticia: NoticiaSimplificada;
  selecionada: boolean;
  onSelecionar: (id: string) => void;
}

export const NoticiaCard: React.FC<NoticiaCardProps> = ({
  noticia,
  selecionada,
  onSelecionar,
}) => {
  return (
    <div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${selecionada ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
      `}
      onClick={() => onSelecionar(noticia.id)}
    >
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {noticia.titulo}
      </h3>

      {/* Fonte e categoria */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">{noticia.fonte}</span>
        <span className="text-gray-400">•</span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {noticia.categoria}
        </span>
      </div>

      {/* Resumo */}
      <p className="text-gray-700 text-sm">
        {noticia.resumo}
      </p>

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
