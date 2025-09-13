#!/usr/bin/env python3
"""
🧪 Test rapide des suggestions de tags
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_tag_suggestions():
    """Test des suggestions de tags"""
    print("🧪 Test des suggestions de tags...")

    test_descriptions = [
        "Créer une fonctionnalité urgente pour le client",
        "Corriger un bug critique dans le système",
        "Préparer le rapport de performance mensuel",
        "Organiser une réunion d'équipe interne"
    ]

    for description in test_descriptions:
        try:
            response = requests.get(
                f"{BASE_URL}/tasks/tags/suggestions",
                params={"description": description},
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                print(f"\n📝 Description: {description}")
                print(f"🏷️  Suggestions: {', '.join(data.get('suggested_tags', []))}")
            else:
                print(f"❌ Erreur {response.status_code} pour: {description}")

        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
            break

if __name__ == "__main__":
    test_tag_suggestions()
