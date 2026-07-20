import { NextResponse } from "next/server";

// Server-side proxy: the browser never talks to the Go API directly, so the
// API can stay private and needs no CORS configuration.
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "API_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${base}/api/message`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream responded ${res.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    // Cloud Run cold starts can exceed the timeout above on the first request.
    const reason = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: `could not reach API: ${reason}` },
      { status: 502 },
    );
  }
}
