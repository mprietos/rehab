# 🚀 Guía Completa de Despliegue - Vercel + Supabase

## Índice
1. [Preparación del Proyecto](#1-preparación-del-proyecto)
2. [Configuración de Supabase](#2-configuración-de-supabase)
3. [Aplicar Schema de Base de Datos](#3-aplicar-schema-de-base-de-datos)
4. [Crear Datos Iniciales](#4-crear-datos-iniciales)
5. [Configuración de Vercel](#5-configuración-de-vercel)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Despliegue](#7-despliegue)
8. [Verificación Post-Despliegue](#8-verificación-post-despliegue)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Preparación del Proyecto

### 1.1 Verificar que todo funciona localmente
```bash
# Desde la raíz del proyecto
cd api
npm install
npm run dev

# En otra terminal
cd client
npm install
npm run dev
```

### 1.2 Crear repositorio Git (si no existe)
```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Crear repositorio en GitHub y pushear
git remote add origin https://github.com/tu-usuario/adiccare.git
git branch -M main
git push -u origin main
```

---

## 2. Configuración de Supabase

### 2.1 Crear proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Configura:
   - **Name**: `adiccare-prod` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala bien)
   - **Region**: Elige el más cercano a tus usuarios
   - **Pricing Plan**: Free (suficiente para MVP)

### 2.2 Obtener credenciales de conexión
1. Una vez creado el proyecto, ve a **Settings** → **Database**
2. En **Connection string**, sección **URI**, copia la cadena de conexión
3. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste
4. Formato final:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 2.3 Configurar Connection Pooling (IMPORTANTE)
- Usa la **Connection Pooling** string, NO la directa
- Supabase proporciona dos modos:
  - **Transaction mode**: Para Prisma (el que necesitamos)
  - **Session mode**: Para otras apps
- Asegúrate de usar Transaction mode

---

## 3. Aplicar Schema de Base de Datos

### 3.1 Configurar DATABASE_URL local temporalmente
```bash
# En /api, crea o edita .env
cd api
nano .env  # o usa tu editor favorito
```

Agrega:
```env
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="tu_clave_secreta_super_segura_cambiala"
ANTHROPIC_API_KEY="sk-ant-xxxxx"  # Opcional, para IA
```

### 3.2 Aplicar el schema con Prisma
```bash
cd api

# Generar el cliente de Prisma
npx prisma generate

# Aplicar el schema a Supabase (push en lugar de migrate para producción inicial)
npx prisma db push

# Verificar que se creó correctamente
npx prisma studio
```

Deberías ver todas las tablas:
- `users`
- `clinics`
- `garden_states`
- `daily_tasks`
- `doctor_patients`
- `messages`
- `mood_checks`

---

## 4. Crear Datos Iniciales

### 4.1 Script de seed mejorado

Crea el archivo `/api/seed-production.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de producción...');

  // 1. Crear clínica
  console.log('📍 Creando clínica...');
  const clinic = await prisma.clinic.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Clínica Esperanza',
      address: 'Calle Principal 123, Madrid',
      phone: '+34 900 123 456',
      email: 'info@esperanza-rehab.es',
      isActive: true
    }
  });
  console.log('✅ Clínica creada:', clinic.name);

  // 2. Crear doctor
  console.log('👨‍⚕️ Creando doctor...');
  const doctorPassword = await bcrypt.hash('password123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.rodriguez@esperanza-rehab.es' },
    update: {},
    create: {
      email: 'dr.rodriguez@esperanza-rehab.es',
      password: doctorPassword,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'DOCTOR',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      isActive: true
    }
  });
  console.log('✅ Doctor creado:', doctor.email);

  // 3. Crear paciente 1 (Semilla)
  console.log('👤 Creando paciente 1 (Juan - Semilla)...');
  const patient1Password = await bcrypt.hash('password123', 10);
  const patient1 = await prisma.user.upsert({
    where: { email: 'juan.perez@email.com' },
    update: {},
    create: {
      email: 'juan.perez@email.com',
      password: patient1Password,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'PATIENT',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      emergencyContactName: 'María Pérez',
      emergencyContactPhone: '+34 600 111 222',
      isActive: true
    }
  });

  await prisma.gardenState.upsert({
    where: { userId: patient1.id },
    update: {},
    create: {
      userId: patient1.id,
      plantStage: 'SEED',
      currentXp: 10,
      streakDays: 1,
      totalTasksCompleted: 2,
      lastActionDate: new Date()
    }
  });
  console.log('✅ Paciente 1 creado:', patient1.email);

  // 4. Crear paciente 2 (Brote)
  console.log('👤 Creando paciente 2 (Lucía - Brote)...');
  const patient2Password = await bcrypt.hash('password123', 10);
  const patient2 = await prisma.user.upsert({
    where: { email: 'lucia.fernandez@email.com' },
    update: {},
    create: {
      email: 'lucia.fernandez@email.com',
      password: patient2Password,
      firstName: 'Lucía',
      lastName: 'Fernández',
      role: 'PATIENT',
      clinicId: clinic.id,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      emergencyContactName: 'Pedro Fernández',
      emergencyContactPhone: '+34 600 333 444',
      isActive: true
    }
  });

  await prisma.gardenState.upsert({
    where: { userId: patient2.id },
    update: {},
    create: {
      userId: patient2.id,
      plantStage: 'SPROUT',
      currentXp: 45,
      streakDays: 3,
      totalTasksCompleted: 9,
      lastActionDate: new Date()
    }
  });
  console.log('✅ Paciente 2 creado:', patient2.email);

  // 5. Asignar pacientes al doctor
  console.log('🔗 Asignando pacientes al doctor...');
  await prisma.doctorPatient.upsert({
    where: {
      doctorId_patientId: {
        doctorId: doctor.id,
        patientId: patient1.id
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient1.id
    }
  });

  await prisma.doctorPatient.upsert({
    where: {
      doctorId_patientId: {
        doctorId: doctor.id,
        patientId: patient2.id
      }
    },
    update: {},
    create: {
      doctorId: doctor.id,
      patientId: patient2.id
    }
  });
  console.log('✅ Relaciones doctor-paciente creadas');

  // 6. Crear tareas de ejemplo
  console.log('📋 Creando tareas de ejemplo...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyTask.create({
    data: {
      userId: patient1.id,
      description: 'Tomar medicación matutina',
      type: 'MEDICATION',
      date: today,
      isCompleted: false
    }
  });

  await prisma.dailyTask.create({
    data: {
      userId: patient1.id,
      description: 'Caminar 30 minutos',
      type: 'ACTIVITY',
      date: today,
      isCompleted: false
    }
  });
  console.log('✅ Tareas de ejemplo creadas');

  // 7. Crear mensaje de bienvenida
  console.log('💬 Creando mensaje de bienvenida...');
  await prisma.message.create({
    data: {
      fromId: doctor.id,
      toId: patient1.id,
      content: '¡Bienvenido a adiccare! Estoy aquí para apoyarte en tu camino de recuperación. No dudes en contactarme si necesitas algo.',
      isRead: false
    }
  });
  console.log('✅ Mensaje de bienvenida creado');

  console.log('\n✨ Seed de producción completado exitosamente!\n');
  console.log('📝 Credenciales de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍⚕️ DOCTOR:');
  console.log('   Email: dr.rodriguez@esperanza-rehab.es');
  console.log('   Pass:  password123');
  console.log('');
  console.log('👤 PACIENTE 1 (Semilla):');
  console.log('   Email: juan.perez@email.com');
  console.log('   Pass:  password123');
  console.log('');
  console.log('👤 PACIENTE 2 (Brote):');
  console.log('   Email: lucia.fernandez@email.com');
  console.log('   Pass:  password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 4.2 Ejecutar el seed
```bash
cd api
node seed-production.js
```

---

## 5. Configuración de Vercel

### 5.1 Instalar Vercel CLI (opcional pero recomendado)
```bash
npm install -g vercel
```

### 5.2 Crear cuenta en Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub
3. Autoriza Vercel para acceder a tus repositorios

### 5.3 Configurar el proyecto
1. En Vercel Dashboard, click "Add New Project"
2. Importa tu repositorio de GitHub
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`

---

## 6. Variables de Entorno

### 6.1 En Vercel Dashboard
Ve a **Settings** → **Environment Variables** y agrega:

```env
# Database
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# JWT Secret (genera uno nuevo)
JWT_SECRET=genera_una_clave_super_segura_de_al_menos_64_caracteres_aleatorios

# Anthropic API (opcional, para mensajes IA)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Node Environment
NODE_ENV=production
```

**IMPORTANTE**: Para `JWT_SECRET`, genera una clave segura:
```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6.2 Configurar para todos los entornos
- Marca las variables para **Production**, **Preview**, y **Development**
- Esto asegura que funcionen en todas las branches

---

## 7. Despliegue

### 7.1 Verificar configuración de `vercel.json`
En la raíz del proyecto, asegúrate de tener:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 7.2 Deploy desde GitHub
1. Haz push de tus cambios:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. Vercel detectará automáticamente el push y comenzará el build
3. Espera 2-5 minutos para que complete

### 7.3 Deploy manual (alternativa)
```bash
# Desde la raíz del proyecto
vercel

# Para producción
vercel --prod
```

---

## 8. Verificación Post-Despliegue

### 8.1 Checklist de verificación

✅ **Backend API**
- [ ] Health check: `https://tu-app.vercel.app/health`
- [ ] Login funciona: `POST /api/auth/login`
- [ ] Responde correctamente a peticiones autenticadas

✅ **Base de Datos**
- [ ] Conexión establecida (sin errores en logs)
- [ ] Datos de seed presentes
- [ ] Queries funcionando

✅ **Frontend**
- [ ] Página de login carga correctamente
- [ ] Assets (CSS, JS) se cargan
- [ ] Redirecciones funcionan
- [ ] Login con usuarios de prueba funciona

✅ **Funcionalidades Core**
- [ ] Login como doctor
- [ ] Ver lista de pacientes
- [ ] Asignar tareas
- [ ] Enviar mensajes
- [ ] Login como paciente
- [ ] Ver jardín y XP
- [ ] Completar tareas
- [ ] Registrar estado de ánimo
- [ ] Ver mensajes del doctor

### 8.2 Probar con usuarios de prueba

**Doctor:**
```
Email: dr.rodriguez@esperanza-rehab.es
Password: password123
```

**Paciente (Semilla):**
```
Email: juan.perez@email.com
Password: password123
```

**Paciente (Brote):**
```
Email: lucia.fernandez@email.com
Password: password123
```

---

## 9. Troubleshooting

### Problema: "Database connection failed"
**Solución:**
- Verifica que `DATABASE_URL` en Vercel esté correcta
- Asegúrate de usar Connection Pooling mode (Transaction)
- Verifica que la contraseña no tenga caracteres especiales sin encodear

### Problema: "JWT verification failed"
**Solución:**
- Asegúrate de que `JWT_SECRET` sea el mismo en Vercel que usaste localmente
- Regenera tokens: logout y login nuevamente

### Problema: "Function execution timed out"
**Solución:**
- Aumenta `maxDuration` en `vercel.json`
- Optimiza queries de Prisma (usa `select` para campos específicos)

### Problema: "Route not found" en API
**Solución:**
- Verifica que las rutas en `vercel.json` estén correctas
- Asegúrate de que los archivos en `/api` tengan la estructura correcta
- Revisa logs en Vercel Dashboard → Functions

### Problema: Hashes de contraseña no coinciden
**Solución:**
- Asegúrate de usar `bcrypt.hash()` con 10 rounds mínimo
- Nunca guardes contraseñas en texto plano
- Regenera hashes con el script de seed

### Ver Logs en Vercel
1. Ve al Dashboard de Vercel
2. Selecciona tu proyecto
3. Click en la última deployment
4. Ve a **Functions** tab
5. Click en cualquier función para ver sus logs

---

## 10. Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs --follow

# Listar deployments
vercel list

# Promover un preview a producción
vercel promote [deployment-url]

# Revertir a un deployment anterior
vercel rollback

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add JWT_SECRET

# Ejecutar build local
cd client && npm run build

# Verificar Prisma schema
cd api && npx prisma validate

# Ver estado de la BD
cd api && npx prisma studio
```

---

## 11. Próximos Pasos Después del Despliegue

1. **Configurar dominio personalizado** (opcional)
   - En Vercel Dashboard → Settings → Domains
   - Agrega tu dominio: `adiccare.com`

2. **Configurar monitoreo**
   - Activar Vercel Analytics
   - Configurar alertas de errores

3. **Backups de base de datos**
   - Supabase hace backups automáticos
   - Configura exports periódicos para seguridad extra

4. **Crear usuarios reales**
   - Usa el panel de doctor para crear nuevos pacientes
   - Cambia las contraseñas de los usuarios de prueba

5. **Documentación de API**
   - Considera agregar Swagger/OpenAPI
   - Documenta endpoints para el equipo

---

## 📞 Soporte

Si encuentras problemas:
- Revisa los logs en Vercel Dashboard
- Consulta la documentación de Supabase: https://supabase.com/docs
- Consulta la documentación de Vercel: https://vercel.com/docs
- Revisa la documentación de Prisma: https://www.prisma.io/docs

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Proyecto funciona 100% en local
- [ ] Supabase proyecto creado y configurado
- [ ] Schema aplicado con `prisma db push`
- [ ] Seed ejecutado con datos de prueba
- [ ] Variables de entorno configuradas en Vercel
- [ ] Código pusheado a GitHub
- [ ] Build exitoso en Vercel
- [ ] Health check responde correctamente
- [ ] Login funciona con todos los usuarios
- [ ] Todas las funcionalidades core verificadas
- [ ] Logs sin errores críticos

---

🎉 **¡Felicidades! Tu aplicación está desplegada en producción.**
