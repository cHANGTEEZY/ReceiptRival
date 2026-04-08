import { v } from "convex/values";
import { action } from "./_generated/server";

function fileNameForMime(mimeType: string): string {
    const sub = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    return `receipt.${sub}`;
}

/** Convex actions are not Node; `Buffer` is unavailable. */
function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
    }
    return out;
}

export const processOcr = action({
    args: {
        imageBase64: v.string(),
        mimeType: v.string(),
    },
    handler: async (_ctx, args) => {
        try {
            const bytes = base64ToUint8Array(args.imageBase64);
            const ab = bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength,
            ) as ArrayBuffer;
            const blob = new Blob([ab], { type: args.mimeType });
            const form = new FormData();
            form.append("image", blob, fileNameForMime(args.mimeType));
            form.append("format", "true")
            form.append("documentType", "payment_receipt")
            form.append("responsePorfile", "summary") //summary or full
            form.append("strictMode", "false")

            const ocrApiKey = process.env.OCR_API_KEY;
            if (!ocrApiKey) {
                throw new Error(
                    "OCR_API_KEY is not set. Run: npx convex env set OCR_API_KEY <value>",
                );
            }

            const response = await fetch(
                "https://novella-cantoral-terrance.ngrok-free.dev/api/v1/ocr/parse",
                {
                    method: "POST",
                    headers: {
                        "x-internal-key": ocrApiKey,
                    },
                    body: form,
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data
        } catch (error) {
            throw new Error(
                `Error processing OCR: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    },
});