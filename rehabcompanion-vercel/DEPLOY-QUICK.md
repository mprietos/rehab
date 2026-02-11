# 🚀 Guía Rápida de Despliegue

## Pasos Esenciales (30 minutos)

### 1. Supabase (5 min)
```
1. Ir a https://supabase.com → New Project
2. Nombre: "adiccare-prod"
3. Generar contraseña segura (guardarla)
4. Region: EU (más cercano)
5. Copiar Connection String (Transaction mode)
```
xXcX7b8i088g

### 2. Aplicar Schema (3 min)
```bash
cd api
echo 'DATABASE_URL="tu-connection-string-aqui"' > .env
npx prisma generate
npx prisma db push
```

### 3. Poblar Datos (2 min)
```bash
cd api
node seed-production.js
```

Credenciales creadas:
- **Doctor**: `dr.rodriguez@esperanza-rehab.es` / `password123`
- **Paciente 1**: `juan.perez@email.com` / `password123`
- **Paciente 2**: `lucia.fernandez@email.com` / `password123`

### 4. Vercel (10 min)

#### 4.1 Conectar GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 4.2 Importar en Vercel
1. https://vercel.com → Add New Project
2. Import tu repositorio
3. Framework: **Vite**
4. Root Directory: **/**
5. Build Command: `cd client && npm install && npm run build`
6. Output Directory: `client/dist`

#### 4.3 Variables de Entorno
En Settings → Environment Variables:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres

JWT_SECRET=genera_con_comando_abajo

NODE_ENV=production
```

Generar JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Deploy (5 min)
```bash
# Automático al hacer push
git push origin main

# O manual
vercel --prod
```

### 6. Verificar (5 min)
✅ Health check: `https://tu-app.vercel.app/health`
✅ Login: `https://tu-app.vercel.app/login`
✅ Probar con las credenciales de arriba

---

## Troubleshooting Rápido

### ❌ Database connection failed
- Usa Connection Pooling (Transaction mode)
- Verifica contraseña en DATABASE_URL

### ❌ Build failed
- Verifica que `vercel.json` esté en la raíz
- Revisa logs en Vercel Dashboard

### ❌ API no responde
- Verifica que las rutas en `vercel.json` estén bien
- Revisa Functions logs en Vercel

### ❌ Login falla
- Regenera JWT_SECRET
- Verifica que sea el mismo en Vercel y en seed local

---

## 📝 Configuración de Variables de Entorno

### Diferencias entre .env y .env.local

El proyecto usa dos archivos de configuración:

#### `.env` - Producción (Supabase con Connection Pooling)
```env
# Connection Pooling para producción usando Supabase Pooler
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-REGION.pooler.supabase.com:5432/postgres
NODE_ENV=production
```

**Características:**
- ✅ Usa **Supabase Pooler** (Session Mode)
- ✅ Puerto **5432** con pooling automático
- ✅ Optimizado para producción y serverless (Vercel)
- ✅ Mejor rendimiento con múltiples conexiones
- ✅ Soporta IPv4 (sin problemas de conectividad)

**Cuándo usar:**
- Al hacer deploy a Vercel
- Para ejecutar `npx prisma db push` en producción
- Para seed de datos en producción

#### `.env.local` - Desarrollo Local
```env
# Conexión directa para desarrollo - Puerto 5432
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
NODE_ENV=development
```

**Características:**
- ✅ Usa puerto **5432** (Conexión directa)
- ✅ Parámetro `sslmode=require` para seguridad
- ✅ Soporta migraciones y operaciones de Prisma
- ✅ Ideal para desarrollo y debugging

**Cuándo usar:**
- Al desarrollar localmente (`npm run dev`)
- Para ejecutar migraciones con Prisma
- Para testing local

### Cómo cambiar entre entornos

**Opción 1: Renombrar archivos (Manual)**
```bash
# Para usar producción
mv .env .env.backup
mv .env.production .env

# Para usar local
mv .env .env.production
mv .env.local .env
```

**Opción 2: Variables de entorno en el comando**
```bash
# Desarrollo local
NODE_ENV=development npm run dev

# Producción
NODE_ENV=production npm start
```

**Opción 3: Usar dotenv-cli (Recomendado)**
```bash
# Instalar
npm install -g dotenv-cli

# Usar con .env.local
dotenv -e .env.local -- npm run dev

# Usar con .env (producción)
dotenv -e .env -- npx prisma db push
```

### Configuración de Supabase

**Para obtener la URL de conexión:**

1. Ve a tu proyecto en Supabase
2. Settings → Database
3. Copia las URLs según tu necesidad:

   **Connection Pooling (Producción) - Session Mode:**
   - Ve a: **Settings → Database → Connection Pooling**
   - Selecciona: **Session Mode**
   - URI: `postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-1-REGION.pooler.supabase.com:5432/postgres`
   - **Importante:** Usa el pooler (`aws-X-region.pooler.supabase.com`), no la conexión directa

   **Direct Connection (Local/Migraciones):**
   - Ve a: **Settings → Database → Connection String**
   - Selecciona: **URI**
   - URI: `postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres`
   - Añade: `?sslmode=require`
   - **Nota:** Puede tener problemas con IPv6 en algunos entornos locales

### ⚠️ Importante

- **NUNCA** commitees archivos `.env` con credenciales reales
- Añade `.env*` a tu `.gitignore`
- Usa `.env.example` para documentar variables requeridas
- Regenera `JWT_SECRET` y `ENCRYPTION_MASTER_KEY` en producción

---

## Documentación Completa
Ver `DEPLOY-GUIDE.md` para instrucciones detalladas.
