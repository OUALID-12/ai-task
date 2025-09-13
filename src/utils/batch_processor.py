# batch_processor.py
# Système de traitement par batch intelligent pour grande entreprise
# Classification simple sans IA + groupement optimisé

import json
from datetime import datetime
from typing import List, Dict, Any
from cache_emails import calculer_hash_email, est_email_deja_traite

class BatchProcessor:
    """
    Processeur de batch intelligent pour emails d'entreprise.
    Groupe les emails par priorité et taille optimale sans classification IA complexe.
    """
    
    def __init__(self, batch_size_normal=5, batch_size_urgent=2):
        self.batch_size_normal = batch_size_normal  # Taille batch emails normaux
        self.batch_size_urgent = batch_size_urgent  # Taille batch emails urgents
        
        # Mots-clés pour détection urgence (simple et efficace)
        self.mots_urgents = [
            "urgent", "asap", "immédiat", "critique", "emergency",
            "panne", "bug", "erreur", "problème", "incident",
            "down", "crash", "bloquer", "bloqué", "help"
        ]
    
    def detecter_urgence(self, email):
        """
        Détecte si un email est urgent basé sur des mots-clés simples.
        
        Args:
            email (dict): Email avec 'objet' et 'texte'
            
        Returns:
            bool: True si urgent, False sinon
        """
        # Combiner objet et début du texte pour analyse
        texte_analyse = f"{email.get('objet', '')} {email.get('texte', '')[:200]}".lower()
        
        # Chercher mots-clés urgents
        for mot in self.mots_urgents:
            if mot in texte_analyse:
                return True
        
        # Vérifier expéditeur prioritaire (optionnel)
        expediteur = email.get('expediteur', '').lower()
        if any(vip in expediteur for vip in ['ceo@', 'direction@', 'pdg@']):
            return True
            
        return False
    
    def filtrer_emails_a_traiter(self, emails):
        """
        Filtre les emails qui nécessitent un traitement IA.
        Exclut ceux déjà traités et ceux en cache.
        
        Args:
            emails (list): Liste des emails
            
        Returns:
            list: Emails à traiter effectivement
        """
        emails_a_traiter = []
        
        for email in emails:
            # Skip emails déjà traités
            if email.get("statut_traitement") == "traité":
                continue
            
            # Skip emails en cache (doublons)
            email_hash = calculer_hash_email(email.get("texte", ""), email.get("objet", ""))
            if est_email_deja_traite(email_hash):
                continue
            
            # Ajouter hash pour usage ultérieur
            email["_hash_temp"] = email_hash
            emails_a_traiter.append(email)
        
        return emails_a_traiter
    
    def creer_batches_intelligents(self, emails):
        """
        Crée des batches optimisés pour traitement par l'IA.
        Sépare urgent/normal et groupe par taille optimale.
        
        Args:
            emails (list): Liste des emails à traiter
            
        Returns:
            list: Liste de batches avec métadonnées
        """
        # 1. Filtrer emails nécessitant traitement
        emails_nouveaux = self.filtrer_emails_a_traiter(emails)
        
        if not emails_nouveaux:
            return []
        
        # 2. Séparer par urgence
        emails_urgents = []
        emails_normaux = []
        
        for email in emails_nouveaux:
            if self.detecter_urgence(email):
                emails_urgents.append(email)
            else:
                emails_normaux.append(email)
        
        # 3. Créer batches
        batches = []
        
        # Batches urgents (petits, traités en premier)
        for i in range(0, len(emails_urgents), self.batch_size_urgent):
            batch_emails = emails_urgents[i:i+self.batch_size_urgent]
            batches.append({
                "id": f"urgent_{len(batches)+1}",
                "type": "urgent",
                "priorite": 1,
                "emails": batch_emails,
                "taille": len(batch_emails),
                "created_at": datetime.now().isoformat()
            })
        
        # Batches normaux (plus grands, traités après)
        for i in range(0, len(emails_normaux), self.batch_size_normal):
            batch_emails = emails_normaux[i:i+self.batch_size_normal]
            batches.append({
                "id": f"normal_{len(batches)+1}",
                "type": "normal", 
                "priorite": 2,
                "emails": batch_emails,
                "taille": len(batch_emails),
                "created_at": datetime.now().isoformat()
            })
        
        # 4. Trier par priorité (urgent d'abord)
        batches.sort(key=lambda x: x["priorite"])
        
        return batches
    
    def traiter_batch_avec_ia(self, batch, agent_functions):
        """
        Traite un batch d'emails avec les fonctions IA existantes.
        Utilise les mêmes fonctions que le traitement individuel.
        
        Args:
            batch (dict): Batch d'emails à traiter
            agent_functions (dict): Fonctions IA disponibles
            
        Returns:
            dict: Résultats du traitement du batch
        """
        resultats = {
            "batch_id": batch["id"],
            "type": batch["type"],
            "emails_traites": 0,
            "taches_extraites": 0,
            "erreurs": 0,
            "details": []
        }
        
        for email in batch["emails"]:
            try:
                # Utiliser les mêmes fonctions IA que le traitement individuel
                resultat_email = self.traiter_email_individuel(email, agent_functions)
                
                resultats["emails_traites"] += 1
                resultats["taches_extraites"] += resultat_email.get("nb_taches", 0)
                resultats["details"].append(resultat_email)
                
            except Exception as e:
                resultats["erreurs"] += 1
                resultats["details"].append({
                    "email_id": email.get("id", "unknown"),
                    "erreur": str(e),
                    "statut": "échec"
                })
        
        return resultats
    
    def traiter_email_individuel(self, email, agent_functions):
        """
        Traite un email individuel avec les fonctions IA existantes.
        Reprend la logique du pipeline actuel.
        
        Args:
            email (dict): Email à traiter
            agent_functions (dict): Fonctions IA (filtrer_email, extract_tasks_from_email, etc.)
            
        Returns:
            dict: Résultat du traitement
        """
        from agent_task import (
            filtrer_email, extract_tasks_from_email, suggere_taches_implicites,
            resume_email, identifier_departement, deduire_priorite
        )
        
        texte = email["texte"]
        
        # 1. Filtrer email (logique existante)
        type_detecte = filtrer_email(texte)
        
        # 2. Extraction tâches selon type
        if type_detecte == "explicite":
            result_text = extract_tasks_from_email(texte)
        else:
            result_text = suggere_taches_implicites(texte)
        
        # 3. Parser résultat IA
        try:
            taches = json.loads(result_text)
            if not isinstance(taches, list):
                raise ValueError("Résultat IA n'est pas une liste")
        except Exception as e:
            return {
                "email_id": email.get("id"),
                "statut": "échec",
                "erreur": str(e),
                "nb_taches": 0
            }
        
        # 4. Enrichissement métadonnées (logique existante)
        resume = resume_email(texte)
        
        if email.get("departement"):
            departement_info = {"nom": email["departement"], "origine": "Utilisateur"}
        else:
            nom_dept = identifier_departement(texte)
            departement_info = {"nom": nom_dept, "origine": "AI"}
        
        # 5. Préparer tâches enrichies
        taches_enrichies = []
        for i, tache in enumerate(taches):
            tache["id"] = f"{email['id']}_{i+1}"
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
            
            # Origine email (métadonnées complètes)
            tache["origine_email"] = {
                "expediteur": email["expediteur"],
                "destinataire": email["destinataire"],
                "objet": email["objet"],
                "date_reception": email["date_reception"],
                "resume_contenu": resume,
                "departement": departement_info
            }
            
            taches_enrichies.append(tache)
        
        return {
            "email_id": email.get("id"),
            "statut": "succès",
            "type_detecte": type_detecte,
            "nb_taches": len(taches_enrichies),
            "taches": taches_enrichies,
            "hash_email": email.get("_hash_temp"),
            "batch_processed": True
        }
    
    def obtenir_statistiques_batch(self, batches):
        """
        Calcule des statistiques sur les batches créés.
        
        Args:
            batches (list): Liste des batches
            
        Returns:
            dict: Statistiques détaillées
        """
        if not batches:
            return {
                "total_batches": 0,
                "total_emails": 0,
                "batches_urgents": 0,
                "batches_normaux": 0
            }
        
        stats = {
            "total_batches": len(batches),
            "total_emails": sum(b["taille"] for b in batches),
            "batches_urgents": len([b for b in batches if b["type"] == "urgent"]),
            "batches_normaux": len([b for b in batches if b["type"] == "normal"]),
            "taille_moyenne": sum(b["taille"] for b in batches) / len(batches),
            "economies_estimees": f"Réduction de {len(batches)} à ~{sum(b['taille'] for b in batches)} appels IA"
        }
        
        return stats
