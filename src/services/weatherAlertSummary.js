const axios = require("axios");

function getWeatherAlertAiModel() {
  return process.env.LITELLM_MODEL ?? process.env.WEATHER_ALERT_AI_MODEL;
}

function getLiteLLMProxyBaseUrl() {
  const baseURL =
    process.env.LITELLM_PROXY_URL ?? process.env.WEATHER_ALERT_AI_BASE_URL;
  return baseURL?.replace(/\/$/, "") ?? null;
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
 * 使用 LiteLLM Proxy 產生天氣警特報摘要。
 * 未完整設定 LiteLLM 時回傳 null，讓原始 CWA 警報照常推播。
 *
 * @param {object} alert
 * @returns {Promise<string | null>}
 */
async function summarizeWeatherAlert(alert) {
  const apiKey = process.env.LITELLM_API_KEY;
  const baseURL = getLiteLLMProxyBaseUrl();
  const model = getWeatherAlertAiModel();
  if (!apiKey || !baseURL || !model) return null;

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
  getLiteLLMProxyBaseUrl,
  getTextContent,
  getWeatherAlertAiModel,
  summarizeWeatherAlert,
};
