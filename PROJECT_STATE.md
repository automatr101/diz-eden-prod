# Diz Eden — Project State

Read this file first, before starting any new chunk of work. Update it at the end of every chunk.

## Completed

- **2-bedroom pricing bug fixed** — checkout was charging GH₵3,200/night for 2-bedroom
  stays instead of GH₵1,800. Root cause: the Supabase `settings` table held stale values
  (`nightly_rate=1800`, `nightly_rate_2bed=3200`) that the admin panel had no field to
  correct. Fixed via direct SQL through the Supabase MCP: `nightly_rate=1200`,
  `nightly_rate_2bed=1800`. (commit `73948c7`)
- **Booking.tsx fallback constants fixed** — hardcoded fallback prices (used when the
  `settings` fetch fails) now read from `lib/properties.ts` (`apartment1BR.basePrice`,
  `apartment2BR.basePrice`) instead of stale hardcoded numbers. (commit `73948c7`)
- **Admin Pricing panel rebuilt** (`src/pages/admin/PricingPanel.tsx`) — now edits the
  actual keys the checkout reads (`nightly_rate`, `nightly_rate_2bed`, `cleaning_fee`).
  Removed the old "Stay Selector Rates" section that wrote to `price_1br`/`price_2br`,
  which nothing in the app ever read. (commit `73948c7`)
- **Supabase TypeScript types regenerated** — `src/integrations/supabase/types.ts` was
  stale (PostgrestVersion 14.5 vs live 14.17), missing the `settings` table entirely and
  several `bookings` columns (`apartment_type`, `stripe_session_id`). Regenerated via
  Supabase MCP `generate_typescript_types`. (commit `73948c7`)
- **Apartment-type default fixed on booking links** — the homepage "Book This Stay" links
  (`src/components/ui/animated-tabs.tsx`) only passed `?guests=`, never which room type
  was selected, so `Booking.tsx` always defaulted to 1 Bedroom regardless of which stay
  card was clicked. Links now also pass `&rooms=1|2`, and `Booking.tsx` reads it to
  initialize both the apartment-type selector and starting price. (commit `b5abb3a`)
- **Dead `properties`-table references removed** — `useProperty.ts` / `PropertyDetail.tsx`
  queried a Supabase `properties` table that no longer exists in the live schema (only
  `blocked_dates`, `bookings`, `reviews`, `settings` exist). Fixed by a spawned follow-up
  task; verified `/about` renders cleanly post-fix with zero console errors. (commit `2456303`)
- **Guest count capped by apartment type** (`Booking.tsx`) — Guests dropdown now offers
  1–2 for 1 Bedroom and 1–4 for 2 Bedrooms (`apartment1BR.maxGuests` / `apartment2BR.maxGuests`),
  and clamps the current selection down automatically when switching to the smaller unit.
  (commit `8eeae03`)

All of the above verified live on `dizeden.com` after each deploy (Vercel auto-deploys
`main`).

- **Launch checklist — Chunk 1 (SEO/technical) done** (commit `531353a`), from an
  external 54-item pre-launch checklist audited against the live site first:
  - Fixed canonical/OG/Twitter URLs — pointed at `dizeden.vercel.app`, now `dizeden.com`.
  - Added `og:image`/`twitter:image` (was missing entirely — shares had no preview image).
  - New `src/hooks/useDocumentMeta.ts` sets per-route `<title>`, description, canonical,
    OG/Twitter tags, and `robots` (index/noindex). Previously every route shared the
    homepage's static `index.html` metadata. Wired into all routed pages; `/admin`,
    `/booking/confirmation`, and 404 set `noindex, nofollow`.
  - Fixed `robots.txt` — wrong domain, and the per-bot blocks (Googlebot etc.) didn't
    inherit the wildcard's `Disallow /admin`, meaning Googlebot specifically was never
    told to skip `/admin`. Consolidated to one wildcard rule.
  - Rebuilt `sitemap.xml` with all real indexable routes + correct domain (was only
    `/` and `/booking`; now also `/gallery`, `/about`, `/terms`, `/privacy`, `/cancellation`).
  - Added `public/llms.txt`.
  - Minor: unique alt text per photo in the homepage mosaic slideshow (was identical
    generic text on every image).
  - All verified live post-deploy via direct DOM/fetch checks on `dizeden.com`.

