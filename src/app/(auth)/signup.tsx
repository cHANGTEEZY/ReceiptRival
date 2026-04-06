import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View, useColorScheme } from "react-native";
import { KeyboardAvoidingWrapper } from "../../components/SafeAreaWrapper";
import ReceiptRival from "../../components/ReceiptRival";
import { authClient } from "../../lib/auth-client";
import {
  Button,
  Card,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "heroui-native";
import { PasswordToggleInput } from "./PasswordToggleInput";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrs = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const iconMuted = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const router = useRouter();

  const formRef = useRef({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrs, setFieldErrs] = useState<FieldErrs>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearNameError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.name) return prev;
      const { name: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearEmailError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.email) return prev;
      const { email: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearPasswordError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.password) return prev;
      const { password: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearConfirmError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.confirm) return prev;
      const { confirm: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    setApiError(null);
    const name = formRef.current.name.trim();
    const email = formRef.current.email.trim();
    const password = formRef.current.password;
    const confirmPassword = formRef.current.confirmPassword;

    const next: FieldErrs = {};

    if (name === "") next.name = "Name is required.";
    if (email === "") next.email = "Email is required.";
    else if (!EMAIL_RE.test(email))
      next.email = "Enter a valid email address.";
    if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (confirmPassword.length === 0)
      next.confirm = "Confirm your password.";
    else if (password !== confirmPassword)
      next.confirm = "Passwords do not match.";

    if (Object.keys(next).length > 0) {
      setFieldErrs(next);
      return;
    }

    setFieldErrs({});
    setIsSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
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
  }, [router]);

  const formRefAsRecord = formRef as React.MutableRefObject<
    Record<string, string>
  >;

  return (
    <KeyboardAvoidingWrapper
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        justifyContent: "flex-start",
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
      }}
    >
      <View className="gap-4">
        <View className="items-center gap-2">
          <ReceiptRival />
          <Text className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-purple-300/90">
            Sign up
          </Text>
          <Text className="text-center text-4xl font-bold leading-tight text-foreground">
            Create your account
          </Text>
          <Text className="text-center text-lg leading-6 text-muted-foreground">
            Same flow as sign in—add your details below and you&apos;re ready to
            split receipts.
          </Text>
        </View>

        <Card
          variant="transparent"
          className="rounded-2xl border border-border/80"
        >
          <Card.Header className="px-1 pb-0.5 pt-0">
            <Card.Title className="text-2xl">Your details</Card.Title>
            <Card.Description>
              Name, email, and a password—that&apos;s all we need.
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4 px-1 py-3">
            {apiError ? (
              <View className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
                <Text className="text-destructive text-sm">{apiError}</Text>
              </View>
            ) : null}

            <TextField isRequired isInvalid={Boolean(fieldErrs.name)}>
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
                  defaultValue=""
                  onChangeText={(t) => {
                    formRef.current.name = t;
                    clearNameError();
                  }}
                />
              </InputGroup>
              {fieldErrs.name ? (
                <FieldError>{fieldErrs.name}</FieldError>
              ) : null}
            </TextField>

            <TextField isRequired isInvalid={Boolean(fieldErrs.email)}>
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
                  defaultValue=""
                  onChangeText={(t) => {
                    formRef.current.email = t;
                    clearEmailError();
                  }}
                />
              </InputGroup>
              {fieldErrs.email ? (
                <FieldError>{fieldErrs.email}</FieldError>
              ) : null}
            </TextField>

            <PasswordToggleInput
              label="Password"
              iconMuted={iconMuted}
              autoComplete="new-password"
              description="Use at least 6 characters."
              errorText={fieldErrs.password ?? null}
              onValueChange={clearPasswordError}
              formRef={formRefAsRecord}
              fieldKey="password"
            />

            <PasswordToggleInput
              label="Confirm password"
              iconMuted={iconMuted}
              autoComplete="new-password"
              errorText={fieldErrs.confirm ?? null}
              onValueChange={clearConfirmError}
              formRef={formRefAsRecord}
              fieldKey="confirmPassword"
            />
          </Card.Body>

          <Card.Footer className="gap-4 px-1 pb-2 pt-1">
            <Button
              className="w-full"
              onPress={() => void onSubmit()}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={iconMuted} />
              ) : (
                <Button.Label>Create account</Button.Label>
              )}
            </Button>

            {/* OAuth — re-enable when Apple / Google are wired up
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
                  onPress={() => {
                    console.log("apple signup");
                    toast.show({
                      variant: "warning",
                      label: "Apple sign in Coming soon",
                    });
                  }}
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
                onPress={() => {
                  console.log("google signup");
                  toast.show({
                    variant: "warning",
                    label: "Google sign in Coming soon",
                  });
                }}
              >
                <Ionicons name="logo-google" size={20} color={iconMuted} />
                <Button.Label>Google</Button.Label>
              </Button>
            </View>
            */}
          </Card.Footer>
        </Card>

        <View className="flex-row flex-wrap justify-center gap-1 pb-4">
          <Text className="text-lg text-foreground">
            Already have an account?
          </Text>
          <Link href="/login" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-lg font-semibold text-purple-300">
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}
