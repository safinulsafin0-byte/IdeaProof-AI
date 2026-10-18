import { NextResponse } from "next/server";

export async function GET() {
  const nebiusKey = process.env.NEBIUS_API_KEY?.trim() || "";
  const nebiusModel = process.env.NEBIUS_MODEL?.trim() || "nvidia/nemotron-3-super-120b-a12b";

  return NextResponse.json({
    nebiusConfigured: Boolean(nebiusKey),
    nebiusModel,
    openAlexStatus: "connected",
    maskedKey: nebiusKey
      ? `${nebiusKey.substring(0, 3)}••••••••${nebiusKey.substring(Math.max(0, nebiusKey.length - 4))}`
      : null,
  });
}
