#!/usr/bin/env python3
"""
Script de test de l'API FastAPI
"""
import requests
import json
from pprint import pprint

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test un endpoint de l'API"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔍 Test {method} {endpoint}")
    print("=" * 50)
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Succès")
            pprint(data)
        else:
            print(f"❌ Erreur: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Erreur: Impossible de se connecter au serveur")
    except Exception as e:
        print(f"❌ Erreur: {e}")

def main():
    print("🚀 Test de l'API AI Task Extraction")
    print("=" * 50)
    
    # Test endpoints principaux
    endpoints = [
        "/",
        "/health", 
        "/all-tasks",
        "/monitoring/system_health",
        "/cache/stats"
    ]
    
    for endpoint in endpoints:
        test_endpoint(endpoint)
        
    print("\n" + "=" * 50)
    print("✅ Tests terminés")

if __name__ == "__main__":
    main()
