# SIKOMA Deployment Files

This directory contains all the necessary configuration files for deploying SIKOMA to an EC2 instance.

## Files Overview

### Configuration Files

1. **nginx.conf**
   - Nginx reverse proxy configuration
   - Routes frontend requests to static files
   - Proxies backend API requests to port 8080
   - Handles CORS and file upload settings

2. **sikoma-backend.service**
   - Systemd service file for backend
   - Manages backend process lifecycle
   - Auto-restart on failure
   - Logs to journalctl

### Environment Templates

3. **.env.backend.production**
   - Production environment variables for backend
   - Contains your actual MongoDB Atlas credentials
   - Includes Gemini API, Google OAuth, and email settings
   - **IMPORTANT**: Change JWT_SECRET before deploying!

4. **.env.frontend.production**
   - Production environment variables for frontend
   - Points to your EC2 public IP for API calls

### Deployment Scripts

5. **deploy.sh**
   - Automated deployment script
   - Pulls latest code, installs dependencies, builds, and restarts services
   - Creates automatic backups before deployment
   - Verifies all services after deployment

## Usage

### Initial Deployment

Follow the step-by-step guide in:
- **[QUICK_DEPLOY.md](../QUICK_DEPLOY.md)** - Simplified guide with your configuration
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Complete detailed guide

### Automated Deployment (After Initial Setup)

```bash
# Make script executable (first time only)
sudo chmod +x /home/ubuntu/SIKOMA/deployment/deploy.sh

# Run deployment
sudo /home/ubuntu/SIKOMA/deployment/deploy.sh
```

## Important Notes

### MongoDB Atlas Configuration
- This deployment uses MongoDB Atlas (cloud), not local MongoDB
- You must whitelist your EC2 IP (15.134.145.213) in MongoDB Atlas Network Access
- No need to install MongoDB on the EC2 instance

### Port Configuration
- Backend runs on port 8080 (internal)
- Nginx listens on port 80 (public)
- Frontend is served as static files by Nginx
- API requests are proxied to backend at /api/*

### Security
1. Change JWT_SECRET in production .env file
2. Keep .env files secure (chmod 600)
3. Only open port 80 (HTTP) and 22 (SSH) in security group
4. Whitelist only EC2 IP in MongoDB Atlas

## File Locations on EC2

After deployment, files will be located at:

```
/home/ubuntu/SIKOMA/              # Application code
/var/www/sikoma/frontend/         # Frontend static files (served by nginx)
/etc/nginx/sites-available/sikoma # Nginx configuration
/etc/systemd/system/sikoma-backend.service # Backend service
```

## Troubleshooting

### View Logs
```bash
# Backend logs
sudo journalctl -u sikoma-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart backend
sudo systemctl restart sikoma-backend

# Restart nginx
sudo systemctl restart nginx
```

### Check Service Status
```bash
# Backend status
sudo systemctl status sikoma-backend

# Nginx status
sudo systemctl status nginx
```

## Architecture Diagram

```
Internet
    ↓
EC2 Instance (15.134.145.213)
    ↓
Nginx (Port 80)
    ├─→ Static Files (/var/www/sikoma/frontend/) → React Frontend
    └─→ /api/* → Proxy to Backend (localhost:8080)
                    ↓
                Express Backend (Port 8080)
                    ↓
                MongoDB Atlas (Cloud)
                    ├─→ documentDB
                    └─→ userDB
```

## Additional Resources

- **Gemini API**: Used for AI features
- **Google OAuth**: For Google authentication
- **Email Service**: Gmail for password reset emails

---

**Deployment Target**: EC2 (15.134.145.213)
**Repository**: https://github.com/CahKangkung/SIKOMA.git
**Last Updated**: 2025-11-10
