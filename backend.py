# -*- coding: utf-8 -*-
"""
Backend processing logic for AI Task Extraction System
"""

import json
import uuid
from datetime import datetime
from typing import List, Dict, Any
from config import DATA_FILE, UNIFIED_TASKS_FILE
from utils import est_doublon, ecrire_log

# Import modules (fallback if not available)
try:
    import agent_task
    from agent_task import (
        extract_tasks_from_email,
        resume_email,
        identifier_departement,
        deduire_priorite,
        suggere_taches_implicites
    )
    import pipeline
    from pipeline import traiter_emails
    import background_service
    from background_service import get_background_service
    import cache_emails
    from cache_emails import (
        calculer_hash_email,
        est_email_deja_traite,
        marquer_email_traite,
        obtenir_statistiques_cache,
        nettoyer_cache_ancien,
        obtenir_info_cache
    )
    import rate_limiter
    from rate_limiter import RateLimiter
    import email_queue
    from email_queue import EmailQueue
    # 🎯 NOUVEAU: Import du système de réunions
    import meeting_processor
    from meeting_processor import get_meeting_processor, traiter_reunions
    from pipeline import traiter_reunions as pipeline_traiter_reunions

    MODULES_DISPONIBLES = True
    print("✅ Tous les modules importés avec succès")

except ImportError as e:
    print(f"⚠️  Import warning: {e}")
    print("🔄 Mode de compatibilité activé - fonctionnalités de base disponibles")
    MODULES_DISPONIBLES = False

# Fallback functions
if not MODULES_DISPONIBLES:
    def extract_tasks_from_email(texte):
        return json.dumps([{"description": "Fonction d'extraction IA non disponible", "responsable": "système", "priorite": "moyenne"}])

    def resume_email(texte):
        return "Résumé non disponible"

    def identifier_departement(texte):
        return "Non identifié"

    def deduire_priorite(description):
        return "moyenne"

    def suggere_taches_implicites(texte):
        return json.dumps([{"description": "Suggestion de tâches non disponible", "responsable": "système", "priorite": "moyenne"}])

    def traiter_emails(**kwargs):
        return {"message": "Pipeline non disponible", "status": "limited_mode"}

    def calculer_hash_email(texte, objet=""):
        import hashlib
        return hashlib.md5((texte + objet).encode()).hexdigest()[:16]

    def est_email_deja_traite(hash_email):
        return False

    def marquer_email_traite(hash_email, info):
        pass

    def obtenir_statistiques_cache():
        return {"total_emails": 0, "cache_hits": 0, "cache_misses": 0}

    def nettoyer_cache_ancien(retention_days):
        pass

    def obtenir_info_cache(hash_email):
        return None

    def get_background_service():
        class MockService:
            def start_service(self): return False
            def stop_service(self): return False
            def get_service_status(self): return {"service_running": False, "mode": "mock"}
        return MockService()

    class RateLimiter:
        def get_current_stats(self):
            return {"requests_made": 0, "requests_remaining": 100}

    class EmailQueue:
        pass

# Unified system check
try:
    import sys
    sys.path.append("src/utils")
    from unified_task_manager import get_unified_task_manager
    UNIFIED_SYSTEM_AVAILABLE = True
    print("✅ Système unifié disponible")
except ImportError:
    UNIFIED_SYSTEM_AVAILABLE = False
    print("⚠️ Système unifié non disponible, utilisation du système legacy")

