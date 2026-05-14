# API Reference

Complete guide to all API endpoints in Weggo.

## 📝 API Conventions

All API endpoints:
- Use **REST** principles
- Accept/return **JSON**
- Use standard **HTTP methods** (GET, POST, PUT, DELETE)
- Return appropriate **HTTP status codes**

### Response Format

**Success (2xx):**
```json
{
  // Successful response (usually the resource or array of resources)
  "id": "123",
  "name": "Example"
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Description of what went wrong",
  "details": { } // Optional additional info
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Not found |
| 500 | Server error |

---

## 🔐 Authentication Endpoints

### Login

```
POST /api/auth/signin

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "buyer"
  }
}

Error (401):
{
  "error": "Invalid email or password"
}
```

### Logout

```
POST /api/auth/signout

Response (200):
{
  "success": true
}
```

### Register

```
POST /api/register

Body:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "name": "John Doe",
    "role": "buyer"
  }
}

Error (400):
{
  "error": "Email already exists"
}
```

### Forgot Password

```
POST /api/auth/forgot-password

Body:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset link sent to email"
}

Note: Email is sent with reset link
```

### Reset Password

```
POST /api/auth/reset-password

Body:
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}

Response (200):
{
  "message": "Password reset successful"
}

Error (400):
{
  "error": "Invalid or expired token"
}
```

### Get Current User

```
GET /api/me

Headers:
Authorization: Bearer <session-token>

Response (200):
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "buyer",
  "banned": false
}

Error (401):
{
  "error": "Not authenticated"
}
```

---

## 🛍️ Listings Endpoints

### Get All Listings

```
GET /api/listings?category=electronics&search=phone&page=1&limit=20

Query Parameters:
- category (optional): Category ID or slug
- search (optional): Search term
- page (optional): Page number (1-based), default 1
- limit (optional): Items per page, default 20

Response (200):
{
  "listings": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "iPhone 12",
      "description": "Lightly used, great condition",
      "price": 599.99,
      "seller": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "category": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Mobile Phones"
      },
      "images": ["/uploads/image1.jpg"],
      "views": 145,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 450,
  "page": 1,
  "pages": 23
}
```

### Get Single Listing

```
GET /api/listings/507f1f77bcf86cd799439012

Response (200):
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "iPhone 12",
  "description": "Lightly used, great condition",
  "price": 599.99,
  "seller": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "category": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Mobile Phones"
  },
  "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
  "views": 145,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}

Error (404):
{
  "error": "Listing not found"
}
```

### Get My Listings (Seller)

```
GET /api/listings/mine

Headers:
Authorization: Bearer <session-token>

Query Parameters:
- status (optional): "active" | "inactive" | "all"

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "iPhone 12",
    "price": 599.99,
    "active": true,
    "views": 145,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]

Error (401):
{
  "error": "Must be logged in"
}
```

### Create Listing (Seller)

```
POST /api/listings

Headers:
Authorization: Bearer <session-token>
Content-Type: application/json

Body:
{
  "title": "iPhone 12 - Like New",
  "description": "Barely used, with original box and charger",
  "price": 599.99,
  "category": "507f1f77bcf86cd799439013",
  "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "iPhone 12 - Like New",
  "description": "Barely used...",
  "price": 599.99,
  "seller": "507f1f77bcf86cd799439011",
  "category": "507f1f77bcf86cd799439013",
  "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
  "active": true,
  "views": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}

Error (401):
{
  "error": "Must be seller to create listings"
}

Error (400):
{
  "error": "Validation error",
  "details": {
    "title": "Title must be 3+ characters"
  }
}
```

### Update Listing (Seller)

```
PUT /api/listings/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <session-token>
Content-Type: application/json

Body (send only fields to update):
{
  "title": "iPhone 12 - Like New (SOLD PENDING)",
  "price": 549.99,
  "active": false
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "iPhone 12 - Like New (SOLD PENDING)",
  "price": 549.99,
  "active": false,
  // ... other fields
}

