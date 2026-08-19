import type { NextResponse } from "next/server";

export const NO_STORE_CACHE_CONTROL =
  "private, no-store, no-cache, must-revalidate, max-age=0";

export function applyNoStoreHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", NO_STORE_CACHE_CONTROL);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("Vary", "Cookie");
  return response;
}
