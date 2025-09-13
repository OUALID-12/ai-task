#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔍 DIAGNOSTIC: POURQUOI LES FICHIERS REVIENNENT
==============================================
Analyse pour identifier la source de régénération des fichiers
"""

import os
import time
from datetime import datetime
from pathlib import Path

def diagnostic_comportement_fichiers():
    """Diagnostic complet du comportement de régénération de fichiers"""
    
    print("🔍 DIAGNOSTIC: FICHIERS QUI REVIENNENT")
    print("=" * 60)
    
    # 1. IDENTIFICATION DES FICHIERS PROBLÉMATIQUES
    print("\n📁 ANALYSE DES FICHIERS PRÉSENTS:")
    
    fichiers_actuels = list(Path(".").glob("*.py"))
    fichiers_docs = list(Path(".").glob("*.md"))
    
    print(f"   📄 Fichiers Python: {len(fichiers_actuels)}")
    print(f"   📄 Fichiers Markdown: {len(fichiers_docs)}")
    
    # Fichiers qui ne devraient PAS être là
    fichiers_suspects = [
        "analyser_data.py",
        "analyser_endpoints.py", 
        "analyser_nettoyage.py",
        "analyser_structure_phase2.py",
        "analyser_valeurs_unified.py",
        "check_endpoints_phase6.py",
        "check_unified_system.py",
        "diagnostic_modification.py",
        "etude_faisabilite_phase3.py",
        "execute_migration.py",
        "migrate_tasks.py",
        "nettoyage_final.py",
        "nettoyer_analyse.py",
        "normalize_unified_tasks.py",
        "phase2_adaptation.py",
        # Tests multiples
        "test_autonome.py",
        "test_complet_tous_endpoints.py",
        "test_endpoints_reels.py",
        "test_endpoint_phase2.py",
        "test_extraction_unification.py",
        "test_filter_logic.py",
        "test_final_tags.py",
        "test_phase1_filters.py",
        "test_phase2_detailed.py",
        "test_phase2_filters.py",
        "test_phase2_internal.py",
        "test_phase3_internal.py",
        "test_phase3_quick.py",
        "test_phase3_server.py",
        "test_phase4_internal.py",
        "test_phase4_quick.py",
        "test_phase4_server.py",
        "test_phase5_gestion_individuelle.py",
        "test_phase6_modifications.py",
        "test_serveur_tags.py",
        "test_smart_filters.py",
        "test_tags_diagnostic.py",
        "test_tags_system.py",
        "test_unification_auto.py",
        "test_unified_endpoint.py",
        # Docs multiples
        "AMELIORATIONS_FONCTIONNELLES.md",
        "AMELIORATIONS_TACHES_CIBLEES.md",
        "CORRECTION_UNIFICATION_AUTO.md",
        "DOCUMENTATION_COMPLETE.md",
        "GUIDE_TESTS.md",
        "OPTION3_COMPLETE.md",
        "PHASE1_COMPLETE.md",
        "PHASE2_COMPLETE.md",
        "PHASE2_PLAN_REVISE.md",
        "PHASE3_COMPLETE.md",
        "PHASE3_FAISABILITE.md",
        "PHASE4_COMPLETE.md",
        "PHASE4_FAISABILITE.md",
        "PHASE5_COMPLETE.md",
        "PHASE6_COMPLETE.md",
        "PLAN_IMPLEMENTATION.md",
        "PLAN_UNIFICATION_TACHES.md",
        "REPONSES_QUESTIONS.md"
    ]
    
    print(f"\n❌ FICHIERS QUI NE DEVRAIENT PAS ÊTRE LÀ:")
    fichiers_presents_suspects = []
    for fichier in fichiers_suspects:
        if Path(fichier).exists():
            fichiers_presents_suspects.append(fichier)
            print(f"   ❌ {fichier}")
    
    print(f"\n📊 TOTAL FICHIERS SUSPECTS PRÉSENTS: {len(fichiers_presents_suspects)}")
    
    # 2. ANALYSE DES CAUSES POSSIBLES
    print(f"\n🔍 CAUSES POSSIBLES DE RÉGÉNÉRATION:")
    
    causes_possibles = {
        "VS Code Extensions": "Extensions qui sauvegardent/restaurent les fichiers",
        "Git/GitHub": "Synchronisation automatique",
        "Cloud Sync": "OneDrive, Google Drive, Dropbox",
        "Backup Software": "Logiciels de sauvegarde automatique",
        "System Restore": "Points de restauration Windows",
        "File History": "Historique des fichiers Windows",
        "Antivirus": "Quarantaine puis restauration",
        "IDE Cache": "Cache de l'IDE qui recrée les fichiers",
        "Python Scripts": "Scripts qui génèrent automatiquement des fichiers"
    }
    
    for cause, description in causes_possibles.items():
        print(f"   ⚠️ {cause}: {description}")
    
    # 3. VÉRIFICATIONS SPÉCIFIQUES
    print(f"\n🧐 VÉRIFICATIONS SPÉCIFIQUES:")
    
    # Vérifier les timestamps
    print(f"   📅 Vérification des timestamps...")
    for fichier in fichiers_presents_suspects[:5]:  # Premières 5 pour exemple
        if Path(fichier).exists():
            stat = Path(fichier).stat()
            modified = datetime.fromtimestamp(stat.st_mtime)
            created = datetime.fromtimestamp(stat.st_ctime)
            print(f"      {fichier}:")
            print(f"         Créé: {created}")
            print(f"         Modifié: {modified}")
    
    # Vérifier VS Code settings
    vscode_dir = Path(".vscode")
    if vscode_dir.exists():
        print(f"   📁 Dossier .vscode détecté")
        for setting_file in vscode_dir.glob("*.json"):
            print(f"      📄 {setting_file.name}")
    
    # Vérifier les processus en cours
    print(f"   🔄 Processus potentiellement responsables:")
    processus_suspects = [
        "Code.exe", "python.exe", "uvicorn", "onedrive.exe", 
        "googledrivesync.exe", "dropbox.exe"
    ]
    
    try:
        import psutil
        for proc in psutil.process_iter(['pid', 'name']):
            if any(suspect.lower() in proc.info['name'].lower() for suspect in processus_suspects):
                print(f"      🔄 {proc.info['name']} (PID: {proc.info['pid']})")
    except ImportError:
        print(f"      ⚠️ psutil non disponible pour check processus")
    
    # 4. RECOMMANDATIONS DE SOLUTION
    print(f"\n💡 SOLUTIONS RECOMMANDÉES:")
    
    solutions = [
        "1. 🚫 DÉSACTIVER VS CODE AUTO-SAVE:",
        "   File > Preferences > Settings > Auto Save > Off",
        "",
        "2. 🔍 VÉRIFIER EXTENSIONS VS CODE:",
        "   Extensions > Rechercher 'backup', 'restore', 'sync'",
        "   Désactiver temporairement les extensions suspectes",
        "",
        "3. ☁️ SUSPENDRE SYNC CLOUD:",
        "   OneDrive: Pause sync temporairement",
        "   Google Drive: Déconnecter temporairement",
        "",
        "4. 🛡️ VÉRIFIER ANTIVIRUS:",
        "   Exclure le dossier du projet de la surveillance temps réel",
        "",
        "5. 🗂️ WINDOWS FILE HISTORY:",
        "   Paramètres > Mise à jour et sécurité > Sauvegarde > Désactiver",
        "",
        "6. 🔒 SOLUTION FINALE - SUPPRESSION DÉFINITIVE:",
        "   Utiliser attrib +h pour cacher les fichiers supprimés",
        "   Ou déplacer vers Corbeille au lieu de supprimer"
    ]
    
    for solution in solutions:
        print(f"   {solution}")
    
    # 5. SCRIPT DE SUPPRESSION DÉFINITIVE
    print(f"\n🛠️ CRÉATION D'UN SCRIPT DE SUPPRESSION DÉFINITIVE...")
    
    script_suppression = f"""@echo off
