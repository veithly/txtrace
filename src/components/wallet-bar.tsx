"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useOptionalCurrentAccount, useOptionalDAppKit } from "@/lib/dapp-kit-safe";
import { cn } from "@/lib/utils";

const ConnectButton = dynamic(
  () => import("@mysten/dapp-kit-react/ui").then((m) => m.ConnectButton),
  { ssr: false, loading: () => <ConnectButtonSkeleton /> },
);

type Status = {
  network: string;
  demo: { configured: boolean; address: string | null; balanceMist: string | null };
};

export function WalletBar() {
  const account = useOptionalCurrentAccount();
  const dAppKit = useOptionalDAppKit();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/network", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: Status) => {
        if (alive) setStatus(j);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const isConnected = Boolean(account?.address);
  const signerLabel = isConnected
    ? "Connected · " + short(account!.address)
    : status?.demo.configured
      ? "Trial · " + short(status.demo.address ?? "")
      : "Read-only (no signer)";

  const tone = isConnected
    ? "border-emerald-500/50 text-emerald-200 bg-emerald-500/10"
    : status?.demo.configured
      ? "border-amber-500/40 text-amber-100 bg-amber-500/10"
      : "border-rose-500/40 text-rose-200 bg-rose-500/10";

  return (
    <div className="ml-2 flex items-center gap-2">
      <div
        title={
          isConnected
            ? `Connected wallet ${account!.address}`
            : status?.demo.configured
              ? `Try-instantly wallet · ${status.demo.address}`
              : "Read-only trace — connect a wallet to trace your own digests"
        }
        className={cn(
          "hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest",
          tone,
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isConnected
              ? "bg-emerald-300 animate-pulse-slow"
              : status?.demo.configured
                ? "bg-amber-300"
                : "bg-rose-300",
          )}
        />
        {signerLabel}
      </div>
      {dAppKit ? <ConnectButton /> : <ConnectButtonSkeleton />}
    </div>
  );
}

function ConnectButtonSkeleton() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 items-center justify-center rounded-full border border-border bg-panel/60 px-4 text-[10px] uppercase tracking-widest text-muted"
    >
      Loading wallet…
    </span>
  );
}

function short(addr: string) {
  if (!addr) return "—";
  return addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}
