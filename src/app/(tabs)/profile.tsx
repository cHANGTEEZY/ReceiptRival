import React, { useCallback } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AddCircleIcon,
  Camera01Icon,
  Clock03Icon,
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
import { Separator } from "heroui-native/separator";

import SafeAreaWrapper from "../../components/SafeAreaWrapper";
import { authClient } from "../../lib/auth-client";
import { ProfileRow } from "../../features/Profile/component/ProfileRow";

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

export default function ProfileScreen() {
  const router = useRouter();
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
                strokeWidth={1.5}
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

        <Separator className="mt-12" />

        <View className="pt-2 gap-1">
          <ProfileRow
            icon={Clock03Icon}
            label="Split history"
            onPress={() => router.push("/splits")}
          />
          <ProfileRow
            icon={UserMultiple02Icon}
            label="Friends"
            onPress={() => router.push("/friends")}
          />
          <ProfileRow
            icon={AddCircleIcon}
            label="New split"
            onPress={() => router.push("/NewSplit")}
          />
          <ProfileRow
            icon={Camera01Icon}
            label="Scan receipt"
            onPress={() => router.push("/camera")}
          />
          <ProfileRow
            icon={Notification01Icon}
            label="Notifications"
            onPress={() => router.push("/Notifications")}
          />
          <ProfileRow
            icon={LockIcon}
            label="Privacy policy"
            onPress={openPrivacyPolicy}
          />
          <ProfileRow
            icon={Settings01Icon}
            label="Settings"
            onPress={openSettings}
          />
          <ProfileRow
            icon={Logout01Icon}
            label="Log out"
            onPress={confirmSignOut}
            className="bg-red-500 dark:bg-red-800"
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}
