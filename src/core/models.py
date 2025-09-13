# -*- coding: utf-8 -*-
"""
📊 MODÈLES DE DONNÉES
==================

Définition des modèles Pydantic pour validation et sérialisation des données.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class EmailInput(BaseModel):
    """Modèle pour les données d'email en entrée."""
    texte: str = Field(..., description="Contenu de l'email", min_length=1)
    expediteur: str = Field(..., description="Adresse email de l'expéditeur")
    destinataire: str = Field(..., description="Adresse email du destinataire")
    objet: str = Field(..., description="Objet de l'email")
    date_reception: str = Field(..., description="Date de réception (YYYY-MM-DD)")
    departement: Optional[str] = Field(None, description="Département (optionnel)")


class TaskResponse(BaseModel):
    """Modèle pour les tâches extraites."""
    id: str
    description: str
    responsable: str
    deadline: str
    priorite: str
    confiance_ia: float
    source: str
    type: str
    statut: str
    extrait_le: str
    origine_email: Dict[str, Any]


class ProcessingResponse(BaseModel):
    """Modèle pour les réponses de traitement."""
    status: str
    mode: str
    optimisations_actives: List[str]
    details: Dict[str, Any]
    message: str
    performance_note: Optional[str] = None


class CacheStats(BaseModel):
    """Modèle pour les statistiques de cache."""
    total_emails_caches: int
    cache_existe: bool
    cache_file_size: Optional[int] = None
    oldest_entry: Optional[str] = None
    newest_entry: Optional[str] = None


class RateLimitStats(BaseModel):
    """Modèle pour les statistiques de rate limiting."""
    remaining_minute: int
    remaining_hour: int
    remaining_day: int
    total_calls_today: int
    calls_per_minute_limit: int
    calls_per_hour_limit: int
    calls_per_day_limit: int


class QueueStats(BaseModel):
    """Modèle pour les statistiques de file d'attente."""
    urgent_count: int
    normal_count: int
    batch_count: int
    total_waiting: int
    emails_processed: int
    average_wait_time: float
    queue_health: str


class SystemHealth(BaseModel):
    """Modèle pour la santé du système."""
    system_status: str
    service_running: bool
    files_status: Dict[str, Dict[str, bool]]
    cache_stats: CacheStats
    rate_limit_stats: Optional[RateLimitStats] = None
    queue_stats: Optional[QueueStats] = None
    timestamp: str


class EmailCacheRequest(BaseModel):
    """Modèle pour vérifier un email dans le cache."""
    texte: str = Field(..., description="Contenu de l'email")
    objet: str = Field("", description="Objet de l'email (optionnel)")


class ProcessingOptions(BaseModel):
    """Modèle pour les options de traitement."""
    use_rate_limiting: bool = Field(False, description="Activer rate limiting")
    use_batch_processing: bool = Field(True, description="Activer batch processing")
    use_cache: bool = Field(True, description="Activer cache anti-doublon")
    use_optimized_prompts: bool = Field(True, description="Activer prompts optimisés")
