@echo off
cd /d "%~dp0"
echo ========================================
echo    Goofishcbot - PM2 (One-Click)
echo ========================================
echo.
if not exist "logs" mkdir logs
if exist "node_modules\pm2\bin\pm2" (
    node.exe "node_modules\pm2\bin\pm2" start ecosystem.config.cjs
) else (
    where pm2 >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] PM2 not in package. Please run: npm install -g pm2
        pause
        exit /b 1
    )
    pm2 start ecosystem.config.cjs
)
echo.
echo Started. URL: http://localhost:3000
echo Logs: pm2 logs goofishcbot
echo Stop: run stop-pm2.bat
echo.
pause
