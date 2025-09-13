function DebugApp() {
  console.log('DebugApp rendering...');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔧 Debug Dashboard</h1>
      <p style={{ color: '#666' }}>Si vous voyez ce message, React fonctionne !</p>
      
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>✅ Tests de Base</h2>
        <ul>
          <li>✅ React fonctionne</li>
          <li>✅ CSS en ligne appliqué</li>
          <li>✅ JavaScript exécuté</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>🌐 Test API Simple</h2>
        <button 
          onClick={() => {
            fetch('http://127.0.0.1:8002/all-tasks')
              .then(res => res.json())
              .then(data => {
                console.log('API Response:', data);
                alert('API fonctionne ! Vérifiez la console.');
              })
              .catch(err => {
                console.error('API Error:', err);
                alert('Erreur API : ' + err.message);
              });
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
          Tester API
        </button>
      </div>
    </div>
  );
}

export default DebugApp;
