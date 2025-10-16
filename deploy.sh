#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════════
# 🚀 K-MITA ANALYTICS - SCRIPT DE DESPLIEGUE EN NETLIFY
# ═══════════════════════════════════════════════════════════════════════════════════

echo "🐈 K-mita Analytics - Despliegue en Netlify"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Netlify CLI está instalado
if ! command -v netlify &> /dev/null
then
    echo -e "${RED}❌ Netlify CLI no está instalado${NC}"
    echo ""
    echo "Instálalo con:"
    echo "  npm install -g netlify-cli"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Netlify CLI encontrado${NC}"
echo ""

# Verificar archivos necesarios
echo "📋 Verificando archivos necesarios..."

required_files=(
    "index.html"
    "shopify-analytics-dashboard.html"
    "config.js"
    "shopify-analytics-script.js"
    "shopify-analytics-styles.css"
    "netlify.toml"
    "_redirects"
    "sample-data.json"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}❌ Faltan archivos necesarios:${NC}"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

echo -e "${GREEN}✅ Todos los archivos necesarios están presentes${NC}"
echo ""

# Verificar configuración
echo "⚙️ Verificando configuración..."

if grep -q "TU_SHEET_ID_AQUI" config.js; then
    echo -e "${YELLOW}⚠️ ADVERTENCIA: config.js contiene valores de ejemplo${NC}"
    echo "   Asegúrate de actualizar SHEET_ID antes de desplegar"
    echo ""
    read -p "¿Continuar de todos modos? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Configuración verificada${NC}"
echo ""

# Preguntar tipo de despliegue
echo "🎯 Tipo de despliegue:"
echo "  1) Preview (prueba antes de publicar)"
echo "  2) Producción (publicar en vivo)"
echo ""
read -p "Selecciona una opción (1 o 2): " deploy_type

case $deploy_type in
    1)
        echo ""
        echo "🔍 Desplegando preview..."
        netlify deploy
        ;;
    2)
        echo ""
        echo "🚀 Desplegando a producción..."
        netlify deploy --prod
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Despliegue completado${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🎉 ¡Tu dashboard K-mita Analytics está en línea!"
echo "═══════════════════════════════════════════════════════════════════════════════"
