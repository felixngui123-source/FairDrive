# FairDrive

**Glassdoor for car prices** — a community-driven platform where car buyers anonymously report what they actually paid (out-the-door), so others can negotiate from a position of knowledge.

No dealer influence, ever.

## Screenshots

> Coming soon — the app is in active MVP development.

## How It Works

1. **Search** for a vehicle by make, model, year, and region
2. **See the fair price** — median OTD, distribution histogram, trim breakdown, and recent community submissions
3. **Report your deal** — anonymously share what you paid with an optional verified receipt for 5x weight
4. **Help others negotiate** — every submission strengthens the dataset for future buyers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Routing | expo-router (file-based) |
| Backend | Supabase (Postgres, Auth, Storage) |
| Auth | Supabase email OTP (magic link) |
| Fonts | Fraunces (serif), Inter (sans), JetBrains Mono (mono) |
| Design | Editorial financial minimalism |

## Project Structure

```
FairDrive/
├── app/
│   ├── _layout.tsx              # Root layout, font loading, splash screen
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigator (Search, Results, Report, Settings)
│       ├── index.tsx            # Search screen — cascading dropdowns, trending
│       ├── results.tsx          # Results screen — price hero, histogram, submissions
│       ├── report.tsx           # Report screen — 8-field form, live markup preview
│       └── settings.tsx         # Settings screen — auth, region picker, about
├── components/
│   └── PickerModal.tsx          # Reusable slide-up picker sheet
├── constants/
│   ├── theme.ts                 # Design tokens — colors, fonts, spacing, typography
│   ├── vehicles.ts              # 20 makes, ~200 models (local for instant dropdowns)
│   └── regions.ts               # 15 Canadian metro regions
├── lib/
│   ├── supabase.ts              # Supabase client config
│   └── queries.ts               # All data fetching + insert functions
├── supabase/
│   ├── migrations/
│   │   └── 00001_initial_schema.sql  # Full DB schema, RLS policies, materialized view
│   └── seed.sql                 # Seed data for makes, models, regions
├── app.json                     # Expo config
├── eas.json                     # EAS Build profiles
├── package.json
└── tsconfig.json
```

## Database Schema

### Tables

- **regions** — 15 Canadian metro areas (Vancouver, Toronto, Montreal, etc.)
- **makes** — 20 car manufacturers (Toyota, Honda, Ford, Tesla, BMW, etc.)
- **models** — ~200 vehicle models linked to makes
- **trims** — vehicle trim levels linked to models
- **profiles** — user profiles linked to Supabase Auth
- **submissions** — the core data: what people paid (MSRP, OTD price, condition, verification status)
- **votes** — community upvote/downvote on submissions

### Materialized View

**`aggregate_prices`** powers the Results screen with pre-computed stats:
- Median, P25, P75, min, max OTD prices
- Average MSRP and markup percentage
- Verified vs total report counts
- 90-day rolling window, grouped by make/model/trim/year/region/condition

### Key Design Decisions

- **Prices stored in cents** (integers) to avoid floating-point issues
- **Row Level Security** on all tables: public read, authenticated insert, owner-only update
- **Slugs** used throughout for URL-friendly identifiers that map between local data and Supabase

## Screens

### Search (Home)

- Editorial hero with tagline
- New/Used condition toggle
- Cascading dropdowns: Make → Model → Year → Region
- "See fair price" CTA navigates to Results with all params
- Trending section fetches top vehicles from Supabase (falls back to placeholders)

### Results

- Big serif median OTD price display
- Trust bar (verified count, unverified count, time window)
- Distribution histogram (10 bars generated from percentile data)
- Negotiation tip card with P25–P75 range
- Trim breakdown table
- Recent submissions list with filter pills (All, Verified, Last 30 days, Lowest OTD)
- Loading, empty, and no-params states with CTAs

### Report

- 8-field form: condition, year, make, model, trim (optional), region, purchase date, MSRP, OTD
- Live markup preview with color shift: green (≤5%), amber (≤12%), red (>12%)
- Verdict labels: "Good deal", "Fair price", "Above market"
- Supabase insert on submit with validation and auth error handling
- Verification upload placeholder (receipt for 5x weight)

### Settings

- Supabase email OTP sign-in / sign-out
- Session-aware UI (avatar, email, submission count when signed in)
- Home region picker
- Your data section (report count, export, delete account)
- About section with app philosophy explainers
- Footer: "Independent. Never dealer-funded."

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Install

```bash
cd FairDrive
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/00001_initial_schema.sql` in the SQL Editor
3. Run `supabase/seed.sql` in the SQL Editor
4. Update `lib/supabase.ts` with your project URL and publishable (anon) key

### EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

## Design System

The app uses an editorial financial aesthetic with three font families:

- **Fraunces** (serif) — big price displays, headlines, editorial moments
- **Inter** (sans) — UI text, body copy, labels, buttons
- **JetBrains Mono** (mono) — all numeric data, prices in tables, stats

Color palette is intentionally restrained: near-white backgrounds, near-black text, one signature green accent (`#1B6B4A`) used sparingly for trust signals and CTAs.

## Data Flow

```
Search Screen                Results Screen              Report Screen
     │                            │                           │
     │  router.push(/results)     │                           │
     │  with params ─────────────>│                           │
     │                            │                           │
     │                   fetchAggregatePrices()                │
     │                   fetchSubmissions()                    │
     │                            │                           │
     │                   aggregate_prices ◄──── materialized view
     │                   submissions table ◄──── insertSubmission()
     │                            │                           │
     │                            │                           │
     │                            │     router.push(/report)  │
     │                            │ ─────────────────────────>│
     │                            │                           │
     │                            │              Supabase insert
     │                            │              (requires auth)
```

## Roadmap

- [ ] Apple / Google social sign-in
- [ ] Receipt upload + auto-redaction for verified submissions
- [ ] Price alerts (notify when new data matches your search)
- [ ] Weekly digest emails
- [ ] Data export
- [ ] Expand beyond Canada (US markets)
- [ ] Used car mileage + condition fields
- [ ] Dealer markup trend charts over time

## License

Private — not open source.

---

*Built with care in Vancouver, BC.*
