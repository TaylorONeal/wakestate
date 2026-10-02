# Web hosting (Vercel)

The PWA is a static Vite build. Vercel runs `npm ci` and `npm run build`, serves `dist/`, and `vercel.json` handles the SPA rewrite, security headers and service-worker caching.

Environment variables (Project Settings > Environment Variables, all environments). Copy names from `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

These feed only the optional feedback feature. Tracking itself is local and works without them.

The native Android and iOS builds bundle the web assets and do not depend on this host. Keep the web origin stable: browser storage (IndexedDB) is per origin, so changing the domain strands existing web users' records until they export and import.

The feedback backend lives in `supabase/` (edge functions `get-challenge` and `submit-feedback`). It must run in a Supabase project you own. Deploy the functions and migrations there, then update the three variables above.
