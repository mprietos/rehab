# Guía de Despliegue - RehabCompanion MVP

Esta guía te ayudará a desplegar tu aplicación en Vercel + Supabase para presentarla a inversores.

## 1. Configurar Supabase (Base de Datos)

### Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Clic en "New Project"
3. Nombre del proyecto: `rehabcompanion-mvp`
4. Elige una región cercana (ej: `eu-west-1` para Europa)
5. Crea una contraseña segura para la base de datos (guárdala)
6. Espera a que se cree el proyecto (~2 minutos)

### Obtener Connection String

1. En el dashboard de Supabase, ve a **Settings** → **Database**
2. Busca **Connection String** → **URI**
3. Copia la cadena completa, se verá así:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
4. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste

### Aplicar el Schema de Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `api/schema.sql` de este proyecto
3. Copia todo el contenido y pégalo en el editor SQL de Supabase
4. Ejecuta el query (botón Run)
5. Verifica que se crearon las tablas en **Table Editor**

### Configurar Row Level Security (Opcional pero Recomendado)

Por ahora puedes desactivar RLS para el MVP:
1. Ve a **Authentication** → **Policies**
2. Por cada tabla, desactiva RLS temporalmente (para desarrollo rápido)

**Nota**: Para producción, deberás configurar políticas de seguridad apropiadas.

## 2. Configurar Vercel (Frontend + API)

### Crear Proyecto en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Crea una cuenta (puedes usar GitHub)
3. Clic en "Add New Project"
4. Importa tu repositorio de GitHub (si no tienes el código en GitHub, primero súbelo)

### Configurar Variables de Entorno

Antes de desplegar, configura estas variables de entorno en Vercel:

1. En tu proyecto de Vercel, ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

```bash
# Base de datos (Supabase)
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres

# JWT Secret (genera uno aleatorio)
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar

# Anthropic API (para frases motivacionales con IA - opcional)
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_opcional

# Node Environment
NODE_ENV=production
```

**Cómo generar JWT_SECRET seguro:**
```bash
# En terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar Build Settings

En Vercel, configura:
- **Framework Preset**: Other
- **Build Command**: `cd api && npm install && cd ../client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

## 3. Desplegar

1. Haz clic en **Deploy**
2. Espera a que termine el build (~3-5 minutos)
3. Una vez desplegado, obtendrás una URL como: `https://rehabcompanion-mvp.vercel.app`

## 4. Configuración Post-Despliegue

### Crear Usuario Administrador/Doctor

Necesitas crear un usuario doctor para empezar a usar la aplicación:

#### Opción A: Desde Supabase SQL Editor

```sql
-- 1. Primero crear una clínica
INSERT INTO clinics (id, name, email)
VALUES (gen_random_uuid(), 'Clínica Demo MVP', 'contacto@clinica.com');

-- 2. Crear usuario doctor (cambia los valores)
INSERT INTO users (
  id,
  email,
  password,
  first_name,
  last_name,
  role,
  encryption_key,
  clinic_id
)
VALUES (
  gen_random_uuid(),
  'doctor@clinica.com',
  -- Password hasheado para 'Demo123!' - CÁMBIALO en producción
  '$2b$10$YourHashedPasswordHere',
  'Dr. Juan',
  'Pérez',
  'DOCTOR',
  encode(gen_random_bytes(32), 'hex'),
  (SELECT id FROM clinics WHERE name = 'Clínica Demo MVP')
);
```

#### Opción B: Usar el script de generación de hash

1. Navega a la carpeta `api`:
   ```bash
   cd api
   ```

2. Ejecuta el script para generar un hash de contraseña:
   ```bash
   node gen-bcrypt.js
   ```

3. Cuando te pida la contraseña, escribe la que quieras usar (ej: `Demo123!`)

4. Copia el hash generado y úsalo en el SQL de arriba

### Crear Pacientes de Prueba

Una vez que tengas un doctor, usa la aplicación web para crear pacientes desde el panel de doctor.

## 5. Verificación del MVP

Verifica que todo funciona:

- [ ] Puedes acceder a la URL de Vercel
- [ ] Puedes hacer login con el usuario doctor
- [ ] Puedes crear un nuevo paciente
- [ ] Puedes asignar tareas al paciente
- [ ] Puedes enviar mensajes de ánimo
- [ ] El paciente puede hacer login
- [ ] El paciente ve sus tareas
- [ ] El paciente puede completar tareas
- [ ] El jardín virtual del paciente crece con XP

## 6. Features Implementadas para el MVP

### Para Doctores:
- ✅ Dashboard con listado de pacientes
- ✅ Ver detalles completos del paciente
- ✅ Crear nuevos pacientes
- ✅ Asignar tareas predefinidas o personalizadas
- ✅ Enviar mensajes de ánimo (con generación por IA)
- ✅ Ver historial de estados de ánimo
- ✅ Ver progreso del jardín virtual

### Para Pacientes:
- ✅ Dashboard personalizado
- ✅ Jardín virtual gamificado (semilla → flor)
- ✅ Sistema de XP y rachas
- ✅ Listado de tareas diarias
- ✅ Completar tareas con registro de ánimo
- ✅ Recibir y ver mensajes del doctor
- ✅ Editar perfil y contacto de emergencia

### Tecnologías:
- ✅ Frontend: React + Vite + PrimeReact
- ✅ Backend: Node.js + Express
- ✅ Base de datos: PostgreSQL (Supabase)
- ✅ ORM: Prisma
- ✅ IA: Anthropic Claude (opcional)

## 7. Configuración de Anthropic AI (Opcional)

Si quieres habilitar la generación de mensajes con IA:

1. Ve a [https://console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta
3. Ve a **API Keys** y genera una nueva clave
4. Copia la clave y agrégala a las variables de entorno de Vercel:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```
5. Redeploy tu aplicación en Vercel

**Nota**: La aplicación funciona sin IA usando mensajes predefinidos.

## 8. Próximos Pasos (Post-MVP)

Funcionalidades que podrías agregar después:

- [ ] Sistema de notificaciones por email (SendGrid/Resend)
- [ ] Reportes y estadísticas avanzadas
- [ ] Videollamadas integradas
- [ ] Chat en tiempo real
- [ ] App móvil con React Native
- [ ] Integración con wearables
- [ ] Sistema de gamificación más complejo
- [ ] Grupos de apoyo
- [ ] Recursos educativos

## 9. Troubleshooting

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que Supabase permite conexiones desde Vercel
- Revisa que la contraseña en la URL esté correctamente codificada

### Error: "Failed to build"
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel
- Asegúrate de que las rutas de los archivos sean correctas

### Error: "Cannot login"
- Verifica que hayas ejecutado el schema.sql en Supabase
- Asegúrate de que el hash de contraseña esté correcto
- Revisa que `JWT_SECRET` esté configurado

## 10. Soporte

Si tienes problemas durante el despliegue:
1. Revisa los logs en Vercel Dashboard
2. Revisa los logs en Supabase Dashboard
3. Verifica las variables de entorno

---

¡Buena suerte con tu presentación a inversores! 🚀
