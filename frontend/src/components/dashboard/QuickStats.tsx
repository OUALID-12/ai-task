import React from 'react';

export interface QuickStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, className = '' }) => {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          ⚡ Aperçu rapide
        </h3>
        <div className="text-2xl">
          {completionRate >= 80 ? '🎯' : completionRate >= 50 ? '📊' : '⏳'}
        </div>
      </div>
      
      {/* Barre de progression principale */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-sm font-bold text-blue-600">{completionRate.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
      
      {/* Statistiques en grille */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600 font-medium">Total</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          <div className="text-xs text-green-600 font-medium">Terminées</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-xs text-yellow-600 font-medium">En attente</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
          <div className="text-xs text-blue-600 font-medium">En cours</div>
        </div>
      </div>
      
      {/* Message motivationnel */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <p className="text-sm text-center text-gray-700">
          {completionRate >= 90 ? "🏆 Excellent travail ! Vous êtes très productif !" :
           completionRate >= 70 ? "🚀 Bon rythme ! Continuez comme ça !" :
           completionRate >= 50 ? "💪 Vous progressez bien, restez concentré !" :
           "🎯 Commencez par vos tâches prioritaires !"}
        </p>
      </div>
    </div>
  );
};

export default QuickStats;
