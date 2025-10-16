@echo off
REM ═══════════════════════════════════════════════════════════════════════════════════
REM 🚀 K-MITA ANALYTICS - SCRIPT DE DESPLIEGUE EN NETLIFY (WINDOWS)
REM ═══════════════════════════════════════════════════════════════════════════════════

echo.
echo 🐈 K-mita Analytics - Despliegue en Netlify
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

REM Verificar si Netlify CLI está instalado
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Netlify CLI no está instalado
    echo.
    echo Instálalo con:
    echo   npm install -g netlify-cli
    echo.
    pause
    exit /b 1
)

echo ✅ Netlify CLI encontrado
echo.

REM Verificar archivos necesarios
echo 📋 Verificando archivos necesarios...

set "missing_files="

if not exist "index.html" set "missing_files=%missing_files% index.html"
if not exist "shopify-analytics-dashboard.html" set "missing_files=%missing_files% shopify-analytics-dashboard.html"
if not exist "config.js" set "missing_files=%missing_files% config.js"
if not exist "shopify-analytics-script.js" set "missing_files=%missing_files% shopify-analytics-script.js"
if not exist "shopify-analytics-styles.css" set "missing_files=%missing_files% shopify-analytics-styles.css"
if not exist "netlify.toml" set "missing_files=%missing_files% netlify.toml"
if not exist "_redirects" set "missing_files=%missing_files% _redirects"
if not exist "sample-data.json" set "missing_files=%missing_files% sample-data.json"

if not "%missing_files%"=="" (
    echo ❌ Faltan archivos necesarios:
    echo %missing_files%
    pause
    exit /b 1
)

echo ✅ Todos los archivos necesarios están presentes
echo.

REM Verificar configuración
echo ⚙️ Verificando configuración...
findstr /C:"TU_SHEET_ID_AQUI" config.js >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️ ADVERTENCIA: config.js contiene valores de ejemplo
    echo    Asegúrate de actualizar SHEET_ID antes de desplegar
    echo.
    set /p continue="¿Continuar de todos modos? (s/n): "
    if /i not "%continue%"=="s" exit /b 1
)

echo ✅ Configuración verificada
echo.

REM Preguntar tipo de despliegue
echo 🎯 Tipo de despliegue:
echo   1) Preview (prueba antes de publicar)
echo   2) Producción (publicar en vivo)
echo.
set /p deploy_type="Selecciona una opción (1 o 2): "

if "%deploy_type%"=="1" (
    echo.
    echo 🔍 Desplegando preview...
    netlify deploy
) else if "%deploy_type%"=="2" (
    echo.
    echo 🚀 Desplegando a producción...
    netlify deploy --prod
) else (
    echo ❌ Opción inválida
    pause
    exit /b 1
)

echo.
echo ✅ Despliegue completado
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🎉 ¡Tu dashboard K-mita Analytics está en línea!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
pause
