-- FairDrive Initial Schema
-- "Glassdoor for car prices" — community-reported OTD pricing

-- ============================================================
-- 1. REGIONS
-- ============================================================
CREATE TABLE regions (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,               -- "Vancouver"
  province    TEXT NOT NULL,               -- "BC"
  country     TEXT NOT NULL DEFAULT 'CA',  -- ISO 3166-1 alpha-2
  slug        TEXT NOT NULL UNIQUE,        -- "vancouver-bc"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_regions_slug ON regions (slug);

-- ============================================================
-- 2. VEHICLES  (make / model / year / trim hierarchy)
-- ============================================================
CREATE TABLE makes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,        -- "Toyota"
  slug        TEXT NOT NULL UNIQUE,        -- "toyota"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE models (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  make_id     BIGINT NOT NULL REFERENCES makes (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,               -- "RAV4"
  slug        TEXT NOT NULL,               -- "rav4"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (make_id, slug)
);

CREATE INDEX idx_models_make ON models (make_id);

CREATE TABLE trims (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_id    BIGINT NOT NULL REFERENCES models (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,               -- "XLE AWD"
  slug        TEXT NOT NULL,               -- "xle-awd"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (model_id, slug)
);

CREATE INDEX idx_trims_model ON trims (model_id);

-- ============================================================
-- 3. USERS  (auth.users link — Apple / Google sign-in)
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name    TEXT,                    -- nullable, anon by default
  home_region_id  BIGINT REFERENCES regions (id),
  currency        TEXT NOT NULL DEFAULT 'CAD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. SUBMISSIONS  (the core data — what people paid)
-- ============================================================
CREATE TYPE condition_type AS ENUM ('new', 'used');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');

CREATE TABLE submissions (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES profiles (id),

  -- Vehicle info
  condition           condition_type NOT NULL DEFAULT 'new',
  make_id             BIGINT NOT NULL REFERENCES makes (id),
  model_id            BIGINT NOT NULL REFERENCES models (id),
  trim_id             BIGINT REFERENCES trims (id),        -- optional
  year                SMALLINT NOT NULL CHECK (year >= 2000 AND year <= 2030),

  -- Pricing
  msrp                INTEGER NOT NULL CHECK (msrp > 0),   -- in cents
  otd_price           INTEGER NOT NULL CHECK (otd_price > 0),
  currency            TEXT NOT NULL DEFAULT 'CAD',

  -- Location + date
  region_id           BIGINT NOT NULL REFERENCES regions (id),
  purchase_date       DATE NOT NULL,

  -- Verification
  verification        verification_status NOT NULL DEFAULT 'unverified',
  receipt_storage_key TEXT,                                 -- Supabase Storage path

  -- Community signals
  upvotes             INTEGER NOT NULL DEFAULT 0,
  downvotes           INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_vehicle ON submissions (make_id, model_id, year);
CREATE INDEX idx_submissions_region  ON submissions (region_id);
CREATE INDEX idx_submissions_date    ON submissions (purchase_date DESC);
CREATE INDEX idx_submissions_user    ON submissions (user_id);

-- ============================================================
-- 5. VOTES  (one vote per user per submission)
-- ============================================================
CREATE TABLE votes (
  user_id       UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  submission_id BIGINT NOT NULL REFERENCES submissions (id) ON DELETE CASCADE,
  vote          SMALLINT NOT NULL CHECK (vote IN (-1, 1)),  -- -1 = down, 1 = up
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, submission_id)
);

-- ============================================================
-- 6. AGGREGATE PRICES  (materialized view for fast lookups)
-- ============================================================
CREATE MATERIALIZED VIEW aggregate_prices AS
SELECT
  s.make_id,
  s.model_id,
  s.trim_id,
  s.year,
  s.region_id,
  s.condition,
  COUNT(*)                                          AS total_reports,
  COUNT(*) FILTER (WHERE s.verification = 'verified') AS verified_reports,

  -- Weighted median approximation: percentiles
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.otd_price) AS median_otd,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY s.otd_price) AS p25_otd,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY s.otd_price) AS p75_otd,
  MIN(s.otd_price)                                  AS min_otd,
  MAX(s.otd_price)                                  AS max_otd,

  AVG(s.msrp)::INTEGER                              AS avg_msrp,
  AVG(s.otd_price)::INTEGER                         AS avg_otd,

  -- Markup stats
  AVG((s.otd_price - s.msrp)::NUMERIC / s.msrp * 100)::NUMERIC(5,2) AS avg_markup_pct,

  MAX(s.created_at)                                 AS last_submission_at
FROM submissions s
WHERE s.purchase_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY s.make_id, s.model_id, s.trim_id, s.year, s.region_id, s.condition;

CREATE UNIQUE INDEX idx_agg_prices_lookup
  ON aggregate_prices (make_id, model_id, year, region_id, condition, trim_id);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

-- Regions & vehicles: public read
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read regions" ON regions FOR SELECT USING (true);

ALTER TABLE makes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read makes" ON makes FOR SELECT USING (true);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read models" ON models FOR SELECT USING (true);

ALTER TABLE trims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read trims" ON trims FOR SELECT USING (true);

-- Profiles: users can read/update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Submissions: public read, authenticated insert, owner update
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated insert submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update submissions" ON submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Votes: authenticated insert/update own
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 8. HELPER FUNCTION: refresh aggregates
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_aggregate_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY aggregate_prices;
END;
$$;
