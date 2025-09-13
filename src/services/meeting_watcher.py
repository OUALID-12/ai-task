# -*- coding: utf-8 -*-
"""
🎯 MEETING WATCHER - Surveillance des fichiers meetings.json
===========================================================

Surveille automatiquement les modifications de meetings.json
et déclenche le traitement automatique des nouvelles réunions

Version: 1.0.0 - Intégration système existant
"""

import os
import time
import json
import threading
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging

# Import du traitement des réunions
try:
    from meeting_processor import traiter_reunions
except ImportError:
    def traiter_reunions():
        return {"message": "Meeting processor non disponible"}

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MeetingFileHandler(FileSystemEventHandler):
    """Gestionnaire d'événements pour surveiller meetings.json"""
    
    def __init__(self, meeting_file_path="data/meetings.json", debounce_seconds=1):
        self.meeting_file_path = os.path.abspath(meeting_file_path)
        self.debounce_seconds = debounce_seconds
        self.last_modified = 0
        self.processing_lock = threading.Lock()
        
        logger.info(f"🔍 Surveillance réunions initialisée pour : {self.meeting_file_path}")
    
    def on_modified(self, event):
        """Déclenché quand meetings.json est modifié"""
        if event.is_directory:
            return
        
        # Vérifier si c'est notre fichier meetings.json
        if event.src_path == self.meeting_file_path:
            current_time = time.time()
            
            # Debouncing : éviter les multiples déclenchements
            if current_time - self.last_modified > self.debounce_seconds:
                self.last_modified = current_time
                logger.info("📧 Modification détectée dans meetings.json")
                
                # Traitement asynchrone pour ne pas bloquer le watcher
                threading.Thread(target=self._process_meetings, daemon=True).start()
    
    def _process_meetings(self):
        """Traite automatiquement les nouvelles réunions"""
        with self.processing_lock:
            try:
                logger.info("⚡ Début du traitement automatique des réunions...")
                
                # Utiliser le même système que les emails
                resultat = traiter_reunions()
                
                logger.info(f"✅ Traitement réunions terminé : {resultat}")
                
            except Exception as e:
                logger.error(f"❌ Erreur traitement automatique réunions: {e}")

class MeetingWatcher:
    """Service de surveillance des réunions en temps réel"""
    
    def __init__(self, meeting_file_path="data/meetings.json"):
        self.meeting_file_path = os.path.abspath(meeting_file_path)
        self.directory_path = os.path.dirname(self.meeting_file_path)
        self.observer = None
        self.handler = None
        self.is_running = False
        
        # S'assurer que le fichier existe
        self._ensure_meeting_file_exists()
    
    def _ensure_meeting_file_exists(self):
        """Crée le fichier meetings.json s'il n'existe pas"""
        if not os.path.exists(self.meeting_file_path):
            os.makedirs(os.path.dirname(self.meeting_file_path), exist_ok=True)
            with open(self.meeting_file_path, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=4)
            logger.info(f"📁 Fichier {self.meeting_file_path} créé")
    
    def start(self):
        """Démarre la surveillance"""
        if self.is_running:
            logger.warning("⚠️ Le meeting watcher est déjà en cours d'exécution")
            return False
        
        try:
            self.handler = MeetingFileHandler(self.meeting_file_path)
            self.observer = Observer()
            self.observer.schedule(self.handler, self.directory_path, recursive=False)
            self.observer.start()
            self.is_running = True
            
            logger.info(f"🚀 Surveillance réunions démarrée pour : {self.meeting_file_path}")
            logger.info(f"📂 Répertoire surveillé : {self.directory_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du démarrage du meeting watcher : {e}")
            return False
    
    def stop(self):
        """Arrête la surveillance"""
        if not self.is_running:
            logger.warning("⚠️ Le meeting watcher n'est pas en cours d'exécution")
            return False
        
        try:
            if self.observer:
                self.observer.stop()
                self.observer.join()
            
            self.is_running = False
            logger.info("🛑 Surveillance réunions arrêtée")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'arrêt du meeting watcher : {e}")
            return False
    
    def get_status(self):
        """Retourne l'état de la surveillance"""
        return {
            "status": "actif" if self.is_running else "inactif",
            "is_running": self.is_running,
            "file_path": self.meeting_file_path,
            "directory": self.directory_path,
            "observer_alive": self.observer.is_alive() if self.observer else False,
            "timestamp": datetime.now().isoformat()
        }
    
    def force_check(self):
        """Force une vérification manuelle"""
        if self.handler:
            logger.info("🔍 Vérification forcée des réunions...")
            threading.Thread(target=self.handler._process_meetings, daemon=True).start()
            return True
        return False

# Instance globale du meeting watcher
meeting_watcher = MeetingWatcher()

def get_meeting_watcher_instance():
    """Retourne l'instance globale du meeting watcher"""
    return meeting_watcher
