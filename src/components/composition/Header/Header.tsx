import React, {
  Children,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import { Image, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import ReceiptRival from "../../ReceiptRival";
import { authClient } from "../../../lib/auth-client";
import type { HeaderSlotProps } from "./header-context";

let cachedAvatarUri: string | undefined;

function HeaderNotification(_props: HeaderSlotProps) {
  return null;
}
HeaderNotification.displayName = "Header.Notification";

function HeaderProfile(_props: HeaderSlotProps) {
  return null;
}
HeaderProfile.displayName = "Header.Profile";

function isHeaderNotification(
  child: ReactElement,
): child is ReactElement<HeaderSlotProps> {
  return (
    child.type === HeaderNotification ||
    (typeof child.type !== "string" &&
      "displayName" in child.type &&
      (child.type as { displayName?: string }).displayName ===
        "Header.Notification")
  );
}

function isHeaderProfile(
  child: ReactElement,
): child is ReactElement<HeaderSlotProps> {
  return (
    child.type === HeaderProfile ||
    (typeof child.type !== "string" &&
      "displayName" in child.type &&
      (child.type as { displayName?: string }).displayName === "Header.Profile")
  );
}

function collectSlots(children: ReactNode) {
  let showNotification = false;
  let showProfile = false;
  let notificationOverride: ReactNode;
  let profileOverride: ReactNode;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (isHeaderNotification(child)) {
      showNotification = true;
      notificationOverride = child.props.children;
    }
    if (isHeaderProfile(child)) {
      showProfile = true;
      profileOverride = child.props.children;
    }
  });

  return {
    showNotification,
    showProfile,
    notificationOverride,
    profileOverride,
  };
}

function HeaderRoot({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const {
    showNotification,
    showProfile,
    notificationOverride,
    profileOverride,
  } = collectSlots(children);

  if (session?.user?.image) {
    cachedAvatarUri = session.user.image;
  } else if (!isPending && !session?.user) {
    cachedAvatarUri = undefined;
  }

  const avatarUri = session?.user?.image ?? cachedAvatarUri;

  const isProfileScreen =
    pathname === "/profile" ||
    pathname.endsWith("/profile") ||
    pathname.includes("/(tabs)/profile");
  const isNotificationsScreen =
    pathname.includes("Notifications") || pathname.endsWith("/Notifications");

  const showNotificationControl = showNotification && !isNotificationsScreen;
  const showProfileControl = showProfile;

  const goProfile = () => {
    if (isProfileScreen) return;
    router.push("/(tabs)/profile");
  };

  const isDark = useColorScheme() === "dark";

  return (
    <View
      className="bg-background-secondary/85"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between pl-4 pb-4">
        <View className="min-w-0 flex-1 pr-3">
          <ReceiptRival />
        </View>
        <View className="flex-row items-center ">
          {showNotificationControl ? (
            <Button
              variant="ghost"
              onPress={() => router.push("/Notifications")}
            >
              {notificationOverride ?? (
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={isDark ? "#ffffff" : "#000000"}
                />
              )}
            </Button>
          ) : null}
          {showProfileControl ? (
            <Button variant="ghost" onPress={goProfile}>
              {profileOverride ??
                (isProfileScreen || !avatarUri ? (
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={isDark ? "#ffffff" : "#000000"}
                  />
                ) : (
                  <Image
                    source={{ uri: avatarUri }}
                    className="h-10 w-10 rounded-full"
                  />
                ))}
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

HeaderRoot.Notification = HeaderNotification;
HeaderRoot.Profile = HeaderProfile;

export default HeaderRoot;
