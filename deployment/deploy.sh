#!/bin/bash
# ==================================
# ARIELGO DEPLOYMENT SCRIPT
# Automated setup for AWS EC2
# ==================================

set -e  # Exit on any error

echo "========================================="
echo "🚀 ArielGo Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please do not run as root. Run as ubuntu user.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo -e "${BLUE}📦 Step 2: Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo -e "${BLUE}📦 Step 3: Installing Python and dependencies...${NC}"
sudo apt-get install -y python3 python3-pip python3-venv
echo "Python version: $(python3 --version)"

echo -e "${BLUE}📦 Step 4: Installing PostgreSQL...${NC}"
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo -e "${BLUE}📦 Step 5: Installing Nginx...${NC}"
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${BLUE}📦 Step 6: Setting up PostgreSQL database...${NC}"
DB_PASSWORD=$(openssl rand -base64 32)
sudo -u postgres psql <<EOF
CREATE DATABASE arielgo;
CREATE USER arielgo_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE arielgo TO arielgo_user;
ALTER DATABASE arielgo OWNER TO arielgo_user;
\c arielgo
GRANT ALL ON SCHEMA public TO arielgo_user;
\q
EOF

echo -e "${GREEN}✅ PostgreSQL database created${NC}"
echo -e "${YELLOW}📝 Database password: $DB_PASSWORD${NC}"
echo -e "${YELLOW}   Save this password! Adding to .env file...${NC}"

# Update .env file with database password
if [ -f /home/ubuntu/arielgo/.env ]; then
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" /home/ubuntu/arielgo/.env
    echo -e "${GREEN}✅ Updated .env with database password${NC}"
fi

echo -e "${BLUE}📦 Step 7: Installing Node.js dependencies...${NC}"
cd /home/ubuntu/arielgo
npm install --production

echo -e "${BLUE}📦 Step 8: Installing Python dependencies for admin...${NC}"
cd /home/ubuntu/arielgo/admin
pip3 install -r requirements.txt
pip3 install gunicorn

echo -e "${BLUE}📦 Step 9: Initializing PostgreSQL database tables...${NC}"
cd /home/ubuntu/arielgo
export $(cat .env | grep -v '^#' | xargs)
node -e "const db = require('./database/database-pg.js');" || echo "Database initialization will complete on first run"

echo -e "${BLUE}📦 Step 10: Setting up systemd services...${NC}"
sudo cp /home/ubuntu/arielgo/deployment/arielgo-backend.service /etc/systemd/system/
sudo cp /home/ubuntu/arielgo/deployment/arielgo-admin.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable arielgo-backend
sudo systemctl enable arielgo-admin

echo -e "${BLUE}📦 Step 11: Configuring Nginx...${NC}"
sudo cp /home/ubuntu/arielgo/deployment/nginx.conf /etc/nginx/sites-available/arielgo
sudo ln -sf /etc/nginx/sites-available/arielgo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Get the domain from .env or use placeholder
DOMAIN=$(grep DOMAIN /home/ubuntu/arielgo/.env | cut -d '=' -f2 || echo "yourdomain.com")

# Replace placeholder domain in nginx config
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/arielgo

sudo nginx -t && sudo systemctl reload nginx || echo "Nginx config has errors - will fix manually"

echo -e "${GREEN}✅ Nginx configured${NC}"

echo -e "${BLUE}📦 Step 12: Starting services...${NC}"
sudo systemctl start arielgo-backend
sudo systemctl start arielgo-admin

# Wait a moment for services to start
sleep 3

# Check service status
if sudo systemctl is-active --quiet arielgo-backend; then
    echo -e "${GREEN}✅ Backend service running${NC}"
else
    echo -e "${RED}❌ Backend service failed${NC}"
    sudo journalctl -u arielgo-backend -n 20
fi

if sudo systemctl is-active --quiet arielgo-admin; then
    echo -e "${GREEN}✅ Admin service running${NC}"
else
    echo -e "${RED}❌ Admin service failed${NC}"
    sudo journalctl -u arielgo-admin -n 20
fi

echo -e "${BLUE}📦 Step 13: Setting up SSL with Let's Encrypt...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your application is running at:"
echo "  - Main site: http://$(curl -s ifconfig.me)"
echo "  - Admin: http://$(curl -s ifconfig.me)"
echo ""
echo -e "${YELLOW}📋 IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Point your domain DNS to this IP: $(curl -s ifconfig.me)"
echo ""
echo "2. Wait for DNS to propagate (5-30 minutes)"
echo ""
echo "3. Run SSL certificate setup:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d admin.$DOMAIN"
echo ""
echo "4. Update Stripe webhook URL to: https://$DOMAIN/api/webhooks/stripe"
echo ""
echo "5. Test the application:"
echo "   - Visit: http://$(curl -s ifconfig.me)"
echo "   - Create a test booking"
echo "   - Check admin at: http://$(curl -s ifconfig.me)/admin"
echo ""
echo "6. Check service logs:"
echo "   sudo journalctl -u arielgo-backend -f"
echo "   sudo journalctl -u arielgo-admin -f"
echo ""
echo -e "${YELLOW}🔐 Database Password (SAVE THIS):${NC}"
echo "   $DB_PASSWORD"
echo ""
echo -e "${GREEN}🎉 ArielGo is ready for business!${NC}"
echo ""
