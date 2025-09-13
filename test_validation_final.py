import requests

base_url = 'http://127.0.0.1:8002'

def test_validation_workflow():
    print('🧪 TEST COMPLET DU WORKFLOW DE VALIDATION\n')

    try:
        # 1. Récupérer les tâches existantes
        print('1️⃣ Récupération des tâches...')
        response = requests.get(base_url + '/all-tasks', timeout=5)
        if response.status_code != 200:
            print(f'❌ Erreur récupération: {response.status_code}')
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
            print('❌ Aucune tâche de test trouvée')
            return

        task_id = test_task.get('id')
        print(f'✅ Tâche trouvée: {task_id[:20]}...')

        # 2. Vérifier l'état initial
        print('\n2️⃣ État initial:')
        print(f'   - Statut: {test_task.get("statut")}')
        print(f'   - Validation status: {test_task.get("validation_status")}')
        print(f'   - Validated: {test_task.get("validated", False)}')

        # 3. Simuler la validation
        print('\n3️⃣ Validation en cours...')
        val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')

        if val_response.status_code != 200:
            print(f'❌ Erreur validation: {val_response.status_code}')
            print(f'   Détails: {val_response.text[:200]}')
            return

        print('✅ Validation réussie!')

        # 4. Vérifier l'état après validation
        print('\n4️⃣ Vérification après validation...')
        all_tasks_response = requests.get(base_url + '/all-tasks')
        if all_tasks_response.status_code != 200:
            print(f'❌ Erreur récupération après: {all_tasks_response.status_code}')
            return

        all_data = all_tasks_response.json()
        all_tasks = all_data.get('tasks', [])

        validated_task = None
        for t in all_tasks:
            if t.get('id') == task_id:
                validated_task = t
                break

        if not validated_task:
            print('❌ Tâche non trouvée après validation')
            return

        # 5. Vérifier les changements
        print('\n5️⃣ Vérification des changements:')
        statut = validated_task.get('statut')
        validation_status = validated_task.get('validation_status')
        validated = validated_task.get('validated', False)

        print(f'   - Statut: {statut}')
        print(f'   - Validation status: {validation_status}')
        print(f'   - Validated: {validated}')

        # Vérifications des exigences
        checks = {
            'Statut reste pending': statut == 'pending',
            'Validation status = validated': validation_status == 'validated',
            'Champ validated = True': validated == True
        }

        print('\n📋 RÉSULTATS DES VÉRIFICATIONS:')
        all_passed = True
        for check, passed in checks.items():
            status_icon = '✅' if passed else '❌'
            print(f'   {status_icon} {check}')
            if not passed:
                all_passed = False

        if all_passed:
            print('\n🎉 TOUTES LES VÉRIFICATIONS RÉUSSIES!')
            print('\n🌐 INSTRUCTIONS POUR LE TEST FRONTEND:')
            print('   1. Ouvrez http://localhost:5174/')
            print('   2. Allez dans l\'onglet "Tâches"')
            print(f'   3. Trouvez la tâche ID: {task_id[:20]}...')
            print('   4. Vérifiez que l\'icône "✓ Validée" apparaît')
            print('   5. Cliquez sur "Actions" et vérifiez que:')
            print('      - Le bouton "Valider" a disparu')
            print('      - Les boutons "Rejeter" et "Terminer" sont toujours là')
            print('      - La tâche garde son statut "En attente"')
        else:
            print('\n❌ CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ')

    except Exception as e:
        print(f'❌ Erreur: {e}')

if __name__ == '__main__':
    test_validation_workflow()
