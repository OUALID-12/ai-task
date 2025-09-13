import json
import os
from pathlib import Path

# Configuration des chemins
DATA_FILE = "data/emails.json"
MEETINGS_FILE = "data/meetings.json"

def test_stats_logic():
    """
    Tester la logique de statistiques sans serveur
    """
    try:
        print("🔍 Test des statistiques des tâches...")
        
        # Vérifier l'existence des fichiers
        if not os.path.exists(DATA_FILE):
            print(f"❌ Fichier {DATA_FILE} introuvable")
            return
            
        if not os.path.exists(MEETINGS_FILE):
            print(f"⚠️ Fichier {MEETINGS_FILE} introuvable")
        
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Récupérer toutes les tâches (emails + meetings)
        all_tasks = []
        
        # Tâches des emails
        if "emails" in data:
            email_count = 0
            for email in data["emails"]:
                if "taches_detectees" in email:
                    tasks_in_email = len(email["taches_detectees"])
                    all_tasks.extend(email["taches_detectees"])
                    email_count += tasks_in_email
            print(f"📧 Tâches des emails: {email_count}")
        
        # Tâches des meetings
        meeting_count = 0
        try:
            with open(MEETINGS_FILE, "r", encoding="utf-8") as f:
                meetings_data = json.load(f)
                if "meetings" in meetings_data:
                    for meeting in meetings_data["meetings"]:
                        if "taches_extraites" in meeting:
                            tasks_in_meeting = len(meeting["taches_extraites"])
                            all_tasks.extend(meeting["taches_extraites"])
                            meeting_count += tasks_in_meeting
            print(f"📅 Tâches des meetings: {meeting_count}")
        except FileNotFoundError:
            print("⚠️ Pas de fichier meetings")
        
        # Calculer les statistiques
        total_tasks = len(all_tasks)
        print(f"📊 Total des tâches: {total_tasks}")
        
        if total_tasks == 0:
            print("❌ Aucune tâche trouvée!")
            return
        
        # Analyser quelques tâches pour debug
        print("\n🔍 Analyse des premières tâches:")
        for i, task in enumerate(all_tasks[:3]):
            print(f"  Tâche {i+1}: statut='{task.get('statut', 'N/A')}', priorité='{task.get('priorite', 'N/A')}'")
        
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
        
        print("\n🎉 Statistiques calculées avec succès:")
        print(json.dumps(stats, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_stats_logic()
