# Database Guide - MongoDB & Mongoose

This guide explains the database structure and how to work with it.

## 📊 Database Overview

- **Type:** MongoDB (NoSQL document database)
- **ORM:** Mongoose (Object Document Mapper for Node.js)
- **Default Location:** `mongodb://127.0.0.1:27017/weggo`

## 📁 Database Collections

The database has 8 main collections:

### 1. Users Collection

Stores user account information.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "passwordHash": "$2a$10$...", // bcrypt hash
  "name": "John Doe",
  "role": "buyer", // "buyer" | "seller" | "admin"
  "banned": false,
  "bannedReason": null,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `email` - unique, lowercase, trimmed (for login)
- `role` + `banned` - for finding specific user types

**Roles:**
- `buyer` - Default, can browse and purchase
- `seller` - Can create listings
- `admin` - Full access

### 2. Listings Collection

Product listings in the marketplace.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "title": "iPhone 12 - Good Condition",
  "description": "Slightly used iPhone 12 with original box",
  "price": 599.99,
  "seller": ObjectId("507f1f77bcf86cd799439011"), // FK: User._id
  "category": ObjectId("507f1f77bcf86cd799439013"), // FK: Category._id
  "images": [
    "/uploads/image1.jpg",
    "/uploads/image2.jpg"
  ],
  "active": true,
  "views": 145,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `seller` + `active` - Find seller's listings
- `category` + `active` - Browse by category
- `title` text index - Full-text search

**Fields:**
- `seller` - References User who created listing
- `category` - References Category for organization
- `images` - Array of image file paths
- `active` - Toggle listing on/off without deleting
- `views` - Track popularity

### 3. Categories Collection

Product categories for organizing listings.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "name": "Electronics",
  "slug": "electronics",
  "parent": null, // null for root categories
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

**Example Subcategory:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "name": "Mobile Phones",
  "slug": "mobile-phones",
  "parent": ObjectId("507f1f77bcf86cd799439013"), // Electronics
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

**Structure:**
- Root categories have `parent: null`
- Subcategories have `parent` pointing to root
- Slug is URL-friendly version (lowercase, no spaces)

### 4. Conversations Collection

Messaging threads between users.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "participants": [
    ObjectId("507f1f77bcf86cd799439011"), // User A
    ObjectId("507f1f77bcf86cd799439012")  // User B
  ],
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-16T14:22:00Z")
}
```

**Fields:**
- `participants` - Array of 2 user IDs
- `updatedAt` - Updated when new message added (for sorting)

**Indexes:**
- `participants` - Find conversations involving a user

### 5. Messages Collection

Individual messages within conversations.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439016"),
  "conversation": ObjectId("507f1f77bcf86cd799439015"), // FK: Conversation._id
  "sender": ObjectId("507f1f77bcf86cd799439011"), // FK: User._id
  "text": "Is this item still available?",
  "createdAt": ISODate("2024-01-15T10:35:00Z"),
  "updatedAt": ISODate("2024-01-15T10:35:00Z")
}
```

**Indexes:**
- `conversation` - Get all messages for a conversation
- `conversation` + `createdAt` - Get recent messages

### 6. WishlistItems Collection

User's saved/favorite listings.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439017"),
  "user": ObjectId("507f1f77bcf86cd799439011"), // FK: User._id
  "listing": ObjectId("507f1f77bcf86cd799439012"), // FK: Listing._id
  "createdAt": ISODate("2024-01-15T10:40:00Z"),
  "updatedAt": ISODate("2024-01-15T10:40:00Z")
}
```

**Indexes:**
- `user` + `listing` - unique (prevent duplicates)
- `user` - Get user's wishlist

### 7. PasswordResetTokens Collection

Tokens for password reset functionality.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439018"),
  "user": ObjectId("507f1f77bcf86cd799439011"), // FK: User._id
  "token": "abc123def456...", // Random token
  "expiresAt": ISODate("2024-01-15T11:40:00Z"), // 1 hour from creation
  "used": false,
  "createdAt": ISODate("2024-01-15T10:40:00Z"),
  "updatedAt": ISODate("2024-01-15T10:40:00Z")
}
```

