import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";

export function mimeFromImageUri(uri: string): string {
  const path = uri.split("?")[0].split("#")[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".heic") || path.endsWith(".heif")) return "image/heic";
  if (path.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function localImageUriToBase64Parts(uri: string): Promise<{
  imageBase64: string;
  mimeType: string;
}> {
  const imageBase64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return { imageBase64, mimeType: mimeFromImageUri(uri) };
}
