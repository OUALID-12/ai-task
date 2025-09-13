# -*- coding: utf-8 -*-
"""
🚀 AI TASK EXTRACTION SYSTEM - API COMPLÈTE
==========================================

Système intelligent d'extraction de tâches depuis les emails
Toutes les améliorations intégrées et fonctionnelles

Version: 2.0.0 - Production Ready
Usage: python -m uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import os
import uuid
from contextlib import asynccontextmanager
import sys
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Configuration Email
email_conf = ConnectionConfig(
    MAIL_USERNAME="your_email@example.com",  # Remplacer par votre email
    MAIL_PASSWORD="your_password",  # Remplacer par votre mot de passe
    MAIL_FROM="your_email@example.com",  # Remplacer par votre email
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",  # Ou votre serveur SMTP
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Instance FastMail
fastmail = FastMail(email_conf)

# Ajouter le dossier src au path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "core"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "utils"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "services"))

# Chemins déjà ajoutés ci-dessus

# Imports des modules existants  
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

# Fonctions de fallback si les modules ne sont pas disponibles
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

# Modèles Pydantic
class EmailInput(BaseModel):
    texte: str
    expediteur: str = "API_direct"
    destinataire: str = "API_direct"
    objet: str = "Email via API"
    date_reception: str = datetime.now().strftime("%Y-%m-%d")
    departement: str = None

class EmailSimple(BaseModel):
    email: str
    use_cache: bool = True
    rapid_mode: bool = False
    secure_mode: bool = True
    batch_mode: bool = False
    custom_prompt: str = None

# 🎯 NOUVEAUX MODÈLES POUR LES RÉUNIONS
class Participant(BaseModel):
    nom: str
    email: str
    role: str
    present: bool = True
    excuse: str = ""

class Organisateur(BaseModel):
    nom: str
    email: str
    role: str

class FichierAssocie(BaseModel):
    nom: str
    chemin: str
    type: str

class MeetingInput(BaseModel):
    titre: str
    date_reunion: str
    heure_debut: str
    heure_fin: str
    duree_minutes: int
    lieu: str
    organisateur: Organisateur
    participants: List[Participant]
    ordre_du_jour: List[str]
    transcription: str
    departement: str
    projet_associe: str = ""
    priorite_meeting: str = "normale"
    type_reunion: str = "general"
    tags: List[str] = []
    fichiers_associes: List[FichierAssocie] = []

class TranscriptionSimple(BaseModel):
    transcription: str
    meeting_title: str = "Réunion sans titre"
    meeting_date: str = datetime.now().strftime("%Y-%m-%d")
    participants: List[str] = []

# 🆕 NOUVEAUX MODÈLES POUR MODIFICATIONS DE TÂCHES - PHASE 6
from typing import Optional
from pydantic import Field, validator

class TaskUpdateComplete(BaseModel):
    """Modèle pour modification complète d'une tâche (PUT)"""
    description: str = Field(..., min_length=3, max_length=500)
    responsable: str = Field(..., min_length=1, max_length=100)
    priorite: str = Field(..., pattern="^(high|medium|low|urgent)$")
    statut: str = Field(..., pattern="^(pending|in_progress|completed|cancelled|rejected)$")
    deadline: Optional[str] = Field(None, pattern=r"^(\d{4}-\d{2}-\d{2})?$")
    department: Optional[str] = Field(None, max_length=50)
    
    @validator('deadline')
    def validate_deadline(cls, v):
        if v and v.strip():
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                raise ValueError('Format de date invalide, utilisez YYYY-MM-DD')
        return None

class TaskComment(BaseModel):
    """Modèle pour ajouter un commentaire à une tâche"""
    comment: str = Field(..., min_length=1, max_length=1000)
    author: Optional[str] = Field("user", max_length=100)

# =====================================
# 🆕 MODÈLES POUR ENVOI D'EMAILS
# =====================================

class EmailSendRequest(BaseModel):
    """Modèle pour envoyer un email"""
    to_email: str = Field(..., description="Adresse email du destinataire")
    subject: str = Field(..., min_length=1, max_length=200, description="Sujet de l'email")
    body: str = Field(..., min_length=1, max_length=10000, description="Contenu de l'email")
    cc: Optional[List[str]] = Field(None, description="Adresses email en copie")
    bcc: Optional[List[str]] = Field(None, description="Adresses email en copie cachée")

    @validator('to_email', 'cc', 'bcc')
    def validate_email_format(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            # Validation basique du format email
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v):
                raise ValueError(f'Format d\'email invalide: {v}')
            return v
        elif isinstance(v, list):
            for email in v:
                import re
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, email):
                    raise ValueError(f'Format d\'email invalide: {email}')
            return v
        return v

class EmailResponse(BaseModel):
    """Modèle de réponse pour l'envoi d'email"""
    status: str
    message: str
    email_id: Optional[str] = None
    sent_at: str
    recipient: str
    subject: str

# 🏷️ NOUVEAUX MODÈLES POUR SYSTÈME DE TAGS - PHASE 7
class TaskTags(BaseModel):
    """Modèle pour ajouter des tags à une tâche"""
    tags: List[str] = Field(..., min_items=1, max_items=7)
    
    @validator('tags', each_item=True)
    def validate_tag(cls, v):
        # Normalisation et validation des tags
        if not v or not isinstance(v, str):
            raise ValueError('Tag invalide')
        
        # Normaliser : lowercase, strip, remplacer espaces par tirets
        normalized = v.strip().lower().replace(' ', '-').replace('_', '-')
        
        # Remplacer caractères accentués
        import unicodedata
        normalized = unicodedata.normalize('NFD', normalized)
        normalized = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
        
        # Validation : alphanumériques et tirets seulement
        import re
        if not re.match(r'^[a-z0-9-]+$', normalized):
            raise ValueError(f'Tag invalide: "{v}". Utilisez uniquement lettres, chiffres et tirets')
        
        # Longueur limitée
        if len(normalized) < 2 or len(normalized) > 20:
            raise ValueError(f'Tag trop court/long: "{v}". Entre 2 et 20 caractères')
        
        return normalized
    
    @validator('tags')
    def validate_unique_tags(cls, v):
        # Éliminer les doublons
        unique_tags = list(set(v))
        if len(unique_tags) != len(v):
            raise ValueError('Tags dupliqués détectés')
        return unique_tags

class TaskCreate(BaseModel):
    """
    ✨ Modèle pour créer une nouvelle tâche avec tags
    """
    title: str
    description: str
    priority: str = "medium"  # low, medium, high
    deadline: Optional[str] = None
    department: str = "general"
    tags: Optional[List[str]] = []
    
    @validator('deadline')
    def validate_deadline(cls, v):
        if v:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
                return v
            except ValueError:
                raise ValueError('Format de date invalide. Utilisez ISO format (YYYY-MM-DDTHH:MM:SS)')
        return v
    
    @validator('tags', each_item=True)
    def normalize_tags(cls, v):
        if not v:
            return v
        
        # Normaliser : lowercase, strip, remplacer espaces par tirets
        normalized = v.strip().lower().replace(' ', '-').replace('_', '-')
        
        # Remplacer caractères accentués
        import unicodedata
        normalized = unicodedata.normalize('NFD', normalized)
        normalized = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
        
        # Validation : alphanumériques et tirets seulement
        import re
        if not re.match(r'^[a-z0-9-]+$', normalized):
            raise ValueError(f'Tag invalide: "{v}". Utilisez uniquement lettres, chiffres et tirets')
        
        # Longueur limitée
        if len(normalized) < 2 or len(normalized) > 20:
            raise ValueError(f'Tag trop court/long: "{v}". Entre 2 et 20 caractères')
        
        return normalized
    
    @validator('tags')
    def validate_tag_limits(cls, v):
        if len(v) > 7:
            raise ValueError('Maximum 7 tags par tâche')
        # Éliminer les doublons
        unique_tags = list(set(v))
        if len(unique_tags) != len(v):
            raise ValueError('Tags dupliqués détectés')
        return unique_tags

# 🔧 MODÈLES POUR MODIFICATIONS PARTIELLES
class TaskPriorityUpdate(BaseModel):
    """Modèle pour modification de priorité"""
    priority: str = Field(..., pattern="^(high|medium|low|urgent)$")

class TaskDescriptionUpdate(BaseModel):
    """Modèle pour modification de description"""
    description: str = Field(..., min_length=3, max_length=500)

class TaskDeadlineUpdate(BaseModel):
    """Modèle pour modification de deadline"""
    deadline: Optional[str] = Field(None, pattern=r"^(\d{4}-\d{2}-\d{2})?$")
    
    @validator('deadline')
    def validate_deadline(cls, v):
        if v and v.strip():
            try:
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                raise ValueError('Format de date invalide, utilisez YYYY-MM-DD')
        return None

class TaskDepartmentUpdate(BaseModel):
    """Modèle pour modification de département"""
    department: Optional[str] = Field(None, max_length=50)

# Configuration des fichiers
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

DATA_FILE = os.path.join(DATA_DIR, "tasks.json")
LOG_FILE = os.path.join(DATA_DIR, "logs.json")
UNIFIED_TASKS_FILE = os.path.join(DATA_DIR, "unified_tasks.json")

# 🔄 NOUVEAU: Support du système unifié - PHASE 2
try:
    sys.path.append("src/utils")
    from unified_task_manager import get_unified_task_manager
    UNIFIED_SYSTEM_AVAILABLE = True
    print("✅ Système unifié disponible")
except ImportError:
    UNIFIED_SYSTEM_AVAILABLE = False
    print("⚠️ Système unifié non disponible, utilisation du système legacy")

# Créer les fichiers s'ils n'existent pas
for file_path in [DATA_FILE, LOG_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=4)

# Gestionnaire de cycle de vie
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    print("🚀 Démarrage de l'application AI Task Extraction...")
    
    try:
        service = get_background_service()
        if service.start_service():
            print("✅ Service de surveillance temps réel démarré")
        else:
            print("❌ Erreur lors du démarrage du service de surveillance")
    except Exception as e:
        print(f"⚠️  Service de surveillance non disponible: {e}")
    
    yield
    
    print("🛑 Arrêt de l'application...")
    try:
        service = get_background_service()
        service.stop_service()
        print("✅ Service de surveillance arrêté")
    except:
        pass

# Application FastAPI
app = FastAPI(
    title="AI Task Extraction System",
    description="Système intelligent d'extraction de tâches depuis les emails avec toutes les améliorations",
    version="2.0.0",
    lifespan=lifespan
)

# Configuration CORS pour permettre les requêtes depuis le frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5175"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fonctions utilitaires
def est_doublon(nouvelle_tache, anciennes_taches):
    """Vérifie si une tâche est déjà présente"""
    for t in anciennes_taches:
        if (t["description"].strip().lower() == nouvelle_tache["description"].strip().lower() and
            t["responsable"].strip().lower() == nouvelle_tache["responsable"].strip().lower()):
            return True
    return False

