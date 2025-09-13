import requests
import json
import time

def test_all_endpoints():
    """
    Test complet de tous les endpoints backend maintenant que les services sont réparés
    """
    base_url = "http://127.0.0.1:8002"
    
    print("🚀 Test complet de tous les endpoints backend")
    print("=" * 60)
    
    endpoints_to_test = [
        ("GET", "/health", "Health Check Simple"),
        ("GET", "/monitoring/system_health", "Santé du Système"), 
        ("GET", "/tasks/stats", "Statistiques des Tâches"),
        ("GET", "/all-tasks", "Liste des Tâches"),
        ("GET", "/meetings", "Liste des Réunions"),
        ("GET", "/monitoring/rate_limit", "Rate Limit Status"),
    ]
    
    results = {}
    total_ok = 0
    total_failed = 0
    
    for method, endpoint, description in endpoints_to_test:
        print(f"\n🔍 Test {description} ({endpoint})...")
        
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"   ✅ OK - {description}")
                
                # Afficher quelques détails pour les endpoints critiques
                if endpoint == "/monitoring/system_health":
                    data = response.json()
                    service_running = data.get("service_status", {}).get("service_running", False)
                    background_alive = data.get("service_status", {}).get("background_thread_alive", False)
                    health_alive = data.get("service_status", {}).get("health_check_thread_alive", False)
                    
                    print(f"      Service running: {service_running}")
                    print(f"      Background thread: {background_alive}")
                    print(f"      Health check thread: {health_alive}")
                    
                elif endpoint == "/tasks/stats":
                    data = response.json()
                    total = data.get("total", 0)
                    completion_rate = data.get("completion_rate", 0)
                    print(f"      Total tâches: {total}")
                    print(f"      Taux completion: {completion_rate}%")
                
                results[endpoint] = "✅ OK"
                total_ok += 1
            else:
                print(f"   ❌ ÉCHEC - Error {response.status_code}")
                print(f"      Détails: {response.text[:100]}")
                results[endpoint] = f"❌ Error {response.status_code}"
                total_failed += 1
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ ÉCHEC - Connexion impossible")
            results[endpoint] = "❌ Connection Error"
            total_failed += 1
        except requests.exceptions.Timeout:
            print(f"   ❌ ÉCHEC - Timeout")
            results[endpoint] = "❌ Timeout"
            total_failed += 1
        except Exception as e:
            print(f"   ❌ ÉCHEC - Exception: {str(e)[:50]}")
            results[endpoint] = f"❌ Exception"
            total_failed += 1
        
        # Petite pause entre les tests
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ FINAL:")
    print(f"✅ Endpoints OK: {total_ok}")
    print(f"❌ Endpoints en échec: {total_failed}")
    print(f"📈 Taux de succès: {(total_ok/(total_ok+total_failed)*100):.1f}%")
    
    print("\n📋 Détail par endpoint:")
    for endpoint, status in results.items():
        print(f"   {endpoint}: {status}")
    
    if total_failed == 0:
        print("\n🎉 TOUS LES ENDPOINTS FONCTIONNENT PARFAITEMENT!")
        print("✅ Système backend 100% opérationnel")
    else:
        print(f"\n⚠️ {total_failed} endpoint(s) nécessitent encore une correction")
    
    return results

if __name__ == "__main__":
    test_all_endpoints()
