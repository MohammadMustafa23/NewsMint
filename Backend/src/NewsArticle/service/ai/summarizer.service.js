import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  GEMINI_API_KEY_1,
  GEMINI_API_KEY_2,
  GEMINI_API_KEY_3,
} from "../../../config/env.js";

const MAX_BATCH_SIZE = 5;
const MAX_DESCRIPTION_CHARS = 600;

// ======================================================
// GEMINI MODELS
// ======================================================

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
];

// ======================================================
// GEMINI API KEYS
// ======================================================

const GEMINI_KEYS = [
  {
    name: "Gemini-1",
    apiKey: GEMINI_API_KEY_1,
  },
  {
    name: "Gemini-2",
    apiKey: GEMINI_API_KEY_2,
  },
  {
    name: "Gemini-3",
    apiKey: GEMINI_API_KEY_3,
  },
].filter((config) => config.apiKey);

// ======================================================
// RESPONSE SCHEMA
// ======================================================

const RESPONSE_SCHEMA = {
  type: "object",

  properties: {
    articles: {
      type: "array",

      items: {
        type: "object",

        properties: {
          articleId: {
            type: "string",
          },

          summary: {
            type: "object",

            properties: {
              english: {
                type: "string",
              },

              hindi: {
                type: "string",
              },
            },

            required: ["english", "hindi"],
          },

          keyPoints: {
            type: "object",

            properties: {
              english: {
                type: "array",

                items: {
                  type: "string",
                },

                minItems: 3,
                maxItems: 3,
              },

              hindi: {
                type: "array",

                items: {
                  type: "string",
                },

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

// ======================================================
// SYSTEM INSTRUCTION
// ======================================================

const SYSTEM_INSTRUCTION = `
You are the AI news summarizer for NewsMint.

For each article in the input array, return exactly one result.

Rules:

- articleId: copy the input "articleId" value exactly, unchanged.
- summary.english: 2-3 factual, neutral sentences.
- summary.hindi: same summary in natural Hinglish using Roman script.
- Do NOT use Devanagari.
- Do NOT use formal/pure Hindi.
- Use common English words naturally.
- Keep technical, business, technology and proper nouns in English.
- Preserve names, numbers, dates and places exactly.
- keyPoints.english: exactly 3 factual key points.
- keyPoints.hindi: exactly 3 factual key points in natural Hinglish.
- Never invent facts.
- Never mix information between articles.
- Use ONLY the information provided for each article.
- Return exactly one result for every input article.

Hinglish example:

"Or bhai, aaj ki main news ye hai ki Jaipur mein ek naya AI Center open kiya gaya hai. Yahan students ko AI aur latest technology ke baare mein training di jayegi."

Avoid formal Hindi:

"Aaj Jaipur mein ek naveen kritrim buddhimatta kendra ka udghatan kiya gaya."
`;

// ======================================================
// CREATE GEMINI MODEL
// ======================================================

const createModel = (apiKey, model) => {
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model,

    systemInstruction: SYSTEM_INSTRUCTION,

    generationConfig: {
      maxOutputTokens: 8192,

      responseMimeType: "application/json",

      responseSchema: RESPONSE_SCHEMA,
    },
  });
};

// ======================================================
// CHECK RETRYABLE ERROR
// ======================================================

const isRetryableError = (error) => {
  const status =
    error?.status || error?.response?.status || error?.cause?.status;

  // Rate limit / quota
  if (status === 429) {
    return true;
  }

  // Temporary server errors
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }

  const message = error?.message?.toLowerCase() || "";

  return (
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource exhausted") ||
    message.includes("too many requests") ||
    message.includes("temporarily unavailable") ||
    message.includes("overloaded") ||
    message.includes("service unavailable")
  );
};

// ======================================================
// PARSE + VALIDATE GEMINI RESPONSE
// ======================================================

const parseAndValidateResponse = (result, articles) => {
  const candidate = result.response?.candidates?.[0];

  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`Gemini finished with: ${candidate.finishReason}`);
  }

  const responseText = result.response.text().trim();

  if (!responseText) {
    throw new Error("Gemini returned an empty response");
  }

  let parsed;

  try {
    parsed = JSON.parse(responseText);
  } catch {
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

  const inputIds = new Set(articles.map((article) => article._id.toString()));

  const seen = new Map();

  for (const item of parsed.articles) {
    const id = item.articleId;

    if (!id || !inputIds.has(id)) {
      throw new Error(`Unknown articleId returned by Gemini: ${id}`);
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

  // Keep original article order
  return articles.map((article) => {
    const id = article._id.toString();

    const result = seen.get(id);

    return {
      articleId: id,

      summary: {
        english: result.summary.english,
        hindi: result.summary.hindi,
      },

      keyPoints: {
        english: result.keyPoints.english,
        hindi: result.keyPoints.hindi,
      },
    };
  });
};

// ======================================================
// SUMMARIZE NEWS BATCH
// ======================================================

export const summarizeNewsBatch = async (articles) => {
  // ----------------------------------------------------
  // Validate input
  // ----------------------------------------------------

  if (!Array.isArray(articles) || !articles.length) {
    throw new Error("No articles provided for summarization");
  }

  if (articles.length > MAX_BATCH_SIZE) {
    throw new Error(`Maximum ${MAX_BATCH_SIZE} articles allowed per batch`);
  }

  if (!GEMINI_KEYS.length) {
    throw new Error("No Gemini API keys configured");
  }

  // ----------------------------------------------------
  // Prepare news data
  // ----------------------------------------------------

  const newsData = articles.map((article) => ({
    articleId: article._id.toString(),

    title: article.title,

    desc: (article.description || "").slice(0, MAX_DESCRIPTION_CHARS),
  }));

  const prompt =
    `Summarize these ${articles.length} articles:\n` + JSON.stringify(newsData);

  let lastError = null;

  // ====================================================
  // FALLBACK SYSTEM
  //
  // 3.6:
  //   Key 1 → Key 2 → Key 3
  //
  // 3.5:
  //   Key 1 → Key 2 → Key 3
  //
  // 3.7:
  //   Key 1 → Key 2 → Key 3
  // ====================================================

  for (const model of GEMINI_MODELS) {
    for (const keyConfig of GEMINI_KEYS) {
      try {
        console.log(`🤖 Trying ${keyConfig.name} | ${model}`);

        const geminiModel = createModel(keyConfig.apiKey, model);

        const result = await geminiModel.generateContent(prompt);

        const validatedResult = parseAndValidateResponse(result, articles);

        console.log(
          `✅ SUCCESS | ${keyConfig.name} | ${model} | ${articles.length} articles`,
        );

        return validatedResult;
      } catch (error) {
        lastError = error;

        console.error(`❌ FAILED | ${keyConfig.name} | ${model}`);

        console.error(`   Reason: ${error.message}`);

        // ----------------------------------------------
        // Non-retryable error
        // ----------------------------------------------

        if (!isRetryableError(error)) {
          console.error(`🛑 Non-retryable error. Stopping.`);

          throw error;
        }

        // ----------------------------------------------
        // Retryable error
        // ----------------------------------------------

        console.warn(`🔄 Retryable error. Switching configuration...`);
      }
    }

    console.warn(
      `⚠️ All API keys failed for ${model}. Moving to next model...`,
    );
  }

  // ====================================================
  // EVERYTHING FAILED
  // ====================================================

  const error = new Error("All Gemini API keys and models are unavailable");

  error.retryable = true;
  error.cause = lastError;

  throw error;
};
