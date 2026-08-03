"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ClipboardEvent as ReactClipboardEvent } from "react";
import {
  type CertificateData,
  formatDateLabel,
  renderCertificateSvg,
  toIsoDate,
  validateDates,
} from "@/lib/certificate";
import { buildShareUrl, decodeCertificateState } from "@/lib/share";

type Locale = "en" | "th";
type ErrorKey = "" | "datesRequired" | "dateInvalid" | "dateOrder" | "nameRequired";
type ImageStatusKey = "" | "added" | "invalid" | "failed";
type ShareStatusKey = "" | "opened" | "copied" | "copyBlocked" | "shared" | "instagram";
type ShareNetwork = "facebook" | "x" | "instagram";

const copyByLocale = {
  en: {
    languageLabel: "Language",
    madeWithCare: "made with care",
    eyebrow: "A quiet place to remember",
    title: "Keep their memory close.",
    intro: "Create a soft, shareable remembrance certificate in a few gentle steps.",
    creator: "Certificate creator",
    details: "details",
    preview: "preview",
    tellUs: "Tell us about them",
    private: "private by design",
    fullName: "Full name",
    namePlaceholder: "Their name",
    birth: "Date of birth",
    passing: "Date of passing",
    typeOrCalendar: "Type or use calendar",
    message: "A short message",
    optional: "optional",
    portrait: "Portrait",
    photoTypes: "PNG, JPG up to 10 MB",
    photoReady: "Portrait ready",
    photoPrompt: "Drop, paste, or choose a portrait",
    clipboardPrompt: "Clipboard image works here",
    chooseFile: "Choose file",
    create: "Create certificate",
    privacy: "Your photo stays in your browser until you choose to share.",
    keepsake: "Your keepsake",
    ready: "ready to share",
    save: "Save image",
    share: "Share",
    copyLink: "Copy link",
    shareTitle: "Share your keepsake",
    deviceShare: "Share from device",
    facebook: "Facebook",
    x: "X",
    instagram: "Instagram",
    localOnly: "Every certificate is created locally. No account needed.",
    footer: "For the lives that shaped ours.",
    errors: {
      datesRequired: "Add both dates to continue.",
      dateInvalid: "Use a valid date, such as 12/04/1948.",
      dateOrder: "Date of birth must come before date of passing.",
      nameRequired: "Add a name to create the certificate.",
    },
    imageStatus: {
      added: "Photo added.",
      invalid: "Choose an image file or paste an image from clipboard.",
      failed: "Could not read this image. Try another file.",
    },
    shareStatus: {
      opened: "Opened from shared link.",
      copied: "Share link copied.",
      copyBlocked: "Copy blocked. Copy the link from your browser.",
      shared: "Share sheet opened.",
      instagram: "Link copied. Paste it into Instagram.",
    },
  },
  th: {
    languageLabel: "ภาษา",
    madeWithCare: "สร้างด้วยความใส่ใจ",
    eyebrow: "พื้นที่เงียบสงบสำหรับการระลึกถึง",
    title: "เก็บความทรงจำของเขาไว้ใกล้หัวใจ",
    intro: "สร้างภาพที่ระลึกแสนอบอุ่นและแบ่งปันได้ในไม่กี่ขั้นตอน",
    creator: "สร้างภาพที่ระลึก",
    details: "รายละเอียด",
    preview: "ตัวอย่าง",
    tellUs: "บอกเล่าเรื่องราวของเขา",
    private: "เป็นส่วนตัวตั้งแต่ต้น",
    fullName: "ชื่อ-นามสกุล",
    namePlaceholder: "ชื่อของเขา",
    birth: "วันเกิด",
    passing: "วันถึงแก่กรรม",
    typeOrCalendar: "พิมพ์หรือเลือกจากปฏิทิน",
    message: "ข้อความสั้น ๆ",
    optional: "ไม่บังคับ",
    portrait: "รูปภาพ",
    photoTypes: "PNG, JPG ขนาดไม่เกิน 10 MB",
    photoReady: "เพิ่มรูปภาพแล้ว",
    photoPrompt: "วาง เลือก หรือเพิ่มรูปภาพ",
    clipboardPrompt: "วางรูปจากคลิปบอร์ดได้ที่นี่",
    chooseFile: "เลือกไฟล์",
    create: "สร้างภาพที่ระลึก",
    privacy: "รูปภาพของคุณอยู่ในเบราว์เซอร์จนกว่าคุณจะเลือกแบ่งปัน",
    keepsake: "ภาพที่ระลึกของคุณ",
    ready: "พร้อมแบ่งปัน",
    save: "บันทึกภาพ",
    share: "แบ่งปัน",
    copyLink: "คัดลอกลิงก์",
    shareTitle: "แบ่งปันภาพที่ระลึก",
    deviceShare: "แบ่งปันผ่านอุปกรณ์",
    facebook: "Facebook",
    x: "X",
    instagram: "Instagram",
    localOnly: "ภาพทั้งหมดสร้างขึ้นในเครื่อง ไม่ต้องสมัครสมาชิก",
    footer: "สำหรับทุกชีวิตที่หล่อหลอมเรา",
    errors: {
      datesRequired: "กรุณาเพิ่มวันเกิดและวันถึงแก่กรรม",
      dateInvalid: "กรุณาใช้วันที่ถูกต้อง เช่น 12/04/1948",
      dateOrder: "วันเกิดต้องมาก่อนวันถึงแก่กรรม",
      nameRequired: "กรุณาเพิ่มชื่อเพื่อสร้างภาพที่ระลึก",
    },
    imageStatus: {
      added: "เพิ่มรูปภาพแล้ว",
      invalid: "กรุณาเลือกไฟล์รูปภาพหรือวางรูปจากคลิปบอร์ด",
      failed: "อ่านรูปภาพไม่ได้ กรุณาลองไฟล์อื่น",
    },
    shareStatus: {
      opened: "เปิดจากลิงก์ที่แบ่งปัน",
      copied: "คัดลอกลิงก์แล้ว",
      copyBlocked: "คัดลอกไม่ได้ กรุณาคัดลอกลิงก์จากเบราว์เซอร์",
      shared: "เปิดหน้าต่างแบ่งปันแล้ว",
      instagram: "คัดลอกลิงก์แล้ว นำไปวางใน Instagram",
    },
  },
} as const;

