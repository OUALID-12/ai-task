# cache_emails.py
# Système de cache intelligent pour détecter les emails redondants
# Utilise des hash SHA256 pour identifier les emails similaires/identiques

import hashlib
import json
import os
import re
from datetime import datetime

# Fichier de cache pour stocker les hash des emails traités
# Chemin absolu basé sur le répertoire racine du projet
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE_FILE = os.path.join(BASE_DIR, "data", "emails_cache.json")

def calculer_hash_email(texte_email, objet_email=""):
    """
    Calcule un hash unique pour un email basé sur son contenu et objet.
    
    Args:
        texte_email (str): Le contenu texte de l'email
        objet_email (str): L'objet/sujet de l'email
    
    Returns:
        str: Hash SHA256 tronqué (16 caractères) unique pour cet email
    """
    # Combiner objet et contenu pour créer une signature complète
    contenu_complet = f"{objet_email.lower().strip()} {texte_email.lower().strip()}"
    
    # Normalisation : enlever les éléments variables qui changent entre emails similaires
    # Enlever les dates (format YYYY-MM-DD)
    contenu_normalise = re.sub(r'\d{4}-\d{2}-\d{2}', '', contenu_complet)
    
    # Enlever les heures (format HH:MM)
    contenu_normalise = re.sub(r'\d{1,2}:\d{2}', '', contenu_normalise)
    
    # Enlever les espaces multiples et normaliser
    contenu_normalise = re.sub(r'\s+', ' ', contenu_normalise).strip()
    
    # Générer hash SHA256 et prendre les 16 premiers caractères
    hash_complet = hashlib.sha256(contenu_normalise.encode('utf-8')).hexdigest()
    return hash_complet[:16]

def est_email_deja_traite(hash_email):
    """
    Vérifie si un email avec ce hash a déjà été traité.
    
    Args:
        hash_email (str): Le hash de l'email à vérifier
    
    Returns:
        bool: True si l'email a déjà été traité, False sinon
    """
    # Si le fichier cache n'existe pas, aucun email n'a été traité
    if not os.path.exists(CACHE_FILE):
        return False
    
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        
        # Vérifier si le hash existe dans la liste des emails traités
        return hash_email in cache.get("emails_hashes", {})
    
    except (json.JSONDecodeError, FileNotFoundError):
        # En cas d'erreur de lecture, considérer comme non traité
        return False

def marquer_email_traite(hash_email, email_info):
    """
    Marque un email comme traité dans le cache avec ses informations.
    
    Args:
        hash_email (str): Le hash unique de l'email
        email_info (dict): Informations sur l'email (objet, expéditeur, etc.)
    """
    # Charger le cache existant ou créer un nouveau
    if not os.path.exists(CACHE_FILE):
        cache = {"emails_hashes": {}}
    else:
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            # Si erreur de lecture, créer un nouveau cache
            cache = {"emails_hashes": {}}
    
    # Ajouter l'email au cache avec ses métadonnées
    cache["emails_hashes"][hash_email] = {
        "processed_at": datetime.now().isoformat(timespec='seconds'),
        "email_objet": email_info.get("objet", ""),
        "email_expediteur": email_info.get("expediteur", ""),
        "email_destinataire": email_info.get("destinataire", ""),
        "nb_taches_extraites": email_info.get("nb_taches", 0),
        "type_email": email_info.get("type_email", ""),
        "hash": hash_email
    }
    
    # Sauvegarder le cache mis à jour
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️ Erreur sauvegarde cache: {e}")

def obtenir_info_cache(hash_email):
    """
    Récupère les informations d'un email déjà traité depuis le cache.
    
    Args:
        hash_email (str): Le hash de l'email
    
    Returns:
        dict: Informations de l'email ou None si non trouvé
    """
    if not os.path.exists(CACHE_FILE):
        return None
    
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        
        return cache.get("emails_hashes", {}).get(hash_email)
    
    except (json.JSONDecodeError, FileNotFoundError):
        return None

def nettoyer_cache_ancien(jours_retention=30):
    """
    Nettoie les entrées du cache plus anciennes que X jours.
    
    Args:
        jours_retention (int): Nombre de jours à conserver dans le cache
    """
    if not os.path.exists(CACHE_FILE):
        return
    
    try:
        from datetime import timedelta
        
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        
        date_limite = datetime.now() - timedelta(days=jours_retention)
        emails_a_garder = {}
        
        for hash_email, info in cache.get("emails_hashes", {}).items():
            try:
                date_traitement = datetime.fromisoformat(info["processed_at"])
                if date_traitement >= date_limite:
                    emails_a_garder[hash_email] = info
            except:
                # Garder en cas d'erreur de parsing de date
                emails_a_garder[hash_email] = info
        
        # Sauvegarder le cache nettoyé
        cache["emails_hashes"] = emails_a_garder
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=4, ensure_ascii=False)
        
        print(f"🧹 Cache nettoyé: {len(emails_a_garder)} entrées conservées")
    
    except Exception as e:
        print(f"⚠️ Erreur nettoyage cache: {e}")

def obtenir_statistiques_cache():
    """
    Retourne des statistiques sur le cache d'emails.
    
    Returns:
        dict: Statistiques du cache
    """
    if not os.path.exists(CACHE_FILE):
        return {
            "total_emails_caches": 0,
            "cache_existe": False
        }
    
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
        
        emails_hashes = cache.get("emails_hashes", {})
        
        return {
            "total_emails_caches": len(emails_hashes),
            "cache_existe": True,
            "derniere_entree": max([info.get("processed_at", "") for info in emails_hashes.values()]) if emails_hashes else None
        }
    
    except Exception as e:
        return {
            "total_emails_caches": 0,
            "cache_existe": True,
            "erreur": str(e)
        }
