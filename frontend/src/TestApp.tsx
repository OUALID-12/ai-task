import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'red' }}>🎯 Test App - Phase 3.1</h1>
      <p>Si vous voyez ce message, le frontend fonctionne !</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Statut de l'application :</h2>
        <p>✅ React fonctionne</p>
        <p>✅ TypeScript fonctionne</p>
        <p>✅ Vite fonctionne</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Test de connexion API :</h3>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('http://127.0.0.1:8002/');
              const data = await response.json();
              console.log('API Response:', data);
              alert('API fonctionne ! Vérifiez la console pour les détails.');
            } catch (error) {
              console.error('API Error:', error);
              alert('Erreur API : ' + (error as Error).message);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tester l'API
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>Port Backend: 8002</p>
        <p>Port Frontend: 5173</p>
        <p>Date: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestApp;
