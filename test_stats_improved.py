import requests
import json
import time

def wait_for_server(url, max_retries=10, delay=1):
    """Attendre que le serveur soit prêt"""
    for i in range(max_retries):
        try:
            response = requests.get(url + "/health", timeout=2)
            if response.status_code == 200:
                print(f"✅ Serveur prêt après {i+1} tentatives")
                return True
        except Exception:
            pass
        time.sleep(delay)
        print(f"⏳ Tentative {i+1}/{max_retries}...")
    return False

def test_stats_endpoint():
    base_url = "http://127.0.0.1:8002"
    
    print("🔍 Test de l'endpoint /tasks/stats...")
    
    # Attendre que le serveur soit prêt
    if not wait_for_server(base_url):
        print("❌ Serveur non disponible")
        return
    
    try:
        # Tester l'endpoint stats
        response = requests.get(f"{base_url}/tasks/stats", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("🎉 Statistiques récupérées avec succès:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Vérifier que nous avons les 105 tâches
            if data.get("total") == 105:
                print("✅ SUCCÈS: Les 105 tâches sont correctement comptées!")
            else:
                print(f"⚠️ ATTENTION: {data.get('total')} tâches trouvées au lieu de 105")
        else:
            print(f"❌ Erreur HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_stats_endpoint()
