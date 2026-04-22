import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";
import {
  fetchAggregatePrices,
  fetchSubmissions,
  type AggregatePrice,
  type Submission,
  type SearchParams,
} from "@/lib/queries";

// ── Helpers ────────────────────────────────────────────────────

function centsToDisplay(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildDistribution(
  min: number,
  max: number,
  median: number,
  p25: number,
  p75: number
) {
  // Generate a bell-curve-ish distribution with 10 bars
  const range = max - min || 1;
  const bars = [];
  for (let i = 0; i < 10; i++) {
    const bucketCenter = min + (range * (i + 0.5)) / 10;
    // Simple normal-ish distribution centered on median
    const dist = Math.abs(bucketCenter - median) / (range / 2);
    const height = Math.max(12, Math.round(120 * Math.exp(-2 * dist * dist)));
    const isMedian = i === Math.round(((median - min) / range) * 9);
    bars.push({ height, isMedian });
  }
  return bars;
}

type Filter = "all" | "verified" | "30days" | "lowest";

// ── Component ──────────────────────────────────────────────────

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    makeSlug: string;
    modelSlug: string;
    makeName: string;
    modelName: string;
    year: string;
    regionSlug: string;
    regionLabel: string;
    condition: string;
  }>();

  const hasParams = !!params.makeSlug && !!params.modelSlug;

  // State
  const [loading, setLoading] = useState(false);
  const [aggregate, setAggregate] = useState<AggregatePrice | null>(null);
  const [trimBreakdown, setTrimBreakdown] = useState<
    (AggregatePrice & { trimName: string })[]
  >([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const searchParams: SearchParams | null = hasParams
    ? {
        makeSlug: params.makeSlug!,
        modelSlug: params.modelSlug!,
        year: params.year || undefined,
        regionSlug: params.regionSlug || "vancouver-bc",
        condition: (params.condition as "new" | "used") || "new",
      }
    : null;

  const loadData = useCallback(async () => {
    if (!searchParams) return;
    setLoading(true);
    try {
      const [priceData, submissionData] = await Promise.all([
        fetchAggregatePrices(searchParams),
        fetchSubmissions(searchParams),
      ]);
      setAggregate(priceData.overall);
      setTrimBreakdown(priceData.byTrim);
      setSubmissions(submissionData);
    } catch {
      // Silently handle — empty state will show
    } finally {
      setLoading(false);
    }
  }, [
    params.makeSlug,
    params.modelSlug,
    params.year,
    params.regionSlug,
    params.condition,
  ]);

  useEffect(() => {
    if (hasParams) loadData();
  }, [loadData, hasParams]);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (activeFilter === "verified") return sub.verification === "verified";
    if (activeFilter === "30days") {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return new Date(sub.created_at).getTime() > thirtyDaysAgo;
    }
    return true;
  });

  const sortedSubmissions =
    activeFilter === "lowest"
      ? [...filteredSubmissions].sort((a, b) => a.otd_price - b.otd_price)
      : filteredSubmissions;

  // Vehicle display strings
  const vehicleName = hasParams
    ? `${params.year || ""} ${params.makeName} ${params.modelName}`.trim()
    : "";
  const vehicleSub = params.regionLabel || "";

  // ── Empty / no-params state ──────────────────────────────────
  if (!hasParams) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No vehicle selected</Text>
          <Text style={styles.emptySubtitle}>
            Search for a vehicle to see community pricing data.
          </Text>
          <Pressable
            style={styles.emptyCta}
            onPress={() => router.push("/")}
          >
            <Text style={styles.emptyCtaText}>Go to Search</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            Fetching prices for {vehicleName}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Determine what to show ───────────────────────────────────
  const hasData = aggregate !== null;

  // Values from aggregate (cents) or placeholders
  const medianOtd = aggregate ? centsToDisplay(aggregate.median_otd) : "—";
  const avgMsrp = aggregate ? centsToDisplay(aggregate.avg_msrp) : "—";
  const markupPct = aggregate ? `${aggregate.avg_markup_pct}%` : "—";
  const totalReports = aggregate?.total_reports ?? 0;
  const verifiedReports = aggregate?.verified_reports ?? 0;
  const unverifiedReports = totalReports - verifiedReports;

  const distributionBars =
    hasData && aggregate
      ? buildDistribution(
          aggregate.min_otd,
          aggregate.max_otd,
          aggregate.median_otd,
          aggregate.p25_otd,
          aggregate.p75_otd
        )
      : PLACEHOLDER_DISTRIBUTION;

  const distLabelLow =
    hasData && aggregate ? centsToDisplay(aggregate.min_otd) : "$38,800";
  const distLabelMid = hasData ? medianOtd : "$42,150";
  const distLabelHigh =
    hasData && aggregate ? centsToDisplay(aggregate.max_otd) : "$47,200";

  // Negotiation tip
  const tipText =
    hasData && aggregate
      ? `Walk in asking for ${centsToDisplay(aggregate.p25_otd)}. Most verified buyers paid between ${centsToDisplay(aggregate.p25_otd)} and ${centsToDisplay(aggregate.p75_otd)}.`
      : `Be the first to report what you paid for a ${vehicleName}. Your data helps others negotiate fairly.`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle header */}
        <View style={styles.header}>
          <Text style={styles.vehicleName}>{vehicleName}</Text>
          <Text style={styles.vehicleTrim}>
            {params.condition === "used" ? "Used" : "New"} · {vehicleSub}
          </Text>
        </View>

        {/* Price hero */}
        <View style={styles.priceHero}>
          <Text style={styles.priceLabel}>
            {hasData ? "fair otd price" : "no data yet"}
          </Text>
          <Text style={styles.priceValue}>
            {hasData ? medianOtd : "—"}
          </Text>
          {hasData && (
            <Text style={styles.priceContext}>
              msrp {avgMsrp} · median markup {markupPct}
            </Text>
          )}
          {!hasData && (
            <Text style={styles.priceContext}>
              Be the first to report a price
            </Text>
          )}
        </View>

        {/* Trust signal */}
        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>{verifiedReports}</Text>
            <Text style={styles.trustLabel}>verified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>{unverifiedReports}</Text>
            <Text style={styles.trustLabel}>unverified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>90</Text>
            <Text style={styles.trustLabel}>days</Text>
          </View>
        </View>

        {/* Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price distribution</Text>
          <View style={styles.distributionPlaceholder}>
            {distributionBars.map((bar, i) => (
              <View key={i} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: bar.height,
                      backgroundColor: bar.isMedian
                        ? colors.accent
                        : colors.borderLight,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.distributionLabels}>
            <Text style={styles.distributionLabel}>{distLabelLow}</Text>
            <Text style={[styles.distributionLabel, { color: colors.accent }]}>
              {distLabelMid}
            </Text>
            <Text style={styles.distributionLabel}>{distLabelHigh}</Text>
          </View>
        </View>

        {/* Negotiation tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>
            {hasData ? "negotiation tip" : "get started"}
          </Text>
          <Text style={styles.tipText}>{tipText}</Text>
        </View>

        {/* Trim breakdown */}
        {(trimBreakdown.length > 0 || !hasData) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By trim</Text>
            {trimBreakdown.length > 0
              ? trimBreakdown.map((trim) => (
                  <View key={trim.trim_id} style={styles.trimRow}>
                    <Text style={styles.trimName}>{trim.trimName}</Text>
                    <Text style={styles.trimPrice}>
                      {centsToDisplay(trim.median_otd)}
                    </Text>
                    <Text style={styles.trimCount}>
                      {trim.total_reports} report
                      {trim.total_reports !== 1 ? "s" : ""}
                    </Text>
                  </View>
                ))
              : PLACEHOLDER_TRIMS.map((trim) => (
                  <View key={trim.name} style={[styles.trimRow, { opacity: 0.4 }]}>
                    <Text style={styles.trimName}>{trim.name}</Text>
                    <Text style={styles.trimPrice}>{trim.price}</Text>
                    <Text style={styles.trimCount}>{trim.count}</Text>
                  </View>
                ))}
          </View>
        )}

        {/* Recent submissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent submissions</Text>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                style={[
                  styles.filterPill,
                  activeFilter === f.key && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === f.key && styles.filterPillTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {sortedSubmissions.length > 0
            ? sortedSubmissions.map((sub) => (
                <View key={sub.id} style={styles.submissionCard}>
                  <View style={styles.submissionHeader}>
                    <View
                      style={[
                        styles.submissionBadge,
                        sub.verification === "verified" &&
                          styles.submissionBadgeVerified,
                      ]}
                    >
                      <Text
                        style={[
                          styles.submissionBadgeText,
                          sub.verification === "verified" &&
                            styles.submissionBadgeTextVerified,
                        ]}
                      >
                        {sub.verification}
                      </Text>
                    </View>
                    <Text style={styles.submissionDate}>
                      {formatDate(sub.created_at)}
                    </Text>
                  </View>
                  <View style={styles.submissionBody}>
                    <Text style={styles.submissionTrim}>
                      {sub.trim?.name ?? "Base"}
                    </Text>
                    <Text style={styles.submissionPrice}>
                      {centsToDisplay(sub.otd_price)}
                    </Text>
                  </View>
                  <View style={styles.submissionFooter}>
                    <Text style={styles.submissionMsrp}>
                      msrp {centsToDisplay(sub.msrp)}
                    </Text>
                    <View style={styles.voteRow}>
                      <Pressable style={styles.voteButton}>
                        <Text style={styles.voteText}>
                          ▲ {sub.upvotes}
                        </Text>
                      </Pressable>
                      <Pressable style={styles.voteButton}>
                        <Text style={styles.voteText}>
                          ▼ {sub.downvotes}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            : (
              <View style={styles.emptySubmissions}>
                <Text style={styles.emptySubmissionsTitle}>
                  No submissions yet
                </Text>
                <Text style={styles.emptySubmissionsText}>
                  Be the first to report what you paid.
                </Text>
                <Pressable
                  style={styles.emptySubmissionsCta}
                  onPress={() => router.push("/report")}
                >
                  <Text style={styles.emptySubmissionsCtaText}>
                    Report a price
                  </Text>
                </Pressable>
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Static data ────────────────────────────────────────────────

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "30days", label: "Last 30 days" },
  { key: "lowest", label: "Lowest OTD" },
];

const PLACEHOLDER_DISTRIBUTION = [
  { height: 20, isMedian: false },
  { height: 35, isMedian: false },
  { height: 55, isMedian: false },
  { height: 80, isMedian: false },
  { height: 120, isMedian: true },
  { height: 90, isMedian: false },
  { height: 60, isMedian: false },
  { height: 40, isMedian: false },
  { height: 25, isMedian: false },
  { height: 15, isMedian: false },
];

const PLACEHOLDER_TRIMS = [
  { name: "LE", price: "—", count: "0 reports" },
  { name: "XLE", price: "—", count: "0 reports" },
  { name: "Limited", price: "—", count: "0 reports" },
];

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  emptyCtaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },

  // Header
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  vehicleName: {
    ...typography.h1,
    marginBottom: 4,
  },
  vehicleTrim: {
    ...typography.bodySmall,
  },

  // Price hero
  priceHero: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  priceLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  priceValue: {
    ...typography.priceHero,
  },
  priceContext: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },

  // Trust bar
  trustBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  trustItem: {
    alignItems: "center",
  },
  trustNumber: {
    fontFamily: fonts.monoMedium,
    fontSize: 20,
    color: colors.text,
  },
  trustLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: 2,
  },
  trustDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: colors.border,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  // Distribution chart
  distributionPlaceholder: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 130,
    paddingHorizontal: spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "60%",
    borderRadius: 2,
  },
  distributionLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  distributionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textTertiary,
  },

  // Tip card
  tipCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tipLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.accentDark,
  },

  // Trim breakdown
  trimRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  trimName: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
  },
  trimPrice: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    color: colors.text,
    marginRight: spacing.md,
  },
  trimCount: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textTertiary,
    width: 80,
    textAlign: "right",
  },

  // Filters
  filterRow: {
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  filterPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.surface,
  },

  // Submission cards
  submissionCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  submissionBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
  },
  submissionBadgeVerified: {
    backgroundColor: colors.accentLight,
  },
  submissionBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  submissionBadgeTextVerified: {
    color: colors.accent,
  },
  submissionDate: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textTertiary,
  },
  submissionBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.xs,
  },
  submissionTrim: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.text,
  },
  submissionPrice: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: colors.text,
  },
  submissionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submissionMsrp: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textTertiary,
  },
  voteRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  voteButton: {
    padding: 4,
  },
  voteText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Empty submissions
  emptySubmissions: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptySubmissionsTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubmissionsText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  emptySubmissionsCta: {
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  emptySubmissionsCtaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
