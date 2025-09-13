# -*- coding: utf-8 -*-
"""
🚦 RATE LIMITER - Contrôle des appels IA
Limite le nombre d'appels OpenRouter par minute/heure pour éviter la surcharge
"""

import time
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional

class RateLimiter:
    """
    Gestionnaire de limitation de débit pour les appels IA.
    Contrôle le nombre d'appels par minute et par heure.
    """
    
    def __init__(self, 
                 calls_per_minute: int = 50, 
                 calls_per_hour: int = 1000,
                 calls_per_day: int = 10000):
        """
        Initialise le rate limiter avec les limites configurées.
        
        Args:
            calls_per_minute: Limite d'appels par minute (défaut: 50)
            calls_per_hour: Limite d'appels par heure (défaut: 1000) 
            calls_per_day: Limite d'appels par jour (défaut: 10000)
        """
        self.calls_per_minute = calls_per_minute
        self.calls_per_hour = calls_per_hour
        self.calls_per_day = calls_per_day
        
        # Historique des appels (timestamp)
        self.call_history: List[datetime] = []
        
        # Fichier de persistance pour garder l'historique entre redémarrages
        self.history_file = "rate_limiter_history.json"
        
        # Charger l'historique existant
        self._load_history()
        
        print(f"🚦 Rate Limiter initialisé:")
        print(f"   📊 Limite/minute: {calls_per_minute}")
        print(f"   📊 Limite/heure: {calls_per_hour}")
        print(f"   📊 Limite/jour: {calls_per_day}")
    
    def can_make_call(self) -> bool:
        """
        Vérifie si un appel IA peut être effectué maintenant.
        
        Returns:
            bool: True si l'appel est autorisé, False sinon
        """
        # Nettoyer l'historique ancien
        self._cleanup_history()
        
        # Compter les appels dans chaque période
        calls_last_minute = self._count_calls_in_period(60)
        calls_last_hour = self._count_calls_in_period(3600)
        calls_last_day = self._count_calls_in_period(86400)
        
        # Vérifier toutes les limites
        minute_ok = calls_last_minute < self.calls_per_minute
        hour_ok = calls_last_hour < self.calls_per_hour
        day_ok = calls_last_day < self.calls_per_day
        
        return minute_ok and hour_ok and day_ok
    
    def register_call(self) -> None:
        """
        Enregistre qu'un appel IA a été effectué.
        """
        now = datetime.now()
        self.call_history.append(now)
        
        # Sauvegarder l'historique
        self._save_history()
        
        # Nettoyer périodiquement
        if len(self.call_history) % 10 == 0:
            self._cleanup_history()
    
    def wait_if_needed(self) -> float:
        """
        Attend le temps nécessaire si les limites sont atteintes.
        
        Returns:
            float: Temps d'attente en secondes
        """
        if self.can_make_call():
            return 0.0
        
        wait_time = self._calculate_wait_time()
        
        if wait_time > 0:
            print(f"🚦 Rate limit atteint - Attente {wait_time:.1f}s...")
            time.sleep(wait_time)
        
        return wait_time
    
    def get_current_stats(self) -> Dict:
        """
        Retourne les statistiques actuelles du rate limiter.
        
        Returns:
            Dict: Statistiques détaillées
        """
        self._cleanup_history()
        
        calls_last_minute = self._count_calls_in_period(60)
        calls_last_hour = self._count_calls_in_period(3600)
        calls_last_day = self._count_calls_in_period(86400)
        
        return {
            "calls_last_minute": calls_last_minute,
            "calls_last_hour": calls_last_hour,
            "calls_last_day": calls_last_day,
            "limits": {
                "per_minute": self.calls_per_minute,
                "per_hour": self.calls_per_hour,
                "per_day": self.calls_per_day
            },
            "remaining": {
                "minute": max(0, self.calls_per_minute - calls_last_minute),
                "hour": max(0, self.calls_per_hour - calls_last_hour),
                "day": max(0, self.calls_per_day - calls_last_day)
            },
            "can_make_call": self.can_make_call(),
            "total_calls_today": calls_last_day,
            "last_call": self.call_history[-1].isoformat() if self.call_history else None
        }
    
    def _count_calls_in_period(self, seconds: int) -> int:
        """
        Compte les appels dans une période donnée.
        
        Args:
            seconds: Période en secondes
            
        Returns:
            int: Nombre d'appels dans la période
        """
        if not self.call_history:
            return 0
        
        cutoff_time = datetime.now() - timedelta(seconds=seconds)
        return sum(1 for call_time in self.call_history if call_time >= cutoff_time)
    
    def _calculate_wait_time(self) -> float:
        """
        Calcule le temps d'attente nécessaire.
        
        Returns:
            float: Temps d'attente en secondes
        """
        if not self.call_history:
            return 0.0
        
        now = datetime.now()
        
        # Calculer le temps d'attente pour chaque limite
        wait_times = []
        
        # Limite par minute
        minute_calls = [t for t in self.call_history if (now - t).total_seconds() <= 60]
        if len(minute_calls) >= self.calls_per_minute:
            oldest_in_minute = min(minute_calls)
            wait_time_minute = 61 - (now - oldest_in_minute).total_seconds()
            if wait_time_minute > 0:
                wait_times.append(wait_time_minute)
        
        # Limite par heure
        hour_calls = [t for t in self.call_history if (now - t).total_seconds() <= 3600]
        if len(hour_calls) >= self.calls_per_hour:
            oldest_in_hour = min(hour_calls)
            wait_time_hour = 3601 - (now - oldest_in_hour).total_seconds()
            if wait_time_hour > 0:
                wait_times.append(wait_time_hour)
        
        # Retourner le temps d'attente maximum
        return max(wait_times) if wait_times else 0.0
    
    def _cleanup_history(self) -> None:
        """
        Nettoie l'historique en supprimant les entrées anciennes.
        """
        if not self.call_history:
            return
        
        # Garder seulement les appels des dernières 24h
        cutoff_time = datetime.now() - timedelta(days=1)
        self.call_history = [t for t in self.call_history if t >= cutoff_time]
    
    def _save_history(self) -> None:
        """
        Sauvegarde l'historique des appels dans un fichier.
        """
        try:
            history_data = {
                "call_history": [t.isoformat() for t in self.call_history[-100:]],  # Garder les 100 derniers
                "last_update": datetime.now().isoformat()
            }
            
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(history_data, f, indent=2, ensure_ascii=False)
        
        except Exception as e:
            print(f"⚠️ Erreur sauvegarde historique rate limiter: {e}")
    
    def _load_history(self) -> None:
        """
        Charge l'historique des appels depuis le fichier.
        """
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, "r", encoding="utf-8") as f:
                    history_data = json.load(f)
                
                # Convertir les timestamps en datetime
                self.call_history = [
                    datetime.fromisoformat(t) 
                    for t in history_data.get("call_history", [])
                ]
                
                # Nettoyer immédiatement
                self._cleanup_history()
                
                print(f"📊 Historique rate limiter chargé: {len(self.call_history)} appels récents")
        
        except Exception as e:
            print(f"⚠️ Erreur chargement historique rate limiter: {e}")
            self.call_history = []


