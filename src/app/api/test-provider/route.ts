import { NextRequest, NextResponse } from "next/server";
import { testAIConnection } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { apiKey, model } = body;

    const result = await testAIConnection(apiKey, model);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Inference test failed.",
      },
      { status: 500 }
    );
  }
}

