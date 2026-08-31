import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

// Poppins is the UI typeface for the whole app. It is not a variable font on
// Google Fonts, so unlike Geist it needs its weights listed: only the ones
// below are downloaded, and asking for a weight that is not here silently
// renders as a synthesised (smeared) face. 300-700 covers every font-* utility
// the pages use — light body copy up to font-bold headings.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Kept for the font-mono utility (SHAP impact numbers, confidence scores).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bio-Heritage AI | Sri Lankan Indigenous Medicine",
  description:
    "Preserving Sri Lankan Indigenous Medical Knowledge through Multi-Modal AI",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950">
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,si,ta,fr,de,ja,zh-CN',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
              }, 'google_translate_element');
            }
          `}
        </Script>

          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
      </body>
    </html>
  );
}
