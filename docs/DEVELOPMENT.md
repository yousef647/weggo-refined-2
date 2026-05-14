# Development Guide

Best practices, guidelines, and common tasks for developing Weggo.

## 🎯 Development Workflow

### 1. Pick a Task

- Check your project management tool
- Understand requirements
- Ask questions if unclear

### 2. Create a Branch (if using Git)

```bash
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
```

### 3. Make Changes

- Write code following project conventions
- Keep changes focused and small
- Test as you go

### 4. Test Your Changes

```bash
# Manually test in browser
npm run dev

# Check for lint errors
npm run lint
```

### 5. Commit and Push

```bash
git add .
git commit -m "Description of changes"
git push origin feature/feature-name
```

### 6. Create Pull Request

- Describe what changed
- Link to related issues
- Wait for code review

---

## 📐 Code Style & Conventions

### TypeScript Types

Always use explicit types:

```typescript
// ❌ Bad - unclear what type
const handleClick = (e) => {
  // ...
};

// ✅ Good - clear types
import type { FormEvent } from "react";

const handleClick = (e: FormEvent<HTMLFormElement>) => {
  // ...
};
```

### File Naming

- **Components** - PascalCase: `ListingCard.tsx`, `UserMenu.tsx`
- **Utilities** - camelCase: `formatPrice.ts`, `validateEmail.ts`
- **Routes** - kebab-case: `[id]`, `become-seller`

### Component Structure

```typescript
// src/components/ListingCard.tsx
"use client";

import type { Listing } from "@/types";
import { useState } from "react";

interface ListingCardProps {
  listing: Listing;
  onDelete?: (id: string) => void;
}

/**
 * Displays a single listing card with title, price, and actions
 */
export function ListingCard({ listing, onDelete }: ListingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Implementation
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card">
      {/* Component JSX */}
    </div>
  );
}
```

### API Route Structure

```typescript
// src/app/api/listings/route.ts
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { createListingSchema } from "@/lib/validators";
import { z } from "zod";

/**
 * GET /api/listings
 * Get all active listings with filtering
 */
export async function GET(request: Request) {
  try {
    // Your implementation
  } catch (error) {
    console.error("[listings:GET]", error);
    return Response.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new listing (seller only)
 */
export async function POST(request: Request) {
  try {
    // Your implementation
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    console.error("[listings:POST]", error);
    return Response.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
```

### Error Messages

Use consistent, user-friendly error messages:

```typescript
// ❌ Bad - too technical
return Response.json(
  { error: "TypeError: Cannot read property 'email' of undefined" },
  { status: 400 }
);

// ✅ Good - user-friendly
return Response.json(
  { error: "Email is required" },
  { status: 400 }
);
```

---

## 🔒 Security Best Practices

### 1. Always Authenticate & Authorize

```typescript
// Get session and check role
const session = await auth();

if (!session) {
  return Response.json({ error: "Not authenticated" }, { status: 401 });
}

if (session.user.role !== "seller") {
  return Response.json({ error: "Must be seller" }, { status: 403 });
}
```

### 2. Validate All Inputs

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  price: z.number().positive(),
  title: z.string().min(3).max(100),
});

const body = await request.json();
const validated = schema.parse(body); // Will throw if invalid
```

### 3. Never Expose Sensitive Data

```typescript
// ❌ Bad - exposes password hash
const user = await User.findById(userId);
return Response.json(user);

// ✅ Good - excludes sensitive fields
const user = await User.findById(userId).select("-passwordHash");
return Response.json(user);
```

### 4. Use Environment Variables

```typescript
// ❌ Bad - hardcoded
const dbUri = "mongodb://localhost:27017/weggo";

// ✅ Good - from environment
const dbUri = process.env.MONGODB_URI!;

// Ensure required env vars exist
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}
```

### 5. Prevent Injection Attacks

```typescript
// ❌ Bad - vulnerable to injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good - uses parameterized queries (Mongoose)
const user = await User.findOne({ email });
```

---

## 🧪 Testing & Debugging

### Manual Testing

1. **Test in browser**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

2. **Open developer tools** (F12)
   - Console tab - Frontend errors
   - Network tab - API calls
   - Application tab - Cookies/storage

3. **Check terminal** - Backend errors and logs

### Testing API Routes

**Using VS Code REST Client:**

Create `test.http`:
```http
### List all listings
GET http://localhost:3000/api/listings

### Create listing
POST http://localhost:3000/api/listings
Content-Type: application/json

{
  "title": "Test Item",
  "description": "Test description",
  "price": 99.99,
  "category": "507f1f77bcf86cd799439013"
}

### Get specific listing
GET http://localhost:3000/api/listings/507f1f77bcf86cd799439012
```

### Common Debugging Patterns

```typescript
// Log in component (shows in browser console)
useEffect(() => {
  console.log("Component mounted with props:", listing);
}, [listing]);

// Log in API route (shows in terminal)
export async function GET(request: Request) {
  console.log("Query:", new URL(request.url).searchParams);
  console.log("Headers:", Object.fromEntries(request.headers));
  
  const data = await fetchData();
  console.log("Fetched data:", data);
  
  return Response.json(data);
}

