import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { CertificateData } from "./certificate";

const shareKeys: Array<keyof CertificateData> = ["name", "born", "passed", "message", "imageDataUrl"];

export function encodeCertificateState(data: CertificateData): string {
  const compact = shareKeys.map((key) => data[key]);
  return compressToEncodedURIComponent(JSON.stringify(compact));
}

export function decodeCertificateState(encoded: string): CertificateData | null {
  try {
    const decoded = decompressFromEncodedURIComponent(encoded);
    if (!decoded) return null;
    const values = JSON.parse(decoded) as unknown;
    if (!Array.isArray(values) || values.length !== shareKeys.length) return null;
    if (!values.every((value) => typeof value === "string")) return null;
    return Object.fromEntries(shareKeys.map((key, index) => [key, values[index]])) as CertificateData;
  } catch {
    return null;
  }
}

export function buildShareUrl(data: CertificateData, origin: string): string {
  return `${origin}/?s=${encodeCertificateState(data)}`;
}
