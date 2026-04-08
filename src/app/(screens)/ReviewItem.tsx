import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  getOcrFlatStructuredFields,
  type OCRApiResponse,
} from "../../types/ocr.type";
import SafeAreaWrapper from "../../components/SafeAreaWrapper";

function parseOcrParam(
  raw: string | string[] | undefined,
): OCRApiResponse | null {
  if (raw == null) return null;
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) return null;
  try {
    return JSON.parse(str) as OCRApiResponse;
  } catch {
    return null;
  }
}

const ReviewItem = () => {
  const params = useLocalSearchParams<{ data?: string | string[] }>();

  const ocrResponse: OCRApiResponse | null = useMemo(
    () => parseOcrParam(params.data),
    [params.data],
  );

  const payload = ocrResponse?.data;
  const flatStructured = payload ? getOcrFlatStructuredFields(payload) : {};

  console.log("Data received:", ocrResponse?.data.formatted?.data.lineItems);

  return (
    <SafeAreaWrapper>
      <View style={styles.flex1}></View>
    </SafeAreaWrapper>
  );
};

export default ReviewItem;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
