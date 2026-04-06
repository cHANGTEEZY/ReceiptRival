import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { Pressable } from "react-native";
import {
  Description,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "heroui-native";

type Props = {
  label: string;
  placeholder?: string;
  iconMuted: string;
  autoComplete: "password" | "new-password";
  description?: string;
  errorText?: string | null;
  onValueChange: () => void;
  formRef: React.MutableRefObject<Record<string, string>>;
  fieldKey: string;
};

const PasswordToggleInputInner = ({
  label,
  placeholder = "••••••••",
  iconMuted,
  autoComplete,
  description,
  errorText,
  onValueChange,
  formRef,
  fieldKey,
}: Props) => {
  const [visible, setVisible] = useState(false);

  const onChangeText = useCallback(
    (t: string) => {
      formRef.current[fieldKey] = t;
      onValueChange();
    },
    [fieldKey, formRef, onValueChange],
  );

  return (
    <TextField isRequired isInvalid={Boolean(errorText)}>
      <Label>
        <Label.Text>{label}</Label.Text>
      </Label>
      <InputGroup>
        <InputGroup.Prefix isDecorative>
          <Ionicons name="lock-closed-outline" size={20} color={iconMuted} />
        </InputGroup.Prefix>
        <InputGroup.Input
          placeholder={placeholder}
          secureTextEntry={!visible}
          autoComplete={autoComplete}
          defaultValue=""
          onChangeText={onChangeText}
        />
        <InputGroup.Suffix>
          <Pressable
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={iconMuted}
            />
          </Pressable>
        </InputGroup.Suffix>
      </InputGroup>
      {description ? <Description>{description}</Description> : null}
      {errorText ? <FieldError>{errorText}</FieldError> : null}
    </TextField>
  );
};

export const PasswordToggleInput = memo(PasswordToggleInputInner);
