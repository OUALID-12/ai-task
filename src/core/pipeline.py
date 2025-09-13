import json
import os
from datetime import datetime
import sys

# Ajouter les chemins pour les imports
current_dir = os.path.dirname(__file__)
utils_dir = os.path.join(os.path.dirname(current_dir), "utils")
sys.path.insert(0, utils_dir)
sys.path.insert(0, current_dir)

from agent_task import (
    filtrer_email,
    extract_tasks_from_email,
    suggere_taches_implicites,
    resume_email,
    identifier_departement,
    deduire_priorite,
    # 🚀 NOUVELLES FONCTIONS OPTIMISÉES
    extract_tasks_optimized,
    suggere_taches_implicites_optimized,
    resume_email_optimized
)
# Import du nouveau système de cache pour détecter les emails redondants
from cache_emails import (
    calculer_hash_email,
    est_email_deja_traite,
    marquer_email_traite,
    obtenir_info_cache,
    obtenir_statistiques_cache
)
# Import du nouveau système de batch processing pour performance
from batch_processor import BatchProcessor
# 🚦 NOUVEAU: Import du système Rate Limiting + Queue  
from rate_limiter import RateLimiter
from email_queue import EmailQueue, detecter_priorite_email_pour_queue

# 🔄 NOUVEAU: Import du gestionnaire unifié pour PHASE 2
try:
    from unified_task_manager import get_unified_task_manager
    UNIFIED_SYSTEM_AVAILABLE = True
except ImportError:
    UNIFIED_SYSTEM_AVAILABLE = False
    print("⚠️ Système unifié non disponible, utilisation du système legacy")

# Configuration des fichiers de données
# Chemin absolu basé sur le répertoire racine du projet
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_FILE = os.path.join(BASE_DIR, "data", "tasks.json")
EMAIL_FILE = os.path.join(BASE_DIR, "data", "emails.json")
LOG_FILE = os.path.join(BASE_DIR, "data", "logs.json")
UNIFIED_TASKS_FILE = os.path.join(BASE_DIR, "data", "unified_tasks.json")

def traiter_emails(
    use_rate_limiting=False,
    use_batch_processing=True,
    use_cache=True,
    use_optimized_prompts=True
    ):
    """
    🚀 FONCTION PRINCIPALE UNIFIÉE: Traitement des emails avec toutes améliorations.
    
    Args:
        use_rate_limiting (bool): Active le rate limiting + queue pour protection surcharge
        use_batch_processing (bool): Active le traitement par batch intelligent  
        use_cache (bool): Active le cache anti-doublon pour économies IA
        use_optimized_prompts (bool): Active les prompts IA optimisés
                                 
    Intègre TOUTES les optimisations pour la production :
    ✅ 1. Cache anti-doublon (économies IA) 
    ✅ 2. Batch processing intelligent
    ✅ 3. Rate limiting + Queue (protection surcharge)
    ✅ 4. Optimisation prompts IA (qualité + économies)
    """
    print("🚀 Démarrage traitement intelligent des emails...")
    
    # Afficher les optimisations actives
    optimisations = []
    if use_cache:
        optimisations.append("Cache anti-doublon")
    if use_batch_processing:
        optimisations.append("Batch processing")
    if use_rate_limiting:
        optimisations.append("Rate limiting + Queue")
    if use_optimized_prompts:
        optimisations.append("Prompts optimisés")
    
    print(f"� Optimisations actives: {', '.join(optimisations)}")
    
    # 🚦 Router vers la bonne méthode selon le mode
    if use_rate_limiting:
        print("🚦 Mode Rate Limiting + Queue activé")
        return traiter_emails_avec_rate_limiting(
            use_batch_processing=use_batch_processing,
            use_cache=use_cache,
            use_optimized_prompts=use_optimized_prompts
        )
    else:
        print("⚡ Mode classique (performances maximales)")
        return traiter_emails_mode_classique(
            use_batch_processing=use_batch_processing,
            use_cache=use_cache,
            use_optimized_prompts=use_optimized_prompts
        )


