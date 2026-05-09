import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Immersive Competence AI",
    template: "%s · Immersive Competence AI",
  },
  description:
    "UEF + ThingLink-style research prototype for AI-assisted competence analytics in immersive mobile learning.",
  applicationName: "Immersive Competence AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ICA Research",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">{children}</body>
    </html>
  );
}
