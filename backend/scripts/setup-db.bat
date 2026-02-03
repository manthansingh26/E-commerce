@echo off
REM AuraExpress Database Setup Script for Windows

echo Setting up AuraExpress Authentication Database...

REM Load environment variables from .env file
if exist .env (
    for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#"') do set %%a
)

REM Default values
if not defined DB_NAME set DB_NAME=auraexpress_auth
if not defined DB_USER set DB_USER=postgres

REM Create database if it doesn't exist
echo Creating database '%DB_NAME%'...
psql -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr /C:"1" >nul
if errorlevel 1 (
    psql -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
)

REM Run schema
echo Running database schema...
psql -U %DB_USER% -d %DB_NAME% -f schema.sql

echo Database setup complete!
pause
