import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";

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

export default function ReportScreen() {
  const [msrp, setMsrp] = useState("");
  const [otd, setOtd] = useState("");

  const msrpNum = parseFloat(msrp.replace(/[^0-9.]/g, "")) || 0;
  const otdNum = parseFloat(otd.replace(/[^0-9.]/g, "")) || 0;
  const markupPercent = msrpNum > 0 ? ((otdNum - msrpNum) / msrpNum) * 100 : 0;
  const showPreview = msrpNum > 0 && otdNum > 0;

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
          <Text style={styles.fieldLabel}>condition</Text>
          <View style={styles.toggleRow}>
            <Pressable style={[styles.toggleButton, styles.toggleActive]}>
              <Text style={[styles.toggleText, styles.toggleTextActive]}>
                New
              </Text>
            </Pressable>
            <Pressable style={styles.toggleButton}>
              <Text style={styles.toggleText}>Used</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>year</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select year</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

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

          <Text style={styles.fieldLabel}>trim</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select trim</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>region</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownText}>Vancouver, BC</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>purchase date</Text>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>Select date</Text>
            <Text style={styles.dropdownChevron}>›</Text>
          </Pressable>

          <Text style={styles.fieldLabel}>msrp / sticker price</Text>
          <TextInput
            style={styles.input}
            placeholder="$39,350"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={msrp}
            onChangeText={setMsrp}
          />

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
        <Pressable style={styles.submitButton}>
          <Text style={styles.submitText}>Submit report</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  submitText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
