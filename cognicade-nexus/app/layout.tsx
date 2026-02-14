import type { Metadata } from "next";
import { Geist, Jersey_10, Fredericka_the_Great } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/ui/navbar";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Cognicade Nexus",
  description: "The fastest way to build games with AI.",
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
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${jersey10.variable} ${fredericka.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
