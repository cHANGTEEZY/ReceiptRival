import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, Pressable, Text, View, useColorScheme } from "react-native";
import { KeyboardAvoidingWrapper } from "../../components/SafeAreaWrapper";
import {
  Button,
  Card,
  Description,
  FieldError,
  InputGroup,
  Label,
  TextField,
  useToast,
} from "heroui-native";
import { authClient } from "../../lib/auth-client";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const iconMuted = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailEmpty = submitted && email.trim() === "";
  const emailBadFormat =
    submitted &&
    email.trim() !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordShort = submitted && password.length < 6;

  const onSubmit = useCallback(async () => {
    setSubmitted(true);
    if (
      email.trim() === "" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 6
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password: password.trim(),
        rememberMe: true,
      });

      if (error) {
        const err = error as {
          message?: string;
          statusText?: string;
        };
        const message =
          err.message ??
          err.statusText ??
          "Could not sign in. Check your credentials and try again.";
        toast.show({
          variant: "danger",
          label: "Sign in failed",
          description: message,
        });
        return;
      }

      toast.show({
        variant: "success",
        label: "Welcome back",
        description: "You're signed in.",
        duration: 2200,
      });

      // Let the toast mount before navigation (full-screen change can hide it).
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 400);
    } catch (err) {
      toast.show({
        variant: "danger",
        label: "Sign in failed",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, toast]);

  return (
    <KeyboardAvoidingWrapper
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 24,
      }}
    >
      <View>
        <View>
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

        <Card variant="transparent">
          <Card.Header className="px-1 pb-1 pt-1">
            <Card.Title className="text-2xl">Sign in</Card.Title>
            <Card.Description>
              Enter your email and password to continue.
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4 px-1 py-5">
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
                <FieldError>Password must be at least 6 characters.</FieldError>
              )}
            </TextField>
          </Card.Body>

          <Card.Footer className="gap-4 px-1 pb-2 pt-2">
            <Button
              className="w-full"
              onPress={() => void onSubmit()}
              isDisabled={isSubmitting}
            >
              <Button.Label>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button.Label>
            </Button>

            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border-secondary" />
              <Text className="text-foreground text-lg">or</Text>
              <View className="h-px flex-1 bg-border-secondary" />
            </View>

            <View className="flex-row gap-3">
              {Platform.OS === "ios" && (
                <Button
                  variant="outline"
                  className="flex-1"
                  feedbackVariant="scale-highlight"
                  onPress={() => console.log("apple")}
                >
                  <Ionicons name="logo-apple" size={20} color={iconMuted} />
                  <Button.Label>Apple</Button.Label>
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                feedbackVariant="scale-highlight"
                onPress={() => console.log("google")}
              >
                <Ionicons name="logo-google" size={20} color={iconMuted} />
                <Button.Label>Google</Button.Label>
              </Button>
            </View>
          </Card.Footer>
        </Card>

        <View className="flex-row justify-center flex-wrap gap-1">
          <Text className="text-accent-foreground text-lg">New here?</Text>
          <Link href="/signup" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-purple-300 text-lg font-semibold">
                Join the rivalry
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}