REM Script de suppression définitive des fichiers problématiques

echo 🗑️ SUPPRESSION DÉFINITIVE DES FICHIERS PROBLÉMATIQUES
echo.

REM Supprimer les fichiers Python suspects
{chr(10).join([f'if exist "{fichier}" del /f /q "{fichier}"' for fichier in fichiers_suspects if fichier.endswith('.py')])}

REM Supprimer les fichiers Markdown suspects  
{chr(10).join([f'if exist "{fichier}" del /f /q "{fichier}"' for fichier in fichiers_suspects if fichier.endswith('.md')])}

REM Vider la corbeille (optionnel)
REM rd /s /q %USERPROFILE%\\AppData\\Local\\Microsoft\\Windows\\INetCache

echo.
echo ✅ Suppression terminée !
echo 📊 Vérification des fichiers restants...
dir *.py *.md /b

pause
"""
    
    with open("SUPPRESSION_DEFINITIVE.bat", "w", encoding="utf-8") as f:
        f.write(script_suppression)
    
    print(f"   ✅ Script créé: SUPPRESSION_DEFINITIVE.bat")
    
    # 6. SURVEILLANCE TEMPS RÉEL
    print(f"\n👁️ SURVEILLANCE TEMPS RÉEL:")
    print(f"   Pour surveiller la création de fichiers, lancez:")
    print(f"   PowerShell: Get-ChildItem . -Include *.py,*.md | Select Name,LastWriteTime")
    
    return {
        "fichiers_suspects_presents": len(fichiers_presents_suspects),
        "script_cree": "SUPPRESSION_DEFINITIVE.bat",
        "causes_identifiees": list(causes_possibles.keys())
    }

if __name__ == "__main__":
    diagnostic_comportement_fichiers()
