# Script de configuración inicial del proyecto InteractiveMapUCN (PowerShell)

Write-Host "🚀 Configurando InteractiveMapUCN..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias del backend
Write-Host "`nInstalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path .env)) {
    Write-Host "📝 Creando archivo .env desde .env.example..." -ForegroundColor Cyan
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✓ Archivo .env creado. Por favor configúralo con tus credenciales." -ForegroundColor Green
    } else {
        Write-Host "⚠ .env.example no encontrado. Deberás crear .env manualmente." -ForegroundColor Yellow
    }
}
npm install
Set-Location ..

# Instalar dependencias del frontend
Write-Host "`nInstalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Verificar Docker
try {
    docker --version | Out-Null
    Write-Host "`n✓ Docker encontrado" -ForegroundColor Green
    Write-Host "Para iniciar PostgreSQL con Docker, ejecuta:" -ForegroundColor Yellow
    Write-Host "  docker-compose up -d" -ForegroundColor Cyan
} catch {
    Write-Host "`n⚠ Docker no encontrado. Necesitarás PostgreSQL instalado localmente." -ForegroundColor Yellow
}

Write-Host "`n✅ Configuración completada!" -ForegroundColor Green
Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configura las variables de entorno en backend/.env"
Write-Host "2. Inicia PostgreSQL (docker-compose up -d o local)"
Write-Host "3. Ejecuta el script de inicialización de la base de datos"
Write-Host "4. Inicia el backend: cd backend && npm run dev"
Write-Host "5. Inicia el frontend: cd frontend && npm start"

