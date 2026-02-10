# ⚡ Inicio Rápido - RehabCompanion

## 🎯 Dos Opciones Disponibles

### Opción 1: Desarrollo Local (Recomendado para empezar) 💻

**Requiere**: Node.js + PostgreSQL instalados en tu máquina

**Tiempo**: ~10 minutos

```bash
# 1. Descomprime el archivo
unzip rehabcompanion-dual.zip
cd rehabcompanion-dual

# 2. Instala dependencias
npm run install:all

# 3. Crea la base de datos
psql -U postgres
CREATE DATABASE rehabcompanion_db;
\q

# 4. Ejecuta schema y seed
cd server
psql -U postgres -d rehabcompanion_db -f schema.sql
psql -U postgres -d rehabcompanion_db -f seed.sql

# 5. ¡Inicia la aplicación!
cd ..
npm run dev
```

**Accede a**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

**Login**: `juan.perez@email.com` / `patient123`

📖 **Guía completa**: [LOCAL-DEV.md](./LOCAL-DEV.md)

---

### Opción 2: Despliegue en la Nube (Vercel + Supabase) ☁️

**Requiere**: Cuenta gratuita en Supabase + Vercel + GitHub

**Tiempo**: ~15 minutos

**Pasos resumidos**:

1. **Supabase**: Crear proyecto → Ejecutar `api/schema.sql` y `api/seed.sql` → Guardar credenciales
2. **GitHub**: Subir código a un repositorio
3. **Vercel**: Importar repo → Configurar variables de entorno → Deploy

📖 **Guía completa**: [DEPLOY.md](./DEPLOY.md)

---

## 🤔 ¿Cuál elegir?

| Situación | Recomendación |
|-----------|---------------|
| Quiero probar rápido | 💻 **Local** |
| Voy a desarrollar/modificar | 💻 **Local** |
| Quiero compartir con otros | ☁️ **Nube** |
| Quiero URL pública | ☁️ **Nube** |
| No tengo PostgreSQL instalado | ☁️ **Nube** |

---

## 📚 Documentación Completa

- **[README.md](./README.md)** - Información general del proyecto
- **[LOCAL-DEV.md](./LOCAL-DEV.md)** - Desarrollo local paso a paso
- **[DEPLOY.md](./DEPLOY.md)** - Despliegue en Vercel + Supabase

---

## 🆘 Ayuda Rápida

**Local**:
- PostgreSQL no conecta → Verificar que está corriendo: `sudo service postgresql status`
- Puerto en uso → Matar proceso: `lsof -ti:3000 | xargs kill -9`

**Producción**:
- Error de build → Revisar Build Logs en Vercel
- Error de DB → Verificar variables de entorno

---

**¡Listo para empezar! 🚀**
