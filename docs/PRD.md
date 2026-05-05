# Mizaan — Product Requirements Document

> **Tagline:** *"Donate Rp 100,000. See exactly which mustahik received it. No skimming possible."*
>
> **Status:** Active build — Indonesia National Campus Hackathon submission
> **Owner:** Devrangga Hazza Mahiswara — NIM 22/498430/SV/21212, Universitas Gadjah Mada
> **Target deadline:** May 12, 2026, 11:59 AM UTC
> **Submission listings:** Superteam Earn + Colosseum Frontier (both mandatory)
> **Last updated:** May 5, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Why Blockchain Is Load-Bearing](#3-why-blockchain-is-load-bearing)
4. [Target Users (Personas)](#4-target-users-personas)
5. [Value Proposition](#5-value-proposition)
6. [Product Scope](#6-product-scope)
7. [Core User Flows](#7-core-user-flows)
8. [Functional Requirements](#8-functional-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Business Model](#10-business-model)
11. [Distribution & Go-to-Market](#11-distribution--go-to-market)
12. [Regulatory Considerations](#12-regulatory-considerations)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Success Metrics](#14-success-metrics)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Roadmap](#16-roadmap)
17. [Endorsement & Outreach Strategy](#17-endorsement--outreach-strategy)
18. [Open Questions](#18-open-questions)

---

## 1. Executive Summary

**Mizaan** (Arabic: *ميزان*, "scale" or "balance") is an on-chain transparency layer for zakat, sedekah, and infaq distribution in Indonesia, built on Solana via the Solana Attestation Service (SAS).

The core product is a **3-party multi-signature attestation flow**:
- **Donor** → signs a donation commitment on-chain
- **LAZ** (Lembaga Amil Zakat) → countersigns a distribution decision (which mustahik, what category, what amount)
- **Mustahik** (recipient) → confirms receipt with their own signature

The result: every donation has a **publicly verifiable cryptographic chain** from donor to recipient. No single party — including LAZ administrators — can fake distributions. Donors can track exactly where their zakat went, what category of need it served, and when the recipient confirmed receipt.

Mizaan is positioned as **infrastructure**, not a replacement for existing institutions. LAZ and BAZNAS continue their operational role; Mizaan adds a transparency layer they can adopt.

**Why this exists now:**
- Indonesia's zakat realization is **Rp 31T/year** vs **Rp 327T/year** potential (BAZNAS 2024) — a 90% gap driven primarily by trust deficit
- Documented LAZ scandals + dark-web exposed muzakki data have eroded donor confidence
- Diaspora Indonesians (12M overseas) want to zakat to home but have zero visibility into distribution
- Dr. Farrukh Habib's framework presented at Puskas BAZNAS validated the conceptual feasibility — Mizaan is the implementation

**Hackathon submission optimization:**
- Real on-chain demo (3 SAS attestations executed live)
- Sahih credential primitive codebase as foundation (~70% reusable)
- Single-founder, 7-day intensive build with Claude Max 20x

---

## 2. Problem Statement

### 2.1 The numbers

| Metric | Value | Source |
|---|---|---|
| Indonesian Muslim population | 243 million (87% of 280M) | BPS 2023 |
| Zakat potential (national) | Rp 327 trillion / year | BAZNAS *Outlook Zakat 2024* |
| Zakat realization (national) | Rp 31 trillion / year | BAZNAS 2024 annual report |
| Realization rate | **9.5%** | Calculated |
| Gap (lost potential) | **Rp 296 trillion / year** | Calculated |
| Indonesian diaspora | ~12 million | Kemenlu 2023 |
| Number of registered LAZ | 79 LAZ Nasional + 542 LAZ Provinsi/Kota | BAZNAS registry 2024 |

**The gap is not an information gap — Indonesians know zakat is wajib. The gap is a trust gap.**

### 2.2 The trust deficit (documented)

| Year | Event | Implication |
|---|---|---|
| 2020 | Achmad Soedjatmiko BAZNAS embezzlement case | High-profile institutional fraud |
| 2022 | Bjorka data leak — 1.3 billion Indonesian records | Donor PII exposed; pinjol illegal abuse |
| 2023 | Multiple "kotak amal" mosque collection scandals | Zero-audit-trail collection criticized |
| 2024 | ACT Indonesia case (post-2022 fallout continues) | Donor confidence collapse |
| Ongoing | Diaspora muzakki survey: 78% don't trust local LAZ to distribute correctly | IZI internal research |

### 2.3 The structural causes

1. **Opaque distribution.** Once a donor wires funds to a LAZ, they receive a generic "thank you" PDF. No visibility into which mustahik received what.
2. **No cryptographic accountability.** LAZ internal records are subject to administrative discretion — a single bad actor can manipulate spreadsheets.
3. **Cross-border friction.** Diaspora donors cannot verify their hometown distribution. They face a binary "trust LAZ X or skip zakat entirely" choice.
4. **No federation.** 600+ LAZ operate as silos. A donor cannot easily compare LAZ performance, distribution categories, or geographic reach.
5. **Mosque-level invisibility.** Small mosques (kotak amal) collect informal zakat with zero audit trail. Aggregate impact is significant but uncountable.

### 2.4 Why existing solutions fail

| Solution | Why it's insufficient |
|---|---|
| BAZNAS SiHalal/SiZakat dashboard | Centralized; donor must trust BAZNAS; not cross-LAZ |
| Kitabisa.com | Donation crowdfunding for general causes, charges 5% platform fee, no cryptographic verification |
| LAZ private dashboards | Each LAZ has different system; no federation |
| Manual receipts | Physical paper, photoshop-able, not searchable |
| Annual audit reports | Lagging by 6-12 months, aggregate not per-donation |

---

## 3. Why Blockchain Is Load-Bearing

This section defends Mizaan against the standard "you could do this with a database + RBAC" critique.

### 3.1 What blockchain provides that a database cannot

| Property | Database | Blockchain (SAS on Solana) |
|---|---|---|
| **Tamper-evidence** | Database admin can edit; audit logs can be falsified by admin | Every write is cryptographically signed; no admin can alter past records |
| **Multi-party trust** | Requires trusting the database operator | Multiple independent parties (donor, LAZ, mustahik) co-sign the same record |
| **Cross-org composability** | Each LAZ runs its own DB; integration requires BAU contracts | Anyone can read the same chain; LAZ federation emerges naturally |
| **Donor sovereignty** | Donor receives a PDF; cannot independently verify | Donor holds their own attestation; verifies independently |
| **Diaspora trust** | Indonesian abroad must trust unfamiliar Indonesian LAZ | Indonesian abroad reads the same chain as locals; symmetric information |
| **Anti-corruption guarantee** | Internal audit + regulator | Cryptographic — even MUI/BAZNAS cannot fake an attestation without mustahik's signature |

### 3.2 The specific blockchain primitives Mizaan uses

1. **Solana Attestation Service (SAS)** — schema-bound on-chain attestations with multiple authorities
2. **SPL Tokens (custom IDRZ for MVP, IDRX in production)** — Indonesian Rupiah representation on-chain
3. **Solana Wallet (Phantom + Privy embedded)** — donor and LAZ identity
4. **Helius RPC + DAS API** — read attestations by wallet address
5. **PDA derivation** — deterministic account addresses for donations, distributions, receipts

### 3.3 Why Solana specifically

| Criterion | Solana | Ethereum L1 | Polygon | Arbitrum |
|---|---|---|---|---|
| Transaction cost | $0.0001 | $5–50 | $0.01 | $0.10 |
| Finality | 400ms | 12 minutes | 2s | 1s |
| Indonesian ecosystem | Strong (Superteam ID, IDRX, Pintu) | Weak | Some | None |
| Native attestation primitive | SAS (purpose-built) | EAS | EAS | EAS |
| Hackathon sponsor | **Yes** (Superteam Indonesia) | No | No | No |

Solana wins on cost, finality, ecosystem fit, and hackathon alignment.

### 3.4 The "why not just IDRX/regulatory zakat" defense

> *"Bank Indonesia could regulate IDRX and force LAZ to settle on it."*

True, but:
1. IDRX is the *currency layer*, not the *attestation layer* — Mizaan operates at the latter
2. Bank Indonesia regulates payment rails; Mizaan tracks donor → mustahik linkage which BI does not
3. Even if all LAZ used IDRX, donors would still have no way to verify distribution end-to-end without an attestation chain

Mizaan complements regulated stablecoins like IDRX rather than competing with them.

---

## 4. Target Users (Personas)

### 4.1 P1 — **Sarah, 28, Muslim diaspora in Singapore**

- **Job:** Software engineer at Grab Singapore, originally from Yogyakarta
- **Income:** SGD 8,000/month
- **Zakat behavior today:** Pays SGD 800/year zakat to Singapore LAZ (Majlis Ugama Islam Singapura), not to Indonesia
- **Pain:** Wants to send zakat home to Indonesian relatives' communities, but has no trusted channel — last attempt 5 years ago resulted in unclear distribution and she stopped
- **Win condition:** Connect crypto wallet (USDC/IDRX), donate Rp 1,000,000 to LAZ Yogya, see Pak Yusuf in Bantul received it for school fees, within 24 hours
- **Crypto familiarity:** ✅ Comfortable with Phantom/Metamask
- **Volume estimate:** 500K diaspora muzakki × Rp 5M/year average = Rp 2.5T addressable

### 4.2 P2 — **Ahmad, 34, Local Muslim donor in Surabaya**

- **Job:** Mid-level manager at private company
- **Income:** Rp 18 million/month
- **Zakat behavior today:** Pays Rp 22 million/year zakat mal via Dompet Dhuafa transfer, gets PDF receipt, reads aggregate annual report
- **Pain:** Trusts Dompet Dhuafa generally but wonders specifically — *"my Rp 22 juta last year — what did it actually do?"*
- **Win condition:** Same workflow (transfer to Dompet Dhuafa), but receives in his Mizaan dashboard: "Rp 22M distributed across 87 mustahik — see breakdown"
- **Crypto familiarity:** ❌ Has heard of Bitcoin, never used a wallet
- **Solution:** Privy embedded wallet — login with email/SMS, no seed phrase
- **Volume estimate:** 5M middle-class Indonesian muzakki × Rp 8M/year = Rp 40T addressable

### 4.3 P3 — **Bu Sri, 52, Amil at LAZ Dompet Dhuafa Yogya office**

- **Job:** Distribution coordinator (amil) at regional LAZ branch
- **Pain today:** Distributes Rp 200M/month to ~120 mustahik. Maintains Excel spreadsheet. Audited annually. Donor inquiries answered ad-hoc by phone.
- **Pain with Mizaan:** "Ribet ga sih?" — adoption friction is real
- **Win condition:** Mizaan admin dashboard reduces donor inquiries (donors self-serve via on-chain), provides verifiable distribution proof for annual audit, signals transparency leadership to muzakki
- **Crypto familiarity:** None
- **Solution:** LAZ admin uses standard email-login dashboard; "wallet" abstracted as institutional account

### 4.4 P4 — **Pak Yusuf, 41, Mustahik in Bantul (recipient)**

- **Job:** Smallholder farmer with two school-age children
- **Pain today:** Receives Rp 800,000 quarterly from LAZ for kids' school fees; no way to express gratitude back to specific donor; feels invisible in the system
- **Win condition with Mizaan:** Receives SMS "Anda menerima Rp 800,000 dari LAZ Y untuk biaya sekolah anak Anda. Konfirmasi dengan menekan link." Taps link, opens lightweight web confirmation (no app install). Smiles knowing donors will see his confirmation.
- **Crypto familiarity:** None — can use a basic Android phone
- **Solution:** SMS-based magic link → web confirmation, wallet abstracted entirely (LAZ holds custodial mustahik wallet)

### 4.5 P5 — **Pak Faisal, 38, Diaspora rep / Verifier (NGO)**

- **Job:** Country lead at international Muslim NGO (e.g., Islamic Relief Worldwide Indonesia chapter)
- **Pain today:** Reports back to global HQ on local LAZ partnership impact, currently relies on LAZ-provided figures
- **Win condition:** Independent verification — query Mizaan, get cryptographic proof of distribution
- **Crypto familiarity:** None initially
- **Solution:** Read-only public dashboard

### 4.6 P6 — **Generic Verifier (any Indonesian, any time)**

- **Pain:** Heard about a LAZ scandal, wants to verify donations they made
- **Win condition:** Paste donation reference / wallet address into Mizaan public verify page → see full chain
- **Solution:** Public `/verify/[reference]` page — no login needed

---

## 5. Value Proposition

### 5.1 One-liner per persona

| Persona | Value prop |
|---|---|
| **Diaspora donor (Sarah)** | "Donate from Singapore. See your zakat reach your hometown in 24 hours. Cryptographic receipt." |
| **Local donor (Ahmad)** | "Same LAZ you trust. Now with end-to-end visibility. Free for you." |
| **LAZ amil (Bu Sri)** | "Reduce donor inquiries 80%. Show transparency leadership. No more annual audit headache." |
| **Mustahik (Pak Yusuf)** | "Confirm receipt with one tap. Donors see your gratitude. Dignity preserved (pseudonymous)." |
| **NGO verifier (Pak Faisal)** | "One API call replaces 100 spreadsheet reviews." |
| **Public verifier** | "Verify any donation in 5 seconds. Zero accounts. Zero gatekeepers." |

### 5.2 Core promise (single sentence)

> **"Every Rupiah of zakat in Mizaan has a cryptographic path from donor to recipient. No skim, no fake distribution, no missing accountability."**

### 5.3 Differentiation

| vs Kitabisa | vs BAZNAS SiZakat | vs LAZ private dashboard |
|---|---|---|
| 0% donor fee (Kitabisa charges 5%) | Verifiable by any party (BAZNAS internal only) | Multi-LAZ federation (each LAZ siloed) |
| Cryptographic, not just promise | Tamper-evident, not admin-trustable | Donor sovereignty, not LAZ-owned |
| Multi-LAZ neutral | Cross-LAZ verifiable | Cross-jurisdictional |

---

## 6. Product Scope

### 6.1 In-scope (MVP — V1 ship May 12)

**C-minus scope: Three flow-based donation types.**

| Type | Description | MVP support |
|---|---|---|
| **Zakat (mal + fitrah)** | Religiously obligatory annual donation | ✅ Full |
| **Sedekah** | Voluntary donation, any time | ✅ Full |
| **Infaq** | Donation to mosques/pesantren/causes | ✅ Full |

All three follow the same 3-party attestation pattern; only metadata differs.

### 6.2 Out-of-scope for MVP (deferred to V2+)

| Feature | Why deferred | Roadmap timing |
|---|---|---|
| **Wakaf** (asset endowment) | Different architecture: asset tokenization + recurring yield distribution | V2 (Q3 2026) |
| **Real IDRX integration** | Replaces custom IDRZ; adds OJK compliance complexity | V1.1 (June 2026) |
| **BAZNAS official API integration** | Requires institutional partnership negotiation | V2 |
| **Multi-language Arabic UI** | Polish, not blocking | V1.5 |
| **Tax deduction PDF receipt** | Requires DJP integration | V1.5 |
| **Mosque-level kotak amal IoT** | Hardware partnership needed | V3 |
| **Multi-tier distribution chains** (LAZ → sub-LAZ → mustahik) | Schema complexity | V2 |
| **Recall/dispute mechanism** | Edge case handling | V2 |

### 6.3 Explicit non-goals

- ❌ Mizaan does not interpret fiqh — distribution category logic remains LAZ's responsibility
- ❌ Mizaan does not collect physical zakat (e.g., grain, livestock) — only monetary
- ❌ Mizaan does not replace LAZ operations — we are an attestation layer
- ❌ Mizaan does not handle mustahik need verification — LAZ does that

---

## 7. Core User Flows

### 7.1 Flow A — Donor onboarding & first donation (Sarah, diaspora)

```
1. Sarah lands on mizaan.id (Bahasa default, EN/AR toggle)
2. Hero: "Zakat dengan transparansi penuh. Lacak hingga ke mustahik."
3. CTA "Bayar Zakat Sekarang" → Sarah taps
4. Modal: Select donation type [Zakat Mal | Zakat Fitrah | Sedekah | Infaq]
5. Sarah selects Zakat Mal
6. Calculator: nisab + 2.5% → suggested Rp 22,000,000
7. Connect wallet:
   - Option A: "Saya punya wallet" → Phantom popup
   - Option B: "Belum punya wallet" → Privy email/SMS embedded wallet
8. Sarah selects Option B (no Phantom)
9. Privy: enters email → 6-digit OTP → wallet provisioned (custodial-by-default)
10. LAZ selection: scrollable list with logos, ratings, region
    [Dompet Dhuafa Yogya] [Rumah Zakat Jogja] [LAZ UGM] ...
11. Sarah selects LAZ Dompet Dhuafa Yogya
12. Category preference: ☑ Pendidikan ☐ Kesehatan ☐ Modal usaha ☐ Sandang-pangan ☐ Apa saja
13. Review screen: "Anda akan zakat Rp 22,000,000 ke LAZ Dompet Dhuafa Yogya, prioritas Pendidikan"
14. Confirm → Sarah signs transaction (1 click)
15. SAS attestation #1 created on-chain — *DonationCommitment*
16. Token transfer: 22,000,000 IDRZ from Sarah's wallet → LAZ wallet
17. Success screen: "✓ Zakat dicatat di Solana blockchain. 
                    PDA: 7xKX...bW2. 
                    LAZ akan distribusikan dalam 7 hari kerja.
                    Anda akan menerima notifikasi setiap tahap."
18. Sarah's email: confirmation + dashboard link
```

### 7.2 Flow B — LAZ admin distribution (Bu Sri)

```
1. Bu Sri logs into laz.mizaan.id (email/password — wallet abstracted)
2. Dashboard: incoming donations queue
   [Sarah Y. — Rp 22M — Pendidikan — 2 days ago] [pending assignment]
3. Bu Sri clicks pending row
4. Detail panel:
   - Donor: Sarah (anonymized initials)
   - Amount: Rp 22M IDRZ
   - Category: Pendidikan
   - Donor message: (empty)
5. "Assign to mustahik" button
6. Mustahik picker (LAZ's existing mustahik database + Mizaan registry):
   [Pak Yusuf #1247 — biaya sekolah anak — Bantul]
   [Bu Hadi #1248 — biaya kuliah — Sleman]
   ...
7. Bu Sri selects Pak Yusuf, sets amount: Rp 800,000 (sub-allocation)
8. Detail: "Biaya sekolah Sarah, anak Pak Yusuf, kelas 8 SMP, semester 2"
9. "Process distribution" → Bu Sri signs (LAZ institutional signature)
10. SAS attestation #2 created — *DistributionDecision*
11. Token transfer: 800,000 IDRZ from LAZ wallet → Pak Yusuf custodial wallet
12. SMS to Pak Yusuf: "Anda menerima Rp 800,000 dari LAZ Dompet Dhuafa untuk biaya sekolah. Konfirmasi: mizaan.id/r/abc123"
13. Bu Sri continues to next sub-allocation until Rp 22M fully distributed
```

### 7.3 Flow C — Mustahik confirmation (Pak Yusuf)

```
1. Pak Yusuf receives SMS, taps link
2. Mizaan opens (mobile PWA, lightweight)
3. Page: "Konfirmasi Penerimaan"
   "Anda menerima Rp 800,000 dari LAZ Dompet Dhuafa Yogya
    Untuk: biaya sekolah anak
    Pengirim: muzakki (anonim)
    Kode: 8AB7-1247
    Tanggal kirim: 5 Mei 2026"
4. Two buttons:
   [✓ Saya konfirmasi terima]   [✗ Saya tidak terima]
5. Pak Yusuf taps confirm
6. SAS attestation #3 created — *ReceiptConfirmation*  
   (signed by LAZ on Pak Yusuf's behalf using custodial wallet, with mustahik consent click as off-chain proof)
7. Confirmation: "Terima kasih. Donor akan menerima notifikasi konfirmasi Anda."
8. Optional: "Sampaikan pesan terima kasih (opsional)" — text field
9. If Pak Yusuf writes "Terima kasih atas zakatnya, sangat membantu Sarah belajar"
   → Encrypted message stored, donor can decrypt
10. Public feed updates: "Rp 800,000 → biaya sekolah ✓ confirmed"
    (anonymized, mustahik PII never exposed publicly)
```

### 7.4 Flow D — Donor tracking (Sarah, post-distribution)

```
1. Sarah receives email: "Zakat Anda telah didistribusikan"
2. Taps link → mizaan.id/track/[donor-wallet]
3. Dashboard:
   - Total zakat 2026: Rp 22,000,000
   - Distributed to: 27 mustahik
   - Categories breakdown: 
     * Pendidikan: Rp 9.6M (12 mustahik)
     * Kesehatan: Rp 5.4M (7 mustahik)
     * Modal usaha: Rp 4.0M (5 mustahik)
     * Sandang-pangan: Rp 3.0M (3 mustahik)
   - Confirmation rate: 27/27 (100%)
4. Click any mustahik row → detail
   - "Pak Y. — Bantul — biaya sekolah anak — confirmed 4 hours ago"
   - "Pesan: Terima kasih atas zakatnya, sangat membantu Sarah belajar"
   - On-chain links: donation PDA, distribution PDA, receipt PDA
5. "Bagikan" → Sarah can share aggregate (no PII): 
   "Saya zakat 22M tahun ini, terdistribusi ke 27 mustahik. Lihat: mizaan.id/share/abc"
```

### 7.5 Flow E — Public verifier

```
1. Anyone (no login) lands mizaan.id/verify
2. "Verifikasi donasi: paste wallet, attestation PDA, atau scan QR"
3. Pastes Sarah's wallet
4. See public summary:
   - Wallet 7xKX...bW2 has donated Rp 22M to LAZ X via Mizaan
   - 27 attestations, 100% confirmed
   - Anonymized recipient categories shown
   - No personal info revealed
5. Click any attestation → see chain (anonymized)
```

### 7.6 Flow F — Live public feed (homepage)

```
mizaan.id → scroll past hero
"Aktivitas Live"
[Real-time stream, anonymized]
- "5 mins ago — Rp 250,000 → biaya berobat ✓ confirmed (Surabaya)"
- "12 mins ago — Rp 1,500,000 → modal usaha ✓ confirmed (Bekasi)"
- "23 mins ago — Rp 5,000,000 → biaya sekolah ✓ confirmed (Yogyakarta)"
[Filter: All | Pendidikan | Kesehatan | Modal | Sandang]
```

---

## 8. Functional Requirements

### 8.1 Must-have for V1 (MVP, May 12)

| ID | Requirement | Priority |
|---|---|---|
| F1.01 | Donor can connect via Phantom wallet | P0 |
| F1.02 | Donor can sign up via email/SMS using Privy embedded wallet | P0 |
| F1.03 | Donor can select donation type (zakat mal, zakat fitrah, sedekah, infaq) | P0 |
| F1.04 | Donor can select LAZ from registry | P0 |
| F1.05 | Donor can specify category preference | P0 |
| F1.06 | Donor signs *DonationCommitment* SAS attestation | P0 |
| F1.07 | Donor transfers IDRZ tokens to LAZ wallet | P0 |
| F1.08 | LAZ admin can log into dashboard (email auth) | P0 |
| F1.09 | LAZ admin sees pending donations queue | P0 |
| F1.10 | LAZ admin can assign donation to mustahik(s) with sub-allocation | P0 |
| F1.11 | LAZ admin signs *DistributionDecision* SAS attestation | P0 |
| F1.12 | LAZ admin transfers IDRZ to mustahik wallet | P0 |
| F1.13 | Mustahik receives notification (email/SMS) with confirmation link | P0 |
| F1.14 | Mustahik can confirm receipt via web link (no app install) | P0 |
| F1.15 | LAZ signs *ReceiptConfirmation* attestation on mustahik's behalf | P0 |
| F1.16 | Donor sees donation tracking dashboard with full chain | P0 |
| F1.17 | Public verifier can lookup any wallet/PDA without login | P0 |
| F1.18 | Public homepage shows live anonymized donation feed | P0 |
| F1.19 | Mustahik PII never exposed publicly (pseudonymous default) | P0 |
| F1.20 | All transactions on Solana Devnet via Helius RPC | P0 |
| F1.21 | Custom IDRZ SPL token represents Rupiah on-chain | P0 |
| F1.22 | LAZ registry is on-chain attestation (not centralized DB) | P0 |
| F1.23 | Mustahik registry is on-chain attestation | P0 |
| F1.24 | Bahasa Indonesia UI (default) | P0 |
| F1.25 | English UI toggle | P0 |
| F1.26 | Mobile responsive (PWA) | P0 |

### 8.2 Should-have for V1 (nice-to-have, deprioritize if running out of time)

| ID | Requirement | Priority |
|---|---|---|
| F2.01 | Anonymous donor message ("Pesan dari donor: ...") encrypted | P1 |
| F2.02 | Mustahik can write thank-you message back to donor (encrypted) | P1 |
| F2.03 | Donor receives push notification on each attestation step | P1 |
| F2.04 | Aggregated category dashboard (donor view) | P1 |
| F2.05 | Embeddable widget for mosque/LAZ websites (`<script>` tag) | P1 |
| F2.06 | Social share card (auto-generated OG image with stats) | P1 |
| F2.07 | Multi-LAZ filter on public feed | P1 |
| F2.08 | Donor leaderboard (opt-in only) | P1 |
| F2.09 | Arabic UI toggle | P1 |
| F2.10 | LAZ partner showcase page | P1 |

### 8.3 Could-have for V1 (stretch)

| ID | Requirement | Priority |
|---|---|---|
| F3.01 | PDF receipt with tax-deduction format (DJP-compliant) | P2 |
| F3.02 | QR code generation for offline mustahik confirmation | P2 |
| F3.03 | Bulk donor flow (corporation pays zakat for all employees) | P2 |
| F3.04 | Admin panel for Mizaan team (issue LAZ identity attestations) | P2 |
| F3.05 | Recurring monthly donation auto-debit | P2 |

### 8.4 Won't-have for V1 (explicitly out of scope)

- Wakaf asset tokenization (V2)
- Real IDRX integration (V1.1)
- DJP tax integration (V1.5)
- BAZNAS official API (V2)
- Mainnet deployment (post-hackathon)
- Native mobile apps iOS/Android (PWA only)

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Target |
|---|---|
| Donor scan / verify page load (3G) | < 1.5s |
| Donation flow end-to-end (excl. wallet sign) | < 5s |
| Mustahik confirmation page load | < 1s |
| Live feed update latency | < 30s after attestation finalizes |
| Devnet transaction finality | ~400ms (Solana baseline) |
| Lighthouse Performance Score | ≥ 90 |
| Lighthouse Accessibility Score | ≥ 95 |

### 9.2 Reliability

| Metric | Target |
|---|---|
| Uptime (post-deploy) | 99.5% |
| Wallet connection success rate | ≥ 95% |
| Attestation finalization success rate | ≥ 98% |
| Failed-state recovery | Auto-retry, idempotent |

### 9.3 Privacy & Security

| Requirement | Implementation |
|---|---|
| Mustahik PII never on-chain | Off-chain DB stores name → on-chain stores hash |
| Donor PII never required | Wallet address is sufficient identifier |
| Donor message encryption | Encrypt with mustahik's public key, decrypt with private |
| Email/SMS not stored unencrypted | Privy handles, we don't see raw |
| Public feed anonymization | Show pseudonymous "Pak Y." not full name; categories OK |
| Compliance with UU PDP | Default privacy-preserving; opt-in for any disclosure |
| KYC for diaspora donors | Privy basic KYC (passport for >$1000) |

### 9.4 Internationalization

- Bahasa Indonesia (default) — `id`
- English — `en`
- Arabic — `ar` (stretch goal V1, P1)

### 9.5 Accessibility

- WCAG AA conformance (color contrast, screen reader, keyboard nav)
- Tested with NVDA / VoiceOver on key flows
- Min font size 14px

### 9.6 Cost (operational)

| Cost | MVP | V1 (post-hackathon) |
|---|---|---|
| Solana devnet gas | $0 (free) | $0 |
| Solana mainnet gas (V1.1) | ~$0.0001/tx × 100K tx/month = $10/month | $10 |
| Helius RPC | Free tier (100K req/day) | Pro at $99/month |
| Vercel hosting | Free tier | Pro at $20/month |
| Privy embedded wallet | Free tier (1000 MAU) | Growth at $99/month for 5K MAU |
| Domain (mizaan.id) | $30/year | $30/year |
| **Total V1 monthly** | $0 | ~$220 |

---

## 10. Business Model

### 10.1 Revenue streams (Year-1 projections, post-hackathon production)

| Stream | Pricing | Volume | Y1 revenue | % of mix |
|---|---|---|---|---|
| **LAZ SaaS analytics** | Rp 2.5M/month/LAZ | 50 LAZ | Rp 1.5B | 56% |
| **Diaspora donor platform fee** | 0.5% on cross-border | Rp 100B donations × 0.5% | Rp 500M | 19% |
| **Sharia-compliant DeFi yield share** | 30% take of yield on idle zakat | ~$3M idle × 4% × 30% | Rp 600M | 22% |
| **Premium analytics for muzakki** | Rp 50K/year | 5K subscribers | Rp 250M | 9% |
| **Total Y1** | | | **~Rp 2.85B (~$190K)** | 100% |

### 10.2 Year-3 projection

- 200 LAZ, Rp 1T routed annually
- Y3: ~Rp 15B (~$1M ARR)
- Operating margin: 60% (low-touch SaaS)

### 10.3 Pricing rationale

**0% donor fee** is the marketing wedge. Kitabisa charges 5% which generates muzakki backlash. By charging only LAZ side, Mizaan aligns with Islamic finance principles (no rent on zakat itself).

**LAZ SaaS Rp 2.5M/month** is justified by:
- Reduced donor inquiry handling (50 hours/month staff time saved)
- Annual audit prep automation
- Donor-facing transparency leadership signal
- This is ~10% of typical LAZ admin budget

### 10.4 Unit economics per donation (V1.1 mainnet)

| Component | Cost / Revenue |
|---|---|
| Solana gas (3 attestations) | $0.0003 |
| Helius API calls | ~$0.0001 |
| Privy MAU amortized | $0.001 |
| Customer acquisition (year 1) | ~Rp 5K (organic + LAZ-driven) |
| Revenue per donation (LAZ SaaS amortized) | Rp 2K |
| **Net per donation** | **+Rp 1.5K** |

Profitable on per-unit basis at moderate scale.

### 10.5 Comparison to competitor unit economics

| Platform | Donor fee | LAZ fee | Per-donation margin |
|---|---|---|---|
| Kitabisa | 5% | None | Negative on small donations |
| LAZ direct | 0% | None | LAZ absorbs operational cost |
| **Mizaan** | **0%** | Rp 2.5M/month flat | **Positive at scale, free at small scale** |

---

## 11. Distribution & Go-to-Market

### 11.1 Pre-launch (hackathon period: now → May 12)

- Cold outreach to 5 LAZ + 2 academics + 1 mosque (see §17)
- Goal: ≥ 1 letter of support OR endorsement OR pilot commitment
- Demo video shows real on-chain flow with mocked LAZ if no partner

### 11.2 Phase 1 (Month 1–3 post-hackathon: May–July 2026)

**Target:** 1 LAZ pilot, 100 donors, Rp 500M routed

- Convert hackathon outreach into 1 signed LAZ partnership
- Most likely: smaller regional LAZ (LAZ kampus UGM, LAZ regional Jogja) — easier to convert than national
- Build mustahik registry organically — LAZ adds existing mustahik to Mizaan
- Onboard 100 donors via UGM alumni network (Devrangga's natural reach)
- Goal: Rp 500M routed end-to-end with 100% confirmation rate

### 11.3 Phase 2 (Month 4–9: August 2026 – January 2027)

**Target:** 5 LAZ partners, 5,000 donors, Rp 10B routed

- Sign Dompet Dhuafa or Rumah Zakat regional branch (mid-tier LAZ)
- Launch Privy embedded wallet flow (open to non-crypto-native donors)
- Diaspora outreach: Indonesian Muslim Singapore community, Indonesian Embassy DC, etc.
- Mosque-level pilot: 10 mosques use Mizaan for kotak amal transparency

### 11.4 Phase 3 (Month 10–18: February 2027 – October 2027)

**Target:** 50 LAZ, 100K donors, Rp 100B routed

- Push for Dompet Dhuafa national or BAZNAS regional partnership
- Cross-border attestation: Indonesian Muslim Singapore (MUIS) reads Mizaan chain
- Mainnet deployment with IDRX integration
- Y1 break-even

### 11.5 GTM unfair advantages

| Advantage | Why it matters |
|---|---|
| **Founder authenticity** — UGM Muslim student | Religious community responds to insider |
| **Sahih codebase reuse** | 70% of work done; can iterate fast |
| **Dr. Habib reference** | Academic legitimacy at minimal cost |
| **Hackathon prize visibility** (if won) | Auto-amplification via Superteam network |
| **0% donor fee marketing wedge** | Differentiates from Kitabisa immediately |

### 11.6 GTM risks

| Risk | Mitigation |
|---|---|
| LAZ adoption stalls (institutions slow) | Start with mosque-level (faster, easier) |
| Donor onboarding friction (Privy KYC) | Two paths: Phantom for crypto-native, Privy for masses |
| Mustahik confirmation rate < 80% | LAZ-mediated confirmation as fallback |
| Crypto-skeptical religious community | Frame as "transparansi", never as "crypto" or "Web3" |

---

## 12. Regulatory Considerations

### 12.1 Indonesian regulation matrix

| Regulation | Implication for Mizaan |
|---|---|
| **UU 23/2011 — Pengelolaan Zakat** | BAZNAS is national authority; LAZ must be registered. Mizaan complements (does not replace) registered LAZ. |
| **POJK 13/2018 — Penyelenggaraan Layanan Pinjam Meminjam Berbasis Teknologi Informasi** | Not applicable (not lending) |
| **POJK Kripto / Bappebti CFX 2024** | If we accept IDRX or USDC as currency, we must use registered exchanges. Initial: SOL/IDRZ devnet only. V1.1: route fiat through IDRX licensed issuer. |
| **UU PDP / Personal Data Protection 27/2022** | Critical: no mustahik PII on-chain. All on-chain data is hashed. Off-chain DB requires consent + secure storage. |
| **Fatwa MUI 11/2012 — Kedudukan Pemberi Zakat dalam Penerimaan Manfaat** | Donor's right to know distribution does not violate mustahik privacy if mustahik consents. Mizaan respects this with opt-in. |
| **Fatwa DSN-MUI No. 116/DSN-MUI/IX/2017 — Uang Elektronik Syariah** | Sharia-compliant tokenization aligns with this (no riba, gharar, maysir). |

### 12.2 Sharia compliance principles followed

1. **No riba (interest):** Mizaan does not charge donors; LAZ fee is service fee, not interest
2. **No gharar (excessive uncertainty):** All flows transparent and verifiable
3. **No maysir (gambling):** No speculative element
4. **Asnaf preservation:** 8 categories of mustahik recognized in schema
5. **Mustahik dignity:** Default pseudonymous; opt-in disclosure only

### 12.3 Required compliance actions for V1 production (post-hackathon)

| Action | Timing |
|---|---|
| Register PT (Indonesian limited company) | M3 |
| Engage Sharia compliance advisor (DSN-MUI consultant) | M3 |
| Submit fatwa request to DSN-MUI for blockchain attestation methodology | M6 |
| Obtain BAZNAS endorsement letter | M9 |
| Apply for OJK regulatory sandbox if accepting IDRX/USDC | M12 |

For hackathon submission: none required (devnet only, no real funds, demo project).

---

## 13. Competitive Landscape

### 13.1 Direct competitors

| Competitor | Strength | Weakness | Mizaan advantage |
|---|---|---|---|
| **Kitabisa.com** | 18M users, mobile app, brand | 5% fee, no cryptographic proof | 0% fee + cryptographic proof |
| **BAZNAS Online** | Government endorsement | Centralized, single LAZ | Multi-LAZ federation |
| **Dompet Dhuafa Online** | Strong LAZ brand | Single LAZ, no cross-LAZ donor | Multi-LAZ neutral |
| **ACT Indonesia** | Was strong, post-2022 controversy | Brand damaged | Trust by design (not by claim) |

### 13.2 Indirect competitors / adjacent

| Adjacent | Description | Threat? |
|---|---|---|
| **GoPay donation feature** | One-tap mosque donation | No — not LAZ-routed, no transparency |
| **OVO Charity** | Same as GoPay | No |
| **Bank Mandiri Syariah** | Zakat via mobile banking | No — banking rail only, no transparency |
| **Crypto for Good initiatives globally** | E.g., Rumie Foundation, Endaoment | Different market (US/EU) |

### 13.3 Why nobody has built this yet

1. **Founder-market fit gap:** Crypto-native Indonesian Muslims with technical skills are rare
2. **Religious sensitivity:** Many Web3 founders avoid religious products to dodge complexity
3. **Regulatory uncertainty:** Until UU PDP and Sharia stablecoins matured (2023+), unsafe to build
4. **Solana SAS launched:** SAS only stable since late 2024 — opportunity is fresh
5. **Dr. Habib's framework recent:** Concept articulation is recent academic work

This is a **clear founder-shaped hole in the market** — Devrangga fits perfectly.

### 13.4 The BAZNAS internal exploration question

> *"What if BAZNAS builds this themselves?"*

Reality check:
- BAZNAS is institutional and slow — research/conference mode
- Internal IT team is not crypto-native
- Has been "exploring" since at least 2023 (Dr. Habib talk evidence)
- Procurement cycle: 12+ months minimum for new tech
- **Mizaan can ship MVP in 7 days. BAZNAS cannot ship in 7 months.**

Furthermore, Mizaan is **complementary**, not replacement — BAZNAS could adopt Mizaan as their tooling layer, win-win positioning.

---

## 14. Success Metrics

### 14.1 North Star Metric

**End-to-End Confirmation Rate (EECR)**

`EECR = (number of donations with all 3 attestations finalized) / (total donations)`

This single number proves: (a) donors trust the platform enough to start, (b) LAZ is processing distributions, (c) mustahiks are reachable and confirming.

### 14.2 Hackathon submission metrics (May 12)

| Metric | Target |
|---|---|
| Live MVP URL (Vercel) | ✅ deployed |
| GitHub repo public | ✅ |
| Functional core flow (donor → LAZ → mustahik → donor) | 100% |
| Demo video ≤ 3 min | ✅ |
| Pitch deck ≤ 12 slides | ✅ |
| Real on-chain transactions in demo | ≥ 3 |
| LAZ outreach sent | 5+ |
| Endorsements received | ≥ 1 (academic OR LAZ OR mosque) |
| Lighthouse score ≥ 90 | ✅ |
| Multilingual id/en working | ✅ |
| Submission to Superteam | ✅ |
| Submission to Colosseum Frontier | ✅ (mandatory) |

### 14.3 Phase 1 metrics (Month 1–3 post-hackathon)

| Metric | Target |
|---|---|
| LAZ partners signed | 1 |
| Donors onboarded | 100 |
| Donations attested | 500 |
| EECR | ≥ 80% |
| Total value routed | Rp 500M |
| Mustahik confirmations within 7 days | ≥ 70% |

### 14.4 Phase 2 metrics (Month 4–9)

| Metric | Target |
|---|---|
| LAZ partners | 5 |
| Donors onboarded | 5,000 |
| Donations attested | 25,000 |
| EECR | ≥ 85% |
| Total value routed | Rp 10B |
| Diaspora donors | ≥ 100 |

### 14.5 Lagging metrics

- Donor NPS (should be > 50)
- LAZ partner retention (should be 100% in Phase 1)
- Cost per donation (should decrease with volume)
- Sharia compliance audit pass (annual)

---

## 15. Risks & Mitigations

### 15.1 Hackathon-specific risks (next 7 days)

| Risk | Severity | Mitigation |
|---|---|---|
| **No LAZ partner replies in time** | High | Use academic endorsement + mosque-level pilot. Mock LAZ Demo branded clearly. |
| **Solana devnet outage** | Medium | Dual RPC: Helius primary + public Solana RPC fallback |
| **Privy embedded wallet flakiness** | Medium | Phantom-only path as fallback; document edge cases |
| **IDRZ token mint complexity** | Low | Use battle-tested `@solana/spl-token` CLI; backup plan: just use SOL with Rupiah labels |
| **Demo recording fails Day 7** | Medium | Pre-record core flow Day 5; final cut Day 7 |
| **Vercel deploy issues** | Low | Test deploy by Day 3; use Sahih's working setup as template |
| **Devrangga falls sick / time pressure** | High | Build MVP (Tier 1-2) by Day 4 — buffer for polish |

### 15.2 Product risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Mustahik confirmation rate < 50%** | Critical | LAZ-mediated confirmation; SMS retry; QR for offline |
| **LAZ refuses to use platform** | Critical | Mosque-level alternative; subsidize first 3 LAZ |
| **Donor distrusts mustahik anonymization** | Medium | Default pseudonymous, opt-in disclosure |
| **Mustahik PII leak** | Critical | No PII on-chain; encrypted off-chain; PDP-compliant |
| **MUI/BAZNAS objection** | High | Position as infrastructure; engage early; offer co-attestation role |

### 15.3 Strategic risks

| Risk | Severity | Mitigation |
|---|---|---|
| **BAZNAS builds own version** | Medium | Move faster; offer Mizaan as their tooling |
| **Government regulation changes** | Medium | Position as PDP-compliant + Sharia-compliant |
| **Crypto winter / Solana crash** | Medium | Stack is portable to any L1 with attestation primitives |
| **Pinjol-style backlash on Web3** | High | Frame as "transparansi", not "crypto"; no donor speculation element |

### 15.4 Existential threats

| Threat | Probability | Response |
|---|---|---|
| Indonesian government bans crypto entirely | Low | Mizaan can pivot to permissioned chain; attestation logic preserves |
| Sharia advisory body forbids attestation methodology | Low | Engage DSN-MUI early; obtain fatwa |
| Major LAZ launches competing platform | Medium | Federate, don't compete; offer Mizaan as their tooling |

---

## 16. Roadmap

### 16.1 V1 — Hackathon ship (May 12, 2026)

**Scope:** MVP+++ (Tier 5 polish)
- Full donor → LAZ → mustahik → donor flow
- Zakat + Sedekah + Infaq
- Custom IDRZ SPL token on devnet
- Phantom + Privy wallet support
- Bahasa + English UI
- Mobile PWA
- Live public feed
- Public verifier
- Multi-LAZ registry (mocked initially)
- Polished demo video + pitch deck

### 16.2 V1.1 — Production-readiness (June 2026)

- Real IDRX integration (replaces IDRZ)
- Mainnet deployment with security audit
- DJP tax-deduction PDF receipt
- Privy production tier with KYC
- 1 LAZ pilot live
- 100 donor onboarding

### 16.3 V1.5 — Polish + reach (July–September 2026)

- Arabic UI
- Mosque-level dashboard widget
- Embeddable widget for LAZ websites
- Bulk corporate donation flow
- Recurring monthly auto-debit
- Reputation/rating system for LAZ (donor-driven)

### 16.4 V2 — Wakaf vertical (Q4 2026)

- Wakaf asset tokenization (cash + property metadata)
- Yield distribution flow (productive wakaf)
- Multi-tier distribution chains
- Wakaf-specific fatwa compliance review

### 16.5 V3 — Infrastructure expansion (2027)

- Cross-border zakat (Indonesia ↔ Singapore, Indonesia ↔ Malaysia)
- BAZNAS national partnership
- IoT-enabled kotak amal (mosque hardware)
- Full chain federation with regional Islamic charities

---

## 17. Endorsement & Outreach Strategy

### 17.1 Day 1 outreach plan (executable in <30 minutes)

5 contact points, all pre-templated in Bahasa Indonesia (and English for Dr. Habib):

| # | Target | Template | Goal |
|---|---|---|---|
| 1 | 5 major LAZ (Dompet Dhuafa, Rumah Zakat, IZI, ACT, BAZNAS Pusat) | Indonesian formal letter (provided) | ≥ 1 reply expressing interest |
| 2 | 1-2 UGM Sharia Economics professors | Indonesian academic register | Letter of academic support |
| 3 | Dr. Farrukh Habib via LinkedIn | English, references his Puskas BAZNAS talk | Endorsement / brief feedback call |
| 4 | Puskas BAZNAS official email | Indonesian institutional register | Validation of concept alignment |
| 5 | UGM mosque imam / takmir | Indonesian, personal/warm | Religious endorsement / restu |

### 17.2 Outreach success scenarios

| Scenario | Probability | Pitch impact |
|---|---|---|
| 0 replies | 30% | Show 5 cold-email screenshots as outreach evidence |
| 1 academic reply | 35% | Letter of support in pitch deck |
| 1 mosque/local reply | 15% | Local pilot commitment |
| 1 LAZ reply (regional) | 10% | LAZ pilot commitment |
| 1 LAZ reply (national) | 5% | Killer pitch — major partnership |
| Dr. Habib responds | 5% | International academic legitimacy |

### 17.3 Outreach execution timeline

```
Day 1 morning (08:00–08:30):
  □ Draft already prepared, just swap names
  □ Send 5 LAZ emails
  □ Send 1-2 UGM professor emails
  □ Send Puskas BAZNAS email
  □ Connect Dr. Habib on LinkedIn + send DM
  □ Email/visit UGM mosque imam

Day 1 evening (17:00):
  □ Check inbox for any replies
  □ If reply received, respond same-day with grateful tone

Day 2-7:
  □ Daily inbox check
  □ Respond promptly to any reply
  □ Follow-up email Day 4 if no reply (single follow-up only)

Day 7 final pitch deck:
  □ Include any received endorsements
  □ Include screenshots of outreach as evidence of effort
```

### 17.4 Backup plans if outreach yields nothing

1. **Position as "open infrastructure"** — emphasizes Mizaan is open for any LAZ to adopt
2. **Use UGM affiliation as institutional backing** — Devrangga is UGM student, project is UGM-aligned
3. **Pitch deck includes outreach screenshots** — shows hustle even without replies
4. **Mock LAZ "LAZ Demo Mizaan"** clearly labeled as demonstration

---

## 18. Open Questions

These are decisions deferred until after MVP ships, or pending external input.

### 18.1 Product

- [ ] Should mustahik real names ever be exposed (donor sees with mustahik consent), or always pseudonymous?
- [ ] Should donors be able to message mustahiks before distribution (request specific category)?
- [ ] How granular should categories be? (Currently: 5. Should we allow custom?)
- [ ] Should LAZ be able to bid for donor's category preference?

### 18.2 Tokenomics

- [ ] Should there be a Mizaan token (governance / fee discount)?
- [ ] Should there be staking for LAZ verification (slash on misbehavior)?
- [ ] Yield-sharing mechanism for sharia-compliant DeFi parking?

### 18.3 Governance

- [ ] Who can issue LAZ identity attestations? (Currently: Mizaan team. Eventually: BAZNAS?)
- [ ] How do we handle LAZ misconduct? (Slash, blacklist, dispute mechanism?)
- [ ] Multi-sig for LAZ admin operations?

### 18.4 Regulatory

- [ ] Engage DSN-MUI for fatwa on attestation methodology — when?
- [ ] Apply for OJK regulatory sandbox — when (V1.1)?
- [ ] Privacy Impact Assessment under UU PDP — required before V1.1

### 18.5 Strategic

- [ ] Position as standalone Mizaan or as part of larger Sahih credential platform later?
- [ ] Open-source the codebase or keep proprietary?
- [ ] Partner with which fintech (GoPay, OVO, Bank Syariah) for fiat on-ramp?

---

## Appendix A — Glossary

| Term | Meaning |
|---|---|
| **Zakat** | Religiously obligatory donation, 2.5% of wealth annually |
| **Sedekah** | Voluntary donation, any amount, any time |
| **Infaq** | Donation to mosque/pesantren/causes |
| **Wakaf** | Asset endowment producing perpetual benefit (deferred to V2) |
| **Mustahik** | Recipient of zakat (one of 8 asnaf categories) |
| **Asnaf** | The 8 categories of zakat recipients per Quran 9:60 |
| **Muzakki** | Zakat payer |
| **Amil** | LAZ administrator who collects/distributes zakat |
| **LAZ** | Lembaga Amil Zakat — registered zakat-collecting institution |
| **BAZNAS** | National zakat agency, Kementerian Agama oversight |
| **Puskas BAZNAS** | BAZNAS research center |
| **MUI** | Majelis Ulama Indonesia (religious authority) |
| **DSN-MUI** | Dewan Syariah Nasional-MUI (sharia compliance authority) |
| **UU 23/2011** | Indonesian zakat law |
| **UU PDP** | Personal Data Protection Law 27/2022 |
| **SAS** | Solana Attestation Service — purpose-built attestation primitive |
| **PDA** | Program-Derived Address — deterministic Solana account |
| **IDRZ** | Custom SPL token, Rupiah-equivalent on devnet (Mizaan-issued for MVP) |
| **IDRX** | Real Indonesian Rupiah stablecoin on Solana, OJK-regulated (V1.1+) |
| **Privy** | Embedded wallet provider — email/SMS login → custodial wallet |
| **Helius** | Solana RPC provider with DAS API |
| **EECR** | End-to-End Confirmation Rate — Mizaan's North Star Metric |

---

## Appendix B — References

1. BAZNAS, *Outlook Zakat Indonesia 2024*, Pusat Kajian Strategis BAZNAS
2. BPS, *Statistik Indonesia 2024*, Sensus Penduduk
3. Dr. Farrukh Habib, *"Zakat on Blockchain"* presentation, Puskas BAZNAS, 2024 (referenced video)
4. UU No. 23 Tahun 2011 tentang Pengelolaan Zakat
5. UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi
6. Fatwa MUI No. 11/2012 tentang Kedudukan Pemberi Zakat
7. Fatwa DSN-MUI No. 116/DSN-MUI/IX/2017 tentang Uang Elektronik Syariah
8. Solana Attestation Service Documentation, https://attest.solana.com
9. IDRX whitepaper, IDRX.co
10. Sahih PRD (predecessor project), `/Users/devranggahazzamahiswara/Documents/Dev OS/Hackathon Projects/sahih/PRD.md`
11. Halal Chain PRD (sister-vertical reference), `/Users/devranggahazzamahiswara/Documents/Dev OS/Hackathon Projects/halal-chain-prd.md`

---

## Appendix C — Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-05 | Mizaan name selected (over Zaqat) | "Scale/balance" meaning, more elegant brand |
| 2026-05-05 | Scope C-minus (zakat + sedekah + infaq, wakaf deferred) | Tier 5 polish achievable; wakaf complexity not warranted for MVP |
| 2026-05-05 | Pseudonymous default for mustahik (B) | Privacy-first, opt-in disclosure |
| 2026-05-05 | Standalone framing, not part of Sahih platform | Avoid Sahih's "half-state" mistake; tight focus |
| 2026-05-05 | Custom SPL Token "IDRZ" via Helius RPC (not real IDRX) | $0 cost; full control; production migration path documented |
| 2026-05-05 | Tier 5 polish target, fallback Tier 4 | Aim high, accept Tier 4 if needed |
| 2026-05-05 | Day 1 outreach: 5 LAZ + 2 prof + 1 mosque + Dr. Habib + Puskas | <30 min effort, infinite upside |
| 2026-05-05 | New repo `mizaan` separate from `sahih` | Clean narrative; reuse components without history pollution |

---

*End of PRD. See companion document SRS.md for technical specifications.*
