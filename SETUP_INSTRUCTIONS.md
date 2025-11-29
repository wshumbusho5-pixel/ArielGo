# ArielGo Backend Setup Instructions

## Step 1: Install Node.js

Node.js is a JavaScript runtime that lets you run JavaScript on the server (backend).

### For Mac (your system):

**Option 1: Using Homebrew (Recommended)**
```bash
# If you don't have Homebrew, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node
```

**Option 2: Download directly**
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer
4. Follow the installation prompts

### Verify Installation:
After installing, open a new terminal and run:
```bash
node --version
npm --version
```

You should see version numbers like `v20.x.x` and `10.x.x`

---

## Step 2: Install Backend Dependencies

Once Node.js is installed, come back to this terminal and run:

```bash
cd /Users/willyshumbusho/laundry-delivery-startup
npm install
```

This will install all the necessary packages for the backend.

---

## Step 3: Run the Backend Server

```bash
npm start
```

The server will start on http://localhost:3000

---

## What You're Learning:

### Node.js
- JavaScript runtime for building servers
- Allows you to handle web requests, databases, file operations

### Express
- Web framework that makes building servers easy
- Handles routing (e.g., /api/bookings)

### SQLite
- Lightweight database stored in a single file
- Perfect for small businesses and learning
- No complex setup required

---

## Next Steps After Installation:

1. Install Node.js using one of the options above
2. Return to the terminal
3. I'll help you set up and run the backend!
