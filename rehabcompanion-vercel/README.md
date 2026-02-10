# 🌱 RehabCompanion - MVP (Vercel + Supabase)

Plataforma SaaS para clínicas de rehabilitación con gamificación positiva basada en el concepto "El Jardín de la Recuperación".

**Versión optimizada para despliegue gratuito en Vercel + Supabase.**

---

## 🚀 Despliegue Rápido

Este proyecto está configurado para desplegarse **completamente gratis** en:

- **Frontend + API**: Vercel (serverless functions)
- **Base de Datos**: Supabase (PostgreSQL)

### Para desplegar tu propia instancia:

1. **Lee la guía completa**: [DEPLOY.md](./DEPLOY.md)
2. **Tiempo estimado**: 15-20 minutos
3. **Costo**: $0 (100% gratuito)

---

## 📋 Características

- **Sistema de Gamificación No Competitivo**: Los pacientes cuidan de una planta virtual que evoluciona según su progreso
- **Gestión de Tareas Diarias**: Medicación, actividades físicas y check-ins emocionales
- **Seguridad**: Encriptación AES-256 para datos sensibles, autenticación JWT
- **UI Moderna**: React + Vite + PrimeReact + Tailwind CSS
- **Arquitectura Serverless**: Sin servidor que mantener, escala automáticamente

---

## 🎯 Concepto de Gamificación

### "El Jardín de la Recuperación"

En lugar de puntos y rankings competitivos, usamos una metáfora de crecimiento personal:

- **Etapas**: 
  - 🌱 **Semilla** (0-99 XP): Comenzando el viaje
  - 🌿 **Brote** (100-299 XP): Primeros brotes de progreso
  - 🪴 **Planta** (300-599 XP): Crecimiento sólido
  - 🌻 **Flor** (600+ XP): Florecimiento completo

### Recompensas por Tipo de Tarea

- **Medicación** 💊: +20 XP
- **Actividad Física** ⚡: +30 XP
- **Check Emocional** ☀️: +15 XP

---

## 🛠️ Stack Tecnológico

### Backend (Serverless)
- Vercel Functions (Node.js)
- Supabase PostgreSQL
- bcrypt (passwords)
- crypto-js (datos médicos AES-256)
- jsonwebtoken (autenticación)

### Frontend
- React 18
- Vite
- PrimeReact (componentes UI)
- Tailwind CSS (estilos)
- Axios (HTTP client)

---

## 📦 Estructura del Proyecto

```
rehabcompanion-vercel/
├── api/                         # Funciones Serverless de Vercel
│   ├── auth/
│   │   ├── login.js            # POST /api/auth/login
│   │   └── profile.js          # GET /api/auth/profile
│   ├── tasks/
│   │   ├── list.js             # GET /api/tasks/list
│   │   └── complete.js         # POST /api/tasks/complete
│   ├── garden/
│   │   └── state.js            # GET /api/garden/state
│   ├── utils/
│   │   ├── db.js               # PostgreSQL connection pool
│   │   ├── auth.js             # JWT utilities
│   │   └── encryption.js       # AES-256 encryption
│   ├── schema.sql              # Database schema
│   ├── seed.sql                # Sample data
│   └── package.json
│
├── client/                      # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── GardenWidget.jsx
│   │   │   └── TaskList.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── vercel.json                  # Configuración de Vercel
├── DEPLOY.md                    # 📚 Guía de despliegue
├── README.md                    # Este archivo
└── package.json                 # Scripts raíz
```

---

## 🔐 Seguridad

### Encriptación de Datos Sensibles

- **Contraseñas**: Hasheadas con bcrypt (salt de 10 rounds)
- **Datos médicos**: Encriptados con AES-256
- **JWT**: Tokens con expiración de 7 días

### Row Level Security (RLS)

Supabase incluye RLS para proteger datos a nivel de fila.

---

## 🌐 API Endpoints

Todas las rutas están bajo `/api`:

### Autenticación

```
POST /api/auth/login       # Iniciar sesión
GET  /api/auth/profile     # Obtener perfil (requiere auth)
```

### Tareas

```
GET  /api/tasks/list       # Obtener tareas del día
POST /api/tasks/complete   # Completar tarea (lógica de gamificación)
```

### Jardín

```
GET /api/garden/state      # Obtener estado del jardín
```

---

## 👥 Usuarios de Prueba

Una vez desplegado y ejecutado el seed, tendrás:

| Email | Contraseña | Rol | Etapa | XP |
|-------|-----------|-----|-------|-----|
| juan.perez@email.com | patient123 | Paciente | 🌱 SEED | 30 |
| lucia.fernandez@email.com | patient123 | Paciente | 🌿 SPROUT | 150 |
| miguel.santos@email.com | patient123 | Paciente | 🪴 PLANT | 450 |
| sofia.lopez@email.com | patient123 | Paciente | 🪴 PLANT | 580 |
| david.ruiz@email.com | patient123 | Paciente | 🌻 FLOWER | 850 |
| dr.rodriguez@esperanza-rehab.es | doctor123 | Doctor | - | - |
| dr.martinez@esperanza-rehab.es | doctor123 | Doctor | - | - |
| admin@esperanza-rehab.es | admin123 | Admin | - | - |

---

## 🧪 Desarrollo Local (Opcional)

Si quieres desarrollar localmente antes de desplegar:

### 1. Instalar dependencias

```bash
npm run install:all
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz basado en `.env.example`:

```env
DATABASE_URL=tu_supabase_connection_string
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
JWT_SECRET=tu_jwt_secret
ENCRYPTION_MASTER_KEY=tu_encryption_key
```

### 3. Iniciar desarrollo

```bash
# Frontend (puerto 5173)
cd client
npm run dev

# API local requiere Vercel CLI
npm i -g vercel
vercel dev
```

---

## 📊 Límites del Plan Gratuito

### Vercel (Free Tier)
- ✅ 100 GB de ancho de banda/mes
- ✅ 100 GB-hrs de ejecución serverless/mes
- ✅ Dominios personalizados ilimitados
- ✅ SSL automático
- ✅ Edge Network global

### Supabase (Free Tier)
- ✅ 500 MB de base de datos
- ✅ 2 GB de transferencia/mes
- ✅ 1 GB de almacenamiento de archivos
- ✅ Backups automáticos diarios
- ✅ API RESTful automática

**Más que suficiente para un MVP y primeras validaciones.**

---

## 🔄 Actualizaciones

Para actualizar tu aplicación desplegada:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Vercel detectará el push y redespleará automáticamente en 1-2 minutos.

---

## 📚 Documentación Adicional

- [Guía de Despliegue Completa](./DEPLOY.md)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)

---

## 🐛 Troubleshooting

Ver sección completa de troubleshooting en [DEPLOY.md](./DEPLOY.md#5-troubleshooting).

Problemas comunes:
- Error de build → Revisar Build Logs en Vercel
- Error de DB → Verificar variables de entorno
- Error 500 en API → Revisar Function Logs en Vercel

---

## 📝 Licencia

MIT

---

**¡Que cada paciente florezca en su jardín de recuperación! 🌻**
