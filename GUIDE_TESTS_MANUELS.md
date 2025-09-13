# 🧪 GUIDE DE TESTS MANUELS
===============================

## 📋 Pré-requis
```powershell
# Terminal 1 - Serveur
python -m uvicorn main:app --port 8000

# Terminal 2 - Tests manuels
```

## 🔵 TESTS DE BASE

### 1. Santé du système
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET
```
**Attendu** : Status 200, JSON avec système OK

### 2. Liste des tâches
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/all-tasks" -Method GET
```
**Attendu** : Status 200, JSON avec liste des tâches

---

## 🟢 SYSTÈME DE TAGS

### 3. Créer une tâche avec tags
```powershell
$task = @{
    title = "Test Manuel"
    description = "Tâche créée manuellement"
    priority = "high"
    department = "test"
    tags = @("manuel", "test", "validation")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/tasks/create" -Method POST -Body $task -ContentType "application/json"
```
**Attendu** : Status 200, retourne task_id

### 4. Voir tous les tags
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/tags" -Method GET
```
**Attendu** : Status 200, liste des tags avec compteurs

### 5. Tags populaires
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/tags/popular" -Method GET
```
**Attendu** : Status 200, top tags par utilisation

### 6. Tâches par tag
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/tags/test/tasks" -Method GET
```
**Attendu** : Status 200, tâches avec le tag "test"

---

## 🟣 MODIFICATIONS (utilisez le task_id obtenu ci-dessus)

### 7. Modifier priorité
```powershell
$priority = @{ priority = "medium" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/priority" -Method PATCH -Body $priority -ContentType "application/json"
```

### 8. Modifier description
```powershell
$desc = @{ description = "Description mise à jour manuellement" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/description" -Method PATCH -Body $desc -ContentType "application/json"
```

### 9. Ajouter tags
```powershell
$tags = @{ tags = @("nouveau", "manuel") } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/tags" -Method POST -Body $tags -ContentType "application/json"
```

### 10. Supprimer un tag
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/tags/nouveau" -Method DELETE
```

---

## 🎯 ACTIONS SUR TÂCHES

### 11. Valider une tâche
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/validate" -Method PATCH
```

### 12. Rejeter une tâche
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/reject?rejection_reason=Test manuel" -Method PATCH
```

### 13. Compléter une tâche
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/tasks/[TASK_ID]/complete" -Method PATCH
```

---

## 🟡 FILTRES

### 14. Filtrer par statut
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/all-tasks?status=pending" -Method GET
```

### 15. Filtrer par priorité
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/all-tasks?priority=high" -Method GET
```

### 16. Filtres multiples
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/all-tasks?status=pending&priority=high&validated=false" -Method GET
```

---

## ⚫ MONITORING

### 17. Santé système détaillée
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/monitoring/system_health" -Method GET
```

### 18. Statistiques cache
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/cache/stats" -Method GET
```

### 19. Statut watcher
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/watcher/status" -Method GET
```

---

## 📧 TRAITEMENT

### 20. Traiter emails
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/traiter-emails" -Method GET
```

### 21. Traiter meetings
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/traiter-meetings" -Method GET
```

---

## 📊 VÉRIFICATIONS

Après chaque test :
- ✅ Status Code = 200 = Succès
- ❌ Status Code = 4xx/5xx = Erreur
- 📄 Contenu JSON = Réponse valide

## 🎯 ENDPOINTS CRITIQUES À TESTER ABSOLUMENT

1. **Création tâche** (#3)
2. **Liste tags** (#4) 
3. **Modification priorité** (#7)
4. **Modification description** (#8)
5. **Ajout tags** (#9)
6. **Validation tâche** (#11)

Si ces 6 tests passent, le système est **opérationnel** ! 🎉
