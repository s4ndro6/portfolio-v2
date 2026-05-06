import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sandro Schillaci — Enter the Flow",
  description:
    "Solo full-stack AI builder. Lille. Systèmes IA, automation, interfaces qui marquent.",
  authors: [{ name: "Alessandro Schillaci" }],
  keywords: [
    "Sandro Schillaci",
    "AI builder",
    "Lille",
    "alternance",
    "Next.js",
    "LangGraph",
    "Three.js",
    "automation",
  ],
  openGraph: {
    title: "Sandro Schillaci — Enter the Flow",
    description: "Solo full-stack AI builder. Systèmes qui tournent. Pas de slides.",
    type: "website",
    locale: "fr_FR",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#02020A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
