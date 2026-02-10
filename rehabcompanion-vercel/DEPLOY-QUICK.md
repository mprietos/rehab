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

## Documentación Completa
Ver `DEPLOY-GUIDE.md` para instrucciones detalladas.
