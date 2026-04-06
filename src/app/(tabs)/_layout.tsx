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
      <NativeTabs.Trigger name="splits">
        <Icon sf="list.bullet" drawable="custom_splits_drawable" />
        <Label>Splits</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="friends">
        <Icon sf="person.2.fill" drawable="custom_friends_drawable" />
        <Label>Friends</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="custom_profile_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
