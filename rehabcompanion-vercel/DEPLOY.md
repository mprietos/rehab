# 🚀 Guía de Despliegue - RehabCompanion en Vercel + Supabase

Esta guía te llevará paso a paso para desplegar **RehabCompanion** completamente gratis usando **Vercel** (frontend + API serverless) y **Supabase** (base de datos PostgreSQL).

---

## 📋 Índice

1. [Configurar Base de Datos en Supabase](#1-configurar-base-de-datos-en-supabase)
2. [Configurar y Desplegar en Vercel](#2-configurar-y-desplegar-en-vercel)
3. [Verificar Despliegue](#3-verificar-despliegue)
4. [Usuarios de Prueba](#4-usuarios-de-prueba)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Configurar Base de Datos en Supabase

### 1.1. Crear Cuenta y Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** y crea una cuenta (gratis)
3. Crea un nuevo proyecto:
   - **Project name**: `rehabcompanion`
   - **Database Password**: Guarda esta contraseña (la necesitarás después)
   - **Region**: Elige la más cercana a tu ubicación
   - **Plan**: Free (suficiente para el MVP)
4. Espera 1-2 minutos mientras Supabase crea tu proyecto

### 1.2. Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono en el menú lateral izquierdo)
2. Haz clic en **"New query"**
3. Copia TODO el contenido del archivo `api/schema.sql` de este proyecto
4. Pégalo en el editor SQL
5. Haz clic en **"Run"** (botón verde abajo a la derecha)
6. Deberías ver: ✅ **Success. No rows returned**

### 1.3. Cargar Datos de Prueba (Seed)

1. En el mismo **SQL Editor**, crea una nueva query
2. Copia TODO el contenido del archivo `api/seed.sql`
3. Pégalo en el editor SQL
4. Haz clic en **"Run"**
5. Deberías ver: ✅ **Success. No rows returned**

### 1.4. Obtener Credenciales de Supabase

1. Ve a **Project Settings** (icono de engranaje en el menú lateral)
2. Ve a la sección **Database**:
   - Copia la **Connection String** (URI mode)
   - Ejemplo: `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres`
   - Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el paso 1.1
3. Ve a la sección **API**:
   - Copia el **Project URL** (ej: `https://xxxxx.supabase.co`)
   - Copia el **anon public** key (una clave larga que empieza con `eyJ...`)

**Guarda estas 3 credenciales:**
- ✅ DATABASE_URL
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY

---

## 2. Configurar y Desplegar en Vercel

### 2.1. Preparar el Repositorio en GitHub

1. Ve a [https://github.com](https://github.com) e inicia sesión
2. Crea un **nuevo repositorio**:
   - Nombre: `rehabcompanion`
   - Visibilidad: Público o Privado (tu elección)
   - **NO** inicialices con README, .gitignore ni licencia
3. En tu computadora, abre una terminal en la carpeta del proyecto:

```bash
cd rehabcompanion-vercel

# Inicializar Git
git init

# Añadir todos los archivos
git add .

# Hacer primer commit
git commit -m "Initial commit - RehabCompanion MVP"

# Conectar con GitHub (reemplaza tu-usuario con tu nombre de usuario)
git remote add origin https://github.com/tu-usuario/rehabcompanion.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

### 2.2. Desplegar en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** y autentícate con tu cuenta de GitHub
3. Una vez dentro, haz clic en **"Add New..."** → **"Project"**
4. **Importa tu repositorio**:
   - Busca `rehabcompanion` en la lista
   - Haz clic en **"Import"**

5. **Configurar el proyecto**:
   - **Framework Preset**: Vite
   - **Root Directory**: Déjalo en `.` (raíz)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm run install:all`

6. **Configurar Variables de Entorno**:
   
   Haz clic en **"Environment Variables"** y añade las siguientes:

   | Nombre | Valor |
   |--------|-------|
   | `DATABASE_URL` | Tu connection string de Supabase |
   | `SUPABASE_URL` | Tu project URL de Supabase |
   | `SUPABASE_ANON_KEY` | Tu anon key de Supabase |
   | `JWT_SECRET` | Genera una clave aleatoria segura* |
   | `ENCRYPTION_MASTER_KEY` | Genera otra clave aleatoria de 32 caracteres* |
   | `NODE_ENV` | `production` |

   **Para generar claves aleatorias seguras*, puedes usar:**
   ```bash
   # En terminal (Linux/Mac)
   openssl rand -base64 32
   
   # O visita: https://www.random.org/strings/
   ```

7. Haz clic en **"Deploy"**

8. Espera 2-3 minutos mientras Vercel construye y despliega tu aplicación

9. ✅ Cuando termine, verás: **"Congratulations! Your project is live!"**

---

## 3. Verificar Despliegue

### 3.1. Acceder a tu Aplicación

1. Vercel te dará una URL como: `https://rehabcompanion.vercel.app`
2. Haz clic en **"Visit"** o abre esa URL en tu navegador
3. Deberías ver la página de **Login de RehabCompanion** 🌱

### 3.2. Probar Login

Usa uno de los usuarios de prueba:

- **Email**: `juan.perez@email.com`
- **Password**: `patient123`

Si el login funciona y ves el dashboard con el jardín, ¡**ÉXITO TOTAL**! 🎉

### 3.3. Verificar las API Functions

Vercel habrá creado automáticamente estas rutas:

- `https://tu-app.vercel.app/api/auth/login`
- `https://tu-app.vercel.app/api/auth/profile`
- `https://tu-app.vercel.app/api/tasks/list`
- `https://tu-app.vercel.app/api/tasks/complete`
- `https://tu-app.vercel.app/api/garden/state`

Puedes probarlas con curl:

```bash
curl https://tu-app.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@email.com","password":"patient123"}'
```

---

## 4. Usuarios de Prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

### Pacientes (Diferentes Etapas del Jardín)

| Email | Contraseña | Etapa | XP | Descripción |
|-------|-----------|-------|-----|-------------|
| `juan.perez@email.com` | `patient123` | 🌱 SEED | 30 | Recién comenzando |
| `lucia.fernandez@email.com` | `patient123` | 🌿 SPROUT | 150 | Primeros brotes |
| `miguel.santos@email.com` | `patient123` | 🪴 PLANT | 450 | Crecimiento sólido |
| `sofia.lopez@email.com` | `patient123` | 🪴 PLANT | 580 | Casi floreciendo |
| `david.ruiz@email.com` | `patient123` | 🌻 FLOWER | 850 | ¡Completamente florecido! |

### Doctores

| Email | Contraseña |
|-------|-----------|
| `dr.rodriguez@esperanza-rehab.es` | `doctor123` |
| `dr.martinez@esperanza-rehab.es` | `doctor123` |

### Admin

| Email | Contraseña |
|-------|-----------|
| `admin@esperanza-rehab.es` | `admin123` |

---

## 5. Troubleshooting

### ❌ Error: "Build Failed" en Vercel

**Solución**:
1. Ve a **Deployment** → **Build Logs**
2. Revisa los errores
3. Comunes:
   - Falta alguna dependencia → Verifica que `package.json` esté correcto
   - Error en Build Command → Asegúrate de que sea: `cd client && npm install && npm run build`

### ❌ Error: "Database connection failed"

**Solución**:
1. Ve a Vercel → **Settings** → **Environment Variables**
2. Verifica que `DATABASE_URL` sea correcta
3. En Supabase, ve a **Database Settings** y verifica que la conexión esté activa
4. Redespliega: En Vercel, ve a **Deployments** → Haz clic en los 3 puntos del último deployment → **Redeploy**

### ❌ Error: "Invalid credentials" al hacer login

**Solución**:
1. Verifica que ejecutaste el `seed.sql` en Supabase
2. En Supabase SQL Editor, ejecuta:
   ```sql
   SELECT email FROM users;
   ```
3. Deberías ver los 8 emails de prueba
4. Si no aparecen, vuelve a ejecutar `seed.sql`

### ❌ La aplicación carga pero la API no responde

**Solución**:
1. En Vercel, ve a **Functions**
2. Deberías ver las funciones: `auth/login.js`, `auth/profile.js`, etc.
3. Si no aparecen, verifica que la carpeta `api` esté en la raíz del repositorio
4. Redespliega

### ❌ Error 500 en las API functions

**Solución**:
1. En Vercel, ve a **Functions** → Haz clic en la función con error
2. Ve a **Logs** (parte inferior)
3. Revisa el error específico
4. Usualmente es por variables de entorno mal configuradas

---

## 6. Configuración Adicional (Opcional)

### 6.1. Dominio Personalizado

1. En Vercel, ve a **Settings** → **Domains**
2. Añade tu dominio personalizado
3. Sigue las instrucciones de Vercel para configurar DNS

### 6.2. Monitoreo de Base de Datos

1. En Supabase, ve a **Database** → **Query Performance**
2. Puedes ver estadísticas de uso
3. El plan gratuito incluye:
   - 500 MB de espacio
   - 2 GB de transferencia
   - Más que suficiente para este MVP

### 6.3. Backups Automáticos

1. En Supabase, ve a **Database** → **Backups**
2. Supabase hace backups automáticos diarios
3. Puedes restaurar en cualquier momento

---

## 7. Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# Hacer cambios en tu código local

# Commit
git add .
git commit -m "Descripción de cambios"

# Push a GitHub
git push

# Vercel detectará el push y redespleará automáticamente
```

---

## 🎉 ¡Listo!

Tu aplicación **RehabCompanion** está ahora:

- ✅ Desplegada en **Vercel** (frontend + API serverless)
- ✅ Conectada a **Supabase** (PostgreSQL)
- ✅ Completamente GRATIS
- ✅ Con SSL/HTTPS automático
- ✅ Con CI/CD automático (cada push a GitHub redespliega)

**URL de tu app**: https://rehabcompanion.vercel.app (o tu dominio personalizado)

---

## 📚 Recursos Adicionales

- **Documentación de Vercel**: https://vercel.com/docs
- **Documentación de Supabase**: https://supabase.com/docs
- **Límites del Plan Gratuito de Vercel**: 
  - 100 GB de ancho de banda
  - 100 GB-hrs de ejecución serverless
  - Más que suficiente para un MVP
- **Límites del Plan Gratuito de Supabase**:
  - 500 MB de base de datos
  - 2 GB de transferencia
  - 1 GB de almacenamiento de archivos

---

**Desarrollado con 💚 para tu recuperación**
