# 📚 Guía de Git: Commit y Push

## Estado Actual

✅ **Commit completado localmente:**
- Archivo modificado: `DEPLOY-QUICK.md`
- Mensaje: "docs: actualizar guía de configuración de base de datos"
- Commit hash: `ea0e061`

⚠️ **Pendiente:** Push al repositorio remoto

---

## 🚀 Cómo hacer Push

### Opción 1: Push mediante SSH (recomendado)

Tu repositorio está configurado para usar SSH con un alias personalizado. Ejecuta:

```bash
git push origin main
```

**Si obtienes error de SSH:**
1. Verifica tu configuración SSH en `~/.ssh/config`
2. Asegúrate de tener una entrada como esta:
```
Host github.com-mprietos
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_mprietos
```
3. Verifica que tu clave SSH esté agregada:
```bash
ssh-add -l
# Si no aparece, añádela:
ssh-add ~/.ssh/id_rsa_mprietos
```

### Opción 2: Push mediante HTTPS (alternativa)

Si tienes problemas con SSH, puedes cambiar temporalmente a HTTPS:

```bash
# Cambiar a HTTPS
git remote set-url origin https://github.com/mprietos/rehab.git

# Hacer push
git push origin main

# (Opcional) Volver a SSH después
git remote set-url origin git@github.com-mprietos:mprietos/rehab.git
```

**Nota:** Con HTTPS necesitarás un Personal Access Token de GitHub.

---

## 📋 Comandos Git Básicos

### Ver el estado actual
```bash
git status
```

### Ver los commits locales pendientes de push
```bash
git log origin/main..HEAD
```

### Ver diferencias entre tu rama y el remoto
```bash
git diff origin/main
```

### Hacer commit de cambios
```bash
# Ver qué archivos cambiaron
git status

# Añadir archivos específicos
git add archivo1.md archivo2.js

# O añadir todos los cambios
git add .

# Crear commit
git commit -m "Descripción del cambio"
```

### Push al repositorio remoto
```bash
# Push a la rama main
git push origin main

# Push forzado (¡CUIDADO! Solo si sabes lo que haces)
git push --force origin main
```

---

## 🔐 Archivos de Configuración (.env)

### ⚠️ IMPORTANTE: Seguridad

Los archivos `.env` y `.env.local` están en `.gitignore` y **NUNCA deben committearse** porque contienen información sensible:

- Contraseñas de base de datos
- Claves JWT
- API keys
- Tokens de autenticación

### Archivos ignorados por Git:
```
.env
.env.local
.env.production
.env.development
.env.*.local
```

### ✅ Qué SÍ debes committear:
```
.env.example       # Plantilla sin valores reales
README.md          # Documentación
DEPLOY-QUICK.md    # Guías
```

---

## 🛠️ Flujo de trabajo completo

### 1. Hacer cambios en código
```bash
# Editar archivos...
code api/routes/auth.js
```

### 2. Verificar cambios
```bash
git status
git diff
```

### 3. Añadir archivos al staging
```bash
git add api/routes/auth.js
# o
git add .
```

### 4. Crear commit
```bash
git commit -m "feat: añadir autenticación con JWT"
```

### 5. Push al remoto
```bash
git push origin main
```

### 6. Verificar en GitHub
Ve a tu repositorio en GitHub para confirmar que los cambios se subieron correctamente.

---

## 🚨 Solución de Problemas Comunes

### Error: "Could not resolve hostname github.com-mprietos"

**Causa:** Problema con la configuración SSH.

**Solución:**
1. Verifica tu archivo `~/.ssh/config`:
```bash
cat ~/.ssh/config
```

2. Debe contener algo como:
```
Host github.com-mprietos
  HostName github.com
  User git
  IdentityFile ~/.ssh/tu_clave_privada
```

3. Verifica que la clave SSH esté cargada:
```bash
ssh-add -l
ssh-add ~/.ssh/tu_clave_privada
```

4. Prueba la conexión SSH:
```bash
ssh -T git@github.com-mprietos
```

### Error: "Permission denied (publickey)"

**Solución:**
```bash
# Generar nueva clave SSH si no tienes una
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Añadir la clave al ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar la clave pública y añadirla a GitHub
cat ~/.ssh/id_ed25519.pub
# Ve a GitHub → Settings → SSH and GPG keys → New SSH key
```

### Error: "Updates were rejected"

**Causa:** Hay commits en el remoto que no tienes localmente.

**Solución:**
```bash
# Obtener cambios del remoto
git pull origin main

# Resolver conflictos si los hay
# Luego hacer push
git push origin main
```

---

## 📖 Comandos Útiles Adicionales

### Ver historial de commits
```bash
git log --oneline --graph --all
```

### Deshacer último commit (mantener cambios)
```bash
git reset --soft HEAD~1
```

### Deshacer cambios en un archivo (¡CUIDADO!)
```bash
git restore archivo.js
```

### Ver ramas
```bash
git branch -a
```

### Crear nueva rama
```bash
git checkout -b feature/nueva-funcionalidad
```

### Cambiar entre ramas
```bash
git checkout main
git checkout develop
```

---

## 🎯 Resumen Rápido

```bash
# Flujo básico
git status              # Ver cambios
git add .               # Añadir todos los archivos
git commit -m "mensaje" # Crear commit
git push origin main    # Subir al remoto

# Verificar antes de push
git log origin/main..HEAD  # Ver commits pendientes
git diff origin/main       # Ver diferencias
```

---

## 📌 Notas Finales

- **Commit actual pendiente de push:** "docs: actualizar guía de configuración de base de datos"
- **Repositorio remoto:** `git@github.com-mprietos:mprietos/rehab.git`
- **Rama actual:** `main`

Para hacer push de los cambios actuales, ejecuta:
```bash
cd /Users/miguelprieto/Desktop/mios/custom/adiccare/rehabcompanion-vercel
git push origin main
```

Si tienes problemas con SSH, revisa la sección "Solución de Problemas Comunes" arriba.
