# Codebase Guide - How Everything Works

This guide explains how different parts of the Weggo codebase work together.

## 🚀 Application Startup

### 1. Entry Point: `src/app/layout.tsx`

```typescript
// This is the ROOT layout - runs for every page
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Get current user session
  
  return (
    <html>
      <body>
        <SessionProvider session={session}>
          <SiteNav />           {/* Navigation bar */}
          {children}            {/* Page content */}
        </SessionProvider>
      </body>
    </html>
  );
}
```

What happens:
- `auth()` retrieves the current user's session
- `SessionProvider` makes session available to all child components
- `SiteNav` renders the navigation
- Page content renders inside

### 2. Provider Setup: `src/app/providers.tsx`

Wraps the entire app with context providers:
- Session provider (NextAuth.js)
- Any other context/state managers

---

## 🔐 Authentication System

### How NextAuth.js is Configured

**File:** `src/auth.ts`

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // Email/password login
      authorize: async (credentials) => {
        // 1. Validate email format
        // 2. Find user by email
        // 3. Compare password hash with bcryptjs
        // 4. Return user if valid, null if invalid
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to JWT token
      // Runs after successful login
    },
    async session({ session, token }) {
      // Add token data to session
      // Runs when session is accessed
    },
  },
});
```

### Login Flow

**API Route:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
// When user submits login form:
POST /api/auth/signin
  Body: { email: "user@example.com", password: "pass" }
  
// NextAuth.js calls the Credentials provider
// Which calls authorizeCredentials() in lib/authorize-credentials.ts

// authorize-credentials.ts:
async function authorizeCredentials({ email, password }) {
  // 1. Connect to MongoDB
  // 2. Find user with email
  // 3. Compare password: bcryptjs.compare(password, user.passwordHash)
  // 4. Return user object (without password!)
  // 5. If invalid, return null
}

// If valid: JWT token created → stored in cookie → redirect to home
// If invalid: Error message → stay on login page
```

### Accessing the Session in Components

**Server Component:**
```typescript
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  
  if (!session) return <div>Not logged in</div>;
  
  return <div>Welcome {session.user.email}!</div>;
}
```

**Client Component:**
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;
  
  return <div>Welcome {session.user.email}!</div>;
}
```

---

## 📝 Database Layer (Mongoose Models)

### User Model Example

**File:** `src/models/User.ts`

```typescript
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["admin", "buyer", "seller"], default: "buyer" },
    banned: { type: Boolean, default: false },
    bannedReason: { type: String, default: null },
  },
  { timestamps: true } // Adds createdAt, updatedAt
);

// Create indexes for faster queries
UserSchema.index({ role: 1, banned: 1 });

// Export model
const User = mongoose.models.User ?? 
             mongoose.model("User", UserSchema);
```

### Connecting to MongoDB

**File:** `src/lib/db.ts`

```typescript
export async function connectDB() {
  // If already connected, reuse connection (important for serverless!)
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  // Connect with MONGODB_URI from .env
  await mongoose.connect(process.env.MONGODB_URI);
}
```

### Using Models in API Routes

```typescript
// src/app/api/users/route.ts

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: Request) {
  await connectDB();
  
  // Query all users (admin only)
  const users = await User.find({ banned: false })
    .select("-passwordHash") // Exclude password
    .limit(50);
  
  return Response.json(users);
}

export async function POST(request: Request) {
  await connectDB();
  
  const body = await request.json();
  
  // Validate input
  const validated = userSchema.parse(body);
  
  // Create new user
  const user = await User.create({
    ...validated,
    passwordHash: await bcrypt.hash(validated.password, 10),
  });
  
  return Response.json(user);
}
```

---

## ✅ Input Validation with Zod

### Define Schemas

**File:** `src/lib/validators.ts`

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
  name: z.string().min(1, "Name required"),
});

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be 3+ characters"),
  description: z.string().min(10, "Description must be 10+ characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().regex(/^[0-9a-f]{24}$/, "Invalid category"),
});
```

### Use in API Routes

```typescript
import { createListingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  
  // This automatically validates AND returns typed data
  try {
    const validated = createListingSchema.parse(body);
    // TypeScript now knows validated.title is string, price is number, etc.
    
    // Safe to use validated data
    const listing = await Listing.create(validated);
    
    return Response.json(listing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
  }
}
```

---

## 🛒 API Endpoints Pattern

All API endpoints follow this pattern:

### 1. GET Endpoint (Read)

