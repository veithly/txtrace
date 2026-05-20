"use client";

import { useContext, useSyncExternalStore } from "react";
import { DAppKitContext } from "@mysten/dapp-kit-react";

export function useOptionalDAppKit() {
  return useContext(DAppKitContext);
}

type Account = { address: string };

export function useOptionalCurrentAccount(): Account | null {
  const ctx = useContext(DAppKitContext);
  const account = useSyncExternalStore(
    (cb) => {
      if (!ctx) return () => {};
      const unsub = ctx.stores.$connection.subscribe(() => cb());
      return unsub;
    },
    () => (ctx ? ctx.stores.$connection.get().account ?? null : null),
    () => null,
  );
  return account;
}
