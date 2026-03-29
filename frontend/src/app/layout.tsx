import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeInit } from "@/components/layout/ThemeInit";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PickUp Time",
  description: "Plataforma de gestion para lavaderos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PickUp Time",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${dmSans.variable} ${dmMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
