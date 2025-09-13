import React, { useState } from 'react';
import { apiService } from './services/api';

const TestValidation: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testValidation = async () => {
    setLoading(true);
    setResult('🔄 Test en cours...');

    try {
      // D'abord récupérer une tâche
      const tasksResponse = await apiService.getAllTasks();
      const tasks = tasksResponse.tasks || [];

      if (tasks.length === 0) {
        setResult('❌ Aucune tâche trouvée');
        return;
      }

      const testTask = tasks.find(t => t.validation_status !== 'validated');
      if (!testTask) {
        setResult('❌ Aucune tâche non validée trouvée');
        return;
      }

      setResult(`🎯 Test de validation pour: ${testTask.id.slice(0, 20)}...`);

      // Tester la validation
      const validationResult = await apiService.validateTask(testTask.id);

      if (validationResult.status === 'success') {
        setResult(`✅ Validation réussie! Status: ${validationResult.data?.validation_status}`);
      } else {
        setResult(`❌ Échec validation: ${validationResult.message || 'Erreur inconnue'}`);
      }

    } catch (error) {
      console.error('Erreur test:', error);
      setResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test Validation API</h2>
      <button
        onClick={testValidation}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Tester Validation'}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
};

export default TestValidation;
