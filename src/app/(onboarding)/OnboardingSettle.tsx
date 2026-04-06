import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Button } from "heroui-native";
import { store } from "../../lib/key-store";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import ReceiptRival from "../../components/ReceiptRival";
import { ONBOARDING } from "./onboarding-theme";

const H_PADDING = 24;

const TOP_RIVAL_OWES = 428;

const OTHER_RIVALS = [
  { rank: 2, name: "Suhana K.", amount: 142, emoji: "🐢" },
  { rank: 3, name: "Sarvajit Aunty", amount: 89, emoji: "🎭" },
  { rank: 4, name: "Sachin Maharjan", amount: 56, emoji: "⚡" },
  { rank: 5, name: "Pandey", amount: 44, emoji: "🎯" },
  { rank: 6, name: "Aasamsha", amount: 33, emoji: "✨" },
  { rank: 7, name: "Khushi", amount: 22, emoji: "🌸" },
] as const;

const TOTAL_OWED_USD =
  TOP_RIVAL_OWES + OTHER_RIVALS.reduce((sum, r) => sum + r.amount, 0);

function SocialHealthBar() {
  const { width } = useWindowDimensions();
  const barWidth = Math.min(width - H_PADDING * 2 - 32, 340);
  const height = 12;
  const thumbLeft = barWidth * 0.78 - 7;

  return (
    <View style={styles.healthWrap}>
      <View style={{ width: barWidth, height }}>
        <Svg width={barWidth} height={height}>
          <Defs>
            <LinearGradient id="healthBarOnboarding" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={ONBOARDING.red} />
              <Stop offset="0.55" stopColor={ONBOARDING.purpleMid} />
              <Stop offset="1" stopColor={ONBOARDING.purpleLight} />
            </LinearGradient>
          </Defs>
          <Rect
            width={barWidth}
            height={height}
            rx={height / 2}
            ry={height / 2}
            fill="url(#healthBarOnboarding)"
          />
        </Svg>
        <View
          pointerEvents="none"
          style={[
            styles.healthThumb,
            {
              top: height / 2 - 7,
              left: thumbLeft,
              borderColor: ONBOARDING.bg,
              backgroundColor: ONBOARDING.purple,
            },
          ]}
        />
      </View>
    </View>
  );
}

