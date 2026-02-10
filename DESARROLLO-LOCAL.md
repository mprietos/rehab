# 💻 Guía de Desarrollo Local - RehabCompanion

Esta guía te permite ejecutar **RehabCompanion completamente en local** sin necesidad de Vercel ni Supabase.

---

## 📋 Prerrequisitos

1. **Node.js** v18 o superior → [Descargar](https://nodejs.org/)
2. **PostgreSQL** instalado y corriendo → [Descargar](https://www.postgresql.org/download/)
3. **Git** (opcional, para clonar)

---

## 🚀 Instalación Rápida

### Paso 1: Descomprimir el Proyecto

```bash
# Descomprimir el ZIP descargado
unzip rehabcompanion-vercel.zip
cd rehabcompanion-vercel
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias (raíz, api y client)
npm install
cd api && npm install
cd ../client && npm install
cd ..
```

---

## 🗄️ Configurar Base de Datos PostgreSQL Local

### Opción A: Usar PostgreSQL Instalado Localmente

#### 1. Crear Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Dentro de psql:
CREATE DATABASE rehabcompanion_db;

# Salir
\q
```

#### 2. Ejecutar Schema

```bash
# Ejecutar el schema SQL
psql -U postgres -d rehabcompanion_db -f api/schema.sql
```

#### 3. Cargar Datos de Prueba

```bash
# Ejecutar el seed SQL
psql -U postgres -d rehabcompanion_db -f api/seed.sql
```

### Opción B: Usar Docker (Alternativa)

Si prefieres usar Docker para PostgreSQL:

```bash
# Iniciar PostgreSQL con Docker
docker run --name rehabcompanion-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rehabcompanion_db \
  -p 5432:5432 \
  -d postgres:15

# Esperar 5 segundos para que inicie
sleep 5

# Ejecutar schema
docker exec -i rehabcompanion-db psql -U postgres -d rehabcompanion_db < api/schema.sql

# Ejecutar seed
docker exec -i rehabcompanion-db psql -U postgres -d rehabcompanion_db < api/seed.sql
```

---

## ⚙️ Configurar Variables de Entorno

### 1. Crear archivo .env en la raíz del proyecto

```bash
# Crear .env desde la raíz
touch .env
```

### 2. Editar .env con estas variables:

```env
# Database Configuration (PostgreSQL Local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rehabcompanion_db

# Si usas un usuario diferente o contraseña diferente:
# DATABASE_URL=postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/rehabcompanion_db

# Security (genera claves aleatorias)
JWT_SECRET=mi_clave_jwt_super_secreta_local_12345
ENCRYPTION_MASTER_KEY=mi_clave_encriptacion_32_chars_00

# Environment
NODE_ENV=development
```

**💡 Tip para generar claves aleatorias:**

```bash
# En Linux/Mac:
openssl rand -base64 32

# O simplemente usa cualquier string aleatorio largo
```

---

## 🎯 Estructura para Desarrollo Local

Como las funciones serverless de Vercel no funcionan directamente en local, vamos a crear un servidor Express tradicional:

### Crear servidor local (api/server.js)

```bash
# Crear el archivo
touch api/server.js
```

Copia este contenido en `api/server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde la raíz
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import handlers (serverless functions)
import loginHandler from './auth/login.js';
import profileHandler from './auth/profile.js';
import tasksListHandler from './tasks/list.js';
import tasksCompleteHandler from './tasks/complete.js';
import gardenStateHandler from './garden/state.js';

// Wrapper to adapt serverless functions to Express
const wrapHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Routes - mapping serverless functions to Express routes
app.post('/api/auth/login', wrapHandler(loginHandler));
app.get('/api/auth/profile', wrapHandler(profileHandler));
app.get('/api/tasks/list', wrapHandler(tasksListHandler));
app.post('/api/tasks/complete', wrapHandler(tasksCompleteHandler));
app.get('/api/garden/state', wrapHandler(gardenStateHandler));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'RehabCompanion API - Local Development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌱 RehabCompanion API Server - LOCAL DEVELOPMENT');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Base: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════════════\n');
});

