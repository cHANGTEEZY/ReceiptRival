import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { KeyboardAvoidingWrapper } from "../../components/SafeAreaWrapper";
import { authClient } from "../../lib/auth-client";
import {
  Button,
  Card,
  Description,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "heroui-native";

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const iconMuted = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameEmpty = submitted && name.trim() === "";
  const emailEmpty = submitted && email.trim() === "";
  const emailBadFormat =
    submitted &&
    email.trim() !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordShort = submitted && password.length < 6;
  const confirmInvalid =
    submitted &&
    (confirmPassword.length === 0 || password !== confirmPassword);

  const onSubmit = useCallback(async () => {
    setSubmitted(true);
    setApiError(null);

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 6 ||
      confirmPassword.length === 0 ||
      password !== confirmPassword
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (error) {
        setApiError(
          error.message ?? "Could not create your account. Try again.",
        );
        return;
      }

      router.replace("/(tabs)");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, name, password, confirmPassword, router]);

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
            Join the
          </Text>
          <Text className="text-foreground text-4xl font-bold text-center leading-tight">
            Rivalry.
          </Text>
          <Text className="text-xl text-muted-foreground text-center">
            Create an account to split smarter.
          </Text>
        </View>

        <Card variant="transparent">
          <Card.Header className="px-1 pb-1 pt-1">
            <Card.Title className="text-2xl">Sign up</Card.Title>
            <Card.Description>
              Enter your details to create your account.
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4 px-1 py-5">
            {apiError ? (
              <View className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
                <Text className="text-destructive text-sm">{apiError}</Text>
              </View>
            ) : null}

            <TextField isRequired isInvalid={nameEmpty}>
              <Label>
                <Label.Text>Name</Label.Text>
              </Label>
              <InputGroup>
                <InputGroup.Prefix isDecorative>
                  <Ionicons name="person-outline" size={20} color={iconMuted} />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="Alex Rival"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
              </InputGroup>
              {nameEmpty && (
                <FieldError>Name is required.</FieldError>
              )}
            </TextField>

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
                  autoComplete="new-password"
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

            <TextField isRequired isInvalid={confirmInvalid}>
              <Label>
                <Label.Text>Confirm password</Label.Text>
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
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <InputGroup.Suffix>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={iconMuted}
                    />
                  </Pressable>
                </InputGroup.Suffix>
              </InputGroup>
              {confirmInvalid && (
                <FieldError>
                  {confirmPassword.length === 0
                    ? "Confirm your password."
                    : "Passwords do not match."}
                </FieldError>
              )}
            </TextField>
          </Card.Body>

          <Card.Footer className="gap-4 px-1 pb-2 pt-2">
            <Button
              className="w-full"
              onPress={onSubmit}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={iconMuted} />
              ) : (
                <Button.Label>Create account</Button.Label>
              )}
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
                  isDisabled={isSubmitting}
                  onPress={() => console.log("apple signup")}
                >
                  <Ionicons name="logo-apple" size={20} color={iconMuted} />
                  <Button.Label>Apple</Button.Label>
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                feedbackVariant="scale-highlight"
                isDisabled={isSubmitting}
                onPress={() => console.log("google signup")}
              >
                <Ionicons name="logo-google" size={20} color={iconMuted} />
                <Button.Label>Google</Button.Label>
              </Button>
            </View>
          </Card.Footer>
        </Card>

        <View className="flex-row justify-center flex-wrap gap-1">
          <Text className="text-accent-foreground text-lg">Already in?</Text>
          <Link href="/login" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-purple-300 text-lg font-semibold">
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}
