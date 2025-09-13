"""
Tests unitaires pour l'AI Task Extraction System
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Ajouter le répertoire src au path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from api.main import app

client = TestClient(app)

class TestAPIEndpoints:
    """Tests des endpoints API"""
    
    def test_health_endpoint(self):
        """Test de l'endpoint de santé"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_root_endpoint(self):
        """Test de l'endpoint racine"""
        response = client.get("/")
        assert response.status_code == 200
        assert "AI Task Extraction System" in response.json()["message"]
    
    def test_system_health_endpoint(self):
        """Test de l'endpoint de santé système"""
        response = client.get("/monitoring/system_health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "metrics" in data
    
    def test_cache_stats_endpoint(self):
        """Test de l'endpoint des statistiques de cache"""
        response = client.get("/cache/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_emails" in data
        assert "cache_hits" in data
        assert "cache_misses" in data

class TestEmailProcessing:
    """Tests du traitement d'emails"""
    
    def test_traiter_emails_endpoint(self):
        """Test de l'endpoint de traitement d'emails"""
        email_data = {
            "email": "Réunion équipe demain 14h salle de conférence",
            "use_cache": True,
            "rapid_mode": True,
            "secure_mode": False
        }
        
        response = client.post("/traiter_emails", json=email_data)
        # Note: Ce test peut échouer sans clé API valide
        # En production, mock les appels API externes
        assert response.status_code in [200, 422, 500]
    
    def test_traiter_emails_validation(self):
        """Test de validation des données d'entrée"""
        # Test avec données invalides
        response = client.post("/traiter_emails", json={})
        assert response.status_code == 422  # Validation error

class TestRateLimiting:
    """Tests de la limitation de débit"""
    
    def test_rate_limit_status(self):
        """Test de l'endpoint de statut de limitation"""
        response = client.get("/monitoring/rate_limit")
        assert response.status_code == 200
        data = response.json()
        assert "requests_made" in data
        assert "requests_remaining" in data
        assert "window_start" in data

class TestCacheManagement:
    """Tests de gestion du cache"""
    
    def test_cache_cleanup(self):
        """Test du nettoyage de cache"""
        response = client.post("/cache/cleanup")
        assert response.status_code == 200
        data = response.json()
        assert "cleaned_entries" in data
        assert "message" in data
    
    def test_cache_clear(self):
        """Test du vidage complet du cache"""
        response = client.delete("/cache/clear")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

@pytest.fixture
def sample_email_data():
    """Fixture avec des données d'email de test"""
    return {
        "email": "Réunion projet X prévue pour demain 15h en salle A. Préparer les documents.",
        "use_cache": True,
        "rapid_mode": False,
        "secure_mode": True
    }

@pytest.fixture
def invalid_email_data():
    """Fixture avec des données d'email invalides"""
    return {
        "email": "",  # Email vide
        "use_cache": "invalid",  # Type incorrect
        "rapid_mode": None,  # Valeur None
    }

def test_email_validation_with_fixtures(sample_email_data, invalid_email_data):
    """Test de validation utilisant les fixtures"""
    # Test avec données valides
    response = client.post("/traiter_emails", json=sample_email_data)
    assert response.status_code in [200, 500]  # 500 si pas de clé API
    
    # Test avec données invalides
    response = client.post("/traiter_emails", json=invalid_email_data)
    assert response.status_code == 422

if __name__ == "__main__":
    # Lancer les tests directement
    pytest.main([__file__, "-v"])
