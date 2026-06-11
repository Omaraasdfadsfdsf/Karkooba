# KARKOOBA · كركوبة

**Everything deserves a second life.** The UAE's marketplace for pre-loved finds —
everything under AED 999, with real-time in-site chat between buyers and sellers.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, backed by Supabase
(Postgres, Auth, Storage, Realtime). Deploys to Vercel.

## Features

- Listing grid with full-text search, category chips, emirate filter, newest/cheapest sort
- Live ticker of the 8 newest listings
- Listing detail pages with photo gallery and two contact channels:
  real-time in-site chat (primary) and WhatsApp with a pre-filled message (secondary)
- In-site messaging: per-listing conversations, live delivery via Supabase Realtime,
  read receipts, unread badge in the header
- Email + password auth; first login collects display name, WhatsApp number, and emirate
- Profile menu and Settings page (edit profile, switch language)
- Full English / Arabic interface with right-to-left layout support
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
4. Run [`supabase/migrations/0002_chat.sql`](supabase/migrations/0002_chat.sql) the same
   way. This adds the chat tables (`conversations`, `messages`), their RLS policies,
   read receipts, and enables Realtime delivery for messages.
5. Run [`supabase/migrations/0003_condition.sql`](supabase/migrations/0003_condition.sql)
   the same way. This adds the item condition field (Like new / Good / Well used / For parts).
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon/public** API key |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/OG tags and email links. `http://localhost:3000` locally, your domain in production |
| `SUPABASE_SERVICE_ROLE_KEY` | *(optional)* Supabase **service_role** key — server-only, enables chat email notifications |
| `RESEND_API_KEY` | *(optional)* [Resend](https://resend.com) API key for sending those emails (free tier) |
| `EMAIL_FROM` | *(optional)* Verified sender, e.g. `KARKOOBA <hello@your-domain.com>` |

Chat email notifications require both `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`.
Without them the app runs normally — recipients just aren't emailed about new messages.

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
