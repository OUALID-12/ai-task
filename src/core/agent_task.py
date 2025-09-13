# -*- coding: utf-8 -*-
import os
import openai
from dotenv import load_dotenv
from datetime import datetime
import json

# Charger la clé API depuis .env
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# Configurer le client OpenRouter
client = openai.OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1"
)

# ✅ Fonction 1 : Extraire les tâches d’un email explicite
def extract_tasks_from_email(text_email: str):
    prompt = f"""
        Lis cet email et extrais toutes les tâches clairement mentionnées.

        Donne chaque tâche sous forme de liste JSON, avec les champs suivants :
            - "description"
            - "responsable"
            - "deadline"
            - "priorite"

        Retourne uniquement le JSON, sans aucun texte autour.

        Email :
    {text_email}
        """
    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

# ✅ Fonction 2 : Résumer le contenu de l’email (2 lignes max)
def resume_email(text_email: str):
    prompt = f"""
        Lis cet email et donne un court résumé de 1 ou 2 phrases maximum.
        Rends uniquement le texte résumé, sans autre commentaire.

        Email :
    {text_email}
        """
    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()

# ✅ Fonction 3 : Identifier le département concerné par l’email
def identifier_departement(text_email: str):
    prompt = f"""
        Lis cet email et déduis le département concerné (ex: RH, Finance, IT, Marketing).
        Retourne uniquement le nom du département, sans phrase autour.

        Email :
    {text_email}
        """
    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()


# ✅ Fonction 4 : Déduire la priorité d'une tâche (basée sur sa description)
def deduire_priorite(description: str):
    prompt = f"""
        Lis la description suivante d'une tâche et donne sa priorité : élevée, moyenne ou faible.
        Retourne uniquement le mot : élevée, moyenne ou faible.

        Description :
    {description}
        """
    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip().lower()


# ✅ Fonction 4 : Suggérer des tâches implicites à partir d’un email
def suggere_taches_implicites(text_email: str):
    prompt = f"""
        Lis attentivement cet email.
        Même s’il ne contient pas d’ordres clairs, déduis toutes les tâches possibles que l’équipe devrait faire, en fonction du contexte.
        Pour chaque tâche, donne les éléments suivants :
            - "description" : ce qu’il faut faire (phrase courte)
            - "responsable" : si identifiable dans l’email (sinon écris "inconnu")
            - "priorite" : élevée / moyenne / faible (estimation logique)
            - "confiance_ia" : un nombre entre 0.5 et 1.0 selon la fiabilité de la tâche (1.0 = très sûr, 0.5 = incertain)

        Retourne uniquement la liste JSON des tâches, sans texte autour.
        Email :
    {text_email}
        """

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()

# Fonction IA : Filtrer un email pour déterminer son type
def filtrer_email(text_email: str):
    prompt = f"""
        Lis cet email et détermine s’il contient des instructions ou demandes claires d’action.
        Si oui, réponds uniquement : "explicite".
        Si non, réponds uniquement : "implicite".

        Définition :
            - explicite : ordres clairs, actions demandées
            - implicite : contexte, attentes, pas de tâche exprimée

        Ne donne aucune explication. Retourne seulement "explicite" ou "implicite".

        Email :
    {text_email}
        """

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    result = response.choices[0].message.content.strip().lower()
    return result  # "explicite" ou "implicite"


# 🚀 AMÉLIORATION #4: OPTIMISATION DES PROMPTS IA
# ================================================

def optimiser_prompt_pour_extraction(texte_email: str, type_extraction: str) -> str:
    """
    🎯 OPTIMISATION PROMPTS IA: Génère des prompts optimisés selon le contexte.
    
    Améliore la qualité des réponses IA et réduit la consommation de tokens :
    - Prompts plus courts et précis
    - Instructions claires et structurées  
    - Adaptés au type d'email (explicite/implicite)
    - Format de sortie standardisé
    
    Args:
        texte_email: Le contenu de l'email à analyser
        type_extraction: "explicite" ou "implicite"
        
    Returns:
        str: Prompt optimisé pour l'IA
    """
    
    # Analyser la longueur et complexité de l'email
    longueur_email = len(texte_email)
    mots_cles_urgents = ["urgent", "asap", "critique", "immédiat", "emergency"]
    est_urgent = any(mot in texte_email.lower() for mot in mots_cles_urgents)
    
    # Base commune optimisée (tokens réduits)
    base_prompt = "Analyse cet email et extrait les tâches en JSON strict.\n\n"
    
    if type_extraction == "explicite":
        # Prompt optimisé pour tâches explicites
        prompt_specifique = """Trouve UNIQUEMENT les tâches clairement demandées.

    Format JSON requis:
    [{"description":"...","responsable":"...","deadline":"...","priorite":"..."}]

    Règles:
        - Description: action précise demandée
        - Responsable: qui doit faire (nom/service)  
        - Deadline: quand (date ou "inconnue")
        - Priorité: "haute/normale/basse" """

        if est_urgent:
            prompt_specifique += "\n- Email URGENT: priorité haute par défaut"
            
    else:  # implicite
        # Prompt optimisé pour tâches implicites
        prompt_specifique = """Identifie les tâches SOUS-ENTENDUES (non explicites).

    Format JSON requis:
    [{"description":"...","responsable":"...","priorite":"...","confiance_ia":0.0-1.0}]

    Règles:
        - Description: action implicite nécessaire
        - Responsable: qui pourrait s'en charger
        - Priorité: importance estimée
        - Confiance_ia: certitude de 0.0 à 1.0"""

    # Limiter la longueur selon l'email
    if longueur_email > 1000:
        prompt_specifique += "\n\nEmail long: concentre-toi sur l'essentiel."
    
    # Prompt final optimisé
    prompt_final = base_prompt + prompt_specifique + f"\n\nEmail:\n{texte_email}\n\nJSON:"
    
    return prompt_final


