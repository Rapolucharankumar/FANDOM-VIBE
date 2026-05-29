import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fandom Vibe",
  description: "A digital universe where fandom meets lifestyle."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
