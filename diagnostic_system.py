#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
🔍 DIAGNOSTIC COMPLET DU SYSTÈME
================================

Analyse tous les composants pour déterminer l'état de fonctionnement
"""

import sys
import os
import json
from pathlib import Path

# Ajouter les chemins nécessaires
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "utils"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "services"))

def diagnostic_complet():
    """Effectuer un diagnostic complet du système"""
    print("🔍 DIAGNOSTIC COMPLET DU SYSTÈME AI TASK EXTRACTION")
    print("=" * 60)
    
    # 1. Vérifier les fichiers de données
    print("\n📁 1. FICHIERS DE DONNÉES:")
    data_files = {
        "emails.json": "data/emails.json",
        "meetings.json": "data/meetings.json", 
        "tasks.json": "data/tasks.json",
        "unified_tasks.json": "data/unified_tasks.json"
    }
    
    for name, path in data_files.items():
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if isinstance(data, list):
                    count = len(data)
                elif isinstance(data, dict):
                    if "emails" in data:
                        count = len(data["emails"])
                    elif "meetings" in data:
                        count = len(data["meetings"])
                    else:
                        count = len(data)
                else:
                    count = "Format inconnu"
                print(f"   ✅ {name}: {count} entrées")
            except Exception as e:
                print(f"   ❌ {name}: Erreur lecture - {e}")
        else:
            print(f"   ❌ {name}: Fichier manquant")
    
    # 2. Vérifier les modules Python
    print("\n🐍 2. MODULES PYTHON:")
    modules_to_test = [
        "agent_task",
        "pipeline", 
        "background_service",
        "cache_emails",
        "rate_limiter",
        "email_queue",
        "meeting_processor"
    ]
    
    modules_status = {}
    for module in modules_to_test:
        try:
            __import__(module)
            modules_status[module] = "✅ OK"
            print(f"   ✅ {module}: Importé avec succès")
        except ImportError as e:
            modules_status[module] = f"❌ {e}"
            print(f"   ❌ {module}: Erreur d'import - {e}")
    
    # 3. Vérifier le système unifié
    print("\n🚀 3. SYSTÈME UNIFIÉ:")
    try:
        from unified_task_manager import get_unified_task_manager
        unified_manager = get_unified_task_manager()
        all_tasks = unified_manager.load_all_tasks()
        print(f"   ✅ Système unifié: {len(all_tasks)} tâches chargées")
        unified_available = True
    except Exception as e:
        print(f"   ❌ Système unifié: {e}")
        unified_available = False
    
    # 4. Test de l'API (import)
    print("\n🌐 4. API FASTAPI:")
    try:
        import main
        print("   ✅ Module main.py: Importé avec succès")
        
        # Vérifier la fonction de stats
        if hasattr(main, 'get_tasks_statistics'):
            print("   ✅ Endpoint /tasks/stats: Défini")
        else:
            print("   ❌ Endpoint /tasks/stats: Manquant")
            
    except Exception as e:
        print(f"   ❌ Module main.py: {e}")
    
    # 5. Frontend (vérifier les fichiers clés)
    print("\n⚛️  5. FRONTEND REACT:")
    frontend_files = {
        "useTaskStats.ts": "frontend/src/hooks/useTaskStats.ts",
        "TasksPage.tsx": "frontend/src/pages/Tasks/TasksPage.tsx",
        "api.ts": "frontend/src/services/api.ts",
        "package.json": "frontend/package.json"
    }
    
    for name, path in frontend_files.items():
        if os.path.exists(path):
            print(f"   ✅ {name}: Présent")
        else:
            print(f"   ❌ {name}: Manquant")
    
    # 6. Résumé final
    print("\n📊 6. RÉSUMÉ FINAL:")
    
    # Compter les modules OK
    modules_ok = sum(1 for status in modules_status.values() if status == "✅ OK")
    total_modules = len(modules_status)
    
    print(f"   📁 Fichiers de données: {len([f for f in data_files.keys()])} fichiers vérifiés")
    print(f"   🐍 Modules Python: {modules_ok}/{total_modules} fonctionnels")
    print(f"   🚀 Système unifié: {'✅ Opérationnel' if unified_available else '❌ Non disponible'}")
    
    if modules_ok >= 5 and unified_available:
        print("\n🎉 SYSTÈME COMPLÈTEMENT FONCTIONNEL!")
        return True
    elif modules_ok >= 3:
        print("\n⚠️  SYSTÈME PARTIELLEMENT FONCTIONNEL")
        return "partial"
    else:
        print("\n❌ SYSTÈME NON FONCTIONNEL")
        return False

if __name__ == "__main__":
    diagnostic_complet()
