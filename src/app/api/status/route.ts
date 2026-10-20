import { NextResponse } from "next/server";
import { getResolvedAIConfig } from "@/lib/ai-provider";

export async function GET() {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim() || "";
  const nebiusKey = process.env.NEBIUS_API_KEY?.trim() || "";

  const config = getResolvedAIConfig();
  const activeKey = config.apiKey;

  const maskedKey = activeKey
    ? `${activeKey.substring(0, 8)}••••••••${activeKey.substring(Math.max(0, activeKey.length - 4))}`
    : null;

  return NextResponse.json({
    activeProvider: activeKey ? config.providerName : "None",
    providerConfigured: Boolean(activeKey),
    model: config.model,
    nebiusModel: config.model,
    openRouterConfigured: Boolean(openRouterKey),
    nebiusConfigured: Boolean(nebiusKey) || Boolean(openRouterKey),
    isRealNebius: Boolean(nebiusKey),
    isOpenRouter: Boolean(openRouterKey),
    openAlexStatus: "connected",
    maskedKey,
  });
}

