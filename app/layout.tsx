import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remembered — create a gentle remembrance certificate",
  description: "Create and share a quiet, minimalist certificate of remembrance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
