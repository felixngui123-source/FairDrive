import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";
import { MAKES } from "@/constants/vehicles";
import { REGIONS } from "@/constants/regions";
import PickerModal from "@/components/PickerModal";
import { insertSubmission } from "@/lib/queries";

// ── Helpers ────────────────────────────────────────────────────

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function getMarkupColor(markupPercent: number): string {
  if (markupPercent <= 5) return colors.priceGood;
  if (markupPercent <= 12) return colors.priceFair;
  return colors.priceHigh;
}

function getMarkupLabel(markupPercent: number): string {
  if (markupPercent <= 5) return "Good deal";
  if (markupPercent <= 12) return "Fair price";
  return "Above market";
}

// Generate month options for a simple date picker
function getMonthOptions() {
  const months: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-CA", {
      month: "long",
      year: "numeric",
    });
    // Use the 15th as a mid-month representative date
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-15`;
    months.push({ label, value });
  }
  return months;
}

type PickerTarget =
  | "condition"
  | "year"
  | "make"
  | "model"
  | "trim"
  | "region"
  | "date"
  | null;

// ── Component ──────────────────────────────────────────────────

export default function ReportScreen() {
  // Form state
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [year, setYear] = useState<string | null>(null);
  const [makeSlug, setMakeSlug] = useState<string | null>(null);
  const [modelSlug, setModelSlug] = useState<string | null>(null);
  const [trimSlug, setTrimSlug] = useState<string | null>(null);
  const [regionSlug, setRegionSlug] = useState<string>("vancouver-bc");
  const [purchaseDate, setPurchaseDate] = useState<string | null>(null);
  const [msrp, setMsrp] = useState("");
  const [otd, setOtd] = useState("");

  // UI state
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [submitting, setSubmitting] = useState(false);

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
  const dateOptions = useMemo(() => getMonthOptions(), []);

  // Trim options — placeholder until trims are populated in DB
  // For now, use common trim names as free text via the picker
  const trimOptions = useMemo(() => {
    const common = [
      "Base",
      "LE",
      "SE",
      "XLE",
      "XSE",
      "Limited",
      "Touring",
      "Sport",
      "Premium",
      "GT",
      "EX",
      "EX-L",
      "LX",
      "Preferred",
      "Signature",
    ];
    return common.map((t) => ({
      label: t,
      value: t.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }));
  }, []);

  // Reset model when make changes
  function handleMakeSelect(slug: string) {
    setMakeSlug(slug);
    setModelSlug(null);
    setTrimSlug(null);
  }

  // Live markup calculation
  const msrpNum = parseFloat(msrp.replace(/[^0-9.]/g, "")) || 0;
  const otdNum = parseFloat(otd.replace(/[^0-9.]/g, "")) || 0;
  const markupPercent = msrpNum > 0 ? ((otdNum - msrpNum) / msrpNum) * 100 : 0;
  const showPreview = msrpNum > 0 && otdNum > 0;

  // Formatted purchase date display
  const purchaseDateLabel = purchaseDate
    ? new Date(purchaseDate).toLocaleDateString("en-CA", {
        month: "long",
        year: "numeric",
      })
    : null;

  // Validation
  const canSubmit =
    makeSlug && modelSlug && year && regionSlug && purchaseDate && msrpNum > 0 && otdNum > 0;

  // Submit handler
  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await insertSubmission({
        condition,
        makeSlug: makeSlug!,
        modelSlug: modelSlug!,
        trimId: null, // Trim IDs not yet seeded — will be wired later
        year: parseInt(year!, 10),
        msrpDollars: msrpNum,
        otdDollars: otdNum,
        regionSlug,
        purchaseDate: purchaseDate!,
      });
      Alert.alert(
        "Report submitted",
        "Thanks for helping the community know what's fair.",
        [{ text: "OK" }]
      );
      // Reset form
      setYear(null);
      setMakeSlug(null);
      setModelSlug(null);
      setTrimSlug(null);
      setPurchaseDate(null);
      setMsrp("");
      setOtd("");
    } catch (err: any) {
      const msg =
        err?.message === "Not authenticated"
          ? "You need to sign in before submitting a report."
          : "Something went wrong. Please try again.";
      Alert.alert("Couldn't submit", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Report a deal</Text>
          <Text style={styles.subtitle}>
            Help others know what's fair. Takes under 60 seconds.
          </Text>
        </View>

        {/* Anonymous chip */}
        <View style={styles.anonymousChip}>
          <Text style={styles.anonymousText}>
            Anonymous — your identity is never shared
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Condition toggle */}
          <Text style={styles.fieldLabel}>condition</Text>
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
                New
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

          {/* Year */}
          <Text style={styles.fieldLabel}>year</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setActivePicker("year")}
          >
            <Text style={year ? styles.dropdownText : styles.dropdownPlaceholder}>
              {year ?? "Select year"}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          {/* Make */}
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

          {/* Model */}
          <Text style={styles.fieldLabel}>model</Text>
          <Pressable
            style={[styles.dropdown, !makeSlug && styles.dropdownDisabled]}
            onPress={() => makeSlug && setActivePicker("model")}
          >
            <Text
              style={
                selectedModel ? styles.dropdownText : styles.dropdownPlaceholder
              }
            >
              {selectedModel?.name ??
                (makeSlug ? "Select model" : "Select make first")}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          {/* Trim */}
          <Text style={styles.fieldLabel}>trim (optional)</Text>
          <Pressable
            style={[styles.dropdown, !modelSlug && styles.dropdownDisabled]}
            onPress={() => modelSlug && setActivePicker("trim")}
          >
            <Text
              style={
                trimSlug ? styles.dropdownText : styles.dropdownPlaceholder
              }
            >
              {trimOptions.find((t) => t.value === trimSlug)?.label ??
                (modelSlug ? "Select trim" : "Select model first")}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          {/* Region */}
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

          {/* Purchase date */}
          <Text style={styles.fieldLabel}>purchase date</Text>
          <Pressable
            style={styles.dropdown}
            onPress={() => setActivePicker("date")}
          >
            <Text
              style={
                purchaseDate ? styles.dropdownText : styles.dropdownPlaceholder
              }
            >
              {purchaseDateLabel ?? "Select month"}
            </Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          {/* MSRP */}
          <Text style={styles.fieldLabel}>msrp / sticker price</Text>
          <TextInput
            style={styles.input}
            placeholder="$39,350"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={msrp}
            onChangeText={setMsrp}
          />

          {/* OTD */}
          <Text style={styles.fieldLabel}>out-the-door price paid</Text>
          <TextInput
            style={styles.input}
            placeholder="$42,150"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={otd}
            onChangeText={setOtd}
          />
        </View>

        {/* Live price preview */}
        {showPreview && (
          <View
            style={[
              styles.previewCard,
              { borderLeftColor: getMarkupColor(markupPercent) },
            ]}
          >
            <Text style={styles.previewLabel}>your markup</Text>
            <Text
              style={[
                styles.previewPercent,
                { color: getMarkupColor(markupPercent) },
              ]}
            >
              {markupPercent > 0 ? "+" : ""}
              {markupPercent.toFixed(1)}%
            </Text>
            <Text
              style={[
                styles.previewVerdict,
                { color: getMarkupColor(markupPercent) },
              ]}
            >
              {getMarkupLabel(markupPercent)}
            </Text>
          </View>
        )}

        {/* Verification upload */}
        <View style={styles.verifySection}>
          <Text style={styles.fieldLabel}>verification (optional)</Text>
          <Pressable style={styles.uploadButton}>
            <Text style={styles.uploadText}>
              Upload purchase agreement for 5x weight
            </Text>
            <Text style={styles.uploadSubtext}>
              Personal info is auto-redacted before storage
            </Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          style={[
            styles.submitButton,
            (!canSubmit || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {submitting ? "Submitting..." : "Submit report"}
          </Text>
        </Pressable>

        {/* Validation hint */}
        {!canSubmit && (
          <Text style={styles.validationHint}>
            Fill in year, make, model, region, date, and both prices to submit.
          </Text>
        )}
      </ScrollView>

      {/* Picker modals */}
      <PickerModal
        visible={activePicker === "year"}
        title="Select year"
        options={yearOptions}
        selectedValue={year ?? undefined}
        onSelect={setYear}
        onClose={() => setActivePicker(null)}
      />
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
        visible={activePicker === "trim"}
        title="Select trim"
        options={trimOptions}
        selectedValue={trimSlug ?? undefined}
        onSelect={setTrimSlug}
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
      <PickerModal
        visible={activePicker === "date"}
        title="Purchase month"
        options={dateOptions}
        selectedValue={purchaseDate ?? undefined}
        onSelect={setPurchaseDate}
        onClose={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
}

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

  // Header
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
  },

  // Anonymous chip
  anonymousChip: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    marginBottom: spacing.xl,
  },
  anonymousText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.accent,
  },

  // Form
  form: {
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
  input: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.text,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
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

  // Preview card
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  previewLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  previewPercent: {
    fontFamily: fonts.serifBold,
    fontSize: 36,
    lineHeight: 42,
  },
  previewVerdict: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    marginTop: spacing.xs,
  },

  // Verify
  verifySection: {
    marginBottom: spacing.xl,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  uploadText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.accent,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Submit
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },

  // Validation
  validationHint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
