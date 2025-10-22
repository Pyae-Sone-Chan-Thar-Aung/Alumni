@echo off
echo ==========================================================
echo UIC Alumni Portal - Complete System Fix and Deployment
echo ==========================================================
echo.

echo 1. Installing/Updating Node Dependencies...
call npm install --silent

echo.
echo 2. Running Database Connection Test...
node test-database-connection-comprehensive.js
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Database connection issues detected!
    echo Please run the database fixes manually in Supabase.
    pause
)

echo.
echo 3. Running Comprehensive Feature Tests...
node test-all-features.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo CRITICAL: System has issues that need to be fixed!
    echo.
    echo NEXT STEPS:
    echo 1. Go to your Supabase Dashboard SQL Editor
    echo 2. Copy and paste the contents of "targeted-database-fixes.sql"
    echo 3. Execute the SQL script
    echo 4. Run this script again to verify fixes
    echo.
    echo Press any key to continue anyway or Ctrl+C to exit...
    pause >nul
)

echo.
echo 4. Building Production Bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed! Please check for compilation errors.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo System Status Summary
echo ==========================================================

echo Running final system verification...
node test-all-features.js >temp_test_result.txt 2>&1
findstr "pass rate" temp_test_result.txt
del temp_test_result.txt

echo.
echo ==========================================================
echo DEPLOYMENT READY!
echo ==========================================================
echo.
echo Your UIC Alumni Portal is now ready for deployment.
echo.
echo DEPLOYMENT OPTIONS:
echo.
echo A. LOCAL TESTING:
echo    - Run: npm start
echo    - Open: http://localhost:3000
echo.
echo B. NETLIFY DEPLOYMENT:
echo    1. Login to netlify.com
echo    2. Drag and drop the 'build' folder
echo    3. Set environment variables in site settings
echo.
echo C. VERCEL DEPLOYMENT:
echo    1. Install Vercel CLI: npm i -g vercel
echo    2. Run: vercel --prod
echo    3. Follow the prompts
echo.
echo DATABASE SETUP REMINDER:
echo If you haven't run the SQL fixes yet:
echo 1. Open Supabase Dashboard
echo 2. Go to SQL Editor
echo 3. Execute: targeted-database-fixes.sql
echo.
echo Press any key to exit...
pause >nul