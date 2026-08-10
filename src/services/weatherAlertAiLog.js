const { EmbedBuilder } = require("discord.js");

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function buildWeatherAlertAiLogEmbed({
  alert,
  summary,
  source,
  guild,
  channel,
  cacheHit = false,
}) {
  const target = guild
    ? `${guild.name} (\`${guild.id}\`)${channel ? `\n${channel}` : ""}`
    : "私訊或未知伺服器";

  return new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("🤖 天氣警特報 AI 摘要紀錄")
    .addFields(
      { name: "來源", value: source, inline: true },
      {
        name: "摘要來源",
        value: cacheHit ? "本機 JSON 快取" : "AI 新生成",
        inline: true,
      },
      { name: "推播目標", value: target, inline: true },
      {
        name: "警特報類型與影響區域",
        value: truncate(
          `${alert.type}\n${alert.locations.length ? alert.locations.join("、") : "未提供"}`,
          1024
        ),
      },
      { name: "CWA 原始內容", value: `\`\`\`${truncate(alert.content || "未提供", 1024)}\`\`\`` },
      { name: "AI 摘要", value: `\`\`\`${truncate(summary, 1024)}\`\`\`` }
    )
    .setTimestamp();
}

async function logWeatherAlertAiSummary(client, payload) {
  // 快取摘要已在首次生成時留下紀錄，不重複推送後台訊息。
  if (payload.cacheHit) return true;

  const logChannelId = process.env.log_channel || process.env.logs_channel;
  if (!logChannelId) return false;

  const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel?.isTextBased()) {
    throw new Error(`找不到可傳送訊息的 AI 紀錄頻道: ${logChannelId}`);
  }

  await logChannel.send({ embeds: [buildWeatherAlertAiLogEmbed(payload)] });
  return true;
}

module.exports = { buildWeatherAlertAiLogEmbed, logWeatherAlertAiSummary };