**Indexes:**
- `token` - Find token to validate
- `expiresAt` - Auto-delete expired tokens

### 8. AdminAuditLogs Collection

Audit trail of admin actions.

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439019"),
  "admin": ObjectId("507f1f77bcf86cd799439011"), // FK: User._id
  "action": "ban_user",
  "targetUser": ObjectId("507f1f77bcf86cd799439012"), // FK: User._id
  "details": {
    "reason": "Selling counterfeit items",
    "bannedUntil": null
  },
  "createdAt": ISODate("2024-01-15T11:00:00Z"),
  "updatedAt": ISODate("2024-01-15T11:00:00Z")
}
```

**Common Actions:**
- `ban_user` - Admin banned a user
- `unban_user` - Admin unbanned a user
- `delete_listing` - Admin deleted a listing
- `delete_message` - Admin deleted a message

---

## 🔗 Relationships

### User ← Listings (One-to-Many)

```
User (seller)
  ↓ (many listings)
Listing 1
Listing 2
Listing 3
```

Query: Get all listings by user
```typescript
const listings = await Listing.find({ seller: userId });
```

### Category ← Listings (One-to-Many)

```
Category (Electronics)
  ↓ (many listings)
Listing: iPhone
Listing: Laptop
Listing: Headphones
```

Query: Get all listings in category
```typescript
const listings = await Listing.find({ category: categoryId });
```

### User ← Conversations (Many-to-Many)

```
User A ←→ Conversation ←→ User B
```

Query: Get all conversations for user
```typescript
const convos = await Conversation.find({
  participants: { $in: [userId] }
});
```

### Conversation ← Messages (One-to-Many)

```
Conversation 1
  ↓ (many messages)
Message: "Hi"
Message: "How much?"
Message: "550 or best offer"
```

Query: Get messages for conversation
```typescript
const messages = await Message.find({
  conversation: conversationId
}).sort({ createdAt: 1 });
```

---

## 🔄 Mongoose Usage Examples

### Connect to Database

```typescript
// src/lib/db.ts
import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  await mongoose.connect(process.env.MONGODB_URI!);
}
```

### Create Documents

```typescript
import User from "@/models/User";
import { connectDB } from "@/lib/db";

await connectDB();

// Create single document
const user = await User.create({
  email: "john@example.com",
  passwordHash: hashedPassword,
  name: "John Doe",
  role: "buyer"
});

// Get the ID
console.log(user._id); // ObjectId
```

### Query Documents

```typescript
// Find one
const user = await User.findById(userId);
const user = await User.findOne({ email: "john@example.com" });

// Find many
const users = await User.find({ role: "seller" });
const users = await User.find({}).limit(10);

// Find with filters
const listings = await Listing.find({
  category: categoryId,
  price: { $gte: 100, $lte: 500 }, // Price between 100-500
  active: true
});

// Count
const count = await Listing.countDocuments({ seller: userId });

// Check exists
const exists = await User.exists({ email: "john@example.com" });
```

### Update Documents

```typescript
// Update one by ID
const user = await User.findByIdAndUpdate(
  userId,
  { name: "Jane Doe" },
  { new: true } // Return updated document
);

// Update many
await Listing.updateMany(
  { seller: userId, active: false },
  { active: true }
);

// Use findByIdAndUpdate for atomic operations
const user = await User.findByIdAndUpdate(
  userId,
  { banned: true, bannedReason: "Selling counterfeits" },
  { new: true }
);
```

### Delete Documents

```typescript
// Delete one
await Listing.findByIdAndDelete(listingId);

// Delete many
await Message.deleteMany({ conversation: conversationId });

// Delete with conditions
await PasswordResetToken.deleteMany({
  expiresAt: { $lt: new Date() } // Delete expired tokens
});
```

### Populate (Join) Documents

```typescript
// Get listing WITH populated category and seller info
const listing = await Listing.findById(listingId)
  .populate("category", "name slug") // Get category name & slug only
  .populate("seller", "name email"); // Get seller name & email

// Result:
{
  _id: ObjectId(...),
  title: "iPhone",
  price: 599,
  category: { _id: ObjectId(...), name: "Electronics", slug: "electronics" },
  seller: { _id: ObjectId(...), name: "John", email: "john@..." },
  ...
}

