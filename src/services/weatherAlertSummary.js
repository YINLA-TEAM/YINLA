const axios = require("axios");

const DEFAULT_BASE_URL = "https://ai.exptech.dev/v1";
const DEFAULT_MODEL = "gemma-4-26b-a4b";

function getWeatherAlertAiModel() {
  return process.env.WEATHER_ALERT_AI_MODEL ?? DEFAULT_MODEL;
}

function getTextContent(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("")
      .trim();
  }
  return "";
}

/**
 * 使用 ExpTech AI 產生天氣警特報摘要。
 * 未設定 EXPTECH_API_KEY 時回傳 null，讓原始 CWA 警報照常推播。
 *
 * @param {object} alert
 * @returns {Promise<string | null>}
 */
async function summarizeWeatherAlert(alert) {
  const apiKey = process.env.EXPTECH_API_KEY;
  if (!apiKey) return null;

  const baseURL = (process.env.WEATHER_ALERT_AI_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/$/,
    ""
  );
  const model = getWeatherAlertAiModel();
  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      messages: [
        {
          role: "system",
          content:
            "你是臺灣中央氣象署警特報助理。直接輸出繁體中文臺灣用語中性摘要，限 100 字內，只整理提供內容；不要臆測、不要給防災指令、不要使用 Markdown、不要重複警特報類型。",
        },
        {
          role: "user",
          content: JSON.stringify(alert),
        },
      ],
      temperature: 0.2,
      max_tokens: 8192,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 120000,
    }
  );

  const choice = response.data?.choices?.[0];
  const summary = getTextContent(choice?.message?.content);
  if (!summary) {
    throw new Error(
      `AI API 未回傳摘要內容 (finish_reason: ${choice?.finish_reason ?? "unknown"})`
    );
  }

  return summary;
}

module.exports = {
  getTextContent,
  getWeatherAlertAiModel,
  summarizeWeatherAlert,
};
