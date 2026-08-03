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

export function formatDateLabel(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return "—";

  const date = toDate(cleaned);

  if (!date || Number.isNaN(date.valueOf())) return cleaned;

  return new Intl.DateTimeFormat("en-GB", {
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

export function renderCertificateSvg(data: CertificateData): string {
  const name = escapeXml(data.name.trim() || "A life remembered");
  const born = escapeXml(formatDateLabel(data.born));
  const passed = escapeXml(formatDateLabel(data.passed));
  const message = escapeXml(
    data.message.trim() || "A life remembered with tenderness, gratitude, and love.",
  );
  const portrait = data.imageDataUrl
    ? `<image href="${escapeXml(data.imageDataUrl)}" x="242" y="192" width="316" height="316" preserveAspectRatio="xMidYMid slice" clip-path="url(#portraitClip)"/>`
    : `<circle cx="400" cy="350" r="140" fill="#e7ddd0"/>
       <path d="M321 435c19-49 47-74 79-74s60 25 79 74" fill="none" stroke="${palette.gold}" stroke-width="7" stroke-linecap="round"/>
       <circle cx="400" cy="310" r="44" fill="none" stroke="${palette.gold}" stroke-width="7"/>
       <text x="400" y="495" text-anchor="middle" font-size="20" letter-spacing="4" fill="${palette.muted}">ADD PHOTO</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100" role="img" aria-label="Certificate of remembrance">
  <defs>
    <clipPath id="portraitClip"><rect x="242" y="192" width="316" height="316" rx="158"/></clipPath>
    <linearGradient id="wash" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fffdf8" stop-opacity=".7"/>
      <stop offset="1" stop-color="#efe3d3" stop-opacity=".2"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1100" fill="${palette.paper}"/>
  <rect x="24" y="24" width="752" height="1052" rx="3" fill="url(#wash)" stroke="${palette.gold}" stroke-width="2"/>
  <rect x="42" y="42" width="716" height="1016" rx="2" fill="none" stroke="${palette.gold}" stroke-opacity=".38"/>
  <path d="M75 160c23-45 47-65 84-82-12 33-12 59 4 84 14-27 35-48 67-66-12 42-4 75 21 102" fill="none" stroke="${palette.gold}" stroke-width="2" opacity=".65"/>
  <path d="M725 160c-23-45-47-65-84-82 12 33 12 59-4 84-14-27-35-48-67-66 12 42 4 75-21 102" fill="none" stroke="${palette.gold}" stroke-width="2" opacity=".65"/>
  <circle cx="400" cy="350" r="174" fill="none" stroke="${palette.gold}" stroke-width="3"/>
  <circle cx="400" cy="350" r="164" fill="none" stroke="${palette.gold}" stroke-opacity=".45" stroke-dasharray="2 10" stroke-width="2"/>
  ${portrait}
  <path d="M232 524c35 20 59 24 93 11 27-10 54-10 75 9 21-19 48-19 75-9 34 13 58 9 93-11" fill="none" stroke="${palette.blush}" stroke-width="5" stroke-linecap="round"/>
  <text x="400" y="590" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="5" fill="${palette.muted}">IN LOVING MEMORY</text>
  <text x="400" y="664" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="44" fill="${palette.ink}">${name}</text>
  <path d="M225 700h350" stroke="${palette.gold}" stroke-width="1"/>
  <circle cx="400" cy="700" r="4" fill="${palette.gold}"/>
  <text x="400" y="756" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${palette.muted}">${born}  ·  ${passed}</text>
  <text x="400" y="823" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic" fill="${palette.ink}">${message}</text>
  <path d="M320 925c24 13 53 13 80 0 27 13 56 13 80 0" fill="none" stroke="${palette.blush}" stroke-width="3" stroke-linecap="round"/>
  <text x="400" y="978" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="${palette.muted}">HELD IN OUR HEARTS</text>
  </svg>`;
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
