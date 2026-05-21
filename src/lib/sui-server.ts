import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { formatDigest } from "@mysten/sui/utils";

export type SuiNetwork = "testnet" | "devnet";

const RPC_URLS: Record<SuiNetwork, string> = {
  testnet: "https://fullnode.testnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
};

export function getSuiNetwork(): SuiNetwork {
  return process.env.SUI_NETWORK === "devnet" ? "devnet" : "testnet";
}

export function getRpcUrl() {
  return process.env.SUI_FULLNODE_URL || RPC_URLS[getSuiNetwork()];
}

export function getSuiClient() {
  return new SuiJsonRpcClient({ network: getSuiNetwork(), url: getRpcUrl() });
}

export function getDemoKeypair() {
  const secret = process.env.SUI_DEMO_PRIVATE_KEY;
  if (!secret) return null;
  try {
    return Ed25519Keypair.fromSecretKey(secret);
  } catch {
    return null;
  }
}

export function getDemoAddress() {
  return getDemoKeypair()?.toSuiAddress() ?? null;
}

export function explorerTxUrl(digest: string) {
  const net = getSuiNetwork();
  const sub = net === "testnet" ? "testnet." : net === "devnet" ? "devnet." : "";
  return `https://${sub}suivision.xyz/txblock/${digest}`;
}

export function explorerAccountUrl(addr: string) {
  const net = getSuiNetwork();
  const sub = net === "testnet" ? "testnet." : net === "devnet" ? "devnet." : "";
  return `https://${sub}suivision.xyz/account/${addr}`;
}

export function shortDigest(digest: string) {
  return formatDigest(digest);
}

export async function getNetworkStatus() {
  const client = getSuiClient();
  const keypair = getDemoKeypair();
  const [checkpoint, gasPrice, totalTransactions] = await Promise.all([
    client.getLatestCheckpointSequenceNumber({}),
    client.getReferenceGasPrice({}),
    client.getTotalTransactionBlocks({}),
  ]);
  const demoAddress = keypair?.toSuiAddress() ?? null;
  const balance = demoAddress
    ? await client.getBalance({ owner: demoAddress })
    : null;
  return {
    network: getSuiNetwork(),
    rpcUrl: getRpcUrl(),
    checkpoint: checkpoint.toString(),
    referenceGasPrice: gasPrice.toString(),
    totalTransactions: totalTransactions.toString(),
    demo: {
      configured: Boolean(keypair),
      address: demoAddress,
      balanceMist: balance?.totalBalance ?? null,
    },
  };
}
