import requests

base_url = 'http://127.0.0.1:8002'

# Test complet de la validation avec vérification des données
try:
    # 1. Créer une tâche de test
    test_task = {
        'title': 'Test validation interface',
        'description': 'Tâche pour tester la mise à jour de l\'interface après validation',
        'priority': 'medium',
        'department': 'Test Department',
        'tags': ['test', 'validation']
    }

    print('🧪 Test complet de validation...\n')

    # Créer la tâche
    create_response = requests.post(base_url + '/tasks/create', json=test_task, timeout=10)
    if create_response.status_code == 200:
        task_data = create_response.json()
        task_id = task_data.get('task_id')
        print(f'✅ Tâche créée: {task_id}')

        # Vérifier l'état initial
        initial_response = requests.get(base_url + '/all-tasks', timeout=5)
        if initial_response.status_code == 200:
            initial_data = initial_response.json()
            initial_tasks = initial_data.get('tasks', [])

            for task in initial_tasks:
                if task.get('id') == task_id:
                    print(f'📋 État initial:')
                    print(f'   Statut: {task.get("statut")}')
                    print(f'   Validation status: {task.get("validation_status")}')
                    print(f'   Validated: {task.get("validated", False)}')
                    break

        # Valider la tâche
        print(f'\n🔄 Validation de la tâche...')
        val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')
        print(f'   Réponse API: {val_response.status_code}')

        if val_response.status_code == 200:
            # Vérifier l'état après validation
            final_response = requests.get(base_url + '/all-tasks', timeout=5)
            if final_response.status_code == 200:
                final_data = final_response.json()
                final_tasks = final_data.get('tasks', [])

                for task in final_tasks:
                    if task.get('id') == task_id:
                        print(f'\\n📋 État après validation:')
                        print(f'   Statut: {task.get("statut")}')
                        print(f'   Validation status: {task.get("validation_status")}')
                        print(f'   Validated: {task.get("validated", False)}')

                        if task.get('validation_status') == 'validated':
                            print(f'\\n✅ SUCCÈS: La validation a fonctionné!')
                            print(f'🎯 L\'interface devrait maintenant afficher "✓ Validée"')
                        else:
                            print(f'\\n❌ ÉCHEC: La validation n\'a pas mis à jour le statut')
                        break
                else:
                    print(f'\\n❌ Tâche non trouvée après validation')
            else:
                print(f'\\n❌ Erreur récupération après validation: {final_response.status_code}')
        else:
            print(f'\\n❌ Erreur validation: {val_response.status_code}')
            print(val_response.text[:200])
    else:
        print(f'❌ Erreur création tâche: {create_response.status_code}')
        print(create_response.text[:200])

except Exception as e:
    print(f'❌ Erreur: {e}')
