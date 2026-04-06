import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();

  if (!session?.session.token && !isPending) {
    return router.replace("/(auth)/login");
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
