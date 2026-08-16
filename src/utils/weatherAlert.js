const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const CWA_WEATHER_ALERT_URL =
  "https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-002";
const CWA_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1920px-ROC_Central_Weather_Bureau.svg.png";

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

async function fetchWeatherAlerts() {
  const response = await axios.get(CWA_WEATHER_ALERT_URL, {
    params: { Authorization: process.env.cwa_key },
  });
  return response.data?.records?.record ?? [];
}

function toUnixTimestamp(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : Math.floor(time / 1000);
}

function normaliseWeatherAlert(record) {
  const info = record?.datasetInfo ?? {};
  const hazard = record?.hazardConditions?.hazards?.hazard?.[0];
  const locations =
    hazard?.info?.affectedAreas?.location
      ?.map((location) => location.locationName)
      .filter(Boolean) ?? [];
  const content = record?.contents?.content?.contentText?.trim() ?? "";

  return {
    type: info.datasetDescription ?? "天氣警特報",
    issueTime: info.issueTime ?? null,
    startTime: info.validTime?.startTime ?? null,
    endTime: info.validTime?.endTime ?? null,
    locations,
    content,
  };
}

function getWeatherAlertSignature(alert) {
  return [
    alert.type,
    alert.issueTime,
    alert.startTime,
    alert.endTime,
    alert.locations.join(","),
    alert.content,
  ].join("|");
}

function buildWeatherAlertEmbed(alert, summary = null, { summaryOnly = false } = {}) {
  const startTimestamp = toUnixTimestamp(alert.startTime);
  const endTimestamp = toUnixTimestamp(alert.endTime);
  const issueDate = alert.issueTime ? new Date(alert.issueTime) : new Date();
  const descriptionParts = [];

  if (summary) descriptionParts.push(`${summaryOnly ? "" : `**AI 摘要**\n`}${summary}`);
  if (alert.content && (!summary || !summaryOnly)) {
    descriptionParts.push(`${alert.content && summary ? `**中央氣象署原始內容**\n` : ""}${alert.content}`);
  }

  const fields = [
    {
      name: "影響區域",
      value: alert.locations.length
        ? truncate(alert.locations.map((location) => `**${location}**`).join("、"), 1024)
        : "未提供",
    },
  ];
  if (startTimestamp) {
    fields.push({
      name: "開始時間",
      value: `<t:${startTimestamp}:F>\n__(<t:${startTimestamp}:R>)__`,
      inline: true,
    });
  }
  if (endTimestamp) {
    fields.push({
      name: "結束時間",
      value: `<t:${endTimestamp}:F>\n__(<t:${endTimestamp}:R>)__`,
      inline: true,
    });
  }

  return new EmbedBuilder()
    .setAuthor({
      name: "天氣警特報",
      iconURL:
        "https://cdn.discordapp.com/emojis/1134845181141725364.webp?size=96&quality=lossless",
    })
    .setTitle(alert.type)
    .setColor("Red")
    .setDescription(
      truncate(descriptionParts.join("\n\n") || "中央氣象署未提供警報內容。", 4096)
    )
    .addFields(fields)
    .setFooter({ text: `交通部中央氣象署 • ${summary == null ? "CWA原始訊息" : `AI 摘要，僅供參考`}`, iconURL: CWA_ICON_URL })
    .setTimestamp(Number.isNaN(issueDate.getTime()) ? new Date() : issueDate);
}

module.exports = {
  buildWeatherAlertEmbed,
  fetchWeatherAlerts,
  getWeatherAlertSignature,
  normaliseWeatherAlert,
};
