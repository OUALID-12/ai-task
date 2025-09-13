import requests

base_url = 'http://127.0.0.1:8002'
task_id = 'task_manual_api_20250829_124734_03f48e16'

print(f'🔍 Recherche de la tâche: {task_id}')

# Vérifier avec /all-tasks
try:
    response = requests.get(base_url + '/all-tasks', timeout=5)
    if response.status_code == 200:
        data = response.json()
        tasks = data.get('tasks', [])

        found_in_all = False
        for task in tasks:
            if task.get('id') == task_id:
                found_in_all = True
                print(f'✅ Trouvée dans /all-tasks:')
                print(f'   Statut: {task.get("statut")}')
                print(f'   Validation: {task.get("validation_status")}')
                break

        if not found_in_all:
            print(f'❌ Non trouvée dans /all-tasks')

        # Vérifier avec /tasks/{id}
        detail_response = requests.get(base_url + '/tasks/' + task_id, timeout=5)
        print(f'\n🔍 /tasks/{task_id}: {detail_response.status_code}')

        if detail_response.status_code == 200:
            detail_data = detail_response.json()
            task_detail = detail_data.get('task', {})
            print(f'✅ Trouvée dans /tasks/{{id}}:')
            print(f'   Statut: {task_detail.get("statut")}')
            print(f'   Validation: {task_detail.get("validation_status")}')
        elif detail_response.status_code == 404:
            print(f'❌ Non trouvée dans /tasks/{{id}} (404)')
        else:
            print(f'❌ Erreur /tasks/{{id}}: {detail_response.status_code}')

    else:
        print(f'❌ Erreur /all-tasks: {response.status_code}')

except Exception as e:
    print(f'❌ Erreur: {e}')