def creer_rate_limiter_personnalise(config: Optional[Dict] = None) -> RateLimiter:
    """
    Crée un rate limiter avec configuration personnalisée.
    
    Args:
        config: Configuration optionnelle
        
    Returns:
        RateLimiter: Instance configurée
    """
    if config is None:
        config = {}
    
    return RateLimiter(
        calls_per_minute=config.get("calls_per_minute", 50),
        calls_per_hour=config.get("calls_per_hour", 1000),
        calls_per_day=config.get("calls_per_day", 10000)
    )


# Configuration par défaut pour production
RATE_LIMITER_CONFIG_PRODUCTION = {
    "calls_per_minute": 30,    # Conservateur pour production
    "calls_per_hour": 800,     # Limite horaire sécurisée
    "calls_per_day": 5000      # Limite quotidienne raisonnable
}

# Configuration pour développement
RATE_LIMITER_CONFIG_DEV = {
    "calls_per_minute": 100,   # Plus permissif pour tests
    "calls_per_hour": 2000,
    "calls_per_day": 10000
}


if __name__ == "__main__":
    # Test du rate limiter
    print("🧪 Test du Rate Limiter...")
    
    limiter = RateLimiter(calls_per_minute=3, calls_per_hour=10, calls_per_day=50)
    
    # Simuler quelques appels
    for i in range(5):
        if limiter.can_make_call():
            print(f"✅ Appel {i+1} autorisé")
            limiter.register_call()
        else:
            print(f"🚫 Appel {i+1} refusé - limite atteinte")
            wait_time = limiter.wait_if_needed()
            print(f"⏱️ Attente de {wait_time:.1f}s")
    
    # Afficher les stats
    stats = limiter.get_current_stats()
    print(f"📊 Stats finales: {stats}")
