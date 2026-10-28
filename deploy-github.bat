@echo off
echo ===================================================
echo   Rajasthan MDM Calculator - GitHub Push Helper
echo ===================================================
echo.
set /p repo_url="Enter your GitHub Repository URL (e.g. https://github.com/username/mdm-calculator.git): "

if "%repo_url%"=="" (
    echo [ERROR] Repository URL cannot be empty!
    pause
    exit /b
)

echo.
echo Setting remote origin...
git remote remove origin 2>nul
git remote add origin %repo_url%
git branch -M main

echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
echo ===================================================
echo Done! Now go to https://vercel.com and click 'Import'
echo ===================================================
pause
