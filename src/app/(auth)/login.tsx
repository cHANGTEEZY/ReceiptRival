import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import SafeAreaWrapper, {
  KeyboardAvoidingWrapper,
} from "../../components/SafeAreaWrapper";
import {
  Button,
  Card,
  Description,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "heroui-native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const iconMuted = colorScheme === "dark" ? "#a3a3a3" : "#737373";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailEmpty = submitted && email.trim() === "";
  const emailBadFormat =
    submitted &&
    email.trim() !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordShort = submitted && password.length < 6;

  const onSubmit = useCallback(() => {
    setSubmitted(true);
    if (
      email.trim() === "" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 6
    ) {
      return;
    }
    // Wire Convex / auth here
  }, [email, password]);

  return (
    <KeyboardAvoidingWrapper
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
      }}
    >
      <View className="gap-8">
        <View className="gap-2">
          <Text className="text-foreground text-4xl font-bold text-center leading-tight">
            Welcome Back,
          </Text>
          <Text className="text-foreground text-4xl font-bold text-center leading-tight">
            Rival.
          </Text>
          <Text className="text-xl text-muted-foreground text-center">
            Who&apos;s paying tonight?
          </Text>
        </View>

        <Card className="w-full" variant="secondary">
          <Card.Header className="pb-0">
            <Card.Title className="text-lg">Sign in</Card.Title>
            <Card.Description>
              Enter your email and password to continue.
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4 pt-4">
            <TextField isRequired isInvalid={emailEmpty || emailBadFormat}>
              <Label>
                <Label.Text>Email</Label.Text>
              </Label>
              <InputGroup>
                <InputGroup.Prefix isDecorative>
                  <Ionicons name="mail-outline" size={20} color={iconMuted} />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </InputGroup>
              {(emailEmpty || emailBadFormat) && (
                <FieldError>
                  {emailEmpty
                    ? "Email is required."
                    : "Enter a valid email address."}
                </FieldError>
              )}
            </TextField>

            <TextField isRequired isInvalid={passwordShort}>
              <Label>
                <Label.Text>Password</Label.Text>
              </Label>
              <InputGroup>
                <InputGroup.Prefix isDecorative>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={iconMuted}
                  />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <InputGroup.Suffix>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={iconMuted}
                    />
                  </Pressable>
                </InputGroup.Suffix>
              </InputGroup>
              <Description>Use at least 6 characters.</Description>
              {passwordShort && (
                <FieldError>
                  Password must be at least 6 characters.
                </FieldError>
              )}
            </TextField>
          </Card.Body>

          <Card.Footer className="gap-4 pt-2">
            <Button className="w-full" onPress={onSubmit}>
              <Button.Label>Sign in</Button.Label>
            </Button>
            <View className="flex-row justify-center flex-wrap gap-1">
              <Text className="text-muted-foreground text-sm">
                Don&apos;t have an account?
              </Text>
              <Link href="/signup" asChild>
                <Pressable hitSlop={8}>
                  <Text className="text-accent-foreground text-sm font-semibold">
                    Sign up
                  </Text>
                </Pressable>
              </Link>
            </View>
          </Card.Footer>
        </Card>
      </View>
    </KeyboardAvoidingWrapper>
  );
}
