import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthProvider";
import { CanvasProvider } from "@/contexts/CanvasProvider";
import { LoginModal } from "@/components/LoginModal";

export const metadata: Metadata = {
  title: "Next.js 15 + shadcn/ui + Tailwind CSS",
  description: "A modern, beautiful starter template with the latest tools",
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
