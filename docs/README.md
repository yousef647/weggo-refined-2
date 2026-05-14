# Weggo Documentation

Welcome to the Weggo developer documentation! This guide will help you understand, set up, and work on the Weggo marketplace project.

## 📚 Documentation Overview

### Getting Started
- **[SETUP.md](./SETUP.md)** - Step-by-step guide to get the project running locally
- **[TEAM.md](./TEAM.md)** - Team roles, responsibilities, and getting started guide

### Understanding the Project
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure and how everything is organized
- **[CODEBASE.md](./CODEBASE.md)** - Deep dive into how the codebase works
- **[DATABASE.md](./DATABASE.md)** - Database models and data structure

### Implementation Details
- **[API.md](./API.md)** - API endpoints reference
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - How authentication and authorization work
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guidelines and common tasks

### Project Management
- **[TASKS.md](./TASKS.md)** - Feature completion status and task assignments by skill level

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Seed initial data
npm run seed:categories
npm run seed:admin

# 4. Start development server
npm dev
```

Visit `http://localhost:3000` to see the app!

## 💡 What is Weggo?

Weggo is a **second-hand marketplace** where users can:
- 🛍️ Browse and purchase items
- 📤 List items for sale
- ✉️ Message other users
- ❤️ Save favorite items to wishlist
- 👮 Get admin support and item management

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | **Next.js 15** (App Router) |
| Language | **TypeScript** |
| Database | **MongoDB** + **Mongoose ODM** |
| Authentication | **NextAuth.js** (Credentials + bcrypt) |
| Validation | **Zod** |
| Styling | **Tailwind CSS** + **Radix UI** |
| Runtime | **Node.js 20+** |

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 20+** - [Download here](https://nodejs.org)
- **MongoDB** - Running locally or have a connection string ready
- **npm** - Comes with Node.js
- **Git** - For version control

## 🎯 Key Features

### User Roles
- **Buyer** - Default role, can browse and purchase items
- **Seller** - Upgraded role, can create listings
- **Admin** - Full access to manage users, listings, and audit logs

### Core Features
- ✅ User registration & login with email/password
- ✅ Secure password reset via email
- ✅ Marketplace listing creation & editing
- ✅ Real-time messaging between users
- ✅ Wishlist management
- ✅ Admin dashboard for moderation
- ✅ User ban system for safety
- ✅ File uploads for product images
- ✅ Comprehensive audit logging

## 📖 Next Steps

**Are you a team member?**
- ⭐⭐⭐⭐⭐ **Full Stack Lead** → Start with [TEAM.md](./TEAM.md) then [ARCHITECTURE.md](./ARCHITECTURE.md)
- ⭐⭐⭐⭐ **Senior Developer** → Start with [TEAM.md](./TEAM.md) then [CODEBASE.md](./CODEBASE.md)
- ⭐⭐ **Junior Developer** → Start with [TEAM.md](./TEAM.md) then [SETUP.md](./SETUP.md)

**General path:**
1. **New to the project?** Start with [SETUP.md](./SETUP.md)
2. **Want to understand the structure?** Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Need API details?** Check [API.md](./API.md)
4. **Ready to develop?** See [DEVELOPMENT.md](./DEVELOPMENT.md)
5. **See what needs to be done?** Review [TASKS.md](./TASKS.md)

---

**Questions?** Check the relevant documentation file or reach out to your team lead!
