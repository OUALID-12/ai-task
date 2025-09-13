# -*- coding: utf-8 -*-
"""
Utility functions for AI Task Extraction System
"""

import json
import os
import re
import unicodedata
from datetime import datetime
from typing import List, Dict, Any
from config import LOG_FILE

def est_doublon(nouvelle_tache, anciennes_taches):
    """Vérifie si une tâche est déjà présente"""
    for t in anciennes_taches:
        if (t["description"].strip().lower() == nouvelle_tache["description"].strip().lower() and
            t["responsable"].strip().lower() == nouvelle_tache["responsable"].strip().lower()):
            return True
    return False

def ecrire_log(email_objet, statut, resultat_ia, nb_taches=0, erreur=None):
    """Écrire un log d'événement"""
    horodatage = datetime.now().isoformat(timespec='seconds')
    log_entree = {
        "horodatage": horodatage,
        "email_objet": email_objet,
        "statut": statut,
        "resultat_ia_brut": resultat_ia
    }
    if statut == "succès":
        log_entree["taches_extraites"] = nb_taches
    if erreur:
        log_entree["erreur"] = erreur

    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
    except:
        logs = []

    logs.append(log_entree)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)

def normalize_filter_value(field, value):
    """
    🔧 Normalise les valeurs de filtre pour accepter les variantes
    Solution simple pour filtrage intelligent
    """
    if not value:
        return ""

    value_lower = value.lower().strip()

    # Mappings pour filtrage intelligent
    STATUS_MAPPING = {
        "à faire": "pending",
        "a faire": "pending",
        "en cours": "in_progress",
        "en_cours": "in_progress",
        "terminé": "completed",
        "termine": "completed",
        "fini": "completed",
        "annulé": "cancelled",
        "annule": "cancelled"
    }

    PRIORITY_MAPPING = {
        "haute": "high",
        "elevé": "high",
        "élevé": "high",
        "urgent": "high",
        "moyenne": "medium",
        "normale": "medium",
        "normal": "medium",
        "moyen": "medium",
        "critique": "critical",
        "prioritaire": "critical",
        "basse": "low",
        "faible": "low",
        "bas": "low"
    }

    if field == "status":
        return STATUS_MAPPING.get(value_lower, value_lower)
    elif field == "priority":
        return PRIORITY_MAPPING.get(value_lower, value_lower)
    else:
        return value_lower

def smart_filter_match(task_value, filter_value, field_type):
    """
    🧠 Comparaison intelligente pour le filtrage
    Accepte les variantes de valeurs
    """
    if not task_value or not filter_value:
        return False

    # Normaliser les deux valeurs
    normalized_task = normalize_filter_value(field_type, task_value)
    normalized_filter = normalize_filter_value(field_type, filter_value)

    return normalized_task == normalized_filter

def parse_date_string(date_str):
    """
    📅 Parse une date en format YYYY-MM-DD ou ISO
    Retourne None si parsing échoue
    """
    if not date_str or date_str == "null":
        return None

    try:
        # Essayer format YYYY-MM-DD
        if len(date_str) == 10 and date_str.count('-') == 2:
            return datetime.strptime(date_str, "%Y-%m-%d")

        # Essayer format ISO complet
        if 'T' in date_str:
            # Enlever les microsecondes si présentes
            if '.' in date_str:
                date_str = date_str.split('.')[0]
            return datetime.fromisoformat(date_str.replace('Z', ''))

        return None
    except:
        return None

def filter_by_date_range(tasks, deadline_before=None, deadline_after=None, created_after=None, created_before=None):
    """
    📅 Filtrer les tâches par plages de dates
    """
    if not (deadline_before or deadline_after or created_after or created_before):
        return tasks

    filtered_tasks = []

    for task in tasks:
        include_task = True

        # Filtres deadline
        if deadline_before or deadline_after:
            task_deadline = parse_date_string(task.get('deadline'))

            if deadline_before:
                deadline_before_date = parse_date_string(deadline_before)
                if deadline_before_date and task_deadline:
                    if task_deadline >= deadline_before_date:
                        include_task = False
                elif deadline_before_date and not task_deadline:
                    # Si filter deadline_before mais task sans deadline, inclure
                    pass

            if deadline_after and include_task:
                deadline_after_date = parse_date_string(deadline_after)
                if deadline_after_date and task_deadline:
                    if task_deadline <= deadline_after_date:
                        include_task = False
                elif deadline_after_date and not task_deadline:
                    # Si filter deadline_after mais task sans deadline, exclure
                    include_task = False

        # Filtres created_at
        if (created_after or created_before) and include_task:
            task_created = parse_date_string(task.get('created_at'))

            if created_after:
                created_after_date = parse_date_string(created_after)
                if created_after_date and task_created:
                    if task_created <= created_after_date:
                        include_task = False

            if created_before and include_task:
                created_before_date = parse_date_string(created_before)
                if created_before_date and task_created:
                    if task_created >= created_before_date:
                        include_task = False

        if include_task:
            filtered_tasks.append(task)

    return filtered_tasks

