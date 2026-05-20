import { NextResponse } from "next/server";
import { getNetworkStatus } from "@/lib/sui-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const s = await getNetworkStatus();
    return NextResponse.json(s, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: String((e as Error).message ?? e) },
      { status: 500 },
    );
  }
}
