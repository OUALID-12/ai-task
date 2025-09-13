import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingState, ErrorState } from '../components/ui';
import { StatCard } from '../components/dashboard/StatCard';
import { apiService } from '../services/api';
import type { Task } from '../types';

const Dashboard31: React.FC = () => {
  console.log('Dashboard31: Component mounted/updated');

  React.useEffect(() => {
    console.log('Dashboard31: useEffect triggered');
    return () => {
      console.log('Dashboard31: Component will unmount');
    };
  }, []);

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

  // Tâches prioritaires pour le panneau latéral
  const {
    data: priorityTasksData,
    isLoading: priorityLoading,
    error: priorityError,
  } = useQuery({
    queryKey: ['priority-tasks'],
    queryFn: () => apiService.getPriorityTasks(6),
    refetchInterval: 60000,
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
    <div className="min-h-full">
      {/* Contenu principal - Dashboard intégré dans le Layout */}
      <div className="max-w-7xl mx-auto">
        <main className="pb-8">
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
            <div className="lg:col-span-2 space-y-6">
                             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                 <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="p-2 bg-blue-100 rounded-lg">
                         <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-gray-900">Tâches Actives</h3>
                         <p className="text-gray-500 text-sm">Gérez vos priorités efficacement</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                       <div className="text-gray-500 text-xs">Total</div>
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
                                         <button className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg">
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

              {/* Réunions du Jour - Style simplifié */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Réunions du Jour</h3>
                        <p className="text-gray-500 text-sm">Votre agenda aujourd'hui</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">3</div>
                      <div className="text-gray-500 text-xs">Prévues</div>
                    </div>
                    </div>
                  </div>
                  
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                        <h4 className="font-medium text-gray-900">Réunion Équipe</h4>
                        <p className="text-gray-500 text-sm">Point hebdomadaire avec l'équipe</p>
                        </div>
                        <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">10:00 - 11:00</div>
                        <div className="text-xs text-gray-500">Dans 30 min</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                        <h4 className="font-medium text-gray-900">Review Projet</h4>
                        <p className="text-gray-500 text-sm">Présentation des résultats</p>
                        </div>
                        <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">14:00 - 15:00</div>
                        <div className="text-xs text-gray-500">Cet après-midi</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                        <h4 className="font-medium text-gray-900">Appel Client</h4>
                        <p className="text-gray-500 text-sm">Suivi du projet en cours</p>
                        </div>
                        <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">16:30 - 17:00</div>
                        <div className="text-xs text-gray-500">Fin de journée</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                                           <button 
                        onClick={() => window.location.href = '/meetings'}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Voir toutes les réunions →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar avec Aperçu Rapide amélioré */}
            <div className="space-y-6">
              {/* Tâches prioritaires */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-gray-900 font-semibold">Tâches prioritaires</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Top 6 par priorité et statut</p>
                </div>
                <div className="p-4">
                  {priorityLoading ? (
                    <LoadingState message="Chargement des tâches prioritaires..." />
                  ) : priorityError ? (
                    <ErrorState message="Impossible de charger les tâches prioritaires" />
                  ) : (priorityTasksData || []).length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune tâche prioritaire</div>
                  ) : (
                    <ul className="space-y-3" role="list" aria-label="Liste des tâches prioritaires">
                      {(priorityTasksData || []).map((t: Task) => (
                        <li key={t.id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={t.description}>{t.description}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t.responsable || '—'}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                              t.priorite === 'urgent' ? 'bg-red-50 text-red-700' :
                              t.priorite === 'high' ? 'bg-amber-50 text-amber-700' :
                              t.priorite === 'medium' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                            }`}>{t.priorite}</span>
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium ${
                              t.statut === 'completed' ? 'bg-green-50 text-green-700' :
                              t.statut === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                              t.statut === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                            }`}>
                              {t.statut === 'completed' ? 'Terminée' : t.statut === 'in_progress' ? 'En cours' : t.statut === 'rejected' ? 'Rejetée' : 'En attente'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Aperçu Rapide</h3>
                      <p className="text-gray-500 text-sm">Votre performance aujourd'hui</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    </div>
                  </div>
                  
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600">Taux de réussite</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 rounded-full h-2 transition-all duration-500" style={{width: `${completionRate}%`}}></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{inProgressTasks}</div>
                      <div className="text-sm text-gray-600">En cours</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Active maintenant</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
                      <div className="text-sm text-gray-600">Terminées</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Accomplies</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{pendingTasks}</div>
                      <div className="text-sm text-gray-600">En attente</div>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">À traiter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance et Insights */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                 <div className="bg-gray-50 p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-100 rounded-lg">
                       <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                     <h3 className="font-semibold text-gray-900">Performance</h3>
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
                     <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="text-xl font-bold text-gray-900">{completedTasks}</div>
                       <div className="text-sm text-gray-600 font-medium">Terminées</div>
                    </div>
                     <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="text-xl font-bold text-gray-900">{pendingTasks}</div>
                       <div className="text-sm text-gray-600 font-medium">En attente</div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Activité Récente - Prend toute la largeur */}
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             <div className="bg-gray-50 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-blue-100 rounded-lg">
                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-gray-900">Activité Récente</h3>
                     <p className="text-gray-500 text-sm">Dernières actions et mises à jour</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-bold text-gray-900">8</div>
                   <div className="text-gray-500 text-xs">Aujourd'hui</div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Tâche "Rapport mensuel" terminée</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 2 heures • Priorité haute</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Terminée</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Nouvelle tâche "Email client" créée</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 3 heures • Priorité moyenne</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Nouvelle</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Priorité "Présentation" mise à jour</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 5 heures • Priorité haute</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Modifiée</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Réunion "Planning" ajoutée</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 1 jour • 14h00-15h00</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Planifiée</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Tâche "Ancien projet" archivée</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 2 jours • Archive</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Archivée</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-semibold">Assignation équipe "Développement"</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a 3 jours • 3 membres</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Assignée</span>
                    </div>
                  </div>
                </div>
                
              </div>
              
              <div className="mt-6 text-center">
                                   <button 
                    onClick={() => window.location.href = '/tasks'}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Voir toutes les tâches →
                </button>
              </div>
            </div>
          </div>

          {/* Footer Summary */}
           <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">📊</div>
                 <h4 className="font-bold text-lg text-gray-900">Productivité</h4>
                 <p className="text-gray-600 text-sm">
                  {completionRate.toFixed(0)}% de tâches terminées
                </p>
                 <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                   <div className="bg-blue-600 rounded-full h-2 transition-all duration-500" style={{width: `${completionRate}%`}}></div>
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                 <h4 className="font-bold text-lg text-gray-900">Efficacité</h4>
                 <p className="text-gray-600 text-sm">
                  {inProgressTasks} tâches actives
                </p>
                <div className="flex items-center justify-center mt-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                   <span className="text-xs text-gray-500">En cours</span>
                </div>
              </div>
              <div>
                <div className="text-3xl mb-2">🎯</div>
                 <h4 className="font-bold text-lg text-gray-900">Objectif</h4>
                 <p className="text-gray-600 text-sm">
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
