@echo off
cls
echo ========================================
echo  K-mita Analytics - Servidor Local
echo ========================================
echo.
echo [1/3] Verificando Python...
python --version
if errorlevel 1 (
    echo.
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor instala Python desde https://www.python.org/
    pause
    exit
)
echo.
echo [2/3] Iniciando servidor en http://localhost:8000
echo.
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo.
echo Para acceder al diagnostico de duplicados:
echo   http://localhost:8000/diagnostico-duplicados.html
echo.
echo Para acceder al dashboard principal:
echo   http://localhost:8000/index.html
echo.
echo Para acceder al reporte mensual:
echo   http://localhost:8000/monthly-report.html
echo.
echo [3/3] Abriendo navegador...
timeout /t 2 /nobreak >nul
start http://localhost:8000/diagnostico-duplicados.html
echo.
echo Servidor iniciado correctamente!
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

python -m http.server 8000