const OnboardingSettle = () => {
  const handleCompleteOnboarding = () => {
    store.set("isOnboardingComplete", "true");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaWrapper backgroundColor={ONBOARDING.bg}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <ReceiptRival brandColor={ONBOARDING.purple} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.titleBlock}>
              <Text style={styles.heroTitleLine}>
                See who&apos;s really
              </Text>
              <Text style={[styles.heroTitleLine, styles.heroTitleAccent]}>
                slow to pay you back.
              </Text>
            </View>
            <Text style={styles.heroSub}>
              Keep track with the{" "}
              <Text style={styles.heroPurple}>Deadbeat Leaderboard.</Text>
            </Text>
          </View>

          <View style={styles.cardsCol}>
            <View style={styles.cardTopRival}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarEmoji}>💀</Text>
              </View>
              <View style={styles.cardTopMiddle}>
                <Text style={styles.nameLg} numberOfLines={1}>
                  Lode &apos;The Forgetter&apos;
                </Text>
                <View style={styles.badgeTop}>
                  <Text style={styles.badgeTopText}>Top rival</Text>
                </View>
              </View>
              <View style={styles.owesCol}>
                <Text style={styles.owesLabel}>Owes you</Text>
                <Text style={styles.owesAmount}>${TOP_RIVAL_OWES}</Text>
              </View>
            </View>

            {Array.from(
              { length: Math.ceil(OTHER_RIVALS.length / 2) },
              (_, row) => {
                const left = OTHER_RIVALS[row * 2];
                const right = OTHER_RIVALS[row * 2 + 1];
                return (
                  <View key={left.rank} style={styles.rowPair}>
                    <View style={styles.cardSmall}>
                      <View style={styles.rankRow}>
                        <Text style={styles.emojiMd}>{left.emoji}</Text>
                        <Text style={styles.rankNum}>#{left.rank}</Text>
                      </View>
                      <Text style={styles.nameMd} numberOfLines={2}>
                        {left.name}
                      </Text>
                      <Text style={styles.amtMd}>${left.amount}</Text>
                    </View>
                    {right ? (
                      <View style={styles.cardSmall}>
                        <View style={styles.rankRow}>
                          <Text style={styles.emojiMd}>{right.emoji}</Text>
                          <Text style={styles.rankNum}>#{right.rank}</Text>
                        </View>
                        <Text style={styles.nameMd} numberOfLines={2}>
                          {right.name}
                        </Text>
                        <Text style={styles.amtMd}>${right.amount}</Text>
                      </View>
                    ) : (
                      <View style={styles.cardSmallSpacer} />
                    )}
                  </View>
                );
              },
            )}

            <View style={styles.cardSocial}>
              <Text style={styles.socialLabel}>Social health</Text>
              <Text style={styles.socialLine}>
                The world owes you{" "}
                <Text style={styles.socialAmt}>
                  $
                  {TOTAL_OWED_USD.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Text>
              <SocialHealthBar />
              <View style={styles.socialLegend}>
                <Text style={styles.legendRed}>High debt</Text>
                <Text style={styles.legendMid}>Balanced</Text>
                <Text style={styles.legendPurple}>Debt free</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            size="lg"
            className="w-full rounded-xl"
            onPress={handleCompleteOnboarding}
          >
            <Button.Label className="text-xl font-semibold">
              Get started
            </Button.Label>
            <Ionicons name="arrow-forward" size={24} color={ONBOARDING.text} />
          </Button>
          <Text style={styles.disclaimer}>
            By continuing, you agree to settle your scores and face the
            consequences of the leaderboard.
          </Text>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

export default OnboardingSettle;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    backgroundColor: ONBOARDING.bg,
  },
  headerRow: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
    gap: 8,
  },
  footer: {
    flexShrink: 0,
    width: "100%",
    alignSelf: "center",
    gap: 12,
  },
  hero: {
    gap: 12,
    paddingTop: 24,
  },
  titleBlock: {
    gap: 4,
  },
  heroTitleLine: {
    textAlign: "center",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    color: ONBOARDING.text,
  },
  heroTitleAccent: {
    color: ONBOARDING.purple,
    fontStyle: "italic",
  },
  heroSub: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 28,
    color: ONBOARDING.textMuted,
  },
  heroPurple: {
    fontWeight: "600",
    color: ONBOARDING.purple,
  },
  cardsCol: {
    marginTop: 24,
    gap: 12,
  },
  cardTopRival: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.cardBg,
    padding: 16,
  },
  avatarBox: {
    height: 56,
    width: 56,
    borderRadius: 16,
    backgroundColor: "rgba(63, 63, 70, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 24,
  },
  cardTopMiddle: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nameLg: {
    fontSize: 18,
    fontWeight: "600",
    color: ONBOARDING.text,
  },
  badgeTop: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(248, 113, 113, 0.2)",
  },
  badgeTopText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: ONBOARDING.red,
  },
  owesCol: {
    alignItems: "flex-end",
  },
  owesLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: ONBOARDING.red,
  },
  owesAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: ONBOARDING.red,
  },
  rowPair: {
    flexDirection: "row",
    gap: 12,
  },
  cardSmall: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.cardBg,
    padding: 12,
  },
  cardSmallSpacer: {
    flex: 1,
    minWidth: 0,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emojiMd: {
    fontSize: 20,
  },
  rankNum: {
    fontSize: 14,
    fontWeight: "700",
    color: ONBOARDING.textMuted,
  },
  nameMd: {
    fontWeight: "600",
    color: ONBOARDING.text,
  },
  amtMd: {
    fontSize: 18,
    fontWeight: "700",
    color: ONBOARDING.text,
  },
  cardSocial: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.cardBg,
    padding: 16,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: ONBOARDING.textMuted,
  },
  socialLine: {
    marginTop: 12,
    color: ONBOARDING.text,
    fontSize: 16,
  },
  socialAmt: {
    fontSize: 24,
    fontWeight: "700",
    color: ONBOARDING.purple,
  },
  healthWrap: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  healthThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  socialLegend: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendRed: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: ONBOARDING.red,
    opacity: 0.95,
  },
  legendMid: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: ONBOARDING.textMuted,
  },
  legendPurple: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    color: ONBOARDING.purple,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: ONBOARDING.textMuted,
  },
});
