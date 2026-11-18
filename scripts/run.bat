@echo off
echo Starting all services...
start "FastAPI :8001" /d "%~dp0..\server" run.bat
start "Avatar :8000" /d "%~dp0..\affiliate-project\AvatarServer" run.bat
start "Visitor :5173" /d "%~dp0..\visitor-app" run.bat
start "Admin :5174" /d "%~dp0..\admin-web" run.bat
echo All services launched.
