'use client';

import React, { useState } from 'react';
import { OpcoesEfemerides, Efemeride } from '../lib/types';

interface EfemeridesSelectorProps {
  opcoes?: OpcoesEfemerides;
  selecionada?: {
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
  } | null;
  onSelecionar: (
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas',
    indice: number,
    efemeride: Efemeride
  ) => void;
}

export default function EfemeridesSelector({ 
  opcoes, 
  selecionada,
  onSelecionar
}: EfemeridesSelectorProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas'>('fatosBrasileiros');

  if (!opcoes) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Sugestões de Efemérides
        </h3>
        <p className="text-yellow-700">
          Carregando sugestões de efemérides...
        </p>
      </div>
    );
  }

  const categorias = [
    { key: 'fatosBrasileiros' as const, label: 'Fatos Brasileiros', efemerides: opcoes.fatosBrasileiros },
    { key: 'efemeridesIA' as const, label: 'Efemérides IA', efemerides: opcoes.efemeridesIA },
    { key: 'curiosidadesAmazonicas' as const, label: 'Curiosidades Amazônicas', efemerides: opcoes.curiosidadesAmazonicas }
  ];

  const categoriaAtual = categorias.find(cat => cat.key === categoriaAtiva);
  const efemeridesAtivas = categoriaAtual?.efemerides || [];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        Sugestões de Efemérides
        {opcoes.recomendacao && (
          <span className="text-sm font-normal text-blue-600 ml-2">
            (Recomendação: {opcoes.recomendacao.tipo})
          </span>
        )}
      </h3>
      
      {/* Abas de categorias */}
      <div className="flex space-x-1 mb-4 bg-blue-100 p-1 rounded-lg">
        {categorias.map((categoria) => (
          <button
            key={categoria.key}
            onClick={() => setCategoriaAtiva(categoria.key)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              categoriaAtiva === categoria.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            {categoria.label}
            <span className="ml-1 text-xs">
              ({categoria.efemerides.length})
            </span>
          </button>
        ))}
      </div>

      {/* Lista de efemérides da categoria ativa */}
      <div className="space-y-3">
        {efemeridesAtivas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhuma efeméride disponível para {categoriaAtual?.label}
          </div>
        ) : (
          efemeridesAtivas.map((efemeride: Efemeride, index: number) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selecionada?.tipo === categoriaAtiva && selecionada?.indice === index
                  ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-500'
                  : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200'
              }`}
              onClick={() => onSelecionar(categoriaAtiva, index, efemeride)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    {efemeride.titulo}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {efemeride.texto}
                  </p>
                  {efemeride.gancho && (
                    <p className="text-blue-600 text-xs italic">
                      Gancho: {efemeride.gancho}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  {selecionada?.tipo === categoriaAtiva && selecionada?.indice === index ? (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {selecionada && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Efeméride selecionada: <strong>{categorias.find(c => c.key === selecionada.tipo)?.efemerides[selecionada.indice]?.titulo}</strong>
          </p>
        </div>
      )}

      {opcoes.recomendacao && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Recomendação:</strong> {opcoes.recomendacao.tipo} (índice {opcoes.recomendacao.indice})
          </p>
        </div>
      )}
    </div>
  );
}