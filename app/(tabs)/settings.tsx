import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius, typography } from "@/constants/theme";
import { REGIONS } from "@/constants/regions";
import PickerModal from "@/components/PickerModal";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

// ── Sub-components ─────────────────────────────────────────────

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function SettingsRow({ label, value, onPress, destructive }: SettingsRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Text style={styles.rowChevron}>›</Text>}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ── Main component ─────────────────────────────────────────────

export default function SettingsScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [regionSlug, setRegionSlug] = useState("vancouver-bc");
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  const selectedRegion = useMemo(
    () => REGIONS.find((r) => r.slug === regionSlug) ?? null,
    [regionSlug]
  );

  const regionOptions = useMemo(
    () => REGIONS.map((r) => ({ label: r.label, value: r.slug })),
    []
  );

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's submission count
  useEffect(() => {
    if (!session?.user) {
      setSubmissionCount(0);
      return;
    }
    (async () => {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      setSubmissionCount(count ?? 0);
    })();
  }, [session]);

  // Auth handlers
  async function handleSignInWithEmail() {
    // For MVP, use a simple email magic link flow
    Alert.prompt(
      "Sign in",
      "Enter your email to receive a magic link.",
      async (email) => {
        if (!email) return;
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert(
            "Check your email",
            `We sent a sign-in link to ${email}.`
          );
        }
      },
      "plain-text",
      "",
      "email-address"
    );
  }

  async function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all your submissions. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Not yet available",
              "Account deletion will be available in a future update. Contact support for immediate requests."
            );
          },
        },
      ]
    );
  }

  const userEmail = session?.user?.email;
  const isSignedIn = !!session;

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
          {isSignedIn ? (
            <>
              <View style={styles.accountInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(userEmail?.[0] ?? "?").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountEmail}>{userEmail}</Text>
                  <Text style={styles.accountMeta}>
                    {submissionCount} report{submissionCount !== 1 ? "s" : ""}{" "}
                    submitted
                  </Text>
                </View>
              </View>
              <SettingsRow label="Sign out" onPress={handleSignOut} />
            </>
          ) : (
            <>
              <Pressable
                style={styles.signInButton}
                onPress={handleSignInWithEmail}
              >
                <Text style={styles.signInText}>Sign in with email</Text>
              </Pressable>
              <Text style={styles.signInNote}>
                Required to submit reports. Browsing is always free.
              </Text>
            </>
          )}
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingsRow
            label="Home region"
            value={selectedRegion?.label ?? "Select region"}
            onPress={() => setShowRegionPicker(true)}
          />
          <SettingsRow label="Currency" value="CAD" />
          <SettingsRow label="Price alerts" value="Coming soon" />
          <SettingsRow label="Weekly digest" value="Coming soon" />
        </View>

        {/* Your data */}
        {isSignedIn && (
          <>
            <SectionHeader title="Your data" />
            <View style={styles.section}>
              <SettingsRow
                label="My reports"
                value={String(submissionCount)}
              />
              <SettingsRow label="Export my data" value="Coming soon" />
              <SettingsRow
                label="Delete my account"
                onPress={handleDeleteAccount}
                destructive
              />
            </View>
          </>
        )}

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingsRow
            label="How FairDrive works"
            onPress={() =>
              Alert.alert(
                "How FairDrive works",
                "FairDrive collects anonymous, community-reported car prices to help buyers know what others actually paid — out-the-door, with all fees included.\n\nPrices are aggregated into fair market ranges using verified purchase data. No dealer influence, ever."
              )
            }
          />
          <SettingsRow
            label="Why no dealer names"
            onPress={() =>
              Alert.alert(
                "Why no dealer names",
                "FairDrive focuses on prices, not dealers. Naming specific dealers would invite manipulation and legal risk.\n\nOur goal is price transparency — knowing the fair range matters more than knowing where one person shopped."
              )
            }
          />
          <SettingsRow label="Privacy policy" onPress={() =>
            Linking.openURL("https://fairdrive.app/privacy")
          } />
          <SettingsRow label="Terms of service" onPress={() =>
            Linking.openURL("https://fairdrive.app/terms")
          } />
          <SettingsRow label="Send feedback" onPress={() =>
            Linking.openURL("mailto:hello@fairdrive.app")
          } />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTagline}>
            Independent. Never dealer-funded.
          </Text>
          <Text style={styles.footerVersion}>FairDrive v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Region picker */}
      <PickerModal
        visible={showRegionPicker}
        title="Home region"
        options={regionOptions}
        selectedValue={regionSlug}
        onSelect={setRegionSlug}
        onClose={() => setShowRegionPicker(false)}
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
  rowLabelDestructive: {
    color: colors.error,
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

  // Account info (signed in)
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  accountDetails: {
    flex: 1,
  },
  accountEmail: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  accountMeta: {
    fontFamily: fonts.sans,
    fontSize: 13,
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
