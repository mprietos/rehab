@echo off
setlocal enabledelayedexpansion

echo ===============================================================
echo    RehabCompanion - Configuracion para Desarrollo Local
echo ===============================================================
echo.

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL no esta instalado
    echo Por favor, instala PostgreSQL desde:
    echo https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [OK] PostgreSQL encontrado
echo.

REM Database configuration
echo Configuracion de Base de Datos
echo Por defecto usaremos:
echo   - Usuario: postgres
echo   - Contraseña: postgres
echo   - Base de datos: adiccare_db
echo.
set /p USE_DEFAULT="Deseas usar estos valores por defecto? (s/n): "

if /i "%USE_DEFAULT%"=="n" (
    set /p DB_USER="Usuario de PostgreSQL: "
    set /p DB_PASSWORD="Contraseña de PostgreSQL: "
    set /p DB_NAME="Nombre de la base de datos: "
) else (
    set DB_USER=postgres
    set DB_PASSWORD=postgres
    set DB_NAME=adiccare_db
)

echo.
echo Creando base de datos...
set PGPASSWORD=%DB_PASSWORD%
psql -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr "1" >nul
if %errorlevel% neq 0 (
    psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
)

if %errorlevel% equ 0 (
    echo [OK] Base de datos creada o ya existe
) else (
    echo [ERROR] Error al crear la base de datos
    echo Verifica tus credenciales de PostgreSQL
    pause
    exit /b 1
)

echo.
echo Ejecutando schema SQL...
psql -U %DB_USER% -d %DB_NAME% -f api/schema.sql >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Schema ejecutado correctamente
) else (
    echo [ERROR] Error al ejecutar schema
    pause
    exit /b 1
)

echo.
echo Cargando datos de prueba...
psql -U %DB_USER% -d %DB_NAME% -f api/seed.sql >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Datos de prueba cargados
) else (
    echo [ERROR] Error al cargar datos de prueba
    pause
    exit /b 1
)

echo.
echo Creando archivo .env...

(
echo # Database Configuration
echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@localhost:5432/%DB_NAME%
echo.
echo # Supabase (no necesario para desarrollo local^)
echo SUPABASE_URL=http://localhost:54321
echo SUPABASE_ANON_KEY=not_needed_for_local_development
echo.
echo # Security
echo JWT_SECRET=local_jwt_secret_change_in_production_12345
echo ENCRYPTION_MASTER_KEY=local_encryption_key_32_chars_00
echo.
echo # Environment
echo NODE_ENV=development
echo PORT=3000
) > .env

echo [OK] Archivo .env creado
echo.

echo Instalando dependencias...
echo Esto puede tomar unos minutos...
echo.

call npm run install:all

if %errorlevel% equ 0 (
    echo.
    echo [OK] Dependencias instaladas correctamente
) else (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo ===============================================================
echo    Configuracion completada con exito!
echo ===============================================================
echo.
echo Para iniciar la aplicacion, ejecuta:
echo   npm run dev
echo.
echo Esto iniciara:
echo   - Backend API en http://localhost:3000
echo   - Frontend en http://localhost:5173
echo.
echo Usuarios de prueba disponibles:
echo   juan.perez@email.com / patient123 (SEED)
echo   lucia.fernandez@email.com / patient123 (SPROUT)
echo   david.ruiz@email.com / patient123 (FLOWER)
echo.
echo ===============================================================
pause
