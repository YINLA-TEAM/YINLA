const cron = require("cron");
const { Signale } = require("signale");
const weatherAlertChannelSchema = require("../../Model/weatherAlertChannel");
const {
  getOrCreateWeatherAlertSummary,
} = require("../../services/weatherAlertSummaryCache");
const { logWeatherAlertAiSummary } = require("../../services/weatherAlertAiLog");
const {
  buildWeatherAlertEmbed,
  fetchWeatherAlerts,
  getWeatherAlertSignature,
  normaliseWeatherAlert,
} = require("../../utils/weatherAlert");

let isRunning = false;

module.exports = {
  name: "clientReady",
  once: false,

  async execute(client) {
    const logger = new Signale({ scope: "WEAA" });
    const job = new cron.CronJob(
      "0/15 * * * * *",
      async () => {
        if (isRunning) return;
        isRunning = true;

        try {
          const alerts = (await fetchWeatherAlerts()).map(normaliseWeatherAlert);
          const signatures = alerts.map(getWeatherAlertSignature);
          const subscriptions = await weatherAlertChannelSchema.find({});

          for (const subscription of subscriptions) {
            const channel = await client.channels.fetch(subscription.Channel).catch(() => null);
            if (!channel?.isTextBased()) {
              continue;
            }

            const previousSignatures = subscription.LastAlertSignatures ?? [];
            const newAlerts = alerts.filter(
              (alert, index) => !previousSignatures.includes(signatures[index])
            );

            for (const alert of newAlerts) {
              let summary = null;
              let cacheHit = false;
              if (subscription.AiSummaryEnabled) {
                try {
                  const result = await getOrCreateWeatherAlertSummary(alert);
                  summary = result.summary;
                  cacheHit = result.cacheHit;
                } catch (error) {
                  logger.warn(`AI 摘要失敗，改發送原始警報: ${error.message}`);
                }
              }
              await channel.send({
                embeds: [
                  buildWeatherAlertEmbed(alert, summary, { summaryOnly: true }),
                ],
              });
              if (summary) {
                try {
                  const logged = await logWeatherAlertAiSummary(client, {
                    alert,
                    summary,
                    source: "排程推播",
                    guild: channel.guild,
                    channel,
                    cacheHit,
                  });
                  if (!logged) {
                    logger.warn("AI 摘要已產生，但尚未設定 log_channel");
                  }
                } catch (error) {
                  logger.warn(`AI 摘要後台紀錄失敗: ${error.message}`);
                }
              }
            }

            // 無警報時清空指紋，讓下一次重新發布的警報可以再次推播。
            subscription.LastAlertSignatures = signatures;
            await subscription.save();
            if (newAlerts.length) {
              logger.success(`已推播 ${newAlerts.length} 筆天氣警特報至 Guild ${subscription.Guild}`);
            }
          }
        } catch (error) {
          logger.error("無法取得或推播天氣警特報:", error);
        } finally {
          isRunning = false;
        }
      },
      null,
      true,
      "Asia/Taipei"
    );

    job.start();
    logger.success("啟動天氣警特報任務");
  },
};
