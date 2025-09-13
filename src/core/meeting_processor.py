# -*- coding: utf-8 -*-
"""
🎯 MEETING PROCESSOR - Traitement intelligent des réunions
========================================================

Traite les transcriptions de réunions pour extraire les tâches
Réutilise 100% de l'agent IA existant pour les emails

Version: 1.0.0 - Intégration complète
"""

import json
import os
import hashlib
from datetime import datetime
from typing import List, Dict, Any
import logging

# Imports des modules existants
try:
    from agent_task import (
        extract_tasks_from_email,
        resume_email,
        identifier_departement,
        deduire_priorite,
        suggere_taches_implicites
    )
    import cache_emails
    from cache_emails import (
        calculer_hash_email,
        est_email_deja_traite,
        marquer_email_traite
    )
    # 🔄 NOUVEAU: Import du gestionnaire unifié pour PHASE 2
    try:
        from unified_task_manager import get_unified_task_manager
        UNIFIED_SYSTEM_AVAILABLE = True
    except ImportError:
        UNIFIED_SYSTEM_AVAILABLE = False
        print("⚠️ Système unifié non disponible pour meetings, utilisation du système legacy")
except ImportError as e:
    print(f"⚠️ Import error: {e}")

logger = logging.getLogger(__name__)

# Chemins des fichiers
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEETINGS_FILE = os.path.join(BASE_DIR, "data", "meetings.json")
MEETING_TASKS_FILE = os.path.join(BASE_DIR, "data", "meeting_tasks.json")
MEETING_LOGS_FILE = os.path.join(BASE_DIR, "data", "meeting_logs.json")

