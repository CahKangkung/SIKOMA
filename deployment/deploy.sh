#!/bin/bash

# SIKOMA Deployment Script for EC2
# This script automates the deployment of frontend and backend

set -e

echo "======================================"
echo "SIKOMA Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/SIKOMA"
FRONTEND_BUILD_DIR="$APP_DIR/frontend/dist"
NGINX_SITE_DIR="/var/www/sikoma/frontend"
BACKUP_DIR="/home/ubuntu/sikoma-backup-$(date +%Y%m%d-%H%M%S)"

# Function to print colored messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Backup current deployment
if [ -d "$APP_DIR" ]; then
    print_info "Creating backup of current deployment..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$APP_DIR" "$BACKUP_DIR/"
    print_status "Backup created at $BACKUP_DIR"
fi

# Navigate to app directory
cd "$APP_DIR"

# Pull latest changes from Git
print_info "Pulling latest changes from Git..."
sudo -u ubuntu git pull origin main
print_status "Git pull completed"

# Backend deployment
print_info "Deploying Backend..."
cd "$APP_DIR/backend"

# Install backend dependencies
print_info "Installing backend dependencies..."
sudo -u ubuntu npm install --production
print_status "Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    sudo -u ubuntu cp .env.example .env
    print_error "Please edit backend/.env file with your actual configuration!"
fi

# Restart backend service
print_info "Restarting backend service..."
systemctl restart sikoma-backend
systemctl enable sikoma-backend
sleep 3

if systemctl is-active --quiet sikoma-backend; then
    print_status "Backend service is running"
else
    print_error "Backend service failed to start. Check logs with: journalctl -u sikoma-backend -n 50"
    exit 1
fi

# Frontend deployment
print_info "Deploying Frontend..."
cd "$APP_DIR/frontend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    sudo -u ubuntu cp .env.example .env
    print_error "Please edit frontend/.env file with your actual configuration!"
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
sudo -u ubuntu npm install
print_status "Frontend dependencies installed"

# Build frontend
print_info "Building frontend..."
sudo -u ubuntu npm run build
print_status "Frontend build completed"

# Deploy frontend to nginx directory
print_info "Deploying frontend to nginx..."
mkdir -p "$NGINX_SITE_DIR"
rm -rf "$NGINX_SITE_DIR"/*
cp -r "$FRONTEND_BUILD_DIR"/* "$NGINX_SITE_DIR/"
chown -R www-data:www-data "$NGINX_SITE_DIR"
print_status "Frontend deployed to $NGINX_SITE_DIR"

# Test nginx configuration
print_info "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    print_info "Reloading nginx..."
    systemctl reload nginx
    print_status "Nginx reloaded"
else
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Final checks
echo ""
echo "======================================"
echo "Deployment Status Check"
echo "======================================"

# Check backend status
if systemctl is-active --quiet sikoma-backend; then
    print_status "Backend: Running"
else
    print_error "Backend: Not Running"
fi

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_status "Nginx: Running"
else
    print_error "Nginx: Not Running"
fi

# Check MongoDB status
if systemctl is-active --quiet mongod; then
    print_status "MongoDB: Running"
else
    print_error "MongoDB: Not Running (may need to be started)"
fi

echo ""
echo "======================================"
print_status "Deployment Completed!"
echo "======================================"
echo ""
print_info "Your application should be accessible at:"
echo "  Frontend: http://15.134.145.213"
echo "  Backend API: http://15.134.145.213/api"
echo ""
print_info "Useful commands:"
echo "  View backend logs: journalctl -u sikoma-backend -f"
echo "  View nginx logs: tail -f /var/log/nginx/error.log"
echo "  Check service status: systemctl status sikoma-backend"
echo ""
