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
import EfemeridesSelector from '../components/EfemeridesSelector';
import { carregarNoticias, salvarSelecaoManual, carregarSugestoesAbertura } from '../lib/api';
import { NoticiasCategorizadas, NoticiaCompleta, SelecaoManual, SugestoesAbertura, Efemeride } from '../lib/types';

export default function Home() {
  // Estados principais
  const [dados, setDados] = useState<NoticiasCategorizadas | null>(null);
  const [sugestoesAbertura, setSugestoesAbertura] = useState<SugestoesAbertura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados da seleção
  const [mancheteSelecionada, setMancheteSelecionada] = useState<string | null>(null);
  const [noticiasSelecionadas, setNoticiasSelecionadas] = useState<Set<string>>(new Set());
  const [efemerideSelecionada, setEfemerideSelecionada] = useState<{
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas';
    indice: number;
    efemeride: Efemeride;
  } | null>(null);
  
  const [abaSelecionada, setAbaSelecionada] = useState<string>('todas');

  // Função auxiliar para buscar notícia de forma segura
  const buscarNoticia = (id: string): NoticiaCompleta | undefined => {
    if (!dados) return undefined;
    // Primeiro tenta no rankingGeral, depois nas categorias
    let noticia = dados.rankingGeral?.find((n: NoticiaCompleta) => n.id === id);
    if (!noticia && dados.categorias) {
      for (const categoria of Object.values(dados.categorias)) {
        if (Array.isArray(categoria)) {
          noticia = categoria.find((n: NoticiaCompleta) => n.id === id);
          if (noticia) break;
        }
      }
    }
    return noticia;
  };

  // Carregar dados na inicialização
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar dados em paralelo
        const [noticiasData, sugestoesData] = await Promise.all([
          carregarNoticias(),
          carregarSugestoesAbertura()
        ]);
        
        if (!noticiasData) {
          throw new Error('Não foi possível carregar as notícias');
        }
        
        setDados(noticiasData);
        setSugestoesAbertura(sugestoesData);
        
        // Se há sugestões de abertura, definir efeméride recomendada como padrão
        if (sugestoesData?.opcoesEfemerides?.recomendacao) {
          const { tipo, indice } = sugestoesData.opcoesEfemerides.recomendacao;
          const efemerides = sugestoesData.opcoesEfemerides[tipo];
          if (efemerides && efemerides[indice]) {
            setEfemerideSelecionada({
              tipo,
              indice,
              efemeride: efemerides[indice]
            });
          }
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
    
    let noticias: NoticiaCompleta[];
    
    if (abaSelecionada === 'selecionadas') {
      const todasAsNoticias: NoticiaCompleta[] = Object.values(dados.categorias).flat();
      noticias = todasAsNoticias.filter((noticia: NoticiaCompleta) => noticiasSelecionadas.has(noticia.id));
    } else if (abaSelecionada === 'todas') {
      // Para "Todas": combinar todas as categorias e ordenar APENAS por relevância
      noticias = Object.values(dados.categorias).flat();
      // Ordenar puramente por relevanceScore (maior para menor), ignorando categoria
      noticias.sort((a: NoticiaCompleta, b: NoticiaCompleta) => 
        (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );
      return noticias; // Retorna direto para evitar dupla ordenação
    } else {
      noticias = dados.categorias[abaSelecionada as keyof typeof dados.categorias] || [];
    }
    
    // Ordenação para outras abas (não "todas")
    noticias.sort((a: NoticiaCompleta, b: NoticiaCompleta) => 
      (b.scoreTotal || b.relevanceScore || 0) - (a.scoreTotal || a.relevanceScore || 0)
    );
    
    return noticias;
  }, [dados, abaSelecionada, noticiasSelecionadas]);

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

  const selecionarEfemeride = (
    tipo: 'fatosBrasileiros' | 'efemeridesIA' | 'curiosidadesAmazonicas',
    indice: number,
    efemeride: Efemeride
  ) => {
    setEfemerideSelecionada({ tipo, indice, efemeride });
  };

  const salvarSelecao = async () => {
    if (!dados || !mancheteSelecionada) {
      alert('Por favor, selecione uma manchete primeiro');
      return;
    }
    
    try {
      const mancheteNoticia = buscarNoticia(mancheteSelecionada);
      if (!mancheteNoticia) {
        alert('Manchete não encontrada');
        return;
      }
      
      // Coletar todas as notícias selecionadas com informações completas
      const noticiasCompletas: NoticiaCompleta[] = [];
      Array.from(noticiasSelecionadas).forEach(id => {
        const noticia = buscarNoticia(id);
        if (noticia) {
          noticiasCompletas.push(noticia);
        }
      });
      
      // Agrupar notícias por categoria (mantendo compatibilidade)
      const noticiasEscolhidas: Array<{categoria: string; ids: string[]; total: number}> = [];
      const categorias = new Set<string>();
      
      noticiasCompletas.forEach(noticia => {
        categorias.add(noticia.categoria);
      });
      
      categorias.forEach(categoria => {
        const noticiasCategoria = noticiasCompletas.filter(n => n.categoria === categoria);
        
        if (noticiasCategoria.length > 0) {
          noticiasEscolhidas.push({
            categoria,
            ids: noticiasCategoria.map(n => n.id),
            total: noticiasCategoria.length,
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
        // Adicionar dados completos da manchete
        mancheteCompleta: mancheteNoticia,
        noticiasEscolhidas,
        // Adicionar array com dados completos das notícias selecionadas
        noticiasCompletas: noticiasCompletas,
        efemerideSelecionada: efemerideSelecionada || undefined,
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

  const categorias = ['todas', 'selecionadas', 'efemerides', 'politica', 'economia', 'cidades', 'cultura', 'esportes', 'geral'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Curadoria de Notícias - {new Date(dados.data).toLocaleDateString('pt-BR')}
          </h1>
          <p className="text-gray-600 mt-1">
            {dados.metadados?.totalAnalisadas || 0} notícias analisadas • 
            {dados.metadados?.totalRelevantes || 0} relevantes
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* A seção de Filtros foi removida */}

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
                  <div className="font-medium text-black">{noticiasSelecionadas.size}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Efeméride:</span>
                  <div className="font-medium text-purple-700">
                    {efemerideSelecionada ? '✓ Selecionada' : 'Não selecionada'}
                  </div>
                  {efemerideSelecionada && (
                    <div className="mt-1 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                      <div className="font-medium text-purple-800">{efemerideSelecionada.efemeride.titulo}</div>
                      <div className="text-purple-600 mt-1">{efemerideSelecionada.efemeride.texto.substring(0, 100)}...</div>
                    </div>
                  )}
                </div>
                
                {/* Resumo por categoria das selecionadas */}
                <div>
                  <span className="text-sm text-gray-600">Selecionadas por categoria:</span>
                  <ul className="mt-1 text-sm">
                    {(() => {
                      if (!dados) return null;
                      // Conta selecionadas por categoria
                      const resumo = Array.from(noticiasSelecionadas).reduce((acc, id) => {
                        const noticia = buscarNoticia(id);
                        if (noticia) {
                          acc[noticia.categoria] = (acc[noticia.categoria] || 0) + 1;
                        }
                        return acc;
                      }, {} as Record<string, number>);
                      // Renderiza lista
                      return Object.entries(resumo).map(([cat, qtd]) => (
                        <li key={cat} className="text-black">
                          <span className="font-medium">{cat.charAt(0).toUpperCase() + cat.slice(1)}:</span> {qtd}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
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
                <nav className="-mb-px flex space-x-4 px-4">
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
                      {categoria === 'todas' ? 'Todas' : 
                       categoria === 'selecionadas' ? 'Selecionadas' :
                       categoria === 'efemerides' ? '📅 Efemérides' :
                       categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      {categoria === 'selecionadas' ? (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {noticiasSelecionadas.size}
                        </span>
                      ) : categoria === 'efemerides' ? (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {efemerideSelecionada ? '✓' : '?'}
                        </span>
                      ) : categoria !== 'todas' && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {dados.categorias[categoria as keyof typeof dados.categorias]?.length || 0}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Conteúdo baseado na aba selecionada */}
            {abaSelecionada === 'efemerides' ? (
              // Mostrar seletor de efemérides
              sugestoesAbertura?.opcoesEfemerides ? (
                <EfemeridesSelector
                  opcoes={sugestoesAbertura.opcoesEfemerides}
                  selecionada={efemerideSelecionada ? {
                    tipo: efemerideSelecionada.tipo,
                    indice: efemerideSelecionada.indice
                  } : null}
                  onSelecionar={selecionarEfemeride}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Carregando opções de efemérides...
                </div>
              )
            ) : (
              // Mostrar lista de notícias
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {abaSelecionada === 'todas' ? 'Todas as Notícias' : 
                     abaSelecionada === 'selecionadas' ? 'Notícias Selecionadas' :
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
                  noticiasFiltradas.map((noticia: NoticiaCompleta) => (
                    <NoticiaCard
                      key={noticia.id}
                      noticia={noticia}
                      selecionada={noticiasSelecionadas.has(noticia.id)}
                      onSelecionar={toggleSelecaoNoticia}
                      isManchete={mancheteSelecionada === noticia.id}
                      onSetManchete={(id) => setMancheteSelecionada(id === mancheteSelecionada ? null : id)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
