#!/bin/bash

# Kenwell Insurance ERP - One-Command Development Setup
# This script sets up both frontend and backend for development

set -e  # Exit on error

echo ""
echo "========================================"
echo "Kenwell Insurance ERP - Development Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo -e "${GREEN}✓ Python and Node.js found${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}Setting up Django backend...${NC}"
cd backend

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1

# Run migrations
echo "Running database migrations..."
python manage.py migrate > /dev/null 2>&1

# Populate test data
echo "Populating test data..."
python manage.py populate_test_data > /dev/null 2>&1

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Frontend Setup
cd ..

echo -e "${BLUE}Setting up React frontend...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

# Install dependencies
echo "Installing Node dependencies..."
pnpm install > /dev/null 2>&1 || npm install > /dev/null 2>&1

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 - Backend API:"
echo "  cd backend && source venv/bin/activate && python manage.py runserver"
echo ""
echo "Terminal 2 - Frontend:"
echo "  pnpm dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Test Credentials:"
echo "  Admin:      admin / AdminPassword123!"
echo "  Agent:      john_agent / AgentPass123!"
echo "  Customer:   customer_one / CustomerPass123!"
echo "  Finance:    finance_officer / FinancePass123!"
echo "  Operations: ops_manager / OpsPass123!"
echo ""
