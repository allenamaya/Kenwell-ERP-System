#!/bin/bash

# Kenwell ERP Backend Setup Script

echo "========================================="
echo "Kenwell Insurance ERP - Backend Setup"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi

echo "1. Creating virtual environment..."
python3 -m venv venv

echo "2. Activating virtual environment..."
source venv/bin/activate

echo "3. Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "4. Running database migrations..."
python manage.py migrate

echo ""
echo "5. Creating superuser for admin panel..."
echo "You will be prompted to create an admin account"
python manage.py createsuperuser

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "To start the backend server, run:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "The API will be available at: http://localhost:8000"
echo "Admin panel: http://localhost:8000/admin/"
echo ""