def filter_by_source(tasks, source):
    """
    📨 Filtrer les tâches par source (email, meeting)
    """
    if not source:
        return tasks

    source_lower = source.lower().strip()
    return [task for task in tasks if task.get('source', '').lower() == source_lower]

def extract_department_from_task(task):
    """
    🏢 Extraire le département d'une tâche depuis les métadonnées
    """
    metadata = task.get('source_metadata', {})

    # Pour les emails
    if 'original_email' in metadata:
        email_data = metadata['original_email']

        if isinstance(email_data, dict) and 'departement' in email_data:
            dept = email_data['departement']

            if isinstance(dept, dict) and 'nom' in dept:
                return dept['nom']
            elif isinstance(dept, str):
                return dept

    # Pour les meetings
    if 'meeting' in metadata or task.get('origine_meeting'):
        meeting_data = task.get('origine_meeting', {})
        dept = meeting_data.get('departement')
        if dept:
            return dept

    return None

def filter_by_department(tasks, department):
    """
    🏢 Filtrer les tâches par département
    """
    if not department:
        return tasks

    department_lower = department.lower().strip()
    filtered_tasks = []

    for task in tasks:
        task_dept = extract_department_from_task(task)
        if task_dept and department_lower in task_dept.lower():
            filtered_tasks.append(task)

    return filtered_tasks

def normalize_text_for_search(text):
    """
    🔤 Normalise le texte pour la recherche (accents, casse, etc.)
    """
    if not text:
        return ""

    # Convertir en minuscules
    text = text.lower()

    # Supprimer les accents
    text = unicodedata.normalize('NFD', text)
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')

    # Nettoyer les caractères spéciaux (garder espaces, lettres, chiffres)
    text = re.sub(r'[^\w\s]', ' ', text)

    # Normaliser les espaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text

def search_in_text(text, query):
    """
    🔍 Recherche simple dans un texte
    Retourne True si le query est trouvé
    """
    if not text or not query:
        return False

    normalized_text = normalize_text_for_search(text)
    normalized_query = normalize_text_for_search(query)

    return normalized_query in normalized_text

def search_in_task_fields(task, query, search_fields=['description']):
    """
    🔍 Recherche dans les champs spécifiés d'une tâche

    search_fields options:
    - ['description'] : recherche uniquement dans description
    - ['responsable'] : recherche uniquement dans responsable
    - ['description', 'responsable'] : recherche dans les deux
    - ['all'] : recherche dans tous les champs textuels
    """
    if not query:
        return False

    # Définir tous les champs de recherche possibles
    all_searchable_fields = {
        'description': task.get('description', ''),
        'responsable': task.get('responsable', ''),
        'statut': task.get('statut', ''),
        'priorite': task.get('priorite', ''),
        'type': task.get('type', ''),
        'deadline': str(task.get('deadline', ''))
    }

    # Ajouter métadonnées emails si disponibles
    metadata = task.get('source_metadata', {})
    if 'original_email' in metadata:
        email_data = metadata['original_email']
        if isinstance(email_data, dict):
            all_searchable_fields.update({
                'email_objet': email_data.get('objet', ''),
                'email_expediteur': email_data.get('expediteur', ''),
                'email_destinataire': email_data.get('destinataire', ''),
                'email_resume': email_data.get('resume_contenu', '')
            })

    # Déterminer les champs à rechercher
    if 'all' in search_fields:
        fields_to_search = all_searchable_fields
    else:
        fields_to_search = {k: v for k, v in all_searchable_fields.items() if k in search_fields}

    # Rechercher dans chaque champ
    for field_name, field_value in fields_to_search.items():
        if search_in_text(field_value, query):
            return True

    return False

def filter_by_search(tasks, search_query, search_in=['description']):
    """
    🔍 Filtrer les tâches par recherche textuelle

    Args:
        tasks: Liste des tâches
        search_query: Terme de recherche
        search_in: Liste des champs où chercher

    Returns:
        Liste des tâches correspondantes
    """
    if not search_query:
        return tasks

    filtered_tasks = []
    for task in tasks:
        if search_in_task_fields(task, search_query, search_in):
            filtered_tasks.append(task)

    return filtered_tasks

def get_search_highlights(task, query, max_length=100):
    """
    🔍 Obtenir des extraits avec mise en évidence des termes recherchés
    """
    if not query:
        return ""

    description = task.get('description', '')
    if not description:
        return ""

    normalized_desc = normalize_text_for_search(description)
    normalized_query = normalize_text_for_search(query)

    # Trouver la position du terme
    pos = normalized_desc.find(normalized_query)
    if pos == -1:
        return description[:max_length] + "..." if len(description) > max_length else description

    # Créer un extrait autour du terme trouvé
    start = max(0, pos - 30)
    end = min(len(description), pos + len(query) + 30)

    excerpt = description[start:end]
    if start > 0:
        excerpt = "..." + excerpt
    if end < len(description):
        excerpt = excerpt + "..."

    return excerpt

