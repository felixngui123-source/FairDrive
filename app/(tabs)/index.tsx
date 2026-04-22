import { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";
import { MAKES } from "@/constants/vehicles";
import { REGIONS } from "@/constants/regions";
import PickerModal from "@/components/PickerModal";
import { supabase } from "@/lib/supabase";

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

type PickerTarget = "make" | "model" | "year" | "region" | null;

export default function SearchScreen() {
  const router = useRouter();

  // Form state
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [makeSlug, setMakeSlug] = useState<string | null>(null);
  const [modelSlug, setModelSlug] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [regionSlug, setRegionSlug] = useState<string>("vancouver-bc");

  // Picker modal state
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);

  // Trending data from Supabase (falls back to placeholder)
  const [trending, setTrending] = useState(TRENDING_PLACEHOLDER);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("aggregate_prices")
          .select(
            `*, make:makes(slug, name), model:models(slug, name)`
          )
          .eq("condition", "new")
          .order("total_reports", { ascending: false })
          .limit(4);

        if (data && data.length > 0) {
          setTrending(
            data.map((row: any, i: number) => ({
              id: String(i),
              name: `${row.year} ${row.make.name} ${row.model.name}`,
              meta: `${row.total_reports} reports`,
              price:
                "$" +
                (row.median_otd / 100).toLocaleString("en-CA", {
                  maximumFractionDigits: 0,
                }),
              makeSlug: row.make.slug,
              modelSlug: row.model.slug,
              makeName: row.make.name,
              modelName: row.model.name,
              year: String(row.year),
            }))
          );
        }
      } catch {
        // Keep placeholder data
      }
    })();
  }, []);

  // Derived data
  const selectedMake = useMemo(
    () => MAKES.find((m) => m.slug === makeSlug) ?? null,
    [makeSlug]
  );

  const selectedModel = useMemo(
    () => selectedMake?.models.find((m) => m.slug === modelSlug) ?? null,
    [selectedMake, modelSlug]
  );

  const selectedRegion = useMemo(
    () => REGIONS.find((r) => r.slug === regionSlug) ?? null,
    [regionSlug]
  );

  // Picker options
  const makeOptions = useMemo(
    () => MAKES.map((m) => ({ label: m.name, value: m.slug })),
    []
  );

  const modelOptions = useMemo(
    () =>
      selectedMake?.models.map((m) => ({ label: m.name, value: m.slug })) ?? [],
    [selectedMake]
  );

  const yearOptions = useMemo(
    () => YEARS.map((y) => ({ label: String(y), value: String(y) })),
    []
  );

  const regionOptions = useMemo(
    () => REGIONS.map((r) => ({ label: r.label, value: r.slug })),
    []
  );

  // Handlers
  function handleMakeSelect(slug: string) {
    setMakeSlug(slug);
    setModelSlug(null); // Reset model when make changes
  }

  const canSearch = makeSlug && modelSlug;

  function handleSearch() {
    if (!canSearch) return;
    const makeName = selectedMake?.name ?? "";
    const modelName = selectedModel?.name ?? "";
    router.push({
      pathname: "/results",
      params: {
        makeSlug,
        modelSlug,
        makeName,
        modelName,
        year: year ?? "",
        regionSlug,
        regionLabel: selectedRegion?.label ?? "",
        condition,
      },
    });
  }

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
          <Pressable
            style={[
              styles.toggleButton,
              condition === "new" && styles.toggleActive,
            ]}
            onPress={() => setCondition("new")}
          >
            <Text
              style={[
                styles.toggleText,
                condition === "new" && styles.toggleTextActive,
              ]}
            >
              Brand new
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              condition === "used" && styles.toggleActive,
            ]}
            onPress={() => setCondition("used")}
          >
            <Text
              style={[
                styles.toggleText,
                condition === "used" && styles.toggleTextActive,
              ]}
            >
              Used
            </Text>
          </Pressable>
        </View>

        {/* Cascading dropdowns */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>make</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setActivePicker("make")}
          >
            <Text
              style={
                selectedMake ? styles.dropdownText : styles.dropdownPlaceholder
              }
            >
              {selectedMake?.name ?? "Select make"}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>model</Text>
          <Pressable
            style={[styles.dropdown, !makeSlug && styles.dropdownDisabled]}
            onPress={() => makeSlug && setActivePicker("model")}
          >
            <Text
              style={
                selectedModel
                  ? styles.dropdownText
                  : styles.dropdownPlaceholder
              }
            >
              {selectedModel?.name ??
                (makeSlug ? "Select model" : "Select make first")}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>year</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setActivePicker("year")}
          >
            <Text
              style={year ? styles.dropdownText : styles.dropdownPlaceholder}
            >
              {year ?? "Select year"}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>region</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setActivePicker("region")}
          >
            <Text style={styles.dropdownText}>
              {selectedRegion?.label ?? "Select region"}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>
        </View>

        {/* Primary CTA */}
        <Pressable
          style={[styles.ctaButton, !canSearch && styles.ctaButtonDisabled]}
          onPress={handleSearch}
        >
          <Text style={styles.ctaText}>See fair price</Text>
        </Pressable>

        {/* Trending section */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>Trending in your region</Text>
          {trending.map((item) => (
            <Pressable
              key={item.id}
              style={styles.trendingCard}
              onPress={() =>
                router.push({
                  pathname: "/results",
                  params: {
                    makeSlug: item.makeSlug,
                    modelSlug: item.modelSlug,
                    makeName: item.makeName,
                    modelName: item.modelName,
                    year: item.year,
                    regionSlug: "vancouver-bc",
                    regionLabel: "Vancouver, BC",
                    condition: "new",
                  },
                })
              }
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

      {/* Picker modals */}
      <PickerModal
        visible={activePicker === "make"}
        title="Select make"
        options={makeOptions}
        selectedValue={makeSlug ?? undefined}
        onSelect={handleMakeSelect}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === "model"}
        title={`${selectedMake?.name ?? ""} models`}
        options={modelOptions}
        selectedValue={modelSlug ?? undefined}
        onSelect={setModelSlug}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === "year"}
        title="Select year"
        options={yearOptions}
        selectedValue={year ?? undefined}
        onSelect={setYear}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === "region"}
        title="Select region"
        options={regionOptions}
        selectedValue={regionSlug}
        onSelect={setRegionSlug}
        onClose={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
}

const TRENDING_PLACEHOLDER = [
  {
    id: "1",
    name: "2025 Toyota RAV4",
    meta: "42 reports · Vancouver",
    price: "$42,150",
    makeSlug: "toyota",
    modelSlug: "rav4",
    makeName: "Toyota",
    modelName: "RAV4",
    year: "2025",
  },
  {
    id: "2",
    name: "2025 Honda CR-V",
    meta: "38 reports · Vancouver",
    price: "$41,800",
    makeSlug: "honda",
    modelSlug: "cr-v",
    makeName: "Honda",
    modelName: "CR-V",
    year: "2025",
  },
  {
    id: "3",
    name: "2025 Tesla Model 3",
    meta: "29 reports · Vancouver",
    price: "$55,200",
    makeSlug: "tesla",
    modelSlug: "model-3",
    makeName: "Tesla",
    modelName: "Model 3",
    year: "2025",
  },
  {
    id: "4",
    name: "2024 Mazda CX-5",
    meta: "24 reports · Vancouver",
    price: "$38,400",
    makeSlug: "mazda",
    modelSlug: "cx-5",
    makeName: "Mazda",
    modelName: "CX-5",
    year: "2024",
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
  dropdownDisabled: {
    opacity: 0.5,
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
  ctaButtonDisabled: {
    opacity: 0.4,
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
