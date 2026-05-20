import Link from "next/link";
import { Nav } from "@/components/nav";

export default function HomePage() {
  return (
    <main className="min-h-screen surface-grid">
      <Nav />
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-1.5 text-xs uppercase tracking-widest text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
          Sui Testnet · live
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
          TxTrace
        </h1>
        <p className="max-w-2xl text-xl text-muted">
          DevTools for Sui programmable transactions. Paste a digest, see every command, every
          argument, every gas cost.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-lg bg-accent px-6 py-3 font-medium text-background transition hover:opacity-90"
          >
            Try it instantly
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-border px-6 py-3 font-medium text-foreground hover:bg-panel"
          >
            How it works
          </Link>
        </div>
      </section>
    </main>
  );
}
