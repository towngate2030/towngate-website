import type { Metadata } from "next";
import { Cairo, Poppins } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TownGate",
  description: "TownGate — premium real estate development.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const align = locale === "ar" ? "text-right" : "text-left";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${poppins.variable} scroll-smooth`}
    >
      <body className={`min-h-screen antialiased ${align}`}>{children}</body>
    </html>
  );
}
