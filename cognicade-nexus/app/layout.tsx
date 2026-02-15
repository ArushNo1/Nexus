import type { Metadata } from "next";
import { Geist, Jersey_10, Fredericka_the_Great } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { getThemeCSSVariables } from "@/lib/theme";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Cognicade Nexus",
  description: "The fastest way to build games with AI.",
  icons: {
    icon: "/NEXUSLOGO.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const jersey10 = Jersey_10({
  weight: "400",
  variable: "--font-jersey-10",
  display: "swap",
  subsets: ["latin"],
});

const fredericka = Fredericka_the_Great({
  weight: "400",
  variable: "--font-fredericka",
  preload: false,
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: getThemeCSSVariables() }} />
      </head>
      <body
        className={`${geistSans.className} ${jersey10.variable} ${fredericka.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-[#0d281e] focus:font-bold focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