const emptyCertificate: CertificateData = {
  name: "",
  born: "",
  passed: "",
  message: "A life remembered with tenderness, gratitude, and love.",
  imageDataUrl: "",
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [certificate, setCertificate] = useState<CertificateData>(emptyCertificate);
  const [generated, setGenerated] = useState(false);
  const [errorKey, setErrorKey] = useState<ErrorKey>("");
  const [shareStatus, setShareStatus] = useState<ShareStatusKey>("");
  const [imageStatus, setImageStatus] = useState<ImageStatusKey>("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const copy = copyByLocale[locale];

  const svg = useMemo(() => renderCertificateSvg(certificate, locale), [certificate, locale]);
  const imageUrl = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);

  const update = useCallback((key: keyof CertificateData, value: string) => {
    setCertificate((current) => ({ ...current, [key]: value }));
    setShareStatus("");
    setErrorKey("");
  }, []);

  const loadImage = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setImageStatus("invalid");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      update("imageDataUrl", dataUrl);
      setImageStatus("added");
    } catch {
      setImageStatus("failed");
    }
  }, [update]);

  useEffect(() => {
    const saved = window.localStorage.getItem("remembered-locale");
    if (saved === "en" || saved === "th") setLocale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("remembered-locale", locale);
  }, [locale]);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("s");
    if (!encoded) return;
    const shared = decodeCertificateState(encoded);
    if (shared) {
      setCertificate(shared);
      setGenerated(true);
      setShareStatus("opened");
    }
  }, []);

  useEffect(() => {
    setShareUrl(buildShareUrl(certificate, window.location.origin));
  }, [certificate]);

  useEffect(() => {
    const onPaste = (event: globalThis.ClipboardEvent) => {
      if (!event.clipboardData) return;
      const image = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
      if (image) void loadImage(image.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadImage]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void loadImage(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const onPhotoPaste = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const image = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (image) {
      event.preventDefault();
      void loadImage(image.getAsFile());
    }
  };

  const onGenerate = () => {
    const validationError = validateDates(certificate.born, certificate.passed);
    const nextErrorKey = getErrorKey(validationError);
    if (nextErrorKey) {
      setErrorKey(nextErrorKey);
      setGenerated(false);
      return;
    }
    if (!certificate.name.trim()) {
      setErrorKey("nameRequired");
      setGenerated(false);
      return;
    }
    setErrorKey("");
    setShareStatus("");
    setGenerated(true);
    const nextShareUrl = buildShareUrl(certificate, window.location.origin);
    setShareUrl(nextShareUrl);
    window.history.replaceState({}, "", nextShareUrl);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch {
      setShareStatus("copyBlocked");
    }
  };

  const shareFromDevice = async () => {
    if (!navigator.share) {
      await copyShareLink();
      setShareMenuOpen(false);
      return;
    }
    try {
      await navigator.share({ title: `${certificate.name} — remembered`, url: shareUrl });
      setShareStatus("shared");
    } catch {
      // User cancelled share sheet.
    }
    setShareMenuOpen(false);
  };

  const shareToSocial = async (network: ShareNetwork) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    if (network === "instagram") {
      await copyShareLink();
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      setShareStatus("instagram");
    } else {
      const target = network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        : `https://x.com/intent/post?text=${encodeURIComponent(`${certificate.name} — remembered`)}&url=${encodedUrl}`;
      window.open(target, "_blank", "noopener,noreferrer");
      setShareStatus("shared");
    }
    setShareMenuOpen(false);
  };

  const downloadPng = async () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1600;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#f6f1e8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `remembered-${slugify(certificate.name)}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.src = imageUrl;
  };

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Remembered home">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>remembered</span>
        </a>
        <div className="header-actions">
          <span className="header-note">{copy.madeWithCare}</span>
          <div className="language-toggle" role="group" aria-label={copy.languageLabel}>
            <button type="button" className={locale === "en" ? "language-button active" : "language-button"} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
            <button type="button" className={locale === "th" ? "language-button active" : "language-button"} aria-pressed={locale === "th"} onClick={() => setLocale("th")}>TH</button>
          </div>
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="page-title">{copy.title}</h1>
        <p className="intro-copy">{copy.intro}</p>
      </section>

      <section className="workspace" aria-label={copy.creator}>
        <form className="editor-card" onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">01 / {copy.details}</p>
              <h2>{copy.tellUs}</h2>
            </div>
            <span className="soft-badge">{copy.private}</span>
          </div>

          <label className="field-label" htmlFor="name">{copy.fullName}</label>
          <input id="name" className="text-input" value={certificate.name} onChange={(event) => update("name", event.target.value)} placeholder={copy.namePlaceholder} autoComplete="name" />

          <div className="date-grid">
            <DateField locale={locale} label={copy.birth} value={certificate.born} onChange={(value) => update("born", value)} hint={copy.typeOrCalendar} />
            <DateField locale={locale} label={copy.passing} value={certificate.passed} onChange={(value) => update("passed", value)} hint={copy.typeOrCalendar} />
          </div>

          <label className="field-label" htmlFor="message">{copy.message} <span>{copy.optional}</span></label>
          <textarea id="message" className="text-input message-input" value={certificate.message} onChange={(event) => update("message", event.target.value)} rows={3} maxLength={120} />

          <div className="photo-section">
            <div className="photo-heading">
              <label className="field-label" htmlFor="photo">{copy.portrait} <span>{copy.optional}</span></label>
              <span className="photo-hint">{copy.photoTypes}</span>
            </div>
            <div className={`dropzone ${certificate.imageDataUrl ? "has-image" : ""}`} onPaste={onPhotoPaste} tabIndex={0}>
              {certificate.imageDataUrl ? <img src={certificate.imageDataUrl} alt={copy.photoReady} className="photo-thumb" /> : <span className="upload-icon" aria-hidden="true">＋</span>}
              <div>
                <p>{certificate.imageDataUrl ? copy.photoReady : copy.photoPrompt}</p>
                <span>{copy.clipboardPrompt}</span>
              </div>
              <label className="choose-button" htmlFor="photo">{copy.chooseFile}</label>
              <input id="photo" type="file" accept="image/*" onChange={onFileChange} />
            </div>
            <p className="status-line" aria-live="polite">{imageStatus ? copy.imageStatus[imageStatus] : ""}</p>
          </div>

          {errorKey && <p className="error-message" role="alert">{copy.errors[errorKey]}</p>}
          <button className="primary-button" type="submit">{copy.create} <span aria-hidden="true">↗</span></button>
          <p className="privacy-note"><span aria-hidden="true">⌁</span> {copy.privacy}</p>
        </form>

        <div className="preview-column">
          <div className="preview-heading">
            <div>
              <p className="section-kicker">02 / {copy.preview}</p>
              <h2>{copy.keepsake}</h2>
            </div>
            {generated && <span className="ready-label"><i /> {copy.ready}</span>}
          </div>
          <div className="preview-frame">
            <img src={imageUrl} alt={generated ? `Remembrance certificate for ${certificate.name}` : "Certificate preview"} className="certificate-preview" />
          </div>
          <div className="actions" aria-label={copy.shareTitle}>
            <button className="action-button action-primary" type="button" onClick={downloadPng} disabled={!generated}><span aria-hidden="true">↓</span> {copy.save}</button>
            <div className="share-wrap">
              <button className="action-button" type="button" onClick={() => setShareMenuOpen((open) => !open)} disabled={!generated} aria-expanded={shareMenuOpen} aria-haspopup="menu"><span aria-hidden="true">↗</span> {copy.share}</button>
              {shareMenuOpen && generated && (
                <div className="share-menu" role="menu" aria-label={copy.shareTitle}>
                  <p className="share-menu-title">{copy.shareTitle}</p>
                  <button type="button" role="menuitem" onClick={() => void shareFromDevice()}>{copy.deviceShare}</button>
                  <button type="button" role="menuitem" onClick={() => void shareToSocial("facebook")}>{copy.facebook}</button>
                  <button type="button" role="menuitem" onClick={() => void shareToSocial("x")}>{copy.x}</button>
                  <button type="button" role="menuitem" onClick={() => void shareToSocial("instagram")}>{copy.instagram}</button>
                </div>
              )}
            </div>
            <button className="action-button" type="button" onClick={() => void copyShareLink()} disabled={!generated}><span aria-hidden="true">⌘</span> {copy.copyLink}</button>
          </div>
          <p className="status-line share-status" aria-live="polite">{shareStatus ? copy.shareStatus[shareStatus] : ""}</p>
          <p className="preview-note">{copy.localOnly}</p>
        </div>
      </section>

      <footer className="site-footer">
        <span>{copy.footer}</span>
        <span>© {new Date().getFullYear()} remembered</span>
      </footer>
    </main>
  );
}

