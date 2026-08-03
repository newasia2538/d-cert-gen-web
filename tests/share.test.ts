import { describe, expect, it } from "vitest";
import { buildShareUrl, decodeCertificateState, encodeCertificateState } from "@/lib/share";

const certificate = {
  name: "Mina",
  born: "1948-04-12",
  passed: "2024-10-10",
  message: "Loved always.",
  imageDataUrl: "data:image/jpeg;base64,abc",
};

describe("share state", () => {
  it("round trips certificate data through compressed URL state", () => {
    expect(decodeCertificateState(encodeCertificateState(certificate))).toEqual(certificate);
  });

  it("builds a shareable URL", () => {
    const url = buildShareUrl(certificate, "https://remembered.example");
    expect(url.startsWith("https://remembered.example/?s=")).toBe(true);
    expect(decodeCertificateState(new URL(url).searchParams.get("s") ?? "")).toEqual(certificate);
  });

  it("rejects malformed state", () => {
    expect(decodeCertificateState("not-valid-state")).toBeNull();
  });
});
