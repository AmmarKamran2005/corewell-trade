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
  metadataBase: new URL(brand.demoUrl),
  title: {
    default: `${brand.product} — free ERP, POS and online store demo`,
    template: `%s · ${brand.product}`,
  },
  description:
    "Open a working multi-branch distribution ERP: trade desk, point-of-sale till and consumer storefront over one catalogue, one stock pool and one ledger. A demonstration on sample data — no signup, nothing to install.",
  applicationName: brand.product,
  authors: [{ name: brand.company, url: brand.companyUrl }],
  creator: brand.company,
  publisher: brand.company,
  alternates: { canonical: "/login" },
  openGraph: {
    type: "website",
    siteName: brand.product,
    title: `${brand.product} — ERP, POS and online store demo`,
    description:
      "A working distribution ERP you can click through: orders, credit control, inventory, purchasing, double-entry accounting, a POS till and a consumer storefront. Sample data, no signup.",
    url: brand.demoUrl,
  },
  /* Only the landing page is indexable; the shells inside re-declare noindex.
     Favicon comes from src/app/icon.png via Next's file convention. Do not add
     a favicon.ico back — the one create-next-app ships is Vercel's mark, and an
     .ico alongside icon.png is what browsers pick for the tab. */
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
