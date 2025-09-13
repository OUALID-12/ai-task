# -*- coding: utf-8 -*-
"""
🔧 ROUTES DE CONTRÔLE SYSTÈME
===========================

Endpoints pour le contrôle et la configuration du système.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
import sys

# Ajouter le dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from core.models import ProcessingOptions
from services.background_service import get_background_service

router = APIRouter()


@router.get("/status")
def get_system_status():
    """📊 Statut général du système."""
    try:
        service = get_background_service()
        service_status = service.get_service_status()
        
        # Vérifier les fichiers de données
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
        files_check = {}
        
        for filename in ["emails.json", "tasks.json", "logs.json", "emails_cache.json"]:
            filepath = os.path.join(data_dir, filename)
            files_check[filename] = {
                "exists": os.path.exists(filepath),
                "size": os.path.getsize(filepath) if os.path.exists(filepath) else 0,
                "readable": os.access(filepath, os.R_OK) if os.path.exists(filepath) else False,
                "writable": os.access(filepath, os.W_OK) if os.path.exists(filepath) else False
            }
        
        return {
            "status": "success",
            "system_health": "healthy" if service_status["service_running"] else "warning",
            "service_status": service_status,
            "files_status": files_check,
            "features_disponibles": [
                "Cache anti-doublon",
                "Batch processing intelligent",
                "Rate limiting + Queue", 
                "Optimisation prompts IA",
                "Surveillance temps réel"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération statut système: {str(e)}")


@router.post("/restart")
def restart_system():
    """🔄 Redémarrer les services système."""
    try:
        service = get_background_service()
        
        # Arrêter le service
        stop_result = service.stop_service()
        if not stop_result:
            return {
                "status": "warning",
                "message": "Impossible d'arrêter le service (peut-être déjà arrêté)",
                "timestamp": datetime.now().isoformat()
            }
        
        # Redémarrer le service
        start_result = service.start_service()
        if start_result:
            return {
                "status": "success",
                "message": "Services système redémarrés avec succès",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Impossible de redémarrer les services"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur redémarrage système: {str(e)}")


@router.get("/config")
def get_system_config():
    """⚙️ Configuration actuelle du système."""
    try:
        # Configuration par défaut (peut être étendue avec un fichier config)
        config = {
            "rate_limiting": {
                "default_calls_per_minute": 30,
                "default_calls_per_hour": 800,
                "default_calls_per_day": 5000
            },
            "batch_processing": {
                "default_batch_size_normal": 5,
                "default_batch_size_urgent": 2,
                "max_batch_size": 20
            },
            "cache": {
                "default_retention_days": 30,
                "auto_cleanup_enabled": True,
                "max_cache_size_mb": 100
            },
            "ai_optimization": {
                "prompts_optimized_by_default": True,
                "fallback_to_standard_prompts": True,
                "max_tokens_optimized": 800
            },
            "monitoring": {
                "health_check_interval_seconds": 30,
                "background_processing_interval_seconds": 60,
                "log_retention_days": 90
            }
        }
        
        return {
            "status": "success",
            "configuration": config,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération configuration: {str(e)}")


@router.post("/maintenance/mode")
def toggle_maintenance_mode(enable: bool):
    """🔧 Activer/désactiver le mode maintenance."""
    try:
        # Pour cette version, on simule le mode maintenance
        # Dans une vraie implémentation, cela pourrait désactiver certains endpoints
        
        maintenance_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", ".maintenance")
        
        if enable:
            # Créer le fichier de maintenance
            with open(maintenance_file, "w") as f:
                f.write(f"Maintenance activée le {datetime.now().isoformat()}")
            
            return {
                "status": "success",
                "message": "Mode maintenance activé",
                "maintenance_enabled": True,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Supprimer le fichier de maintenance
            if os.path.exists(maintenance_file):
                os.remove(maintenance_file)
            
            return {
                "status": "success", 
                "message": "Mode maintenance désactivé",
                "maintenance_enabled": False,
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur gestion mode maintenance: {str(e)}")


@router.get("/maintenance/status")
def get_maintenance_status():
    """🔧 Vérifier le statut du mode maintenance."""
    try:
        maintenance_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", ".maintenance")
        
        is_maintenance = os.path.exists(maintenance_file)
        
        result = {
            "status": "success",
            "maintenance_enabled": is_maintenance,
            "timestamp": datetime.now().isoformat()
        }
        
        if is_maintenance:
            # Lire les détails du mode maintenance
            try:
                with open(maintenance_file, "r") as f:
                    result["maintenance_details"] = f.read().strip()
            except:
                result["maintenance_details"] = "Mode maintenance actif"
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur vérification mode maintenance: {str(e)}")
