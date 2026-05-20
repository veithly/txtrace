# TxTrace

### DevTools for Sui programmable transactions.

*Catch every PTB. See every step. Fix the failing one in 30 seconds.*

[![Live](https://img.shields.io/badge/Live-Open_app-22c55e?style=for-the-badge)](https://txtrace.vercel.app)
[![Network](https://img.shields.io/badge/Network-Sui_Testnet-0891b2?style=for-the-badge)](https://suivision.xyz/?network=testnet)
[![Decoder](https://img.shields.io/badge/Decoder-OSS-f59e0b?style=for-the-badge)](./src/lib/ptb-decoder.ts)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](./LICENSE)

**Quick links:**
[Web app](https://txtrace.vercel.app) ·
[Architecture](./docs/ARCHITECTURE.md) ·
[Move fixture](./move/sources/)

---

## Why TxTrace is different

| | console.log + rebuild | Manual inspector | Sui explorer | **TxTrace** |
| --- | --- | --- | --- | --- |
| Debug time | 30-60 min | 10-20 min | 5 min (post-mortem) | **30 s** |
| Source mapping | manual | none | none | **automatic** |
| Object diff | none | none | tx-effects only | **animated, per-step** |
| Re-run with new args | rebuild | none | none | **inline dry-run** |

## Hero moment

```
0:00 Step 4 row red, pulsing
0:01 Click step 4
0:02 Right panel: "Expected u64, got vector<u64>" + your TS line highlighted
0:03 Click Try fix
0:05 All steps green; object diff animates; Send → digest
```

## Quick start (developer)

```bash
pnpm install
cp .env.example .env.local
# LLM key powers the AI root-cause explainer; the decoder and traces work without it.
pnpm dev               # http://localhost:3130
pnpm test:e2e          # Playwright smoke
pnpm build             # production build
```

Three ways to drive the UI:

1. **Connect your wallet** and click **Issue + trace a real failure** — sends a deliberately-failing transaction from your wallet, recovers the digest, walks through the exact aborting command.
2. **Paste any real Sui Testnet digest** into the textarea and click **Trace** — decode + AI-explain any live transaction.
3. **Load a canned trace** — a baked-in failing PTB with step 2 in red; useful when you want to scrub the UI without a network round-trip.

### Status

- Next.js 15 + Sui dApp Kit + JSON-mode streaming reasoning; `pnpm build` clean.
- PTB decoder (`src/lib/ptb-decoder.ts`) walks the `ProgrammableTransaction` command vector and surfaces MoveCall / Split / Merge / Transfer / Publish steps.
- `POST /api/trace` accepts a digest and pipes the trace into the AI explainer.
- Step-level UI with a red highlight for the failing index + animated motion list.
- Browser extension + sourcemap-aware mapping coming next.

## License
MIT.
