#!/bin/bash

# Script de configuración inicial del proyecto InteractiveMapUCN

echo "🚀 Configurando InteractiveMapUCN..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo primero."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js encontrado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instálalo primero."
    exit 1
fi

echo -e "${GREEN}✓${NC} npm encontrado: $(npm --version)"

# Instalar dependencias del backend
echo -e "\n${YELLOW}Instalando dependencias del backend...${NC}"
cd backend
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Archivo .env creado. Por favor configúralo con tus credenciales."
    else
        echo -e "${YELLOW}⚠${NC} .env.example no encontrado. Deberás crear .env manualmente."
    fi
fi
npm install
cd ..

# Instalar dependencias del frontend
echo -e "\n${YELLOW}Instalando dependencias del frontend...${NC}"
cd frontend
npm install
cd ..

# Verificar Docker
if command -v docker &> /dev/null; then
    echo -e "\n${GREEN}✓${NC} Docker encontrado"
    echo -e "${YELLOW}Para iniciar PostgreSQL con Docker, ejecuta:${NC}"
    echo "  docker-compose up -d"
else
    echo -e "\n${YELLOW}⚠${NC} Docker no encontrado. Necesitarás PostgreSQL instalado localmente."
fi

echo -e "\n${GREEN}✅ Configuración completada!${NC}"
echo -e "\n${YELLOW}Próximos pasos:${NC}"
echo "1. Configura las variables de entorno en backend/.env"
echo "2. Inicia PostgreSQL (docker-compose up -d o local)"
echo "3. Ejecuta el script de inicialización de la base de datos"
echo "4. Inicia el backend: cd backend && npm run dev"
echo "5. Inicia el frontend: cd frontend && npm start"

