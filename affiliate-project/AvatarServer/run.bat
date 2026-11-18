@echo off
cd /d "%~dp0"
if exist ..\..\server\venv\Scripts\python.exe (
    ..\..\server\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000 --noreload
) else (
    python manage.py runserver 0.0.0.0:8000 --noreload
)
pause
