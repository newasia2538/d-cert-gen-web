export type CertificateLocale = "en" | "th";

export type CertificateData = {
  name: string;
  born: string;
  passed: string;
  message: string;
  imageDataUrl: string;
};

const palette = {
  paper: "#f6f1e8",
  ink: "#283b35",
  muted: "#6f746b",
  gold: "#b38c58",
  blush: "#d9b7a5",
};

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatDateLabel(value: string, locale: CertificateLocale = "en"): string {
  const cleaned = value.trim();
  if (!cleaned) return "—";

  const date = toDate(cleaned);
  if (!date || Number.isNaN(date.valueOf())) return cleaned;

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toIsoDate(value: string): string {
  const cleaned = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return toDate(cleaned) ? cleaned : "";
  const date = parseTypedDate(cleaned);
  if (!date || Number.isNaN(date.valueOf())) return "";
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
    .join("-");
}

export function validateDates(born: string, passed: string): string | null {
  if (!born.trim() || !passed.trim()) return "Add both dates to continue.";

  const bornDate = toDate(born);
  const passedDate = toDate(passed);
  if (!bornDate || !passedDate) return "Use a valid date, such as 12/04/1948.";
  if (bornDate > passedDate) return "Date of birth must come before date of passing.";
  return null;
}

export function renderCertificateSvg(data: CertificateData, locale: CertificateLocale = "en"): string {
  const name = escapeXml(data.name.trim() || (locale === "th" ? "ชีวิตที่ระลึกถึง" : "A life remembered"));
  const born = escapeXml(formatDateLabel(data.born, locale));
  const passed = escapeXml(formatDateLabel(data.passed, locale));
  const message = data.message.trim() || (locale === "th"
    ? "ระลึกถึงด้วยความอ่อนโยน ความขอบคุณ และความรัก"
    : "A life remembered with tenderness, gratitude, and love.");
  const messageLines = wrapText(message, 48).map(escapeXml);
  const messageSvg = messageLines.map((line, index) => `<tspan x="540" dy="${index === 0 ? 0 : 32}">${line}</tspan>`).join("");
  const portrait = data.imageDataUrl
    ? `<rect x="354" y="145" width="372" height="372" rx="28" fill="#fffdf8" stroke="${palette.gold}" stroke-width="3"/>
       <image href="${escapeXml(data.imageDataUrl)}" x="372" y="163" width="336" height="336" preserveAspectRatio="xMidYMid slice" clip-path="url(#portraitClip)"/>`
    : `<rect x="372" y="163" width="336" height="336" rx="18" fill="#e7ddd0"/>
       <path d="M461 416c19-49 47-74 79-74s60 25 79 74" fill="none" stroke="${palette.gold}" stroke-width="7" stroke-linecap="round"/>
       <circle cx="540" cy="291" r="44" fill="none" stroke="${palette.gold}" stroke-width="7"/>
       <text x="540" y="466" text-anchor="middle" font-family="'Noto Sans Thai', Tahoma, Arial, sans-serif" font-size="20" letter-spacing="4" fill="${palette.muted}">${locale === "th" ? "เพิ่มรูปภาพ" : "ADD PHOTO"}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-label="Certificate of remembrance">
  <defs>
    <clipPath id="portraitClip"><rect x="372" y="163" width="336" height="336" rx="18"/></clipPath>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fffdf8" stop-opacity=".7"/>
      <stop offset="1" stop-color="#efe3d3" stop-opacity=".2"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="${palette.paper}"/>
  <rect x="28" y="28" width="1024" height="1294" rx="4" fill="url(#wash)" stroke="${palette.gold}" stroke-width="2"/>
  <rect x="48" y="48" width="984" height="1254" rx="3" fill="none" stroke="${palette.gold}" stroke-opacity=".38"/>
  <path d="M80 174c25-54 56-79 103-101-14 40-13 70 6 100 17-33 44-59 83-81-15 52-5 91 25 123" fill="none" stroke="${palette.gold}" stroke-width="2.5" opacity=".65"/>
  <path d="M1000 174c-25-54-56-79-103-101 14 40 13 70-6 100-17-33-44-59-83-81 15 52 5 91-25 123" fill="none" stroke="${palette.gold}" stroke-width="2.5" opacity=".65"/>
  ${portrait}
  <path d="M370 552c42 23 72 28 114 12 33-12 67-12 96 11 29-23 63-23 96-11 42 16 72 11 114-12" fill="none" stroke="${palette.blush}" stroke-width="6" stroke-linecap="round"/>
  <text x="540" y="620" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="23" letter-spacing="5" fill="${palette.muted}">${locale === "th" ? "ระลึกถึงด้วยรัก" : "IN LOVING MEMORY"}</text>
  <text x="540" y="700" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" fill="${palette.ink}">${name}</text>
  <path d="M280 746h520" stroke="${palette.gold}" stroke-width="1"/>
  <circle cx="540" cy="746" r="5" fill="${palette.gold}"/>
  <g text-anchor="middle" font-family="'Noto Sans Thai', Tahoma, Arial, sans-serif" fill="${palette.muted}">
    <text x="395" y="812" font-size="25" fill="${palette.gold}">ชาตะ</text>
    <text x="395" y="850" font-size="22">${born}</text>
    <text x="685" y="812" font-size="25" fill="${palette.gold}">มรณะ</text>
    <text x="685" y="850" font-size="22">${passed}</text>
  </g>
  <path d="M540 790v80" stroke="${palette.gold}" stroke-opacity=".5"/>
  <text x="540" y="965" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-style="italic" fill="${palette.ink}">${messageSvg}</text>
  <path d="M425 1110c33 17 74 17 115 0 41 17 82 17 115 0" fill="none" stroke="${palette.blush}" stroke-width="4" stroke-linecap="round"/>
  <text x="540" y="1170" text-anchor="middle" font-family="'Noto Sans Thai', Tahoma, Arial, sans-serif" font-size="15" letter-spacing="3" fill="${palette.muted}">${locale === "th" ? "อยู่ในหัวใจของเราเสมอ" : "HELD IN OUR HEARTS"}</text>
  </svg>`;
}

function wrapText(value: string, maxCharacters: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function parseTypedDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!match) return null;
  const year = match[3].length === 2 ? Number(`20${match[3]}`) : Number(match[3]);
  const date = new Date(year, Number(match[2]) - 1, Number(match[1]), 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[1])
  ) {
    return null;
  }
  return date;
}

function toDate(value: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.trim().split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    if (
      Number.isNaN(date.valueOf()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) return null;
    return date;
  }
  return parseTypedDate(value);
}
