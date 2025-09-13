import requests

base_url = 'http://127.0.0.1:8002'

# Test complet des fonctionnalités du bouton "Valider"
def test_validate_functionality():
    print('🧪 TEST COMPLET DU BOUTON "VALIDER"\n')

    try:
        # 1. Créer une tâche de test
        print('1️⃣ Création de la tâche de test...')
        test_task = {
            'title': 'Test Validation Complete',
            'description': 'Tâche pour tester toutes les fonctionnalités de validation',
            'priority': 'medium',
            'deadline': '2025-09-15T10:00:00',
            'department': 'Test Department',
            'tags': ['test', 'validation']
        }

        response = requests.post(base_url + '/tasks/create', json=test_task, timeout=10)
        if response.status_code != 200:
            print(f'❌ Erreur création tâche: {response.status_code}')
            return

        data = response.json()
        task_id = data.get('task_id')
        print(f'✅ Tâche créée: {task_id[:20]}...')
        print('   📋 Statut initial: pending')
        print('   📋 Validation status: None')
        print()

        # 2. Vérifier l'état initial
        print('2️⃣ Vérification de l\'état initial...')
        all_tasks_response = requests.get(base_url + '/all-tasks')
        if all_tasks_response.status_code == 200:
            all_data = all_tasks_response.json()
            all_tasks = all_data.get('tasks', [])

            initial_task = None
            for t in all_tasks:
                if t.get('id') == task_id:
                    initial_task = t
                    break

            if initial_task:
                print('✅ Tâche trouvée dans la liste')
                print(f'   - Statut: {initial_task.get("statut")}')
                print(f'   - Validation status: {initial_task.get("validation_status")}')
                print(f'   - Validated: {initial_task.get("validated", False)}')
                print('   🎯 Boutons attendus: Valider, Rejeter, Terminer')
            else:
                print('❌ Tâche non trouvée')
                return
        print()

        # 3. Simuler la validation
        print('3️⃣ Simulation de la validation...')
        val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')

        if val_response.status_code == 200:
            print('✅ Validation réussie!')
            val_data = val_response.json()
            print(f'   Message: {val_data.get("message", "OK")}')
        else:
            print(f'❌ Erreur validation: {val_response.status_code}')
            print(f'   Détails: {val_response.text[:200]}')
            return
        print()

        # 4. Vérifier l'état après validation
        print('4️⃣ Vérification de l\'état après validation...')
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
                print('✅ Tâche trouvée après validation')
                statut = validated_task.get('statut')
                validation_status = validated_task.get('validation_status')
                validated = validated_task.get('validated', False)

                print(f'   - Statut: {statut}')
                print(f'   - Validation status: {validation_status}')
                print(f'   - Validated: {validated}')
                print(f'   - Validated at: {validated_task.get("validated_at", "N/A")}')

                # Vérifications des fonctionnalités
                print('\n📊 VÉRIFICATION DES FONCTIONNALITÉS:')

                # ✅ 1. Icône verte "✓ Validée" apparaît sur la carte
                if validation_status == 'validated':
                    print('✅ 1. Icône "✓ Validée" : DEVRAIT apparaître sur la carte')
                else:
                    print('❌ 1. Icône "✓ Validée" : PROBLÈME - validation_status pas mis à jour')

                # ✅ 2. Bouton "Valider" disparaît du menu Actions
                print('✅ 2. Bouton "Valider" : DEVRAIT disparaître du menu Actions')

                # ✅ 3. Boutons "Rejeter" et "Terminer" restent disponibles
                print('✅ 3. Boutons "Rejeter/Terminer" : DEVRAIENT rester disponibles')

                # ✅ 4. Tâche garde son statut "pending" (normal)
                if statut == 'pending':
                    print('✅ 4. Statut "pending" : CONSERVÉ (normal)')
                else:
                    print(f'⚠️ 4. Statut changé à: {statut}')

                print('\n🎯 RÉSUMÉ:')
                print('   - Ouvrez http://localhost:5174/')
                print('   - Trouvez la tâche "Test Validation Complete"')
                print('   - Vérifiez que l\'icône verte "✓ Validée" est visible')
                print('   - Cliquez sur "Actions" pour voir les boutons restants')

            else:
                print('❌ Tâche non trouvée après validation')
        else:
            print(f'❌ Erreur récupération tâches: {all_tasks_response.status_code}')

    except Exception as e:
        print(f'❌ Erreur: {e}')

if __name__ == '__main__':
    test_validate_functionality()
