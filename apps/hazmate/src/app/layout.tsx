import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hazmate - AI-Powered Hazmat Compliance Tool",
  description: "Instant hazmat compliance analysis for truck drivers. Take a photo of your shipping document and get immediate compliance insights.",
  keywords: "hazmat, compliance, trucking, hazardous materials, shipping documents, AI analysis",
  authors: [{ name: "bigrigs.ai" }],
  robots: "index, follow",
  openGraph: {
    title: "Hazmate - AI-Powered Hazmat Compliance Tool",
    description: "Instant hazmat compliance analysis for truck drivers",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hazmate - AI-Powered Hazmat Compliance Tool",
    description: "Instant hazmat compliance analysis for truck drivers",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
