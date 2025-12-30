# ArielGo Deployment Guide

## 🚀 Quick Start (Local Development)

### Option 1: Automatic (Easiest)
```bash
./start-demo.sh
```
This will:
- Start Node.js backend (port 3001)
- Start Flask admin (port 5002)
- Open browser windows automatically

### Option 2: Manual
```bash
# Terminal 1 - Node.js Backend
npm start

# Terminal 2 - Flask Admin
cd admin
python3 app.py
```

Then open:
- Customer site: http://localhost:3001
- Admin dashboard: http://localhost:5002

---

## 📋 Prerequisites

### Required:
- **Node.js** v14+ (you have v25.2.1 ✓)
- **Python 3** (you have 3.9.6 ✓)
- **npm** (comes with Node.js)
- **pip3** (comes with Python)

### Optional:
- **Ollama** for AI assistant
- **Stripe account** for payments
- **Twilio account** for SMS

---

## 🔧 First-Time Setup

### 1. Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies:**
```bash
cd admin
pip3 install -r requirements.txt
cd ..
```

### 2. Configure Environment

**Copy environment template:**
```bash
cp .env.example .env
```

**Edit `.env` file:**
```bash
# Required (already set)
PORT=3001
EXPRESS_SESSION_SECRET=<your-secret>

# Optional - Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional - SMS Notifications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Optional - Email Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional - AI Assistant
OPENAI_API_KEY=sk-...
```

### 3. Create Admin User

**Run the creation script:**
```bash
cd database
python3 create_admin_users.py
```

**Or use SQLite directly:**
```bash
sqlite3 database/arielgo.db
```

```sql
INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active)
VALUES ('admin', '<bcrypt-hash>', 'admin@arielgo.com', 'Administrator', 'super_admin', 1);
```

### 4. Test System

```bash
./test-system.sh
```

Should show: ✅ ALL TESTS PASSED

---

## 🎯 Production Deployment

### Phase 1: VPS Deployment (DigitalOcean/AWS)

**1. Provision Server:**
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- 25GB SSD

**2. Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip

# Install SQLite
sudo apt install -y sqlite3

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

**3. Clone Repository:**
```bash
cd /var/www
git clone <your-repo-url> arielgo
cd arielgo
npm install
cd admin && pip3 install -r requirements.txt && cd ..
```

**4. Configure Environment:**
```bash
cp .env.example .env
nano .env
# Fill in production values
```

**5. Setup Process Manager (PM2):**
```bash
# Install PM2
sudo npm install -g pm2

# Start Node.js backend
pm2 start server.js --name arielgo-backend

# Start Flask admin
pm2 start ecosystem.config.js --only arielgo-admin

# Save PM2 configuration
pm2 save
pm2 startup
```

**6. Configure Nginx:**
```nginx
# /etc/nginx/sites-available/arielgo
server {
    server_name arielgo.com www.arielgo.com;
    
    # Customer site
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin dashboard
    location /admin {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/arielgo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**7. Setup SSL Certificate:**
```bash
sudo certbot --nginx -d arielgo.com -d www.arielgo.com
```

**8. Setup Firewall:**
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

---

## 🔄 Database Migration (SQLite → PostgreSQL)

### When to Migrate:
- 1000+ orders/month
- Multiple concurrent users
- Need for advanced queries
- Scaling to multiple servers

### Migration Steps:

**1. Install PostgreSQL:**
```bash
sudo apt install postgresql postgresql-contrib
```

**2. Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE arielgo;
CREATE USER arielgo_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE arielgo TO arielgo_user;
\q
```

**3. Export SQLite Data:**
```bash
sqlite3 database/arielgo.db .dump > dump.sql
```

**4. Convert & Import:**
```bash
# Edit dump.sql to fix PostgreSQL compatibility
# Import to PostgreSQL
psql -U arielgo_user -d arielgo -f dump.sql
```

**5. Update Database Connection:**
```javascript
// Replace sqlite3 with pg
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  database: 'arielgo',
  user: 'arielgo_user',
  password: process.env.DB_PASSWORD,
  port: 5432
});
```

---

## 📊 Monitoring & Maintenance

### Setup Monitoring:

**1. PM2 Monitoring:**
```bash
pm2 monit
```

**2. Nginx Logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**3. Application Logs:**
```bash
pm2 logs arielgo-backend
pm2 logs arielgo-admin
```

### Backup Strategy:

**Daily Database Backup:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
sqlite3 /var/www/arielgo/database/arielgo.db ".backup /backups/arielgo-$DATE.db"
find /backups -name "arielgo-*.db" -mtime +30 -delete
```

**Setup Cron:**
```bash
crontab -e
# Add: 0 2 * * * /var/www/arielgo/backup.sh
```

---

## 🚨 Troubleshooting

### Issue: Node server won't start
```bash
# Check if port is in use
lsof -i :3001
# Kill process if needed
kill -9 <PID>
```

### Issue: Database locked
```bash
# Close all connections
fuser -k database/arielgo.db
# Restart server
pm2 restart arielgo-backend
```

### Issue: Flask won't start
```bash
# Check Python version
python3 --version
# Reinstall dependencies
pip3 install -r admin/requirements.txt --force-reinstall
```

### Issue: Permission denied
```bash
# Fix file ownership
sudo chown -R www-data:www-data /var/www/arielgo
# Fix permissions
sudo chmod -R 755 /var/www/arielgo
```

---

## 📈 Scaling Checklist

### At 100 orders/month:
- [ ] Add Redis caching
- [ ] Setup CDN for static assets
- [ ] Implement rate limiting
- [ ] Add error monitoring (Sentry)

### At 500 orders/month:
- [ ] Migrate to PostgreSQL
- [ ] Add load balancer
- [ ] Setup staging environment
- [ ] Implement CI/CD pipeline

### At 1000+ orders/month:
- [ ] Microservices architecture
- [ ] Separate database server
- [ ] Multiple application servers
- [ ] Auto-scaling infrastructure

---

## 🔐 Security Checklist

### Before Production:
- [ ] Change all default passwords
- [ ] Use HTTPS everywhere
- [ ] Enable CORS properly
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Setup security headers
- [ ] Run security audit
- [ ] Setup automated backups
- [ ] Configure firewall rules
- [ ] Enable 2FA for admin accounts

---

## 💰 Cost Estimates

### Development (Current):
- **Hosting:** $0
- **Total:** $0/month

### Production Phase 1 (0-100 orders):
- **VPS (DigitalOcean):** $12/month
- **Domain:** $15/year
- **SSL:** $0 (Let's Encrypt)
- **Total:** ~$15/month

### Production Phase 2 (100-1000 orders):
- **VPS (2GB RAM):** $50/month
- **PostgreSQL (managed):** $50/month
- **Redis (managed):** $25/month
- **Monitoring:** $20/month
- **Total:** ~$150/month

---

## 📞 Support

**For Issues:**
1. Check logs: `pm2 logs`
2. Check system: `./test-system.sh`
3. Review documentation above
4. Check GitHub issues

**For Production Deployment:**
Contact: hello@arielgo.com

---

**Last Updated:** December 26, 2024
**Version:** 1.0.0 (MVP)
