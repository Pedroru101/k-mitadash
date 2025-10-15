@echo off
echo ========================================
echo   K-mita Analytics - Servidor Local
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo IMPORTANTE: Deja esta ventana abierta
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

python -m http.server 8000

pause