Error (403):
{
  "error": "You can only edit your own listings"
}

Error (404):
{
  "error": "Listing not found"
}
```

### Delete Listing (Seller)

```
DELETE /api/listings/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <session-token>

Response (200):
{
  "message": "Listing deleted"
}

Error (403):
{
  "error": "You can only delete your own listings"
}

Error (404):
{
  "error": "Listing not found"
}
```

---

## 💬 Messaging Endpoints

### Get All Conversations

```
GET /api/conversations

Headers:
Authorization: Bearer <session-token>

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "participants": [
      { "_id": "user1", "name": "John", "email": "john@..." },
      { "_id": "user2", "name": "Jane", "email": "jane@..." }
    ],
    "lastMessage": "Is this still available?",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
]
```

### Get Conversation Messages

```
GET /api/conversations/507f1f77bcf86cd799439015/messages?limit=50&page=1

Headers:
Authorization: Bearer <session-token>

Response (200):
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "sender": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John"
      },
      "text": "Is this item still available?",
      "createdAt": "2024-01-15T14:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "sender": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane"
      },
      "text": "Yes! Would you like to buy it?",
      "createdAt": "2024-01-15T14:15:00Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

### Send Message

```
POST /api/conversations/507f1f77bcf86cd799439015/messages

Headers:
Authorization: Bearer <session-token>
Content-Type: application/json

Body:
{
  "text": "Yes, I'm interested. Can we negotiate?"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439018",
  "conversation": "507f1f77bcf86cd799439015",
  "sender": "507f1f77bcf86cd799439011",
  "text": "Yes, I'm interested. Can we negotiate?",
  "createdAt": "2024-01-15T14:30:00Z"
}

Error (404):
{
  "error": "Conversation not found or access denied"
}
```

### Start New Conversation

```
POST /api/conversations

Headers:
Authorization: Bearer <session-token>
Content-Type: application/json

Body:
{
  "recipientId": "507f1f77bcf86cd799439012",
  "initialMessage": "Hi, is the iPhone still available?"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439015",
  "participants": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "createdAt": "2024-01-15T14:30:00Z"
}
```

---

## ❤️ Wishlist Endpoints

### Get Wishlist

```
GET /api/wishlist

Headers:
Authorization: Bearer <session-token>

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "listing": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "iPhone 12",
      "price": 599.99,
      "images": ["/uploads/image1.jpg"]
    },
    "addedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Add to Wishlist

```
POST /api/wishlist/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <session-token>

Response (201):
{
  "_id": "507f1f77bcf86cd799439020",
  "user": "507f1f77bcf86cd799439011",
  "listing": "507f1f77bcf86cd799439012",
  "createdAt": "2024-01-15T10:30:00Z"
}

Error (409):
{
  "error": "Item already in wishlist"
}
```

### Remove from Wishlist

```
DELETE /api/wishlist/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <session-token>

Response (200):
{
  "message": "Removed from wishlist"
}

Error (404):
{
  "error": "Item not in wishlist"
}
```

### Check Wishlist Status

```
GET /api/wishlist/status?listingIds=507f1f77bcf86cd799439012,507f1f77bcf86cd799439013

Headers:
Authorization: Bearer <session-token>

Query:
- listingIds: Comma-separated listing IDs

Response (200):
{
  "507f1f77bcf86cd799439012": true,  // In wishlist
  "507f1f77bcf86cd799439013": false  // Not in wishlist
}
```

---

## 👤 User Endpoints

### Get User Profile

```
GET /api/users/507f1f77bcf86cd799439011

Response (200):
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "seller",
  "listingsCount": 12,
  "memberSince": "2024-01-01T00:00:00Z"
}

Error (404):
{
  "error": "User not found"
}
```

### Become Seller

```
POST /api/user/become-seller

Headers:
Authorization: Bearer <session-token>

