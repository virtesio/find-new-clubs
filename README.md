# Find New Clubs

A mobile-friendly web app starter for clubs, orchestras, theatre groups, sports clubs, and book clubs.

## Current features

- Google-only login through Supabase Auth
- Member criteria setup before search
- Search by club type, location, and radius
- Member interest form with contact details and notes
- Group dashboard with active/expired postings
- Interested people history
- Email notification queue concept for automatic matching
- Placeholder for Stripe $10/month listings

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a Supabase project.
2. In Supabase Auth > Providers, enable Google.
3. Add your Google OAuth client ID and secret.
4. Add this redirect URL in Supabase:

```text
http://localhost:3000/auth/callback
```

5. Copy your Supabase URL and anon key into `.env.local`.
6. Run `supabase/schema.sql` in the Supabase SQL editor.

## Git

```bash
git init
git add .
git commit -m "Initial Find New Clubs app"
```

## Next build steps

- Replace prototype local state with Supabase queries/mutations.
- Add Stripe Checkout for $10/month group listings.
- Add a scheduled email sender for queued notifications.
- Later: reuse the same matching logic for iOS/Android push notifications.
