@echo off
cd /d "%~dp0"
echo ========================================
echo    Checking Goofishcbot Status...
echo ========================================
echo.
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo Status: RUNNING
    echo.
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo Status: NOT RUNNING
)
echo.
pause
