# Architecture & Project Structure

This guide explains how the Weggo project is organized and how the different parts fit together.

## 📁 Project Structure

```
weggo/
├── src/                      # All application source code
│   ├── app/                  # Next.js App Router (Pages & API routes)
│   ├── components/           # React components (UI building blocks)
│   ├── lib/                  # Utility functions and helpers
│   ├── models/               # MongoDB/Mongoose schemas
│   ├── types/                # TypeScript type definitions
│   ├── auth.ts              # Authentication configuration
│   ├── auth.shared.ts        # Auth utilities for server & client
│   ├── auth.edge.ts         # Auth middleware for edge runtime
│   └── middleware.ts        # Next.js middleware
│
├── scripts/                  # Database seeding scripts
│   ├── seed-admin.ts
│   ├── seed-categories.ts
│   └── seed-listings.ts
│
├── public/                   # Static files & uploads
│   └── uploads/             # User-uploaded images
│
├── docs/                     # Documentation (you are here!)
│
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.mjs        # PostCSS configuration
└── .env                     # Environment variables
```

## 🏗️ Architecture Layers

Weggo follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│         User Browser (Frontend)             │
│    React Components + Tailwind CSS          │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────┐
│         Next.js API Routes                  │
│    (Route Handlers in src/app/api/)         │
│    - Validation (Zod)                       │
│    - Authorization checks                   │
└──────────────────┬──────────────────────────┘
                   │ Query/Update
┌──────────────────▼──────────────────────────┐
│        Database Layer                       │
│    - Mongoose Models                        │
│    - MongoDB Collections                    │
│    - Validation & Indexing                  │
└─────────────────────────────────────────────┘
```

## 🗂️ Detailed Structure

### `/src/app` - Pages & API Routes (Next.js App Router)

```
src/app/
├── layout.tsx              # Root layout (HTML, provider setup)
├── page.tsx                # Home page (/)
├── globals.css             # Global styles
├── providers.tsx           # App context providers
│
├── account/
│   └── become-seller/      # Upgrade buyer to seller
│
├── admin/
│   └── page.tsx            # Admin dashboard
│
├── api/                    # REST API endpoints
│   ├── auth/               # Authentication endpoints
│   │   ├── [...nextauth]/  # NextAuth.js routes
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── categories/         # GET categories
│   ├── listings/           # GET/POST listings
│   │   └── [id]/           # GET/PUT/DELETE specific listing
│   ├── conversations/      # Messaging
│   ├── users/              # User management
│   ├── wishlist/           # Save items
│   ├── admin/              # Admin operations
│   ├── upload/             # File uploads
│   └── me/                 # Current user info
│
├── browse/                 # Public listing browse
├── login/                  # Login page
├── register/               # Registration page
├── forgot-password/        # Password recovery
├── reset-password/         # Reset password page
├── listings/               # View single listing
├── sell/                   # Seller dashboard
│   ├── new/                # Create new listing
│   └── [id]/edit/          # Edit listing
├── messages/               # Messaging UI
├── wishlist/               # Wishlist view
└── banned/                 # Banned user notice
```

### `/src/components` - React Components

```
src/components/
├── ui/                     # Reusable UI components
│   ├── button.tsx          # Button component
│   ├── card.tsx            # Card component
│   ├── input.tsx           # Input field
│   ├── label.tsx           # Form label
│   └── textarea.tsx        # Text area
│
├── ban-check.tsx           # Check if user is banned
├── listing-card.tsx        # Display listing preview
├── listing-form.tsx        # Form to create/edit listing
├── sign-out-button.tsx     # Logout button
└── site-nav.tsx            # Navigation bar
```

### `/src/lib` - Utilities & Helpers

```
src/lib/
├── db.ts                   # MongoDB connection
├── authorize-credentials.ts # Credential validation
├── session.ts              # Session management
├── audit.ts                # Audit logging
├── browse-listings.ts      # Browse/search logic
├── categories.ts           # Category utilities
├── category-tree.ts        # Category tree structure
├── password-reset.ts       # Password reset flow
├── validators.ts           # Zod validation schemas
├── format.ts               # String formatting
├── utils.ts                # General utilities
└── api-response.ts         # API response formatting
```

### `/src/models` - Database Schemas

```
src/models/
├── User.ts                 # User account
├── Listing.ts              # Product listing
├── Category.ts             # Product category
├── Conversation.ts         # Message thread
├── Message.ts              # Individual message
├── WishlistItem.ts         # Saved items
├── PasswordResetToken.ts   # Password reset tokens
└── AdminAuditLog.ts        # Admin actions log
```

## 🔄 Data Flow Examples

### Example 1: User Login

```
1. User enters email/password in login form
   ↓
