# Authentication & Authorization Guide

Complete guide to how authentication and authorization work in Weggo.

## 🔐 Authentication Overview

Weggo uses **NextAuth.js** with **credentials (email/password)** authentication.

```
User enters credentials
         ↓
NextAuth.js validates
         ↓
Server queries User model
         ↓
bcryptjs compares password hashes
         ↓
If valid: JWT token created → stored in cookie
If invalid: Error message shown
```

## 🔑 How Credentials Authentication Works

### 1. Password Hashing (Registration)

When user signs up, password is **never stored in plain text**:

```typescript
// src/app/api/register/route.ts
import bcryptjs from "bcryptjs";

const password = "MyPassword123!";
const salt = await bcryptjs.genSalt(10); // Generate salt
const passwordHash = await bcryptjs.hash(password, salt); // Hash password

// Store passwordHash in database (NOT the original password!)
await User.create({
  email: "user@example.com",
  passwordHash, // This is what gets stored
  name: "John Doe"
});
```

**What bcryptjs does:**
- Takes password + salt
- Creates one-way hash
- Even with database leak, passwords are safe
- Same password produces different hashes (due to salt)

### 2. Login (Password Verification)

```typescript
// src/lib/authorize-credentials.ts
import bcryptjs from "bcryptjs";

async function authorizeCredentials({ email, password }) {
  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) return null; // User not found
  
  // 2. Compare provided password with stored hash
  const isValid = await bcryptjs.compare(password, user.passwordHash);
  if (!isValid) return null; // Wrong password
  
  // 3. Return user (NextAuth uses this to create session)
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    banned: user.banned
  };
}
```

**What bcryptjs.compare does:**
- Takes plain password + stored hash
- Hashes the plain password with same algorithm
- Compares hashes (constant time to prevent timing attacks)
- Returns true if match, false otherwise

### 3. Session Creation (NextAuth)

After successful login, NextAuth.js:

```typescript
// src/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      // Called after successful login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.banned = user.banned;
      }
      return token;
    },
    async session({ session, token }) {
      // Called when session is accessed
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.banned = token.banned;
      return session;
    }
  }
});
```