- **Launch checklist — Chunk 2 (accessibility & UX polish) done** (commit `ce5c0eb`):
  - Skip-to-content link (`src/components/ui/skip-to-content.tsx`) + `id="main-content"`
    added to every routed page's `<main>` (and NotFound's wrapper div) as its target.
  - Global back-to-top button (`back-to-top.tsx`), bottom-left, appears after 600px
    scroll — bottom-right was already taken by the WhatsApp widget and Chatbot.
  - Global scroll progress bar (`scroll-progress-bar.tsx`), thin gold bar pinned to
    the very top of the viewport.
  - Print stylesheet: `@media print` in `index.css` hides `header`/`footer` and sets
    plain white/black output; `print:hidden` added to Chatbot/WhatsApp widget roots.
    Added a "Print Receipt"/"Print" button to both the real inline booking-confirmed
    view in `Booking.tsx` (what users actually see after paying) and the secondary
    `/booking/confirmation` route.
  - Added a tooltip on the Booking page's Guests field explaining the per-apartment-
    type guest cap — first real usage of the Tooltip primitive anywhere in the app
    (it was wired via `TooltipProvider` globally but never actually used before).
  - All verified live except the tooltip's hover-open visual, which Radix Tooltip
    doesn't reliably show under synthetic/automated pointer events in this sandbox
    (a known headless-testing limitation — the trigger element and wiring were
    confirmed correct in the DOM). Worth a 5-second manual hover check by the user.

- **Supabase keep-alive workflow added** (commit `53658f5`, outside the launch
  checklist — user reported the Supabase project kept auto-pausing): free tier
  pauses a project after ~7 days of no API activity. User chose a scheduled
  workaround over upgrading to Pro. `.github/workflows/supabase-keepalive.yml`
  pings a trivial read-only query every 3 days via `curl` + GitHub Actions cron,
  using `SUPABASE_URL`/`SUPABASE_ANON_KEY` repo secrets (set via `gh secret set`).
  Verified with a real manual `workflow_dispatch` run — actual HTTP 200 from
  Supabase, not just a green check. This is a stopgap for the free tier, not a
  substitute for Pro if hard uptime guarantees start to matter.

- **Launch checklist — Chunk 3 (trust & content additions) done** (commit `2de2941`):
  - Cookie consent banner: GA previously loaded unconditionally in `index.html`
    regardless of consent. Now loads dynamically only after Accept, via new
    `src/lib/analytics.ts` + `useCookieConsent` hook; choice persists in
    localStorage. Verified live: GA absent pre-consent, loads on Accept.
  - UTM capture: `utm_source`/`medium`/`campaign`/`term`/`content` captured from
    the landing URL into sessionStorage (survives SPA route changes, which lose
    query params) and fed to GA as campaign params whenever analytics loads —
    even if consent was granted after the user navigated away from the landing URL.
  - SPA route-change pageview tracking added (`AnalyticsRouteTracker` in
    `App.tsx`) — previously only one GA pageview ever fired for the whole
    session, since gtag's automatic pageview fires once on load and React
    Router navigation doesn't retrigger it.
  - Expandable FAQ section on the homepage (`FAQSection.tsx`) using the
    existing Accordion primitive — check-in/out, guest caps, cancellation,
    payment security, what's included, contact.
  - Expanded the Booking page's trust row from one line to three badges (SSL
    Secured, Card Payments, Instant Confirmation) + a no-card-storage line.
    Deliberately did NOT claim mobile money support — that depends on Paystack
    dashboard config that couldn't be verified from code; overclaiming payment
    methods on a checkout page is a real trust risk if wrong.
  - **Caught and fixed a real bug before shipping**: an early draft placed
    `<CookieConsentBanner />` (which uses `<Link>`) as a sibling AFTER
    `</BrowserRouter>` closed instead of inside it, crashing the entire app on
    load (`Cannot destructure property 'basename' of useContext(...) as it is
    null`). Caught via local browser testing before it ever reached prod.
  - All verified live on `dizeden.com`: app mounts correctly, consent banner
    shows/dismisses/persists, GA gated correctly pre/post consent, FAQ and
    trust badges render.

