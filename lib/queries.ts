import { supabase } from "./supabase";

// ── Types ──────────────────────────────────────────────────────

export type AggregatePrice = {
  make_id: number;
  model_id: number;
  trim_id: number | null;
  year: number;
  region_id: number;
  condition: "new" | "used";
  total_reports: number;
  verified_reports: number;
  median_otd: number;
  p25_otd: number;
  p75_otd: number;
  min_otd: number;
  max_otd: number;
  avg_msrp: number;
  avg_otd: number;
  avg_markup_pct: number;
  last_submission_at: string;
};

export type Submission = {
  id: number;
  condition: "new" | "used";
  year: number;
  msrp: number;
  otd_price: number;
  currency: string;
  purchase_date: string;
  verification: "unverified" | "pending" | "verified";
  upvotes: number;
  downvotes: number;
  created_at: string;
  trim: { name: string } | null;
  region: { name: string; province: string } | null;
};

export type SearchParams = {
  makeSlug: string;
  modelSlug: string;
  year?: string;
  regionSlug: string;
  condition: "new" | "used";
};

// ── Resolve slugs to IDs ───────────────────────────────────────

async function resolveIds(params: SearchParams) {
  const { data: make } = await supabase
    .from("makes")
    .select("id")
    .eq("slug", params.makeSlug)
    .single();

  if (!make) return null;

  const { data: model } = await supabase
    .from("models")
    .select("id")
    .eq("make_id", make.id)
    .eq("slug", params.modelSlug)
    .single();

  if (!model) return null;

  const { data: region } = await supabase
    .from("regions")
    .select("id")
    .eq("slug", params.regionSlug)
    .single();

  return {
    makeId: make.id as number,
    modelId: model.id as number,
    regionId: region?.id as number | undefined,
  };
}

// ── Fetch aggregate prices ─────────────────────────────────────

export async function fetchAggregatePrices(params: SearchParams) {
  const ids = await resolveIds(params);
  if (!ids) return { overall: null, byTrim: [] };

  // Overall aggregate (trim_id IS NULL means all trims combined, but
  // the materialized view groups by trim_id, so we query all and compute)
  let query = supabase
    .from("aggregate_prices")
    .select("*")
    .eq("make_id", ids.makeId)
    .eq("model_id", ids.modelId)
    .eq("condition", params.condition);

  if (params.year) {
    query = query.eq("year", parseInt(params.year, 10));
  }
  if (ids.regionId) {
    query = query.eq("region_id", ids.regionId);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return { overall: null, byTrim: [] };

  // Compute overall summary across all trims
  const totalReports = data.reduce((s, r) => s + r.total_reports, 0);
  const verifiedReports = data.reduce((s, r) => s + r.verified_reports, 0);

  // Weighted median: use the row with the most reports as best approximation,
  // or the overall average if there's just one row
  const primaryRow = data.reduce((best, r) =>
    r.total_reports > best.total_reports ? r : best
  );

  const overall: AggregatePrice = {
    ...primaryRow,
    total_reports: totalReports,
    verified_reports: verifiedReports,
    min_otd: Math.min(...data.map((r) => r.min_otd)),
    max_otd: Math.max(...data.map((r) => r.max_otd)),
  };

  // By-trim breakdown: resolve trim names
  const trimIds = data
    .filter((r) => r.trim_id != null)
    .map((r) => r.trim_id);

  let trimMap: Record<number, string> = {};
  if (trimIds.length > 0) {
    const { data: trims } = await supabase
      .from("trims")
      .select("id, name")
      .in("id", trimIds);
    if (trims) {
      trimMap = Object.fromEntries(trims.map((t) => [t.id, t.name]));
    }
  }

  const byTrim = data
    .filter((r) => r.trim_id != null)
    .map((r) => ({
      ...r,
      trimName: trimMap[r.trim_id!] ?? "Unknown",
    }))
    .sort((a, b) => b.total_reports - a.total_reports);

  return { overall, byTrim };
}

// ── Fetch recent submissions ───────────────────────────────────

export async function fetchSubmissions(
  params: SearchParams,
  options: { limit?: number; verifiedOnly?: boolean } = {}
) {
  const ids = await resolveIds(params);
  if (!ids) return [];

  const { limit = 20, verifiedOnly = false } = options;

  let query = supabase
    .from("submissions")
    .select(
      `id, condition, year, msrp, otd_price, currency, purchase_date,
       verification, upvotes, downvotes, created_at,
       trim:trims(name),
       region:regions(name, province)`
    )
    .eq("make_id", ids.makeId)
    .eq("model_id", ids.modelId)
    .eq("condition", params.condition)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (params.year) {
    query = query.eq("year", parseInt(params.year, 10));
  }
  if (ids.regionId) {
    query = query.eq("region_id", ids.regionId);
  }
  if (verifiedOnly) {
    query = query.eq("verification", "verified");
  }

  const { data, error } = await query;
  if (error) return [];

  return (data ?? []) as unknown as Submission[];
}

// ── Fetch makes / models / trims from Supabase ─────────────────

export async function fetchMakes() {
  const { data } = await supabase
    .from("makes")
    .select("id, slug, name")
    .order("name");
  return data ?? [];
}

export async function fetchModels(makeId: number) {
  const { data } = await supabase
    .from("models")
    .select("id, slug, name")
    .eq("make_id", makeId)
    .order("name");
  return data ?? [];
}

export async function fetchTrims(modelId: number) {
  const { data } = await supabase
    .from("trims")
    .select("id, slug, name")
    .eq("model_id", modelId)
    .order("name");
  return data ?? [];
}

export async function fetchRegions() {
  const { data } = await supabase
    .from("regions")
    .select("id, slug, name, province")
    .order("name");
  return data ?? [];
}

// ── Insert a submission ────────────────────────────────────────

export type SubmissionInput = {
  condition: "new" | "used";
  makeSlug: string;
  modelSlug: string;
  trimId?: number | null;
  year: number;
  msrpDollars: number;
  otdDollars: number;
  regionSlug: string;
  purchaseDate: string; // YYYY-MM-DD
};

export async function insertSubmission(input: SubmissionInput) {
  // Resolve slugs
  const { data: make } = await supabase
    .from("makes")
    .select("id")
    .eq("slug", input.makeSlug)
    .single();
  if (!make) throw new Error("Make not found");

  const { data: model } = await supabase
    .from("models")
    .select("id")
    .eq("make_id", make.id)
    .eq("slug", input.modelSlug)
    .single();
  if (!model) throw new Error("Model not found");

  const { data: region } = await supabase
    .from("regions")
    .select("id")
    .eq("slug", input.regionSlug)
    .single();
  if (!region) throw new Error("Region not found");

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure profile exists (upsert)
  await supabase
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      condition: input.condition,
      make_id: make.id,
      model_id: model.id,
      trim_id: input.trimId ?? null,
      year: input.year,
      msrp: Math.round(input.msrpDollars * 100), // dollars → cents
      otd_price: Math.round(input.otdDollars * 100),
      region_id: region.id,
      purchase_date: input.purchaseDate,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
