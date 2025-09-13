# -*- coding: utf-8 -*-
import asyncio
import threading
import time
import logging
import os
import sys
from datetime import datetime

# Ajouter les chemins pour les imports
current_dir = os.path.dirname(__file__)
utils_dir = os.path.join(os.path.dirname(current_dir), "utils")
core_dir = os.path.join(os.path.dirname(current_dir), "core")
sys.path.insert(0, utils_dir)
sys.path.insert(0, core_dir)
sys.path.insert(0, current_dir)

from email_watcher import get_watcher_instance
# 🎯 NOUVEAU: Import du meeting watcher
try:
    from meeting_watcher import get_meeting_watcher_instance
    MEETING_WATCHER_AVAILABLE = True
except ImportError:
    MEETING_WATCHER_AVAILABLE = False
    def get_meeting_watcher_instance():
        return None

from pipeline import traiter_emails

logger = logging.getLogger(__name__)

class BackgroundTaskService:
    """Service de gestion des tâches de fond pour le traitement d'emails et réunions"""
    
    def __init__(self):
        self.watcher = get_watcher_instance()
        # 🎯 NOUVEAU: Ajout du meeting watcher
        self.meeting_watcher = get_meeting_watcher_instance() if MEETING_WATCHER_AVAILABLE else None
        self.background_thread = None
        self.health_check_thread = None
        self.is_service_running = False
        self.stats = {
            "service_started_at": None,
            "total_processing_cycles": 0,
            "last_activity": None,
            "errors_count": 0,
            "meeting_watcher_enabled": MEETING_WATCHER_AVAILABLE
        }
    
    def start_service(self):
        """Démarre le service complet (watcher + background tasks)"""
        if self.is_service_running:
            logger.warning("⚠️ Le service background est déjà en cours")
            return False
        
        try:
            # Démarrer le file watcher pour emails
            if not self.watcher.start():
                logger.error("❌ Impossible de démarrer le file watcher")
                return False
            
            # 🎯 NOUVEAU: Démarrer le meeting watcher si disponible
            if self.meeting_watcher and MEETING_WATCHER_AVAILABLE:
                if self.meeting_watcher.start():
                    logger.info("🎯 Meeting watcher démarré avec succès")
                else:
                    logger.warning("⚠️ Impossible de démarrer le meeting watcher")
            
            # Démarrer les tâches de fond
            self._start_background_tasks()
            
            self.is_service_running = True
            self.stats["service_started_at"] = datetime.now().isoformat()
            
            logger.info("🚀 Service background démarré avec succès")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du démarrage du service : {e}")
            self.stats["errors_count"] += 1
            return False
    
    def stop_service(self):
        """Arrête le service complet"""
        if not self.is_service_running:
            logger.warning("⚠️ Le service background n'est pas en cours")
            return False
        
        try:
            # Arrêter le file watcher pour emails
            self.watcher.stop()
            
            # 🎯 NOUVEAU: Arrêter le meeting watcher si disponible
            if self.meeting_watcher and MEETING_WATCHER_AVAILABLE:
                if self.meeting_watcher.stop():
                    logger.info("🎯 Meeting watcher arrêté")
                else:
                    logger.warning("⚠️ Problème arrêt meeting watcher")
            
            # Arrêter les tâches de fond
            self.is_service_running = False
            
            # Attendre que les threads se terminent
            if self.background_thread and self.background_thread.is_alive():
                self.background_thread.join(timeout=5)
            
            if self.health_check_thread and self.health_check_thread.is_alive():
                self.health_check_thread.join(timeout=5)
            
            logger.info("🛑 Service background arrêté")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'arrêt du service : {e}")
            return False
    
    def _start_background_tasks(self):
        """Démarre les tâches de fond"""
        # Thread pour le monitoring périodique
        self.background_thread = threading.Thread(
            target=self._periodic_monitoring,
            daemon=True,
            name="EmailMonitoringThread"
        )
        self.background_thread.start()
        
        # Thread pour le health check
        self.health_check_thread = threading.Thread(
            target=self._health_check_loop,
            daemon=True,
            name="HealthCheckThread"
        )
        self.health_check_thread.start()
    
    def _periodic_monitoring(self):
        """Surveillance périodique (backup du file watcher)"""
        logger.info("🔄 Monitoring périodique démarré")
        
        while self.is_service_running:
            try:
                time.sleep(30)  # Vérification toutes les 30 secondes
                
                if self.is_service_running:
                    # Vérifier l'état du watcher
                    watcher_status = self.watcher.get_status()
                    
                    if watcher_status["status"] == "inactif":
                        logger.warning("⚠️ File watcher inactif, tentative de redémarrage...")
                        self.watcher.start()
                    
                    self.stats["total_processing_cycles"] += 1
                    self.stats["last_activity"] = datetime.now().isoformat()
                    
            except Exception as e:
                logger.error(f"❌ Erreur dans le monitoring périodique : {e}")
                self.stats["errors_count"] += 1
                time.sleep(10)  # Attendre avant de reprendre
    
    def _health_check_loop(self):
        """Boucle de vérification de santé du système"""
        logger.info("❤️ Health check démarré")
        
        while self.is_service_running:
            try:
                time.sleep(60)  # Health check toutes les minutes
                
                if self.is_service_running:
                    # Vérifier l'état général du système
                    self._perform_health_check()
                    
            except Exception as e:
                logger.error(f"❌ Erreur dans le health check : {e}")
                self.stats["errors_count"] += 1
    
    def _perform_health_check(self):
        """Effectue une vérification de santé complète"""
        try:
            # Vérifier l'état du file watcher
            watcher_status = self.watcher.get_status()
            
            # Vérifier l'accès aux fichiers
            import os
            # Chemin absolu basé sur le répertoire racine du projet
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            files_to_check = [
                os.path.join(base_dir, "data", "emails.json"),
                os.path.join(base_dir, "data", "tasks.json"), 
                os.path.join(base_dir, "data", "logs.json")
            ]
            
            for file_path in files_to_check:
                if not os.path.exists(file_path):
                    logger.warning(f"⚠️ Fichier manquant : {file_path}")
            
            # Log de santé (optionnel, seulement si debug activé)
            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"💚 Health check OK - Watcher: {watcher_status['status']}")
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du health check : {e}")
            self.stats["errors_count"] += 1
    
    def get_service_status(self):
        """Retourne l'état complet du service"""
        watcher_status = self.watcher.get_status()
        
        return {
            "service_running": self.is_service_running,
            "watcher_status": watcher_status,
            "background_thread_alive": self.background_thread.is_alive() if self.background_thread else False,
            "health_check_thread_alive": self.health_check_thread.is_alive() if self.health_check_thread else False,
            "stats": self.stats,
            "timestamp": datetime.now().isoformat()
        }
    
    def force_processing(self):
        """Force le traitement des emails manuellement"""
        try:
            logger.info("🔧 Traitement forcé des emails...")
            resultat = traiter_emails()
            self.stats["last_activity"] = datetime.now().isoformat()
            return {
                "success": True,
                "result": resultat,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Erreur lors du traitement forcé : {e}")
            self.stats["errors_count"] += 1
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Instance globale du service
background_service = BackgroundTaskService()

def get_background_service():
    """Retourne l'instance globale du service background"""
    return background_service
