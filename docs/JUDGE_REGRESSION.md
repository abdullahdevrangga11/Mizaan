# Judge regression checklist

Before merging `feat/realtime-and-admin` to `main`, every route below MUST load cleanly in incognito Chrome on the Vercel preview URL. Three passes, three different cold cache states.

If any line shows ❌ at the time of merge, **do not merge**. Roll back the last commit, re-test.

---

## Public landing + nav

- [ ] `/` (redirects to `/id` or `/en` per Accept-Language) → 200, full hero, footer reveal works
- [ ] `/id` → renders Indonesian landing, all sections present
- [ ] `/en` → renders English landing, all sections present
- [ ] Navbar links: donate · verify · feed · laz · about → all 200

## Donor surfaces

- [ ] `/id/donate` → step 1 of the 6-step form renders, LAZ picker (step 3) shows real LAZ
- [ ] `/en/donate` → same
- [ ] `/id/track/7xKXmRrFsHnL3eP2vTQbWzNcA5dM6sV9YpJg4kB8uH1F` → Pak Subandi card + real aggregates
- [ ] `/en/track/7xKXmRrFsHnL3eP2vTQbWzNcA5dM6sV9YpJg4kB8uH1F` → same
- [ ] `/id/track/<random-string>` → falls back to mock display, no error
- [ ] Click any of the 3 featured PDAs → Solscan opens in new tab, account resolves

## Verifier

- [ ] `/id/verify` → search bar renders, both preset chips present
- [ ] Click `7xKXmRr…kB8uH1F` chip → verify shows the chain
- [ ] Click `CLDKtP9…uRD4` chip → verify shows the chain
- [ ] Paste a random string → "no results" empty state, no error
- [ ] Result card "view on solana explorer" + "view raw json" links open Solscan in new tab

## Feed (this is where A risks regression)

- [ ] `/id/feed` → renders within 2s, no spinner stuck
- [ ] Items have plausible content (initials, region, amount, time-ago)
- [ ] Browser console: 0 errors, 0 unhandled rejections
- [ ] After 30s of idle, new items appear (either from realtime OR mulberry32 fallback)

## LAZ directory

- [ ] `/id/laz` → 5 real LAZ cards, hero count says "5 mitra laz aktif"
- [ ] Click any LAZ card → `/id/laz/[slug]` loads profile page
- [ ] Profile shows real recent distributions (or deterministic mock if LAZ has none)
- [ ] IdentityPanel shows real wallet + identity PDA

## LAZ admin (B — should be auth-gated)

- [ ] `/id/laz/admin/*` unauthenticated → redirects to `/id/laz/login` (NOT to `/`, NOT 404, NOT crash)
- [ ] `/id/laz/login` → login form renders
- [ ] Wrong credentials → inline error, no crash
- [ ] Right credentials → redirect to `/id/laz/admin` dashboard
- [ ] Logout → back to login page, can't re-enter admin without logging in

## Mustahik confirm

- [ ] `/id/confirm/anything` → renders the mobile shell with the 3-step chain
- [ ] 3 PDA short codes in the chain point to real seeded PDAs
- [ ] Confirm button → flips to "confirmed" stage
- [ ] Decline button → flips to "declined" stage

## API endpoints (judges may DevTools-inspect)

- [ ] `GET /api/laz` → 200, returns real seeded LAZ array
- [ ] `GET /api/feed?limit=10` → 200, returns array (real or mock)
- [ ] `GET /api/verify/CLDKtP943CebTrrRsU9SzshhcyNU4ViZNEJ1kUrzuRD4` → 200, returns chain

## Error / 404

- [ ] `/id/this-page-does-not-exist` → branded `not-found` page
- [ ] Throw a test error in a server component → branded `error` page with retry button

## SEO + social

- [ ] `/opengraph-image` → renders the brand-perfect OG card
- [ ] `/sitemap.xml` → 200, lists `/id` and `/en` routes
- [ ] `/robots.txt` → 200, disallows `/laz/admin/`, `/confirm/`, `/api/`

---

## Commit discipline

Every commit on this branch must be atomic so any single revert restores the previous good state. Format:

```
feat(A): step name — what changed
fix(A): step name — what broke and how
feat(B): step name — what changed
test(judge): step name — verification
```

After each commit, push to remote, wait for Vercel preview, run the relevant section of the checklist. If any item fails → revert that commit before next.