// Catch and log errors
try {
  // Something that might fail
} catch (error) {
  if (error instanceof Error) {
    console.error("Error message:", error.message);
    console.error("Stack:", error.stack);
  } else {
    console.error("Unknown error:", error);
  }
}
```

---

## 📦 Adding New Dependencies

### Frontend Package (React Component)

```bash
npm install some-ui-package
```

Update component to use it:
```typescript
import { Component } from "some-ui-package";

export function MyComponent() {
  return <Component>...</Component>;
}
```

### Backend Package (Database, API, etc)

```bash
npm install some-backend-package
```

Update server code:
```typescript
import SomePackage from "some-backend-package";

export async function handler() {
  const result = await SomePackage.doSomething();
  return result;
}
```

### Dev Dependency (Linting, Testing, etc)

```bash
npm install --save-dev some-dev-tool
```

### Check for Security Issues

```bash
npm audit
npm audit fix  # Auto-fix some issues
```

---

## 🛠️ Common Tasks

### Add a New API Endpoint

1. Create file: `src/app/api/resource/route.ts`
2. Add validation schema to `src/lib/validators.ts`
3. Implement GET/POST/PUT/DELETE handlers
4. Test with REST client
5. Document in `docs/API.md`

### Create a New Page

1. Create directory: `src/app/page-name/`
2. Create file: `src/app/page-name/page.tsx`
3. Add styling with Tailwind CSS
4. Fetch data from APIs as needed
5. Test in browser

### Add a New Component

1. Create file: `src/components/ComponentName.tsx`
2. Define props interface
3. Implement component
4. Add to `src/components/index.ts` (optional)
5. Use in pages

### Create a New Database Model

1. Create file: `src/models/NewModel.ts`
2. Define schema with Mongoose
3. Add indexes if needed
4. Export typed model
5. Use in API routes

### Update User Roles/Permissions

1. Check `src/auth.ts` for authorization logic
2. Add new role check: `session.user.role === "newRole"`
3. Add test case for new permission
4. Document in `docs/AUTHENTICATION.md`

---

## 🔍 Performance Tips

### 1. Use `.lean()` for Read-Only Queries

```typescript
// Fetching 100 listings (don't need to update them)
const listings = await Listing.find({ active: true })
  .lean() // Skip Mongoose overhead
  .limit(100);
```

### 2. Only Select Needed Fields

```typescript
// ❌ Slow - gets all fields
const users = await User.find({});

// ✅ Fast - only needed fields
const users = await User.find({})
  .select("name email role");
```

### 3. Use Pagination

```typescript
// ❌ Slow - load all 10,000 listings
const listings = await Listing.find({});

// ✅ Fast - load 20 at a time
const page = 1;
const limit = 20;
const listings = await Listing.find({})
  .skip((page - 1) * limit)
  .limit(limit);
```

### 4. Cache When Possible

```typescript
// Categories rarely change, cache them
const getCategoriesWithCache = async () => {
  const cached = await redis.get("categories");
  if (cached) return JSON.parse(cached);
  
  const categories = await Category.find({});
  await redis.set("categories", JSON.stringify(categories), 3600); // 1 hour
  return categories;
};
```

### 5. Use `.populate()` Wisely

```typescript
// ❌ Over-fetching
const listings = await Listing.find({})
  .populate("seller") // Gets ALL seller fields
  .populate("category") // Gets ALL category fields
  .limit(100);

// ✅ Fetch only needed fields
const listings = await Listing.find({})
  .populate("seller", "name email") // Only name & email
  .populate("category", "name slug") // Only name & slug
  .limit(100);
```

---

## 📝 Writing Good Git Commits

### Commit Message Format

```
[type]: Brief description (50 chars max)

Optional longer explanation (72 chars per line)
- Explain what changed
- Explain why
- Reference issues: Closes #123
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (no logic change)
- `refactor` - Restructure code
- `perf` - Performance improvement
- `test` - Add/update tests

### Examples

```
feat: Add wishlist functionality

- Create WishlistItem model
- Add POST/DELETE endpoints
- Update UI to show save button
- Closes #42

fix: Fix password validation error message

Validation was failing for valid passwords
containing special characters. Updated regex
in validators.ts to handle all allowed chars.

docs: Update API documentation

Added examples for wishlist endpoints
```

---

## 🎨 CSS & Tailwind Tips

### Tailwind Classes

```typescript
// Use Tailwind for styling (don't write CSS files)
<div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

### Responsive Design

```typescript
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
">
  {/* Items */}
</div>
```

### Hover/Focus States

```typescript
<button className="
  bg-blue-500 text-white px-4 py-2 rounded
  hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-300
  transition-colors
">
  Click me
</button>
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Zod Validation](https://zod.dev)

---

## ❓ Troubleshooting

### Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port 3000 Already in Use

```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# Windows: taskkill /F /IM node.exe
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

```typescript
// Check if MongoDB is running
// Add logging to db.ts:
console.log("Attempting to connect to:", process.env.MONGODB_URI);
console.log("Connection state:", mongoose.connection.readyState);

// Connect in API route
await connectDB();
console.log("Connected!");
```

### TypeScript Errors

```bash
# Recompile TypeScript
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/components/MyComponent.tsx
```

---

**Questions?** Check the other documentation files or ask your team lead!