# 🎯 FONCTIONS HELPER POUR OPTIMISATION IA
# ==========================================

def extraire_taches_avec_options(texte_email: str, type_detecte: str, use_optimized_prompts: bool) -> str:
    """
    Helper function qui choisit entre versions optimisées ou standard.
    
    Args:
        texte_email: Contenu de l'email
        type_detecte: "explicite" ou "implicite" 
        use_optimized_prompts: Utiliser prompts optimisés
        
    Returns:
        str: JSON des tâches extraites
    """
    if type_detecte == "explicite":
        if use_optimized_prompts:
            return extract_tasks_optimized(texte_email, use_optimized_prompts=True)
        else:
            return extract_tasks_from_email(texte_email)
    else:  # implicite
        if use_optimized_prompts:
            return suggere_taches_implicites_optimized(texte_email, use_optimized_prompts=True)
        else:
            return suggere_taches_implicites(texte_email)


def resumer_email_avec_options(texte_email: str, use_optimized_prompts: bool) -> str:
    """
    Helper function pour résumer un email avec ou sans optimisation.
    
    Args:
        texte_email: Contenu de l'email
        use_optimized_prompts: Utiliser prompts optimisés
        
    Returns:
        str: Résumé de l'email
    """
    if use_optimized_prompts:
        return resume_email_optimized(texte_email, use_optimized_prompts=True)
    else:
        return resume_email(texte_email)