def process_email_explicit(input_data):
    """Traitement d'email avec tâches explicites"""
    try:
        # Vérification cache
        email_hash = calculer_hash_email(input_data.texte, input_data.objet)

        if est_email_deja_traite(email_hash):
            info_cache = obtenir_info_cache(email_hash)
            ecrire_log(input_data.objet, "cache_hit", "Récupéré depuis cache", 0)

            return {
                "status": "cache_hit",
                "message": "Email similaire déjà traité",
                "hash_email": email_hash,
                "info_traitement_precedent": info_cache,
                "nouvelles_taches": [],
                "economies_ia": "Appel OpenRouter évité"
            }

        # Traitement IA
        result_text = extract_tasks_from_email(input_data.texte)
        tasks = json.loads(result_text)

        if not isinstance(tasks, list):
            raise ValueError("Résultat IA n'est pas une liste")

        # Enrichissement des données
        resume = resume_email(input_data.texte)
        if input_data.departement:
            departement_info = {"nom": input_data.departement, "origine": "Utilisateur"}
        else:
            nom_dept = identifier_departement(input_data.texte)
            departement_info = {"nom": nom_dept, "origine": "AI"}

        origine_email = {
            "expediteur": input_data.expediteur,
            "destinataire": input_data.destinataire,
            "objet": input_data.objet,
            "date_reception": input_data.date_reception,
            "resume_contenu": resume,
            "departement": departement_info
        }

        # Lecture des tâches existantes
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        nouvelles_taches_ajoutees = []

        for task in tasks:
            # Enrichissement des tâches
            if not task.get("deadline"):
                task["deadline"] = "inconnue"
            if not task.get("responsable"):
                task["responsable"] = "non précisé"
            if not task.get("priorite") or task["priorite"].strip() == "":
                task["priorite"] = deduire_priorite(task["description"])

            task["id"] = str(uuid.uuid4())
            task["confiance_ia"] = 1.0
            task["source"] = "email"
            task["type"] = "explicite"
            task["extrait_le"] = datetime.now().isoformat(timespec='seconds')
            task["statut"] = "à faire"
            task["origine_email"] = origine_email

            # Vérification anti-doublon
            if est_doublon(task, data):
                print(f"🟡 Doublon détecté — tâche ignorée : {task['description']}")
                continue
            else:
                data.append(task)
                nouvelles_taches_ajoutees.append(task)

        # ✅ NOUVELLE LOGIQUE: Sauvegarde dans système unifié
        if UNIFIED_SYSTEM_AVAILABLE:
            # Mode moderne : Sauvegarder dans système unifié
            unified_manager = get_unified_task_manager()

            for task in nouvelles_taches_ajoutees:
                # Convertir format legacy vers unifié
                unified_task_data = {
                    "description": task["description"],
                    "responsable": task["responsable"],
                    "deadline": task.get("deadline"),
                    "priorite": task["priorite"],
                    "statut": task["statut"],
                    "confiance_ia": task["confiance_ia"],
                    "source": "email",
                    "type": task["type"],
                    "source_metadata": {
                        "original_email": task["origine_email"],
                        "email_id": task["id"],
                        "extraction_timestamp": task["extrait_le"]
                    }
                }

                # Ajouter au système unifié
                unified_task_id = unified_manager.add_task(unified_task_data)
                print(f"✅ Tâche ajoutée au système unifié: {unified_task_id}")

        # Sauvegarde LEGACY (pour compatibilité)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        ecrire_log(input_data.objet, "succès", result_text, len(nouvelles_taches_ajoutees))

        # Marquer email comme traité dans le cache
        marquer_email_traite(email_hash, {
            "objet": input_data.objet,
            "expediteur": input_data.expediteur,
            "destinataire": input_data.destinataire,
            "nb_taches": len(nouvelles_taches_ajoutees),
            "type_email": "explicite"
        })

        return {
            "status": "success",
            "ajoutees": len(nouvelles_taches_ajoutees),
            "taches": nouvelles_taches_ajoutees,
            "hash_email": email_hash,
            "cache_status": "nouvel_email_ajoute_au_cache"
        }

    except Exception as e:
        ecrire_log(input_data.objet, "échec", str(e), 0, str(e))
        raise

