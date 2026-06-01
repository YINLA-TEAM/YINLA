const { EmbedBuilder } = require("discord.js");
const { Signale } = require("signale");

module.exports = (client) => {
  const logger = new Signale({
    scope: "ERROR",
  });

  /**
   * 將錯誤輸出到 console，並送一則通知到 log 頻道
   * @param {Error} error 捕捉到的錯誤
   * @param {import("discord.js").Interaction} [interaction] 觸發錯誤的互動（可選）
   * @param {string} [source] 額外的來源描述，例如事件名稱（可選）
   */
  client.sendErrorLog = async (error, interaction = null, source = null) => {
    logger.error(error);

    const channelId = process.env.error_channel || process.env.logs_channel;
    if (!channelId) return;

    const errorChannel = client.channels.cache.get(channelId);
    if (!errorChannel) return;

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("⚠️ | Error Logs")
      .setFooter({
        text: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (interaction) {
      let sourceValue = source || "Unknown";
      if (
        interaction.isChatInputCommand?.() ||
        interaction.isContextMenuCommand?.()
      ) {
        sourceValue = `</${interaction.commandName}:${interaction.commandId}>\n\`${interaction.commandName}\``;
      } else if (interaction.customId) {
        sourceValue = `\`${interaction.customId}\``;
      }

      embed.addFields(
        {
          name: "User",
          value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
          inline: true,
        },
        {
          name: "Source",
          value: sourceValue,
          inline: true,
        },
        {
          name: "Channel",
          value: interaction.channel
            ? `<#${interaction.channel.id}>\n\`${interaction.channel.id}\``
            : "`DM / Unknown`",
          inline: true,
        },
        {
          name: "Guild",
          value: interaction.guild
            ? `${interaction.guild.name}\n\`${interaction.guild.id}\``
            : "`DM / Unknown`",
          inline: true,
        }
      );
    } else if (source) {
      embed.addFields({
        name: "Source",
        value: `\`${source}\``,
        inline: true,
      });
    }

    const detail = String(error?.stack || error?.message || error);
    const trimmed =
      detail.length > 1000 ? `${detail.slice(0, 1000)}\n...(已截斷)` : detail;

    embed.addFields({
      name: "Error",
      value: `\`\`\`js\n${trimmed}\n\`\`\``,
    });

    await errorChannel.send({ embeds: [embed] }).catch((err) => {
      logger.error("無法將錯誤訊息送至 log 頻道：", err);
    });
  };
};
