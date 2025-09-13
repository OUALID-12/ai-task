# -*- coding: utf-8 -*-
"""
💾 ROUTES DE GESTION DU CACHE
===========================

Endpoints pour la gestion et le monitoring du cache d'emails.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
import sys

# Ajouter le dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from core.models import EmailCacheRequest, CacheStats
from utils.cache_emails import (
    calculer_hash_email,
    est_email_deja_traite,
    obtenir_info_cache,
    obtenir_statistiques_cache,
    nettoyer_cache_ancien
)

router = APIRouter()


@router.get("/cache/stats")
def get_cache_statistics():
    """📊 Statistiques du cache d'emails."""
    try:
        stats = obtenir_statistiques_cache()
        
        # Ajouter des informations supplémentaires
        cache_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "emails_cache.json")
        stats["cache_file_exists"] = os.path.exists(cache_file)
        if stats["cache_file_exists"]:
            stats["cache_file_size"] = os.path.getsize(cache_file)
        
        return {
            "status": "success",
            "cache_statistics": stats,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération statistiques cache: {str(e)}")


@router.post("/cache/cleanup")
def cleanup_cache(retention_days: int = 30):
    """🧹 Nettoyage du cache des emails anciens."""
    try:
        # Effectuer le nettoyage
        nettoyer_cache_ancien(retention_days)
        
        # Récupérer les nouvelles statistiques
        stats_apres = obtenir_statistiques_cache()
        
        return {
            "status": "success",
            "message": f"Cache nettoyé - emails plus anciens que {retention_days} jours supprimés",
            "stats_apres_nettoyage": stats_apres,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur nettoyage cache: {str(e)}")


@router.post("/cache/check-email")
def check_email_in_cache(email_data: EmailCacheRequest):
    """🔍 Vérifier si un email spécifique est en cache."""
    try:
        # Calculer le hash
        email_hash = calculer_hash_email(email_data.texte, email_data.objet)
        
        # Vérifier si en cache
        est_en_cache = est_email_deja_traite(email_hash)
        
        result = {
            "email_hash": email_hash,
            "est_en_cache": est_en_cache,
            "timestamp": datetime.now().isoformat()
        }
        
        # Si en cache, ajouter les détails
        if est_en_cache:
            info_cache = obtenir_info_cache(email_hash)
            if info_cache:
                result["info_cache"] = info_cache
        
        return {
            "status": "success",
            "result": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur vérification cache: {str(e)}")


@router.delete("/cache/clear")
def clear_cache():
    """🗑️ Vider complètement le cache."""
    try:
        cache_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "emails_cache.json")
        
        if os.path.exists(cache_file):
            # Sauvegarder les stats avant suppression
            stats_avant = obtenir_statistiques_cache()
            
            # Vider le cache
            import json
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump({}, f, ensure_ascii=False, indent=4)
            
            return {
                "status": "success",
                "message": "Cache vidé avec succès",
                "emails_supprimes": stats_avant.get("total_emails_caches", 0),
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "success",
                "message": "Cache déjà vide ou inexistant",
                "timestamp": datetime.now().isoformat()
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur vidage cache: {str(e)}")
