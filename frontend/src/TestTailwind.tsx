const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-900 text-white font-sans p-10">
      {/* Header de test */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-500">
          🎨 Test Tailwind CSS ✅
        </h1>
        <p className="text-xl text-blue-100">
          Configuration complète : Couleurs + Polices + Responsive
        </p>
      </div>

      {/* Test des couleurs fonctionnelles */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-600/20 backdrop-blur rounded-lg p-6 border border-white/10">
          <div className="w-12 h-12 bg-blue-600 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Couleur Primary</h3>
          <p className="text-sm text-blue-200">Bleu professionnel</p>
        </div>
        
        <div className="bg-yellow-400/20 backdrop-blur rounded-lg p-6 border border-white/10">
          <div className="w-12 h-12 bg-yellow-400 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Couleur Secondary</h3>
          <p className="text-sm text-blue-200">Jaune accent</p>
        </div>
        
        <div className="bg-green-500/20 backdrop-blur rounded-lg p-6 border border-white/10">
          <div className="w-12 h-12 bg-green-500 rounded-full mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Couleur Accent</h3>
          <p className="text-sm text-blue-200">Vert moderne</p>
        </div>
      </div>

      {/* Test des polices */}
      <div className="bg-white/10 backdrop-blur rounded-xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-6">Test des Polices</h2>
        <div className="space-y-4">
          <p className="text-lg font-bold">
            <span className="text-yellow-400 font-bold">Font Bold:</span> 
            Cette police est utilisée pour les titres et éléments importants
          </p>
          <p className="text-lg font-normal">
            <span className="text-green-400 font-bold">Font Normal:</span> 
            Cette police est utilisée pour le texte de contenu et la lecture
          </p>
        </div>
      </div>

      {/* Test des composants et interactions */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold mb-6">Test des Composants</h2>
        
        {/* Boutons avec effets DIFFÉRENTS */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-300 shadow-lg">
            🌟 Effet Couleur
          </button>
          <button className="bg-green-500 hover:bg-green-600 transform hover:scale-110 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg">
            ✅ Effet Scale
          </button>
          <button className="bg-blue-600 hover:shadow-2xl text-white font-semibold px-6 py-3 rounded-lg transition-shadow duration-300 shadow-lg">
            🔵 Effet Ombre
          </button>
        </div>

        {/* Cards de test */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Performance</h3>
            <p className="text-blue-100">Tailwind fonctionne parfaitement avec Vite</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">Couleurs</h3>
            <p className="text-blue-100">Couleurs standards validées</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20 sm:col-span-2 lg:col-span-1">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">Responsive</h3>
            <p className="text-blue-100">Design adaptatif fonctionnel</p>
          </div>
        </div>

        {/* Message de validation */}
        <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Tailwind CSS Entièrement Fonctionnel !
          </h2>
          <p className="text-lg">
            Configuration validée - Prêt pour le développement de votre frontend
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;
