import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatWidget from '@/components/ai/AiChatWidget';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bibliotheca - Modern Library & Bookstore",
  description: "Discover, borrow, buy books with AI recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gradient-to-br from-[var(--bg)] via-[var(--surface)] to-[var(--cream-3)]">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <AIChatWidget />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}