def process_email_implicite(input_data):
    """Traitement d'email avec tâches implicites"""
    try:
        # Vérification cache
        email_hash = calculer_hash_email(input_data.texte, input_data.objet)

        if est_email_deja_traite(email_hash):
            info_cache = obtenir_info_cache(email_hash)
            ecrire_log(input_data.objet, "cache_hit", "Récupéré depuis cache", 0)

            return {
                "status": "cache_hit",
                "message": "Email similaire déjà traité",
                "hash_email": email_hash,
                "info_traitement_precedent": info_cache,
                "nouvelles_taches": [],
                "economies_ia": "Appel OpenRouter évité"
            }

        # Traitement IA pour tâches implicites
        result_text = suggere_taches_implicites(input_data.texte)
        tasks = json.loads(result_text)

        if not isinstance(tasks, list):
            raise ValueError("Résultat IA n'est pas une liste")

        # Enrichissement des données
        resume = resume_email(input_data.texte)
        if input_data.departement:
            departement_info = {"nom": input_data.departement, "origine": "Utilisateur"}
        else:
            nom_dept = identifier_departement(input_data.texte)
            departement_info = {"nom": nom_dept, "origine": "AI"}

        origine_email = {
            "expediteur": input_data.expediteur,
            "destinataire": input_data.destinataire,
            "objet": input_data.objet,
            "date_reception": input_data.date_reception,
            "resume_contenu": resume,
            "departement": departement_info
        }

        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        nouvelles_taches_ajoutees = []

        for task in tasks:
            if not task.get("responsable"):
                task["responsable"] = "inconnu"
            if not task.get("priorite"):
                task["priorite"] = deduire_priorite(task["description"])
            if not task.get("confiance_ia"):
                task["confiance_ia"] = 0.6

            task["id"] = str(uuid.uuid4())
            task["source"] = "email"
            task["type"] = "implicite"
            task["extrait_le"] = datetime.now().isoformat(timespec='seconds')
            task["statut"] = "à faire"
            task["origine_email"] = origine_email

            if est_doublon(task, data):
                print(f"🟡 Doublon détecté — tâche ignorée : {task['description']}")
                continue
            else:
                data.append(task)
                nouvelles_taches_ajoutees.append(task)

        # ✅ NOUVELLE LOGIQUE: Sauvegarde dans système unifié (email-implicite)
        if UNIFIED_SYSTEM_AVAILABLE:
            # Mode moderne : Sauvegarder dans système unifié
            unified_manager = get_unified_task_manager()

            for task in nouvelles_taches_ajoutees:
                # Convertir format legacy vers unifié
                unified_task_data = {
                    "description": task["description"],
                    "responsable": task["responsable"],
                    "deadline": task.get("deadline"),
                    "priorite": task["priorite"],
                    "statut": task["statut"],
                    "confiance_ia": task["confiance_ia"],
                    "source": "email",
                    "type": task["type"],
                    "source_metadata": {
                        "original_email": task["origine_email"],
                        "email_id": task["id"],
                        "extraction_timestamp": task["extrait_le"]
                    }
                }

                # Ajouter au système unifié
                unified_task_id = unified_manager.add_task(unified_task_data)
                print(f"✅ Tâche ajoutée au système unifié: {unified_task_id}")

        # Sauvegarde LEGACY (pour compatibilité)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        ecrire_log(input_data.objet, "succès", result_text, len(nouvelles_taches_ajoutees))

        marquer_email_traite(email_hash, {
            "objet": input_data.objet,
            "expediteur": input_data.expediteur,
            "destinataire": input_data.destinataire,
            "nb_taches": len(nouvelles_taches_ajoutees),
            "type_email": "implicite"
        })

        return {
            "status": "success",
            "ajoutees": len(nouvelles_taches_ajoutees),
            "taches": nouvelles_taches_ajoutees,
            "hash_email": email_hash,
            "cache_status": "nouvel_email_ajoute_au_cache"
        }

    except Exception as e:
        ecrire_log(input_data.objet, "échec", str(e), 0, str(e))
        raise

def process_email_simple(input_data):
    """Endpoint POST pour traitement d'email simple"""
    try:
        # Convertir vers EmailInput
        from pydantic import BaseModel
        class EmailInput(BaseModel):
            texte: str
            expediteur: str = "API_direct"
            destinataire: str = "API_direct"
            objet: str = "Email via API"
            date_reception: str = datetime.now().strftime("%Y-%m-%d")
            departement: str = None

        email_input = EmailInput(
            texte=input_data.email,
            objet="Email via API POST"
        )

        # Utiliser la logique explicite
        return process_email_explicit(email_input)

    except Exception as e:
        raise

