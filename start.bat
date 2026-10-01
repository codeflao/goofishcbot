@echo off
cd /d "%~dp0"
title Goofishcbot
echo ========================================
echo       Goofishcbot - Console Mode
echo ========================================
echo.
echo Access URL: http://localhost:3000
echo Press Ctrl+C to stop
echo.
node.exe app\index.js
echo.
echo Program stopped.
pause