Response (200):
{
  "message": "Upgraded to seller role",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "role": "seller"
  }
}

Error (400):
{
  "error": "You are already a seller"
}
```

---

## 🏛️ Admin Endpoints

### Get Admin Dashboard

```
GET /api/admin

Headers:
Authorization: Bearer <admin-session-token>

Response (200):
{
  "stats": {
    "totalUsers": 1250,
    "totalListings": 5480,
    "totalMessages": 28950,
    "bannedUsers": 23
  }
}

Error (403):
{
  "error": "Admin access required"
}
```

### Get All Users (Admin)

```
GET /api/admin/users?role=seller&banned=false&limit=50

Headers:
Authorization: Bearer <admin-session-token>

Query Parameters:
- role (optional): Filter by role
- banned (optional): true | false
- limit (optional): Results per page
- page (optional): Page number

Response (200):
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "seller",
      "banned": false,
      "listingsCount": 12,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1250,
  "page": 1
}
```

### Ban User (Admin)

```
POST /api/admin/users/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <admin-session-token>
Content-Type: application/json

Body:
{
  "action": "ban",
  "reason": "Selling counterfeit items"
}

Response (200):
{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "banned": true,
    "bannedReason": "Selling counterfeit items"
  }
}
```

### Unban User (Admin)

```
POST /api/admin/users/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <admin-session-token>
Content-Type: application/json

Body:
{
  "action": "unban"
}

Response (200):
{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "banned": false
  }
}
```

### Get Audit Logs (Admin)

```
GET /api/admin/audit?action=ban_user&limit=50&page=1

Headers:
Authorization: Bearer <admin-session-token>

Query Parameters:
- action (optional): Filter by action type
- limit (optional): Results per page
- page (optional): Page number

Response (200):
{
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "admin": { "_id": "507f1f77bcf86cd799439011", "email": "admin@..." },
      "action": "ban_user",
      "targetUser": "507f1f77bcf86cd799439012",
      "details": { "reason": "Selling counterfeits" },
      "createdAt": "2024-01-15T14:00:00Z"
    }
  ],
  "total": 45,
  "page": 1
}
```

### Delete Listing (Admin)

```
DELETE /api/admin/listings/507f1f77bcf86cd799439012

Headers:
Authorization: Bearer <admin-session-token>

Body:
{
  "reason": "Contains prohibited content"
}

Response (200):
{
  "message": "Listing deleted",
  "audit": {
    "_id": "507f1f77bcf86cd799439020",
    "action": "delete_listing"
  }
}
```

---

## 📤 File Upload Endpoints

### Upload Image

```
POST /api/upload

Headers:
Authorization: Bearer <session-token>
Content-Type: multipart/form-data

Body:
- file: <binary image file>

Response (200):
{
  "url": "/uploads/abc123def456.jpg",
  "filename": "abc123def456.jpg"
}

Error (400):
{
  "error": "File size exceeds limit (max 5MB)"
}
```

---

## 📂 Categories Endpoints

### Get All Categories

```
GET /api/categories

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Electronics",
    "slug": "electronics",
    "parent": null,
    "subcategories": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Mobile Phones",
        "slug": "mobile-phones"
      }
    ]
  }
]
```

### Get Category Details

```
GET /api/categories/electronics

Response (200):
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Electronics",
  "slug": "electronics",
  "parent": null,
  "subcategories": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Mobile Phones",
      "slug": "mobile-phones",
      "listingsCount": 342
    }
  ]
}
```

---

## 🔗 Pagination

All list endpoints support pagination:

```
GET /api/listings?page=2&limit=20

Response includes:
{
  "items": [...],
  "total": 1250,        // Total items available
  "page": 2,            // Current page
  "limit": 20,          // Items per page
  "pages": 63           // Total pages
}
```

---

**Next:** Read [AUTHENTICATION.md](./AUTHENTICATION.md) for authentication details!