## In Progress

- Launch checklist chunks 1–3 of 4 complete. **Chunk 4 remaining**: Google
  Search Console verification — needs the real verification code from the
  user's GSC account (or DNS verification done by the user); the assistant
  can't generate this, only drop the code into `index.html` once provided.
  Not started — blocked on user input, not a "go-ahead to start" item.

## Constraints

- **Two separate codebases exist for this client — do not confuse them:**
  - `C:\Users\Admin\Desktop\PROSPECT\diz-eden` — an old Next.js version. **Not deployed.**
    Local-only, has its own (unrelated, mostly stale) scratch/debug history.
  - `C:\Users\Admin\Desktop\PROSPECT\diz-eden-prod` — Vite/React app, remote
    `https://github.com/automatr101/diz-eden-prod.git`. **This is the live production
    codebase** deployed to `dizeden.com` via Vercel, auto-deploying on push to `main`.
    All real work happens here.
- Supabase project ref: `onewyserwllwyrhvpkjw`. DNS to it was flaky from the sandbox shell
  early in this session but is reliably reachable from the browser and in production —
  don't over-trust a single failed `curl`/`nslookup` from this environment as proof the
  project is down.
- The Supabase MCP server (`supabase`) needs interactive authentication per Claude Code
  session — `claude mcp list` / `/mcp` in a real terminal. A session started before
  auth completes will not see `mcp__supabase__*` tools even after auth succeeds
  elsewhere; a fresh session is required.
- The service-role key found in `diz-eden/.env.local` is invalid/malformed — do not
  reuse it. Use the Supabase MCP (`execute_sql`, etc.) for privileged DB writes instead.
  The anon key cannot write to `settings` (RLS requires `authenticated` role).
- Admin login (`admin1@dizeden.com`) credentials are not available to the assistant —
  can't verify admin-only UI by logging in directly; verify via source review + deployed
  bundle inspection + typecheck/build instead, or ask the user to check visually.
- Never execute a real Paystack payment during testing — stop verification at "Pay
  button enabled with correct amount," never click through to actually charge a card.
- `settings.owner_email` = `bewinwisdom@gmail.com` — an internal notification address,
  not necessarily meant to be public-facing. Don't assume it's OK to publish as the
  site's contact email without asking; user deferred this decision (see below).
- A generic 54-item pre-launch checklist (from `website-launch-checklist.md`) assumes a
  multi-service/multi-location business. Several items don't apply to this single
  boutique 2-unit rental property and were explicitly skipped per user confirmation:
  blog posts, location pages, one-page-per-service, before/after gallery, dark mode
  toggle, site search. Don't resurrect these without the user asking again.

## Decisions Made

- **Source of truth for room pricing/capacity**: `src/lib/properties.ts`
  (`apartment1BR`, `apartment2BR`). Any other place that needs a price or maxGuests
  value (booking page fallback constants, admin panel display, etc.) should derive
  from these, not hold its own separate hardcoded copy — that duplication is exactly
  what caused the pricing bug in the first place.
- **Deploys go straight to `main`** on this repo per user's explicit confirmation
  (asked once before the first push; user said push directly going forward is fine
  for this kind of fix — reconfirm if a change is large/risky rather than a small bug fix).
- **Visible contact email deferred** — user chose to skip adding a public contact
  email for now rather than publish the personal Gmail found in `settings.owner_email`.
  Footer/contact section still show phone + WhatsApp only. Revisit if the user provides
  a branded address later.

---

*Process note: for any new multi-step build (30+ steps) on this project, break it into
chunks of 5-7 steps, read this file at the start of each chunk, update it at the end of
each chunk (Completed/In Progress/Constraints/Decisions), and stop for a go-ahead before
starting the next chunk. Small bug fixes like the ones above don't need chunking — this
applies to larger scoped work going forward.*
