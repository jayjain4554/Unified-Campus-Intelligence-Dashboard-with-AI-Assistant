import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unified Campus Intelligence Dashboard",
  description: "Interactive campus information, event tracking, room booking, and AI assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