def extract_tasks_optimized(texte_email: str, use_optimized_prompts: bool = True) -> str:
    """
    🎯 EXTRACTION TÂCHES AVEC PROMPTS OPTIMISÉS.
    Version améliorée de extract_tasks_from_email.
    
    Args:
        texte_email: Contenu de l'email
        use_optimized_prompts: Utiliser les prompts optimisés (True) ou standard (False)
        
    Returns:
        str: JSON des tâches extraites
    """
    
    if use_optimized_prompts:
        # Nouveau prompt optimisé
        prompt = optimiser_prompt_pour_extraction(texte_email, "explicite")
    else:
        # Ancien prompt standard (fallback)
        prompt = f"""
        Lis cet email et extrais toutes les tâches clairement mentionnées.

        Donne chaque tâche sous forme de liste JSON, avec les champs suivants :
            - "description"
            - "responsable"
            - "deadline"
            - "priorite"

        Retourne uniquement le JSON, sans aucun texte autour.

        Email : {texte_email}
        """
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,  # Optimisé pour réduire les coûts
            temperature=0.1  # Plus déterministe
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"⚠️ Erreur extraction optimisée: {e}")
        # Fallback vers méthode standard
        return extract_tasks_from_email(texte_email)


def suggere_taches_implicites_optimized(texte_email: str, use_optimized_prompts: bool = True) -> str:
    """
    💡 SUGGESTIONS TÂCHES IMPLICITES AVEC PROMPTS OPTIMISÉS.
    Version améliorée de suggere_taches_implicites.
    
    Args:
        texte_email: Contenu de l'email
        use_optimized_prompts: Utiliser les prompts optimisés
        
    Returns:
        str: JSON des tâches implicites suggérées
    """
    
    if use_optimized_prompts:
        # Nouveau prompt optimisé
        prompt = optimiser_prompt_pour_extraction(texte_email, "implicite")
    else:
        # Ancien prompt standard (fallback)
        prompt = f"""
        Analyse cet email et suggère des tâches implicites qui pourraient être nécessaires.

        Pour chaque tâche implicite, donne :
            - "description"
            - "responsable" 
            - "priorite"
            - "confiance_ia" (entre 0.0 et 1.0)

        Retourne uniquement le JSON, sans texte autour.

        Email : {texte_email}
        """
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,  # Optimisé pour réduire les coûts
            temperature=0.2  # Légèrement plus créatif pour suggestions
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"⚠️ Erreur suggestions optimisées: {e}")
        # Fallback vers méthode standard
        return suggere_taches_implicites(texte_email)


def resume_email_optimized(texte_email: str, use_optimized_prompts: bool = True) -> str:
    """
    📝 RÉSUMÉ EMAIL AVEC PROMPTS OPTIMISÉS.
    Version améliorée de resume_email.
    
    Args:
        texte_email: Contenu de l'email
        use_optimized_prompts: Utiliser les prompts optimisés
        
    Returns:
        str: Résumé optimisé de l'email
    """
    
    if use_optimized_prompts:
        # Prompt optimisé court et efficace
        longueur = len(texte_email)
        if longueur < 200:
            prompt = f"Résume en 1 phrase:\n{texte_email}"
        elif longueur < 500:
            prompt = f"Résume en 2-3 phrases clés:\n{texte_email}"
        else:
            prompt = f"Résume les points essentiels en 3-4 phrases:\n{texte_email}"
    else:
        # Ancien prompt standard
        prompt = f"Résume ce email en quelques phrases : {texte_email}"
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,  # Résumé concis
            temperature=0.0  # Déterministe
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        print(f"⚠️ Erreur résumé optimisé: {e}")
        # Fallback vers méthode standard
        return resume_email(texte_email)

