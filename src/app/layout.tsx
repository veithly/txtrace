import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://suioverflow-txtrace.veithly.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "TxTrace — DevTools for Sui programmable transactions",
  description: "Chrome DevTools for Sui programmable transactions.",
  openGraph: {
    title: "TxTrace",
    description: "Chrome DevTools for Sui programmable transactions.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TxTrace",
    description: "Chrome DevTools for Sui programmable transactions.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
