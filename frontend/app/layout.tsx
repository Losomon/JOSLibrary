import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./global.css";
import AIChatWidget from '@/components/ai/AiChatWidget';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[var(--bg)]">
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