import requests

base_url = 'http://127.0.0.1:8002'

# Test rapide avec une tâche existante
def test_existing_task():
    print('🔍 TEST RAPIDE AVEC TÂCHE EXISTANTE\n')

    try:
        # Récupérer les tâches existantes
        response = requests.get(base_url + '/all-tasks', timeout=5)
        if response.status_code != 200:
            print(f'❌ Erreur récupération tâches: {response.status_code}')
            return

        data = response.json()
        tasks = data.get('tasks', [])

        # Trouver une tâche non validée
        test_task = None
        for task in tasks:
            if (task.get('statut') in ['pending', 'in_progress'] and
                task.get('validation_status') != 'validated'):
                test_task = task
                break

        if not test_task:
            print('❌ Aucune tâche de test trouvée (toutes déjà validées)')
            return

        task_id = test_task.get('id')
        print(f'🎯 Tâche de test trouvée: {task_id[:20]}...')
        print(f'   État initial:')
        print(f'   - Statut: {test_task.get("statut")}')
        print(f'   - Validation status: {test_task.get("validation_status")}')
        print(f'   - Validated: {test_task.get("validated", False)}')
        print()

        # Simuler la validation
        print('⚡ Validation en cours...')
        val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')

        if val_response.status_code == 200:
            print('✅ Validation réussie!')

            # Vérifier l'état après validation
            all_tasks_response = requests.get(base_url + '/all-tasks')
            if all_tasks_response.status_code == 200:
                all_data = all_tasks_response.json()
                all_tasks = all_data.get('tasks', [])

                validated_task = None
                for t in all_tasks:
                    if t.get('id') == task_id:
                        validated_task = t
                        break

                if validated_task:
                    print('📋 État après validation:')
                    statut = validated_task.get('statut')
                    validation_status = validated_task.get('validation_status')
                    validated = validated_task.get('validated', False)

                    print(f'   - Statut: {statut}')
                    print(f'   - Validation status: {validation_status}')
                    print(f'   - Validated: {validated}')

                    print('\n🎯 FONCTIONNALITÉS À VÉRIFIER DANS L\'INTERFACE:')
                    print('✅ 1. Icône verte "✓ Validée" devrait apparaître sur la carte')
                    print('✅ 2. Bouton "Valider" devrait disparaître du menu Actions')
                    print('✅ 3. Boutons "Rejeter" et "Terminer" devraient rester disponibles')
                    print('✅ 4. Tâche devrait garder son statut "pending"')

                    print('\n🌐 TESTEZ DANS LE NAVIGATEUR:')
                    print('   1. Ouvrez http://localhost:5174/')
                    print(f'   2. Trouvez la tâche ID: {task_id[:20]}...')
                    print('   3. Vérifiez l\'icône de validation')
                    print('   4. Cliquez sur "Actions" pour voir les boutons')

                else:
                    print('❌ Tâche non trouvée après validation')
            else:
                print(f'❌ Erreur récupération après validation: {all_tasks_response.status_code}')
        else:
            print(f'❌ Erreur validation: {val_response.status_code}')
            print(f'   Détails: {val_response.text[:200]}')

    except Exception as e:
        print(f'❌ Erreur: {e}')

if __name__ == '__main__':
    test_existing_task()
