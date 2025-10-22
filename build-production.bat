@echo off
echo ========================================
echo CCS Alumni Portal - Production Build
echo ========================================

echo.
echo [1/5] Cleaning previous build...
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo [2/5] Installing dependencies...
call npm install

echo.
echo [3/5] Running tests...
call npm test -- --coverage --watchAll=false

echo.
echo [4/5] Building production bundle...
set GENERATE_SOURCEMAP=false
call npm run build

echo.
echo [5/5] Build completed!
echo.
echo Production files are in the 'build' folder.
echo.
echo Next steps:
echo 1. Upload the 'build' folder contents to your web server
echo 2. Configure your web server to serve index.html for all routes
echo 3. Set up SSL certificate for HTTPS
echo 4. Configure environment variables on your server
echo.
echo Build Summary:
dir build /s
echo.
echo ========================================
echo Build process completed successfully!
echo ========================================
pause
