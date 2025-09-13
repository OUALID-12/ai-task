import requests

base_url = 'http://127.0.0.1:8002'

# Test du bouton "valider"
try:
    response = requests.get(base_url + '/all-tasks', timeout=5)
    if response.status_code == 200:
        data = response.json()
        tasks = data.get('tasks', [])

        print(f'📊 Test du bouton "Valider" sur {len(tasks)} tâches\n')

        # Trouver une tâche non validée
        test_task = None
        for task in tasks:
            if (task.get('statut') in ['pending', 'in_progress'] and
                task.get('validation_status') != 'validated'):
                test_task = task
                break

        if test_task:
            task_id = test_task.get('id')
            print(f'🎯 Tâche de test trouvée: {task_id[:20]}...')
            print(f'   Statut actuel: {test_task.get("statut")}')
            print(f'   Validation status: {test_task.get("validation_status")}')
            print(f'   Validated: {test_task.get("validated", False)}')
            print()

            # Simuler le clic sur "Valider"
            print('🖱️ Simulation du clic sur "Valider"...')
            confirm_result = input('Simuler confirmation (oui/non): ').lower().strip()

            if confirm_result in ['oui', 'o', 'yes', 'y']:
                print('✅ Confirmation acceptée - Envoi de la requête...')

                # Tester l'endpoint de validation
                val_response = requests.patch(base_url + '/tasks/' + task_id + '/validate')
                print(f'   Status HTTP: {val_response.status_code}')

                if val_response.status_code == 200:
                    val_data = val_response.json()
                    print('   ✅ Validation réussie!')
                    print(f'   Message: {val_data.get("message", "OK")}')

                    # Vérifier la mise à jour
                    updated_response = requests.get(base_url + '/tasks/' + task_id)
                    if updated_response.status_code == 200:
                        updated_task = updated_response.json()
                        print('   📋 État après validation:')
                        print(f'      Statut: {updated_task.get("statut")}')
                        print(f'      Validation status: {updated_task.get("validation_status")}')
                        print(f'      Validated: {updated_task.get("validated", False)}')
                        print(f'      Validated at: {updated_task.get("validated_at", "N/A")}')
                        print()
                        print('🎉 Le bouton "Valider" fonctionne correctement!')
                        print('   ✅ L\'icône "✓ Validée" devrait apparaître sur la carte')
                    else:
                        print(f'   ❌ Erreur récupération tâche mise à jour: {updated_response.status_code}')
                else:
                    print(f'   ❌ Erreur validation: {val_response.status_code}')
                    print(f'   Détails: {val_response.text[:200]}')
            else:
                print('❌ Confirmation annulée')
        else:
            print('❌ Aucune tâche de test trouvée (toutes déjà validées)')

    else:
        print(f'❌ Erreur backend: {response.status_code}')

except Exception as e:
    print(f'❌ Erreur: {e}')
