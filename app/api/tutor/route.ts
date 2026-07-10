import { NextRequest, NextResponse } from "next/server";

// Optional Claude-powered tutor. Activates only when ANTHROPIC_API_KEY is set in
// the environment (.env.local). Otherwise the client falls back to local
// answers generated from the seed data — so the app works fully offline.
//
// Uses the Anthropic Messages REST API directly (no SDK dependency needed).
// Default model: claude-sonnet-5 (fast + capable for study explanations).

// Cheap status probe for the client banner — returns only a boolean, never the
// key. Lets the UI show "AI enhanced" vs "offline" without spending an AI call.
export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false });
  }

  const { prompt, language } = await req.json();

  const system =
    "You are MedCrux Tutor, a concise pharmacology teacher for 3rd-year MBBS students in Russia. " +
    "Answer in short, exam-focused bullet points. Be accurate. " +
    (language === "Russian" ? "Reply in Russian." : "Reply in clear, simple English.") +
    " Always add: 'For study only — not medical advice.' at the end.";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 700,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ configured: true, error: err }, { status: 502 });
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "(no response)";
    return NextResponse.json({ configured: true, text });
  } catch (e) {
    return NextResponse.json({ configured: true, error: String(e) }, { status: 500 });
  }
}