export default app;
```

### Actualizar api/package.json

Agrega este script al `package.json` de la carpeta `api`:

```json
{
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js"
  }
}
```

---

## ▶️ Ejecutar la Aplicación

### Opción 1: Ejecutar Todo con un Comando (Recomendado)

Vamos a crear un script en la raíz para ejecutar todo:

**Crear `package.json` en la raíz con estos scripts:**

```json
{
  "name": "rehabcompanion-local",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:client\"",
    "dev:api": "cd api && npm run dev",
    "dev:client": "cd client && npm run dev",
    "install:all": "npm install && cd api && npm install && cd ../client && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

**Instalar concurrently:**

```bash
npm install
```

**Ejecutar todo:**

```bash
npm run dev
```

Esto iniciará:
- 🔧 Backend API en `http://localhost:3000`
- 🎨 Frontend en `http://localhost:5173`

### Opción 2: Ejecutar Backend y Frontend por Separado

**Terminal 1 - Backend:**

```bash
cd api
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

Abre tu navegador en: `http://localhost:3000/health`

Deberías ver:

```json
{
  "status": "ok",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "service": "RehabCompanion API - Local Development"
}
```

### 2. Verificar Frontend

Abre tu navegador en: `http://localhost:5173`

Deberías ver la página de **Login de RehabCompanion** 🌱

### 3. Probar Login

Usa uno de los usuarios de prueba:

- **Email**: `juan.perez@email.com`
- **Password**: `patient123`

Si puedes iniciar sesión y ver el dashboard, ✅ **¡TODO FUNCIONA!**

---

## 🧪 Usuarios de Prueba Disponibles

Después del seed, tienes estos usuarios:

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

## 🔄 Workflow de Desarrollo

```bash
# 1. Primera vez
npm run install:all

# 2. Configurar PostgreSQL y ejecutar schema + seed

# 3. Crear .env con credenciales locales

# 4. Desarrollar
npm run dev

# 5. Hacer cambios en el código
# Los cambios se reflejarán automáticamente:
# - Frontend: Hot reload con Vite
# - Backend: Reinicia manualmente o usa nodemon
```

---

## 🛠️ Usar Nodemon para Auto-reload del Backend

Para que el backend se reinicie automáticamente al hacer cambios:

### 1. Instalar nodemon en api/

```bash
cd api
npm install --save-dev nodemon
```

### 2. Actualizar script en api/package.json

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

Ahora cuando ejecutes `npm run dev`, el backend se reiniciará automáticamente al guardar cambios.

---

## 🗄️ Gestión de Base de Datos Local

### Ver tablas

```bash
psql -U postgres -d rehabcompanion_db

# Dentro de psql:
\dt          # Listar tablas
\d users     # Ver estructura de tabla users
SELECT * FROM users;    # Ver todos los usuarios
\q           # Salir
```

### Resetear Base de Datos

```bash
# Borrar y recrear
psql -U postgres

DROP DATABASE rehabcompanion_db;
CREATE DATABASE rehabcompanion_db;
\q

# Re-ejecutar schema y seed
psql -U postgres -d rehabcompanion_db -f api/schema.sql
psql -U postgres -d rehabcompanion_db -f api/seed.sql
```

### Backup de Base de Datos

```bash
# Crear backup
pg_dump -U postgres rehabcompanion_db > backup.sql

# Restaurar desde backup
psql -U postgres -d rehabcompanion_db < backup.sql
```

---

## 🐛 Troubleshooting

### Error: "ECONNREFUSED" al conectar a PostgreSQL

**Problema**: PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución**:

```bash
# Verificar si PostgreSQL está corriendo
# Linux/Mac:
sudo service postgresql status

# Mac con Homebrew:
brew services list

# Windows: Verificar en Services que PostgreSQL está activo

# Si no está corriendo, iniciarlo:
# Linux:
sudo service postgresql start

# Mac:
brew services start postgresql

# Windows: Iniciar desde Services
```

### Error: "relation does not exist"

**Problema**: No se ejecutó el schema.sql

**Solución**:

```bash
psql -U postgres -d rehabcompanion_db -f api/schema.sql
```

### Error: "Cannot find module"

**Problema**: Faltan dependencias

**Solución**:

```bash
# Desde la raíz
npm run install:all

# O manualmente
cd api && npm install
cd ../client && npm install
```

### Puerto 3000 o 5173 en uso

**Problema**: Otro proceso está usando el puerto

**Solución**:

```bash
# Matar proceso en puerto 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambiar el puerto en .env
PORT=3001
```

### Frontend no conecta con Backend

**Problema**: Configuración incorrecta de proxy

**Solución**:

Verifica que `client/vite.config.js` tenga:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 📊 Estructura de Archivos para Desarrollo Local

```
rehabcompanion-vercel/
├── .env                        # ⭐ Variables de entorno (CREAR)
├── package.json                # Scripts para ejecutar todo
├── api/
│   ├── server.js              # ⭐ Servidor Express local (CREAR)
│   ├── auth/                  # Funciones serverless
│   ├── tasks/
│   ├── garden/
│   ├── utils/
│   ├── schema.sql             # Ejecutar en PostgreSQL
│   ├── seed.sql               # Ejecutar después del schema
│   └── package.json
└── client/
    ├── src/
    ├── vite.config.js         # Configuración con proxy
    └── package.json
```

---

## 🎯 Comandos Útiles Resumidos

```bash
# Instalación inicial
npm run install:all

# Ejecutar todo (backend + frontend)
npm run dev

# Solo backend
cd api && npm run dev

# Solo frontend
cd client && npm run dev

# Resetear base de datos
psql -U postgres
DROP DATABASE rehabcompanion_db;
CREATE DATABASE rehabcompanion_db;
\q
psql -U postgres -d rehabcompanion_db -f api/schema.sql
psql -U postgres -d rehabcompanion_db -f api/seed.sql

# Ver logs de PostgreSQL (útil para debugging)
tail -f /var/log/postgresql/postgresql-*.log  # Linux
tail -f ~/Library/Application\ Support/Postgres/var-*/postgresql.log  # Mac
```

---

## 🚀 Próximos Pasos

Una vez que tengas todo funcionando en local:

1. **Desarrolla nuevas features**
2. **Haz cambios y pruébalos en tiempo real**
3. **Cuando estés listo, despliega a Vercel** siguiendo [DEPLOY.md](./DEPLOY.md)

---

**¡Happy coding! 💻🌱**
