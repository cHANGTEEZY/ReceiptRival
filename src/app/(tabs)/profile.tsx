import React, { useCallback } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AddCircleIcon,
  Camera01Icon,
  Clock03Icon,
  ColorsIcon,
  LockIcon,
  Logout01Icon,
  Notification01Icon,
  PencilEdit02Icon,
  Settings01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Avatar } from "heroui-native/avatar";
import { Button } from "heroui-native/button";
import { ListGroup } from "heroui-native/list-group";

import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import { authClient } from "../../lib/auth-client";

const ICON_STROKE = 1.5;

function getInitials(name: string | null | undefined) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function useProfileListIconColor() {
  const scheme = useColorScheme();
  return scheme === "dark" ? "#ffffff" : "#6b21a8";
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text className="text-foreground/55 mb-2 px-1 text-xs font-semibold uppercase tracking-wide">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const listIconColor = useProfileListIconColor();
  const { data } = authClient.useSession();
  const user = data?.user;
  const name = user?.name ?? "Guest";
  const email = user?.email ?? "";
  const avatarUri = user?.image;

  const openPrivacyPolicy = useCallback(() => {
    const url = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
    if (url) {
      void Linking.openURL(url);
      return;
    }
    Alert.alert(
      "Privacy policy",
      "Set EXPO_PUBLIC_PRIVACY_POLICY_URL in your environment to open your privacy policy.",
    );
  }, []);

  const openSettings = useCallback(() => {
    Alert.alert("Settings", "Account and app settings will be available soon.");
  }, []);

  const openAppearance = useCallback(() => {
    Alert.alert(
      "Appearance",
      "Theme controls are coming soon. The app currently follows your device light/dark setting.",
    );
  }, []);

  const confirmSignOut = useCallback(() => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => authClient.signOut(),
      },
    ]);
  }, []);

  const listSurfaceClass =
    "overflow-hidden rounded-2xl border border-border bg-surface";

  return (
    <SafeAreaWrapper edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        className="flex-1 bg-background px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 82 }}
      >
        <Text className="text-foreground mt-2 text-center text-xl font-bold">
          Profile
        </Text>

        <View className="mt-10 items-center">
          <View className="relative">
            <Avatar
              alt="Profile photo"
              size="lg"
              variant="soft"
              color="accent"
              className="h-[100px] w-[100px]"
            >
              {avatarUri ? <Avatar.Image source={{ uri: avatarUri }} /> : null}
              <Avatar.Fallback className="font-bold text-2xl">
                {getInitials(name)}
              </Avatar.Fallback>
            </Avatar>

            <Button
              isIconOnly
              size="sm"
              variant="primary"
              feedbackVariant="scale-highlight"
              className="absolute -bottom-0.5 -right-0.5 h-9 w-9 rounded-full shadow-sm"
              accessibilityLabel="Edit profile photo"
              onPress={() =>
                Alert.alert(
                  "Profile photo",
                  "Profile photo updates will be available in a future release.",
                )
              }
            >
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                size={18}
                color="#ffffff"
                strokeWidth={ICON_STROKE}
              />
            </Button>
          </View>

          <Text className="text-foreground mt-5 text-center text-xl font-bold">
            {name}
          </Text>
          {email ? (
            <Text className="mt-1 text-center text-base text-foreground">
              {email}
            </Text>
          ) : null}
        </View>

        <ProfileSection title="App preferences">
          <ListGroup variant="secondary" className={listSurfaceClass}>
            <ListGroup.Item
              onPress={openAppearance}
              className="border-b border-border"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={ColorsIcon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Appearance</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  Follows system · {scheme === "dark" ? "Dark" : "Light"} now
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <ListGroup.Item
              onPress={() => router.push("/Notifications")}
              className="border-b-0"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={Notification01Icon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Notifications</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  Alerts, reminders, and nudges
                </ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        </ProfileSection>

        <ProfileSection title="Activity">
          <ListGroup variant="secondary" className={listSurfaceClass}>
            <ListGroup.Item
              onPress={() => router.push("/splits")}
              className="border-b border-border"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={Clock03Icon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Split history</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <ListGroup.Item
              onPress={() => router.push("/friends")}
              className="border-b border-border"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={UserMultiple02Icon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Friends</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <ListGroup.Item
              onPress={() => router.push("/NewSplit")}
              className="border-b border-border"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={AddCircleIcon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>New split</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <ListGroup.Item
              onPress={() => router.push("/camera")}
              className="border-b-0"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={Camera01Icon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Scan receipt</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        </ProfileSection>

        <ProfileSection title="Legal">
          <ListGroup variant="secondary" className={listSurfaceClass}>
            <ListGroup.Item onPress={openPrivacyPolicy} className="border-b-0">
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={LockIcon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Privacy policy</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
          </ListGroup>
        </ProfileSection>

        <ProfileSection title="Account">
          <ListGroup variant="secondary" className={listSurfaceClass}>
            <ListGroup.Item
              onPress={openSettings}
              className="border-b border-border"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/12">
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    size={22}
                    color={listIconColor}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>Settings</ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix />
            </ListGroup.Item>
            <ListGroup.Item
              onPress={confirmSignOut}
              className="border-b-0 bg-red-500/10 dark:bg-red-950/45"
            >
              <ListGroup.ItemPrefix className="pl-1">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500/20 dark:bg-red-900/40">
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    size={22}
                    color={scheme === "dark" ? "#fca5a5" : "#b91c1c"}
                    strokeWidth={ICON_STROKE}
                  />
                </View>
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle className="text-red-700 dark:text-red-300">
                  Log out
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix
                iconProps={{ color: scheme === "dark" ? "#fca5a5" : "#b91c1c" }}
              />
            </ListGroup.Item>
          </ListGroup>
        </ProfileSection>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
