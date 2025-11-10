# Quick Deployment Guide for SIKOMA

This is a simplified deployment guide with your actual configuration.

## EC2 Instance: 15.134.145.213

---

## Step 1: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@15.134.145.213
```

---

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify installations
node --version
npm --version
nginx -v
```

---

## Step 3: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/CahKangkung/SIKOMA.git
cd SIKOMA
```

---

## Step 4: Configure Backend

```bash
cd backend

# Copy production .env
cp ../deployment/.env.backend.production .env

# IMPORTANT: Edit JWT_SECRET with a strong random string
nano .env
# Change this line:
# JWT_SECRET=production-secret-change-this-to-random-string
# To something like:
# JWT_SECRET=aR3allyL0ngR4nd0mStr1ngF0rPr0duct10n2025

# Install dependencies
npm install

# Create uploads directory (if needed by backend)
mkdir -p uploads
```

---

## Step 5: Configure Frontend

```bash
cd ../frontend

# Copy production .env
cp ../deployment/.env.frontend.production .env

# Install dependencies
npm install

# Build for production
npm run build
```

---

## Step 6: Setup Backend Service

```bash
# Copy service file
sudo cp /home/ubuntu/SIKOMA/deployment/sikoma-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Start and enable service
sudo systemctl start sikoma-backend
sudo systemctl enable sikoma-backend

# Check status
sudo systemctl status sikoma-backend

# If it's running, you should see "active (running)"
# If not, check logs: sudo journalctl -u sikoma-backend -n 50
```

---

## Step 7: Setup Nginx

```bash
# Create directory for frontend
sudo mkdir -p /var/www/sikoma/frontend

# Copy frontend build files
sudo cp -r /home/ubuntu/SIKOMA/frontend/dist/* /var/www/sikoma/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/sikoma

# Copy nginx config
sudo cp /home/ubuntu/SIKOMA/deployment/nginx.conf /etc/nginx/sites-available/sikoma

# Enable site
sudo ln -sf /etc/nginx/sites-available/sikoma /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx
```

---

## Step 8: Configure MongoDB Atlas

1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com
2. Navigate to Network Access
3. Click "Add IP Address"
4. Add your EC2 public IP: `15.134.145.213/32`
5. Click "Confirm"

This allows your EC2 instance to connect to MongoDB Atlas.

---

## Step 9: Configure EC2 Security Group

In AWS Console:
1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add Inbound Rules:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: SSH, Port: 22, Source: Your IP

---

## Step 10: Verify Deployment

```bash
# Check backend status
sudo systemctl status sikoma-backend

# Check nginx status
sudo systemctl status nginx

# Test backend API locally
curl http://localhost:8080/api/docs

# Test via nginx proxy
curl http://localhost/api/docs
```

Open browser and visit:
- **Frontend**: http://15.134.145.213
- **Backend API**: http://15.134.145.213/api

---

## Troubleshooting

### Backend not starting?

```bash
# View backend logs
sudo journalctl -u sikoma-backend -n 50

# Common issues:
# 1. MongoDB connection - Check Atlas IP whitelist
# 2. Missing dependencies - Run: cd /home/ubuntu/SIKOMA/backend && npm install
# 3. Port already in use - Check: sudo netstat -tulpn | grep 8080
```

### Frontend not loading?

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if files exist
ls -la /var/www/sikoma/frontend/

# Rebuild frontend if needed
cd /home/ubuntu/SIKOMA/frontend
npm run build
sudo cp -r dist/* /var/www/sikoma/frontend/
```

### Can't connect to MongoDB Atlas?

```bash
# Test connection from EC2
curl -I https://cluster0.demub1g.mongodb.net

# Check if EC2 IP is whitelisted in Atlas
# Your EC2 IP: 15.134.145.213
```

---

## Future Updates

To update your application after making code changes:

```bash
# Make deployment script executable (first time only)
sudo chmod +x /home/ubuntu/SIKOMA/deployment/deploy.sh

# Run automated deployment
sudo /home/ubuntu/SIKOMA/deployment/deploy.sh
```

This script will:
1. Pull latest code from Git
2. Install dependencies
3. Build frontend
4. Restart services

---

## Useful Commands

```bash
# Restart backend
sudo systemctl restart sikoma-backend

# View backend logs in real-time
sudo journalctl -u sikoma-backend -f

# Restart nginx
sudo systemctl restart nginx

# Check what's running on ports
sudo netstat -tulpn | grep LISTEN

# Check disk space
df -h

# Check memory
free -h
```

---

## Security Notes

1. **JWT_SECRET**: Make sure you changed it from the default!
2. **MongoDB Atlas**: Only whitelist your EC2 IP (15.134.145.213)
3. **Firewall**: Only ports 22 (SSH) and 80 (HTTP) should be open
4. **Environment Files**: Keep .env files secure with: `chmod 600 backend/.env`
5. **Consider HTTPS**: For production, get a domain and setup SSL/HTTPS

---

## Support

If you encounter issues:
1. Check logs: `sudo journalctl -u sikoma-backend -n 100`
2. Check nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verify MongoDB Atlas Network Access includes your EC2 IP
4. Check AWS Security Group allows HTTP (port 80)

---

**Last Updated**: 2025-11-10
