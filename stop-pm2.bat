@echo off
cd /d "%~dp0"
echo Stopping Goofishcbot (PM2)...
if exist "node_modules\pm2\bin\pm2" (
    node.exe "node_modules\pm2\bin\pm2" stop ecosystem.config.cjs
) else (
    pm2 stop ecosystem.config.cjs
)
echo Done.
pause