2. Frontend POST to /api/auth/signin
   ↓
3. NextAuth.js processes credentials
   ↓
4. Server calls authorizeCredentials()
   - Queries User model
   - Compares password with bcryptjs
   ↓
5. User object returned to NextAuth
   - JWT token created
   - Token stored in session
   ↓
6. Frontend redirected to homepage
   - User is now authenticated
```

### Example 2: Creating a Listing

```
1. Seller fills listing form & uploads image
   ↓
2. Frontend POST to /api/listings with form data
   ↓
3. Server validates with Zod schemas
   ↓
4. Check user is authorized (seller role)
   ↓
5. Process image upload
   ↓
6. Create Listing document in MongoDB
   - Set seller = current user ID
   - Index for search
   ↓
7. Return created listing to frontend
   ↓
8. Frontend displays success message
```

### Example 3: Browsing Listings

```
1. User visits /browse page
   ↓
2. Frontend calls /api/listings?category=electronics&search=phone
   ↓
3. Server queries Listing model with filters
   ↓
4. MongoDB returns matching documents
   ↓
5. Apply pagination (20 per page)
   ↓
6. Return results to frontend
   ↓
7. Frontend renders listing cards
```

## 🔐 Authentication Flow

```
User Registration:
┌─────────────┐
│ Register    │
│ Email/Pass  │
└──────┬──────┘
       │ POST /api/register
       ▼
┌──────────────────────────────┐
│ Validate with Zod            │
│ Check email not exists       │
│ Hash password with bcryptjs  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Create User doc      │
│ role: "buyer"        │
└──────┬───────────────┘
       │
       ▼
   ✅ User created
   User can now login
```

## 🗄️ Database Design

### Collection Relationships

```
User
  ├── _id (ObjectId)
  ├── email (unique)
  ├── passwordHash
  ├── name
  ├── role (admin | buyer | seller)
  └── timestamps

Listing
  ├── _id (ObjectId)
  ├── title
  ├── description
  ├── seller (FK: User._id)
  ├── category (FK: Category._id)
  ├── price
  ├── images []
  └── timestamps

Category
  ├── _id (ObjectId)
  ├── name
  ├── slug
  ├── parent (FK: Category._id | null)
  └── timestamps

Conversation
  ├── _id (ObjectId)
  ├── participants [User._id, User._id]
  └── timestamps

Message
  ├── _id (ObjectId)
  ├── conversation (FK: Conversation._id)
  ├── sender (FK: User._id)
  ├── text
  └── timestamps
```

## 🔌 API Layer

All API routes follow this pattern:

```typescript
// src/app/api/[resource]/route.ts

export async function GET(request: Request) {
  // 1. Get session (auth)
  // 2. Validate permissions
  // 3. Query database
  // 4. Format response
  // 5. Return JSON
}

export async function POST(request: Request) {
  // 1. Parse request body
  // 2. Validate with Zod
  // 3. Check authorization
  // 4. Create/update database
  // 5. Return JSON response
}
```

## 🛡️ Security Layers

1. **Authentication** - NextAuth.js with JWT tokens
2. **Authorization** - Role-based access control (RBAC)
3. **Validation** - Zod schemas on all inputs
4. **Password** - bcryptjs hashing
5. **Database** - Mongoose schema validation
6. **Audit** - AdminAuditLog tracks admin actions
7. **Ban System** - Can ban users for safety

## 📊 Tech Stack Integration

```
┌─────────────────────────────────────────────┐
│          React + TypeScript                 │
│      (Frontend components & types)          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Tailwind CSS + Radix UI                │
│        (Styling & UI components)            │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Next.js 15 with App Router             │
│   (Pages, API routes, middleware, SSR)      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      NextAuth.js + Credentials              │
│   (Authentication & session management)     │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Zod + TypeScript                       │
│        (Input validation)                   │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│   Mongoose + MongoDB                        │
│   (ORM & database layer)                    │
└─────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

When deploying, the architecture becomes:

```
User Browser
    ↓
  CDN / Vercel Edge Network
    ↓
  Next.js Server (Vercel / Any Node.js host)
    ↓
  MongoDB Atlas (or other cloud database)
```

---

**Next:** Read [CODEBASE.md](./CODEBASE.md) to see how the code actually works!
