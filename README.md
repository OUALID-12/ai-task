# AI Task Extraction System

Un système professionnel d'extraction de tâches par IA utilisant FastAPI et OpenRouter.

## 🚀 Fonctionnalités

- **Traitement d'emails intelligent** : Extraction automatique de tâches depuis les emails
- **API REST complète** : Endpoints pour traitement, monitoring et administration
- **Cache anti-doublon** : Évite le retraitement des emails déjà analysés
- **Traitement par lots** : Optimisation des performances pour plusieurs emails
- **Limitation de débit** : Protection contre l'abus et gestion des quotas API
- **Queue de traitement** : Gestion asynchrone des demandes
- **Monitoring en temps réel** : Surveillance de la santé du système
- **Architecture modulaire** : Code organisé pour la maintenabilité

## 📁 Structure du Projet

```
agent_tache_demo/
├── src/
│   ├── api/
│   │   ├── main.py              # Application FastAPI principale
│   │   └── routes/
│   │       ├── email_routes.py   # Endpoints de traitement d'emails
│   │       ├── monitoring_routes.py # Endpoints de monitoring
│   │       ├── cache_routes.py    # Gestion du cache
│   │       └── system_routes.py   # Administration système
│   ├── core/
│   │   ├── models.py            # Modèles Pydantic
│   │   ├── agent_task.py        # Fonctions IA optimisées
│   │   └── pipeline.py          # Pipeline de traitement unifié
│   ├── services/
│   │   ├── background_service.py # Services d'arrière-plan
│   │   └── email_watcher.py     # Surveillance de fichiers
│   └── utils/
│       ├── cache_emails.py      # Système de cache
│       ├── rate_limiter.py      # Limitation de débit
│       ├── email_queue.py       # Queue de traitement
│       └── batch_processor.py   # Traitement par lots
├── config/
│   └── settings.py              # Configuration centralisée
├── data/
│   ├── emails.json              # Données d'emails
│   ├── tasks.json               # Tâches extraites
│   └── logs.json                # Journaux du système
├── docs/                        # Documentation
├── tests/                       # Tests unitaires
└── requirements.txt             # Dépendances Python
```

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd agent_tache_demo
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configuration**
Définir la clé API OpenRouter :
```bash
set OPENROUTER_API_KEY=your_api_key_here
```

4. **Lancer l'application**
```bash
python src/api/main.py
```

L'API sera disponible sur `http://localhost:8000`

## 📖 Utilisation

### Endpoints Principaux

#### 1. Traitement d'Emails
- `POST /traiter_emails` - Traitement unifié avec tous les paramètres
- `POST /traiter_emails/rapid` - Traitement rapide optimisé
- `POST /traiter_emails/secure` - Traitement sécurisé avec vérifications
- `POST /traiter_emails/explicit` - Traitement avec email explicite
- `POST /traiter_emails/implicit` - Traitement depuis fichier

#### 2. Monitoring
- `GET /monitoring/rate_limit` - État de la limitation de débit
- `GET /monitoring/queue` - État de la queue
- `GET /monitoring/system_health` - Santé globale du système

#### 3. Cache
- `GET /cache/stats` - Statistiques du cache
- `POST /cache/cleanup` - Nettoyage du cache
- `DELETE /cache/clear` - Vidage complet du cache

#### 4. Administration
- `GET /system/status` - État du système
- `POST /system/restart` - Redémarrage des services
- `POST /system/maintenance` - Mode maintenance

### Exemples d'Utilisation

#### Traitement d'un Email
```python
import httpx

email_data = {
    "email": "Réunion projet demain 14h salle A",
    "use_cache": True,
    "rapid_mode": False,
    "secure_mode": True
}

response = httpx.post("http://localhost:8000/traiter_emails", json=email_data)
print(response.json())
```

#### Vérification de la Santé du Système
```python
response = httpx.get("http://localhost:8000/monitoring/system_health")
print(response.json())
```

## 🔧 Configuration

La configuration se fait via le fichier `config/settings.py` :

- **API_HOST/PORT** : Configuration du serveur
- **OPENROUTER_API_KEY** : Clé API pour l'IA
- **RATE_LIMIT_REQUESTS** : Limite de requêtes par heure
- **BATCH_SIZE** : Taille des lots de traitement
- **CACHE_MAX_SIZE** : Taille maximale du cache

## 🧪 Tests

```bash
# Lancer tous les tests
pytest tests/

# Tests avec couverture
pytest --cov=src tests/
```

## 📊 Monitoring

Le système inclut un monitoring complet :

- **Métriques de performance** : Temps de traitement, débit
- **État des services** : Cache, queue, limitation de débit
- **Santé du système** : CPU, mémoire, connectivité API
- **Journalisation** : Logs détaillés dans `data/logs.json`

## 🚀 Déploiement Production

### Docker (Recommandé)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "src/api/main.py"]
```

### Variables d'Environnement
- `OPENROUTER_API_KEY` : Clé API OpenRouter (obligatoire)
- `API_HOST` : Adresse d'écoute (défaut: 0.0.0.0)
- `API_PORT` : Port d'écoute (défaut: 8000)
- `LOG_LEVEL` : Niveau de logging (défaut: INFO)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 🆘 Support

Pour des questions ou problèmes :
- Créer une issue sur GitHub
- Consulter la documentation dans `/docs`
- Vérifier les logs dans `data/logs.json`
