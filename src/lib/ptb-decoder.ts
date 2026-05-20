import type {
  SuiTransactionBlockResponse,
  ExecutionStatus,
  SuiTransaction,
} from "@mysten/sui/jsonRpc";

export interface TraceStep {
  index: number;
  kind: string;
  label: string;
  ok: boolean;
  detail?: string;
}

export interface DecodedTrace {
  status: ExecutionStatus | { status: "unknown" };
  steps: TraceStep[];
  gasUsedMist: string | null;
  errorAt: number | null;
  raw: SuiTransactionBlockResponse | null;
}

export function decodeTransactionBlock(resp: SuiTransactionBlockResponse | null): DecodedTrace {
  if (!resp) {
    return {
      status: { status: "unknown" },
      steps: [],
      gasUsedMist: null,
      errorAt: null,
      raw: null,
    };
  }
  const effectsStatus = resp.effects?.status ?? { status: "unknown" };
  const txBlock = resp.transaction?.data?.transaction;
  const commands: SuiTransaction[] =
    txBlock?.kind === "ProgrammableTransaction" ? (txBlock.transactions as SuiTransaction[]) : [];
  const steps: TraceStep[] = commands.map((cmd, i) => describeCommand(cmd, i));
  const errorAt = effectsStatus.status === "failure" ? steps.length - 1 : null;
  if (errorAt !== null && steps[errorAt]) steps[errorAt].ok = false;
  const gas = resp.effects?.gasUsed
    ? String(
        BigInt(resp.effects.gasUsed.computationCost) +
          BigInt(resp.effects.gasUsed.storageCost) -
          BigInt(resp.effects.gasUsed.storageRebate ?? 0),
      )
    : null;
  return { status: effectsStatus, steps, gasUsedMist: gas, errorAt, raw: resp };
}

function describeCommand(cmd: SuiTransaction, i: number): TraceStep {
  if (!cmd || typeof cmd !== "object") return { index: i, kind: "Unknown", label: "Unknown command", ok: true };
  if ("MoveCall" in cmd) {
    const mc = cmd.MoveCall;
    const args = (mc as { arguments?: unknown[] }).arguments ?? [];
    return {
      index: i,
      kind: "MoveCall",
      label: `${shortPackage(mc?.package ?? "")}::${mc?.module ?? "?"}::${mc?.function ?? "?"}`,
      ok: true,
      detail: `args: ${args.length}`,
    };
  }
  if ("SplitCoins" in cmd) return { index: i, kind: "SplitCoins", label: "tx.splitCoins(...)", ok: true };
  if ("MergeCoins" in cmd) return { index: i, kind: "MergeCoins", label: "tx.mergeCoins(...)", ok: true };
  if ("TransferObjects" in cmd) return { index: i, kind: "TransferObjects", label: "tx.transferObjects(...)", ok: true };
  if ("Publish" in cmd) return { index: i, kind: "Publish", label: "tx.publish(...)", ok: true };
  if ("MakeMoveVec" in cmd) return { index: i, kind: "MakeMoveVec", label: "tx.makeMoveVec(...)", ok: true };
  return { index: i, kind: "Other", label: Object.keys(cmd)[0] ?? "Unknown", ok: true };
}

function shortPackage(p: string) {
  return p.length > 16 ? `${p.slice(0, 8)}…${p.slice(-4)}` : p;
}
