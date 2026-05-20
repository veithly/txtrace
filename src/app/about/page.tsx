import { Nav } from "@/components/nav";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-3xl px-6 py-16 prose prose-invert">
        <h1>TxTrace</h1>
        <p className="text-muted">DevTools for Sui programmable transactions.</p>
        <p>
          TxTrace turns a Sui transaction digest into a fully annotated trace: every command in the
          PTB, every argument lineage, every gas-cost contribution, every effect on every object.
          Built for the engineer who needs to know <em>why</em> a transaction reverted at command
          #4, not just that it did.
        </p>
        <p>
          Connect your own wallet and click <strong>Issue + trace a real failure</strong> to send a
          deliberately-failing transaction from your wallet, recover the digest, and walk through
          the exact command that aborted — all in one place.
        </p>
      </section>
    </main>
  );
}
