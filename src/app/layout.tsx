import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "باهم | تماشای فیلم و سریال با دوستان",
  description:
    "یک گروه بساز یا با کد به گروه دوستات بپیوند و فیلم و سریال رو با هم تماشا کنید.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-dvh font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
