import requests

def test_validation_flow():
    print('🧪 TEST RAPIDE DE VALIDATION\n')

    base_url = 'http://127.0.0.1:8002'

    try:
        # 1. Récupérer les tâches
        print('1️⃣ Récupération des tâches...')
        response = requests.get(f'{base_url}/all-tasks', timeout=5)
        if response.status_code != 200:
            print(f'❌ Erreur récupération: {response.status_code}')
            return

        data = response.json()
        tasks = data.get('tasks', [])

        # 2. Trouver une tâche non validée
        test_task = None
        for task in tasks:
            if (task.get('validation_status') != 'validated' and 
                task.get('statut') in ['pending', 'in_progress']):
                test_task = task
                break

        if not test_task:
            print('❌ Aucune tâche de test trouvée')
            return

        task_id = test_task.get('id')
        print(f'🎯 Tâche trouvée: {task_id[:20]}...')
        print(f'   Status actuel: {test_task.get("validation_status")}')

        # 3. Tester la validation
        print('\n2️⃣ Test de validation...')
        val_response = requests.patch(f'{base_url}/tasks/{task_id}/validate', timeout=5)

        if val_response.status_code == 200:
            print('✅ Validation API réussie!')

            # 4. Vérifier le changement
            print('\n3️⃣ Vérification du changement...')
            updated_response = requests.get(f'{base_url}/all-tasks', timeout=5)

            if updated_response.status_code == 200:
                updated_data = updated_response.json()
                updated_tasks = updated_data.get('tasks', [])

                updated_task = None
                for t in updated_tasks:
                    if t.get('id') == task_id:
                        updated_task = t
                        break

                if updated_task:
                    new_status = updated_task.get('validation_status')
                    new_validated = updated_task.get('validated', False)
                    print(f'✅ Status après validation: {new_status}')
                    print(f'✅ Validated: {new_validated}')

                    if new_status == 'validated' and new_validated:
                        print('\n🎉 VALIDATION RÉUSSIE !')
                        print('\n📋 À TESTER DANS LE NAVIGATEUR:')
                        print('   1. Ouvrez http://localhost:5174/test-validation')
                        print('   2. Cliquez sur "Tester Validation"')
                        print('   3. Puis allez dans http://localhost:5174/tasks')
                        print('   4. Vérifiez l\'icône verte sur la carte')
                        print('   5. Cliquez sur Actions pour voir les boutons')
                    else:
                        print('\n❌ La validation n\'a pas fonctionné correctement')
                else:
                    print('❌ Tâche non trouvée après validation')
            else:
                print(f'❌ Erreur vérification: {updated_response.status_code}')
        else:
            print(f'❌ Erreur validation: {val_response.status_code}')
            print(f'   Détails: {val_response.text[:200]}')

    except Exception as e:
        print(f'❌ Erreur: {e}')

if __name__ == '__main__':
    test_validation_flow()
