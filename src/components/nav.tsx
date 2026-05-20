"use client";

import Link from "next/link";
import { WalletBar } from "@/components/wallet-bar";
import { Wordmark } from "@/components/brand/logo";

export function Nav({ github }: { github?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 tracking-tight">
          <Wordmark size="sm" />
          <span className="rounded-full border border-border bg-panel px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted">
            testnet
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/app" className="hover:text-foreground">Try it</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          {github ? (
            <a href={github} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
          ) : null}
          <WalletBar />
        </nav>
      </div>
    </header>
  );
}
