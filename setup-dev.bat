@echo off
REM Kenwell Insurance ERP - One-Command Development Setup (Windows)
REM This script sets up both frontend and backend for development

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo Kenwell Insurance ERP - Development Setup
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [✓] Python and Node.js found
echo.

REM Backend Setup
echo [*] Setting up Django backend...
cd backend

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt >nul 2>&1

REM Run migrations
echo Running database migrations...
python manage.py migrate >nul 2>&1

REM Populate test data
echo Populating test data...
python manage.py populate_test_data >nul 2>&1

echo [✓] Backend setup complete
echo.

REM Frontend Setup
cd ..

echo [*] Setting up React frontend...

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
    ) > .env.local
    echo [✓] Created .env.local
)

REM Install dependencies
echo Installing Node dependencies...
pnpm install >nul 2>&1
if errorlevel 1 (
    npm install >nul 2>&1
)

echo [✓] Frontend setup complete
echo.

REM Summary
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start development:
echo.
echo Command Prompt 1 - Backend API:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python manage.py runserver
echo.
echo Command Prompt 2 - Frontend:
echo   pnpm dev
echo.
echo Then open: http://localhost:3000
echo.
echo Test Credentials:
echo   Admin:      admin / AdminPassword123!
echo   Agent:      john_agent / AgentPass123!
echo   Customer:   customer_one / CustomerPass123!
echo   Finance:    finance_officer / FinancePass123!
echo   Operations: ops_manager / OpsPass123!
echo.
pause
