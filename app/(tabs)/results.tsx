import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";

export default function ResultsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle header */}
        <View style={styles.header}>
          <Text style={styles.vehicleName}>2025 Toyota RAV4</Text>
          <Text style={styles.vehicleTrim}>XLE AWD · Vancouver, BC</Text>
        </View>

        {/* Price hero — the centerpiece */}
        <View style={styles.priceHero}>
          <Text style={styles.priceLabel}>fair otd price</Text>
          <Text style={styles.priceValue}>$42,150</Text>
          <Text style={styles.priceContext}>
            msrp $39,350 · median markup 7.1%
          </Text>
        </View>

        {/* Trust signal */}
        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>38</Text>
            <Text style={styles.trustLabel}>verified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>12</Text>
            <Text style={styles.trustLabel}>unverified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>90</Text>
            <Text style={styles.trustLabel}>days</Text>
          </View>
        </View>

        {/* Distribution placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price distribution</Text>
          <View style={styles.distributionPlaceholder}>
            {DISTRIBUTION_DATA.map((bar, i) => (
              <View key={i} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: bar.height,
                      backgroundColor:
                        bar.isMedian ? colors.accent : colors.borderLight,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.distributionLabels}>
            <Text style={styles.distributionLabel}>$38,800</Text>
            <Text style={[styles.distributionLabel, { color: colors.accent }]}>
              $42,150
            </Text>
            <Text style={styles.distributionLabel}>$47,200</Text>
          </View>
        </View>

        {/* Negotiation tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>negotiation tip</Text>
          <Text style={styles.tipText}>
            Walk in asking for $40,500. Most verified buyers in Vancouver paid
            between $40,200 and $43,800.
          </Text>
        </View>

        {/* Trim breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By trim</Text>
          {TRIM_DATA.map((trim) => (
            <View key={trim.name} style={styles.trimRow}>
              <Text style={styles.trimName}>{trim.name}</Text>
              <Text style={styles.trimPrice}>{trim.price}</Text>
              <Text style={styles.trimCount}>{trim.count}</Text>
            </View>
          ))}
        </View>

        {/* Recent submissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent submissions</Text>

          {/* Filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
          >
            {["All", "Verified", "Last 30 days", "Lowest OTD"].map(
              (filter, i) => (
                <Pressable
                  key={filter}
                  style={[styles.filterPill, i === 0 && styles.filterPillActive]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      i === 0 && styles.filterPillTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>

          {SUBMISSIONS_PLACEHOLDER.map((sub) => (
            <View key={sub.id} style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <View style={styles.submissionBadge}>
                  <Text style={styles.submissionBadgeText}>
                    {sub.verified ? "verified" : "unverified"}
                  </Text>
                </View>
                <Text style={styles.submissionDate}>{sub.date}</Text>
              </View>
              <View style={styles.submissionBody}>
                <Text style={styles.submissionTrim}>{sub.trim}</Text>
                <Text style={styles.submissionPrice}>{sub.otd}</Text>
              </View>
              <View style={styles.submissionFooter}>
                <Text style={styles.submissionMsrp}>msrp {sub.msrp}</Text>
                <View style={styles.voteRow}>
                  <Pressable style={styles.voteButton}>
                    <Text style={styles.voteText}>▲ {sub.upvotes}</Text>
                  </Pressable>
                  <Pressable style={styles.voteButton}>
                    <Text style={styles.voteText}>▼ {sub.downvotes}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DISTRIBUTION_DATA = [
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

const TRIM_DATA = [
  { name: "LE", price: "$39,800", count: "18 reports" },
  { name: "XLE", price: "$42,150", count: "22 reports" },
  { name: "XLE Premium", price: "$44,600", count: "8 reports" },
  { name: "Limited", price: "$47,200", count: "2 reports" },
];

const SUBMISSIONS_PLACEHOLDER = [
  {
    id: "1",
    verified: true,
    date: "Apr 12, 2026",
    trim: "XLE AWD",
    otd: "$41,800",
    msrp: "$39,350",
    upvotes: 12,
    downvotes: 0,
  },
  {
    id: "2",
    verified: true,
    date: "Apr 8, 2026",
    trim: "XLE AWD",
    otd: "$42,500",
    msrp: "$39,350",
    upvotes: 8,
    downvotes: 1,
  },
  {
    id: "3",
    verified: false,
    date: "Apr 5, 2026",
    trim: "LE FWD",
    otd: "$38,200",
    msrp: "$36,450",
    upvotes: 3,
    downvotes: 2,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  submissionBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
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
});
