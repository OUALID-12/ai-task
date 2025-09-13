#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 TEST COMPLET AVEC FILTRES ET ACTIONS
========================================
Test exhaustif incluant filtres, validation, rejet, etc.
"""

import requests
import json
import time
from datetime import datetime
from urllib.parse import urlencode

BASE_URL = "http://localhost:8002"

class ComprehensiveTestSuite:
    """Suite de tests complète avec tous les endpoints"""
    
    def __init__(self):
        self.test_results = {}
        self.created_task_id = None
        self.test_count = 0
        self.success_count = 0
    
    def test_endpoint(self, name, test_func):
        """Exécuter un test et enregistrer le résultat"""
        self.test_count += 1
        print(f"\n{self.test_count:02d}. {name}:", end=" ")
        
        try:
            result = test_func()
            if result:
                print("✅")
                self.success_count += 1
                self.test_results[name] = "✅ Succès"
                return True
            else:
                print("❌")
                self.test_results[name] = "❌ Échec"
                return False
        except Exception as e:
            print(f"❌ ({str(e)[:50]}...)")
            self.test_results[name] = f"❌ Erreur: {str(e)[:30]}..."
            return False
    
    # ========================================
    # ENDPOINTS DE BASE
    # ========================================
    
    def test_root(self):
        """Test endpoint racine"""
        response = requests.get(f"{BASE_URL}/", timeout=5)
        return response.status_code == 200
    
    def test_health(self):
        """Test santé du système"""
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200
    
    def test_all_tasks_basic(self):
        """Test récupération de base toutes tâches"""
        response = requests.get(f"{BASE_URL}/all-tasks", timeout=5)
        return response.status_code == 200
    
    # ========================================
    # TESTS DE FILTRAGE
    # ========================================
    
    def test_filter_by_status(self):
        """Test filtrage par statut"""
        response = requests.get(f"{BASE_URL}/all-tasks?status=pending", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_priority(self):
        """Test filtrage par priorité"""
        response = requests.get(f"{BASE_URL}/all-tasks?priority=high", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_responsable(self):
        """Test filtrage par responsable"""
        response = requests.get(f"{BASE_URL}/all-tasks?responsable=user", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_source(self):
        """Test filtrage par source"""
        response = requests.get(f"{BASE_URL}/all-tasks?source=manual_api", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_validated(self):
        """Test filtrage par validation"""
        response = requests.get(f"{BASE_URL}/all-tasks?validated=false", timeout=5)
        return response.status_code == 200
    
    def test_filter_multiple(self):
        """Test filtrage multiple"""
        params = {
            'status': 'pending',
            'priority': 'high',
            'validated': 'false'
        }
        response = requests.get(f"{BASE_URL}/all-tasks?{urlencode(params)}", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_tags(self):
        """Test filtrage par tags"""
        response = requests.get(f"{BASE_URL}/all-tasks?tags=test", timeout=5)
        return response.status_code == 200
    
    def test_filter_by_department(self):
        """Test filtrage par département"""
        response = requests.get(f"{BASE_URL}/all-tasks?department=qa", timeout=5)
        return response.status_code == 200
    
    # ========================================
    # CRÉATION ET GESTION DE TÂCHE POUR TESTS
    # ========================================
    
    def test_create_task_for_actions(self):
        """Créer une tâche pour tester les actions"""
        task_data = {
            "title": "Tâche Test Actions",
            "description": "Test validation/rejet/complétion",
            "priority": "medium",
            "department": "test",
            "deadline": "2025-08-20",
            "tags": ["test", "actions", "validation"]
        }
        response = requests.post(f"{BASE_URL}/tasks/create", json=task_data, timeout=5)
        if response.status_code == 200:
            self.created_task_id = response.json().get('task_id')
            return True
        return False
    
    # ========================================
    # ACTIONS SUR LES TÂCHES
    # ========================================
    
    def test_validate_task(self):
        """Test validation d'une tâche"""
        if not self.created_task_id:
            return False
        
        response = requests.patch(f"{BASE_URL}/tasks/{self.created_task_id}/validate", timeout=5)
        return response.status_code == 200
    
    def test_reject_task(self):
        """Test rejet d'une tâche"""
        # Créer une nouvelle tâche pour le rejet
        task_data = {
            "title": "Tâche à Rejeter",
            "description": "Test de rejet de tâche",
            "priority": "low",
            "department": "test",
            "tags": ["test", "rejet"]
        }
        create_response = requests.post(f"{BASE_URL}/tasks/create", json=task_data, timeout=5)
        if create_response.status_code != 200:
            return False
        
        reject_task_id = create_response.json().get('task_id')
        if not reject_task_id:
            return False
        
        # Rejeter la tâche
        response = requests.patch(f"{BASE_URL}/tasks/{reject_task_id}/reject?rejection_reason=Test de rejet", timeout=5)
        return response.status_code == 200
    
    def test_complete_task(self):
        """Test complétion d'une tâche"""
        # Créer une nouvelle tâche pour la complétion
        task_data = {
            "title": "Tâche à Compléter",
            "description": "Test de complétion de tâche",
            "priority": "medium",
            "department": "test",
            "tags": ["test", "completion"]
        }
        create_response = requests.post(f"{BASE_URL}/tasks/create", json=task_data, timeout=5)
        if create_response.status_code != 200:
            return False
        
        complete_task_id = create_response.json().get('task_id')
        if not complete_task_id:
            return False
        
        # Compléter la tâche
        response = requests.patch(f"{BASE_URL}/tasks/{complete_task_id}/complete", timeout=5)
        return response.status_code == 200
    
    def test_update_full_task(self):
        """Test mise à jour complète d'une tâche"""
        if not self.created_task_id:
            return False
        
        update_data = {
            "description": "Description mise à jour complètement",
            "responsable": "test.user@example.com",
            "priorite": "high",
            "statut": "in_progress",
            "deadline": "2025-08-25",
            "department": "updated"
        }
        response = requests.put(f"{BASE_URL}/tasks/{self.created_task_id}", json=update_data, timeout=5)
        return response.status_code == 200
    
    def test_update_description(self):
        """Test mise à jour description"""
        if not self.created_task_id:
            return False
        
        update_data = {"description": "Nouvelle description mise à jour"}
        response = requests.patch(f"{BASE_URL}/tasks/{self.created_task_id}/description", json=update_data, timeout=5)
        return response.status_code == 200
    
    def test_update_department(self):
        """Test mise à jour département"""
        if not self.created_task_id:
            return False
        
        update_data = {"department": "nouveau-dept"}
        response = requests.patch(f"{BASE_URL}/tasks/{self.created_task_id}/department", json=update_data, timeout=5)
        return response.status_code == 200
    
    # ========================================
    # SYSTÈME DE TAGS COMPLET
    # ========================================
    
    def test_all_tags(self):
        """Test récupération tous les tags"""
        response = requests.get(f"{BASE_URL}/tasks/tags", timeout=5)
        return response.status_code == 200
    
    def test_popular_tags(self):
        """Test tags populaires"""
        response = requests.get(f"{BASE_URL}/tasks/tags/popular?limit=5", timeout=5)
        return response.status_code == 200
    
    def test_tag_suggestions(self):
        """Test suggestions de tags"""
        response = requests.get(f"{BASE_URL}/tasks/tags/suggestions?description=urgent test validation", timeout=5)
        return response.status_code == 200
    
    def test_tasks_by_tag(self):
        """Test tâches par tag"""
        response = requests.get(f"{BASE_URL}/tasks/tags/test/tasks?limit=10&page=1", timeout=5)
        return response.status_code == 200
    
    def test_add_tags_to_task(self):
        """Test ajout de tags"""
        if not self.created_task_id:
            return False
        
        tag_data = {"tags": ["nouveau-tag", "test-ajout"]}
        response = requests.post(f"{BASE_URL}/tasks/{self.created_task_id}/tags", json=tag_data, timeout=5)
        return response.status_code == 200
    
    def test_remove_tag_from_task(self):
        """Test suppression d'un tag"""
        if not self.created_task_id:
            return False
        
        response = requests.delete(f"{BASE_URL}/tasks/{self.created_task_id}/tags/nouveau-tag", timeout=5)
        return response.status_code == 200
    
    # ========================================
    # MONITORING ET SYSTÈME
    # ========================================
    
    def test_system_health(self):
        """Test monitoring système"""
        response = requests.get(f"{BASE_URL}/monitoring/system_health", timeout=5)
        return response.status_code == 200
    
    def test_cache_stats(self):
        """Test statistiques cache"""
        response = requests.get(f"{BASE_URL}/cache/stats", timeout=5)
        return response.status_code == 200
    
    def test_watcher_status(self):
        """Test statut watcher"""
        response = requests.get(f"{BASE_URL}/watcher/status", timeout=5)
        return response.status_code == 200
    
    # ========================================
    # EMAILS ET MEETINGS
    # ========================================
    
    def test_email_processing(self):
        """Test traitement emails"""
        response = requests.get(f"{BASE_URL}/traiter-emails", timeout=5)
        return response.status_code == 200
    
    def test_meetings_processing(self):
        """Test traitement meetings"""
        response = requests.get(f"{BASE_URL}/traiter-meetings", timeout=5)
        return response.status_code == 200
    
    def test_meetings_list(self):
        """Test liste meetings"""
        response = requests.get(f"{BASE_URL}/meetings", timeout=5)
        return response.status_code == 200
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        print("🎯 TEST COMPLET AVEC FILTRES ET ACTIONS")
        print("=" * 60)
        print(f"🌐 URL de base: {BASE_URL}")
        print(f"⏰ Démarrage: {datetime.now().strftime('%H:%M:%S')}")
        
        # Tests de base
        print("\n🔵 ENDPOINTS DE BASE")
        self.test_endpoint("Page racine", self.test_root)
        self.test_endpoint("Santé du système", self.test_health)
        self.test_endpoint("Toutes tâches (base)", self.test_all_tasks_basic)
        
        # Tests de filtrage
        print("\n🟡 TESTS DE FILTRAGE")
        self.test_endpoint("Filtre par statut", self.test_filter_by_status)
        self.test_endpoint("Filtre par priorité", self.test_filter_by_priority)
        self.test_endpoint("Filtre par responsable", self.test_filter_by_responsable)
        self.test_endpoint("Filtre par source", self.test_filter_by_source)
        self.test_endpoint("Filtre par validation", self.test_filter_by_validated)
        self.test_endpoint("Filtre par tags", self.test_filter_by_tags)
        self.test_endpoint("Filtre par département", self.test_filter_by_department)
        self.test_endpoint("Filtres multiples", self.test_filter_multiple)
        
        # Création pour tests d'actions
        print("\n🟢 CRÉATION POUR TESTS D'ACTIONS")
        task_created = self.test_endpoint("Création tâche test", self.test_create_task_for_actions)
        
        # Tests d'actions sur tâches
        print("\n🟣 ACTIONS SUR LES TÂCHES")
        if task_created:
            self.test_endpoint("Validation tâche", self.test_validate_task)
        self.test_endpoint("Rejet tâche", self.test_reject_task)
        self.test_endpoint("Complétion tâche", self.test_complete_task)
        
        # Tests de modification
        print("\n🟠 MODIFICATIONS DE TÂCHES")
        if task_created:
            self.test_endpoint("Mise à jour complète", self.test_update_full_task)
            self.test_endpoint("Mise à jour description", self.test_update_description)
            self.test_endpoint("Mise à jour département", self.test_update_department)
        
        # Tests système de tags
        print("\n🏷️ SYSTÈME DE TAGS COMPLET")
        self.test_endpoint("Tous les tags", self.test_all_tags)
        self.test_endpoint("Tags populaires", self.test_popular_tags)
        self.test_endpoint("Suggestions tags", self.test_tag_suggestions)
        self.test_endpoint("Tâches par tag", self.test_tasks_by_tag)
        if task_created:
            self.test_endpoint("Ajout tags", self.test_add_tags_to_task)
            self.test_endpoint("Suppression tag", self.test_remove_tag_from_task)
        
        # Tests monitoring
        print("\n⚫ MONITORING ET SYSTÈME")
        self.test_endpoint("Santé système détaillée", self.test_system_health)
        self.test_endpoint("Stats cache", self.test_cache_stats)
        self.test_endpoint("Statut watcher", self.test_watcher_status)
        
        # Tests emails/meetings
        print("\n📧 EMAILS ET MEETINGS")
        self.test_endpoint("Traitement emails", self.test_email_processing)
        self.test_endpoint("Traitement meetings", self.test_meetings_processing)
        self.test_endpoint("Liste meetings", self.test_meetings_list)
        
        # Résultats
        self.show_results()
    
    def show_results(self):
        """Afficher les résultats finaux"""
        print("\n" + "=" * 60)
        print("📊 RÉSULTATS FINAUX - TEST COMPLET")
        print("=" * 60)
        
        success_rate = (self.success_count / self.test_count) * 100
        
        print(f"✅ Tests réussis: {self.success_count}/{self.test_count}")
        print(f"📈 Taux de réussite: {success_rate:.1f}%")
        
        if self.created_task_id:
            print(f"🆔 Tâche de test créée: {self.created_task_id}")
        
        print(f"⏰ Fin des tests: {datetime.now().strftime('%H:%M:%S')}")
        
        # Détail par catégorie
        print("\n🔍 DÉTAIL PAR ENDPOINT:")
        failed_tests = []
        for name, result in self.test_results.items():
            print(f"   {result} {name}")
            if "❌" in result:
                failed_tests.append(name)
        
        if failed_tests:
            print(f"\n⚠️ ENDPOINTS EN ÉCHEC ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   ❌ {test}")
        
        # Verdict final
        print("\n" + "=" * 60)
        if success_rate >= 95:
            print("🎉 SYSTÈME EXCELLENT - Quasi parfait!")
        elif success_rate >= 85:
            print("✅ SYSTÈME TRÈS BON - Quelques ajustements")
        elif success_rate >= 70:
            print("⚠️ SYSTÈME BON - Améliorations nécessaires")
        else:
            print("❌ SYSTÈME PROBLÉMATIQUE - Révision majeure")
        
        print(f"💡 Couverture: {self.test_count} endpoints testés")

def main():
    """Fonction principale"""
    
    # Vérifier la connectivité
    print("🔍 Vérification de la connectivité...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=3)
        if response.status_code != 200:
            print(f"❌ Serveur non accessible sur {BASE_URL}")
            print("💡 Démarrez le serveur avec:")
            print(f"   python -m uvicorn main:app --port {BASE_URL.split(':')[-1]}")
            return
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        print("💡 Vérifiez que le serveur est démarré")
        return
    
    print("✅ Serveur accessible - Démarrage test complet")
    
    # Exécuter tests complets
    test_suite = ComprehensiveTestSuite()
    test_suite.run_all_tests()

if __name__ == "__main__":
    main()