**What happens:**
1. Create JWT token containing user info
2. Store token in **secure, httpOnly cookie** (can't access from JavaScript)
3. Token automatically sent with every request
4. Server validates token signature
5. Session made available to app

---

## 📱 Accessing the Session

### In Server Components (Page)

```typescript
// src/app/account/page.tsx
import { auth } from "@/auth";

export default async function AccountPage() {
  const session = await auth();
  
  if (!session) {
    return <div>Please log in</div>;
  }
  
  // session.user.email, session.user.role, session.user.id available
  return <div>Welcome {session.user.email}!</div>;
}
```

### In Server Components (Layout)

```typescript
// src/app/layout.tsx
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html>
      <body>
        <SiteNav session={session} />
        {children}
      </body>
    </html>
  );
}
```

### In Client Components

```typescript
// src/components/UserMenu.tsx
"use client";

import { useSession } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <a href="/login">Login</a>;
  }
  
  // session.user.email available
  return (
    <div>
      <span>{session.user.email}</span>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
```

### In API Routes

```typescript
// src/app/api/me/route.ts
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  // session.user available
  return Response.json(session.user);
}
```

---

## 🛡️ Authorization (Role-Based Access Control)

Weggo has 3 user roles:

### Roles

| Role | Permissions |
|------|-----------|
| **buyer** (default) | Browse listings, message sellers, create wishlist |
| **seller** | Can create/edit/delete own listings + buyer permissions |
| **admin** | Full access including ban users, delete listings, audit logs |

### Checking Roles in API Routes

```typescript
// Only sellers can create listings
export async function POST(request: Request) {
  const session = await auth();
  
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  // Check authorization
  if (session.user.role !== "seller" && session.user.role !== "admin") {
    return Response.json({ error: "Must be seller" }, { status: 403 });
  }
  
  // Safe to create listing
  const listing = await Listing.create({
    ...data,
    seller: session.user.id
  });
  
  return Response.json(listing);
}
```

### Checking Roles in Components

```typescript
// src/components/AdminPanel.tsx
"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminPanel() {
  const { data: session } = useSession();
  
  if (session?.user.role !== "admin") {
    redirect("/");
  }
  
  return <div>Admin Panel</div>;
}
```

### Protecting Pages

```typescript
// src/app/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
  // Must be logged in
  if (!session) {
    redirect("/login");
  }
  
  // Must be admin
  if (session.user.role !== "admin") {
    redirect("/");
  }
  
  return <div>Admin Dashboard</div>;
}
```

---

## 🚪 Login & Logout

### Login Flow

1. **User visits `/login`**
   ```typescript
   // src/app/login/page.tsx
   export default function LoginPage() {
     return (
       <form action={async (formData) => {
         "use server";
         await signIn("credentials", {
           email: formData.get("email"),
           password: formData.get("password"),
           redirectTo: "/",
         });
       }}>
         <input name="email" type="email" />
         <input name="password" type="password" />
         <button type="submit">Login</button>
       </form>
     );
   }
   ```

2. **Form submitted → `/api/auth/signin` called**
   - NextAuth.js handles this route

3. **Credentials validated**
   - `authorizeCredentials()` called
   - Password compared with hash

4. **If valid → JWT token created**
   - Token stored in httpOnly cookie
   - User redirected to "/"

5. **If invalid → Error shown**
   - User stays on login page
   - Error message displayed

### Logout Flow

```typescript
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ redirectTo: "/login" })}>
      Sign Out
    </button>
  );
}
```

When clicked:
1. POST to `/api/auth/signout`
2. Session destroyed
3. Cookie cleared
4. Redirected to `/login`

---

## 🔄 Password Reset Flow

### How Password Reset Works

```
1. User clicks "Forgot Password" on login page
      ↓
2. Enters email address
      ↓
3. Server creates PasswordResetToken with:
   - Random token
   - Expiry (1 hour)
   - Linked to user
      ↓
4. Email sent with reset link:
   /reset-password?token=abc123def456
      ↓
5. User clicks link, sees reset form
      ↓
6. User enters new password
      ↓
7. Server validates token (not expired, unused)
      ↓
8. If valid:
   - Find user
   - Hash new password
   - Update user.passwordHash
   - Mark token as used
   - Redirect to login
```

### API Implementation

**Forgot Password Endpoint:**
```typescript
// src/app/api/auth/forgot-password/route.ts
export async function POST(request: Request) {
  const { email } = await request.json();
  
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists (security)
    return Response.json({ message: "Email sent if account exists" });
  }
  
  // Create token
  const token = await PasswordResetToken.create({
    user: user._id,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  });
  
  // Send email with link
  const resetLink = `${process.env.AUTH_URL}/reset-password?token=${token.token}`;
  await sendEmail(user.email, "Reset Password", `Click: ${resetLink}`);
  
  return Response.json({ message: "Email sent" });
}
```

**Reset Password Endpoint:**
```typescript
// src/app/api/auth/reset-password/route.ts
export async function POST(request: Request) {
  const { token, password } = await request.json();
  
  // Find token
  const resetToken = await PasswordResetToken.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!resetToken) {
    return Response.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }
  
  // Hash new password
  const passwordHash = await bcryptjs.hash(password, 10);
  
  // Update user
  await User.findByIdAndUpdate(resetToken.user, { passwordHash });
  
  // Mark token as used
  resetToken.used = true;
  await resetToken.save();
  
  return Response.json({ message: "Password reset successful" });
}
```

---

## 🚫 Banning Users

### How User Ban Works

Admin can ban users for:
- Selling counterfeit items
- Harassment
- Fraudulent transactions
- Violating terms of service

```typescript
// src/app/api/admin/users/[id]/route.ts
export async function POST(request: Request) {
  const session = await auth();
  
  if (session?.user.role !== "admin") {
    return Response.json({ error: "Admin only" }, { status: 403 });
  }
  
  const { action, reason } = await request.json();
  
  if (action === "ban") {
    // Ban user
    const user = await User.findByIdAndUpdate(
      params.id,
      { banned: true, bannedReason: reason },
      { new: true }
    );
    
    // Log action
    await AdminAuditLog.create({
      admin: session.user.id,
      action: "ban_user",
      targetUser: params.id,
      details: { reason }
    });
    
    return Response.json(user);
  }
}
```

### Checking if User is Banned

When user logs in:

```typescript
// src/lib/authorize-credentials.ts
const user = await User.findOne({ email });

if (user.banned) {
  // Return user but mark as banned
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    banned: true // NextAuth includes this in session
  };
}
```

In app, check for banned status:

```typescript
// src/app/layout.tsx
export default async function RootLayout({ children }) {
  const session = await auth();
  
  if (session?.user.banned) {
    return <BannedNotice />;
  }
  
  return <>{children}</>;
}
```

---

## 🔒 Security Best Practices

### 1. Use HTTPS in Production

```typescript
// .env.production
AUTH_URL=https://weggo.com  // Never http in production!
```

### 2. Rotate AUTH_SECRET Regularly

```bash
# Generate new secret
openssl rand -base64 32

# Update .env
AUTH_SECRET=new_secret_here
```

### 3. Never Expose Passwords

```typescript
// ❌ Bad
return Response.json(user); // Includes passwordHash!

// ✅ Good
return Response.json(user.select("-passwordHash"));
```

### 4. Validate Tokens

```typescript
// ❌ Bad - doesn't check expiry
const resetToken = await PasswordResetToken.findOne({ token });

// ✅ Good - checks expiry and used status
const resetToken = await PasswordResetToken.findOne({
  token,
  used: false,
  expiresAt: { $gt: new Date() }
});
```

### 5. Rate Limit Login Attempts

```typescript
// Prevent brute force attacks
// Consider using npm package: express-rate-limit
```

### 6. Clear Session on Suspicious Activity

```typescript
// If user banned while logged in
export async function GET(request: Request) {
  const session = await auth();
  const user = await User.findById(session?.user.id);
  
  if (user?.banned) {
    await signOut(); // Force logout
    return Response.json({ error: "Account banned" }, { status: 403 });
  }
}
```

---

## 🧪 Testing Authentication

### Manual Testing

1. **Register**
   - Go to `/register`
   - Fill form
   - Should create account

2. **Login**
   - Go to `/login`
   - Enter credentials
   - Should redirect to home

3. **Logout**
   - Click logout
   - Should redirect to login
   - Should not be authenticated

4. **Forgot Password**
   - Go to `/forgot-password`
   - Enter email
   - Check console or email for reset link
   - Click link
   - Reset password
   - Login with new password

### Debugging

```typescript
// Enable NextAuth debug mode
// .env
NEXTAUTH_DEBUG=true

// Check session in browser
// Components can log session
useSession().then(session => console.log("Session:", session));

// Check token in browser devtools
// Look for __Secure-next-auth.session-token cookie
```

---

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT Tokens](https://jwt.io)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Next:** Check [API.md](./API.md) for authentication-related endpoints!
