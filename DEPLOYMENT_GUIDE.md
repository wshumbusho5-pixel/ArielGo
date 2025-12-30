# 🚀 ArielGo AWS Deployment Guide

Complete step-by-step guide to deploy ArielGo on AWS EC2.

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ AWS account created
- ✅ Domain name (e.g., arielgo.com)
- ✅ Stripe account (for payments)
- ✅ OpenAI API key (for AI assistant)
- ✅ EC2 key pair downloaded (arielgo-key-california.pem)

---

## 🎯 Deployment Overview

**Total time:** ~30 minutes
**Cost:** FREE for 12 months, then ~$8-10/month

**What we'll do:**
1. Launch EC2 instance
2. Upload your code
3. Run automated deployment script
4. Configure domain and SSL
5. Test everything

---

## Step 1: Launch EC2 Instance (When Approved)

### 1.1 Wait for AWS Approval Email

You'll receive an email titled: **"Your AWS Service Limit Increase Request has been approved"**

This usually takes **15 minutes to 2 hours**.

### 1.2 Launch Instance

Once approved:

1. Go to **AWS Console** → **EC2** → **Launch Instance**

2. **Configuration:**
   ```
   Name: ArielGo-Production
   OS: Ubuntu Server 24.04 LTS
   Instance type: t3.micro (Free tier eligible)
   Key pair: arielgo-key-california (or your key name)

   Network settings:
   ☑ Allow SSH traffic from: Anywhere
   ☑ Allow HTTPS traffic from the internet
   ☑ Allow HTTP traffic from the internet

   Storage: 8 GiB gp3
   ```

3. Click **"Launch instance"**

4. Wait ~2 minutes for "Instance State" = **Running**

5. **Copy your Public IP address** (looks like: 54.123.45.67)

---

## Step 2: Connect to Your Server

### 2.1 Find Your Key File

Locate your downloaded key file:
```
arielgo-key-california.pem
```

Move it to a safe location (e.g., Documents folder)

### 2.2 Set Correct Permissions (Mac/Linux)

Open Terminal and run:

```bash
cd ~/Downloads  # or wherever your key is
chmod 400 arielgo-key-california.pem
mv arielgo-key-california.pem ~/Documents/
```

### 2.3 Connect via SSH

Replace `YOUR_IP` with your actual EC2 IP address:

```bash
ssh -i ~/Documents/arielgo-key-california.pem ubuntu@YOUR_IP
```

Type `yes` when asked about authenticity.

