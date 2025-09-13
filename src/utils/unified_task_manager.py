# -*- coding: utf-8 -*-
"""
📁 GESTIONNAIRE TÂCHES UNIFIÉES
===============================

Gestionnaire pour le nouveau système de tâches unifié
Compatible avec l'ancien système + nouvelles fonctionnalités
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

class UnifiedTaskManager:
    """Gestionnaire pour les tâches unifiées"""
    
    def __init__(self):
        self.unified_file = "data/unified_tasks.json"
        self.ensure_file_exists()
    
    def ensure_file_exists(self):
        """S'assurer que le fichier unifié existe"""
        if not os.path.exists(self.unified_file):
            with open(self.unified_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)
    
    def load_all_tasks(self) -> List[Dict]:
        """Charger toutes les tâches unifiées"""
        try:
            with open(self.unified_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Erreur chargement tâches: {e}")
            return []
    
    def save_all_tasks(self, tasks: List[Dict]):
        """Sauvegarder toutes les tâches"""
        try:
            with open(self.unified_file, "w", encoding="utf-8") as f:
                json.dump(tasks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ Erreur sauvegarde tâches: {e}")
    
    def add_task(self, task_data: Dict) -> str:
        """Ajouter une nouvelle tâche au système unifié"""
        tasks = self.load_all_tasks()
        
        # Générer ID unique
        task_id = f"task_{task_data.get('source', 'manual')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
        
        # Structure standard
        new_task = {
            "id": task_id,
            "description": task_data.get("description", ""),
            "responsable": task_data.get("responsable", ""),
            "deadline": task_data.get("deadline"),
            "priorite": task_data.get("priorite", "medium"),
            "statut": task_data.get("statut", "pending"),
            "confiance_ia": task_data.get("confiance_ia", 0.8),
            "source": task_data.get("source", "manual"),
            "type": task_data.get("type", "explicite"),
            "tags": task_data.get("tags", []),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "source_metadata": task_data.get("source_metadata", {}),
            "history": [
                {
                    "action": "created",
                    "timestamp": datetime.now().isoformat(),
                    "details": f"Tâche créée depuis {task_data.get('source', 'manual')}"
                }
            ],
            "comments": []
        }
        
        tasks.append(new_task)
        self.save_all_tasks(tasks)
        return task_id
    
    def get_task_by_id(self, task_id: str) -> Optional[Dict]:
        """Récupérer une tâche par son ID"""
        tasks = self.load_all_tasks()
        for task in tasks:
            if task.get("id") == task_id:
                return task
        return None
    
    def update_task(self, task_id: str, updates: Dict, history_entry: Dict = None) -> Optional[Dict]:
        """Mettre à jour une tâche avec historique avancé"""
        tasks = self.load_all_tasks()
        
        for i, task in enumerate(tasks):
            if task.get("id") == task_id:
                # Mettre à jour les champs
                for key, value in updates.items():
                    if key not in ["id", "created_at"]:  # Champs protégés (history retiré)
                        task[key] = value
                
                # Mettre à jour timestamp automatiquement
                if "updated_at" not in updates:
                    task["updated_at"] = datetime.now().isoformat()
                
                # Ajouter à l'historique (entry personnalisée ou auto)
                if "history" not in task:
                    task["history"] = []
                
                if history_entry:
                    task["history"].append(history_entry)
                else:
                    task["history"].append({
                        "action": "updated",
                        "timestamp": datetime.now().isoformat(),
                        "user": "system",
                        "details": f"Champs modifiés: {', '.join(updates.keys())}"
                    })
                
                tasks[i] = task
                self.save_all_tasks(tasks)
                return task  # Retourner la tâche mise à jour
        
        return None  # Tâche non trouvée
    
    def get_tasks_by_source(self, source: str) -> List[Dict]:
        """Récupérer tâches par source (email/meeting)"""
        tasks = self.load_all_tasks()
        return [task for task in tasks if task.get("source") == source]
    
    def calculate_task_age(self, created_at: str) -> int:
        """Calculer l'âge de la tâche en jours"""
        if not created_at:
            return 0
        try:
            created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            now = datetime.now()
            return (now - created).days
        except:
            return 0
    
    def get_tasks_by_status(self, status: str) -> List[Dict]:
        """Récupérer tâches par statut"""
        tasks = self.load_all_tasks()
        return [task for task in tasks if task.get("statut") == status]
    
    def get_legacy_format_email_tasks(self) -> List[Dict]:
        """
        COMPATIBILITÉ: Retourner tâches emails au format legacy
        Pour préserver la compatibilité avec l'ancien système
        """
        email_tasks = self.get_tasks_by_source("email")
        legacy_tasks = []
        
        for task in email_tasks:
            # Convertir vers ancien format
            legacy_task = {
                "description": task.get("description", ""),
                "responsable": task.get("responsable", ""),
                "priorite": task.get("priorite", "medium"),
                "confiance_ia": task.get("confiance_ia", 0.8),
                "id": task.get("source_metadata", {}).get("email_id", task.get("id")),
                "source": "email",
                "type": task.get("type", "explicite"),
                "extrait_le": task.get("created_at", ""),
                "statut": task.get("statut", "pending"),
                "origine_email": task.get("source_metadata", {}).get("original_email", {})
            }
            
            # Ajouter deadline si présente
            if task.get("deadline"):
                legacy_task["deadline"] = task.get("deadline")
            
            legacy_tasks.append(legacy_task)
        
        return legacy_tasks
    
    def get_legacy_format_meeting_tasks(self) -> List[Dict]:
        """
        COMPATIBILITÉ: Retourner tâches meetings au format legacy
        """
        meeting_tasks = self.get_tasks_by_source("meeting")
        legacy_tasks = []
        
        for task in meeting_tasks:
            metadata = task.get("source_metadata", {})
            
            # Convertir vers ancien format
            legacy_task = {
                "description": task.get("description", ""),
                "responsable": task.get("responsable", ""),
                "deadline": task.get("deadline"),
                "priorite": task.get("priorite", "medium"),
                "meeting_id": metadata.get("meeting_id", ""),
                "meeting_titre": metadata.get("meeting_titre", ""),
                "meeting_date": metadata.get("meeting_date", ""),
                "meeting_participants": metadata.get("meeting_participants", []),
                "source": "meeting",
                "origine_meeting": metadata.get("original_meeting", {})
            }
            
            legacy_tasks.append(legacy_task)
        
        return legacy_tasks
    
    def get_statistics(self) -> Dict:
        """Statistiques sur les tâches"""
        tasks = self.load_all_tasks()
        
        stats = {
            "total_tasks": len(tasks),
            "by_source": {},
            "by_status": {},
            "by_priority": {}
        }
        
        for task in tasks:
            # Par source
            source = task.get("source", "unknown")
            stats["by_source"][source] = stats["by_source"].get(source, 0) + 1
            
            # Par statut
            status = task.get("statut", "unknown")
            stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            
            # Par priorité
            priority = task.get("priorite", "unknown")
            stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
        
        return stats

# Instance globale
unified_task_manager = UnifiedTaskManager()

def get_unified_task_manager():
    """Retourner l'instance du gestionnaire unifié"""
    return unified_task_manager
