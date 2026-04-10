import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Redirect } from "expo-router";
import AuthSessionSplash from "../../components/AuthSessionSplash";
import { authClient } from "../../lib/auth-client";

export default function TabLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <AuthSessionSplash />;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
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
      <NativeTabs.Trigger name="rivals">
        <Icon sf="person.2.fill" drawable="custom_rivals_drawable" />
        <Label>Rivals</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" drawable="custom_profile_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
