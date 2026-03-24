# ☁️ Cloud K Bites — Setup & Deploy Guide

## Step 1 — Install dependencies

```bash
npm install
```

## Step 2 — Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://omthmwgvkqwfuvmypsxk.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdGhtd2d2a3F3ZnV2bXlwc3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MjYxNzUsImV4cCI6MjA4NzEwMjE3NX0.pbyKB6hwzHFAcfkQCWrG2Ntr6hVTZSK3qZOhDqT5in8"
VITE_RAZORPAY_KEY_ID="rzp_test_REPLACE_ME"
VITE_ADMIN_PASSWORD="cloudk2026"
```

> Your Supabase URL and key are already filled above from your Loveable project.
> Replace VITE_RAZORPAY_KEY_ID with your real key from dashboard.razorpay.com → Settings → API Keys

## Step 3 — Run the database migration

1. Go to https://supabase.com/dashboard
2. Open your project (omthmwgvkqwfuvmypsxk)
3. Click **SQL Editor** in the left sidebar
4. Open `supabase/migrations/001_initial_schema.sql`
5. Copy the entire contents → paste into SQL Editor → click **Run**

This creates your 3 tables (products, orders, order_items) and seeds all 12 products.

## Step 4 — Run locally

```bash
npm run dev
```

Open http://localhost:8080

## Step 5 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted, set these environment variables in the Vercel dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_RAZORPAY_KEY_ID
- VITE_ADMIN_PASSWORD

## Step 6 — Get Razorpay working (online payments)

1. Sign up at https://dashboard.razorpay.com
2. Go to Settings → API Keys → Generate Test Key
3. Copy the Key ID into your .env as VITE_RAZORPAY_KEY_ID
4. Test with card: 4111 1111 1111 1111, any future expiry, any CVV, OTP: 1234
5. For production, replace test key with live key and deploy the Edge Function:

```bash
npm install -g supabase
supabase login
supabase link --project-ref omthmwgvkqwfuvmypsxk
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=your_secret
supabase functions deploy create-razorpay-order
```

## What changed from Loveable

| Feature | Loveable (old) | Now |
|---|---|---|
| Orders | Never saved anywhere | Saved to Supabase DB |
| Admin orders | Hardcoded fake data | Live from database |
| Order tracking | Always shows "Preparing" | Real status from DB |
| Product toggle | UI only, no effect | Updates database |
| Payment | Fake QR placeholder | Razorpay (UPI/Cards/NB) |
| Admin password | Hardcoded in source code | Via .env variable |
| Loveable dependency | Required | Completely removed |
