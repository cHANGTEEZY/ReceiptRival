/**
 * Core receipt fields — may appear under `formatted.data` (full profile) or
 * flattened on {@link OCRResultPayload} when API uses `responseProfile=summary`.
 */
export type OCRStructuredReceiptFields = {
  currency: string | null;
  lineItems: unknown[];
  merchantName: string | null;
  receiptDate: string | null;
  totalAmount: string | number | null;
  transactionId: string | null;
};

/**
 * Formatter metadata (full / stub formatter output).
 */
export type OCRFormattedMeta = {
  ignoredInputFields: string[];
  missingFields: string[];
  needsReview: boolean;
  unsupportedRequestedFields: string[];
  warnings: string[];
};

export type OCRFormatted = {
  data: OCRStructuredReceiptFields;
  meta: OCRFormattedMeta;
};

/**
 * Keys duplicated at the root of `data` when the backend returns a summary-style payload.
 */
export const OCR_FLAT_STRUCTURED_KEYS = [
  "currency",
  "lineItems",
  "merchantName",
  "receiptDate",
  "totalAmount",
  "transactionId",
] as const satisfies ReadonlyArray<keyof OCRStructuredReceiptFields>;

export type OCRFlatStructuredKey = (typeof OCR_FLAT_STRUCTURED_KEYS)[number];

/**
 * Inner `data` from the OCR API: always includes raw text + confidence;
 * structured fields are either nested in `formatted` or flattened on this object.
 */
export type OCRResultPayload = {
  confidence: number;
  text: string;
  /** Present when response profile is `full` or formatter returns nested output. */
  formatted?: OCRFormatted;
} & Partial<OCRStructuredReceiptFields>;

/**
 * Top-level JSON body from `POST .../ocr/parse`.
 */
export type OCRApiResponse = {
  data: OCRResultPayload;
  message?: string;
  status?: string;
};

/** Pull flattened structured fields from `payload` when `formatted` is absent. */
export function getOcrFlatStructuredFields(
  payload: OCRResultPayload,
): Partial<OCRStructuredReceiptFields> {
  const out: Partial<OCRStructuredReceiptFields> = {};
  for (const key of OCR_FLAT_STRUCTURED_KEYS) {
    if (
      Object.prototype.hasOwnProperty.call(payload, key) &&
      payload[key] !== undefined
    ) {
      (out as Record<string, unknown>)[key] = payload[key];
    }
  }
  return out;
}
