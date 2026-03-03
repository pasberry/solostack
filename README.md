# SoloStack

All-in-one CRM for solo IT consultants — from lead to invoice.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Convex
- **Auth:** Clerk
- **Deployment:** Vercel

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local.example` to `.env.local` and fill in your keys:
   - Clerk keys from [Clerk Dashboard](https://dashboard.clerk.com)
   - Convex URL after running `npx convex dev`

3. **Initialize Convex:**
   ```bash
   npx convex dev
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open:** http://localhost:3000

## Project Structure

```
├── convex/           # Convex backend (schema, functions)
│   ├── schema.ts     # Database schema
│   ├── auth.ts       # Clerk webhook handler
│   └── *.ts          # API functions
├── src/app/          # Next.js app router pages
│   ├── (dashboard)/  # Authenticated dashboard pages
│   ├── sign-in/      # Clerk sign-in
│   └── sign-up/     # Clerk sign-up
└── ...
```

## Workstreams

See `docs/workstream-tracker.md` for progress on all workstreams.
