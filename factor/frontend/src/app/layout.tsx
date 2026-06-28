import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { AppProviders } from "./providers";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@zama-season3/shared/styles.css";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Factor | Confidential Invoice Factoring",
  description: "Receivables financing without leaking your numbers. FHE-encrypted invoice factoring on Sepolia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlex.variable} ${ibmPlexSerif.variable}`}>      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
