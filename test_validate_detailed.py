import requests

base_url = 'http://127.0.0.1:8002'

# Test détaillé du bouton "valider"
try:
    response = requests.get(base_url + '/all-tasks', timeout=5)
    if response.status_code == 200:
        data = response.json()
        tasks = data.get('tasks', [])

        print(f'🔍 Test détaillé du bouton "Valider"\n')

        # Trouver une tâche non validée
        test_task = None
        for task in tasks:
            if (task.get('statut') in ['pending', 'in_progress'] and
                task.get('validation_status') != 'validated' and
                not task.get('validated', False)):
                test_task = task
                break

        if test_task:
            task_id = test_task.get('id')
            print(f'📋 Tâche de test: {task_id[:20]}...')
            print(f'   Avant validation:')
            print(f'   - Statut: {test_task.get("statut")}')
            print(f'   - Validation status: {test_task.get("validation_status")}')
            print(f'   - Validated: {test_task.get("validated", False)}')
            print()

            # Tester la validation
            print('⚡ Validation en cours...')
            val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')

            if val_response.status_code == 200:
                print('✅ Requête de validation réussie')

                # Vérifier via /all-tasks
                print('\n🔄 Vérification via /all-tasks:')
                all_tasks_response = requests.get(base_url + '/all-tasks')
                if all_tasks_response.status_code == 200:
                    all_data = all_tasks_response.json()
                    all_tasks = all_data.get('tasks', [])

                    # Trouver la tâche mise à jour
                    updated_task = None
                    for t in all_tasks:
                        if t.get('id') == task_id:
                            updated_task = t
                            break

                    if updated_task:
                        print(f'   ✅ Tâche trouvée dans /all-tasks')
                        print(f'   - Statut: {updated_task.get("statut")}')
                        print(f'   - Validation status: {updated_task.get("validation_status")}')
                        print(f'   - Validated: {updated_task.get("validated", False)}')
                        print(f'   - Validated at: {updated_task.get("validated_at", "N/A")}')

                        if updated_task.get('validation_status') == 'validated':
                            print('\n🎉 SUCCÈS: La validation fonctionne correctement!')
                            print('   ✅ L\'icône "✓ Validée" devrait apparaître sur la carte')
                        else:
                            print('\n❌ PROBLÈME: La validation n\'a pas mis à jour validation_status')
                    else:
                        print(f'   ❌ Tâche non trouvée dans /all-tasks')
                else:
                    print(f'   ❌ Erreur /all-tasks: {all_tasks_response.status_code}')
            else:
                print(f'❌ Erreur validation: {val_response.status_code}')
                print(f'   Détails: {val_response.text[:200]}')
        else:
            print('❌ Aucune tâche de test trouvée')

    else:
        print(f'❌ Erreur backend: {response.status_code}')

except Exception as e:
    print(f'❌ Erreur: {e}')
