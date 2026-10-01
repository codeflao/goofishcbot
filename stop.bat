@echo off
cd /d "%~dp0"
echo ========================================
echo    Stopping Goofishcbot...
echo ========================================
echo.
taskkill /F /IM node.exe /T >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Program stopped successfully!
) else (
    echo Program is not running or already stopped.
)
echo.
pause
