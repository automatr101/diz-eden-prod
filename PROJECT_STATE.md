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

## In Progress

- Nothing currently in flight.

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

## Decisions Made

- **Source of truth for room pricing/capacity**: `src/lib/properties.ts`
  (`apartment1BR`, `apartment2BR`). Any other place that needs a price or maxGuests
  value (booking page fallback constants, admin panel display, etc.) should derive
  from these, not hold its own separate hardcoded copy — that duplication is exactly
  what caused the pricing bug in the first place.
- **Deploys go straight to `main`** on this repo per user's explicit confirmation
  (asked once before the first push; user said push directly going forward is fine
  for this kind of fix — reconfirm if a change is large/risky rather than a small bug fix).

---

*Process note: for any new multi-step build (30+ steps) on this project, break it into
chunks of 5-7 steps, read this file at the start of each chunk, update it at the end of
each chunk (Completed/In Progress/Constraints/Decisions), and stop for a go-ahead before
starting the next chunk. Small bug fixes like the ones above don't need chunking — this
applies to larger scoped work going forward.*