```typescript
// src/app/api/listings/route.ts

export async function GET(request: Request) {
  try {
    // 1. Check authentication (if needed)
    const session = await auth();
    if (!session && needsAuth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    // 3. Build query
    await connectDB();
    let query = Listing.find({ active: true });
    
    if (category) query = query.where("category").equals(category);
    if (search) query = query.where("title").regex(search, "i");
    
    // 4. Execute query
    const listings = await query
      .populate("category", "name slug")
      .populate("seller", "name")
      .limit(20);
    
    // 5. Return response
    return Response.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2. POST Endpoint (Create)

```typescript
// src/app/api/listings/route.ts

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Must be logged in" }, { status: 401 });
    }
    
    // 2. Check authorization (must be seller)
    if (session.user.role !== "seller" && session.user.role !== "admin") {
      return Response.json({ error: "Must be seller" }, { status: 403 });
    }
    
    // 3. Parse and validate input
    const body = await request.json();
    const validated = createListingSchema.parse(body);
    
    // 4. Create document
    await connectDB();
    const listing = await Listing.create({
      ...validated,
      seller: session.user.id,
    });
    
    // 5. Return created document
    return Response.json(listing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. PUT Endpoint (Update)

```typescript
// src/app/api/listings/[id]/route.ts

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check auth
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 2. Parse input
    const body = await request.json();
    const validated = updateListingSchema.parse(body);
    
    // 3. Find and check ownership
    await connectDB();
    const listing = await Listing.findById(params.id);
    
    if (!listing) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    
    // Only seller or admin can update
    if (listing.seller.toString() !== session.user.id && 
        session.user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // 4. Update
    Object.assign(listing, validated);
    await listing.save();
    
    // 5. Return updated document
    return Response.json(listing);
  } catch (error) {
    // Error handling...
  }
}
```

---

## 🎨 Frontend Components

### React Component Structure

```typescript
// src/components/ListingCard.tsx
"use client"; // Client component (uses hooks, events)

import { useState } from "react";

interface ListingCardProps {
  listing: ListingDocument;
  onDelete?: (id: string) => void;
}

export function ListingCard({ listing, onDelete }: ListingCardProps) {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      // Call API to delete
      const response = await fetch(`/api/listings/${listing._id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete");
      
      onDelete?.(listing._id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <img src={listing.images[0]} alt={listing.title} />
      <h3>{listing.title}</h3>
      <p>${listing.price}</p>
      <button 
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
```

### Using Components

```typescript
// src/app/sell/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "@/components/ListingCard";

export default function SellerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch listings when component mounts
    fetch("/api/listings/mine")
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Listings</h1>
      <div className="grid">
        {listings.map(listing => (
          <ListingCard 
            key={listing._id} 
            listing={listing}
            onDelete={(id) => {
              setListings(listings.filter(l => l._id !== id));
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 Common Workflows

### Creating a New Feature

1. **Define the database model** (`src/models/NewThing.ts`)
2. **Create API endpoint** (`src/app/api/new-things/route.ts`)
3. **Add validation** (add to `src/lib/validators.ts`)
4. **Build UI component** (`src/components/NewThingForm.tsx`)
5. **Create page** (`src/app/new-things/page.tsx`)
6. **Test locally** (use dev server and browser)

### Debugging

```typescript
// Add console.log in API routes (shows in terminal)
export async function GET(request: Request) {
  console.log("Query:", new URL(request.url).searchParams);
  
  // ... do stuff ...
  
  console.log("Result:", result);
  return Response.json(result);
}

// Add console.log in components (shows in browser console, press F12)
export function MyComponent() {
  useEffect(() => {
    console.log("Component mounted!");
  }, []);
  
  return <div>...</div>;
}
```

### Error Handling

```typescript
// Consistent error response
export async function GET(request: Request) {
  try {
    // ... code that might fail ...
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
```

---

## 📦 Adding Dependencies

```bash
# Install new package
npm install some-package

# Install dev dependency
npm install --save-dev some-dev-tool

# Update all packages
npm update

# Check outdated packages
npm outdated
```

---

## 🧪 Testing Your Changes

### Manual Testing

1. Make a change to a file
2. Dev server auto-reloads (you see "Compiled successfully" in terminal)
3. Refresh browser to see changes
4. Check browser console (F12) for errors
5. Check terminal for server errors

### Testing API Routes

Use VS Code's REST Client or Postman:

```http
GET http://localhost:3000/api/listings?category=electronics
Content-Type: application/json

###

POST http://localhost:3000/api/listings
Content-Type: application/json

{
  "title": "Test Item",
  "description": "A test product",
  "price": 29.99,
  "category": "507f1f77bcf86cd799439011"
}
```

---

**Next:** Read [DATABASE.md](./DATABASE.md) for detailed database information!