def sort_tasks(tasks, sort_by=None, order="asc"):
    """
    📈 Trier les tâches par champ spécifié

    Args:
        tasks: Liste des tâches
        sort_by: Champ de tri (priority, deadline, created_at, status, responsable, description)
        order: Ordre (asc ou desc)

    Returns:
        Liste des tâches triées
    """
    if not sort_by or not tasks:
        return tasks

    reverse = (order.lower() == "desc")

    try:
        # Tri par priorité avec ordre logique
        if sort_by == "priority":
            priority_order = {"high": 3, "medium": 2, "low": 1, "": 0}
            return sorted(tasks,
                         key=lambda x: priority_order.get(x.get("priorite", "").lower(), 0),
                         reverse=reverse)

        # Tri par statut avec ordre logique
        elif sort_by == "status":
            status_order = {"pending": 4, "in_progress": 3, "completed": 2, "cancelled": 1, "": 0}
            return sorted(tasks,
                         key=lambda x: status_order.get(x.get("statut", "").lower(), 0),
                         reverse=reverse)

        # Tri par date (deadline, created_at)
        elif sort_by in ["deadline", "created_at"]:
            field_name = "echeance" if sort_by == "deadline" else "date_creation"
            return sorted(tasks,
                         key=lambda x: x.get(field_name, "") or "9999-12-31",
                         reverse=reverse)

        # Tri alphabétique (responsable, description)
        elif sort_by in ["responsable", "description"]:
            return sorted(tasks,
                         key=lambda x: str(x.get(sort_by, "")).lower(),
                         reverse=reverse)

        # Tri par source
        elif sort_by == "source":
            return sorted(tasks,
                         key=lambda x: x.get("source", ""),
                         reverse=reverse)

        # Champ non supporté
        else:
            return tasks

    except Exception as e:
        print(f"Erreur tri: {e}")
        return tasks

def sort_by_relevance(tasks, search_term):
    """
    🎯 Trier les tâches par pertinence de recherche

    Args:
        tasks: Liste des tâches
        search_term: Terme de recherche pour calculer la pertinence

    Returns:
        Liste des tâches triées par pertinence (plus pertinentes d'abord)
    """
    if not search_term or not tasks:
        return tasks

    def calculate_relevance_score(task):
        """Calculer le score de pertinence d'une tâche"""
        score = 0
        search_normalized = normalize_text_for_search(search_term)

        # Score description (poids 5 - plus important)
        description = normalize_text_for_search(task.get("description", ""))
        if search_normalized in description:
            score += 5
            # Bonus si le terme est au début
            if description.startswith(search_normalized):
                score += 2

        # Score responsable (poids 3)
        responsable = normalize_text_for_search(task.get("responsable", ""))
        if search_normalized in responsable:
            score += 3

        # Score autres champs (poids 1 chacun)
        for field in ["source", "department", "priorite", "statut"]:
            field_value = normalize_text_for_search(str(task.get(field, "")))
            if search_normalized in field_value:
                score += 1

        # Score métadonnées email (poids 2)
        metadata = task.get('source_metadata', {})
        if 'original_email' in metadata:
            email_data = metadata['original_email']
            if isinstance(email_data, dict):
                for email_field in ['objet', 'expediteur', 'resume_contenu']:
                    email_value = normalize_text_for_search(str(email_data.get(email_field, "")))
                    if search_normalized in email_value:
                        score += 2

        return score

    try:
        return sorted(tasks, key=calculate_relevance_score, reverse=True)
    except Exception as e:
        print(f"Erreur tri pertinence: {e}")
        return tasks

def paginate_tasks(tasks, page=1, limit=20):
    """
    📄 Paginer la liste des tâches

    Args:
        tasks: Liste des tâches
        page: Numéro de page (commence à 1)
        limit: Nombre d'éléments par page

    Returns:
        Dict avec tâches paginées et métadonnées pagination
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    if limit > 100:  # Limite de sécurité
        limit = 100

    total_tasks = len(tasks)
    total_pages = math.ceil(total_tasks / limit) if total_tasks > 0 else 1

    # Calculer les indices de début et fin
    start_index = (page - 1) * limit
    end_index = start_index + limit

    # Extraire les tâches de la page courante
    paginated_tasks = tasks[start_index:end_index]

    # Métadonnées de pagination
    pagination_info = {
        "total_tasks": total_tasks,
        "total_pages": total_pages,
        "current_page": page,
        "page_size": limit,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "previous_page": page - 1 if page > 1 else None,
        "start_index": start_index + 1 if total_tasks > 0 else 0,
        "end_index": min(end_index, total_tasks) if total_tasks > 0 else 0
    }

    return {
        "tasks": paginated_tasks,
        "pagination": pagination_info
    }

def get_available_sort_fields():
    """
    📋 Obtenir la liste des champs disponibles pour le tri

    Returns:
        Liste des champs de tri supportés
    """
    return [
        "priority",      # Tri par priorité (high, medium, low)
        "status",        # Tri par statut (pending, in_progress, completed, cancelled)
        "deadline",      # Tri par échéance
        "created_at",    # Tri par date de création
        "responsable",   # Tri alphabétique par responsable
        "description",   # Tri alphabétique par description
        "source",        # Tri par source (email, meeting, log)
        "relevance"      # Tri par pertinence (seulement avec search)
    ]
