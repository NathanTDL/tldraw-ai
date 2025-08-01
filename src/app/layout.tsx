import type { Metadata, Viewport } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { CanvasProvider } from "@/contexts/CanvasProvider";
import { LoginModal } from "@/components/LoginModal";

export const metadata: Metadata = {
  title: "Weplit AI - Canvas & AI Assistant",
  description: "Professional AI-powered canvas platform with intelligent assistance for creative projects",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Weplit AI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased font-sans`}>
        <AuthProvider>
            <CanvasProvider>
              {children}
              <LoginModal />
            </CanvasProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
