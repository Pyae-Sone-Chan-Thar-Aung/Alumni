@echo off
title CCS Alumni Portal - SQL Editor

echo ================================
echo CCS Alumni Portal - SQL Editors
echo ================================
echo.

echo Choose your SQL editor:
echo [1] REST API Editor (Recommended - Works immediately)
echo [2] Direct PostgreSQL Editor (Requires database password)
echo [3] Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto rest_editor
if "%choice%"=="2" goto pg_editor  
if "%choice%"=="3" goto exit
goto invalid

:rest_editor
echo.
echo Starting REST API SQL Editor...
echo This editor uses your existing Supabase API keys.
echo.
node rest-sql-editor.js
pause
goto end

:pg_editor
echo.
echo Starting PostgreSQL SQL Editor...
echo Note: You need your database password from Supabase Dashboard.
echo If you don't have it, use option 1 instead.
echo.
node sql-editor.js
pause
goto end

:invalid
echo Invalid choice. Please enter 1, 2, or 3.
pause
goto start

:exit
echo Goodbye!
goto end

:end