You should see:
```
Welcome to Ubuntu 24.04 LTS
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

**You're now inside your EC2 server!** 🎉

---

## Step 3: Upload Your Code

### 3.1 On Your Local Machine

Open a **NEW terminal window** (keep the SSH session open).

Navigate to your project:

```bash
cd /Users/willyshumbusho/laundry-delivery-startup
```

### 3.2 Create Deployment Package

Exclude unnecessary files:

```bash
# Create a tarball of your code
tar -czf arielgo-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.md' \
  --exclude='database/*.db' \
  --exclude='*.log' \
  .
```

### 3.3 Upload to EC2

Replace `YOUR_IP` with your EC2 IP:

```bash
scp -i ~/Documents/arielgo-key-california.pem \
  arielgo-deploy.tar.gz \
  ubuntu@YOUR_IP:/home/ubuntu/
```

---

## Step 4: Deploy on EC2

### 4.1 Back in Your SSH Session

Extract the code:

```bash
cd /home/ubuntu
tar -xzf arielgo-deploy.tar.gz -C arielgo
cd arielgo
```

### 4.2 Create Production Environment File

```bash
cp .env.production .env
nano .env
```

**Fill in these REQUIRED values:**

```bash
# Your domain
DOMAIN=yourdomain.com

# Stripe keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# OpenAI key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Generate session secret
EXPRESS_SESSION_SECRET=$(openssl rand -base64 32)

# Generate admin secret
ADMIN_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 4.3 Run Deployment Script

```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

This will:
- ✅ Install Node.js, Python, PostgreSQL, Nginx
- ✅ Set up database
- ✅ Install dependencies
- ✅ Configure services
- ✅ Start your applications

**Time:** ~10-15 minutes

**IMPORTANT:** Save the database password shown at the end!

---

## Step 5: Point Your Domain

### 5.1 Get Your Server IP

```bash
curl ifconfig.me
```

Copy this IP address (e.g., 54.123.45.67)

### 5.2 Update DNS Records

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_EC2_IP | 3600 |
| A | www | YOUR_EC2_IP | 3600 |
| A | admin | YOUR_EC2_IP | 3600 |

**Wait 5-30 minutes** for DNS to propagate.

### 5.3 Check DNS Propagation

```bash
nslookup yourdomain.com
```

Should show your EC2 IP address.

---

## Step 6: Set Up SSL (HTTPS)

### 6.1 Install SSL Certificate

Once DNS is working:

```bash
sudo certbot --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d admin.yourdomain.com
```

**Follow the prompts:**
- Enter your email
- Agree to terms
- Choose: Redirect HTTP to HTTPS (option 2)

**Certbot will:**
- ✅ Get free SSL certificate from Let's Encrypt
- ✅ Auto-configure Nginx
- ✅ Set up auto-renewal

### 6.2 Enable HTTPS in Nginx

```bash
sudo nano /etc/nginx/sites-available/arielgo
```

Find the commented SSL sections and uncomment them (remove the `#`).

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Configure Stripe Webhook

### 7.1 Get Webhook URL

Your webhook URL is:
```
https://yourdomain.com/api/webhooks/stripe
```

### 7.2 Add to Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### 7.3 Update .env

```bash
cd /home/ubuntu/arielgo
nano .env
```

Update:
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET
```

Restart services:
```bash
sudo systemctl restart arielgo-backend
```

---

## Step 8: Test Everything

### 8.1 Test Main Website

Visit: https://yourdomain.com

You should see your ArielGo website!

**Test:**
- ✅ Create a test booking
- ✅ Check prices calculate correctly
- ✅ Try AI assistant (if logged in)

### 8.2 Test Admin Dashboard

Visit: https://admin.yourdomain.com

**Create admin user:**

```bash
cd /home/ubuntu/arielgo/admin
python3 create_admin.py
```

Follow prompts to create your admin account.

**Test:**
- ✅ Login to admin
- ✅ View bookings
- ✅ Create a driver
- ✅ Assign driver to booking

### 8.3 Test Driver Dashboard

Visit: https://yourdomain.com/driver-login.html

Login with driver credentials (created in admin).

**Test:**
- ✅ View assigned orders
- ✅ Update order status

---

## 🔍 Monitoring & Logs

### Check Service Status

```bash
# Backend status
sudo systemctl status arielgo-backend

# Admin status
sudo systemctl status arielgo-admin

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

### View Logs

```bash
# Backend logs (real-time)
sudo journalctl -u arielgo-backend -f

# Admin logs (real-time)
sudo journalctl -u arielgo-admin -f

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Database Access

```bash
sudo -u postgres psql arielgo
```

Common queries:
```sql
-- View all bookings
SELECT * FROM bookings ORDER BY "createdAt" DESC LIMIT 10;

-- Count bookings by status
SELECT status, COUNT(*) FROM bookings GROUP BY status;

-- Exit
\q
```

---

## 🛠️ Common Commands

### Restart Services

```bash
# Restart backend
sudo systemctl restart arielgo-backend

# Restart admin
sudo systemctl restart arielgo-admin

# Restart Nginx
sudo systemctl restart nginx
```

### Update Code

```bash
cd /home/ubuntu/arielgo
git pull  # if using git
# or upload new tarball and extract

npm install --production
cd admin && pip3 install -r requirements.txt

sudo systemctl restart arielgo-backend
sudo systemctl restart arielgo-admin
```

### Database Backup

```bash
# Create backup
sudo -u postgres pg_dump arielgo > ~/backup-$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql arielgo < ~/backup-20250101.sql
```

---

## 🆘 Troubleshooting

### Website Not Loading

```bash
# Check if services are running
sudo systemctl status arielgo-backend
sudo systemctl status nginx

# Check logs
sudo journalctl -u arielgo-backend -n 50
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check .env has correct DB_PASSWORD
cat /home/ubuntu/arielgo/.env | grep DB_PASSWORD

# Test connection
sudo -u postgres psql -U arielgo_user -d arielgo
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Port Already in Use

```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 PID_NUMBER
```

---

## 📊 Cost Monitoring

### Set Up Billing Alerts

You already did this! But you can add more:

1. AWS Console → Billing → Budgets
2. Create budget for $5, $8, $10

### Check Current Costs

```bash
AWS Console → Billing → Cost Explorer
```

**Expected costs:**
- Months 1-12: $0-1/month (free tier + OpenAI)
- After month 12: $8-10/month

---

## 🎯 Production Checklist

Before going live:

- [ ] SSL certificate installed and working
- [ ] Stripe in live mode (not test mode)
- [ ] Webhook configured and tested
- [ ] Admin account created
- [ ] Test booking completed successfully
- [ ] Email notifications working
- [ ] SMS notifications working (if enabled)
- [ ] AI assistant rate limits tested
- [ ] Database backups configured
- [ ] Monitoring/alerts set up
- [ ] Domain pointing correctly
- [ ] All services running and auto-start on reboot

---

## 🚨 Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

2. **Monitor logs regularly**

3. **Rotate secrets every 90 days**

4. **Enable AWS CloudWatch monitoring**

5. **Set up automated database backups**

6. **Use environment variables (never hardcode secrets)**

7. **Enable 2FA on:**
   - AWS account
   - Stripe account
   - OpenAI account
   - Domain registrar

---

## 📞 Need Help?

**Check logs first:**
```bash
sudo journalctl -u arielgo-backend -n 100
```

**Common issues:**
- Port conflicts → Change PORT in .env
- Database errors → Check DB_PASSWORD in .env
- Nginx errors → Check domain DNS settings

---

## 🎉 You're Live!

Congratulations! ArielGo is now running in production on AWS!

**Your URLs:**
- Main site: https://yourdomain.com
- Admin: https://admin.yourdomain.com
- Driver: https://yourdomain.com/driver-login.html

**Next steps:**
- Start marketing your service
- Monitor for bookings
- Scale up if needed

Good luck! 🚀
