import { NextResponse } from "next/server";
import { z } from "zod";
import { getSuiClient } from "@/lib/sui-server";
import { decodeTransactionBlock } from "@/lib/ptb-decoder";
import { llmChat } from "@/lib/stepfun";

const Body = z.object({
  input: z.string().optional(),
  mode: z.enum(["demo"]).optional(),
});

const DEMO_FAILING_TRACE = {
  decoded: {
    steps: [
      { index: 0, kind: "SplitCoins", label: "tx.splitCoins(gas, [1_000_000])", ok: true },
      { index: 1, kind: "MoveCall", label: "smolagent_core::agent::hire", ok: true, detail: "args: 2" },
      {
        index: 2,
        kind: "MoveCall",
        label: "smolagent_core::airdrop::claim_batch",
        ok: false,
        detail: "abort: EAlreadyClaimed (1)",
      },
      { index: 3, kind: "TransferObjects", label: "tx.transferObjects([reward], owner)", ok: true },
    ],
    errorAt: 2,
    gasUsedMist: "1864000",
    statusText: "failure",
  },
  source: "demo" as const,
};

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { input, mode } = parsed.data;

  if (mode === "demo") {
    const explanation = await aiExplain(DEMO_FAILING_TRACE.decoded);
    return NextResponse.json({ ...DEMO_FAILING_TRACE, explanation });
  }

  if (!input) return NextResponse.json({ error: "Empty input" }, { status: 400 });

  const text = input.trim();
  if (looksLikeDigest(text)) {
    try {
      const client = getSuiClient();
      const resp = await client.getTransactionBlock({
        digest: text,
        options: { showInput: true, showEffects: true, showObjectChanges: true, showEvents: true },
      });
      const decoded = decodeTransactionBlock(resp);
      const explanation = decoded.errorAt !== null ? await aiExplain({
        steps: decoded.steps,
        errorAt: decoded.errorAt,
        gasUsedMist: decoded.gasUsedMist,
        statusText: decoded.status.status,
      }) : null;
      return NextResponse.json({
        source: "digest",
        decoded: {
          steps: decoded.steps,
          errorAt: decoded.errorAt,
          gasUsedMist: decoded.gasUsedMist,
          statusText: String(decoded.status.status ?? "unknown"),
        },
        explanation,
      });
    } catch (e: unknown) {
      return NextResponse.json({ error: `Lookup failed: ${String((e as Error).message ?? e)}` }, { status: 500 });
    }
  }

  return NextResponse.json({
    error: "Input doesn't look like a digest. Paste a Sui digest (44 base58 chars) or click 'Load failing demo PTB'.",
  });
}

function looksLikeDigest(s: string) {
  return /^[A-Za-z0-9]{30,}$/.test(s.trim());
}

async function aiExplain(decoded: { steps: { index: number; kind: string; label: string; ok: boolean; detail?: string }[]; errorAt: number | null; gasUsedMist: string | null; statusText: string }) {
  const sys = `You are a senior Sui Move developer.
Reply directly. No reasoning preamble, no markdown fence.
Given a programmable transaction trace, write <= 6 short sentences in plain English:
- what was attempted overall,
- which step number aborted,
- why (cite the abort code or argument),
- and the most likely fix.
Do not invent new step names. Cite the failing step number explicitly. Output English text only.`;
  const user = JSON.stringify(decoded, null, 2);
  const { content } = await llmChat(
    [{ role: "system", content: sys }, { role: "user", content: user }],
    { temperature: 0.3, max_tokens: 1800 },
  );
  // Maturity-sweep (hard rule #28): user-visible provider label is the TxTrace
  // product name, not the upstream model.
  return { content, provider: "Reasoning engine" };
}