def traiter_emails_mode_classique(
    use_batch_processing=True,
    use_cache=True,
    use_optimized_prompts=True
    ):
    """
    🔧 MODE CLASSIQUE: Traitement sans rate limiting (code existant intact).
    Exactement le même comportement qu'avant.
    """
    print("⚡ Traitement mode classique...")
    
    # Charger emails.json
    with open(EMAIL_FILE, "r", encoding="utf-8") as f:
        emails = json.load(f)

    # Charger tasks.json
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        tasks_data = json.load(f)

    # Initialiser le processeur de batch
    batch_processor = BatchProcessor(batch_size_normal=5, batch_size_urgent=2)
    
    # Compteurs pour statistiques
    taches_totales = 0
    emails_doublons_detectes = 0
    emails_traites_batch = 0
    batches_traites = 0

    # 1. 🔍 PHASE CACHE: Traiter d'abord les doublons (comme avant)
    emails_apres_cache = []
    
    for email in emails:
        # Vérifier statut traitement
        if email["statut_traitement"] == "traité":
            emails_apres_cache.append(email)
            continue

        # Vérification cache (logique existante preservée)
        email_hash = calculer_hash_email(email["texte"], email["objet"])
        
        if est_email_deja_traite(email_hash):
            # Email en cache - traitement identique à l'original
            info_cache = obtenir_info_cache(email_hash)
            
            email["statut_traitement"] = "traité (doublon)"
            email["hash_email"] = email_hash
            email["type_email"] = info_cache.get("type_email", "inconnu") if info_cache else "inconnu"
            email["nb_taches_extraites"] = 0

            log_entree = {
                "horodatage": datetime.now().isoformat(timespec='seconds'),
                "email_objet": email["objet"],
                "statut": "doublon détecté",
                "type_detecte": "cache_hit",
                "hash_email": email_hash,
                "email_original_traite_le": info_cache.get("processed_at") if info_cache else "inconnu",
                "economies_ia": "Appel OpenRouter évité"
            }
            enregistrer_log(log_entree)
            
            emails_doublons_detectes += 1
            print(f"🟡 Doublon détecté (hash: {email_hash}) — Email ignoré : {email['objet']}")
        
        emails_apres_cache.append(email)

    # 2. 🎯 PHASE BATCH: Créer batches intelligents pour emails restants
    batches = batch_processor.creer_batches_intelligents(emails_apres_cache)
    
    if not batches:
        print("ℹ️ Aucun email nouveau à traiter par batch")
    else:
        stats_batch = batch_processor.obtenir_statistiques_batch(batches)
        print(f"📦 {stats_batch['total_batches']} batches créés pour {stats_batch['total_emails']} emails")
        print(f"   ⚡ Urgents: {stats_batch['batches_urgents']} batches")
        print(f"   📋 Normaux: {stats_batch['batches_normaux']} batches")

    # 3. 🤖 PHASE TRAITEMENT: Traiter chaque batch
    for batch in batches:
        print(f"\n🔄 Traitement batch {batch['id']} ({batch['type']}) - {batch['taille']} emails")
        
        # Traiter emails du batch individuellement (garde logique existante)
        for email in batch["emails"]:
            try:
                # 🚀 Traitement avec options d'optimisation
                resultat = traiter_email_individuel_avec_cache(email, tasks_data, use_optimized_prompts)
                
                if resultat["statut"] == "succès":
                    taches_totales += resultat["nb_taches"]
                    emails_traites_batch += 1
                    
                    # Marquer dans cache (logique existante)
                    marquer_email_traite(resultat["hash_email"], {
                        "objet": email["objet"],
                        "expediteur": email["expediteur"],
                        "destinataire": email["destinataire"],
                        "nb_taches": resultat["nb_taches"],
                        "type_email": resultat["type_detecte"]
                    })
                    
                    print(f"   ✅ Email traité: {resultat['nb_taches']} tâches extraites")
                else:
                    print(f"   ❌ Erreur email: {resultat.get('erreur', 'Inconnue')}")
                    
            except Exception as e:
                print(f"   ❌ Erreur traitement email: {str(e)}")
                # Log d'erreur
                log_entree = {
                    "horodatage": datetime.now().isoformat(timespec='seconds'),
                    "email_objet": email.get("objet", "unknown"),
                    "statut": "échec batch",
                    "erreur": str(e),
                    "batch_id": batch["id"]
                }
                enregistrer_log(log_entree)
        
        batches_traites += 1
        print(f"✅ Batch {batch['id']} terminé")

    # 4. 💾 SAUVEGARDE: Compatible ancien + nouveau système
    # LEGACY: Sauvegarder dans l'ancien format (préservé)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks_data, f, indent=4, ensure_ascii=False)

    # 🔄 NOUVEAU: Sauvegarder aussi dans le système unifié si disponible
    if UNIFIED_SYSTEM_AVAILABLE and os.path.exists(UNIFIED_TASKS_FILE):
        try:
            unified_manager = get_unified_task_manager()
            # Ajouter nouvelles tâches au système unifié
            for task in tasks_data:
                # Vérifier si la tâche n'existe pas déjà
                existing_unified_tasks = unified_manager.load_all_tasks()
                task_exists = any(
                    ut.get("source_metadata", {}).get("email_id") == task.get("id")
                    for ut in existing_unified_tasks
                )
                
                if not task_exists:
                    # Convertir vers format unifié
                    unified_task_data = {
                        "description": task.get("description", ""),
                        "responsable": task.get("responsable", ""),
                        "deadline": task.get("deadline"),
                        "priorite": task.get("priorite", "medium"),
                        "statut": task.get("statut", "pending"),
                        "confiance_ia": task.get("confiance_ia", 0.8),
                        "source": "email",
                        "type": task.get("type", "explicite"),
                        "source_metadata": {
                            "email_id": task.get("id"),
                            "original_email": task.get("origine_email", {})
                        }
                    }
                    unified_manager.add_task(unified_task_data)
            print("✅ Tâches sauvegardées dans le système unifié")
        except Exception as e:
            print(f"⚠️ Erreur sauvegarde système unifié: {e}")
    
    with open(EMAIL_FILE, "w", encoding="utf-8") as f:
        json.dump(emails_apres_cache, f, indent=4, ensure_ascii=False)

    # 5. 📊 STATISTIQUES: Enrichies avec info batch et cache
    stats_cache = obtenir_statistiques_cache()
    
    resume = {
        "emails_traitees": len(emails),  # Compatibilité avec l'ancien format
        "emails_traites_batch": emails_traites_batch,
        "taches_ajoutees": taches_totales,
        "doublons_detectes": emails_doublons_detectes,
        "batches_traites": batches_traites,
        "economies_ia": f"{emails_doublons_detectes} appels OpenRouter évités par cache",
        "efficacite_batch": f"{batches_traites} batches vs {emails_traites_batch} emails individuels",
        "cache_stats": {
            "total_emails_en_cache": stats_cache.get("total_emails_caches", 0),
            "cache_fonctionnel": stats_cache.get("cache_existe", False)
        }
    }
    
    # Affichage résumé enrichi
    print(f"\n📊 Résumé du traitement intelligent:")
    print(f"   📧 Emails total: {len(emails)}")
    print(f"   🚀 Emails traités: {emails_traites_batch}")
    print(f"   ✅ Nouvelles tâches: {taches_totales}")
    print(f"   🟡 Doublons évités: {emails_doublons_detectes}")
    print(f"   📦 Batches utilisés: {batches_traites}")
    print(f"   💰 Économies cache: {emails_doublons_detectes} appels évités")
    print(f"   🗄️ Cache total: {stats_cache.get('total_emails_caches', 0)} emails")
    
    return resume

