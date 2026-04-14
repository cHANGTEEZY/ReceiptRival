import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Tabs } from "expo-router";
import { RequireAuth } from "../../lib/auth-middleware";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <RequireAuth>
      {Platform.OS === "ios" ? (
        <TabStackIos />
      ) : (
        <TabStackAndroid />
      )}
    </RequireAuth>
  );
}

function TabStackIos() {
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

function TabStackAndroid() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="splits" options={{ title: "Splits" }} />
      <Tabs.Screen name="rivals" options={{ title: "Rivals" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
