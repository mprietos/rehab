# 🛠️ Guía de Configuración y Despliegue Local - RehabCompanion

Esta guía detalla los pasos necesarios para ejecutar **RehabCompanion** en tu entorno local, utilizando tu propia base de datos PostgreSQL.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

1.  **Node.js** (v18 o superior)
2.  **npm** (viene con Node.js)
3.  **Vercel CLI** (para ejecutar la API localmente):
    ```bash
    npm i -g vercel
    ```
4.  **PostgreSQL** (ya lo tienes configurado según tu solicitud previa)

---

## 🚀 Pasos para el Despliegue Local

### 1. Instalación de Dependencias

Desde la raíz del proyecto, ejecuta el comando que instala las dependencias de la raíz, del cliente y de la API:

```bash
npm run install:all
```

### 2. Configuración de la Base de Datos

Si aún no has cargado el esquema y los datos de prueba en tu base de datos local `adiccare_db`:

1.  **Crear el Esquema**: Ejecuta el contenido de [api/schema.sql](file:///Users/miguelprieto/Desktop/mios/custom/adiccare/rehabcompanion-vercel/api/schema.sql) en tu cliente de PostgreSQL (pgAdmin, psql, o DBeaver).
2.  **Cargar Datos de Prueba (Seed)**: Ejecuta el contenido de [api/seed.sql](file:///Users/miguelprieto/Desktop/mios/custom/adiccare/rehabcompanion-vercel/api/seed.sql) para tener usuarios y tareas con los que probar.

### 3. Variables de Entorno

Ya hemos configurado tu archivo `.env.local` en la raíz. Asegúrate de que se vea así:

```env
# Local Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adiccare_db
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/adiccare_db

# Security
JWT_SECRET=tu_clave_secreta_aqui
ENCRYPTION_MASTER_KEY=tu_clave_de_32_caracteres_aqui

# Environment
NODE_ENV=development
```

> [!TIP]
> Puedes generar claves aleatorias para `JWT_SECRET` y `ENCRYPTION_MASTER_KEY` usando `openssl rand -base64 32` en tu terminal.

### 4. Ejecutar la Aplicación

Para probar todo el sistema (Frontend + API), usaremos el CLI de Vercel que emula el entorno de producción localmente:

```bash
# En la raíz del proyecto
vercel dev
```

Este comando:
- Iniciará el servidor de desarrollo de Vite para el frontend (normalmente en `http://localhost:3000` o `http://localhost:5173`).
- Levantará las funciones de la API en el mismo puerto bajo la ruta `/api`.

---

## 🧪 Cómo Probar

Una vez que la aplicación esté corriendo:

1.  Abre tu navegador en la URL que te indique `vercel dev`.
2.  **Login**: Usa uno de los usuarios del `seed.sql`:
    - **Email**: `juan.perez@email.com`
    - **Password**: `patient123`
3.  **Verificar API**: Puedes probar que la API responde correctamente accediendo a `http://localhost:3000/api/garden/state` (estando logueado).

---

## 💡 Troubleshooting Común

- **Error de conexión a la DB**: Verifica que PostgreSQL esté corriendo y que las credenciales en `.env.local` sean correctas.
- **Vercel CLI no encontrado**: Asegúrate de haber ejecutado `npm i -g vercel`.
- **Puerto ocupado**: Si el puerto 3000 está ocupado, Vercel intentará usar otro. Revisa la salida de la terminal.

---

**¡Listo! Ya tienes todo lo necesario para trabajar en local. 🌻**
