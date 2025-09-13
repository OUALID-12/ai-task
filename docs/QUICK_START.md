# 🚀 Commandes de Démarrage - AI Task Extraction System

## Méthodes de Démarrage

### 1. 🎯 Uvicorn Direct (Recommandé)
```bash
python -m uvicorn main:app --reload --port 8000
```
**Avantages :** 
- Rechargement automatique en développement
- Compatible avec tous les outils de déploiement
- Standard de l'industrie pour FastAPI

### 2. 📜 Script de Démarrage
```bash
python run.py
```
**Avantages :** 
- Interface simplifiée
- Messages d'aide intégrés

### 3. 🔧 Direct depuis Source
```bash
python src/api/main.py
```
**Avantages :** 
- Accès direct aux modules organisés

## Endpoints Disponibles

- **API Root**: http://localhost:8000/
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Tests Rapides

```bash
# Vérifier que l'API fonctionne
curl http://localhost:8000/

# Vérifier la santé
curl http://localhost:8000/health

# Documentation interactive
# Ouvrir http://localhost:8000/docs dans le navigateur
```

## Configuration Avancée

### Variables d'Environnement
```bash
set OPENROUTER_API_KEY=your_key_here
set API_HOST=0.0.0.0
set API_PORT=8000
```

### Options Uvicorn Avancées
```bash
# Production
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Avec workers (production)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# SSL (production)
python -m uvicorn main:app --host 0.0.0.0 --port 443 --ssl-keyfile key.pem --ssl-certfile cert.pem
```

## Structure du Projet

```
agent_tache_demo/
├── main.py              ← Point d'entrée uvicorn
├── run.py               ← Script de démarrage alternatif
├── src/                 ← Code source organisé
│   ├── api/
│   ├── core/
│   ├── services/
│   └── utils/
├── config/              ← Configuration
├── data/                ← Données
├── docs/                ← Documentation
└── tests/               ← Tests
```

✅ **Le projet est prêt pour la production !**
