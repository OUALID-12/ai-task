# -*- coding: utf-8 -*-
"""
Configuration constants for AI Task Extraction System
"""

import os

# Configuration Email
EMAIL_CONF = {
    "MAIL_USERNAME": "your_email@example.com",  # Remplacer par votre email
    "MAIL_PASSWORD": "your_password",  # Remplacer par votre mot de passe
    "MAIL_FROM": "your_email@example.com",  # Remplacer par votre email
    "MAIL_PORT": 587,
    "MAIL_SERVER": "smtp.gmail.com",  # Ou votre serveur SMTP
    "MAIL_STARTTLS": True,
    "MAIL_SSL_TLS": False,
    "USE_CREDENTIALS": True,
    "VALIDATE_CERTS": True
}

# Configuration des fichiers
DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "tasks.json")
LOG_FILE = os.path.join(DATA_DIR, "logs.json")
UNIFIED_TASKS_FILE = os.path.join(DATA_DIR, "unified_tasks.json")

# CORS origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175"
]

# Server configuration
HOST = "127.0.0.1"
PORT = 8000
RELOAD = True

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Create files if they don't exist
for file_path in [DATA_FILE, LOG_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            import json
            json.dump([], f, ensure_ascii=False, indent=4)
