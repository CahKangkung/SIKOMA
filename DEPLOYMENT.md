# SIKOMA Deployment Guide - EC2 Instance

Complete guide to deploy SIKOMA (Frontend + Backend) on a single EC2 instance.

## Instance Information
- **Public IP**: 15.134.145.213
- **Repository**: https://github.com/CahKangkung/SIKOMA.git

---

## Prerequisites

Your EC2 instance should be running Ubuntu (20.04 or 22.04 recommended).

---

## Part 1: Initial Server Setup

### 1.1 Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@15.134.145.213
```

### 1.2 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Node.js and npm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Note: Database Configuration

**Important**: This application uses **MongoDB Atlas** (cloud database), not a local MongoDB instance. You do NOT need to install MongoDB on the EC2 instance. The connection will be made directly to your MongoDB Atlas cluster using the connection strings in your `.env` file.

### 1.5 Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.6 Install Git

```bash
sudo apt install -y git
```

---

## Part 2: Clone and Configure Application

### 2.1 Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/CahKangkung/SIKOMA.git
cd SIKOMA
```

### 2.2 Configure Backend

```bash
cd backend

# Create .env file from template
cp .env.example .env

# Edit .env file
nano .env
```

**Edit the .env file with your configuration:**

```env
# Backend server port
PORT=8080

# Database for document/letter (MongoDB Atlas)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.demub1g.mongodb.net/documentDB?retryWrites=true&w=majority&appName=Cluster0

# Database for user + organization (MongoDB Atlas)
MONGODB_URI_USER=mongodb+srv://your_username:your_password@cluster0.demub1g.mongodb.net/userDB?retryWrites=true&w=majority&appName=Cluster0

# GEMINI API
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret
JWT_SECRET=your-production-secret-key-change-this

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email untuk forgot password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Client URL untuk reset password link
CLIENT_URL=http://15.134.145.213
```

**Important**:
- Replace the MongoDB credentials with your actual Atlas credentials
- Replace `your_gemini_api_key_here` with your Gemini API key
- Replace `JWT_SECRET` with a strong random string (you can use your existing dev-secret or generate a new one)
- Add your Google OAuth credentials
- Add your Gmail app password for email functionality

```bash
# Create uploads directory
mkdir -p uploads

# Install dependencies
npm install
```

### 2.3 Configure Frontend

```bash
cd ../frontend

# Create .env file from template
cp .env.example .env

# Edit .env file
nano .env
```

**Content of frontend .env:**

```env
# Backend API URLs
VITE_API_BASE=http://15.134.145.213/api
VITE_AUTH_API_BASE=http://15.134.145.213/api
```

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

---

## Part 3: Configure System Services

### 3.1 Setup Backend Service

```bash
# Copy service file to systemd
sudo cp /home/ubuntu/SIKOMA/deployment/sikoma-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Start and enable the service
sudo systemctl start sikoma-backend
sudo systemctl enable sikoma-backend

# Check service status
sudo systemctl status sikoma-backend
```

### 3.2 Configure Nginx

```bash
# Create directory for frontend files
sudo mkdir -p /var/www/sikoma/frontend

# Copy built frontend files
sudo cp -r /home/ubuntu/SIKOMA/frontend/dist/* /var/www/sikoma/frontend/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/sikoma

# Copy nginx configuration
sudo cp /home/ubuntu/SIKOMA/deployment/nginx.conf /etc/nginx/sites-available/sikoma

# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/sikoma /etc/nginx/sites-enabled/

# Remove default nginx config
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## Part 4: Configure EC2 Security Group

Make sure your EC2 Security Group allows the following inbound rules:

| Type | Protocol | Port Range | Source |
|------|----------|------------|--------|
| HTTP | TCP | 80 | 0.0.0.0/0 |
| SSH | TCP | 22 | Your IP |

**Note**: Port 8080 (backend) should NOT be exposed to the internet. Nginx will proxy requests to it internally.

---

## Part 5: Verify Deployment

### 5.1 Check All Services

```bash
# Check backend service
sudo systemctl status sikoma-backend

