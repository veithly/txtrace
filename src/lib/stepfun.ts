import OpenAI from "openai";

const BASE_URL = process.env.STEPFUN_API_BASE || "https://api.stepfun.com/v1";
const STEP_KEY = process.env.STEPFUN_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const STEP_MODEL = process.env.STEPFUN_LLM_MODEL || "step-3.6";
const OPENAI_MODEL = process.env.OPENAI_LLM_MODEL || "gpt-4o-mini";

export type LlmProvider = "stepfun" | "openai" | "stub";

export function activeProvider(): LlmProvider {
  if (STEP_KEY) return "stepfun";
  if (OPENAI_KEY) return "openai";
  return "stub";
}

export function getLlmClient(): { client: OpenAI; model: string; provider: LlmProvider } | null {
  if (STEP_KEY) {
    return {
      client: new OpenAI({ apiKey: STEP_KEY, baseURL: BASE_URL }),
      model: STEP_MODEL,
      provider: "stepfun",
    };
  }
  if (OPENAI_KEY) {
    return {
      client: new OpenAI({ apiKey: OPENAI_KEY }),
      model: OPENAI_MODEL,
      provider: "openai",
    };
  }
  return null;
}

export async function llmChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  opts?: { temperature?: number; max_tokens?: number; json?: boolean },
): Promise<{ content: string; provider: LlmProvider; model: string }> {
  const ctx = getLlmClient();
  if (!ctx) {
    return {
      content: "[stub] No LLM key configured. Set STEPFUN_API_KEY or OPENAI_API_KEY in .env.",
      provider: "stub",
      model: "none",
    };
  }
  // NOTE: step-3.6 is a reasoning model — internal CoT consumes the token budget,
  // so the default ceiling is intentionally generous. Callers can override.
  const resp = await ctx.client.chat.completions.create({
    model: ctx.model,
    messages,
    temperature: opts?.temperature ?? 0.4,
    max_tokens: opts?.max_tokens ?? 1800,
    ...(opts?.json
      ? { response_format: { type: "json_object" as const } }
      : {}),
  });
  const choice = resp.choices[0]?.message as
    | { content?: string | null; reasoning?: string | null }
    | undefined;
  // StepFun exposes a separate `reasoning` field on reasoning models. If the model
  // ran out of tokens while still reasoning, `content` is empty — fall back to a
  // trimmed reasoning tail so the UI doesn't show a blank reply.
  const content = (choice?.content ?? "").trim();
  if (content) return { content, provider: ctx.provider, model: ctx.model };
  const reasoningTail = (choice?.reasoning ?? "").trim();
  return {
    content: reasoningTail || "",
    provider: ctx.provider,
    model: ctx.model,
  };
}
