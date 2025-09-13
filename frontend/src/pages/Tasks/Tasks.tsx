import React from 'react';

const Tasks: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Gestion des Tâches
        </h1>
        <p className="text-gray-600 mt-2">
          Interface complète pour gérer toutes vos tâches extraites par IA
        </p>
      </div>

      {/* Barre de recherche et filtres - PLEIN ÉCRAN */}
      <div className="bg-white rounded-lg shadow mb-6 flex-shrink-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled
              />
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-not-allowed"
                disabled
              >
                Filtres
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled
              >
                + Nouvelle Tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches - UTILISE TOUT L'ESPACE RESTANT */}
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col min-h-0">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-medium text-gray-900">Toutes les Tâches</h2>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Interface de gestion des tâches en cours de développement...</p>
              <p className="text-sm mt-2">Phase 4 : Recherche, filtres, vue cartes/tableau, actions CRUD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