class MeetingProcessor:
    """Processeur intelligent de réunions"""
    
    def __init__(self):
        self.meetings_file = MEETINGS_FILE
        self.tasks_file = MEETING_TASKS_FILE
        self.logs_file = MEETING_LOGS_FILE
        
    def load_meetings(self) -> List[Dict]:
        """Charge les réunions depuis meetings.json"""
        try:
            if os.path.exists(self.meetings_file):
                with open(self.meetings_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"❌ Erreur chargement meetings: {e}")
            return []
    
    def save_meetings(self, meetings: List[Dict]):
        """Sauvegarde les réunions"""
        try:
            with open(self.meetings_file, 'w', encoding='utf-8') as f:
                json.dump(meetings, f, ensure_ascii=False, indent=4)
        except Exception as e:
            logger.error(f"❌ Erreur sauvegarde meetings: {e}")
    
    def load_meeting_tasks(self) -> List[Dict]:
        """Charge les tâches de réunions"""
        try:
            if os.path.exists(self.tasks_file):
                with open(self.tasks_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"❌ Erreur chargement meeting tasks: {e}")
            return []
    
    def save_meeting_tasks(self, tasks: List[Dict]):
        """Sauvegarde les tâches de réunions - Compatible ancien + nouveau système"""
        try:
            # LEGACY: Sauvegarder dans l'ancien format (préservé)
            with open(self.tasks_file, 'w', encoding='utf-8') as f:
                json.dump(tasks, f, ensure_ascii=False, indent=4)
            
            # 🔄 NOUVEAU: Sauvegarder aussi dans le système unifié si disponible
            if UNIFIED_SYSTEM_AVAILABLE:
                try:
                    unified_manager = get_unified_task_manager()
                    
                    for task in tasks:
                        # Vérifier si la tâche n'existe pas déjà
                        existing_unified_tasks = unified_manager.load_all_tasks()
                        task_exists = any(
                            ut.get("source_metadata", {}).get("meeting_id") == task.get("meeting_id")
                            and ut.get("description") == task.get("description")
                            for ut in existing_unified_tasks
                        )
                        
                        if not task_exists:
                            # Convertir vers format unifié
                            unified_task_data = {
                                "description": task.get("description", ""),
                                "responsable": task.get("responsable", ""),
                                "deadline": task.get("deadline"),
                                "priorite": task.get("priorite", "medium"),
                                "statut": "pending",
                                "confiance_ia": 0.9,
                                "source": "meeting",
                                "type": "explicite",
                                "source_metadata": {
                                    "meeting_id": task.get("meeting_id"),
                                    "meeting_titre": task.get("meeting_titre"),
                                    "meeting_date": task.get("meeting_date"),
                                    "meeting_participants": task.get("meeting_participants", []),
                                    "original_meeting": task.get("origine_meeting", {})
                                }
                            }
                            unified_manager.add_task(unified_task_data)
                    
                    logger.info("✅ Tâches meeting sauvegardées dans le système unifié")
                except Exception as e:
                    logger.warning(f"⚠️ Erreur sauvegarde système unifié: {e}")
                    
        except Exception as e:
            logger.error(f"❌ Erreur sauvegarde meeting tasks: {e}")
    
    def structure_meeting_as_email(self, meeting: Dict) -> Dict:
        """
        Convertit une réunion en format 'email' pour réutiliser l'IA existante
        """
        participants_presents = [p["nom"] for p in meeting["participants"] if p["present"]]
        participants_emails = [p["email"] for p in meeting["participants"] if p["present"]]
        
        pseudo_email = {
            "id": f"meeting_{meeting['id']}",
            "expediteur": meeting["organisateur"]["email"],
            "destinataire": ", ".join(participants_emails),
            "objet": f"Réunion: {meeting['titre']} - {meeting['date_reunion']}",
            "texte": f"""
RÉUNION: {meeting['titre']}
DATE: {meeting['date_reunion']} de {meeting['heure_debut']} à {meeting['heure_fin']}
DURÉE: {meeting['duree_minutes']} minutes
LIEU: {meeting['lieu']}
ORGANISATEUR: {meeting['organisateur']['nom']} ({meeting['organisateur']['role']})

PARTICIPANTS PRÉSENTS:
{chr(10).join([f"- {p['nom']} ({p['role']})" for p in meeting['participants'] if p['present']])}

PROJET ASSOCIÉ: {meeting['projet_associe']}
DÉPARTEMENT: {meeting['departement']}

ORDRE DU JOUR:
{chr(10).join([f"- {item}" for item in meeting['ordre_du_jour']])}

TRANSCRIPTION DE LA RÉUNION:
{meeting['transcription']}
            """.strip(),
            "date_reception": meeting["date_ajout"],
            "type_source": "meeting_transcription",
            "statut_traitement": "non_traité"
        }
        
        return pseudo_email
    
    def process_meeting(self, meeting: Dict) -> Dict:
        """
        Traite une réunion spécifique et extrait les tâches
        """
        try:
            logger.info(f"🎯 Traitement réunion: {meeting['titre']}")
            
            # 1. Convertir en pseudo-email
            pseudo_email = self.structure_meeting_as_email(meeting)
            
            # 2. Calculer hash pour cache
            hash_transcription = calculer_hash_email(pseudo_email["texte"], pseudo_email["objet"])
            meeting["hash_transcription"] = hash_transcription
            
            # 3. Vérifier cache (réutiliser système existant)
            if est_email_deja_traite(hash_transcription):
                logger.info(f"📋 Réunion déjà traitée (cache): {meeting['id']}")
                return {
                    "meeting_id": meeting["id"],
                    "status": "cache_hit",
                    "tasks_extracted": 0,
                    "message": "Réunion déjà traitée"
                }
            
            # 4. Extraire tâches (réutiliser agent existant)
            tasks_json = extract_tasks_from_email(pseudo_email["texte"])
            
            # 4.1 Parser le JSON retourné par l'IA
            try:
                tasks = json.loads(tasks_json) if isinstance(tasks_json, str) else tasks_json
                if not isinstance(tasks, list):
                    tasks = []
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ Erreur parsing JSON IA: {e}")
                tasks = []
            
            # 5. Enrichir tâches avec métadonnées réunion
            enriched_tasks = []
            for i, task in enumerate(tasks):
                enriched_task = {
                    **task,
                    "meeting_id": meeting["id"],
                    "meeting_titre": meeting["titre"],
                    "meeting_date": meeting["date_reunion"],
                    "meeting_participants": [p["nom"] for p in meeting["participants"] if p["present"]],
                    "source": "meeting",
                    "origine_meeting": {
                        "titre": meeting["titre"],
                        "date": meeting["date_reunion"],
                        "organisateur": meeting["organisateur"]["nom"],
                        "participants": [p["nom"] for p in meeting["participants"] if p["present"]],
                        "departement": meeting["departement"],
                        "projet": meeting["projet_associe"],
                        "type_reunion": meeting["type_reunion"]
                    }
                }
                enriched_tasks.append(enriched_task)
            
            # 6. Sauvegarder tâches
            if enriched_tasks:
                existing_tasks = self.load_meeting_tasks()
                existing_tasks.extend(enriched_tasks)
                self.save_meeting_tasks(existing_tasks)
            
            # 7. Marquer comme traité dans cache
            marquer_email_traite(hash_transcription, {
                "meeting_id": meeting["id"],
                "nb_taches": len(enriched_tasks),
                "processed_at": datetime.now().isoformat()
            })
            
            # 8. Mettre à jour statut réunion
            meeting["statut_traitement"] = "traité"
            meeting["nb_taches_extraites"] = len(enriched_tasks)
            meeting["actions_identifiees"] = [task["description"] for task in enriched_tasks]
            
            # 9. Logger résultat
            self.log_meeting_processing(meeting["id"], len(enriched_tasks), "succès")
            
            logger.info(f"✅ Réunion traitée: {len(enriched_tasks)} tâches extraites")
            
            return {
                "meeting_id": meeting["id"],
                "status": "success",
                "tasks_extracted": len(enriched_tasks),
                "tasks": enriched_tasks,
                "message": f"Réunion traitée avec succès, {len(enriched_tasks)} tâches extraites"
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur traitement réunion {meeting['id']}: {e}")
            self.log_meeting_processing(meeting["id"], 0, "erreur", str(e))
            return {
                "meeting_id": meeting["id"],
                "status": "error", 
                "tasks_extracted": 0,
                "error": str(e),
                "message": f"Erreur lors du traitement: {e}"
            }
    
    def traiter_toutes_reunions(self, use_cache: bool = True) -> Dict:
        """
        Traite toutes les réunions non traitées
        """
        try:
            meetings = self.load_meetings()
            
            if not meetings:
                return {
                    "total_meetings": 0,
                    "processed": 0,
                    "tasks_extracted": 0,
                    "errors": 0,
                    "message": "Aucune réunion à traiter"
                }
            
            stats = {
                "total_meetings": len(meetings),
                "processed": 0,
                "tasks_extracted": 0,
                "errors": 0,
                "cache_hits": 0,
                "results": []
            }
            
            for meeting in meetings:
                if meeting.get("statut_traitement") == "non_traité" or not use_cache:
                    result = self.process_meeting(meeting)
                    stats["results"].append(result)
                    
                    if result["status"] == "success":
                        stats["processed"] += 1
                        stats["tasks_extracted"] += result["tasks_extracted"]
                    elif result["status"] == "cache_hit":
                        stats["cache_hits"] += 1
                    else:
                        stats["errors"] += 1
            
            # Sauvegarder réunions mises à jour
            self.save_meetings(meetings)
            
            logger.info(f"📊 Traitement terminé: {stats['processed']} réunions, {stats['tasks_extracted']} tâches")
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Erreur traitement global réunions: {e}")
            return {
                "total_meetings": 0,
                "processed": 0,
                "tasks_extracted": 0,
                "errors": 1,
                "error": str(e),
                "message": f"Erreur globale: {e}"
            }
    
    def log_meeting_processing(self, meeting_id: str, nb_taches: int, statut: str, erreur: str = ""):
        """Enregistre le traitement dans les logs"""
        try:
            logs = []
            if os.path.exists(self.logs_file):
                with open(self.logs_file, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            
            log_entry = {
                "horodatage": datetime.now().isoformat(),
                "meeting_id": meeting_id,
                "statut": statut,
                "nb_taches": nb_taches,
                "erreur": erreur,
                "type_traitement": "meeting_processing"
            }
            
            logs.append(log_entry)
            
            with open(self.logs_file, 'w', encoding='utf-8') as f:
                json.dump(logs, f, ensure_ascii=False, indent=4)
                
        except Exception as e:
            logger.error(f"❌ Erreur logging meeting: {e}")
    
    def get_meeting_by_id(self, meeting_id: str) -> Dict:
        """Récupère une réunion par son ID"""
        meetings = self.load_meetings()
        for meeting in meetings:
            if meeting["id"] == meeting_id:
                return meeting
        return None
    
    def get_tasks_by_meeting(self, meeting_id: str) -> List[Dict]:
        """Récupère les tâches d'une réunion spécifique"""
        tasks = self.load_meeting_tasks()
        return [task for task in tasks if task.get("meeting_id") == meeting_id]
    
    def get_all_unified_tasks(self) -> Dict:
        """Combine toutes les tâches : emails + meetings"""
        try:
            # Tâches emails existantes
            email_tasks = []
            email_tasks_file = os.path.join(BASE_DIR, "data", "tasks.json")
            if os.path.exists(email_tasks_file):
                with open(email_tasks_file, 'r', encoding='utf-8') as f:
                    email_tasks = json.load(f)
            
            # Tâches meetings
            meeting_tasks = self.load_meeting_tasks()
            
            return {
                "email_tasks": email_tasks,
                "meeting_tasks": meeting_tasks,
                "total_email_tasks": len(email_tasks),
                "total_meeting_tasks": len(meeting_tasks),
                "total_unified_tasks": len(email_tasks) + len(meeting_tasks)
            }
        except Exception as e:
            logger.error(f"❌ Erreur récupération tâches unifiées: {e}")
            return {
                "email_tasks": [],
                "meeting_tasks": [],
                "total_email_tasks": 0,
                "total_meeting_tasks": 0,
                "total_unified_tasks": 0,
                "error": str(e)
            }

# Instance globale
meeting_processor = MeetingProcessor()

def traiter_reunions(use_cache: bool = True) -> Dict:
    """Fonction principale de traitement des réunions"""
    return meeting_processor.traiter_toutes_reunions(use_cache)

def get_meeting_processor():
    """Retourne l'instance du processeur de réunions"""
    return meeting_processor
