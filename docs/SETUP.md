# Setup Guide - Getting Weggo Running Locally

This guide will walk you through setting up Weggo on your local machine step-by-step.

## ✅ Prerequisites

Before you start, make sure you have:
- **Node.js 20+** ([Download](https://nodejs.org))
- **MongoDB** running locally or accessible
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v20 or higher

# Check npm version
npm --version   # Should be v10 or higher

# Check MongoDB is running
# Windows: MongoDB should be in Services, or running via WSL
# macOS: brew services list | grep mongodb
# Linux: sudo systemctl status mongod
```

## 📥 Step 1: Clone and Install Dependencies

```bash
# Navigate to your project directory
cd weggo

# Install all dependencies
npm install
```

This installs all required packages including:
- Next.js, React, TypeScript
- Mongoose for database
- NextAuth.js for authentication
- Tailwind CSS for styling

**Expected time:** 2-5 minutes

## 🔑 Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Now open `.env` and configure these variables:

```env
# Database connection
MONGODB_URI=mongodb://127.0.0.1:27017/weggo
# ^ This is fine for local MongoDB. If using MongoDB Atlas or remote:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weggo

# Authentication secret (generate a new one for production!)
AUTH_SECRET=your-long-random-string-here
# Generate one: openssl rand -base64 32

# Where your app is running
AUTH_URL=http://localhost:3000

# Email configuration (optional, can be left blank for local dev)
EMAIL_FROM=noreply@weggo.local
RESEND_API_KEY=

# Logging (useful for testing email reset links)
LOG_RESET_LINK=true

# Admin account seeding
SEED_ADMIN_EMAIL=admin@weggo.local
SEED_ADMIN_PASSWORD=ChangeMe123!
```

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection string | `mongodb://127.0.0.1:27017/weggo` |
| `AUTH_SECRET` | Secret for JWT tokens (keep secure!) | `openssl rand -base64 32` |
| `AUTH_URL` | Your app's URL for auth callbacks | `http://localhost:3000` |
| `EMAIL_FROM` | Sender email for password resets | `noreply@weggo.local` |
| `RESEND_API_KEY` | API key for email service (optional) | `re_xxxxx` |
| `LOG_RESET_LINK` | Log password reset links to console | `true` |
| `SEED_ADMIN_EMAIL` | Email for seeded admin account | `admin@weggo.local` |
| `SEED_ADMIN_PASSWORD` | Password for seeded admin account | `ChangeMe123!` |

## 🌱 Step 3: Seed Initial Data

Seeding creates initial data in your database so you have something to work with.

### 3a. Seed Categories (Required)

Categories organize products (e.g., Electronics, Clothing, etc.)

```bash
npm run seed:categories
```

This creates parent categories and subcategories with URL slugs. Output:
```
✓ Created XX categories
✓ Seeding complete
```

### 3b. Seed Admin Account (Required)

Creates a test admin account for testing admin features.

```bash
npm run seed:admin
```

Uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env`.

**⚠️ Security Note:** This only runs in development mode (`NODE_ENV` not `production`).

### 3c. Seed Demo Listings (Optional)

Creates demo marketplace listings with images.

```bash
npm run seed:listings
```

This creates listings with:
- Demo images from picsum.photos
- Random categories
- Multiple seller accounts
- Realistic pricing

**Note:** Requires categories and at least one seller account to exist.

## ▶️ Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
> next dev --turbopack

  ▲ Next.js 15.3.2
  - Local:        http://localhost:3000

Ready in 1.23s
```

The app is now running! 🎉

## 🌐 Step 5: Access the Application

Open your browser and visit:

- **Home Page** - http://localhost:3000
- **Login** - http://localhost:3000/login
- **Register** - http://localhost:3000/register
- **Admin Panel** - http://localhost:3000/admin (admin only)

### Test Accounts

After seeding, you can log in with:

**Admin Account:**
- Email: `admin@weggo.local`
- Password: `ChangeMe123!` (or what you set in `.env`)

**Demo Seller Account (if seeded listings):**
- Email: `mockseller@weggo.local`
- Password: `Mock12345!`

## 🔧 Available Commands

```bash
# Development server with Turbopack (fastest)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run ESLint
npm run lint

# Seed commands
npm run seed:categories    # Create categories
npm run seed:admin         # Create admin account
npm run seed:listings      # Create demo listings
```

## 🚨 Common Issues

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Make sure MongoDB is running:
- **Windows**: Check Services or start MongoDB Server
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

Or update `MONGODB_URI` with your MongoDB Atlas connection string.

### AUTH_SECRET Error

```
Error: AUTH_SECRET environment variable is required
```

**Solution:** Generate a secret and add to `.env`:
```bash
openssl rand -base64 32
# Copy the output to AUTH_SECRET in .env
```

### Port Already in Use

```
Error: listen EADDRINUSE :::3000
```

**Solution:** Change the port:
```bash
npm run dev -- -p 3001
# Now visit http://localhost:3001
```

### Node Modules Issues

```
npm install
npm cache clean --force
npm install
```

## 📚 Next Steps

Once you have the app running:

1. ✅ Explore the UI in your browser
2. 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the structure
3. 🔍 Check [CODEBASE.md](./CODEBASE.md) to see how things work
4. 🛠️ Review [DEVELOPMENT.md](./DEVELOPMENT.md) for dev guidelines

## 💡 Tips

- The dev server auto-reloads when you save files
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- Database changes persist between restarts
- Clear browser cache if seeing stale content (Ctrl+Shift+Del)

---

**Need help?** Check [README.md](./README.md) for documentation overview or ask your team!
