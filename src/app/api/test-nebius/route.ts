import { NextRequest, NextResponse } from "next/server";
import { testNebiusConnection } from "@/lib/nebius";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { apiKey, model } = body;

    const result = await testNebiusConnection(apiKey, model);
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