def traiter_email_individuel_avec_cache(email, tasks_data, use_optimized_prompts=True):
    """
    Traite un email individuel avec la logique complète du pipeline original.
    Utilisé par le système de batch pour garder la compatibilité.
    
    Args:
        email: Email à traiter
        tasks_data: Données des tâches existantes
        use_optimized_prompts: Utiliser les prompts IA optimisés
    """
    
    texte = email["texte"]
    email_hash = calculer_hash_email(email["texte"], email["objet"])

    # Filtrer email (logique originale)
    type_detecte = filtrer_email(texte)

    # 🚀 NOUVEAU: Extraction avec prompts optimisés selon paramètre
    result_text = extraire_taches_avec_options(texte, type_detecte, use_optimized_prompts)

    try:
        taches = json.loads(result_text)
        if not isinstance(taches, list):
            raise ValueError("Résultat IA n'est pas une liste")
    except Exception as e:
        # Log d'erreur (logique originale)
        log_entree = {
            "horodatage": datetime.now().isoformat(timespec='seconds'),
            "email_objet": email["objet"],
            "statut": "échec",
            "type_detecte": type_detecte,
            "erreur": str(e),
            "resultat_ia": result_text
        }
        enregistrer_log(log_entree)
        
        email["statut_traitement"] = "traité"
        email["type_email"] = type_detecte
        email["nb_taches_extraites"] = 0
        email["hash_email"] = email_hash
        
        return {"statut": "échec", "erreur": str(e), "nb_taches": 0}

    # 🚀 NOUVEAU: Résumé avec prompts optimisés selon paramètre
    resume = resumer_email_avec_options(texte, use_optimized_prompts)
    if email.get("departement"):
        departement_info = {"nom": email["departement"], "origine": "Utilisateur"}
    else:
        nom_dept = identifier_departement(texte)
        departement_info = {"nom": nom_dept, "origine": "AI"}

    origine_email = {
        "expediteur": email["expediteur"],
        "destinataire": email["destinataire"],
        "objet": email["objet"],
        "date_reception": email["date_reception"],
        "resume_contenu": resume,
        "departement": departement_info
    }

    # Enrichissement tâches (logique originale)
    nouvelles_taches = []
    for tache in taches:
        tache["id"] = f"{email['id']}_{len(nouvelles_taches)+1}"
        if not tache.get("responsable"):
            tache["responsable"] = "inconnu"
        if not tache.get("priorite"):
            tache["priorite"] = deduire_priorite(tache["description"])
        if type_detecte == "explicite":
            tache["confiance_ia"] = 1.0
        elif not tache.get("confiance_ia"):
            tache["confiance_ia"] = 0.7

        tache["source"] = "email"
        tache["type"] = type_detecte
        tache["extrait_le"] = datetime.now().isoformat(timespec='seconds')
        tache["statut"] = "à faire"
        tache["origine_email"] = origine_email

        tasks_data.append(tache)
        nouvelles_taches.append(tache)

    # Mise à jour email (logique originale)
    email["statut_traitement"] = "traité"
    email["type_email"] = type_detecte
    email["nb_taches_extraites"] = len(nouvelles_taches)
    email["hash_email"] = email_hash

    # Log succès (logique originale avec mention batch)
    log_entree = {
        "horodatage": datetime.now().isoformat(timespec='seconds'),
        "email_objet": email["objet"],
        "statut": "succès",
        "type_detecte": type_detecte,
        "nb_taches": len(nouvelles_taches),
        "hash_email": email_hash,
        "cache_status": "nouveau_email_ajoute_au_cache",
        "traitement_mode": "batch"
    }
    enregistrer_log(log_entree)

    return {
        "statut": "succès",
        "type_detecte": type_detecte,
        "nb_taches": len(nouvelles_taches),
        "hash_email": email_hash
    }

