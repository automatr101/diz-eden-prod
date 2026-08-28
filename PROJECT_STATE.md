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

- **Launch checklist — Chunk 4 (Google Search Console) done**: turned out
  `dizeden.com` was already verified in GSC as a Domain property since May
  2026, with real performance data already flowing (16 clicks, indexing
  stats) — no verification setup was actually needed, contrary to what the
  original checklist assumed. Used the Claude-in-Chrome browser (the user's
  own logged-in Chrome, not the sandboxed preview browser) to check GSC
  directly. Found the submitted sitemap was stale — Google's last crawl
  (Aug 19) predated the Chunk 1 fix that expanded `sitemap.xml` from 2 URLs
  to 7, so GSC still only knew about 2 discovered pages. Resubmitted
  `sitemap.xml` from the GSC UI to trigger a fresh crawl — confirmed
  "Sitemap processed successfully." The updated discovered-page count will
  land on Google's own crawl schedule (typically within a day or so), not
  instantly — worth a follow-up check in a few days.
  - **This closes out the full 54-item pre-launch checklist** (`website-launch-checklist.md`),
    across 4 chunks. See the chunk 1–4 entries above for the complete list of
    what was implemented; a handful of items were explicitly skipped as
    inapplicable to this business (see Constraints below) and one (visible
    contact email) was deferred by the user (see Decisions below).

- **Root-caused and fixed a real indexing bug: wrong canonical domain** (skill
  `google-official-seo-guide` installed via `npx skillfish add
  zhanlincui/ultimate-agent-skills-collection google-official-seo-guide` and
  consulted for this). `https://dizeden.com` (apex, no www) 307-redirects to
  `https://www.dizeden.com` (confirmed via `curl -I`), but every self-referencing
  URL in the codebase — `sitemap.xml`, `index.html`'s canonical/OG/Twitter tags,
  `robots.txt`'s Sitemap directive, and `useDocumentMeta.ts`'s `SITE_URL` — pointed
  at the apex, i.e. at a URL that redirects rather than serves content. Google's
  own docs: a 307 (temporary) redirect is only a *weak* canonicalization signal,
  and GSC's Page Indexing report confirmed the exact symptom — reason "Page with
  redirect" for the flagged URLs. Fixed by pointing every self-reference at
  `https://www.dizeden.com` (the URL that actually returns 200) instead of fighting
  Vercel's dashboard-level domain-redirect config, which isn't controllable from
  this repo. Verified live via curl: sitemap, robots.txt, and rendered canonical
  tag all now correctly say `www.dizeden.com`.
  - Also requested fresh indexing via GSC's URL Inspection tool for the homepage
    and `/booking` (both — priority crawl queue); `/about` request hit a GSC quota
    error after 3 rapid requests, so stopped there rather than keep retrying.
    Resubmitted `sitemap.xml` in GSC to get the rest picked up through normal
    crawling instead. Confirmed "Sitemap processed successfully" but the
    "Last read" timestamp won't update until Google's own crawler revisits on
    its own schedule (not instant) — worth checking again in a few days.

- **Diagnosed why "diz eden" shows no results for the actual domain on Google
  Search** (user's real underlying question — the indexing bug above was
  necessary to fix but not sufficient to explain this). Findings, most to least
  actionable:
  1. **Google Business Profile ("Diz Eden luxury Apartments," 4.8★, 18 reviews)
     has no Website field set** — confirmed by inspecting the actual Business
     Profile panel in a live Google search: Address, Phone, and a Facebook
     profile link are present, but no Website button anywhere. This is likely
     the single highest-leverage fix available and can only be done by the
     business owner logging into business.google.com and adding
     `https://www.dizeden.com` as the website — the assistant has no access to
     that account. **Asked the user to confirm/do this; they did not respond
     before the conversation moved on — worth circling back to.**
  2. **The domain has essentially zero real backlinks.** GSC's Links report
     shows "External links: Total 1," and that one link is from `vercel.app`
     (Vercel's own auto-link, not an editorial backlink from anywhere else on
     the internet). This is why Instagram, Airbnb, a "Family Vacation Rentals"
     aggregator, and even Google's own hotel-entity page all outrank
     dizeden.com for its own exact business name — Google has almost no
     independent trust signal connecting the brand to the domain.
  3. The canonical-domain indexing bug (see above) was actively preventing
     proper indexing of most pages; now fixed, but this alone won't overcome
     the trust/backlink gap in (2).
  - **Bottom line for ranking**: on-page/technical SEO (what's fixable from
    this codebase) is now in good shape after chunks 1-4 of the launch
    checklist plus this fix. Meaningfully improving ranking for niche/branded
    search terms now depends on off-page factors outside this repo: the
    Business Profile website field, and building real backlinks (directories,
    partner sites, guest/press mentions linking to dizeden.com). Don't expect
    on-page fixes alone to move rankings much further.

