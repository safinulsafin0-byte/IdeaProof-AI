import { NextRequest, NextResponse } from "next/server";
import { searchOpenAlex } from "@/lib/openalex";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const fromYear = searchParams.get("fromYear") ? parseInt(searchParams.get("fromYear")!, 10) : undefined;
    const toYear = searchParams.get("toYear") ? parseInt(searchParams.get("toYear")!, 10) : undefined;
    const isOpenAccessOnly = searchParams.get("isOpenAccessOnly") === "true";
    const sortBy = (searchParams.get("sortBy") as "relevance" | "cited_by_count:desc" | "publication_year:desc") || "relevance";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const perPage = searchParams.get("perPage") ? parseInt(searchParams.get("perPage")!, 10) : 10;

    if (!query.trim()) {
      return NextResponse.json({
        papers: [],
        totalCount: 0,
        page: 1,
        perPage,
        query: "",
      });
    }

    const result = await searchOpenAlex({
      query,
      fromYear,
      toYear,
      isOpenAccessOnly,
      sortBy,
      page,
      perPage,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error in /api/literature:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to search academic literature.",
      },
      { status: 500 }
    );
  }
}
