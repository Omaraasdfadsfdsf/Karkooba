# KARKOOBA · كركوبة

**One man's junk, another man's jackpot.** A UAE classifieds board for cheap secondhand
finds — everything under AED 999, sellers reachable in one tap on WhatsApp.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, backed by Supabase
(Postgres, Auth, Storage). Deploys to Vercel.

## Features

- Listing grid with full-text search, category chips, emirate filter, newest/cheapest sort
- Live ticker of the 8 newest listings
- Listing detail pages with photo gallery, rotated price sticker, and a
  "WhatsApp the seller" button with a pre-filled message
- Email + password auth; first login collects display name, WhatsApp number, and emirate
- Post listings with up to 4 photos, compressed client-side to max 1200px before upload
- My Listings page: mark sold, relist, delete
- Server-side validation of everything (price range, lengths, phone format), enforced
  again by Postgres constraints and Row Level Security
- SEO: per-listing meta + OpenGraph tags, `/listing/<id>/<slug>` URLs, sitemap, robots

---

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. In the dashboard, open **SQL Editor → New query**.
3. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   and click **Run**. This creates the tables, enums, RLS policies, and the public
   `listing-photos` storage bucket.
4. Grab your credentials from **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Email confirmation (pick one)

- **Fast local testing:** Supabase → **Authentication → Providers → Email** → turn
  **off** "Confirm email". Sign-ups log in instantly.
- **Production:** leave it on. The app handles the confirmation link via
  `/auth/callback`. Add your site URL under **Authentication → URL Configuration**
  (Site URL + redirect URL `https://your-domain/auth/callback`).

## 2. Run locally

Requires Node.js 18.18+ (LTS recommended).

```bash
# 1. install dependencies
npm install

# 2. configure environment
#    copy .env.example to .env.local and fill in your Supabase values
cp .env.example .env.local

# 3. start the dev server
npm run dev
```

Open <http://localhost:3000>. Sign up, fill in your profile, post that dusty fan.

### Environment variables

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project URL**, e.g. `https://abcd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon/public** API key (never the `service_role` key) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/OG tags. `http://localhost:3000` locally, your Vercel URL in production |

## 3. Deploy to Vercel

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket).
2. In [Vercel](https://vercel.com), **Add New → Project** and import the repo.
   Vercel auto-detects Next.js; no build settings needed.
3. Under **Environment Variables**, add the three variables above —
   set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://karkooba.vercel.app`).
4. Deploy.
5. Back in Supabase → **Authentication → URL Configuration**: set **Site URL** to your
   Vercel URL and add `https://<your-app>.vercel.app/auth/callback` to the redirect
   allow list, so confirmation emails land back in the app.

## Project layout

```
supabase/migrations/0001_init.sql   schema + RLS + storage bucket (paste into SQL editor)
src/app/                            App Router pages, server actions, auth routes
src/components/                     header, search, filters, cards, gallery
src/lib/                            Supabase clients, validation, constants, utils
src/middleware.ts                   session refresh + auth-gated routes
```

## Security model

- Postgres enforces every rule the UI promises: title ≤ 60 chars, description ≤ 500,
  price 0–999, max 4 photos per listing, phone format `971XXXXXXXXX`.
- RLS: anyone can read **active** listings; only the owner can insert/update/delete
  their listings and photos. Storage uploads are restricted to the user's own folder.
- The browser only ever holds the anon key; ownership checks happen in Postgres,
  not in JavaScript.
