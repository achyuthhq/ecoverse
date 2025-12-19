import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/components/auth-provider";
import TrashGate from "@/components/trash-gate";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Ecoverse - AI-Powered Waste Management',
  description: 'Identify, analyze, and learn about proper waste disposal with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/icons/icon-192x192.png" />
<meta name="theme-color" content="#3b82f6" />

        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", montserrat.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <TrashGate />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 