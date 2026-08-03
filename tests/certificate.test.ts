import { describe, expect, it } from "vitest";
import { escapeXml, formatDateLabel, renderCertificateSvg, validateDates } from "@/lib/certificate";

describe("certificate helpers", () => {
  it("formats ISO and typed dates into readable labels", () => {
    expect(formatDateLabel("1948-04-12")).toBe("12 April 1948");
    expect(formatDateLabel("10/10/2024")).toBe("10 October 2024");
    expect(formatDateLabel("2024-02-31")).toBe("2024-02-31");
  });

  it("validates required dates and chronological order", () => {
    expect(validateDates("", "2024-01-01")).toBe("Add both dates to continue.");
    expect(validateDates("2025-01-01", "2024-01-01")).toContain("must come before");
    expect(validateDates("2024-01-01", "2025-01-01")).toBeNull();
    expect(validateDates("2024-02-31", "2025-01-01")).toContain("valid date");
  });

  it("escapes user text before placing it inside SVG", () => {
    expect(escapeXml("A & <B> \"C\"")).toBe("A &amp; &lt;B&gt; &quot;C&quot;");
  });

  it("renders certificate content and optional photo", () => {
    const svg = renderCertificateSvg({
      name: "Mina & Kai",
      born: "1948-04-12",
      passed: "2024-10-10",
      message: "Loved always.",
      imageDataUrl: "data:image/jpeg;base64,abc",
    });
    expect(svg).toContain("Mina &amp; Kai");
    expect(svg).toContain("12 April 1948");
    expect(svg).toContain('href="data:image/jpeg;base64,abc"');
    expect(svg).toContain('aria-label="Certificate of remembrance"');
  });
});
