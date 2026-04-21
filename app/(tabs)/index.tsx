import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";

export default function SearchScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTagline}>FairDrive</Text>
          <Text style={styles.heroTitle}>Know the{"\n"}fair price.</Text>
          <Text style={styles.heroSubtitle}>
            Real prices from real buyers. No dealer influence, ever.
          </Text>
        </View>

        {/* Condition toggle */}
        <View style={styles.toggleRow}>
          <Pressable style={[styles.toggleButton, styles.toggleActive]}>
            <Text style={[styles.toggleText, styles.toggleTextActive]}>
              Brand new
            </Text>
          </Pressable>
          <Pressable style={styles.toggleButton}>
            <Text style={styles.toggleText}>Used</Text>
          </Pressable>
        </View>

        {/* Cascading dropdowns (placeholder) */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>make</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select make</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>model</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select model</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>year</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select year</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>region</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>Vancouver, BC</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>
        </View>

        {/* Primary CTA */}
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push("/results")}
        >
          <Text style={styles.ctaText}>See fair price</Text>
        </Pressable>

        {/* Trending section */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending in your region</Text>
          {TRENDING_PLACEHOLDER.map((item) => (
            <Pressable
              key={item.id}
              style={styles.trendingCard}
              onPress={() => router.push("/results")}
            >
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingName}>{item.name}</Text>
                <Text style={styles.trendingMeta}>{item.meta}</Text>
              </View>
              <View style={styles.trendingPrice}>
                <Text style={styles.trendingPriceValue}>{item.price}</Text>
                <Text style={styles.trendingPriceLabel}>median otd</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TRENDING_PLACEHOLDER = [
  {
    id: "1",
    name: "2025 Toyota RAV4",
    meta: "42 reports · Vancouver",
    price: "$42,150",
  },
  {
    id: "2",
    name: "2025 Honda CR-V",
    meta: "38 reports · Vancouver",
    price: "$41,800",
  },
  {
    id: "3",
    name: "2025 Tesla Model 3",
    meta: "29 reports · Vancouver",
    price: "$55,200",
  },
  {
    id: "4",
    name: "2024 Mazda CX-5",
    meta: "24 reports · Vancouver",
    price: "$38,400",
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

  // Hero
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroTagline: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 36,
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  toggleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.surface,
  },

  // Form fields
  formSection: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  dropdownPlaceholder: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textTertiary,
  },
  dropdownText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
  },
  dropdownChevron: {
    fontFamily: fonts.sans,
    fontSize: 18,
    color: colors.textTertiary,
  },

  // CTA
  ctaButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  ctaText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },

  // Trending
  trendingSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  trendingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  trendingMeta: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textTertiary,
  },
  trendingPrice: {
    alignItems: "flex-end",
  },
  trendingPriceValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: colors.text,
  },
  trendingPriceLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
