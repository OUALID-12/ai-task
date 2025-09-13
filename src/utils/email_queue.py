# -*- coding: utf-8 -*-
"""
📋 EMAIL QUEUE - Système de file d'attente intelligent
Gère les emails par priorité avec statistiques avancées
"""

import json
import os
from datetime import datetime, timedelta
from collections import deque
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict


@dataclass
class QueuedEmail:
    """Représente un email en file d'attente avec métadonnées."""
    email_data: Dict[str, Any]
    priority: str  # "urgent", "normal", "batch"
    queued_at: datetime
    estimated_processing_time: Optional[datetime] = None
    queue_position: Optional[int] = None


class EmailQueue:
    """
    Gestionnaire de file d'attente intelligente pour emails.
    Traite par priorité avec statistiques et monitoring.
    """
    
    def __init__(self, max_queue_size: int = 1000):
        """
        Initialise la file d'attente.
        
        Args:
            max_queue_size: Taille maximum de la file d'attente
        """
        self.max_queue_size = max_queue_size
        
        # Files d'attente par priorité
        self.urgent_queue: deque = deque()
        self.normal_queue: deque = deque()
        self.batch_queue: deque = deque()
        
        # Historique des traitements
        self.processing_history: List[Dict] = []
        
        # Statistiques
        self.stats = {
            "total_processed": 0,
            "total_queued": 0,
            "total_urgent": 0,
            "total_normal": 0,
            "total_batch": 0,
            "average_wait_time": 0.0,
            "max_wait_time": 0.0,
            "created_at": datetime.now()
        }
        
        # Fichier de persistance
        self.queue_file = "email_queue_backup.json"
        
        print(f"📋 Email Queue initialisée (taille max: {max_queue_size})")
    
    def add_email(self, email: Dict[str, Any], priority: str = "normal") -> bool:
        """
        Ajoute un email à la file d'attente.
        
        Args:
            email: Données de l'email
            priority: Priorité ("urgent", "normal", "batch")
            
        Returns:
            bool: True si ajouté avec succès, False si file pleine
        """
        # Vérifier la taille de la file
        if self.get_total_queue_size() >= self.max_queue_size:
            print(f"🚫 File d'attente pleine ({self.max_queue_size} emails)")
            return False
        
        # Créer l'objet email en file
        queued_email = QueuedEmail(
            email_data=email,
            priority=priority,
            queued_at=datetime.now()
        )
        
        # Ajouter à la bonne file selon priorité
        if priority == "urgent":
            self.urgent_queue.append(queued_email)
            self.stats["total_urgent"] += 1
        elif priority == "normal":
            self.normal_queue.append(queued_email)
            self.stats["total_normal"] += 1
        else:  # batch
            self.batch_queue.append(queued_email)
            self.stats["total_batch"] += 1
        
        self.stats["total_queued"] += 1
        
        # Calculer position et temps estimé
        self._update_queue_positions()
        
        print(f"📧 Email ajouté en file ({priority}) - Position: {queued_email.queue_position}")
        return True
    
    def get_next_email(self) -> Optional[Dict[str, Any]]:
        """
        Récupère le prochain email à traiter selon la priorité.
        
        Returns:
            Dict: Email à traiter ou None si file vide
        """
        queued_email = None
        
        # Priorité: urgent > normal > batch
        if self.urgent_queue:
            queued_email = self.urgent_queue.popleft()
        elif self.normal_queue:
            queued_email = self.normal_queue.popleft()
        elif self.batch_queue:
            queued_email = self.batch_queue.popleft()
        
        if queued_email is None:
            return None
        
        # Calculer le temps d'attente
        wait_time = (datetime.now() - queued_email.queued_at).total_seconds()
        
        # Mettre à jour les statistiques
        self.stats["total_processed"] += 1
        self._update_wait_time_stats(wait_time)
        
        # Ajouter à l'historique
        self.processing_history.append({
            "email_id": queued_email.email_data.get("id", "unknown"),
            "priority": queued_email.priority,
            "wait_time": wait_time,
            "processed_at": datetime.now().isoformat(),
            "queued_at": queued_email.queued_at.isoformat()
        })
        
        # Nettoyer l'historique si trop grand
        if len(self.processing_history) > 100:
            self.processing_history = self.processing_history[-50:]
        
        # Mettre à jour les positions
        self._update_queue_positions()
        
        print(f"🔄 Email récupéré ({queued_email.priority}) - Attente: {wait_time:.1f}s")
        return queued_email.email_data
    
    def get_queue_stats(self) -> Dict[str, Any]:
        """
        Retourne les statistiques détaillées de la file d'attente.
        
        Returns:
            Dict: Statistiques complètes
        """
        current_stats = {
            "current_queue": {
                "urgent_count": len(self.urgent_queue),
                "normal_count": len(self.normal_queue),
                "batch_count": len(self.batch_queue),
                "total_waiting": self.get_total_queue_size()
            },
            "overall_stats": self.stats.copy(),
            "estimated_wait_times": self._calculate_estimated_wait_times(),
            "processing_rate": self._calculate_processing_rate(),
            "queue_health": self._assess_queue_health()
        }
        
        return current_stats
    
    def get_total_queue_size(self) -> int:
        """
        Retourne la taille totale de la file d'attente.
        
        Returns:
            int: Nombre total d'emails en attente
        """
        return len(self.urgent_queue) + len(self.normal_queue) + len(self.batch_queue)
    
    def peek_next_emails(self, count: int = 5) -> List[Dict[str, Any]]:
        """
        Regarde les prochains emails sans les retirer de la file.
        
        Args:
            count: Nombre d'emails à regarder
            
        Returns:
            List: Liste des prochains emails
        """
        preview = []
        
        # Combiner toutes les files selon priorité
        all_emails = (
            list(self.urgent_queue) +
            list(self.normal_queue) +
            list(self.batch_queue)
        )
        
        for i, queued_email in enumerate(all_emails[:count]):
            preview.append({
                "position": i + 1,
                "priority": queued_email.priority,
                "email_id": queued_email.email_data.get("id", "unknown"),
                "email_subject": queued_email.email_data.get("objet", "Sans objet"),
                "queued_at": queued_email.queued_at.isoformat(),
                "wait_time": (datetime.now() - queued_email.queued_at).total_seconds()
            })
        
        return preview
    
    def clear_queue(self, priority: Optional[str] = None) -> int:
        """
        Vide la file d'attente.
        
        Args:
            priority: Priorité spécifique à vider (None = toutes)
            
        Returns:
            int: Nombre d'emails supprimés
        """
        removed_count = 0
        
        if priority is None or priority == "urgent":
            removed_count += len(self.urgent_queue)
            self.urgent_queue.clear()
        
        if priority is None or priority == "normal":
            removed_count += len(self.normal_queue)
            self.normal_queue.clear()
        
        if priority is None or priority == "batch":
            removed_count += len(self.batch_queue)
            self.batch_queue.clear()
        
        print(f"🗑️ File d'attente vidée: {removed_count} emails supprimés")
        return removed_count
    
    def promote_email(self, email_id: str, new_priority: str = "urgent") -> bool:
        """
        Change la priorité d'un email dans la file.
        
        Args:
            email_id: ID de l'email à promouvoir
            new_priority: Nouvelle priorité
            
        Returns:
            bool: True si trouvé et modifié
        """
        # Chercher dans toutes les files
        for queue_name, queue in [
            ("normal", self.normal_queue),
            ("batch", self.batch_queue),
            ("urgent", self.urgent_queue)
        ]:
            for i, queued_email in enumerate(queue):
                if queued_email.email_data.get("id") == email_id:
                    # Retirer de la file actuelle
                    removed_email = queue[i]
                    del queue[i]
                    
                    # Changer la priorité
                    removed_email.priority = new_priority
                    
                    # Remettre dans la bonne file
                    if new_priority == "urgent":
                        self.urgent_queue.append(removed_email)
                    elif new_priority == "normal":
                        self.normal_queue.append(removed_email)
                    else:
                        self.batch_queue.append(removed_email)
                    
                    self._update_queue_positions()
                    print(f"⬆️ Email {email_id} promu de {queue_name} vers {new_priority}")
                    return True
        
        return False
    
    def save_queue_state(self) -> bool:
        """
        Sauvegarde l'état de la file d'attente.
        
        Returns:
            bool: True si sauvegarde réussie
        """
        try:
            state = {
                "urgent_queue": [self._serialize_queued_email(e) for e in self.urgent_queue],
                "normal_queue": [self._serialize_queued_email(e) for e in self.normal_queue],
                "batch_queue": [self._serialize_queued_email(e) for e in self.batch_queue],
                "stats": self.stats,
                "processing_history": self.processing_history[-20:],  # Garder les 20 derniers
                "saved_at": datetime.now().isoformat()
            }
            
            with open(self.queue_file, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2, ensure_ascii=False)
            
            return True
        
        except Exception as e:
            print(f"⚠️ Erreur sauvegarde file d'attente: {e}")
            return False
    
    def load_queue_state(self) -> bool:
        """
        Charge l'état de la file d'attente.
        
        Returns:
            bool: True si chargement réussi
        """
        try:
            if not os.path.exists(self.queue_file):
                return False
            
            with open(self.queue_file, "r", encoding="utf-8") as f:
                state = json.load(f)
            
            # Restaurer les files
            self.urgent_queue = deque([self._deserialize_queued_email(e) for e in state.get("urgent_queue", [])])
            self.normal_queue = deque([self._deserialize_queued_email(e) for e in state.get("normal_queue", [])])
            self.batch_queue = deque([self._deserialize_queued_email(e) for e in state.get("batch_queue", [])])
            
            # Restaurer les stats
            self.stats.update(state.get("stats", {}))
            self.processing_history = state.get("processing_history", [])
            
            total_restored = len(self.urgent_queue) + len(self.normal_queue) + len(self.batch_queue)
            print(f"📋 File d'attente restaurée: {total_restored} emails")
            
            return True
        
        except Exception as e:
            print(f"⚠️ Erreur chargement file d'attente: {e}")
            return False
    
    def _update_queue_positions(self) -> None:
        """Met à jour les positions dans les files d'attente."""
        position = 1
        
        # Positions pour urgents
        for email in self.urgent_queue:
            email.queue_position = position
            position += 1
        
        # Positions pour normaux
        for email in self.normal_queue:
            email.queue_position = position
            position += 1
        
        # Positions pour batch
        for email in self.batch_queue:
            email.queue_position = position
            position += 1
    
    def _update_wait_time_stats(self, wait_time: float) -> None:
        """Met à jour les statistiques de temps d'attente."""
        if self.stats["total_processed"] == 1:
            self.stats["average_wait_time"] = wait_time
        else:
            # Moyenne mobile
            total = self.stats["total_processed"]
            current_avg = self.stats["average_wait_time"]
            self.stats["average_wait_time"] = ((current_avg * (total - 1)) + wait_time) / total
        
        # Max wait time
        if wait_time > self.stats["max_wait_time"]:
            self.stats["max_wait_time"] = wait_time
    
    def _calculate_estimated_wait_times(self) -> Dict[str, float]:
        """Calcule les temps d'attente estimés."""
        # Estimation basée sur le taux de traitement moyen
        avg_processing_time = 2.0  # 2 secondes par email en moyenne
        
        return {
            "urgent_queue": len(self.urgent_queue) * avg_processing_time,
            "normal_queue": (len(self.urgent_queue) + len(self.normal_queue)) * avg_processing_time,
            "batch_queue": self.get_total_queue_size() * avg_processing_time
        }
    
    def _calculate_processing_rate(self) -> Dict[str, float]:
        """Calcule le taux de traitement."""
        if not self.processing_history:
            return {"emails_per_minute": 0.0, "emails_per_hour": 0.0}
        
        # Calculer sur les 10 derniers traitements
        recent_history = self.processing_history[-10:]
        if len(recent_history) < 2:
            return {"emails_per_minute": 0.0, "emails_per_hour": 0.0}
        
        first_time = datetime.fromisoformat(recent_history[0]["processed_at"])
        last_time = datetime.fromisoformat(recent_history[-1]["processed_at"])
        
        time_diff = (last_time - first_time).total_seconds()
        if time_diff <= 0:
            return {"emails_per_minute": 0.0, "emails_per_hour": 0.0}
        
        emails_per_second = len(recent_history) / time_diff
        
        return {
            "emails_per_minute": emails_per_second * 60,
            "emails_per_hour": emails_per_second * 3600
        }
    
    def _assess_queue_health(self) -> Dict[str, Any]:
        """Évalue la santé de la file d'attente."""
        total_size = self.get_total_queue_size()
        
        # Indicateurs de santé
        health_score = 100
        warnings = []
        
        if total_size > self.max_queue_size * 0.8:
            health_score -= 30
            warnings.append("File d'attente presque pleine")
        
        if self.stats["max_wait_time"] > 300:  # 5 minutes
            health_score -= 20
            warnings.append("Temps d'attente élevé détecté")
        
        if len(self.urgent_queue) > 20:
            health_score -= 25
            warnings.append("Trop d'emails urgents en attente")
        
        return {
            "health_score": max(0, health_score),
            "status": "healthy" if health_score >= 80 else ("warning" if health_score >= 50 else "critical"),
            "warnings": warnings,
            "queue_utilization": (total_size / self.max_queue_size) * 100
        }
    
    def _serialize_queued_email(self, queued_email: QueuedEmail) -> Dict:
        """Sérialise un email en file pour sauvegarde."""
        return {
            "email_data": queued_email.email_data,
            "priority": queued_email.priority,
            "queued_at": queued_email.queued_at.isoformat(),
            "queue_position": queued_email.queue_position
        }
    
    def _deserialize_queued_email(self, data: Dict) -> QueuedEmail:
        """Désérialise un email en file depuis sauvegarde."""
        return QueuedEmail(
            email_data=data["email_data"],
            priority=data["priority"],
            queued_at=datetime.fromisoformat(data["queued_at"]),
            queue_position=data.get("queue_position")
        )


