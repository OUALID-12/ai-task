# -*- coding: utf-8 -*-
import os
import time
import json
import threading
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from pipeline import traiter_emails
import logging

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EmailFileHandler(FileSystemEventHandler):
    """Gestionnaire d'événements pour surveiller emails.json"""
    
    def __init__(self, email_file_path="emails.json", debounce_seconds=1):
        self.email_file_path = os.path.abspath(email_file_path)
        self.debounce_seconds = debounce_seconds
        self.last_modified = 0
        self.processing_lock = threading.Lock()
        
        logger.info(f"🔍 Surveillance initialisée pour : {self.email_file_path}")
    
    def on_modified(self, event):
        """Déclenché quand emails.json est modifié"""
        if event.is_directory:
            return
            
        # Vérifier si c'est notre fichier emails.json
        if os.path.abspath(event.src_path) == self.email_file_path:
            current_time = time.time()
            
            # Debouncing : éviter les multiples déclenchements
            if current_time - self.last_modified < self.debounce_seconds:
                return
                
            self.last_modified = current_time
            logger.info(f"📧 Modification détectée dans {self.email_file_path}")
            
            # Traitement asynchrone pour éviter de bloquer
            threading.Thread(target=self._process_emails, daemon=True).start()
    
    def _process_emails(self):
        """Traite les nouveaux emails de manière thread-safe"""
        with self.processing_lock:
            try:
                logger.info("⚡ Début du traitement automatique des emails...")
                
                # Vérifier s'il y a de nouveaux emails
                if self._has_new_emails():
                    # Appeler le pipeline existant
                    resultat = traiter_emails()
                    logger.info(f"✅ Traitement terminé : {resultat}")
                else:
                    logger.info("ℹ️ Aucun nouvel email à traiter")
                    
            except Exception as e:
                logger.error(f"❌ Erreur lors du traitement automatique : {e}")
    
    def _has_new_emails(self):
        """Vérifie s'il y a de nouveaux emails non traités"""
        try:
            with open(self.email_file_path, "r", encoding="utf-8") as f:
                emails = json.load(f)
            
            # Compter les emails non traités
            nouveaux_emails = [e for e in emails if e.get("statut_traitement") == "non_traité"]
            return len(nouveaux_emails) > 0
            
        except Exception as e:
            logger.error(f"Erreur lors de la vérification des nouveaux emails : {e}")
            return False

class EmailWatcher:
    """Service de surveillance des emails en temps réel"""
    
    def __init__(self, email_file_path="emails.json"):
        self.email_file_path = os.path.abspath(email_file_path)
        self.directory_path = os.path.dirname(self.email_file_path)
        self.observer = None
        self.handler = None
        self.is_running = False
        
        # S'assurer que le fichier existe
        self._ensure_email_file_exists()
    
    def _ensure_email_file_exists(self):
        """Crée le fichier emails.json s'il n'existe pas"""
        if not os.path.exists(self.email_file_path):
            with open(self.email_file_path, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=4)
            logger.info(f"📁 Fichier {self.email_file_path} créé")
    
    def start(self):
        """Démarre la surveillance"""
        if self.is_running:
            logger.warning("⚠️ Le watcher est déjà en cours d'exécution")
            return False
        
        try:
            self.handler = EmailFileHandler(self.email_file_path)
            self.observer = Observer()
            self.observer.schedule(self.handler, self.directory_path, recursive=False)
            self.observer.start()
            self.is_running = True
            
            logger.info(f"🚀 Surveillance démarrée pour : {self.email_file_path}")
            logger.info(f"📂 Répertoire surveillé : {self.directory_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors du démarrage du watcher : {e}")
            return False
    
    def stop(self):
        """Arrête la surveillance"""
        if not self.is_running:
            logger.warning("⚠️ Le watcher n'est pas en cours d'exécution")
            return False
        
        try:
            if self.observer:
                self.observer.stop()
                self.observer.join(timeout=5)
            
            self.is_running = False
            logger.info("🛑 Surveillance arrêtée")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erreur lors de l'arrêt du watcher : {e}")
            return False
    
    def get_status(self):
        """Retourne l'état du service"""
        return {
            "status": "actif" if self.is_running else "inactif",
            "file_path": self.email_file_path,
            "directory": self.directory_path,
            "observer_alive": self.observer.is_alive() if self.observer else False,
            "timestamp": datetime.now().isoformat()
        }
    
    def force_check(self):
        """Force une vérification manuelle"""
        if self.handler:
            logger.info("🔍 Vérification forcée des emails...")
            threading.Thread(target=self.handler._process_emails, daemon=True).start()
            return True
        return False

# Instance globale du watcher avec le bon chemin
email_watcher = EmailWatcher("data/emails.json")

def get_watcher_instance():
    """Retourne l'instance globale du watcher"""
    return email_watcher
