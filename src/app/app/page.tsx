import { TraceConsole } from "@/components/trace-console";
import { Nav } from "@/components/nav";
import { getNetworkStatus } from "@/lib/sui-server";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const status = await getNetworkStatus().catch(() => null);
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">PTB trace inspector</h1>
            <p className="text-muted">Paste a failing programmable transaction. See which step blew up and why.</p>
          </div>
          <div className="rounded-lg border border-border bg-panel px-3 py-2 text-xs text-muted">
            <div>Sui {status?.network ?? "testnet"} · checkpoint {status?.checkpoint ?? "—"}</div>
          </div>
        </header>
        <TraceConsole />
      </section>
    </main>
  );
}
