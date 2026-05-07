import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Header } from "@/components/Header";
import { MoneyRain } from "@/components/MoneyRain";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Cemetery",
  description: "NFT tombstones for crypto's greatest disasters. Collect. Craft. Remember.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-navy text-text font-sans antialiased">
        <div className="site-bg" aria-hidden />
        <MoneyRain />
        <Providers>
          <Header />
          <main className="max-w-6xl mx-auto px-5 py-12">{children}</main>
          <footer className="border-t border-border mt-20 py-8">
            <div className="flex items-center justify-center gap-4">
              <svg viewBox="0 0 200 200" fill="none" className="w-5 h-5 opacity-30">
                <path d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
                      stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
                <rect x="72" y="74" width="16" height="26" fill="#f5f1e8"/>
                <path d="M80 68 L80 74 M80 100 L80 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
                <rect x="112" y="74" width="16" height="26" fill="#f5f1e8"/>
                <path d="M120 68 L120 74 M120 100 L120 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
                <path d="M100 110 L94 122 L106 122 Z" fill="#f5f1e8"/>
              </svg>
              <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
                Crypto Cemetery · Shape L2 · Those who forget history are doomed to ape it
              </p>
              <svg viewBox="0 0 200 200" fill="none" className="w-5 h-5 opacity-30">
                <path d="M58 72 Q58 32 100 32 Q142 32 142 72 L142 112 Q142 128 132 134 L132 150 L116 150 L116 138 L106 138 L106 150 L94 150 L94 138 L84 138 L84 150 L68 150 L68 134 Q58 128 58 112 Z"
                      stroke="#f5f1e8" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
                <rect x="72" y="74" width="16" height="26" fill="#f5f1e8"/>
                <path d="M80 68 L80 74 M80 100 L80 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
                <rect x="112" y="74" width="16" height="26" fill="#f5f1e8"/>
                <path d="M120 68 L120 74 M120 100 L120 106" stroke="#f5f1e8" strokeWidth="3" strokeLinecap="round"/>
                <path d="M100 110 L94 122 L106 122 Z" fill="#f5f1e8"/>
              </svg>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
