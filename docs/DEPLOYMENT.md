# 🚀 Deployment Guide

Production deployment for Meme Terminal on a Linux VPS (Ubuntu 22.04+).

---

## Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 512 MB | 1 GB |
| Disk | 5 GB | 20 GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| Node.js | ≥ 18.0.0 | 20 LTS |

---

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via nvm — recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## 2. Clone & Configure

```bash
# Clone the repo
git clone https://github.com/Penguin-Life/meme-terminal.git
cd meme-terminal

# Backend
cd backend
npm install --production
cp .env.example .env
nano .env  # Fill in your tokens/keys

# Frontend build
cd ../frontend
npm install
# Edit .env: set VITE_API_URL to your domain
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env
npm run build
# Output: frontend/dist/
```

---

## 3. PM2 Setup

The `backend/ecosystem.config.js` is pre-configured:

```bash
cd backend

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config for auto-restart
pm2 save

# Enable auto-start on boot
pm2 startup
# Run the command it outputs (e.g., sudo env PATH=...)

# Monitor
pm2 status
pm2 logs meme-terminal-backend
pm2 monit
```

**ecosystem.config.js** (already in repo):
```js
module.exports = {
  apps: [{
    name: 'meme-terminal-backend',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3902
    }
  }]
}
```

---

## 4. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/meme-terminal
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3902;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }
}

# Frontend
server {
    listen 80;
    server_name meme.yourdomain.com;
    root /var/www/meme-terminal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meme-terminal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Deploy frontend
sudo mkdir -p /var/www/meme-terminal
sudo cp -r frontend/dist/* /var/www/meme-terminal/
sudo chown -R www-data:www-data /var/www/meme-terminal
```

---

## 5. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d api.yourdomain.com -d meme.yourdomain.com

# Auto-renew (already set up by certbot, verify):
sudo systemctl status certbot.timer
```

---

## 6. Frontend Build & Deploy (CI/CD pattern)

```bash
# On your local machine or CI server:
cd frontend
npm run build

# Transfer to server
rsync -avz --delete dist/ user@yourserver:/var/www/meme-terminal/

# Or on the server:
cd /path/to/meme-terminal
git pull origin main
cd frontend && npm install && npm run build
sudo cp -r dist/* /var/www/meme-terminal/
```

---

## 7. Environment Hardening

```bash
# Set proper .env permissions
chmod 600 backend/.env

# Ensure logs directory exists
mkdir -p backend/logs
chmod 755 backend/logs

# Set NODE_ENV in .env
echo "NODE_ENV=production" >> backend/.env

# Firewall (UFW)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 8. Monitoring & Maintenance

```bash
# View live logs
pm2 logs meme-terminal-backend --lines 100

# App-level logs
tail -f backend/logs/app-$(date +%Y-%m-%d).log

# Restart after config changes
pm2 restart meme-terminal-backend

# Update deployment
git pull origin main
cd backend && npm install --production
pm2 restart meme-terminal-backend
cd ../frontend && npm install && npm run build
sudo cp -r dist/* /var/www/meme-terminal/
```

---

## Quick Reference

```
Backend API:  https://api.yourdomain.com
Frontend:     https://meme.yourdomain.com
Health check: https://api.yourdomain.com/api/health
Cache stats:  https://api.yourdomain.com/api/cache/stats
PM2 logs:     pm2 logs meme-terminal-backend
App logs:     backend/logs/app-YYYY-MM-DD.log
```
