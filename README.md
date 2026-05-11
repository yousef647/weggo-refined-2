# weggo

weggo is a full-stack second-hand marketplace built with **Next.js (App Router)**, **TypeScript**, **MongoDB + Mongoose**, **NextAuth.js (credentials + bcrypt)**, **Zod**, and **Tailwind CSS**.

## Prerequisites

- Node.js 20+
- MongoDB running locally (for example `mongodb://127.0.0.1:27017/weggo`)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and fill in secrets:

   ```bash
   cp .env.example .env
   ```

   - Set `MONGODB_URI` (default in `.env.example` is fine for local Mongo).
   - Set `AUTH_SECRET` to a long random string (`openssl rand -base64 32`).
   - Set `AUTH_URL` to `http://localhost:3000` for local dev.

3. Seed categories (taxonomy of parent + subcategories with slugs):

   ```bash
   npm run seed:categories
   ```

4. Seed a local admin account (guarded: refuses when `NODE_ENV=production`):

   ```bash
   npm run seed:admin
   ```

   Defaults come from `.env.example` (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`). Change the password after first login.

5. (Optional) Seed demo listings with photos from **picsum.photos** — requires categories + at least one seller or admin user (refuses when `NODE_ENV=production`):

   ```bash
   npm run seed:listings
   ```

   Re-running replaces previous rows whose titles start with `[demo] `. If no seller exists, the script creates `mockseller@weggo.local` / `Mock12345!`.

6. Start the dev server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Roles and “become seller”

- New accounts register as **buyers** by default.
- Any buyer can switch to **seller** from **Become a seller** (`/account/become-seller`). The app refreshes your **JWT session** after the role change so middleware allows `/sell` without logging in again.
- **Admins** are created via `seed:admin` for local environments.

## Password reset (local dev)

- Configure `RESEND_API_KEY` and `EMAIL_FROM` to send real emails (optional).
- If email is not configured, set `LOG_RESET_LINK=true` (default in `.env.example`) **and** run with `NODE_ENV=development` so the reset URL is printed to the **server console** when you request a reset.

## Project layout (high level)

- `src/models` — Mongoose models and indexes (users, listings, categories, conversations, messages, wishlist, password reset tokens, admin audit logs).
- `src/app/api` — Route handlers with Zod validation and server-side permission checks.
- `src/app` — UI routes: browse with filters + text search, listing detail, auth, sell flow, wishlist, messages (polling MVP), admin moderation, banned UX.
- `public/uploads` — Local multipart uploads (MVP); paths stored on listings for an easy future swap to object storage.
- `scripts` — `seed:categories`, `seed:admin`, `seed:listings` (optional demo data).

## Manual test checklist

1. **Mongo**: database `weggo` exists and accepts connections.
2. **Seeds**: `npm run seed:categories` then `npm run seed:admin` succeed; optionally `npm run seed:listings` after that.
3. **Register / login / logout**: create a buyer, log out, log back in.
4. **Become seller**: from `/account/become-seller`, enable selling; confirm `/sell/new` loads.
5. **Create listing**: choose category + subcategory from seeded taxonomy, upload ≥1 image, publish; open detail page from browse cards.
6. **Browse**: filters (category → subcategory, condition, price range) and sort options behave; search uses text search when `q` is present.
7. **Wishlist**: add/remove while logged in; persists after refresh.
8. **Messaging**: as buyer, message seller from a listing; thread opens at `/messages/[id]`; messages appear after send and on poll.
9. **Admin**: log in as seeded admin; ban/unban a test user; hide/restore a listing; confirm rows appear in **Audit**.
10. **Banned UX**: banned user is redirected away from protected areas and sees `/banned` with a clear message when session reflects the ban (re-login may be needed if only JWT flags are used).
11. **Password reset**: request reset; with dev logging, copy the URL from the server console; reset password; log in with the new password.

## Scripts

| Script                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Next.js dev server (Turbopack)       |
| `npm run build`        | Production build                     |
| `npm run start`        | Start production server              |
| `npm run seed:categories` | Wipe + reseed category taxonomy   |
| `npm run seed:admin`   | Create/update local admin user      |
| `npm run seed:listings` | Insert demo listings (local only)  |
