import { omit } from "lodash";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request) {
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "set GEMINI_API_KEY first",
      },
      {
        status: 500,
      }
    );
  }
  const body = await request.json();
  const { contents } = body;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:streamGenerateContent?key=${apiKey}&alt=sse`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contents,
    }),
  });
  return new Response(res.body, {
    headers: {
      ...omit(Object.fromEntries(res.headers), ["content-encoding"]),
    },
    status: res.status,
  });
}
