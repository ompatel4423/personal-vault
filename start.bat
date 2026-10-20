@echo off
cd /d "%~dp0"
echo ========================================================
echo   Starting Personal Vault for iPhone 15 Pro
echo   Local PC:    http://localhost:5173
echo   iPhone WiFi: http://192.168.0.20:5173
echo ========================================================
npm.cmd run dev -- --host
pause
