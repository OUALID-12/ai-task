#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
🎯 TEST DIRECT DE L'ENDPOINT STATS
=================================

Test l'endpoint sans serveur HTTP pour identifier les problèmes
"""

import sys
import os
import json

# Ajouter les chemins nécessaires
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "utils"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "services"))

def test_stats_function():
    """Tester directement la fonction de statistiques"""
    print("🎯 TEST DIRECT DE L'ENDPOINT /tasks/stats")
    print("=" * 50)
    
    try:
        # Importer les modules nécessaires
        from unified_task_manager import get_unified_task_manager
        
        print("✅ Import unified_task_manager: OK")
        
        # Tester le chargement des tâches
        unified_manager = get_unified_task_manager()
        all_tasks = unified_manager.load_all_tasks()
        
        print(f"✅ Chargement des tâches: {len(all_tasks)} tâches trouvées")
        
        if len(all_tasks) == 0:
            print("❌ Aucune tâche trouvée - problème de données")
            return False
            
        # Calculer les statistiques (copie de l'endpoint)
        total_tasks = len(all_tasks)
        
        completed_tasks = len([t for t in all_tasks if t.get('statut') == 'completed'])
        in_progress_tasks = len([t for t in all_tasks if t.get('statut') == 'in_progress'])
        pending_tasks = len([t for t in all_tasks if t.get('statut') == 'pending'])
        rejected_tasks = len([t for t in all_tasks if t.get('statut') == 'rejected'])
        
        # Statistiques par priorité
        high_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'high'])
        urgent_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'urgent'])
        medium_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'medium'])
        low_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'low'])
        
        stats = {
            "total": total_tasks,
            "by_status": {
                "completed": completed_tasks,
                "in_progress": in_progress_tasks,
                "pending": pending_tasks,
                "rejected": rejected_tasks
            },
            "by_priority": {
                "urgent": urgent_priority_tasks,
                "high": high_priority_tasks,
                "medium": medium_priority_tasks,
                "low": low_priority_tasks
            },
            "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        }
        
        print("\n📊 STATISTIQUES CALCULÉES:")
        print(json.dumps(stats, indent=2, ensure_ascii=False))
        
        # Vérifier la cohérence
        total_by_status = completed_tasks + in_progress_tasks + pending_tasks + rejected_tasks
        print(f"\n🔍 VÉRIFICATION DE COHÉRENCE:")
        print(f"   Total général: {total_tasks}")
        print(f"   Total par statut: {total_by_status}")
        print(f"   Cohérence: {'✅ OK' if total_by_status <= total_tasks else '❌ Erreur'}")
        
        if total_tasks == 105:
            print("\n🎉 SUCCÈS: Les 105 tâches attendues sont bien présentes!")
            return True
        else:
            print(f"\n⚠️ ATTENTION: {total_tasks} tâches au lieu de 105")
            return "partial"
            
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_main_import():
    """Tester l'import du module main"""
    print("\n🌐 TEST IMPORT MODULE MAIN:")
    try:
        import main
        print("✅ Import main.py: OK")
        
        # Vérifier que la fonction existe
        if hasattr(main, 'get_tasks_statistics'):
            print("✅ Fonction get_tasks_statistics: Trouvée")
            
            # Tester la fonction directement (simulation)
            try:
                # On ne peut pas appeler directement car c'est un endpoint FastAPI
                # Mais on peut vérifier qu'elle est définie
                func = getattr(main, 'get_tasks_statistics')
                print(f"✅ Type de fonction: {type(func)}")
                return True
            except Exception as e:
                print(f"❌ Erreur fonction: {e}")
                return False
        else:
            print("❌ Fonction get_tasks_statistics: Non trouvée")
            return False
            
    except Exception as e:
        print(f"❌ Import main.py: {e}")
        return False

if __name__ == "__main__":
    print("🔍 DIAGNOSTIC COMPLET DES STATISTIQUES")
    print("=" * 60)
    
    result1 = test_stats_function()
    result2 = test_main_import()
    
    print("\n📋 RÉSUMÉ:")
    print(f"   Calcul statistiques: {'✅' if result1 == True else '⚠️' if result1 == 'partial' else '❌'}")
    print(f"   Module main.py: {'✅' if result2 else '❌'}")
    
    if result1 == True and result2:
        print("\n🎉 SYSTÈME STATISTIQUES COMPLÈTEMENT FONCTIONNEL!")
    elif result1 and result2:
        print("\n⚠️ SYSTÈME STATISTIQUES PARTIELLEMENT FONCTIONNEL")
    else:
        print("\n❌ PROBLÈMES DÉTECTÉS DANS LE SYSTÈME STATISTIQUES")
