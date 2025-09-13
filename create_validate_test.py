import requests

base_url = 'http://127.0.0.1:8002'

# Créer une tâche de test pour vérifier le bouton "valider" dans l'interface
test_task = {
    'title': 'Test bouton Valider',
    'description': 'Tâche créée pour tester le bouton de validation et l\'icône de validation',
    'priority': 'medium',
    'deadline': '2025-09-15T10:00:00',
    'department': 'Test Department',
    'tags': ['test', 'validation']
}

print('🧪 Création d\'une tâche de test pour le bouton "Valider"...')
try:
    response = requests.post(base_url + '/tasks/create', json=test_task, timeout=10)
    if response.status_code == 200:
        data = response.json()
        task_id = data.get('task_id')
        print('✅ Tâche créée avec succès!')
        print(f'🆔 ID: {task_id}')
        print('📋 Statut initial: pending')
        print()
        print('🎯 Test du bouton "Valider":')
        print('1. Ouvrez http://localhost:5174/ dans votre navigateur')
        print('2. Trouvez la tâche "Test bouton Valider"')
        print('3. Cliquez sur le menu "Actions" (⚙️)')
        print('4. Cliquez sur "Valider"')
        print('5. Confirmez la validation')
        print()
        print('🔍 Résultat attendu:')
        print('   ✅ L\'icône "✓ Validée" devrait apparaître sur la carte')
        print('   ✅ Le statut devrait passer à "validated"')
        print('   ✅ La tâche devrait garder son statut "pending"')
        print()
        print('📊 Pour vérifier que ça marche:')
        print('   - L\'icône verte "✓ Validée" apparaît sur la carte')
        print('   - Le bouton "Valider" disparaît du menu Actions')
        print('   - Les boutons "Rejeter" et "Terminer" restent disponibles')
    else:
        print(f'❌ Erreur création: {response.status_code}')
        print(response.text[:300])

except Exception as e:
    print(f'❌ Erreur: {e}')
