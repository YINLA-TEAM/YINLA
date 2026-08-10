const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { Signale } = require("signale");
const {
  buildWeatherAlertEmbed,
  fetchWeatherAlerts,
  normaliseWeatherAlert,
} = require("../../utils/weatherAlert");
const weatherAlertChannelSchema = require("../../Model/weatherAlertChannel");
const {
  getOrCreateWeatherAlertSummary,
} = require("../../services/weatherAlertSummaryCache");
const { logWeatherAlertAiSummary } = require("../../services/weatherAlertAiLog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather_alert")
    .setNameLocalizations({
      "zh-TW": "天氣警報",
    })
    .setDescription("檢視 天氣警報"),

  async execute(interaction) {
    const logger = new Signale({
      scope: "WEAA",
    });
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    const Alert_Embed_List = [];

    try {
      const alerts = (await fetchWeatherAlerts()).map(normaliseWeatherAlert);
      const subscription = interaction.guild
        ? await weatherAlertChannelSchema.findOne({ Guild: interaction.guild.id })
        : null;
      if (alerts.length === 0) {
        const Null_Embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("目前沒有任何天氣警報");
        Alert_Embed_List.push(Null_Embed);
      } else {
        for (const alert of alerts) {
          let summary = null;
          let cacheHit = false;
          if (subscription?.AiSummaryEnabled) {
            try {
              const result = await getOrCreateWeatherAlertSummary(alert);
              summary = result.summary;
              cacheHit = result.cacheHit;
            } catch (error) {
              logger.warn("AI 天氣警特報摘要失敗，改顯示原始內容:", error.message);
            }
          }

          Alert_Embed_List.push(buildWeatherAlertEmbed(alert, summary));
          if (summary) {
            try {
              const logged = await logWeatherAlertAiSummary(interaction.client, {
                alert,
                summary,
                source: `</${interaction.commandName}:${interaction.commandId}>\n\`${interaction.commandName}\``,
                guild: interaction.guild,
                channel: interaction.channel,
                cacheHit,
              });
              if (!logged) {
                logger.warn("AI 摘要已產生，但尚未設定 log_channel");
              }
            } catch (error) {
              logger.warn("AI 天氣警特報後台紀錄失敗:", error.message);
            }
          }
        }
      }
    } catch (error) {
      logger.error("無法獲取天氣警報資料:", error);
      Alert_Embed_List.push(
        new EmbedBuilder()
          .setColor("Red")
          .setTitle("發生錯誤")
          .setDescription("無法獲取天氣警報資料，請稍後再試。")
      );
    }

    await interaction.editReply({
      embeds: Alert_Embed_List,
      flags: MessageFlags.Ephemeral,
    });
  },
};
