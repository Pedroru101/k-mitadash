@echo off
echo ========================================
echo  K-mita Dashboard - Servidor Local
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo Para ver el dashboard, abre tu navegador en:
echo   http://localhost:8000/index.html
echo.
echo Para ver el diagnostico, abre:
echo   http://localhost:8000/diagnostico-datos-enero.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

python -m http.server 8000

pause
