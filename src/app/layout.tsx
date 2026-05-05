import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sandro Schillaci — Neural Tower",
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
    title: "Sandro Schillaci — Neural Tower",
    description: "Solo full-stack AI builder. Systèmes qui tournent. Pas de slides.",
    type: "website",
    locale: "fr_FR",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#040408",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
