@echo off
echo Deteniendo servidor en puerto 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a
echo Servidor detenido.
pause
