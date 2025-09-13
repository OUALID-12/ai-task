import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '../components/ui';
import { StatCard } from '../components/dashboard/StatCard';
import { apiService } from '../services/api';
import type { Task } from '../types';

const Dashboard31: React.FC = () => {
  const { 
    data: tasksResponse, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiService.getAllTasks(),
    refetchInterval: 30000,
  });

  const { 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiService.getDashboardMetrics(),
    refetchInterval: 30000,
  });

  if (tasksLoading || metricsLoading) {
    return <LoadingState message="Chargement..." className="min-h-screen" />;
  }

  if (tasksError) {
    return (
      <ErrorState 
        message="Erreur lors du chargement des données"
        className="min-h-screen"
      />
    );
  }

  const tasks = tasksResponse?.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.statut === 'completed').length;
  const pendingTasks = tasks.filter((t: Task) => t.statut === 'pending').length;
  const inProgressTasks = tasks.filter((t: Task) => t.statut === 'in_progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                🎯 Gestionnaire de Tâches
              </h1>
              <p className="mt-1 text-gray-600">
                Vue d'ensemble de vos tâches et performances
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Système actif</span>
            </div>
          </div>
        </div>
      </header>

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <StatCard
              title="Total"
              value={totalTasks}
              icon="📋"
              variant="primary"
            />
            <StatCard
              title="Terminées"
              value={completedTasks}
              icon="✅"
              variant="success"
              subtitle={`${completionRate.toFixed(0)}% du total`}
            />
            <StatCard
              title="En cours"
              value={inProgressTasks}
              icon="⚡"
              variant="warning"
            />
            <StatCard
              title="En attente"
              value={pendingTasks}
              icon="⏳"
              variant="default"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tâches Actives */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Tâches Actives</h3>
                        <p className="text-blue-100 text-sm">Gérez vos priorités efficacement</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{tasks.length}</div>
                      <div className="text-blue-100 text-xs">Total</div>
                    </div>
                  </div>
                </div>
                
                {tasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune tâche active</h3>
                    <p className="text-gray-600 mb-4">Commencez par créer votre première tâche</p>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg">
                      Créer une tâche
                    </button>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {tasks.slice(0, 10).map((task) => {
                      const priorityConfig = {
                        urgent: { 
                          bg: 'from-red-500 to-pink-500', 
                          text: 'text-white', 
                          icon: '🔥',
                          border: 'border-red-200',
                          shadow: 'shadow-red-100',
                          badgeBg: 'bg-red-500',
                          badgeText: 'text-white'
                        },
                        high: { 
                          bg: 'from-orange-400 to-red-400', 
                          text: 'text-white', 
                          icon: '⚡',
                          border: 'border-orange-200',
                          shadow: 'shadow-orange-100',
                          badgeBg: 'bg-orange-500',
                          badgeText: 'text-white'
                        },
                        medium: { 
                          bg: 'from-yellow-400 to-orange-400', 
                          text: 'text-white', 
                          icon: '⚠️',
                          border: 'border-yellow-200',
                          shadow: 'shadow-yellow-100',
                          badgeBg: 'bg-yellow-500',
                          badgeText: 'text-white'
                        },
                        low: { 
                          bg: 'from-green-400 to-blue-400', 
                          text: 'text-white', 
                          icon: '📝',
                          border: 'border-green-200',
                          shadow: 'shadow-green-100',
                          badgeBg: 'bg-green-500',
                          badgeText: 'text-white'
                        }
                      };

                      const statusConfig = {
                        pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'En attente' },
                        in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'En cours' },
                        completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Terminée' },
                        rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejetée' }
                      };

                      const priority = priorityConfig[task.priorite as keyof typeof priorityConfig] || priorityConfig.low;
                      const status = statusConfig[task.statut as keyof typeof statusConfig] || statusConfig.pending;

                      return (
                        <div key={task.id} className={`relative p-6 border-l-4 ${priority.border} hover:bg-gray-50 transition-all duration-300 ${priority.shadow} hover:shadow-lg group`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${priority.bg} flex items-center justify-center ${priority.text} shadow-md`}>
                                  <span className="text-lg">{priority.icon}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {task.description}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                                      {status.label}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${priority.badgeBg} ${priority.badgeText} shadow-sm`}>
                                      {task.priorite?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(task.created_at).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-blue-500 font-medium cursor-pointer hover:text-blue-700">
                                    Voir détails →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r ${priority.bg} shadow-lg`}></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar avec Aperçu Rapide amélioré */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-xl p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">Aperçu Rapide</h3>
                      <p className="text-indigo-100 text-sm">Votre performance aujourd'hui</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
                      <div className="text-sm text-indigo-100">Taux de réussite</div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div className="bg-white rounded-full h-2 transition-all duration-500" style={{width: `${completionRate}%`}}></div>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{inProgressTasks}</div>
                      <div className="text-sm text-indigo-100">En cours</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-xs">Active maintenant</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{completedTasks}</div>
                      <div className="text-sm text-indigo-100">Terminées</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs">Accomplies</span>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{pendingTasks}</div>
                      <div className="text-sm text-indigo-100">En attente</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                        <span className="text-xs">À traiter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance et Insights */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold">Performance</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">
                      {completionRate >= 80 ? '🏆' : completionRate >= 60 ? '🎯' : '💪'}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {completionRate >= 80 ? 'Performance Excellente !' :
                       completionRate >= 60 ? 'Bon Travail !' :
                       'Vous Pouvez Faire Mieux !'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {completionRate >= 80 ? 'Vous maîtrisez parfaitement vos tâches' :
                       completionRate >= 60 ? 'Vous êtes sur la bonne voie' :
                       'Concentrez-vous sur les priorités'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="text-xl font-bold text-blue-600">{completedTasks}</div>
                      <div className="text-sm text-blue-500 font-medium">Terminées</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
                      <div className="text-xl font-bold text-orange-600">{pendingTasks}</div>
                      <div className="text-sm text-orange-500 font-medium">En attente</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connexion Backend */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">Système</h3>
                        <p className="text-green-100 text-xs">Surveillance temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Actif</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">API Backend</div>
                          <div className="text-xs text-gray-500">Port 8002</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">Connecté</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Surveillance</div>
                          <div className="text-xs text-gray-500">Temps réel</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600 font-medium">Actif</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3.3 - Nouvelles Fonctionnalités */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Section Réunions */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl shadow-xl text-white overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Réunions du Jour</h3>
                        <p className="text-indigo-100 text-sm">Votre agenda aujourd'hui</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-indigo-100 text-xs">Prévues</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">📋 Réunion Équipe</h4>
                          <p className="text-indigo-100 text-sm">Point hebdomadaire avec l'équipe</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">10:00 - 11:00</div>
                          <div className="text-xs text-indigo-200">Dans 30 min</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">🎯 Review Projet</h4>
                          <p className="text-indigo-100 text-sm">Présentation des résultats</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">14:30 - 15:30</div>
                          <div className="text-xs text-indigo-200">Dans 4h</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">💼 Client Call</h4>
                          <p className="text-indigo-100 text-sm">Suivi projet client</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">16:00 - 17:00</div>
                          <div className="text-xs text-indigo-200">Dans 5h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm">
                      Voir toutes les réunions →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feed d'Activité & Bouton Nouvelle Tâche */}
            <div className="space-y-6">
              
              {/* Bouton Nouvelle Tâche - En haut pour visibilité */}
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl shadow-xl p-6 text-white text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Créer une Tâche</h3>
                <p className="text-emerald-100 text-sm mb-4">Ajoutez rapidement une nouvelle tâche</p>
                <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm">
                  ✨ Nouvelle Tâche
                </button>
              </div>
              
              {/* Feed d'Activité */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-pink-400 p-4 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold">Activité Récente</h3>
                      <p className="text-orange-100 text-xs">Dernières actions</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-4">
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">Tâche "Rapport mensuel" terminée</p>
                        <p className="text-xs text-gray-500">Il y a 2 heures</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">Nouvelle tâche "Email client" créée</p>
                        <p className="text-xs text-gray-500">Il y a 3 heures</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">Priorité "Présentation" mise à jour</p>
                        <p className="text-xs text-gray-500">Il y a 5 heures</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">Réunion "Planning" ajoutée</p>
                        <p className="text-xs text-gray-500">Il y a 1 jour</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">Tâche "Ancien projet" archivée</p>
                        <p className="text-xs text-gray-500">Il y a 2 jours</p>
                      </div>
                    </div>
                    
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                      Voir toute l'activité →
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Footer Summary */}
          <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-bold text-lg">Productivité</h4>
                <p className="text-gray-300 text-sm">
                  {completionRate.toFixed(0)}% de tâches terminées
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-full h-2 transition-all duration-500" style={{width: `${completionRate}%`}}></div>
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-bold text-lg">Efficacité</h4>
                <p className="text-gray-300 text-sm">
                  {inProgressTasks} tâches actives
                </p>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-yellow-400">En cours</span>
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-bold text-lg">Objectif</h4>
                <p className="text-gray-300 text-sm">
                  {completionRate >= 80 ? 'Performance excellente !' :
                   completionRate >= 60 ? 'Bon travail !' :
                   'Continuez vos efforts !'}
                </p>
                <div className="text-2xl mt-2">
                  {completionRate >= 80 ? '🏆' : completionRate >= 60 ? '🎖️' : '💪'}
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard31;