function DateField({ locale, label, value, onChange, hint }: { locale: Locale; label: string; value: string; onChange: (value: string) => void; hint: string }) {
  const isoValue = toIsoDate(value);
  return (
    <div>
      <label className="field-label" htmlFor={label}>{label}</label>
      <div className="date-input-wrap">
        <input id={label} className="text-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="DD / MM / YYYY" inputMode="numeric" aria-describedby={`${label}-hint`} />
        <input className="date-picker" type="date" value={isoValue} onChange={(event) => onChange(event.target.value)} aria-label={`${label} date picker`} />
        <span className="calendar-icon" aria-hidden="true">▣</span>
      </div>
      <span id={`${label}-hint`} className="input-hint">{value ? formatDateLabel(value, locale) : hint}</span>
    </div>
  );
}

function getErrorKey(error: string | null): ErrorKey {
  if (!error) return "";
  if (error === "Add both dates to continue.") return "datesRequired";
  if (error === "Use a valid date, such as 12/04/1948.") return "dateInvalid";
  return "dateOrder";
}

async function resizeImage(file: File): Promise<string> {
  const source = await readFile(file);
  const image = new Image();
  image.src = source;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("image-load-failed"));
  });
  const size = 720;
  const ratio = Math.min(1, size / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "memory";
}
