const { model, Schema } = require("mongoose");

const weatherAlertChannelSchema = new Schema({
  Guild: String,
  Channel: String,
  // 已推播警特報的指紋，用於避免每次輪詢都重複發送。
  LastAlertSignatures: { type: [String], default: [] },
  // 啟用後才會呼叫摘要服務；服務未實作或無摘要時仍會正常推播原始警報。
  AiSummaryEnabled: { type: Boolean, default: false },
});

module.exports = model("WeatherAlertChannel", weatherAlertChannelSchema);
