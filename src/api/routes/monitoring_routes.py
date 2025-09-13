# -*- coding: utf-8 -*-
"""
📊 ROUTES DE MONITORING
=====================

Endpoints pour le monitoring et la surveillance du système.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
import sys

# Ajouter le dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from core.models import RateLimitStats, QueueStats
from services.background_service import get_background_service

router = APIRouter()


@router.get("/rate-limit/status")
def get_rate_limit_status():
    """📊 Statut du rate limiter."""
    try:
        from utils.rate_limiter import RateLimiter
        
        # Créer un rate limiter temporaire pour les stats
        limiter = RateLimiter()
        stats = limiter.get_current_stats()
        
        return {
            "status": "success",
            "rate_limit_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération rate limit: {str(e)}")


@router.get("/queue/status")
def get_queue_status():
    """📋 Statut de la file d'attente."""
    try:
        from utils.email_queue import EmailQueue
        
        return {
            "status": "success",
            "message": "Queue status endpoint disponible",
            "note": "Queue créée dynamiquement lors du traitement rate-limited",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération queue status: {str(e)}")


@router.post("/watcher/start")
def start_watcher():
    """Démarre le service de surveillance."""
    service = get_background_service()
    if service.start_service():
        return {
            "status": "success",
            "message": "Service de surveillance démarré",
            "timestamp": datetime.now().isoformat()
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Impossible de démarrer le service de surveillance"
        )


@router.post("/watcher/stop")
def stop_watcher():
    """Arrête le service de surveillance."""
    service = get_background_service()
    if service.stop_service():
        return {
            "status": "success",
            "message": "Service de surveillance arrêté",
            "timestamp": datetime.now().isoformat()
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Impossible d'arrêter le service de surveillance"
        )


@router.get("/watcher/status")
def get_watcher_status():
    """Retourne l'état du service de surveillance."""
    service = get_background_service()
    return service.get_service_status()


@router.post("/watcher/force-check")
def force_watcher_check():
    """Force une vérification manuelle des emails."""
    service = get_background_service()
    result = service.force_processing()
    return result


@router.get("/system/health")
def system_health():
    """Endpoint de santé du système complet."""
    service = get_background_service()
    status = service.get_service_status()
    
    # Vérifier l'accès aux fichiers
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    files_status = {}
    for file_name in ["emails.json", "tasks.json", "logs.json"]:
        file_path = os.path.join(data_dir, file_name)
        files_status[file_name] = {
            "exists": os.path.exists(file_path),
            "readable": os.access(file_path, os.R_OK) if os.path.exists(file_path) else False,
            "writable": os.access(file_path, os.W_OK) if os.path.exists(file_path) else False
        }
    
    return {
        "system_status": "healthy" if status["service_running"] else "degraded",
        "service_status": status,
        "files_status": files_status,
        "timestamp": datetime.now().isoformat()
    }
