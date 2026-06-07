import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.TICKETFLOW_API_URL ?? "http://localhost:5000/ta/api/v1";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const upstreamUrl = new URL(`${API_BASE.replace(/\/$/, "")}/${path.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("Content-Type", contentType);
  if (authorization) headers.set("Authorization", authorization);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get("content-type");
  if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType);

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
