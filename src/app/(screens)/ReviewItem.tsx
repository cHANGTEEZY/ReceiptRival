import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  getOcrFlatStructuredFields,
  type OCRApiResponse,
} from "../../types/ocr.type";

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

  console.log("Data received:", ocrResponse);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>ReviewItem</Text>
      {!ocrResponse || !payload ? (
        <Text style={styles.muted}>No OCR data in route params.</Text>
      ) : (
        <ScrollView style={styles.scroll}>
          <Text style={styles.label}>Text</Text>
          <Text style={styles.body}>{payload.text}</Text>
          <Text style={styles.label}>Confidence</Text>
          <Text style={styles.body}>{payload.confidence}</Text>

          {payload.formatted ? (
            <>
              <Text style={styles.label}>Formatted data</Text>
              <Text style={styles.mono}>
                {JSON.stringify(payload.formatted.data, null, 2)}
              </Text>
              <Text style={styles.label}>Meta</Text>
              <Text style={styles.mono}>
                {JSON.stringify(payload.formatted.meta, null, 2)}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>Structured (flat)</Text>
              <Text style={styles.mono}>
                {JSON.stringify(flatStructured, null, 2)}
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ReviewItem;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  muted: {
    fontSize: 14,
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    opacity: 0.8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  mono: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "monospace",
  },
});
