import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GEMINI_API_KEY_1,
  GEMINI_API_KEY_2,
  GEMINI_API_KEY_3,
} from "../../../config/env.js";

const MAX_BATCH_SIZE = 10;
const MAX_DESCRIPTION_CHARS = 600;

const AI_CONFIGS = [
  {
    name: "Gemini-1",
    model: "gemini-3.7-flash",
    apiKey: GEMINI_API_KEY_1,
  },
  {
    name: "Gemini-2",
    model: "gemini-3.7-flash",
    apiKey: GEMINI_API_KEY_2,
  },
  {
    name: "Gemini-3",
    model: "gemini-3.7-flash",
    apiKey: GEMINI_API_KEY_3,
  },
].filter((config) => config.apiKey);

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

const SYSTEM_INSTRUCTION = `You are the AI news summarizer for NewsMint.

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
"Aaj Jaipur mein ek naveen kritrim buddhimatta kendra ka udghatan kiya gaya."`;

const createModel = (config) => {
  const genAI = new GoogleGenerativeAI(config.apiKey);

  return genAI.getGenerativeModel({
    model: config.model,

    systemInstruction: SYSTEM_INSTRUCTION,

    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
};

const isRetryableError = (error) => {
  const status =
    error?.status || error?.response?.status || error?.cause?.status;

  if (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message = error?.message?.toLowerCase() || "";

  return (
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource exhausted") ||
    message.includes("too many requests") ||
    message.includes("temporarily unavailable")
  );
};

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

export const summarizeNewsBatch = async (articles) => {
  if (!Array.isArray(articles) || !articles.length) {
    throw new Error("No articles provided for summarization");
  }

  if (articles.length > MAX_BATCH_SIZE) {
    throw new Error(`Maximum ${MAX_BATCH_SIZE} articles allowed per batch`);
  }

  if (!AI_CONFIGS.length) {
    throw new Error("No Gemini API keys configured");
  }

  const newsData = articles.map((article) => ({
    articleId: article._id.toString(),

    title: article.title,

    desc: (article.description || "").slice(0, MAX_DESCRIPTION_CHARS),
  }));

  const prompt =
    `Summarize these ${articles.length} articles:\n` + JSON.stringify(newsData);

  let lastError = null;

  for (const config of AI_CONFIGS) {
    try {
      console.log(`🤖 Trying ${config.name} | ${config.model}`);

      const model = createModel(config);

      const result = await model.generateContent(prompt);

      const validatedResult = parseAndValidateResponse(result, articles);

      console.log(
        `✅ ${config.name} successfully processed ${articles.length} articles`,
      );

      return validatedResult;
    } catch (error) {
      lastError = error;

      console.error(`❌ ${config.name} failed:`, error.message);

      if (!isRetryableError(error)) {
        throw error;
      }

      console.log(`🔄 Trying next Gemini configuration...`);
    }
  }

  const error = new Error(
    "All configured Gemini API keys/models are unavailable",
  );

  error.retryable = true;
  error.cause = lastError;

  throw error;
};
