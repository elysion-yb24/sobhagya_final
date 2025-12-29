import { NextRequest, NextResponse } from "next/server";
import { buildApiUrl, API_CONFIG } from "../../config/api";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) headers["Authorization"] = authHeader;

    // Collect query params
    const { searchParams } = request.nextUrl;
    const queryParams = new URLSearchParams();

    if (searchParams.get("search")) queryParams.set("search", searchParams.get("search")!);
    if (searchParams.get("skip")) queryParams.set("skip", searchParams.get("skip")!);
    if (searchParams.get("limit")) queryParams.set("limit", searchParams.get("limit")!);
    if (searchParams.get("language") && searchParams.get("language") !== "All") {
      queryParams.set("language", searchParams.get("language")!);
    }
    if (searchParams.get("sortBy")) queryParams.set("sortBy", searchParams.get("sortBy")!);

    // Build backend URL
    let targetUrl = buildApiUrl(API_CONFIG.ENDPOINTS.USER.ASTROLOGERS);
    if (queryParams.toString()) targetUrl += `?${queryParams.toString()}`;

    const response = await fetch(targetUrl, { method: "GET", headers });
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch astrologers" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