// Without populate (returns just IDs):
{
  _id: ObjectId(...),
  title: "iPhone",
  price: 599,
  category: ObjectId(...), // Just ID!
  seller: ObjectId(...), // Just ID!
  ...
}
```

### Aggregation Pipeline

```typescript
// Complex queries using aggregation
const results = await User.aggregate([
  { $match: { role: "seller", banned: false } },
  {
    $lookup: {
      from: "listings",
      localField: "_id",
      foreignField: "seller",
      as: "listings"
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      listingCount: { $size: "$listings" },
      totalValue: {
        $sum: "$listings.price"
      }
    }
  },
  { $sort: { listingCount: -1 } },
  { $limit: 10 }
]);

// Result: Top 10 sellers by listing count
```

---

## 📈 Performance Tips

### 1. Use Indexes

Indexes speed up queries. Commonly queried fields should be indexed:

```typescript
// Already indexed in models:
UserSchema.index({ role: 1, banned: 1 });
ListingSchema.index({ seller: 1, active: 1 });
ListingSchema.index({ category: 1 });
```

### 2. Limit Fields Returned

```typescript
// Get all fields (slower)
const users = await User.find({});

// Get only needed fields (faster)
const users = await User.find({})
  .select("name email role")
  .lean(); // Returns plain objects, not Mongoose docs
```

### 3. Use Pagination

```typescript
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const listings = await Listing.find({ active: true })
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
```

### 4. Lean for Read-Only Queries

```typescript
// For queries you're not modifying:
const listings = await Listing.find({ active: true })
  .lean() // Skip Mongoose overhead
  .limit(50);

// Not for queries you'll update!
const listing = await Listing.findById(id); // Don't use lean if updating
```

---

## 🛡️ Data Validation

### In Mongoose Models

```typescript
const UserSchema = new Schema({
  email: {
    type: String,
    required: true, // Must be provided
    unique: true, // Cannot duplicate
    lowercase: true, // Auto-lowercase
    trim: true, // Remove whitespace
    match: /.+@.+\..+/ // Must be valid email
  },
  role: {
    type: String,
    enum: ["admin", "buyer", "seller"],
    default: "buyer"
  }
});
```

### In API Routes (with Zod)

```typescript
// Validate before saving
const validated = registerSchema.parse(body);

// Zod schema
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});
```

---

## 🔍 Debugging Database Issues

### Check Connections

```typescript
// In API route
console.log("Connection state:", mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

// Check connection
await connectDB();
console.log("Connected!");
```

### Log Queries

```typescript
// Enable Mongoose debug logging
mongoose.set('debug', true);

// Shows all queries in console
User.find({}) // Logs: "users.find({})"
```

### Common Errors

```
// Document not found (null)
const user = await User.findById(invalidId);
console.log(user); // null
// Fix: Check if exists before using

// Duplicate key error
// Caused by: Same unique value already exists
// Fix: Check for existing document first

// Cast error (invalid ObjectId format)
const user = await User.findById("not-an-id");
// Fix: Validate ObjectId format before querying
```

---

## 📚 MongoDB Query Operators

Useful operators for complex queries:

```typescript
// Comparison
{ price: { $gt: 100 } }        // Greater than
{ price: { $gte: 100 } }       // Greater or equal
{ price: { $lt: 500 } }        // Less than
{ price: { $lte: 500 } }       // Less or equal
{ price: { $eq: 99.99 } }      // Equal

// Logical
{ $and: [condition1, condition2] }
{ $or: [condition1, condition2] }
{ $not: { role: "admin" } }

// Array
{ images: { $size: 3 } }       // Array has 3 items
{ tags: { $in: ["new", "sale"] } } // Contains any of these
{ tags: { $all: ["new", "sale"] } } // Contains all of these

// Regex
{ title: { $regex: "phone", $options: "i" } } // Case-insensitive search

// Range
{ price: { $gte: 100, $lte: 500 } } // Between 100-500
```

---

**Next:** Read [API.md](./API.md) for API endpoint documentation!
