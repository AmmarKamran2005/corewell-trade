import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { brand } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.product} — ${brand.tagline}`,
    template: `%s · ${brand.product}`,
  },
  description:
    "Multi-branch POS & ERP for distribution businesses — sales, purchases, inventory, accounting, and AI-powered insights.",
  applicationName: brand.product,
  authors: [{ name: brand.company, url: brand.companyUrl }],
  creator: brand.company,
  publisher: brand.company,
  /* Favicon comes from src/app/icon.png — the real brand asset, picked up by
     Next's file convention, so there is nothing to declare here. */
  /* Belt and braces alongside robots.ts — a crawler that ignores robots.txt
     still sees the meta tag, and neither should index invented records. */
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
