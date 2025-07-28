@echo off
echo ========================================
echo UIC Alumni Portal System Setup
echo ========================================
echo.

echo Installing frontend dependencies...
npm install

echo.
echo ========================================
echo Frontend setup complete!
echo.
echo To start the development server:
echo npm start
echo.
echo ========================================
echo.
echo Backend Setup Instructions:
echo 1. Navigate to backend directory: cd backend
echo 2. Install PHP dependencies: composer install
echo 3. Copy .env.example to .env
echo 4. Configure database settings in .env
echo 5. Generate app key: php artisan key:generate
echo 6. Run migrations: php artisan migrate
echo 7. Start Laravel server: php artisan serve
echo.
echo ========================================
echo Setup complete! Follow the instructions above.
pause 