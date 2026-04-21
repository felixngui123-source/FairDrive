import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
};

function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.rowChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <Pressable style={styles.signInButton}>
            <Text style={styles.signInText}>Sign in with Apple</Text>
          </Pressable>
          <Pressable style={styles.signInButtonGoogle}>
            <Text style={styles.signInTextGoogle}>Sign in with Google</Text>
          </Pressable>
          <Text style={styles.signInNote}>
            Required to submit reports. Browsing is always free.
          </Text>
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingsRow label="Home region" value="Vancouver, BC" />
          <SettingsRow label="Currency" value="CAD" />
          <SettingsRow label="Price alerts" value="Off" />
          <SettingsRow label="Weekly digest" value="Off" />
        </View>

        {/* Your data */}
        <SectionHeader title="Your data" />
        <View style={styles.section}>
          <SettingsRow label="My reports" value="0" />
          <SettingsRow label="Watchlist" value="0 vehicles" />
          <SettingsRow label="Export my data" />
          <SettingsRow label="Delete my account" />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingsRow label="How FairDrive works" />
          <SettingsRow label="Why no dealer names" />
          <SettingsRow label="Privacy policy" />
          <SettingsRow label="Terms of service" />
          <SettingsRow label="Contact" />
        </View>

        {/* Footer tagline */}
        <View style={styles.footer}>
          <Text style={styles.footerTagline}>
            Independent. Never dealer-funded.
          </Text>
          <Text style={styles.footerVersion}>FairDrive v1.0.0</Text>
        </View>
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

  title: {
    ...typography.h1,
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },

  // Sections
  sectionHeader: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: "hidden",
  },

  // Rows
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.text,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rowValue: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textTertiary,
  },
  rowChevron: {
    fontFamily: fonts.sans,
    fontSize: 18,
    color: colors.textTertiary,
  },

  // Sign in buttons
  signInButton: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    alignItems: "center",
  },
  signInText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.surface,
  },
  signInButtonGoogle: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  signInTextGoogle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.text,
  },
  signInNote: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
    paddingBottom: spacing.md,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  footerTagline: {
    fontFamily: fonts.serifMedium,
    fontSize: 15,
    color: colors.textTertiary,
    fontStyle: "italic",
    marginBottom: spacing.xs,
  },
  footerVersion: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