# Fonction utilitaire pour écrire dans logs.json
def enregistrer_log(entree):
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=4, ensure_ascii=False)

    with open(LOG_FILE, "r", encoding="utf-8") as f:
        logs = json.load(f)

    logs.append(entree)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)


def traiter_emails_avec_rate_limiting(
    use_batch_processing=True,
    use_cache=True,
    use_optimized_prompts=True
    ):
    """
    🚦 NOUVEAU MODE: Traitement avec Rate Limiting + Queue.
    Respecte les limites d'appels IA et utilise une file d'attente intelligente.
    """
    print("🚦 Démarrage traitement avec rate limiting...")
    
    # Initialiser le rate limiter et la queue
    rate_limiter = RateLimiter(
        calls_per_minute=30,    # Limite conservatrice pour production
        calls_per_hour=800,
        calls_per_day=5000
    )
    email_queue = EmailQueue(max_queue_size=1000)
    
    # Charger emails.json
    with open(EMAIL_FILE, "r", encoding="utf-8") as f:
        emails = json.load(f)

    # Charger tasks.json
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        tasks_data = json.load(f)
    
    # Statistiques
    taches_totales = 0
    emails_doublons_detectes = 0
    emails_traites = 0
    appels_ia_effectues = 0
    temps_attente_total = 0.0
    
    print(f"📧 {len(emails)} emails à analyser...")
    
    # 1. 🔍 PHASE CACHE: Traiter les doublons AVANT la queue
    emails_apres_cache = []
    
    for email in emails:
        if email["statut_traitement"] == "traité":
            emails_apres_cache.append(email)
            continue

        # Vérification cache (même logique qu'avant)
        email_hash = calculer_hash_email(email["texte"], email["objet"])
        
        if est_email_deja_traite(email_hash):
            # Email en cache - pas besoin d'IA
            info_cache = obtenir_info_cache(email_hash)
            
            email["statut_traitement"] = "traité (doublon)"
            email["hash_email"] = email_hash
            email["type_email"] = info_cache.get("type_email", "inconnu") if info_cache else "inconnu"
            email["nb_taches_extraites"] = 0

            log_entree = {
                "horodatage": datetime.now().isoformat(timespec='seconds'),
                "email_objet": email["objet"],
                "statut": "doublon détecté",
                "type_detecte": "cache_hit",
                "hash_email": email_hash,
                "mode_traitement": "rate_limited",
                "economies_ia": "Appel OpenRouter évité"
            }
            enregistrer_log(log_entree)
            
            emails_doublons_detectes += 1
            print(f"🟡 Doublon détecté - Évite appel IA : {email['objet']}")
        
        emails_apres_cache.append(email)
    
    print(f"✅ Phase cache terminée: {emails_doublons_detectes} doublons évités")
    
    # 2. 📋 PHASE QUEUE: Mettre les emails non-traités en file d'attente
    emails_a_traiter = [e for e in emails_apres_cache if e["statut_traitement"] != "traité"]
    
    for email in emails_a_traiter:
        priority = detecter_priorite_email_pour_queue(email)
        email_queue.add_email(email, priority)
    
    queue_stats_initial = email_queue.get_queue_stats()
    print(f"📋 File d'attente créée:")
    print(f"   🚨 Urgents: {queue_stats_initial['current_queue']['urgent_count']}")
    print(f"   📋 Normaux: {queue_stats_initial['current_queue']['normal_count']}")
    print(f"   📦 Batch: {queue_stats_initial['current_queue']['batch_count']}")
    
    # 3. 🚦 PHASE TRAITEMENT: Traiter la queue avec rate limiting
    print(f"\n🚦 Début traitement avec rate limiting...")
    
    while True:
        # Récupérer le prochain email de la queue
        email = email_queue.get_next_email()
        if not email:
            break
        
        # Vérifier rate limiting
        if not rate_limiter.can_make_call():
            wait_time = rate_limiter.wait_if_needed()
            temps_attente_total += wait_time
        
        # 🚀 Traiter l'email avec toutes les optimisations
        try:
            resultat = traiter_email_individuel_avec_cache_et_rate_limiting(
                email, tasks_data, rate_limiter, use_optimized_prompts
            )
            
            if resultat["statut"] == "succès":
                taches_totales += resultat["nb_taches"]
                emails_traites += 1
                appels_ia_effectues += 1
                
                # Marquer dans cache
                marquer_email_traite(resultat["hash_email"], {
                    "objet": email["objet"],
                    "expediteur": email["expediteur"],
                    "destinataire": email["destinataire"],
                    "nb_taches": resultat["nb_taches"],
                    "type_email": resultat["type_detecte"]
                })
                
                print(f"   ✅ Email traité: {resultat['nb_taches']} tâches | Queue: {email_queue.get_total_queue_size()} restants")
            else:
                print(f"   ❌ Erreur: {resultat.get('erreur', 'Inconnue')}")
                
        except Exception as e:
            print(f"   ❌ Erreur traitement: {str(e)}")
    
    # 4. 💾 SAUVEGARDE: Identique aux autres modes
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks_data, f, indent=4, ensure_ascii=False)

    with open(EMAIL_FILE, "w", encoding="utf-8") as f:
        json.dump(emails_apres_cache, f, indent=4, ensure_ascii=False)
    
    # 5. 📊 STATISTIQUES: Enrichies avec rate limiting
    stats_cache = obtenir_statistiques_cache()
    rate_limiter_stats = rate_limiter.get_current_stats()
    queue_stats_final = email_queue.get_queue_stats()
    
    resume = {
        "emails_traitees": len(emails),
        "emails_traites_rate_limited": emails_traites,
        "taches_ajoutees": taches_totales,
        "doublons_detectes": emails_doublons_detectes,
        "appels_ia_effectues": appels_ia_effectues,
        "temps_attente_total": round(temps_attente_total, 2),
        "economies_ia": f"{emails_doublons_detectes} appels évités par cache",
        "rate_limiting_stats": {
            "calls_remaining_minute": rate_limiter_stats["remaining"]["minute"],
            "calls_remaining_hour": rate_limiter_stats["remaining"]["hour"],
            "total_calls_today": rate_limiter_stats["total_calls_today"]
        },
        "queue_stats": {
            "emails_processed": queue_stats_final["overall_stats"]["total_processed"],
            "average_wait_time": round(queue_stats_final["overall_stats"]["average_wait_time"], 2),
            "queue_health": queue_stats_final["queue_health"]["status"]
        },
        "cache_stats": {
            "total_emails_en_cache": stats_cache.get("total_emails_caches", 0),
            "cache_fonctionnel": stats_cache.get("cache_existe", False)
        }
    }
    
    # Affichage résumé détaillé
    print(f"\n📊 Résumé du traitement avec Rate Limiting:")
    print(f"   📧 Emails total: {len(emails)}")
    print(f"   🚀 Emails traités: {emails_traites}")
    print(f"   ✅ Nouvelles tâches: {taches_totales}")
    print(f"   🟡 Doublons évités: {emails_doublons_detectes}")
    print(f"   🤖 Appels IA effectués: {appels_ia_effectues}")
    print(f"   ⏱️ Temps attente total: {temps_attente_total:.1f}s")
    print(f"   🚦 Appels restants/heure: {rate_limiter_stats['remaining']['hour']}")
    print(f"   📋 Santé queue: {queue_stats_final['queue_health']['status']}")
    
    return resume


