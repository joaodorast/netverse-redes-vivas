@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 24 LTS e execute este arquivo novamente.
  echo Consulte LEIA-ME-PRIMEIRO.txt.
  pause
  exit /b 1
)
node scripts\serve.mjs
if errorlevel 1 pause
