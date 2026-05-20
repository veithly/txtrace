import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

const RPC_URLS = {
  testnet:
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUI_FULLNODE_URL) ||
    "https://fullnode.testnet.sui.io:443",
} as const;

function makeKit() {
  return createDAppKit({
    networks: ["testnet"],
    defaultNetwork: "testnet",
    createClient: (network: "testnet") =>
      new SuiJsonRpcClient({ network, url: RPC_URLS[network] }),
  });
}

export type DAppKitInstance = ReturnType<typeof makeKit>;

let _dAppKit: DAppKitInstance | null = null;

export function getDAppKit(): DAppKitInstance {
  if (_dAppKit) return _dAppKit;
  if (typeof window === "undefined") {
    throw new Error("dAppKit is browser-only; called from server context");
  }
  _dAppKit = makeKit();
  return _dAppKit;
}

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: DAppKitInstance;
  }
}