def process_meeting_manual(meeting_data):
    """Traite une réunion spécifique manuellement"""
    try:
        processor = get_meeting_processor()

        # Convertir en format dict
        meeting_dict = {
            "id": f"meeting_manual_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "titre": meeting_data.titre,
            "date_reunion": meeting_data.date_reunion,
            "heure_debut": meeting_data.heure_debut,
            "heure_fin": meeting_data.heure_fin,
            "duree_minutes": meeting_data.duree_minutes,
            "lieu": meeting_data.lieu,
            "organisateur": meeting_data.organisateur.dict(),
            "participants": [p.dict() for p in meeting_data.participants],
            "ordre_du_jour": meeting_data.ordre_du_jour,
            "transcription": meeting_data.transcription,
            "departement": meeting_data.departement,
            "projet_associe": meeting_data.projet_associe,
            "priorite_meeting": meeting_data.priorite_meeting,
            "type_reunion": meeting_data.type_reunion,
            "statut_traitement": "non_traité",
            "date_ajout": datetime.now().isoformat(),
            "tags": meeting_data.tags,
            "fichiers_associes": [f.dict() for f in meeting_data.fichiers_associes],
            "decisions_prises": [],
            "actions_identifiees": [],
            "nb_taches_extraites": 0,
            "hash_transcription": "",
            "resume_reunion": "",
            "points_importants": [],
            "prochaines_etapes": []
        }

        # Traiter la réunion
        result = processor.process_meeting(meeting_dict)

        return {
            "status": "success",
            "meeting_processed": result,
            "message": f"Réunion '{meeting_data.titre}' traitée avec succès"
        }

    except Exception as e:
        raise

def process_transcription_simple(data):
    """Traite une transcription simple sans métadonnées complètes"""
    try:
        processor = get_meeting_processor()

        # Créer réunion minimale
        meeting_dict = {
            "id": f"meeting_transcription_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "titre": data.meeting_title,
            "date_reunion": data.meeting_date,
            "heure_debut": "00:00",
            "heure_fin": "00:00",
            "duree_minutes": 0,
            "lieu": "Non spécifié",
            "organisateur": {
                "nom": "Non spécifié",
                "email": "organizer@unknown.com",
                "role": "Organisateur"
            },
            "participants": [
                {
                    "nom": nom,
                    "email": f"{nom.lower().replace(' ', '.')}@unknown.com",
                    "role": "Participant",
                    "present": True
                } for nom in data.participants
            ] if data.participants else [
                {
                    "nom": "Participant inconnu",
                    "email": "participant@unknown.com",
                    "role": "Participant",
                    "present": True
                }
            ],
            "ordre_du_jour": ["Points discutés pendant la réunion"],
            "transcription": data.transcription,
            "departement": "Non spécifié",
            "projet_associe": "",
            "priorite_meeting": "normale",
            "type_reunion": "general",
            "statut_traitement": "non_traité",
            "date_ajout": datetime.now().isoformat(),
            "tags": [],
            "fichiers_associes": [],
            "decisions_prises": [],
            "actions_identifiees": [],
            "nb_taches_extraites": 0,
            "hash_transcription": "",
            "resume_reunion": "",
            "points_importants": [],
            "prochaines_etapes": []
        }

        # Traiter la réunion
        result = processor.process_meeting(meeting_dict)

        return {
            "status": "success",
            "transcription_processed": result,
            "message": f"Transcription '{data.meeting_title}' traitée avec succès"
        }

    except Exception as e:
        raise

