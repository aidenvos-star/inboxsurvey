import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

export const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export const SEARCH_QUERY = "in:anywhere";

let engine = null;

export async function loadModelIfNeeded(onProgress) {
  if (engine) return engine;

  if (!navigator.gpu) {
    throw new Error(
      "This browser doesn't support WebGPU yet, which the local AI model needs."
    );
  }

  engine = await CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (progress) => {
      const percent = Math.round((progress.progress || 0) * 100);
      if (onProgress) onProgress(percent);
    },
  });

  return engine;
}

export function getHeader(headers, name) {
  const match = headers.find((h) => h.name === name);
  return match ? match.value : "";
}

export async function fetchAllMessageIds(accessToken, query = SEARCH_QUERY) {
  const ids = [];
  let pageToken = null;

  do {
    const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    url.searchParams.set("q", query);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 401) throw new Error("UNAUTHORIZED");

    const data = await res.json();
    if (data.messages) {
      ids.push(...data.messages.map((m) => m.id));
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return ids;
}

export async function classifyEmail(from, subject, snippet, onFound) {
  if (!engine) {
    throw new Error("Model not loaded yet — call loadModelIfNeeded() first.");
  }

  const prompt =
    `Analyze this email. Detect ANY sign the user signed up, subscribed, registered, joined, or created an account with a company, service, platform, newsletter, mailing list, club, or app — free or paid, active or expired.\n\n` +
    `Signals to look for: welcome, verification, confirmation, password reset, login alert, receipt, invoice, renewal, billing reminder, newsletter, digest, update, promotion from a known service, trial start, upgrade, cancellation, or ANY email implying the user gave their email to an organization.\n\n` +
    `From: ${from}\n` +
    `Subject: ${subject}\n` +
    `Preview: ${snippet}\n\n` +
    `If a user-company relationship is detected, reply with ONLY the company or service name (1-4 words, no punctuation, no explanation).\n` +
    `If this is purely personal, unrelated, or generic spam with no identifiable service, reply exactly: NONE`;

  const reply = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a precise email analyzer. You detect any sign of a user having a relationship with a company or service. You reply with ONLY a company name or NONE. Never explain.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
    max_tokens: 15,
  });

  const verdict = (reply.choices[0].message.content || "").trim();

  if (verdict && verdict.toUpperCase() !== "NONE" && verdict.length < 60) {
    const cleanName = verdict.replace(/[.,;:!?]+$/, "");
    if (onFound) onFound(cleanName);
    return cleanName;
  }

  return null;
}
