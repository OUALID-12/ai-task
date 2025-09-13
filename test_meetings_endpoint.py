import requests
import json
from datetime import datetime

def test_meetings_process_endpoint():
    """
    Tester l'endpoint POST /meetings/process qui semble en échec
    """
    base_url = "http://127.0.0.1:8002"
    
    print("🔍 Test de l'endpoint POST /meetings/process...")
    
    # Données de test pour une réunion
    test_meeting = {
        "titre": "Test Meeting - Validation Endpoint",
        "date_reunion": "2025-08-22",
        "heure_debut": "10:00",
        "heure_fin": "11:00", 
        "duree_minutes": 60,
        "lieu": "Salle de test",
        "organisateur": {
            "nom": "Agent Test",
            "email": "agent@test.com",
            "role": "Organisateur"
        },
        "participants": [
            {
                "nom": "Participant 1",
                "email": "p1@test.com", 
                "role": "Attendee"
            }
        ],
        "ordre_du_jour": ["Point 1: Test de l'endpoint"],
        "transcription": "Nous devons tester l'endpoint de traitement des réunions pour nous assurer qu'il fonctionne correctement.",
        "departement": "IT",
        "projet_associe": "Test Endpoint",
        "priorite_meeting": "medium",
        "type_reunion": "technique",
        "tags": ["test", "validation"],
        "fichiers_associes": []
    }
    
    try:
        # Test de l'endpoint
        response = requests.post(
            f"{base_url}/meetings/process",
            json=test_meeting,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint /meetings/process fonctionne!")
            print("Réponse:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ Erreur HTTP {response.status_code}")
            print(f"Détails: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur")
        print("Vérifiez que le serveur backend tourne sur le port 8002")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout - L'endpoint prend trop de temps à répondre")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def test_other_endpoints():
    """
    Tester rapidement les autres endpoints critiques
    """
    base_url = "http://127.0.0.1:8002"
    endpoints_to_test = [
        ("GET", "/health", "Health Check"),
        ("GET", "/tasks/stats", "Task Statistics"),
        ("GET", "/all-tasks", "All Tasks"),
        ("GET", "/meetings", "List Meetings")
    ]
    
    print("\n🔍 Test des autres endpoints critiques...")
    
    results = {}
    for method, endpoint, description in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print(f"✅ {description} ({endpoint}): OK")
                results[endpoint] = "OK"
            else:
                print(f"❌ {description} ({endpoint}): Error {response.status_code}")
                results[endpoint] = f"Error {response.status_code}"
                
        except Exception as e:
            print(f"❌ {description} ({endpoint}): Exception - {str(e)[:50]}")
            results[endpoint] = "Exception"
    
    return results

if __name__ == "__main__":
    print("🚀 Test complet des endpoints backend\n")
    
    # Test de l'endpoint problématique
    meetings_ok = test_meetings_process_endpoint()
    
    # Test des autres endpoints
    other_results = test_other_endpoints()
    
    print("\n📊 Résumé des tests:")
    print(f"POST /meetings/process: {'✅ OK' if meetings_ok else '❌ ÉCHEC'}")
    
    for endpoint, status in other_results.items():
        status_icon = "✅" if status == "OK" else "❌"
        print(f"{endpoint}: {status_icon} {status}")