def detecter_priorite_email_pour_queue(email: Dict[str, Any]) -> str:
    """
    Détecte la priorité d'un email pour la file d'attente.
    
    Args:
        email: Données de l'email
        
    Returns:
        str: Priorité ("urgent", "normal", "batch")
    """
    texte = email.get("texte", "").lower()
    objet = email.get("objet", "").lower()
    
    # Mots-clés urgents
    mots_urgents = [
        "urgent", "asap", "critique", "panne", "bug", "erreur", 
        "down", "help", "emergency", "critical", "immédiat",
        "problème", "incident", "alerte"
    ]
    
    # Vérifier urgence
    for mot in mots_urgents:
        if mot in texte or mot in objet:
            return "urgent"
    
    # Mots-clés pour batch (moins prioritaire)
    mots_batch = [
        "rapport", "statistique", "hebdomadaire", "mensuel",
        "backup", "archivage", "nettoyage", "maintenance"
    ]
    
    for mot in mots_batch:
        if mot in texte or mot in objet:
            return "batch"
    
    # Par défaut : normal
    return "normal"


if __name__ == "__main__":
    # Test de la file d'attente
    print("🧪 Test de la Email Queue...")
    
    queue = EmailQueue(max_queue_size=10)
    
    # Ajouter quelques emails de test
    test_emails = [
        {"id": "1", "objet": "Rapport mensuel", "texte": "Voici le rapport"},
        {"id": "2", "objet": "URGENT: Panne serveur", "texte": "Le serveur est down"},
        {"id": "3", "objet": "Demande info", "texte": "Pouvez-vous m'aider?"},
        {"id": "4", "objet": "CRITIQUE: Bug production", "texte": "Bug critique détecté"}
    ]
    
    # Ajouter à la file avec détection de priorité
    for email in test_emails:
        priority = detecter_priorite_email_pour_queue(email)
        queue.add_email(email, priority)
        print(f"📧 {email['objet']} → {priority}")
    
    # Traiter quelques emails
    print("\n🔄 Traitement des emails:")
    for i in range(3):
        email = queue.get_next_email()
        if email:
            print(f"✅ Traité: {email['objet']}")
    
    # Afficher les stats
    stats = queue.get_queue_stats()
    print(f"\n📊 Stats: {stats['current_queue']}")