def traiter_email_individuel_avec_cache_et_rate_limiting(email, tasks_data, rate_limiter, use_optimized_prompts=True):
    """
    Traite un email individuel avec rate limiting.
    Identique à traiter_email_individuel_avec_cache mais enregistre l'appel IA.
    
    Args:
        email: Email à traiter
        tasks_data: Données des tâches existantes  
        rate_limiter: Instance du rate limiter
        use_optimized_prompts: Utiliser les prompts IA optimisés
    """
    # 🚀 Même logique que traiter_email_individuel_avec_cache avec optimisations
    resultat = traiter_email_individuel_avec_cache(email, tasks_data, use_optimized_prompts)
    
    # Enregistrer l'appel IA dans le rate limiter
    if resultat["statut"] == "succès":
        rate_limiter.register_call()
    
    return resultat

# =====================================
# 🎯 NOUVEAU: TRAITEMENT DES RÉUNIONS
# =====================================

def traiter_reunions(
    use_rate_limiting=False,
    use_batch_processing=True,
    use_cache=True,
    use_optimized_prompts=True
    ):
    """
    🎯 TRAITEMENT UNIFIÉ DES RÉUNIONS
    Réutilise 100% de la logique emails pour les transcriptions de réunions
    
    Args:
        use_rate_limiting: Activer le rate limiting (même système que emails)
        use_batch_processing: Traitement par batch (même système que emails)
        use_cache: Utiliser le cache anti-doublon (même système que emails)
        use_optimized_prompts: Utiliser les prompts IA optimisés
    
    Returns:
        dict: Résultats du traitement des réunions
    """
    print("🚀 Démarrage traitement intelligent des réunions...")
    
    try:
        # Import du processeur de réunions
        from meeting_processor import get_meeting_processor
        
        # Instance du processeur
        processor = get_meeting_processor()
        
        # Traiter toutes les réunions avec les mêmes optimisations que les emails
        optimisations_actives = []
        if use_cache:
            optimisations_actives.append("Cache anti-doublon")
        if use_batch_processing:
            optimisations_actives.append("Batch processing")
        if use_rate_limiting:
            optimisations_actives.append("Rate limiting + Queue")
        if use_optimized_prompts:
            optimisations_actives.append("Prompts optimisés")
        
        print(f"⚡ Optimisations actives: {', '.join(optimisations_actives)}")
        
        # Traitement avec cache
        resultat = processor.traiter_toutes_reunions(use_cache=use_cache)
        
        print(f"""
📊 Résumé du traitement intelligent des réunions:
   🎯 Réunions total: {resultat['total_meetings']}
   🚀 Réunions traitées: {resultat['processed']}
   ✅ Nouvelles tâches: {resultat['tasks_extracted']}
   🟡 Cache hits: {resultat.get('cache_hits', 0)}
   ❌ Erreurs: {resultat['errors']}
   🗄️ Optimisations: {len(optimisations_actives)} actives
        """)
        
        return resultat
        
    except Exception as e:
        print(f"❌ Erreur traitement réunions: {e}")
        return {
            "total_meetings": 0,
            "processed": 0,
            "tasks_extracted": 0,
            "errors": 1,
            "error": str(e),
            "message": f"Erreur globale: {e}"
        }
