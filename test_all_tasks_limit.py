import requests

base_url = 'http://127.0.0.1:8002'
task_id = 'task_manual_api_20250829_124734_03f48e16'

print(f'🔍 Test /all-tasks avec limite élevée:')

try:
    # Récupérer toutes les tâches avec une grande limite
    response = requests.get(base_url + '/all-tasks?limit=200', timeout=5)
    if response.status_code == 200:
        data = response.json()
        tasks = data.get('tasks', [])

        print(f'Total de tâches retournées: {len(tasks)}')
        print(f'Total dans la réponse: {data.get("total", "N/A")}')

        # Chercher notre tâche spécifique
        found = False
        for i, task in enumerate(tasks):
            if task.get('id') == task_id:
                found = True
                print(f'✅ Trouvée à l\'index {i}:')
                print(f'   Statut: {task.get("statut")}')
                print(f'   Validée: {task.get("validated")}')
                print(f'   Validation status: {task.get("validation_status")}')
                break

        if not found:
            print(f'❌ Tâche {task_id} toujours non trouvée')

    else:
        print(f'❌ Erreur /all-tasks: {response.status_code}')

except Exception as e:
    print(f'❌ Erreur: {e}')
