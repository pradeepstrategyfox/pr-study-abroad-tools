import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BrandMark from "@/components/BrandMark";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "PR Study Abroad · Free Admit Predictor & Cost Calculator",
  description:
    "Free tools by PR Study Abroad: personalized university match list and country-wise cost breakdown in INR. Built for Indian students applying abroad.",
  metadataBase: new URL("https://prstudyabroad.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-full">
        <header className="glass sticky top-0 z-40 border-b border-black/[0.06]">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-semibold text-[15px] tracking-tight">PR Study Abroad</span>
            </a>
            <nav className="flex items-center gap-2 text-[13px]">
              <a href="/university-match" className="hidden md:inline-block px-3 py-1.5 rounded-full text-[#1d1d1f]/80 hover:text-[#1d1d1f]">Admit Predictor</a>
              <a href="/cost-calculator" className="hidden md:inline-block px-3 py-1.5 rounded-full text-[#1d1d1f]/80 hover:text-[#1d1d1f]">Cost Calculator</a>
              <a
                href="https://prstudyabroad.com"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-black text-white text-[13px] hover:opacity-90"
              >
                Book consultation
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-32 border-t border-black/[0.06]">
          <div className="max-w-6xl mx-auto px-5 py-10 text-[12px] text-[#6e6e73] flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>© {new Date().getFullYear()} PR Study Abroad. Free tools. For personalized counselling, visit{" "}
              <a className="underline underline-offset-2 text-[#1d1d1f]" href="https://prstudyabroad.com" target="_blank" rel="noopener">prstudyabroad.com</a>.
            </div>
            <div>Predictions are indicative. Actual outcomes depend on full profile review.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
