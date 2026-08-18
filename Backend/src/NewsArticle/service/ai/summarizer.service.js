import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../../../config/env.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MAX_BATCH_SIZE = 10;
const MAX_DESCRIPTION_CHARS = 600; // caps outlier long descriptions from inflating input tokens

// Structure enforced by Gemini itself — no need to describe/repeat it in the prompt text.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    articles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          articleId: { type: "string" },
          summary: {
            type: "object",
            properties: {
              english: { type: "string" },
              hindi: { type: "string" },
            },
            required: ["english", "hindi"],
          },
          keyPoints: {
            type: "object",
            properties: {
              english: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
              hindi: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ["english", "hindi"],
          },
        },
        required: ["articleId", "summary", "keyPoints"],
      },
    },
  },
  required: ["articles"],
};

const SYSTEM_INSTRUCTION = `You are the AI news summarizer for NewsMint.

For each article in the input array, return one result with:
- articleId: copy the input "id" value exactly, unchanged
- summary.english: 2-3 factual, neutral sentences. No opinions, no invented facts.
- summary.hindi: same summary in natural Hinglish (Hindi written in Roman script, NOT Devanagari, NOT formal/pure Hindi). Write like everyday WhatsApp chat, mixing common English words freely. Keep technical, business, tech, and proper nouns in English rather than force-translating them. Preserve names, numbers, dates, places exactly.
- keyPoints.english: exactly 3 key points, same factual/neutral rules as above.
- keyPoints.hindi: exactly 3 key points in the same Hinglish style as summary.hindi.

Hinglish tone example:
"Or bhai, aaj ki main news ye hai ki Jaipur mein ek naya AI Center open kiya gaya hai. Yahan students ko AI aur latest technology ke baare mein training di jayegi."
Avoid formal Hindi like: "Aaj Jaipur mein ek naveen kritrim buddhimatta kendra ka udghatan kiya gaya."

Hard rules: use ONLY the information given per article, never invent facts, never mix content between articles, return exactly one result per input article, in any order.`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  systemInstruction: SYSTEM_INSTRUCTION,
  generationConfig: {
    temperature: 0.35,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: RESPONSE_SCHEMA,
  },
});

export const summarizeNewsBatch = async (articles) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("No articles provided for summarization");
  }
  if (articles.length > MAX_BATCH_SIZE) {
    throw new Error(`Maximum ${MAX_BATCH_SIZE} articles allowed per batch`);
  }

  // Short keys + only fields the model actually needs = fewer input tokens.
  const newsData = articles.map((article) => ({
    articleId: article._id.toString(),
    title: article.title,
    desc: (article.description || "").slice(0, MAX_DESCRIPTION_CHARS),
  }));

  const prompt = `Summarize these ${articles.length} articles:\n${JSON.stringify(newsData)}`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    throw error;
  }

  const candidate = result.response?.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.error("Gemini finished abnormally:", candidate.finishReason);
  }

  const responseText = result.response.text().trim();

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (error) {
    console.error("Invalid Gemini JSON response:", responseText);
    throw new Error("Gemini returned invalid JSON");
  }

  if (!parsed || !Array.isArray(parsed.articles)) {
    throw new Error("Invalid Gemini response structure");
  }
  if (parsed.articles.length !== articles.length) {
    throw new Error(
      `Gemini returned ${parsed.articles.length} articles, expected ${articles.length}`,
    );
  }

  const inputIds = new Set(articles.map((a) => a._id.toString()));
  const seen = new Map();

  for (const item of parsed.articles) {
    const id = item.articleId;

    if (!id || !inputIds.has(id)) {
      throw new Error(`Unknown or missing articleId returned by Gemini: ${id}`);
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate articleId returned by Gemini: ${id}`);
    }
    if (
      !item.summary?.english ||
      !item.summary?.hindi ||
      item.keyPoints?.english?.length !== 3 ||
      item.keyPoints?.hindi?.length !== 3
    ) {
      throw new Error(`Malformed AI result for articleId: ${id}`);
    }

    seen.set(id, item);
  }
  if (seen.size !== articles.length) {
    throw new Error(
      `Expected ${articles.length} unique articles, got ${seen.size}`,
    );
  }

  // Shaped to drop straight into your Mongo "ai" subdocument.
  return articles.map((article) => {
    const id = article._id.toString();
    const r = seen.get(id);
    return {
      articleId: id,

      summary: {
        english: r.summary.english,
        hindi: r.summary.hindi,
      },

      keyPoints: {
        english: r.keyPoints.english,
        hindi: r.keyPoints.hindi,
      },
    };
  });
};
