import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import { KeyboardAvoidingWrapper } from "../../components/SafeAreaWrapper";
import { useToast } from "heroui-native/toast";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { TextField } from "heroui-native/text-field";
import { Label } from "heroui-native/label";
import { InputGroup } from "heroui-native/input-group";
import { FieldError } from "heroui-native/field-error";

import { authClient } from "../../lib/auth-client";
import ReceiptRival from "../../components/ReceiptRival";
import { PasswordToggleInput } from "./PasswordToggleInput";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrs = { email?: string; password?: string };

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const iconMuted = colorScheme === "dark" ? "#a3a3a3" : "#737373";
  const { toast } = useToast();

  const formRef = useRef({ email: "", password: "" });
  const [fieldErrs, setFieldErrs] = useState<FieldErrs>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearEmailFieldError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.email) return prev;
      const { email: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearPasswordFieldError = useCallback(() => {
    setFieldErrs((prev) => {
      if (!prev.password) return prev;
      const { password: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const onSubmit = useCallback(async () => {
    const rawEmail = formRef.current.email.trim();
    const password = formRef.current.password;
    const next: FieldErrs = {};

    if (rawEmail === "") next.email = "Email is required.";
    else if (!EMAIL_RE.test(rawEmail))
      next.email = "Enter a valid email address.";
    if (password.length < 6)
      next.password = "Password must be at least 6 characters.";

    if (Object.keys(next).length > 0) {
      setFieldErrs(next);
      return;
    }

    setFieldErrs({});
    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({
        email: rawEmail,
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
  }, [toast]);

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
            Sign in
          </Text>
          <Text className="text-center text-4xl font-bold leading-tight text-foreground">
            Welcome back
          </Text>
          <Text className="text-center text-lg leading-6 text-muted-foreground">
            Pick up where you left off—settle up and see who&apos;s paying
            tonight.
          </Text>
        </View>

        <Card
          variant="transparent"
          className="rounded-2xl border border-border/80"
        >
          <Card.Header className="px-1 pb-0.5 pt-0">
            <Card.Title className="text-2xl">Your credentials</Card.Title>
            <Card.Description>
              Email and password you used when you joined.
            </Card.Description>
          </Card.Header>

          <Card.Body className="gap-4 px-1 py-3">
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
                    clearEmailFieldError();
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
              autoComplete="password"
              description="Use at least 6 characters."
              errorText={fieldErrs.password ?? null}
              onValueChange={clearPasswordFieldError}
              formRef={formRef}
              fieldKey="password"
            />
          </Card.Body>

          <Card.Footer className="gap-4 px-1 pb-2 pt-1">
            <Button
              className="w-full"
              onPress={() => void onSubmit()}
              isDisabled={isSubmitting}
            >
              <Button.Label>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button.Label>
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
                  onPress={() => {
                    console.log("apple");
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
                onPress={() => {
                  console.log("google");
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
          <Text className="text-lg text-foreground">New here?</Text>
          <Link href="/signup" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-lg font-semibold text-purple-300">
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}