def get_tasks_statistics():
    """
    🎯 Récupérer les statistiques globales des tâches (KPI corrects)

    Retourne les vraies métriques basées sur TOUTES les tâches de la base
    """
    try:
        # 🚀 UTILISER LE SYSTÈME UNIFIÉ: Même source que /all-tasks
        if UNIFIED_SYSTEM_AVAILABLE and os.path.exists(UNIFIED_TASKS_FILE):
            unified_manager = get_unified_task_manager()
            all_tasks = unified_manager.load_all_tasks()
        else:
            # Fallback: utiliser l'ancien système
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            all_tasks = data if isinstance(data, list) else []

        # Calculer les statistiques
        total_tasks = len(all_tasks)

        if total_tasks == 0:
            return {
                "total": 0,
                "by_status": {"completed": 0, "in_progress": 0, "pending": 0, "rejected": 0},
                "by_priority": {"urgent": 0, "high": 0, "medium": 0, "low": 0},
                "completion_rate": 0.0
            }

        completed_tasks = len([t for t in all_tasks if t.get('statut') == 'completed'])
        in_progress_tasks = len([t for t in all_tasks if t.get('statut') == 'in_progress'])
        pending_tasks = len([t for t in all_tasks if t.get('statut') == 'pending'])
        rejected_tasks = len([t for t in all_tasks if t.get('statut') == 'rejected'])

        # Statistiques par priorité
        high_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'high'])
        urgent_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'urgent'])
        medium_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'medium'])
        low_priority_tasks = len([t for t in all_tasks if t.get('priorite') == 'low'])

        return {
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

    except Exception as e:
        raise

# 🔍 DOCUMENT PROCESSING FUNCTIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_path):
    """Extract text from Word document"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting text from Word document: {str(e)}")

def extract_text_from_txt(file_path):
    """Extract text from plain text file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except UnicodeDecodeError:
        # Try with different encoding
        with open(file_path, 'r', encoding='latin-1') as f:
            return f.read().strip()
    except Exception as e:
        raise ValueError(f"Error reading text file: {str(e)}")

def extract_text_from_image(file_path):
    """Extract text from image using OCR"""
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise ValueError(f"Error extracting text from image: {str(e)}")

def validate_file_type(file_path, allowed_types=None):
    """Validate file type and return content type"""
    if allowed_types is None:
        allowed_types = ['pdf', 'docx', 'doc', 'txt', 'png', 'jpg', 'jpeg', 'tiff', 'bmp']

    try:
        import magic
        mime = magic.Magic(mime=True)
        file_mime = mime.from_file(file_path)

        # Map MIME types to file extensions
        mime_to_ext = {
            'application/pdf': 'pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/msword': 'doc',
            'text/plain': 'txt',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/tiff': 'tiff',
            'image/bmp': 'bmp'
        }

        file_ext = mime_to_ext.get(file_mime)
        if file_ext and file_ext in allowed_types:
            return file_ext, file_mime
        else:
            raise ValueError(f"Unsupported file type: {file_mime}")

    except ImportError:
        # Fallback to extension-based detection
        import os
        _, ext = os.path.splitext(file_path)
        ext = ext.lower().lstrip('.')
        if ext in allowed_types:
            return ext, f"application/{ext}" if ext != 'txt' else 'text/plain'
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

def process_document_file(file_path, filename, department=None):
    """Process a document file and extract tasks"""
    try:
        # Validate file type
        file_ext, mime_type = validate_file_type(file_path)

        # Extract text based on file type
        if file_ext == 'pdf':
            extracted_text = extract_text_from_pdf(file_path)
        elif file_ext in ['docx', 'doc']:
            extracted_text = extract_text_from_docx(file_path)
        elif file_ext == 'txt':
            extracted_text = extract_text_from_txt(file_path)
        elif file_ext in ['png', 'jpg', 'jpeg', 'tiff', 'bmp']:
            extracted_text = extract_text_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        if not extracted_text or len(extracted_text.strip()) < 10:
            return {
                "status": "error",
                "message": "No readable text found in document",
                "file_info": {
                    "filename": filename,
                    "file_type": file_ext,
                    "mime_type": mime_type
                }
            }

        # Create a mock email input for task extraction
        from pydantic import BaseModel
        class DocumentInput(BaseModel):
            texte: str
            expediteur: str = "document_processor@system.com"
            destinataire: str = "task_system@system.com"
            objet: str = f"Document: {filename}"
            date_reception: str = datetime.now().strftime("%Y-%m-%d")
            departement: str = department

        doc_input = DocumentInput(
            texte=extracted_text,
            objet=f"Document: {filename}",
            departement=department
        )

        # Extract tasks using existing logic
        result = process_email_explicit(doc_input)

        # Add document metadata
        result["document_info"] = {
            "filename": filename,
            "file_type": file_ext,
            "mime_type": mime_type,
            "text_length": len(extracted_text),
            "processed_at": datetime.now().isoformat()
        }

        return result

    except Exception as e:
        return {
            "status": "error",
            "message": f"Document processing failed: {str(e)}",
            "file_info": {
                "filename": filename
            }
        }
