# Independent hosting and platform-removal record

## Removed and replaced — 2026-09-15

Removed `lovable-tagger`, its Vite instrumentation, obsolete `bun.lock` (npm is canonical), and unused `public/placeholder.svg`. Regenerated favicon ICO/SVG, touch/PWA/maskable images, social card, iOS icon/splash bitmaps using owned `branding/mark.svg` and `npm run branding:generate`. Android uses the matching vector launcher/splash; unused template bitmap variants and unused launcher XML were removed. Kept useful React/shadcn/Supabase/Capacitor code, auth configuration, backend, native identity and record storage.

No platform hidden config/skills directory or runtime badge script was found. Purposeful medical-resource/donation links remain. Supabase URL/publishable key and generated integration types remain necessary backend code. Old Capacitor graphics were replaced, not attributed to Lovable.

## Portable hosting

`npm ci && npm run build` produces a static PWA in `dist/`. Serve it at the owned HTTPS origin with SPA fallback using `deploy/nginx.conf`. Do not serve a subsequent native build as the PWA: native builds omit service workers. Set existing public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` inputs; never a service-role key. Set `VITE_PUBLIC_ORIGIN` to the owned HTTPS origin without trailing slash/path for absolute social-image metadata. Local previews otherwise use relative image URLs.

Optional container: `docker build -f deploy/Dockerfile --build-arg VITE_SUPABASE_URL --build-arg VITE_SUPABASE_PUBLISHABLE_KEY --build-arg VITE_PUBLIC_ORIGIN -t wakestate .`. Export those public values first; serve container port 8080 behind the owned HTTPS proxy. Environment files, git and build artifacts are excluded. Docker is unavailable here, so this recipe is prepared, not container-tested. Verify CSP/HTTPS/headers on the actual host before launch.

Changing browser origin cannot access old IndexedDB. Existing users must export all records before migration and import afterward; preserve native origin/app identity. Do not clear records to migrate.

## New candidate and checks

`artifacts/android/2026-09-15-independent/` contains rebuilt debug APK, unsigned release AAB, SHA256SUMS and preserved web PWA under `web/`. `artifacts/android/current.json` points to this candidate and hashes. Prior `2026-09-15/` is explicitly marked SUPERSEDED and retained as evidence. Artifacts are ignored by git.

Passed: 22 tests, typecheck, web build, Android assembleDebug/bundleRelease/lintDebug/testDebugUnitTest and iOS asset sync. Eight existing web fast-refresh warnings remain. Browser preview decoded SVG favicon 108px, ICO favicon 32px and touch icon 192px; social card visually inspected. No browser runtime errors. Recursive scans of runtime source/public/config/package lock, dist, iOS bundle, preserved web build and extracted APK found no platform/tagger/flock strings. npm dependency inspection confirms the tagger is absent. Native device visual testing remains open.

## Residual references and migration gates

The live `https://wakestate.lovable.app/` host and GitHub homepage remain external dependencies until Admin explicitly migrates hosting/DNS and disconnects integrations. No deployment, DNS, account integration, remote homepage or auth changes occurred here. Admin must verify independent hosting/domain, privacy/support publisher facts and feedback behavior before retiring the old site. Existing users require backup/import guidance.

Platform names in this audit are intentional historical evidence; old git history/ignored superseded artifacts are preserved. No tracked runtime reference remains. The existing post-commit auto-push hook is preserved; cleanup commits bypass it with per-command `core.hooksPath=/dev/null`. No push, merge or deployment is included.

Final native verification after deleting unused template bitmap variants: build/tasks passed, Android lint 0 errors / 8 warnings. Final APK was extracted separately and scanned again; no platform string matches. Screenshot capture of the standalone SVG stalled and was stopped; image decode checks and direct local image inspection succeeded.

## Portability verification

See [the migration rehearsal](MIGRATION-REHEARSAL.md) and run `npm run migration:rehearse` before a domain move. It verifies complete synthetic recovery across origins and includes a local read-only helper for the older origin if its exporter omits categories. Do not retire old hosting based on counts alone.
