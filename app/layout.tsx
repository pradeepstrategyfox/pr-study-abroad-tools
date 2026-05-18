import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PR Study Abroad — Free Admit Predictor & Cost Calculator",
  description:
    "Free tools by PR Study Abroad: get a personalized university match list and a country-wise cost breakdown in INR. Built for Indian students applying abroad.",
  metadataBase: new URL("https://prstudyabroad.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="inline-flex w-9 h-9 rounded-lg bg-indigo-600 text-white items-center justify-center font-bold">PR</span>
              <span className="font-semibold text-lg">PR Study Abroad</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/university-match" className="hidden sm:inline text-slate-700 hover:text-indigo-700">Admit Predictor</a>
              <a href="/cost-calculator" className="hidden sm:inline text-slate-700 hover:text-indigo-700">Cost Calculator</a>
              <a
                href="https://prstudyabroad.com"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Book free consultation
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-600 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>© {new Date().getFullYear()} PR Study Abroad. Free tools — for personalized counselling, visit{" "}
              <a className="text-indigo-700 underline" href="https://prstudyabroad.com" target="_blank" rel="noopener">prstudyabroad.com</a>.
            </div>
            <div className="text-xs text-slate-500">
              Predictions are indicative, based on public admission ranges. Actual outcomes depend on full profile review.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
