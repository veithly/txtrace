import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3130"),
  title: "TxTrace — DevTools for Sui programmable transactions",
  description: "Chrome DevTools for Sui programmable transactions.",
  openGraph: {
    title: "TxTrace",
    description: "Chrome DevTools for Sui programmable transactions.",
    images: ["/og.svg"],
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
