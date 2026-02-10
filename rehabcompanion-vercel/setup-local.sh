#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "🌱 RehabCompanion - Configuración para Desarrollo Local"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "🔍 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
    echo "Por favor, instala PostgreSQL antes de continuar:"
    echo "  - Linux: sudo apt-get install postgresql"
    echo "  - Mac: brew install postgresql"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL encontrado${NC}"
echo ""

# Database configuration
echo "📊 Configuración de Base de Datos"
echo "Por defecto usaremos:"
echo "  - Usuario: postgres"
echo "  - Contraseña: postgres"
echo "  - Base de datos: adiccare_db"
echo ""
read -p "¿Deseas usar estos valores por defecto? (s/n): " USE_DEFAULT

if [[ "$USE_DEFAULT" =~ ^[Nn]$ ]]; then
    read -p "Usuario de PostgreSQL: " DB_USER
    read -sp "Contraseña de PostgreSQL: " DB_PASSWORD
    echo ""
    read -p "Nombre de la base de datos: " DB_NAME
else
    DB_USER="postgres"
    DB_PASSWORD="postgres"
    DB_NAME="adiccare_db"
fi

# Create database
echo ""
echo "🗄️  Creando base de datos..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -c "CREATE DATABASE $DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos creada o ya existe${NC}"
else
    echo -e "${RED}❌ Error al crear la base de datos${NC}"
    echo "Verifica tus credenciales de PostgreSQL"
    exit 1
fi

# Execute schema
echo ""
echo "📝 Ejecutando schema SQL..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f api/schema.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema ejecutado correctamente${NC}"
else
    echo -e "${RED}❌ Error al ejecutar schema${NC}"
    exit 1
fi

# Execute seed
echo ""
echo "🌱 Cargando datos de prueba..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f api/seed.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Datos de prueba cargados${NC}"
else
    echo -e "${RED}❌ Error al cargar datos de prueba${NC}"
    exit 1
fi

# Create .env file
echo ""
echo "⚙️  Creando archivo .env..."

cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

# Supabase (no necesario para desarrollo local)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=not_needed_for_local_development

# Security
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "local_jwt_secret_change_in_production_12345")
ENCRYPTION_MASTER_KEY=$(openssl rand -base64 32 2>/dev/null || echo "local_encryption_key_32_chars_00")

# Environment
NODE_ENV=development
PORT=3000
EOF

echo -e "${GREEN}✅ Archivo .env creado${NC}"

# Install dependencies
echo ""
echo "📦 Instalando dependencias..."
echo "Esto puede tomar unos minutos..."
echo ""

npm run install:all

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

# Success message
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 ¡Configuración completada con éxito!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Para iniciar la aplicación, ejecuta:"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""
echo "Esto iniciará:"
echo "  - Backend API en http://localhost:3000"
echo "  - Frontend en http://localhost:5173"
echo ""
echo "Usuarios de prueba disponibles:"
echo "  📧 juan.perez@email.com / 🔑 patient123 (🌱 SEED)"
echo "  📧 lucia.fernandez@email.com / 🔑 patient123 (🌿 SPROUT)"
echo "  📧 david.ruiz@email.com / 🔑 patient123 (🌻 FLOWER)"
echo ""
echo "═══════════════════════════════════════════════════════"
