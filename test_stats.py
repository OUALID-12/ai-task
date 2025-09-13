import requests
import json

try:
    response = requests.get("http://127.0.0.1:8002/tasks/stats")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("🎉 Statistiques récupérées avec succès:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
    else:
        print(f"❌ Erreur: {response.text}")
except Exception as e:
    print(f"❌ Erreur de connexion: {e}")
