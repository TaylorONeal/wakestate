# Web hosting (Vercel)

The PWA is a static Vite build. Vercel runs `npm ci` and `npm run build`, serves `dist/`, and `vercel.json` handles the SPA rewrite, security headers and service-worker caching.

No environment variables or backend are required. Tracking is local, and feedback is an email link.

The native Android and iOS builds bundle the web assets and do not depend on this host. Keep the web origin stable: browser storage (IndexedDB) is per origin, so changing the domain strands existing web users' records until they export and import.
