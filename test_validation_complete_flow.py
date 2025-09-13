import requests
import time

base_url = 'http://127.0.0.1:8002'

print('🔄 Test complet du flux validation:')

try:
    # 1. Créer une tâche
    print('\n1️⃣ Création de la tâche...')
    create_response = requests.post(base_url + '/tasks/create', json={
        'description': 'Test validation complète - Tâche pour vérifier le flux complet',
        'responsable': 'test_user',
        'priorite': 'medium',
        'source': 'manual_test'
    }, timeout=5)

    if create_response.status_code == 200:
        task_data = create_response.json()
        task_id = task_data.get('task', {}).get('id')
        print(f'✅ Tâche créée: {task_id}')

        # 2. Attendre un peu
        time.sleep(1)

        # 3. Valider la tâche
        print('\n2️⃣ Validation de la tâche...')
        validate_response = requests.patch(base_url + f'/tasks/{task_id}/validate', timeout=5)

        if validate_response.status_code == 200:
            print('✅ Tâche validée avec succès')

            # 4. Vérifier dans /all-tasks avec limite élevée
            print('\n3️⃣ Vérification dans /all-tasks...')
            tasks_response = requests.get(base_url + '/all-tasks?limit=200', timeout=5)

            if tasks_response.status_code == 200:
                data = tasks_response.json()
                tasks = data.get('tasks', [])

                # Chercher notre tâche
                found = False
                for task in tasks:
                    if task.get('id') == task_id:
                        found = True
                        print(f'✅ Trouvée dans /all-tasks:')
                        print(f'   Statut: {task.get("statut")}')
                        print(f'   Validée: {task.get("validated")}')
                        print(f'   Validation status: {task.get("validation_status")}')
                        break

                if not found:
                    print(f'❌ Tâche {task_id} non trouvée dans /all-tasks')
                    print(f'Tâches disponibles: {len(tasks)}')
                else:
                    print('\n🎉 Test réussi ! La validation fonctionne correctement.')
            else:
                print(f'❌ Erreur /all-tasks: {tasks_response.status_code}')
        else:
            print(f'❌ Erreur validation: {validate_response.status_code}')
    else:
        print(f'❌ Erreur création: {create_response.status_code}')

except Exception as e:
    print(f'❌ Erreur: {e}')
