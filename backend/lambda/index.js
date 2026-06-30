// Lambda handler: receives jargon text from API Gateway, calls the
// Anthropic API to translate it, and returns the result.
//
// Requires the ANTHROPIC_API_KEY environment variable to be set on the
// Lambda function (never hardcode it here).

const { SYSTEM_PROMPT } = require("./prompt");

const MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";

// Allow requests from any origin during development. Lock this down to the
// Amplify domain once the frontend is deployed.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  // Preflight requests from the browser.
  if (event.requestContext?.http?.method === "OPTIONS") {
    return response(200, {});
  }

  let text;
  try {
    const body = JSON.parse(event.body || "{}");
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    return response(400, { error: "Request body must be valid JSON." });
  }

  if (!text) {
    return response(400, { error: "Missing 'text' field to translate." });
  }

  try {
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error(`Anthropic API error: status=${apiResponse.status} body=${errorBody}`);
      return response(502, { error: "Translation service is unavailable right now." });
    }

    const data = await apiResponse.json();
    const translation = data.content?.[0]?.text?.trim();

    if (!translation) {
      console.error(`Anthropic API returned no translation. Raw response: ${JSON.stringify(data)}`);
      return response(502, { error: "Translation service returned an empty response." });
    }

    return response(200, { translation });
  } catch (error) {
    console.error(`Unhandled error calling Anthropic API: ${error.message}\n${error.stack}`);
    return response(500, { error: "Something went wrong translating that." });
  }
};
