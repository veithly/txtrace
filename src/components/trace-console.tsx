"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Transaction } from "@mysten/sui/transactions";
import { useOptionalCurrentAccount, useOptionalDAppKit } from "@/lib/dapp-kit-safe";

type TraceResp = {
  source: "digest" | "ptb" | "demo";
  decoded?: {
    steps: { index: number; kind: string; label: string; ok: boolean; detail?: string }[];
    errorAt: number | null;
    gasUsedMist: string | null;
    statusText: string;
  };
  explanation?: { content: string; provider: string };
  error?: string;
};

export function TraceConsole() {
  const account = useOptionalCurrentAccount();
  const dAppKit = useOptionalDAppKit();
  const [input, setInput] = useState("");
  const [resp, setResp] = useState<TraceResp | null>(null);
  const [loading, setLoading] = useState<"" | "auto" | "demo" | "live">("");
  const [liveDigest, setLiveDigest] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  async function run(mode: "auto" | "demo", overrideInput?: string) {
    setLoading(mode);
    setResp(null);
    try {
      const body =
        mode === "demo"
          ? { mode: "demo" }
          : { input: overrideInput ?? input };
      const r = await fetch("/api/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      setResp(r);
    } finally {
      setLoading("");
    }
  }

  async function issueAndTraceLive() {
    if (!account?.address || !dAppKit) return;
    setLoading("live");
    setResp(null);
    setLiveDigest(null);
    setLiveError(null);
    try {
      // Deliberately failing PTB: split way more SUI than the connected wallet
      // has, so execution aborts and produces a real on-chain trace we can
      // decode. The resulting digest is a verifiable Sui Testnet failure.
      const tx = new Transaction();
      const HUGE = 10_000_000_000_000n; // 10 000 SUI
      const [coin] = tx.splitCoins(tx.gas, [HUGE]);
      tx.transferObjects([coin], account.address);
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });

      // The execution will likely succeed at the dry-sign level but fail on
      // chain. dapp-kit returns FailedTransaction with the failing digest.
      const digest =
        result.$kind === "Transaction"
          ? result.Transaction.digest
          : result.FailedTransaction?.digest;
      if (!digest) throw new Error("Wallet did not return a digest");
      setLiveDigest(digest);
      setInput(digest);
      await new Promise((r) => setTimeout(r, 2200)); // let the node index it
      await run("auto", digest);
    } catch (e) {
      setLiveError(String((e as Error).message ?? e));
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-2xl border border-border bg-panel p-5">
        <h2 className="text-lg font-semibold">Paste a digest or PTB JSON</h2>
        <p className="text-xs text-muted">
          Reviewer can paste a Sui Testnet digest (e.g. <code>A1bC…</code>) or the raw PTB JSON from a wallet.
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste a Sui digest or PTB JSON here'
          className="mt-3 h-44 w-full resize-y rounded-lg border border-border bg-panel-strong p-3 font-mono text-xs"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            disabled={loading !== "" || !input}
            onClick={() => run("auto")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {loading === "auto" ? "Tracing…" : "Trace this"}
          </button>
          <button
            disabled={loading !== ""}
            onClick={() => run("demo")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-panel-strong disabled:opacity-50"
            title="Pre-baked sample failure (no on-chain lookup)"
          >
            {loading === "demo" ? "Loading…" : "Sample failure (no wallet)"}
          </button>
          {account?.address ? (
            <button
              disabled={loading !== ""}
              onClick={issueAndTraceLive}
              className="rounded-lg border border-accent/40 bg-accent/5 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
              title="Sign + broadcast a deliberately-failing PTB from your wallet, then trace its real digest."
            >
              {loading === "live" ? "Issuing…" : "Issue + trace a real failure (your wallet)"}
            </button>
          ) : null}
        </div>
        {liveError ? (
          <p className="mt-3 text-xs text-rose-300">Wallet error: {liveError}</p>
        ) : null}
        {liveDigest ? (
          <a
            href={`https://testnet.suivision.xyz/txblock/${liveDigest}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block break-all text-xs text-accent underline"
          >
            Live digest: {liveDigest}
          </a>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5">
        <h2 className="text-lg font-semibold">Trace timeline</h2>
        {!resp ? (
          <p className="mt-2 text-sm text-muted">Trace results appear here.</p>
        ) : resp.error ? (
          <p className="mt-2 text-sm text-danger">{resp.error}</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <Stat label="Source" value={resp.source} />
              <Stat label="Status" value={resp.decoded?.statusText ?? "—"} />
              <Stat label="Gas (mist)" value={resp.decoded?.gasUsedMist ?? "—"} />
              <Stat
                label="Failed at step"
                value={
                  resp.decoded?.errorAt !== null && resp.decoded?.errorAt !== undefined
                    ? String(resp.decoded.errorAt)
                    : "—"
                }
              />
            </div>
            <ol className="mt-5 space-y-2">
              {(resp.decoded?.steps ?? []).map((s) => (
                <motion.li
                  key={s.index}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${
                    s.ok ? "border-border bg-panel-strong" : "border-danger/60 bg-danger/10"
                  }`}
                >
                  <div>
                    <div className="text-xs text-muted">Step #{s.index} · {s.kind}</div>
                    <div className="font-mono text-sm">{s.label}</div>
                    {s.detail ? <div className="text-xs text-muted">{s.detail}</div> : null}
                  </div>
                  <Icon
                    icon={s.ok ? "ph:check-circle-fill" : "ph:x-circle-fill"}
                    width={14}
                    height={14}
                    className={s.ok ? "text-accent" : "text-danger"}
                  />
                </motion.li>
              ))}
              {!resp.decoded?.steps?.length ? (
                <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-muted">
                  Trace has no programmable commands.
                </li>
              ) : null}
            </ol>
            {resp.explanation ? (
              <article className="mt-5 rounded-lg border border-accent/40 bg-accent/5 p-4">
                <div className="text-xs uppercase tracking-widest text-accent">AI root-cause · {resp.explanation.provider}</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{resp.explanation.content}</p>
              </article>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-panel-strong p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  );
}