def ecrire_log(email_objet, statut, resultat_ia, nb_taches=0, erreur=None):
    """Écrire un log d'événement"""
    horodatage = datetime.now().isoformat(timespec='seconds')
    log_entree = {
        "horodatage": horodatage,
        "email_objet": email_objet,
        "statut": statut,
        "resultat_ia_brut": resultat_ia
    }
    if statut == "succès":
        log_entree["taches_extraites"] = nb_taches
    if erreur:
        log_entree["erreur"] = erreur

    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except:
        logs = []

    logs.append(log_entree)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)

# =====================================
# ENDPOINTS PRINCIPAUX
# =====================================

@app.get("/")
async def root():
    """Endpoint racine avec informations système"""
    return {
        "message": "🚀 AI Task Extraction System - Production Ready",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Cache anti-doublon",
            "Batch processing", 
            "Rate limiting + Queue",
            "Optimisation prompts IA",
            "Monitoring temps réel"
        ],
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "emails_explicite": "/email-explicite",
            "emails_implicite": "/email-implicite", 
            "traitement_unifie": "/traiter-emails",
            "monitoring": "/monitoring/system_health",
            "cache": "/cache/stats"
        },
        "uvicorn_ready": True
    }

@app.get("/health")
async def health():
    """Endpoint de santé simple"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "project_status": "organized_and_functional"
    }

# =====================================
# ENDPOINTS TRAITEMENT EMAILS
# =====================================

@app.post("/email-explicite")
def handle_email_explicit(input: EmailInput):
    """Traitement d'email avec tâches explicites"""
    try:
        # Vérification cache
        email_hash = calculer_hash_email(input.texte, input.objet)
        
        if est_email_deja_traite(email_hash):
            info_cache = obtenir_info_cache(email_hash)
            ecrire_log(input.objet, "cache_hit", "Récupéré depuis cache", 0)
            
            return {
                "status": "cache_hit",
                "message": "Email similaire déjà traité",
                "hash_email": email_hash,
                "info_traitement_precedent": info_cache,
                "nouvelles_taches": [],
                "economies_ia": "Appel OpenRouter évité"
            }
        
        # Traitement IA
        result_text = extract_tasks_from_email(input.texte)
        tasks = json.loads(result_text)
        
        if not isinstance(tasks, list):
            raise ValueError("Résultat IA n'est pas une liste")
        
        # Enrichissement des données
        resume = resume_email(input.texte)
        if input.departement:
            departement_info = {"nom": input.departement, "origine": "Utilisateur"}
        else:
            nom_dept = identifier_departement(input.texte)
            departement_info = {"nom": nom_dept, "origine": "AI"}

        origine_email = {
            "expediteur": input.expediteur,
            "destinataire": input.destinataire,
            "objet": input.objet,
            "date_reception": input.date_reception,
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

        ecrire_log(input.objet, "succès", result_text, len(nouvelles_taches_ajoutees))
        
        # Marquer email comme traité dans le cache
        marquer_email_traite(email_hash, {
            "objet": input.objet,
            "expediteur": input.expediteur,
            "destinataire": input.destinataire,
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
        ecrire_log(input.objet, "échec", str(e), 0, str(e))
        raise HTTPException(status_code=500, detail=f"Erreur traitement: {str(e)}")

@app.post("/email-implicite")
def handle_email_implicite(input: EmailInput):
    """Traitement d'email avec tâches implicites"""
    try:
        # Vérification cache
        email_hash = calculer_hash_email(input.texte, input.objet)
        
        if est_email_deja_traite(email_hash):
            info_cache = obtenir_info_cache(email_hash)
            ecrire_log(input.objet, "cache_hit", "Récupéré depuis cache", 0)
            
            return {
                "status": "cache_hit",
                "message": "Email similaire déjà traité",
                "hash_email": email_hash,
                "info_traitement_precedent": info_cache,
                "nouvelles_taches": [],
                "economies_ia": "Appel OpenRouter évité"
            }
        
        # Traitement IA pour tâches implicites
        result_text = suggere_taches_implicites(input.texte)
        tasks = json.loads(result_text)
        
        if not isinstance(tasks, list):
            raise ValueError("Résultat IA n'est pas une liste")
        
        # Enrichissement des données
        resume = resume_email(input.texte)
        if input.departement:
            departement_info = {"nom": input.departement, "origine": "Utilisateur"}
        else:
            nom_dept = identifier_departement(input.texte)
            departement_info = {"nom": nom_dept, "origine": "AI"}

        origine_email = {
            "expediteur": input.expediteur,
            "destinataire": input.destinataire,
            "objet": input.objet,
            "date_reception": input.date_reception,
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

        ecrire_log(input.objet, "succès", result_text, len(nouvelles_taches_ajoutees))
        
        marquer_email_traite(email_hash, {
            "objet": input.objet,
            "expediteur": input.expediteur,
            "destinataire": input.destinataire,
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
        ecrire_log(input.objet, "échec", str(e), 0, str(e))
        raise HTTPException(status_code=500, detail=f"Erreur traitement: {str(e)}")

@app.get("/traiter-emails")
def api_traiter_emails_unifie(
    use_rate_limiting: bool = False,
    use_batch_processing: bool = True,
    use_cache: bool = True,
    use_optimized_prompts: bool = True
    ):
    """🚀 ENDPOINT UNIFIÉ: Traitement emails avec toutes les améliorations"""
    try:
        resultat = traiter_emails(
            use_rate_limiting=use_rate_limiting,
            use_batch_processing=use_batch_processing,
            use_cache=use_cache,
            use_optimized_prompts=use_optimized_prompts
        )
        
        optimisations_actives = []
        if use_cache:
            optimisations_actives.append("Cache anti-doublon")
        if use_batch_processing:
            optimisations_actives.append("Batch processing intelligent")
        if use_rate_limiting:
            optimisations_actives.append("Rate limiting + Queue")
        if use_optimized_prompts:
            optimisations_actives.append("Prompts IA optimisés")
        
        return {
            "status": "success",
            "mode": "production_optimized_processing",
            "optimisations_actives": optimisations_actives,
            "details": resultat,
            "message": f"Emails traités avec {len(optimisations_actives)} optimisations actives"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur traitement unifié: {str(e)}")

@app.post("/traiter_emails")
def traiter_emails_post(input: EmailSimple):
    """Endpoint POST pour traitement d'email simple"""
    try:
        # Convertir vers EmailInput
        email_input = EmailInput(
            texte=input.email,
            objet="Email via API POST"
        )
        
        # Utiliser la logique explicite
        return handle_email_explicit(email_input)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur traitement: {str(e)}")

# =====================================
# ENDPOINTS MONITORING
# =====================================

@app.get("/monitoring/system_health")
def system_health():
    """Santé globale du système"""
    try:
        service = get_background_service()
        status = service.get_service_status()
    except:
        status = {"service_running": False, "error": "Service non disponible"}
    
    files_status = {}
    for file_name in ["data/emails.json", "data/tasks.json", "data/logs.json"]:
        files_status[file_name] = {
            "exists": os.path.exists(file_name),
            "readable": os.access(file_name, os.R_OK) if os.path.exists(file_name) else False,
            "writable": os.access(file_name, os.W_OK) if os.path.exists(file_name) else False
        }
    
    return {
        "system_status": "healthy",
        "service_status": status,
        "files_status": files_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/monitoring/rate_limit")
def get_rate_limit_status():
    """Statut du rate limiter"""
    try:
        limiter = RateLimiter()
        stats = limiter.get_current_stats()
        return {
            "status": "success",
            "rate_limit_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Rate limiter non disponible: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/monitoring/queue")
def get_queue_status():
    """Statut de la file d'attente"""
    return {
        "status": "success",
        "message": "Queue status endpoint disponible",
        "note": "Queue créée dynamiquement lors du traitement rate-limited",
        "timestamp": datetime.now().isoformat()
    }

# =====================================
# ENDPOINTS CACHE
# =====================================

@app.get("/cache/stats")
def get_cache_statistics():
    """Statistiques du cache d'emails"""
    try:
        stats = obtenir_statistiques_cache()
        stats["cache_file_exists"] = os.path.exists("data/emails_cache.json")
        if stats["cache_file_exists"]:
            stats["cache_file_size"] = os.path.getsize("data/emails_cache.json")
        
        return {
            "status": "success",
            "cache_statistics": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Erreur cache: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/cache/cleanup")
def cleanup_cache(retention_days: int = 30):
    """Nettoyage du cache"""
    try:
        nettoyer_cache_ancien(retention_days)
        stats_apres = obtenir_statistiques_cache()
        
        return {
            "status": "success",
            "message": f"Cache nettoyé - emails plus anciens que {retention_days} jours supprimés",
            "stats_apres_nettoyage": stats_apres,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Erreur nettoyage: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.delete("/cache/clear")
def clear_cache():
    """Vider complètement le cache"""
    try:
        cache_file = "data/emails_cache.json"
        if os.path.exists(cache_file):
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump({}, f)
        
        return {
            "status": "success",
            "message": "Cache vidé avec succès",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Erreur vidage cache: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

# =====================================
# ENDPOINTS SYSTÈME
# =====================================

def normalize_filter_value(field, value):
    """
    🔧 Normalise les valeurs de filtre pour accepter les variantes
    Solution simple pour filtrage intelligent
    """
    if not value:
        return ""
    
    value_lower = value.lower().strip()
    
    # Mappings pour filtrage intelligent
    STATUS_MAPPING = {
        "à faire": "pending",
        "a faire": "pending", 
        "en cours": "in_progress",
        "en_cours": "in_progress",
        "terminé": "completed",
        "termine": "completed",
        "fini": "completed",
        "annulé": "cancelled",
        "annule": "cancelled"
    }
    
    PRIORITY_MAPPING = {
        "haute": "high",
        "elevé": "high", 
        "élevé": "high",
        "urgent": "high",
        "moyenne": "medium",
        "normale": "medium",
        "normal": "medium", 
        "moyen": "medium",
        "critique": "critical",
        "prioritaire": "critical",
        "basse": "low",
        "faible": "low",
        "bas": "low"
    }
    
    if field == "status":
        return STATUS_MAPPING.get(value_lower, value_lower)
    elif field == "priority":
        return PRIORITY_MAPPING.get(value_lower, value_lower)
    else:
        return value_lower

def smart_filter_match(task_value, filter_value, field_type):
    """
    🧠 Comparaison intelligente pour le filtrage
    Accepte les variantes de valeurs
    """
    if not task_value or not filter_value:
        return False
    
    # Normaliser les deux valeurs
    normalized_task = normalize_filter_value(field_type, task_value)
    normalized_filter = normalize_filter_value(field_type, filter_value)
    
    return normalized_task == normalized_filter

# =====================================
# 🎯 PHASE 2 - FONCTIONS DE FILTRAGE AVANCÉ
# =====================================

def parse_date_string(date_str):
    """
    📅 Parse une date en format YYYY-MM-DD ou ISO
    Retourne None si parsing échoue
    """
    if not date_str or date_str == "null":
        return None
    
    try:
        # Essayer format YYYY-MM-DD
        if len(date_str) == 10 and date_str.count('-') == 2:
            return datetime.strptime(date_str, "%Y-%m-%d")
        
        # Essayer format ISO complet
        if 'T' in date_str:
            # Enlever les microsecondes si présentes
            if '.' in date_str:
                date_str = date_str.split('.')[0]
            return datetime.fromisoformat(date_str.replace('Z', ''))
        
        return None
    except:
        return None

def filter_by_date_range(tasks, deadline_before=None, deadline_after=None, created_after=None, created_before=None):
    """
    📅 Filtrer les tâches par plages de dates
    """
    if not (deadline_before or deadline_after or created_after or created_before):
        return tasks
    
    filtered_tasks = []
    
    for task in tasks:
        include_task = True
        
        # Filtres deadline
        if deadline_before or deadline_after:
            task_deadline = parse_date_string(task.get('deadline'))
            
            if deadline_before:
                deadline_before_date = parse_date_string(deadline_before)
                if deadline_before_date and task_deadline:
                    if task_deadline >= deadline_before_date:
                        include_task = False
                elif deadline_before_date and not task_deadline:
                    # Si filter deadline_before mais task sans deadline, inclure
                    pass
            
            if deadline_after and include_task:
                deadline_after_date = parse_date_string(deadline_after)
                if deadline_after_date and task_deadline:
                    if task_deadline <= deadline_after_date:
                        include_task = False
                elif deadline_after_date and not task_deadline:
                    # Si filter deadline_after mais task sans deadline, exclure
                    include_task = False
        
        # Filtres created_at
        if (created_after or created_before) and include_task:
            task_created = parse_date_string(task.get('created_at'))
            
            if created_after:
                created_after_date = parse_date_string(created_after)
                if created_after_date and task_created:
                    if task_created <= created_after_date:
                        include_task = False
            
            if created_before and include_task:
                created_before_date = parse_date_string(created_before)
                if created_before_date and task_created:
                    if task_created >= created_before_date:
                        include_task = False
        
        if include_task:
            filtered_tasks.append(task)
    
    return filtered_tasks

def filter_by_source(tasks, source):
    """
    📨 Filtrer les tâches par source (email, meeting)
    """
    if not source:
        return tasks
    
    source_lower = source.lower().strip()
    return [task for task in tasks if task.get('source', '').lower() == source_lower]

def extract_department_from_task(task):
    """
    🏢 Extraire le département d'une tâche depuis les métadonnées
    """
    metadata = task.get('source_metadata', {})
    
    # Pour les emails
    if 'original_email' in metadata:
        email_data = metadata['original_email']
        dept = email_data.get('departement')
        
        if isinstance(dept, dict) and 'nom' in dept:
            return dept['nom']
        elif isinstance(dept, str):
            return dept
    
    # Pour les meetings  
    if 'meeting' in metadata or task.get('origine_meeting'):
        meeting_data = task.get('origine_meeting', {})
        dept = meeting_data.get('departement')
        if dept:
            return dept
    
    return None

def filter_by_department(tasks, department):
    """
    🏢 Filtrer les tâches par département
    """
    if not department:
        return tasks
    
    department_lower = department.lower().strip()
    filtered_tasks = []
    
    for task in tasks:
        task_dept = extract_department_from_task(task)
        if task_dept and department_lower in task_dept.lower():
            filtered_tasks.append(task)
    
    return filtered_tasks

# =====================================
# 🔍 PHASE 3 - FONCTIONS DE RECHERCHE TEXTUELLE
# =====================================

import re
import unicodedata

def normalize_text_for_search(text):
    """
    🔤 Normalise le texte pour la recherche (accents, casse, etc.)
    """
    if not text:
        return ""
    
    # Convertir en minuscules
    text = text.lower()
    
    # Supprimer les accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
    
    # Nettoyer les caractères spéciaux (garder espaces, lettres, chiffres)
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Normaliser les espaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def search_in_text(text, query):
    """
    🔍 Recherche simple dans un texte
    Retourne True si le query est trouvé
    """
    if not text or not query:
        return False
    
    normalized_text = normalize_text_for_search(text)
    normalized_query = normalize_text_for_search(query)
    
    return normalized_query in normalized_text

def search_in_task_fields(task, query, search_fields=['description']):
    """
    🔍 Recherche dans les champs spécifiés d'une tâche
    
    search_fields options:
    - ['description'] : recherche uniquement dans description
    - ['responsable'] : recherche uniquement dans responsable  
    - ['description', 'responsable'] : recherche dans les deux
    - ['all'] : recherche dans tous les champs textuels
    """
    if not query:
        return False
    
    # Définir tous les champs de recherche possibles
    all_searchable_fields = {
        'description': task.get('description', ''),
        'responsable': task.get('responsable', ''),
        'statut': task.get('statut', ''),
        'priorite': task.get('priorite', ''),
        'type': task.get('type', ''),
        'deadline': str(task.get('deadline', ''))
    }
    
    # Ajouter métadonnées emails si disponibles
    metadata = task.get('source_metadata', {})
    if 'original_email' in metadata:
        email_data = metadata['original_email']
        if isinstance(email_data, dict):
            all_searchable_fields.update({
                'email_objet': email_data.get('objet', ''),
                'email_expediteur': email_data.get('expediteur', ''),
                'email_destinataire': email_data.get('destinataire', ''),
                'email_resume': email_data.get('resume_contenu', '')
            })
    
    # Déterminer les champs à rechercher
    if 'all' in search_fields:
        fields_to_search = all_searchable_fields
    else:
        fields_to_search = {k: v for k, v in all_searchable_fields.items() if k in search_fields}
    
    # Rechercher dans chaque champ
    for field_name, field_value in fields_to_search.items():
        if search_in_text(field_value, query):
            return True
    
    return False

def filter_by_search(tasks, search_query, search_in=['description']):
    """
    🔍 Filtrer les tâches par recherche textuelle
    
    Args:
        tasks: Liste des tâches
        search_query: Terme de recherche
        search_in: Liste des champs où chercher
    
    Returns:
        Liste des tâches correspondantes
    """
    if not search_query:
        return tasks
    
    filtered_tasks = []
    for task in tasks:
        if search_in_task_fields(task, search_query, search_in):
            filtered_tasks.append(task)
    
    return filtered_tasks

def get_search_highlights(task, query, max_length=100):
    """
    🔍 Obtenir des extraits avec mise en évidence des termes recherchés
    """
    if not query:
        return ""
    
    description = task.get('description', '')
    if not description:
        return ""
    
    normalized_desc = normalize_text_for_search(description)
    normalized_query = normalize_text_for_search(query)
    
    # Trouver la position du terme
    pos = normalized_desc.find(normalized_query)
    if pos == -1:
        return description[:max_length] + "..." if len(description) > max_length else description
    
    # Créer un extrait autour du terme trouvé
    start = max(0, pos - 30)
    end = min(len(description), pos + len(query) + 30)
    
    excerpt = description[start:end]
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(description):
        excerpt = excerpt + "..."
    
    return excerpt

# ==============================================================================
# 📄 PHASE 4: PAGINATION ET TRI AVANCÉ
# ==============================================================================

import math

def sort_tasks(tasks, sort_by=None, order="asc"):
    """
    📈 Trier les tâches par champ spécifié
    
    Args:
        tasks: Liste des tâches
        sort_by: Champ de tri (priority, deadline, created_at, status, responsable, description)
        order: Ordre (asc ou desc)
    
    Returns:
        Liste des tâches triées
    """
    if not sort_by or not tasks:
        return tasks
    
    reverse = (order.lower() == "desc")
    
    try:
        # Tri par priorité avec ordre logique
        if sort_by == "priority":
            priority_order = {"high": 3, "medium": 2, "low": 1, "": 0}
            return sorted(tasks, 
                         key=lambda x: priority_order.get(x.get("priorite", "").lower(), 0),
                         reverse=reverse)
        
        # Tri par statut avec ordre logique  
        elif sort_by == "status":
            status_order = {"pending": 4, "in_progress": 3, "completed": 2, "cancelled": 1, "": 0}
            return sorted(tasks,
                         key=lambda x: status_order.get(x.get("statut", "").lower(), 0),
                         reverse=reverse)
        
        # Tri par date (deadline, created_at)
        elif sort_by in ["deadline", "created_at"]:
            field_name = "echeance" if sort_by == "deadline" else "date_creation"
            return sorted(tasks,
                         key=lambda x: x.get(field_name, "") or "9999-12-31",
                         reverse=reverse)
        
        # Tri alphabétique (responsable, description)
        elif sort_by in ["responsable", "description"]:
            return sorted(tasks,
                         key=lambda x: str(x.get(sort_by, "")).lower(),
                         reverse=reverse)
        
        # Tri par source
        elif sort_by == "source":
            return sorted(tasks,
                         key=lambda x: x.get("source", ""),
                         reverse=reverse)
        
        # Champ non supporté
        else:
            return tasks
            
    except Exception as e:
        print(f"Erreur tri: {e}")
        return tasks

def sort_by_relevance(tasks, search_term):
    """
    🎯 Trier les tâches par pertinence de recherche
    
    Args:
        tasks: Liste des tâches
        search_term: Terme de recherche pour calculer la pertinence
    
    Returns:
        Liste des tâches triées par pertinence (plus pertinentes d'abord)
    """
    if not search_term or not tasks:
        return tasks
    
    def calculate_relevance_score(task):
        """Calculer le score de pertinence d'une tâche"""
        score = 0
        search_normalized = normalize_text_for_search(search_term)
        
        # Score description (poids 5 - plus important)
        description = normalize_text_for_search(task.get("description", ""))
        if search_normalized in description:
            score += 5
            # Bonus si le terme est au début
            if description.startswith(search_normalized):
                score += 2
        
        # Score responsable (poids 3)
        responsable = normalize_text_for_search(task.get("responsable", ""))
        if search_normalized in responsable:
            score += 3
        
        # Score autres champs (poids 1 chacun)
        for field in ["source", "department", "priorite", "statut"]:
            field_value = normalize_text_for_search(str(task.get(field, "")))
            if search_normalized in field_value:
                score += 1
        
        # Score métadonnées email (poids 2)
        metadata = task.get('source_metadata', {})
        if 'original_email' in metadata:
            email_data = metadata['original_email']
            if isinstance(email_data, dict):
                for email_field in ['objet', 'expediteur', 'resume_contenu']:
                    email_value = normalize_text_for_search(str(email_data.get(email_field, "")))
                    if search_normalized in email_value:
                        score += 2
        
        return score
    
    try:
        return sorted(tasks, key=calculate_relevance_score, reverse=True)
    except Exception as e:
        print(f"Erreur tri pertinence: {e}")
        return tasks

def paginate_tasks(tasks, page=1, limit=20):
    """
    📄 Paginer la liste des tâches
    
    Args:
        tasks: Liste des tâches
        page: Numéro de page (commence à 1)
        limit: Nombre d'éléments par page
    
    Returns:
        Dict avec tâches paginées et métadonnées pagination
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    if limit > 100:  # Limite de sécurité
        limit = 100
    
    total_tasks = len(tasks)
    total_pages = math.ceil(total_tasks / limit) if total_tasks > 0 else 1
    
    # Calculer les indices de début et fin
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    # Extraire les tâches de la page courante
    paginated_tasks = tasks[start_index:end_index]
    
    # Métadonnées de pagination
    pagination_info = {
        "total_tasks": total_tasks,
        "total_pages": total_pages,
        "current_page": page,
        "page_size": limit,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
        "start_index": start_index + 1 if total_tasks > 0 else 0,
        "end_index": min(end_index, total_tasks) if total_tasks > 0 else 0
    }
    
    return {
        "tasks": paginated_tasks,
        "pagination": pagination_info
    }

def get_available_sort_fields():
    """
    📋 Obtenir la liste des champs disponibles pour le tri
    
    Returns:
        Liste des champs de tri supportés
    """
    return [
        "priority",      # Tri par priorité (high, medium, low)
        "status",        # Tri par statut (pending, in_progress, completed, cancelled)
        "deadline",      # Tri par échéance
        "created_at",    # Tri par date de création
        "responsable",   # Tri alphabétique par responsable
        "description",   # Tri alphabétique par description
        "source",        # Tri par source (email, meeting, log)
        "relevance"      # Tri par pertinence (seulement avec search)
    ]

@app.get("/all-tasks")
def get_all_tasks(
    format: str = "unified",
    # Phase 1 - Filtres simples (existants)
    status: str = None,
    priority: str = None,
    assignee: str = None,
    validated: bool = None,         # 🆕 NOUVEAU: Filtrer par validation humaine
    # Phase 2 - Filtres avancés (nouveaux)
    deadline_before: str = None,    # Format: YYYY-MM-DD
    deadline_after: str = None,     # Format: YYYY-MM-DD  
    created_after: str = None,      # Format: YYYY-MM-DD
    created_before: str = None,     # Format: YYYY-MM-DD
    source: str = None,             # email ou meeting
    department: str = None,         # Nom du département
    # Phase 3 - Recherche textuelle (nouveaux)
    search: str = None,             # Terme de recherche
    search_in: str = "description", # Champs de recherche: description, responsable, all
    # Phase 4 - Pagination et tri (nouveaux)
    page: int = 1,                  # Numéro de page (commence à 1)
    limit: int = 20,                # Nombre d'éléments par page (max 100)
    sort_by: str = None,            # Champ de tri (priority, deadline, status, relevance, etc.)
    order: str = "asc",             # Ordre de tri (asc ou desc)
    # Phase 7 - Filtres par tags (nouveaux) 🏷️
    tag: str = None,                # Filtrer par un tag spécifique
    tags: List[str] = Query([])     # Filtrer par plusieurs tags (ET logique)
):
    """
    🎯 PHASE 1-7: Récupérer toutes les tâches avec filtres, recherche, pagination, tri et tags
    
    Parameters:
    Format & Filtres Phase 1:
    - format: "unified" (défaut) ou "legacy" pour compatibilité
    - status: Filtrer par statut (pending, completed, in_progress, cancelled)
    - priority: Filtrer par priorité (high, medium, low)
    - assignee: Filtrer par responsable (nom ou email)
    - validated: Filtrer par validation humaine (true/false) 🆕
    
    Filtres Phase 2 (avancés):
    - deadline_before: Tâches avec deadline avant cette date (YYYY-MM-DD)
    - deadline_after: Tâches avec deadline après cette date (YYYY-MM-DD)
    - created_after: Tâches créées après cette date (YYYY-MM-DD) 
    - created_before: Tâches créées avant cette date (YYYY-MM-DD)
    - source: Filtrer par source (email, meeting)
    - department: Filtrer par département (Finance, IT, RH, etc.)
    
    Recherche Phase 3 (textuelle):
    - search: Terme de recherche dans les textes
    - search_in: Champs de recherche (description, responsable, all)
    
    Pagination & Tri Phase 4:
    - page: Numéro de page (défaut: 1)
    - limit: Tâches par page (défaut: 20, max: 100)
    - sort_by: Champ de tri (priority, deadline, status, responsable, description, source, relevance)
    - order: Ordre de tri (asc ou desc, défaut: asc)
    
    Filtres Tags Phase 7 (nouveaux) 🏷️:
    - tag: Filtrer par un tag spécifique (ex: "urgent")
    - tags: Filtrer par plusieurs tags avec ET logique (ex: ["urgent", "bug"])
    """
    try:
        # 🚀 SYSTÈME UNIFIÉ: Format moderne par défaut
        if UNIFIED_SYSTEM_AVAILABLE and os.path.exists(UNIFIED_TASKS_FILE):
            unified_manager = get_unified_task_manager()
            
            if format == "legacy":
                # Mode compatibilité : format legacy (emails seulement)
                legacy_email_tasks = unified_manager.get_legacy_format_email_tasks()
                
                # 🧠 FILTRAGE INTELLIGENT PHASE 1: Appliquer filtres sur legacy aussi
                filtered_legacy_tasks = legacy_email_tasks
                total_before_filter = len(legacy_email_tasks)
                
                if status:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if smart_filter_match(t.get('statut', ''), status, 'status')]
                if priority:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if smart_filter_match(t.get('priorite', ''), priority, 'priority')]
                if assignee:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if assignee.lower() in t.get('responsable', '').lower()]
                if validated is not None:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if t.get('validated', False) == validated]
                
                # 🏷️ FILTRAGE PAR TAGS PHASE 7: Support legacy
                if tag:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if tag in t.get('tags', [])]
                if tags:
                    filtered_legacy_tasks = [t for t in filtered_legacy_tasks if all(tag_filter in t.get('tags', []) for tag_filter in tags)]
                
                # 🚀 FILTRAGE AVANCÉ PHASE 2: Même pour legacy compatibility
                filtered_legacy_tasks = filter_by_date_range(
                    filtered_legacy_tasks, 
                    deadline_before=deadline_before,
                    deadline_after=deadline_after,
                    created_after=created_after,
                    created_before=created_before
                )
                
                if source:
                    filtered_legacy_tasks = filter_by_source(filtered_legacy_tasks, source)
                
                if department:
                    filtered_legacy_tasks = filter_by_department(filtered_legacy_tasks, department)
                
                # 🔍 FILTRAGE RECHERCHE PHASE 3: Appliquer recherche textuelle pour legacy
                if search:
                    # Parser les champs de recherche
                    search_fields = []
                    if search_in == "all":
                        search_fields = ["all"]
                    elif search_in == "responsable":
                        search_fields = ["responsable"]
                    else:  # défaut: description
                        search_fields = ["description"]
                    
                    filtered_legacy_tasks = filter_by_search(filtered_legacy_tasks, search, search_fields)
                
                # 📄 PHASE 4: TRI ET PAGINATION pour legacy
                # Appliquer le tri
                if sort_by == "relevance" and search:
                    # Tri par pertinence de recherche
                    filtered_legacy_tasks = sort_by_relevance(filtered_legacy_tasks, search)
                elif sort_by:
                    # Tri standard
                    filtered_legacy_tasks = sort_tasks(filtered_legacy_tasks, sort_by, order)
                
                # Appliquer la pagination
                pagination_result = paginate_tasks(filtered_legacy_tasks, page, limit)
                paginated_tasks = pagination_result["tasks"]
                pagination_info = pagination_result["pagination"]
                
                return {
                    "tasks": paginated_tasks,
                    "total": len(filtered_legacy_tasks),  # Total après filtres
                    "total_before_filter": total_before_filter,
                    "pagination": pagination_info,
                    "sorting": {
                        "sort_by": sort_by,
                        "order": order,
                        "available_sorts": get_available_sort_fields()
                    },
                    "filters_applied": {
                        # Phase 1
                        "status": status,
                        "priority": priority,
                        "assignee": assignee,
                        # Phase 2
                        "deadline_before": deadline_before,
                        "deadline_after": deadline_after,
                        "created_after": created_after,
                        "created_before": created_before,
                        "source": source,
                        "department": department,
                        # Phase 3
                        "search": search,
                        "search_in": search_in,
                        # Phase 4
                        "page": page,
                        "limit": limit,
                        "sort_by": sort_by,
                        "order": order
                    },
                    "format": "legacy",
                    "system": "unified"
                }
            else:
                # Mode par défaut : format unifié (emails + meetings) avec filtres intelligents
                unified_tasks = unified_manager.load_all_tasks()
                total_before_filter = len(unified_tasks)
                
                # 🧠 FILTRAGE INTELLIGENT PHASE 1: Appliquer filtres simples avec support variantes
                filtered_tasks = unified_tasks
                
                if status:
                    filtered_tasks = [t for t in filtered_tasks if smart_filter_match(t.get('statut', ''), status, 'status')]
                if priority:
                    filtered_tasks = [t for t in filtered_tasks if smart_filter_match(t.get('priorite', ''), priority, 'priority')]
                if assignee:
                    filtered_tasks = [t for t in filtered_tasks if assignee.lower() in t.get('responsable', '').lower()]
                if validated is not None:
                    filtered_tasks = [t for t in filtered_tasks if t.get('validated', False) == validated]
                
                # 🏷️ FILTRAGE PAR TAGS PHASE 7: Mode unifié
                if tag:
                    filtered_tasks = [t for t in filtered_tasks if tag in t.get('tags', [])]
                if tags:
                    filtered_tasks = [t for t in filtered_tasks if all(tag_filter in t.get('tags', []) for tag_filter in tags)]
                
                # 🚀 FILTRAGE AVANCÉ PHASE 2: Appliquer nouveaux filtres
                filtered_tasks = filter_by_date_range(
                    filtered_tasks, 
                    deadline_before=deadline_before,
                    deadline_after=deadline_after,
                    created_after=created_after,
                    created_before=created_before
                )
                
                if source:
                    filtered_tasks = filter_by_source(filtered_tasks, source)
                
                if department:
                    filtered_tasks = filter_by_department(filtered_tasks, department)
                
                # 🔍 FILTRAGE RECHERCHE PHASE 3: Appliquer recherche textuelle
                if search:
                    # Parser les champs de recherche
                    search_fields = []
                    if search_in == "all":
                        search_fields = ["all"]
                    elif search_in == "responsable":
                        search_fields = ["responsable"]
                    else:  # défaut: description
                        search_fields = ["description"]
                    
                    filtered_tasks = filter_by_search(filtered_tasks, search, search_fields)
                
                # 📄 PHASE 4: TRI ET PAGINATION pour mode unifié
                # Appliquer le tri
                if sort_by == "relevance" and search:
                    # Tri par pertinence de recherche
                    filtered_tasks = sort_by_relevance(filtered_tasks, search)
                elif sort_by:
                    # Tri standard
                    filtered_tasks = sort_tasks(filtered_tasks, sort_by, order)
                
                # Statistiques par source sur les tâches filtrées (avant pagination)
                sources = {}
                for task in filtered_tasks:
                    source = task.get('source', 'unknown')
                    sources[source] = sources.get(source, 0) + 1
                
                # Statistiques de filtrage (avant pagination)
                filters_stats = {
                    "total_before_filter": total_before_filter,
                    "total_after_filter": len(filtered_tasks),
                    "filtered_out": total_before_filter - len(filtered_tasks)
                }
                
                # Appliquer la pagination
                pagination_result = paginate_tasks(filtered_tasks, page, limit)
                paginated_tasks = pagination_result["tasks"]
                pagination_info = pagination_result["pagination"]
                
                return {
                    "tasks": paginated_tasks,  # Tâches de la page courante
                    "total": len(filtered_tasks),  # Total après filtres mais avant pagination
                    "pagination": pagination_info,
                    "sorting": {
                        "sort_by": sort_by,
                        "order": order,
                        "available_sorts": get_available_sort_fields()
                    },
                    "statistics": {
                        "total_tasks": len(filtered_tasks),
                        "email_tasks": sources.get('email', 0),
                        "meeting_tasks": sources.get('meeting', 0),
                        "log_tasks": sources.get('log', 0)
                    },
                    "filters_applied": {
                        # Phase 1
                        "status": status,
                        "priority": priority,
                        "assignee": assignee,
                        # Phase 2
                        "deadline_before": deadline_before,
                        "deadline_after": deadline_after,
                        "created_after": created_after,
                        "created_before": created_before,
                        "source": source,
                        "department": department,
                        # Phase 3
                        "search": search,
                        "search_in": search_in,
                        # Phase 4
                        "page": page,
                        "limit": limit,
                        "sort_by": sort_by,
                        "order": order
                    },
                    "filter_statistics": filters_stats,
                    "format": "unified",
                    "system": "unified"
                }
        
        # LEGACY: Utiliser l'ancien système si unifié non disponible
        else:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                tasks = json.load(f)
            
            # 🧠 FILTRAGE INTELLIGENT PHASE 1: Appliquer filtres sur système legacy aussi
            filtered_legacy_tasks = tasks
            total_before_filter = len(tasks)
            
            if status:
                filtered_legacy_tasks = [t for t in filtered_legacy_tasks if smart_filter_match(t.get('statut', ''), status, 'status')]
            if priority:
                filtered_legacy_tasks = [t for t in filtered_legacy_tasks if smart_filter_match(t.get('priorite', ''), priority, 'priority')]
            if assignee:
                filtered_legacy_tasks = [t for t in filtered_legacy_tasks if assignee.lower() in t.get('responsable', '').lower()]
            
            # 🚀 FILTRAGE AVANCÉ PHASE 2: Appliquer aussi sur legacy
            filtered_legacy_tasks = filter_by_date_range(
                filtered_legacy_tasks, 
                deadline_before=deadline_before,
                deadline_after=deadline_after,
                created_after=created_after,
                created_before=created_before
            )
            
            if source:
                filtered_legacy_tasks = filter_by_source(filtered_legacy_tasks, source)
            
            if department:
                filtered_legacy_tasks = filter_by_department(filtered_legacy_tasks, department)
            
            # 🔍 FILTRAGE RECHERCHE PHASE 3: Appliquer recherche textuelle pour system legacy
            if search:
                # Parser les champs de recherche
                search_fields = []
                if search_in == "all":
                    search_fields = ["all"]
                elif search_in == "responsable":
                    search_fields = ["responsable"]
                else:  # défaut: description
                    search_fields = ["description"]
                
                filtered_legacy_tasks = filter_by_search(filtered_legacy_tasks, search, search_fields)
            
            # 📄 PHASE 4: TRI ET PAGINATION pour système legacy complet
            # Appliquer le tri
            if sort_by == "relevance" and search:
                # Tri par pertinence de recherche
                filtered_legacy_tasks = sort_by_relevance(filtered_legacy_tasks, search)
            elif sort_by:
                # Tri standard
                filtered_legacy_tasks = sort_tasks(filtered_legacy_tasks, sort_by, order)
            
            # Appliquer la pagination
            pagination_result = paginate_tasks(filtered_legacy_tasks, page, limit)
            paginated_tasks = pagination_result["tasks"]
            pagination_info = pagination_result["pagination"]
            
            return {
                "tasks": paginated_tasks,  # Tâches de la page courante
                "total": len(filtered_legacy_tasks),  # Total après filtres mais avant pagination
                "total_before_filter": total_before_filter,
                "pagination": pagination_info,
                "sorting": {
                    "sort_by": sort_by,
                    "order": order,
                    "available_sorts": get_available_sort_fields()
                },
                "filters_applied": {
                    # Phase 1
                    "status": status,
                    "priority": priority,
                    "assignee": assignee,
                    # Phase 2
                    "deadline_before": deadline_before,
                    "deadline_after": deadline_after,
                    "created_after": created_after,
                    "created_before": created_before,
                    "source": source,
                    "department": department,
                    # Phase 3
                    "search": search,
                    "search_in": search_in,
                    # Phase 4
                    "page": page,
                    "limit": limit,
                    "sort_by": sort_by,
                    "order": order
                },
                "format": "legacy",
                "system": "legacy"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture tâches: {str(e)}")

@app.post("/watcher/start")
def start_watcher():
    """Démarrer la surveillance"""
    try:
        service = get_background_service()
        if service.start_service():
            return {
                "status": "success",
                "message": "Service de surveillance démarré",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Impossible de démarrer la surveillance")
    except Exception as e:
        return {
            "status": "error",
            "message": f"Service non disponible: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/watcher/stop")
def stop_watcher():
    """Arrêter la surveillance"""
    try:
        service = get_background_service()
        if service.stop_service():
            return {
                "status": "success",
                "message": "Service de surveillance arrêté", 
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Impossible d'arrêter la surveillance")
    except Exception as e:
        return {
            "status": "error",
            "message": f"Service non disponible: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/watcher/status")
def get_watcher_status():
    """État de la surveillance"""
    try:
        service = get_background_service()
        return service.get_service_status()
    except Exception as e:
        return {
            "status": "error",
            "message": f"Service non disponible: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

# =====================================
# 🎯 NOUVEAUX ENDPOINTS MEETINGS
# =====================================

@app.get("/traiter-meetings")
def api_traiter_meetings_unifie(
    use_rate_limiting: bool = False,
    use_batch_processing: bool = True,
    use_cache: bool = True,
    use_optimized_prompts: bool = True
    ):
    """🎯 ENDPOINT UNIFIÉ: Traitement réunions avec toutes les améliorations"""
    try:
        resultat = pipeline_traiter_reunions(
            use_rate_limiting=use_rate_limiting,
            use_batch_processing=use_batch_processing,
            use_cache=use_cache,
            use_optimized_prompts=use_optimized_prompts
        )
        
        optimisations_actives = []
        if use_cache:
            optimisations_actives.append("Cache anti-doublon")
        if use_batch_processing:
            optimisations_actives.append("Batch processing intelligent")
        if use_rate_limiting:
            optimisations_actives.append("Rate limiting + Queue")
        if use_optimized_prompts:
            optimisations_actives.append("Prompts IA optimisés")
        
        return {
            "status": "success",
            "mode": "production_optimized_processing",
            "optimisations_actives": optimisations_actives,
            "details": resultat,
            "message": f"Réunions traitées avec {len(optimisations_actives)} optimisations actives"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur traitement unifié réunions: {str(e)}")

@app.post("/meetings/process")
async def process_meeting_manual(meeting: MeetingInput):
    """Traite une réunion spécifique manuellement"""
    try:
        processor = get_meeting_processor()
        
        # Convertir en format dict
        meeting_dict = {
            "id": f"meeting_manual_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "titre": meeting.titre,
            "date_reunion": meeting.date_reunion,
            "heure_debut": meeting.heure_debut,
            "heure_fin": meeting.heure_fin,
            "duree_minutes": meeting.duree_minutes,
            "lieu": meeting.lieu,
            "organisateur": meeting.organisateur.dict(),
            "participants": [p.dict() for p in meeting.participants],
            "ordre_du_jour": meeting.ordre_du_jour,
            "transcription": meeting.transcription,
            "departement": meeting.departement,
            "projet_associe": meeting.projet_associe,
            "priorite_meeting": meeting.priorite_meeting,
            "type_reunion": meeting.type_reunion,
            "statut_traitement": "non_traité",
            "date_ajout": datetime.now().isoformat(),
            "tags": meeting.tags,
            "fichiers_associes": [f.dict() for f in meeting.fichiers_associes],
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
            "message": f"Réunion '{meeting.titre}' traitée avec succès"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur traitement réunion: {str(e)}")

@app.post("/meetings/transcription-simple")
async def process_transcription_simple(data: TranscriptionSimple):
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
        raise HTTPException(status_code=500, detail=f"Erreur traitement transcription: {str(e)}")

@app.get("/tasks/stats")
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
        raise HTTPException(status_code=500, detail=f"Erreur récupération statistiques: {str(e)}")

@app.get("/meetings")
async def list_meetings(
    departement: str = None,
    type_reunion: str = None,
    statut: str = None
):
    """Liste les réunions avec filtres optionnels"""
    try:
        processor = get_meeting_processor()
        meetings = processor.load_meetings()
        
        # Appliquer filtres
        if departement:
            meetings = [m for m in meetings if m.get("departement", "").lower() == departement.lower()]
        if type_reunion:
            meetings = [m for m in meetings if m.get("type_reunion", "").lower() == type_reunion.lower()]
        if statut:
            meetings = [m for m in meetings if m.get("statut_traitement", "").lower() == statut.lower()]
        
        return {
            "meetings": meetings,
            "total": len(meetings),
            "filters_applied": {
                "departement": departement,
                "type_reunion": type_reunion,
                "statut": statut
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération réunions: {str(e)}")

@app.get("/meetings/{meeting_id}")
async def get_meeting_details(meeting_id: str):
    """Détails complets d'une réunion"""
    try:
        processor = get_meeting_processor()
        meeting = processor.get_meeting_by_id(meeting_id)
        
        if not meeting:
            raise HTTPException(status_code=404, detail=f"Réunion {meeting_id} non trouvée")
        
        return {
            "meeting": meeting,
            "status": "found"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération réunion: {str(e)}")

@app.get("/meetings/{meeting_id}/tasks")
async def get_meeting_tasks(meeting_id: str):
    """Tâches extraites d'une réunion spécifique"""
    try:
        processor = get_meeting_processor()
        tasks = processor.get_tasks_by_meeting(meeting_id)
        
        return {
            "meeting_id": meeting_id,
            "tasks": tasks,
            "total_tasks": len(tasks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération tâches réunion: {str(e)}")

@app.get("/meetings/stats/global")
async def get_meetings_statistics():
    """Statistiques globales des réunions"""
    try:
        processor = get_meeting_processor()
        meetings = processor.load_meetings()
        meeting_tasks = processor.load_meeting_tasks()
        
        stats = {
            "total_meetings": len(meetings),
            "meetings_processed": len([m for m in meetings if m.get("statut_traitement") == "traité"]),
            "meetings_pending": len([m for m in meetings if m.get("statut_traitement") == "non_traité"]),
            "total_tasks_extracted": len(meeting_tasks),
            "departments": {},
            "meeting_types": {},
            "average_tasks_per_meeting": 0
        }
        
        # Statistiques par département
        for meeting in meetings:
            dept = meeting.get("departement", "Non spécifié")
            stats["departments"][dept] = stats["departments"].get(dept, 0) + 1
        
        # Statistiques par type de réunion
        for meeting in meetings:
            meeting_type = meeting.get("type_reunion", "Non spécifié")
            stats["meeting_types"][meeting_type] = stats["meeting_types"].get(meeting_type, 0) + 1
        
        # Moyenne tâches par réunion
        if stats["meetings_processed"] > 0:
            stats["average_tasks_per_meeting"] = round(stats["total_tasks_extracted"] / stats["meetings_processed"], 2)
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur statistiques réunions: {str(e)}")

# =====================================
# �️ NOUVEAUX ENDPOINTS - PHASE 7
# SYSTÈME DE TAGS COMPLET
# =====================================

@app.post("/tasks/create")
async def create_task_with_tags(task_data: TaskCreate):
    """
    ✨ Créer une nouvelle tâche avec support complet des tags
    
    Fonctionnalités :
    - Validation complète des données
    - Support des tags avec normalisation automatique
    - Génération d'ID unique
    - Horodatage automatique
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Génération ID unique
        task_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Préparer la tâche pour le gestionnaire unifié
        task_data_for_manager = {
            "description": task_data.title + " - " + task_data.description,
            "responsable": "user",
            "deadline": task_data.deadline,
            "priorite": task_data.priority,
            "statut": "pending",
            "source": "manual_api",
            "type": "explicite",
            "tags": getattr(task_data, 'tags', []),
            "source_metadata": {
                "title": task_data.title,
                "description": task_data.description,
                "department": task_data.department,
                "created_via": "api_endpoint"
            }
        }
        
        # Sauvegarder via le gestionnaire unifié
        unified_manager = get_unified_task_manager()
        task_id = unified_manager.add_task(task_data_for_manager)
        
        # Récupérer la tâche créée pour la retourner
        created_task = unified_manager.get_task_by_id(task_id)
        
        return {
            "message": "Tâche créée avec succès",
            "task_id": task_id,
            "tags_count": len(getattr(task_data, 'tags', [])),
            "created_at": created_task.get('created_at'),
            "task": created_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création tâche: {str(e)}")

@app.get("/tasks/tags")
async def get_all_tags():
    """
    🏷️ Récupérer tous les tags utilisés dans le système
    
    Retourne :
    - Liste de tous les tags uniques
    - Nombre d'utilisation de chaque tag
    - Tags triés par popularité
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer toutes les tâches
        unified_manager = get_unified_task_manager()
        all_tasks = unified_manager.load_all_tasks()
        
        # Compter les tags
        tag_counts = {}
        for task in all_tasks:
            task_tags = task.get('tags', [])
            for tag in task_tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Trier par popularité
        sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "message": "Tags récupérés avec succès",
            "total_unique_tags": len(tag_counts),
            "total_tasks_with_tags": len([t for t in all_tasks if t.get('tags')]),
            "tags": {
                "by_popularity": sorted_tags,
                "alphabetical": sorted(tag_counts.keys()),
                "counts": tag_counts
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération tags: {str(e)}")

@app.get("/tasks/tags/{tag_name}/tasks")
async def get_tasks_by_tag(tag_name: str, limit: int = 20, page: int = 1):
    """
    🔍 Récupérer toutes les tâches avec un tag spécifique
    
    Paramètres :
    - tag_name: Nom du tag à rechercher
    - limit: Nombre de tâches par page (défaut: 20)
    - page: Numéro de page (défaut: 1)
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Normaliser le tag recherché
        normalized_tag = tag_name.strip().lower().replace(' ', '-').replace('_', '-')
        
        # Récupérer toutes les tâches avec ce tag
        unified_manager = get_unified_task_manager()
        all_tasks = unified_manager.load_all_tasks()
        
        # Filtrer par tag
        tagged_tasks = [task for task in all_tasks if normalized_tag in task.get('tags', [])]
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        page_tasks = tagged_tasks[start_idx:end_idx]
        
        total_pages = (len(tagged_tasks) + limit - 1) // limit
        
        pagination_result = {
            "tasks": page_tasks,
            "pagination": {
                "current_page": page,
                "per_page": limit,
                "total_pages": total_pages,
                "total_items": len(tagged_tasks),
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
        return {
            "message": f"Tâches avec tag '{tag_name}' récupérées",
            "tag": normalized_tag,
            "total_tasks": len(tagged_tasks),
            "tasks": pagination_result["tasks"],
            "pagination": pagination_result["pagination"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération tâches par tag: {str(e)}")

@app.get("/tasks/tags/popular")
async def get_popular_tags(limit: int = 10):
    """
    📊 Récupérer les tags les plus populaires
    
    - Triés par nombre d'utilisation décroissant
    - Limite configurable (défaut: 10)
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer tous les tags
        response = await get_all_tags()
        all_tags_data = response["tags"]["by_popularity"]
        
        # Limiter aux plus populaires
        popular_tags = all_tags_data[:limit]
        
        return {
            "message": f"Top {limit} tags populaires",
            "popular_tags": popular_tags,
            "total_tags_available": len(all_tags_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur tags populaires: {str(e)}")

@app.get("/tasks/tags/suggestions")
async def get_tag_suggestions(description: str = None, task_id: str = None):
    """
    🤖 Obtenir des suggestions de tags intelligentes
    
    Basé sur :
    - Description de la tâche (si fournie)
    - Tags existants dans le système
    - Mots-clés fréquents
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer tags existants pour suggestions
        response = await get_all_tags()
        existing_tags = list(response["tags"]["counts"].keys())
        
        suggestions = []
        
        # Si description fournie, analyser pour suggérer
        if description:
            description_lower = description.lower()
            
            # Mots-clés → tags suggérés
            keyword_mapping = {
                "urgent": ["urgent", "prioritaire", "asap"],
                "bug": ["bug", "erreur", "problème"],
                "feature": ["feature", "fonctionnalité", "nouveau"],
                "réunion": ["réunion", "meeting", "rendez-vous"],
                "rapport": ["rapport", "document", "analysis"],
                "client": ["client", "customer", "externe"],
                "interne": ["interne", "équipe", "team"],
                "sécurité": ["sécurité", "security", "protection"],
                "performance": ["performance", "optimisation", "vitesse"],
                "test": ["test", "testing", "qa"]
            }
            
            for keyword, tags in keyword_mapping.items():
                if any(word in description_lower for word in tags):
                    suggestions.extend(tags)
            
            # Ajouter suggestions basées sur tags existants similaires
            for existing_tag in existing_tags:
                if any(word in existing_tag for word in description_lower.split()):
                    suggestions.append(existing_tag)
        
        # Si task_id fourni, analyser la tâche
        if task_id:
            unified_manager = get_unified_task_manager()
            task = unified_manager.get_task_by_id(task_id)
            if task:
                task_desc = task.get('description', '')
                # Récursif pour analyser description de la tâche
                desc_suggestions = await get_tag_suggestions(description=task_desc)
                suggestions.extend(desc_suggestions.get('suggested_tags', []))
        
        # Éliminer doublons et limiter
        unique_suggestions = list(set(suggestions))[:10]
        
        # Ajouter quelques tags populaires
        popular_response = await get_popular_tags(limit=5)
        popular_tags = [tag[0] for tag in popular_response["popular_tags"]]
        
        return {
            "message": "Suggestions de tags générées",
            "suggested_tags": unique_suggestions,
            "popular_tags": popular_tags,
            "all_existing_tags": existing_tags[:20]  # Premiers 20 pour référence
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur suggestions tags: {str(e)}")

@app.post("/tasks/{task_id}/tags")
async def add_tags_to_task(task_id: str, tag_data: TaskTags):
    """
    🏷️ Ajouter des tags à une tâche
    
    - Validation automatique des tags (format, longueur)
    - Normalisation automatique (lowercase, tirets)
    - Évite les doublons
    - Limite à 7 tags maximum par tâche
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Tags actuels
        current_tags = existing_task.get('tags', [])
        new_tags = tag_data.tags
        
        # Combiner et éliminer doublons
        combined_tags = list(set(current_tags + new_tags))
        
        # Vérifier limite maximum
        if len(combined_tags) > 7:
            raise HTTPException(
                status_code=400, 
                detail=f"Limite de 7 tags dépassée. Actuel: {len(current_tags)}, à ajouter: {len(new_tags)}, total: {len(combined_tags)}"
            )
        
        # Préparer mise à jour
        updates = {
            "tags": combined_tags,
            "updated_at": datetime.now().isoformat()
        }
        
        # Historique
        added_tags = [tag for tag in new_tags if tag not in current_tags]
        history_entry = {
            "action": "tags_added",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Tags ajoutés: {', '.join(added_tags)}" if added_tags else "Aucun nouveau tag"
        }
        
        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        return {
            "message": "Tags ajoutés avec succès",
            "task_id": task_id,
            "tags_added": added_tags,
            "tags_already_present": [tag for tag in new_tags if tag in current_tags],
            "total_tags": len(combined_tags),
            "all_tags": combined_tags,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur ajout tags: {str(e)}")

@app.delete("/tasks/{task_id}/tags/{tag_name}")
async def remove_tag_from_task(task_id: str, tag_name: str):
    """
    🗑️ Retirer un tag spécifique d'une tâche
    
    - Supprime uniquement le tag spécifié
    - Garde les autres tags intacts
    - Erreur si tag non présent
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Normaliser le tag
        normalized_tag = tag_name.strip().lower().replace(' ', '-').replace('_', '-')
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Tags actuels
        current_tags = existing_task.get('tags', [])
        
        # Vérifier si tag présent
        if normalized_tag not in current_tags:
            raise HTTPException(status_code=404, detail=f"Tag '{tag_name}' non trouvé dans cette tâche")
        
        # Retirer le tag
        updated_tags = [tag for tag in current_tags if tag != normalized_tag]
        
        # Préparer mise à jour
        updates = {
            "tags": updated_tags,
            "updated_at": datetime.now().isoformat()
        }
        
        # Historique
        history_entry = {
            "action": "tag_removed",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Tag retiré: {normalized_tag}"
        }
        
        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        return {
            "message": "Tag retiré avec succès",
            "task_id": task_id,
            "tag_removed": normalized_tag,
            "remaining_tags": updated_tags,
            "total_tags": len(updated_tags),
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur suppression tag: {str(e)}")

# =====================================
# �🆕 NOUVEAUX ENDPOINTS - PHASE 5
# GESTION INDIVIDUELLE DES TÂCHES
# =====================================

@app.get("/tasks/{task_id}")
async def get_task_detail(task_id: str):
    """
    🔍 Récupérer le détail complet d'une tâche par son ID
    
    Retourne toutes les informations d'une tâche :
    - Détails de base (description, priorité, statut, etc.)
    - Informations de validation humaine
    - Historique des actions
    - Métadonnées sources (email/meeting)
    - Âge de la tâche en jours
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche depuis le système unifié
        unified_manager = get_unified_task_manager()
        task = unified_manager.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Enrichir avec informations supplémentaires
        enriched_task = {
            **task,
            "validated": task.get("validated", False),
            "rejected": task.get("rejected", False),
            "completed": task.get("completed", False),
            "history_count": len(task.get("history", [])),
            "last_modified": task.get("updated_at"),
            "age_days": unified_manager.calculate_task_age(task.get("created_at")),
            "progress": task.get("progress", 0),
            "completion_notes": task.get("completion_notes"),
            "rejection_reason": task.get("rejection_reason")
        }
        
        return {
            "message": "Détail tâche récupéré avec succès",
            "task": enriched_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération tâche: {str(e)}")

@app.patch("/tasks/{task_id}/validate")
async def validate_task(task_id: str):
    """
    ✅ Valider une tâche (marquer comme vérifiée par un humain)
    
    Actions effectuées :
    - Marquer validated = true
    - Ajouter timestamp de validation
    - Créer entrée dans l'historique
    - Mettre à jour updated_at
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        task = unified_manager.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si déjà validée
        if task.get("validated", False):
            raise HTTPException(status_code=400, detail="Tâche déjà validée")
        
        # Préparer les mises à jour
        updates = {
            "validated": True,
            "validation_status": "validated",
            "validated_at": datetime.now().isoformat(),
            "validated_by": "user",  # TODO: récupérer de l'authentification
            "updated_at": datetime.now().isoformat()
        }
        
        # Créer entrée d'historique
        history_entry = {
            "action": "validated",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": "Tâche validée manuellement par utilisateur"
        }
        
        # Mettre à jour la tâche
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        if not updated_task:
            raise HTTPException(status_code=500, detail="Erreur lors de la validation")
        
        return {
            "message": "Tâche validée avec succès",
            "task_id": task_id,
            "validated_at": updates["validated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur validation tâche: {str(e)}")

@app.patch("/tasks/{task_id}/reject")
async def reject_task(task_id: str, rejection_reason: str = "Non spécifiée"):
    """
    ❌ Rejeter une tâche avec raison optionnelle
    
    Actions effectuées :
    - Marquer statut = rejected
    - Marquer rejected = true
    - Enregistrer raison du rejet
    - Ajouter timestamp de rejet
    - Créer entrée dans l'historique
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        task = unified_manager.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si déjà rejetée
        if task.get("rejected", False):
            raise HTTPException(status_code=400, detail="Tâche déjà rejetée")
        
        # Vérifier si déjà terminée
        if task.get("statut") == "completed":
            raise HTTPException(status_code=400, detail="Impossible de rejeter une tâche terminée")
        
        # Préparer les mises à jour
        updates = {
            "statut": "rejected",
            "rejected": True,
            "validation_status": "rejected",
            "rejected_at": datetime.now().isoformat(),
            "rejected_by": "user",
            "rejection_reason": rejection_reason,
            "updated_at": datetime.now().isoformat()
        }
        
        # Créer entrée d'historique
        history_entry = {
            "action": "rejected",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Tâche rejetée. Raison: {rejection_reason}"
        }
        
        # Mettre à jour la tâche
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        if not updated_task:
            raise HTTPException(status_code=500, detail="Erreur lors du rejet")
        
        return {
            "message": "Tâche rejetée avec succès",
            "task_id": task_id,
            "rejected_at": updates["rejected_at"],
            "reason": rejection_reason,
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur rejet tâche: {str(e)}")

@app.patch("/tasks/{task_id}/complete")
async def complete_task(task_id: str, completion_notes: str = None):
    """
    ✅ Marquer une tâche comme terminée
    
    Actions effectuées :
    - Marquer statut = completed
    - Marquer completed = true
    - Progression à 100%
    - Ajouter notes de complétion optionnelles
    - Ajouter timestamp de complétion
    - Créer entrée dans l'historique
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        task = unified_manager.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si déjà terminée
        if task.get("statut") == "completed" or task.get("completed", False):
            raise HTTPException(status_code=400, detail="Tâche déjà terminée")
        
        # Vérifier si rejetée
        if task.get("rejected", False):
            raise HTTPException(status_code=400, detail="Impossible de terminer une tâche rejetée")
        
        # Préparer les mises à jour
        updates = {
            "statut": "completed",
            "completed": True,
            "validation_status": "completed",
            "completed_at": datetime.now().isoformat(),
            "completed_by": "user",
            "completion_notes": completion_notes,
            "progress": 100,
            "updated_at": datetime.now().isoformat()
        }
        
        # Créer entrée d'historique
        details = f"Tâche terminée avec succès"
        if completion_notes:
            details += f". Notes: {completion_notes}"
        
        history_entry = {
            "action": "completed",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": details
        }
        
        # Mettre à jour la tâche
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        if not updated_task:
            raise HTTPException(status_code=500, detail="Erreur lors de la complétion")
        
        return {
            "message": "Tâche terminée avec succès",
            "task_id": task_id,
            "completed_at": updates["completed_at"],
            "notes": completion_notes,
            "progress": 100,
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur complétion tâche: {str(e)}")

# =====================================
# 🆕 NOUVEAUX ENDPOINTS - PHASE 6
# MODIFICATION ET ÉDITION DES TÂCHES
# =====================================

@app.put("/tasks/{task_id}")
async def update_task_complete(task_id: str, task_data: TaskUpdateComplete):
    """
    📝 Modifier complètement une tâche (PUT)
    
    Remplace tous les champs modifiables de la tâche.
    Préserve automatiquement : id, created_at, source, source_metadata, history
    
    Champs modifiables :
    - description (obligatoire, 3-500 caractères)
    - responsable (obligatoire, 1-100 caractères)  
    - priorite (obligatoire: high, medium, low)
    - statut (obligatoire: pending, in_progress, completed, cancelled, rejected)
    - deadline (optionnel: YYYY-MM-DD ou null)
    - department (optionnel, max 50 caractères)
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Récupérer la tâche existante
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si la tâche peut être modifiée
        if existing_task.get("rejected", False):
            raise HTTPException(status_code=400, detail="Impossible de modifier une tâche rejetée")
        
        # Préparer les mises à jour (tous les champs)
        updates = {
            "description": task_data.description,
            "responsable": task_data.responsable,
            "priorite": task_data.priorite,
            "statut": task_data.statut,
            "deadline": task_data.deadline,
            "department": task_data.department,
            "updated_at": datetime.now().isoformat()
        }
        
        # Créer un résumé des changements pour l'historique
        changes = []
        for key, new_value in updates.items():
            if key == "updated_at":
                continue
            old_value = existing_task.get(key)
            if old_value != new_value:
                changes.append(f"{key}: '{old_value}' → '{new_value}'")
        
        # Créer entrée d'historique
        history_entry = {
            "action": "updated_complete",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Modification complète. Changements: {', '.join(changes) if changes else 'Aucun changement'}"
        }
        
        # Mettre à jour la tâche
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        if not updated_task:
            raise HTTPException(status_code=500, detail="Erreur lors de la modification")
        
        return {
            "message": "Tâche modifiée avec succès",
            "task_id": task_id,
            "changes_count": len(changes),
            "changes": changes,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur modification tâche: {str(e)}")

@app.patch("/tasks/{task_id}/priority")
async def update_task_priority(task_id: str, priority_data: TaskPriorityUpdate):
    """
    🎯 Modifier uniquement la priorité d'une tâche
    
    Valeurs acceptées : high, medium, low
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        priority = priority_data.priority
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si changement nécessaire
        old_priority = existing_task.get("priorite", "medium")
        if old_priority == priority:
            return {
                "message": "Priorité inchangée",
                "task_id": task_id,
                "priority": priority,
                "task": existing_task
            }
        
        # Préparer mise à jour
        updates = {
            "priorite": priority,
            "updated_at": datetime.now().isoformat()
        }
        
        # Historique spécifique
        history_entry = {
            "action": "priority_changed",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Priorité modifiée: {old_priority} → {priority}"
        }
        
        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        return {
            "message": "Priorité modifiée avec succès",
            "task_id": task_id,
            "old_priority": old_priority,
            "new_priority": priority,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur modification priorité: {str(e)}")

@app.patch("/tasks/{task_id}/deadline")
async def update_task_deadline(task_id: str, deadline_data: TaskDeadlineUpdate):
    """
    📅 Modifier uniquement la deadline d'une tâche

    Format accepté : YYYY-MM-DD ou null pour supprimer
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")

        deadline = deadline_data.deadline

        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)

        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")

        # Vérifier si changement nécessaire
        old_deadline = existing_task.get("deadline")
        if old_deadline == deadline:
            return {
                "message": "Deadline inchangée",
                "task_id": task_id,
                "deadline": deadline,
                "task": existing_task
            }

        # Préparer mise à jour
        updates = {
            "deadline": deadline,
            "updated_at": datetime.now().isoformat()
        }

        # Historique spécifique
        old_str = old_deadline or "non définie"
        new_str = deadline or "supprimée"
        history_entry = {
            "action": "deadline_changed",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Échéance modifiée: {old_str} → {new_str}"
        }

        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)

        return {
            "message": "Échéance modifiée avec succès",
            "task_id": task_id,
            "old_deadline": old_deadline,
            "new_deadline": deadline,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur modification échéance: {str(e)}")

@app.patch("/tasks/{task_id}/description")
async def update_task_description(task_id: str, description_data: TaskDescriptionUpdate):
    """
    📝 Modifier uniquement la description d'une tâche
    
    Description : 3-500 caractères
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        description = description_data.description
        
        description = description.strip()
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si changement nécessaire
        old_description = existing_task.get("description", "")
        if old_description == description:
            return {
                "message": "Description inchangée",
                "task_id": task_id,
                "description": description,
                "task": existing_task
            }
        
        # Préparer mise à jour
        updates = {
            "description": description,
            "updated_at": datetime.now().isoformat()
        }
        
        # Historique spécifique (avec preview de changement)
        old_preview = old_description[:50] + "..." if len(old_description) > 50 else old_description
        new_preview = description[:50] + "..." if len(description) > 50 else description
        
        history_entry = {
            "action": "description_changed", 
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Description modifiée: '{old_preview}' → '{new_preview}'"
        }
        
        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        return {
            "message": "Description modifiée avec succès",
            "task_id": task_id,
            "old_description": old_description,
            "new_description": description,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur modification description: {str(e)}")

@app.patch("/tasks/{task_id}/department")
async def update_task_department(task_id: str, department: str = None):
    """
    🏢 Modifier uniquement le département d'une tâche
    
    Département : max 50 caractères ou null pour supprimer
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")
        
        # Valider le département
        if department and len(department) > 50:
            raise HTTPException(status_code=400, detail="Nom de département trop long (maximum 50 caractères)")
        
        if department:
            department = department.strip()
            if not department:
                department = None
        
        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)
        
        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")
        
        # Vérifier si changement nécessaire
        old_department = existing_task.get("department")
        if old_department == department:
            return {
                "message": "Département inchangé",
                "task_id": task_id,
                "department": department,
                "task": existing_task
            }
        
        # Préparer mise à jour
        updates = {
            "department": department,
            "updated_at": datetime.now().isoformat()
        }
        
        # Historique spécifique
        old_str = old_department or "non défini"
        new_str = department or "supprimé"
        history_entry = {
            "action": "department_changed",
            "timestamp": datetime.now().isoformat(),
            "user": "user",
            "details": f"Département modifié: {old_str} → {new_str}"
        }
        
        # Mettre à jour
        updated_task = unified_manager.update_task(task_id, updates, history_entry)
        
        return {
            "message": "Département modifié avec succès",
            "task_id": task_id,
            "old_department": old_department,
            "new_department": department,
            "updated_at": updates["updated_at"],
            "task": updated_task
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur modification département: {str(e)}")

@app.post("/tasks/{task_id}/comment")
async def add_task_comment(task_id: str, comment_data: TaskComment):
    """
    💬 Ajouter un commentaire à une tâche

    Le commentaire est ajouté dans l'historique et dans une section comments dédiée.
    Limite : 1-1000 caractères
    """
    try:
        if not UNIFIED_SYSTEM_AVAILABLE:
            raise HTTPException(status_code=503, detail="Système unifié non disponible")

        # Récupérer la tâche
        unified_manager = get_unified_task_manager()
        existing_task = unified_manager.get_task_by_id(task_id)

        if not existing_task:
            raise HTTPException(status_code=404, detail=f"Tâche '{task_id}' non trouvée")

        # Préparer le commentaire
        comment_timestamp = datetime.now().isoformat()
        comment = {
            "id": f"comment_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}",
            "content": comment_data.comment.strip(),
            "author": comment_data.author,
            "timestamp": comment_timestamp
        }

        # Ajouter le commentaire à la liste des commentaires
        if "comments" not in existing_task:
            existing_task["comments"] = []

        updates = {
            "comments": existing_task["comments"] + [comment],
            "updated_at": comment_timestamp
        }

        # Historique spécifique pour commentaire
        comment_preview = comment_data.comment[:100] + "..." if len(comment_data.comment) > 100 else comment_data.comment
        history_entry = {
            "action": "comment_added",
            "timestamp": comment_timestamp,
            "user": comment_data.author,
            "details": f"Commentaire ajouté: '{comment_preview}'"
        }

        # Mettre à jour la tâche
        updated_task = unified_manager.update_task(task_id, updates, history_entry)

        return {
            "message": "Commentaire ajouté avec succès",
            "task_id": task_id,
            "comment": comment,
            "total_comments": len(updated_task.get("comments", [])),
            "updated_at": comment_timestamp,
            "task": updated_task
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur ajout commentaire: {str(e)}")

# =====================================
# 📄 NOUVEAUX ENDPOINTS - DOCUMENT PROCESSING
# =====================================

from fastapi import UploadFile, File
from typing import List
import os
import tempfile

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    extract_tasks: bool = True,
    use_cache: bool = True
):
    """
    📄 Upload et traitement de documents (PDF, Word, TXT)

    Fonctionnalités :
    - Support PDF, Word (.docx), et fichiers texte
    - Extraction automatique du texte
    - Validation du type et taille de fichier
    - Extraction de tâches optionnelle
    - Cache anti-doublon basé sur hash du contenu

    Paramètres :
    - file: Fichier à uploader
    - extract_tasks: Extraire les tâches du document (défaut: True)
    - use_cache: Utiliser le cache (défaut: True)

    Retourne :
    - Texte extrait
    - Tâches extraites (si demandé)
    - Métadonnées du fichier
    """
    try:
        # Validation du type de fichier
        allowed_extensions = ['.pdf', '.docx', '.txt', '.doc']
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Type de fichier non supporté. Extensions autorisées: {', '.join(allowed_extensions)}"
            )

        # Validation de la taille (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()
        file_size = len(file_content)

        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"Fichier trop volumineux. Taille maximale: 10MB, taille actuelle: {file_size / (1024*1024):.1f}MB"
            )

        # Calcul du hash pour le cache
        import hashlib
        file_hash = hashlib.md5(file_content).hexdigest()[:16]

        # Vérification cache si demandé
        if use_cache and est_email_deja_traite(file_hash):
            info_cache = obtenir_info_cache(file_hash)
            return {
                "status": "cache_hit",
                "message": "Document similaire déjà traité",
                "file_hash": file_hash,
                "file_info": {
                    "filename": file.filename,
                    "size": file_size,
                    "type": file_extension
                },
                "cached_result": info_cache
            }

        # Sauvegarde temporaire du fichier
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        try:
            # Extraction du texte selon le type
            extracted_text = ""

            if file_extension == '.pdf':
                try:
                    import PyPDF2
                    with open(temp_file_path, 'rb') as pdf_file:
                        pdf_reader = PyPDF2.PdfReader(pdf_file)
                        for page in pdf_reader.pages:
                            extracted_text += page.extract_text() + "\n"
                except ImportError:
                    raise HTTPException(
                        status_code=500,
                        detail="Support PDF non disponible. Installez PyPDF2: pip install PyPDF2"
                    )

            elif file_extension in ['.docx', '.doc']:
                try:
                    from docx import Document
                    doc = Document(temp_file_path)
                    for paragraph in doc.paragraphs:
                        extracted_text += paragraph.text + "\n"
                except ImportError:
                    raise HTTPException(
                        status_code=500,
                        detail="Support Word non disponible. Installez python-docx: pip install python-docx"
                    )

            elif file_extension == '.txt':
                with open(temp_file_path, 'r', encoding='utf-8', errors='ignore') as txt_file:
                    extracted_text = txt_file.read()

            # Nettoyage du texte
            extracted_text = extracted_text.strip()
            if not extracted_text:
                raise HTTPException(
                    status_code=400,
                    detail="Aucun texte extractible trouvé dans le document"
                )

            # Extraction de tâches si demandé
            tasks_extracted = []
            if extract_tasks:
                try:
                    # Utiliser la logique d'extraction existante
                    tasks_data = extract_tasks_from_email(extracted_text)
                    tasks_extracted = json.loads(tasks_data) if tasks_data else []

                    # Enrichissement des tâches extraites du document
                    for task in tasks_extracted:
                        task["id"] = str(uuid.uuid4())
                        task["source"] = "document"
                        task["type"] = "document_processing"
                        task["document_info"] = {
                            "filename": file.filename,
                            "file_type": file_extension,
                            "file_size": file_size,
                            "file_hash": file_hash,
                            "uploaded_at": datetime.now().isoformat()
                        }
                        task["extrait_le"] = datetime.now().isoformat(timespec='seconds')
                        task["statut"] = "à faire"

                        # Sauvegarde dans système unifié si disponible
                        if UNIFIED_SYSTEM_AVAILABLE:
                            unified_manager = get_unified_task_manager()
                            unified_task_data = {
                                "description": task["description"],
                                "responsable": task.get("responsable", "non spécifié"),
                                "deadline": task.get("deadline"),
                                "priorite": task.get("priorite", "medium"),
                                "statut": task["statut"],
                                "source": "document",
                                "type": "document_processing",
                                "source_metadata": {
                                    "document_filename": file.filename,
                                    "document_type": file_extension,
                                    "document_size": file_size,
                                    "document_hash": file_hash,
                                    "extraction_timestamp": task["extrait_le"]
                                }
                            }
                            unified_manager.add_task(unified_task_data)

                except Exception as e:
                    print(f"⚠️ Erreur extraction tâches: {e}")
                    # Ne pas échouer complètement si l'extraction échoue

            # Marquer dans le cache
            if use_cache:
                marquer_email_traite(file_hash, {
                    "filename": file.filename,
                    "file_type": file_extension,
                    "file_size": file_size,
                    "text_length": len(extracted_text),
                    "tasks_extracted": len(tasks_extracted),
                    "processed_at": datetime.now().isoformat()
                })

            return {
                "status": "success",
                "message": f"Document '{file.filename}' traité avec succès",
                "file_info": {
                    "filename": file.filename,
                    "size": file_size,
                    "size_mb": round(file_size / (1024*1024), 2),
                    "type": file_extension,
                    "hash": file_hash
                },
                "extraction": {
                    "text_length": len(extracted_text),
                    "text_preview": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
                    "full_text": extracted_text
                },
                "tasks": {
                    "extracted": len(tasks_extracted),
                    "tasks": tasks_extracted
                },
                "processing_info": {
                    "cache_used": use_cache,
                    "cache_status": "new_document_added" if use_cache else "cache_disabled",
                    "processing_time": datetime.now().isoformat()
                }
            }

        finally:
            # Nettoyage du fichier temporaire
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur traitement document: {str(e)}")

@app.get("/documents/supported-formats")
async def get_supported_formats():
    """
    📋 Liste des formats de documents supportés

    Retourne :
    - Formats acceptés
    - Tailles maximales
    - Fonctionnalités disponibles
    """
    return {
        "supported_formats": [
            {
                "extension": ".pdf",
                "description": "Documents PDF",
                "library": "PyPDF2",
                "max_size": "10MB"
            },
            {
                "extension": ".docx",
                "description": "Documents Word modernes",
                "library": "python-docx",
                "max_size": "10MB"
            },
            {
                "extension": ".doc",
                "description": "Documents Word classiques",
                "library": "python-docx",
                "max_size": "10MB"
            },
            {
                "extension": ".txt",
                "description": "Fichiers texte",
                "library": "built-in",
                "max_size": "10MB"
            }
        ],
        "features": [
            "Extraction automatique du texte",
            "Validation de type et taille",
            "Cache anti-doublon",
            "Extraction de tâches IA",
            "Support système unifié"
        ],
        "limitations": [
            "Taille maximale: 10MB par fichier",
            "Encodage UTF-8 recommandé pour les .txt",
            "Pas de support OCR pour les images dans PDF"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🌟 Démarrage serveur AI Task Extraction...")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
