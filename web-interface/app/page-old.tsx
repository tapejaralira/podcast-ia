import Image from "next/image";

/**
 * @ai-purpose Página principal da interface de curadoria de notícias
 * @ai-input-format Dados de notícias categorizadas, interações do usuário
 * @ai-output-format Interface completa para seleção visual de notícias
 * @ai-dependencies NoticiaCard, DetalhesModal, API services
 * @ai-error-handling Loading states, error boundaries, fallbacks
 * @ai-performance Lazy loading, memoization, efficient re-renders
 * @ai-validation Data validation, form validation
 * @ai-common-errors "Data loading errors", "State management", "Component errors"
 * @ai-debugging State inspection, API call monitoring
 * @ai-business-impact Core UX para curadoria editorial
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import NoticiaCard from '../components/NoticiaCard';
import DetalhesModal from '../components/DetalhesModal';
import { carregarNoticias, salvarSelecaoManual, carregarSelecaoExistente } from '../lib/api';
import { NoticiasCategorizadasCompletas, NoticiaCompleta, SelecaoManual, FiltrosInterface } from '../lib/types';

export default function Home() {
  // Estados principais
  const [dados, setDados] = useState<NoticiasCategorizadasCompletas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados da seleção
  const [mancheteSelecionada, setMancheteSelecionada] = useState<string | null>(null);
  const [noticiasSelecionadas, setNoticiasSelecionadas] = useState<Set<string>>(new Set());
  const [observacoes, setObservacoes] = useState('');
  
  // Estados da interface
  const [noticiaDetalhes, setNoticiaDetalhes] = useState<NoticiaCompleta | null>(null);
  const [filtros, setFiltros] = useState<FiltrosInterface>({
    categoria: 'todas',
    relevanciaMinima: 0,
    ordenacao: 'score',
    busca: '',
  });
  
  const [abaSelecionada, setAbaSelecionada] = useState<string>('todas');

  // Carregar dados na inicialização
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [noticiasData, selecaoExistente] = await Promise.all([
          carregarNoticias(),
          carregarSelecaoExistente(),
        ]);
        
        if (!noticiasData) {
          throw new Error('Não foi possível carregar as notícias');
        }
        
        setDados(noticiasData);
        
        // Restaurar seleção existente se houver
        if (selecaoExistente) {
          if (selecaoExistente.manchete) {
            setMancheteSelecionada(selecaoExistente.manchete.id);
          }
          
          const ids = new Set<string>();
          selecaoExistente.noticiasEscolhidas.forEach(categoria => {
            categoria.ids.forEach(id => ids.add(id));
          });
          setNoticiasSelecionadas(ids);
          setObservacoes(selecaoExistente.observacoes || '');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  // Computar notícias filtradas
  const noticiasFiltradas = useMemo(() => {
    if (!dados) return [];
    
    let noticias = dados.rankingGeral;
    
    // Filtrar por categoria
    if (filtros.categoria !== 'todas' && abaSelecionada !== 'todas') {
      noticias = dados.categorias[abaSelecionada as keyof typeof dados.categorias] || [];
    }
    
    // Filtrar por relevância mínima
    noticias = noticias.filter(n => n.scoreTotal >= filtros.relevanciaMinima);
    
    // Filtrar por busca
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      noticias = noticias.filter(n => 
        n.titulo.toLowerCase().includes(termo) ||
        n.resumo.toLowerCase().includes(termo) ||
        n.fonte.toLowerCase().includes(termo)
      );
    }
    
    // Ordenar
    switch (filtros.ordenacao) {
      case 'relevancia':
        noticias.sort((a, b) => b.relevancia - a.relevancia);
        break;
      case 'categoria':
        noticias.sort((a, b) => a.categoria.localeCompare(b.categoria));
        break;
      case 'score':
      default:
        noticias.sort((a, b) => b.scoreTotal - a.scoreTotal);
        break;
    }
    
    return noticias;
  }, [dados, filtros, abaSelecionada]);

  // Handlers
  const toggleSelecaoNoticia = (id: string) => {
    const novas = new Set(noticiasSelecionadas);
    if (novas.has(id)) {
      novas.delete(id);
    } else {
      novas.add(id);
    }
    setNoticiasSelecionadas(novas);
  };

  const salvarSelecao = async () => {
    if (!dados || !mancheteSelecionada) {
      alert('Por favor, selecione uma manchete primeiro');
      return;
    }
    
    try {
      const mancheteNoticia = dados.rankingGeral.find(n => n.id === mancheteSelecionada);
      if (!mancheteNoticia) {
        alert('Manchete não encontrada');
        return;
      }
      
      // Agrupar notícias por categoria
      const noticiasEscolhidas: Array<{categoria: string; ids: string[]; total: number}> = [];
      const categorias = new Set<string>();
      
      Array.from(noticiasSelecionadas).forEach(id => {
        const noticia = dados.rankingGeral.find(n => n.id === id);
        if (noticia) {
          categorias.add(noticia.categoria);
        }
      });
      
      categorias.forEach(categoria => {
        const idsCategoria = Array.from(noticiasSelecionadas).filter(id => {
          const noticia = dados.rankingGeral.find(n => n.id === id);
          return noticia?.categoria === categoria;
        });
        
        if (idsCategoria.length > 0) {
          noticiasEscolhidas.push({
            categoria,
            ids: idsCategoria,
            total: idsCategoria.length,
          });
        }
      });
      
      const selecao: SelecaoManual = {
        data: dados.data,
        manchete: {
          id: mancheteSelecionada,
          titulo: mancheteNoticia.titulo,
          categoria: mancheteNoticia.categoria,
        },
        noticiasEscolhidas,
        estatisticas: {
          totalNoticias: noticiasSelecionadas.size,
          duracaoEstimada: Array.from(noticiasSelecionadas).reduce((total, id) => {
            const noticia = dados.rankingGeral.find(n => n.id === id);
            return total + (noticia?.tempoEstimado || 0);
          }, 0),
          categorias: categorias.size,
        },
        observacoes: observacoes || undefined,
      };
      
      const sucesso = await salvarSelecaoManual(selecao);
      if (sucesso) {
        alert('Seleção salva com sucesso!');
      } else {
        alert('Erro ao salvar seleção');
      }
    } catch (err) {
      alert('Erro ao salvar: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erro</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Nenhuma notícia encontrada</p>
      </div>
    );
  }

  const categorias = ['todas', 'politica', 'economia', 'cidades', 'cultura', 'esportes', 'geral'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Curadoria de Notícias - {new Date(dados.data).toLocaleDateString('pt-BR')}
          </h1>
          <p className="text-gray-600 mt-1">
            {dados.metadados.totalAnalisadas} notícias analisadas • 
            {dados.metadados.totalRelevantes} relevantes
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Busca */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                  placeholder="Título, resumo ou fonte..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Relevância mínima */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score mínimo: {filtros.relevanciaMinima}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={filtros.relevanciaMinima}
                  onChange={(e) => setFiltros({...filtros, relevanciaMinima: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>
              
              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={filtros.ordenacao}
                  onChange={(e) => setFiltros({...filtros, ordenacao: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="score">Score Total</option>
                  <option value="relevancia">Relevância</option>
                  <option value="categoria">Categoria</option>
                </select>
              </div>
            </div>

            {/* Estatísticas da Seleção */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Seleção Atual</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Manchete:</span>
                  <div className="font-medium text-blue-700">
                    {mancheteSelecionada ? '✓ Selecionada' : 'Não selecionada'}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Notícias:</span>
                  <div className="font-medium">{noticiasSelecionadas.size}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Duração estimada:</span>
                  <div className="font-medium">
                    {Array.from(noticiasSelecionadas).reduce((total, id) => {
                      const noticia = dados.rankingGeral.find(n => n.id === id);
                      return total + (noticia?.tempoEstimado || 0);
                    }, 0)} min
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Notas sobre a seleção..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <button
                onClick={salvarSelecao}
                disabled={!mancheteSelecionada}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
              >
                Salvar Seleção
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {/* Tabs de categorias */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-4">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => setAbaSelecionada(categoria)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        abaSelecionada === categoria
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {categoria === 'todas' ? 'Todas' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      {categoria !== 'todas' && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {dados.categorias[categoria as keyof typeof dados.categorias]?.length || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Sugestão de manchete */}
            {dados.sugestaoAutomatica.manchete && abaSelecionada === 'todas' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">💡 Sugestão de Manchete</h3>
                <NoticiaCard
                  noticia={dados.sugestaoAutomatica.manchete}
                  selecionada={mancheteSelecionada === dados.sugestaoAutomatica.manchete.id}
                  onSelecionar={(id) => setMancheteSelecionada(id === mancheteSelecionada ? null : id)}
                  onVerDetalhes={setNoticiaDetalhes}
                  destacarManchete={true}
                />
                <p className="text-yellow-700 text-sm mt-2">
                  {dados.sugestaoAutomatica.justificativa}
                  <span className="ml-2 font-medium">
                    (Confiança: {(dados.sugestaoAutomatica.confianca * 100).toFixed(0)}%)
                  </span>
                </p>
              </div>
            )}

            {/* Lista de notícias */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {abaSelecionada === 'todas' ? 'Todas as Notícias' : 
                   `Categoria: ${abaSelecionada.charAt(0).toUpperCase() + abaSelecionada.slice(1)}`}
                </h2>
                <span className="text-sm text-gray-500">
                  {noticiasFiltradas.length} notícias
                </span>
              </div>
              
              {noticiasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma notícia encontrada com os filtros aplicados
                </div>
              ) : (
                noticiasFiltradas.map((noticia) => (
                  <NoticiaCard
                    key={noticia.id}
                    noticia={noticia}
                    selecionada={noticiasSelecionadas.has(noticia.id)}
                    onSelecionar={toggleSelecaoNoticia}
                    onVerDetalhes={setNoticiaDetalhes}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      <DetalhesModal
        noticia={noticiaDetalhes}
        isOpen={!!noticiaDetalhes}
        onClose={() => setNoticiaDetalhes(null)}
        onSelecionar={toggleSelecaoNoticia}
        selecionada={noticiaDetalhes ? noticiasSelecionadas.has(noticiaDetalhes.id) : false}
      />
    </div>
  );
}" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
