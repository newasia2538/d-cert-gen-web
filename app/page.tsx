"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ClipboardEvent as ReactClipboardEvent } from "react";
import {
  type CertificateData,
  formatDateLabel,
  renderCertificateSvg,
  toIsoDate,
  validateDates,
} from "@/lib/certificate";
import { buildShareUrl, decodeCertificateState } from "@/lib/share";

const emptyCertificate: CertificateData = {
  name: "",
  born: "",
  passed: "",
  message: "A life remembered with tenderness, gratitude, and love.",
  imageDataUrl: "",
};

export default function Home() {
  const [certificate, setCertificate] = useState<CertificateData>(emptyCertificate);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [imageStatus, setImageStatus] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const svg = useMemo(() => renderCertificateSvg(certificate), [certificate]);
  const imageUrl = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("s");
    if (!encoded) return;
    const shared = decodeCertificateState(encoded);
    if (shared) {
      setCertificate(shared);
      setGenerated(true);
      setShareStatus("Opened from shared link.");
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
  });

  const update = (key: keyof CertificateData, value: string) => {
    setCertificate((current) => ({ ...current, [key]: value }));
    setShareStatus("");
  };

  const loadImage = async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setImageStatus("Choose an image file or paste an image from clipboard.");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      update("imageDataUrl", dataUrl);
      setImageStatus("Photo added.");
    } catch {
      setImageStatus("Could not read this image. Try another file.");
    }
  };

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
    const dateError = validateDates(certificate.born, certificate.passed);
    if (dateError) {
      setError(dateError);
      setGenerated(false);
      return;
    }
    if (!certificate.name.trim()) {
      setError("Add a name to create the certificate.");
      setGenerated(false);
      return;
    }
    setError("");
    setGenerated(true);
    const nextShareUrl = buildShareUrl(certificate, window.location.origin);
    setShareUrl(nextShareUrl);
    window.history.replaceState({}, "", nextShareUrl);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Share link copied.");
    } catch {
      setShareStatus("Copy blocked. Open the link button, then copy it from your browser.");
    }
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${certificate.name} — remembered`, url: shareUrl });
      setShareStatus("Share sheet opened.");
    } else {
      await copyShareLink();
    }
  };

  const downloadPng = async () => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 2200;
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
        <span className="header-note">made with care</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">A quiet place to remember</p>
        <h1 id="page-title">Keep their memory close.</h1>
        <p className="intro-copy">Create a soft, shareable remembrance certificate in a few gentle steps.</p>
      </section>

      <section className="workspace" aria-label="Certificate creator">
        <form className="editor-card" onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
          <div className="card-heading">
            <div>
              <p className="section-kicker">01 / details</p>
              <h2>Tell us about them</h2>
            </div>
            <span className="soft-badge">private by design</span>
          </div>

          <label className="field-label" htmlFor="name">Full name</label>
          <input id="name" className="text-input" value={certificate.name} onChange={(event) => update("name", event.target.value)} placeholder="Their name" autoComplete="name" />

          <div className="date-grid">
            <DateField label="Date of birth" value={certificate.born} onChange={(value) => update("born", value)} />
            <DateField label="Date of passing" value={certificate.passed} onChange={(value) => update("passed", value)} />
          </div>

          <label className="field-label" htmlFor="message">A short message <span>optional</span></label>
          <textarea id="message" className="text-input message-input" value={certificate.message} onChange={(event) => update("message", event.target.value)} rows={3} maxLength={120} />

          <div className="photo-section">
            <div className="photo-heading">
              <label className="field-label" htmlFor="photo">Portrait <span>optional</span></label>
              <span className="photo-hint">PNG, JPG up to 10 MB</span>
            </div>
            <div className={`dropzone ${certificate.imageDataUrl ? "has-image" : ""}`} onPaste={onPhotoPaste} tabIndex={0}>
              {certificate.imageDataUrl ? <img src={certificate.imageDataUrl} alt="Selected portrait" className="photo-thumb" /> : <span className="upload-icon" aria-hidden="true">＋</span>}
              <div>
                <p>{certificate.imageDataUrl ? "Portrait ready" : "Drop, paste, or choose a portrait"}</p>
                <span>Clipboard image works here</span>
              </div>
              <label className="choose-button" htmlFor="photo">Choose file</label>
              <input id="photo" type="file" accept="image/*" onChange={onFileChange} />
            </div>
            <p className="status-line" aria-live="polite">{imageStatus}</p>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="primary-button" type="submit">Create certificate <span aria-hidden="true">↗</span></button>
          <p className="privacy-note"><span aria-hidden="true">⌁</span> Your photo stays in your browser until you choose to share.</p>
        </form>

        <div className="preview-column">
          <div className="preview-heading">
            <div>
              <p className="section-kicker">02 / preview</p>
              <h2>Your keepsake</h2>
            </div>
            {generated && <span className="ready-label"><i /> ready to share</span>}
          </div>
          <div className="preview-frame">
            <img src={imageUrl} alt={generated ? `Remembrance certificate for ${certificate.name}` : "Certificate preview"} className="certificate-preview" />
          </div>
          <div className="actions" aria-label="Certificate actions">
            <button className="action-button action-primary" type="button" onClick={downloadPng} disabled={!generated}><span aria-hidden="true">↓</span> Save image</button>
            <button className="action-button" type="button" onClick={() => void shareCertificate()} disabled={!generated}><span aria-hidden="true">↗</span> Share</button>
            <button className="action-button" type="button" onClick={() => void copyShareLink()} disabled={!generated}><span aria-hidden="true">⌘</span> Copy link</button>
            <a className={`action-button open-link ${!generated ? "disabled" : ""}`} href={generated ? shareUrl : "#"} target="_blank" rel="noreferrer" onClick={(event) => { if (!generated) event.preventDefault(); }}><span aria-hidden="true">□</span> Open link</a>
          </div>
          <p className="status-line share-status" aria-live="polite">{shareStatus}</p>
          <p className="preview-note">Every certificate is created locally. No account needed.</p>
        </div>
      </section>

      <footer className="site-footer">
        <span>For the lives that shaped ours.</span>
        <span>© {new Date().getFullYear()} remembered</span>
      </footer>
    </main>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const isoValue = toIsoDate(value);
  return (
    <div>
      <label className="field-label" htmlFor={label}>{label}</label>
      <div className="date-input-wrap">
        <input id={label} className="text-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="DD / MM / YYYY" inputMode="numeric" aria-describedby={`${label}-hint`} />
        <input className="date-picker" type="date" value={isoValue} onChange={(event) => onChange(event.target.value)} aria-label={`${label} date picker`} />
        <span className="calendar-icon" aria-hidden="true">▣</span>
      </div>
      <span id={`${label}-hint`} className="input-hint">{value ? formatDateLabel(value) : "Type or use calendar"}</span>
    </div>
  );
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