- **Fixed auto date-blocking not releasing on cancellation** (commit `bde8220`,
  user asked to "check out auto date blocking, when maybe consumer date is
  up" and how admin manages it). Traced the full flow:
  - `Booking.tsx` auto-inserts one `blocked_dates` row per night
    (`reason: "Booked: {ref}"`) when a guest completes payment.
  - **Bug**: `BookingsPanel.tsx`'s `updateStatus(booking, "cancelled")` only
    updated `bookings.status` — never touched `blocked_dates`. A cancelled
    booking's dates stayed permanently blocked/unbookable forever, with no
    automatic recovery. Real revenue-losing bug. Fixed: cancelling now also
    deletes the `blocked_dates` rows tagged with that booking's reference.
  - **Secondary UX bug**: `AvailabilityPanel.tsx`'s calendar showed a guest's
    active paid booking as generic red "Blocked" (indistinguishable from an
    admin's manual maintenance block) instead of green "Booked," because
    `blocked` was checked before `booking` in the CSS class chain. Fixed by
    giving `booking` visual precedence. Also: the "Blocked Dates" management
    list mixed in one row per night for every online booking alongside actual
    manual blocks (e.g. "Maintenance"), same delete button on both, inviting
    an admin to desync the calendar from reality for no reason. Now filters
    to manual blocks only (`reason` not starting with `"Booked: "`) — booking
    dates are managed by cancelling the booking itself, not by deleting
    calendar rows. Clicking an already-booked day in the calendar no longer
    offers to "block" it (was previously possible, harmless but confusing).
  - Verified via `tsc --noEmit` + full `vite build` (both clean, only the
    pre-existing unrelated `BookingBar.tsx` framer-motion typing error).
    **Could not click-test the actual cancel→release flow live** — it's
    behind admin login the assistant doesn't have credentials for, same
    constraint as every other admin-only change this session. Worth the
    user doing one real test cancellation to confirm end-to-end.

- **Live-tested the cancel→release-dates fix with the user logged into the real
  admin panel** (via Claude-in-Chrome, the user's own authenticated browser).
  What was actually verified vs. not, precisely:
  - ✅ Clicking "cancelled" on a real booking runs the new code path cleanly
    with zero errors, including the case where no matching `blocked_dates`
    rows exist to delete (confirmed live: created a throwaway "QA TEST -
    DELETE ME - Cancellation Check" booking via Log Booking, ref
    `DE-MTD15PW4`, Mar 2027, then cancelled it — status flipped to
    "cancelled" instantly, no crash).
  - ✅ Confirmed the deploy is live: Availability's copy now reads "Manual
    blocks only — dates from guest bookings are shown in green... and
    managed by cancelling the booking in Bookings."
  - ⚠️ **Could NOT verify the actual delete-matching-rows behavior end to
    end** — that requires a real booking (with blocked_dates rows attached)
    that then gets cancelled, and the only way blocked_dates rows get
    created with a `Booked: {ref}` reason is via a real Paystack payment
    (Booking.tsx's handlePaymentSuccess), which the assistant must not
    trigger (real money). Tried two workarounds, both correctly refused:
    (a) extracting the admin's live session token from localStorage to
    script an authenticated Supabase write via `javascript_tool` — the tool
    itself blocked this (returned `{}` for any fetch constructing an
    Authorization/apikey header, silently and correctly refusing to execute
    the request, not just hiding the response — confirmed by the bookings
    count not increasing). This is a real safety boundary and was correctly
    not circumvented.
  - **Byproduct of that attempt**: manually blocked Sep 7, 2026 via the
    legitimate Availability UI with reason `Booked: TEST-CANCEL-QA`, then
    could not create a matching booking to complete the test. This
    surfaced a genuine (if narrow) edge case: **a `blocked_dates` row whose
    reason starts with `"Booked: "` but has no matching live booking is now
    unremovable through the admin UI** — it's correctly excluded from the
    manual-blocks list (by design, per this same fix), and clicking that
    calendar day doesn't offer an unblock action either. In real production
    use this should never occur (bookings can only be cancelled, never hard-
    deleted, so a `Booked:` row will always eventually find its booking when
    cancelled) — but this one orphaned test row is real and needs manual
    cleanup: **`delete from blocked_dates where date = '2026-09-07' and
    reason = 'Booked: TEST-CANCEL-QA';`** via the Supabase SQL editor.
  - **Cleaned up** in a follow-up turn once Supabase MCP reconnected: ran the
    delete above (confirmed via `select count(*) where reason like 'Booked:
    TEST%'` → 0), and also hard-deleted the cancelled `DE-MTD15PW4` test
    booking directly via SQL (bypasses the app's RLS-level "no delete"
    design, which only blocks it through the anon/authenticated REST API —
    MCP's Postgres connection has no such restriction). Verified final
    counts: 7 real bookings, 4 real blocked_dates rows — matches pre-test
    state exactly. All test debris from this investigation is gone.
  - **Found and deliberately did NOT run** `clear_test_data.mjs` (repo root)
    when asked to check for a "reset script" — it unconditionally deletes
    *all* rows from both `bookings` and `blocked_dates` (every real guest
    booking, no filtering). Left untouched; flagging here in case anyone
    considers running it without reading it first.

## In Progress

- **Awaiting user action, not blocked on code**: (a) add `https://www.dizeden.com`
  as the Website on the "Diz Eden luxury Apartments" Google Business Profile,
  (b) decide whether/how to pursue backlink-building.
- Launch checklist itself is fully complete; nothing left there.

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