# Check nginx
sudo systemctl status nginx
```

### 5.2 Test Backend API

```bash
curl http://localhost:8080/api/docs
```

### 5.3 Access Application

Open your browser and navigate to:
- **Frontend**: http://15.134.145.213
- **Backend API**: http://15.134.145.213/api

---

## Part 6: Automated Deployment Script

For future updates, you can use the automated deployment script:

```bash
# Make the script executable
sudo chmod +x /home/ubuntu/SIKOMA/deployment/deploy.sh

# Run deployment
sudo /home/ubuntu/SIKOMA/deployment/deploy.sh
```

This script will:
1. Create a backup of current deployment
2. Pull latest changes from Git
3. Install dependencies
4. Build frontend
5. Restart services
6. Verify all services are running

---

## Troubleshooting

### View Backend Logs

```bash
# Real-time logs
sudo journalctl -u sikoma-backend -f

# Last 50 lines
sudo journalctl -u sikoma-backend -n 50
```

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart sikoma-backend

# Restart nginx
sudo systemctl restart nginx
```

### Check Disk Space

```bash
df -h
```

### Check Memory Usage

```bash
free -h
```

### Check Open Ports

```bash
sudo netstat -tulpn | grep LISTEN
```

---

## Maintenance Commands

### Update Application

```bash
cd /home/ubuntu/SIKOMA
git pull origin main
sudo /home/ubuntu/SIKOMA/deployment/deploy.sh
```

### Backup Database

Since you're using MongoDB Atlas (cloud), you can backup your database using:

1. **MongoDB Atlas Automated Backups** (recommended - available in Atlas dashboard)
2. **Manual backup using mongodump** (requires MongoDB tools):

```bash
# Install MongoDB Database Tools first
sudo apt install -y mongodb-database-tools

# Backup from Atlas
mongodump --uri="your_mongodb_atlas_connection_string" --out /home/ubuntu/backups/$(date +%Y%m%d)
```

### Restore Database

```bash
mongorestore --uri="your_mongodb_atlas_connection_string" /home/ubuntu/backups/YYYYMMDD
```

### Clean Old Logs

```bash
# Clean journalctl logs older than 7 days
sudo journalctl --vacuum-time=7d
```

---

## Security Recommendations

### 1. Enable Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Setup SSL/HTTPS (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com
```

### 3. Secure MongoDB Atlas

Since you're using MongoDB Atlas:
- Enable Network Access restrictions in Atlas dashboard
- Add only your EC2 public IP to the IP Access List
- Use strong passwords for database users
- Enable MongoDB Atlas encryption at rest
- Regularly rotate your database passwords

### 4. Secure Environment Variables

```bash
# Ensure .env files have proper permissions
chmod 600 /home/ubuntu/SIKOMA/backend/.env
chmod 600 /home/ubuntu/SIKOMA/frontend/.env
```

### 5. Regular Updates

```bash
# Create a cron job for weekly updates
sudo crontab -e

# Add this line:
# 0 2 * * 0 apt update && apt upgrade -y
```

---

## Performance Optimization

### 1. Enable Nginx Caching

Edit `/etc/nginx/sites-available/sikoma` and add caching directives.

### 2. Setup PM2 for Better Process Management (Optional)

```bash
# Install PM2
sudo npm install -g pm2

# Replace systemd service with PM2
pm2 start /home/ubuntu/SIKOMA/backend/index.js --name sikoma-backend
pm2 startup systemd
pm2 save
```

### 3. Monitor Application

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Run htop
htop
```

---

## Support

For issues or questions:
1. Check logs using commands in the Troubleshooting section
2. Review GitHub repository issues: https://github.com/CahKangkung/SIKOMA/issues
3. Verify all environment variables are correctly set

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `sudo systemctl restart sikoma-backend` | Restart backend |
| `sudo systemctl restart nginx` | Restart nginx |
| `sudo journalctl -u sikoma-backend -f` | View backend logs |
| `sudo nginx -t` | Test nginx config |
| `cd /home/ubuntu/SIKOMA && git pull` | Update code |
| `sudo /home/ubuntu/SIKOMA/deployment/deploy.sh` | Auto deploy |

---

**Last Updated**: 2025-11-10
