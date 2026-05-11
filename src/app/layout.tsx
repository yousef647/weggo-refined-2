import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteNav } from "@/components/site-nav";
import { BanCheck } from "@/components/ban-check";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "weggo — second-hand marketplace",
  description: "Buy and sell second-hand items locally on weggo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen font-sans">
        <Providers>
          <BanCheck />
          <div className="flex min-h-screen flex-col">
            <SiteNav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
            <footer className="border-t border-border/80 bg-muted/30 py-8 text-center text-xs text-muted-foreground">
              weggo — local second-hand marketplace · Built for learning and demos
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
