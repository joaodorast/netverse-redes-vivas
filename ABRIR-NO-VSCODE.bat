@echo off
cd /d "%~dp0"
where code >nul 2>nul
if errorlevel 1 (
  echo Abra esta pasta pelo menu Arquivo, Abrir Pasta do VS Code.
  pause
  exit /b 1
)
call code netverse.code-workspace
