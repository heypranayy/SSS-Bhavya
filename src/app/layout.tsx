import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bhavya Fashions | Premium B2B Wholesale Kurtis & Ethnic Wear",
    template: "%s | Bhavya Fashions Wholesale",
  },
  description: "Bhavya Fashions is a premier Indian ethnic wear wholesale manufacturer and supplier. Supplying single kurtis, 2-piece and 3-piece sets, gowns and co-ords to boutiques, retailers and resellers across India.",
  keywords: ["wholesale kurtis", "kurti manufacturer", "Indian ethnic wear wholesale", "Bhavya Fashions", "kurti pant dupatta set wholesale", "Surat kurti wholesale", "Barabazar wholesale kurtis"],
  openGraph: {
    title: "Bhavya Fashions | B2B Wholesale Catalog",
    description: "Wholesale supplier of premium Indian ethnic wear and kurtis for boutiques and retailers.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} font-sans-clean antialiased min-h-screen selection:bg-[#722F37] selection:text-white`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
