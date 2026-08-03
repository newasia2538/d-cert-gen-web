import { describe, expect, it } from "vitest";
import { buildShareUrl, buildSocialShareUrl, decodeCertificateState, decodeSocialShareState, encodeCertificateState } from "@/lib/share";

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
    expect(url.startsWith("https://remembered.example/#s=")).toBe(true);
    expect(decodeCertificateState(new URL(url).hash.slice(3))).toEqual(certificate);
  });

  it("builds short social URLs without embedded image data", () => {
    const url = buildSocialShareUrl(certificate, "https://remembered.example");
    expect(url).not.toContain("data:image");
    expect(url.length).toBeLessThan(500);
    expect(decodeSocialShareState(new URL(url).searchParams)).toEqual({
      ...certificate,
      imageDataUrl: "",
    });
  });

  it("rejects malformed state", () => {
    expect(decodeCertificateState("not-valid-state")).toBeNull();
  });
});
