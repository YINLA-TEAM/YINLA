const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: {
    name: `report`,
  },
  async execute(interaction, client) {
    const title = interaction.fields.getTextInputValue("report-title");
    const content = interaction.fields.getTextInputValue("report-content");

    const channelId = process.env.report_channel || process.env.logs_channel;
    const reportChannel = channelId
      ? client.channels.cache.get(channelId)
      : null;

    if (!reportChannel) {
      const no_channel_msg = new EmbedBuilder()
        .setTitle(`❌ 問題回報功能尚未設定`)
        .setDescription(`找不到回報頻道，請聯絡機器人開發者`)
        .setColor(`Red`);

      await interaction.reply({
        embeds: [no_channel_msg],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const reportEmbed = new EmbedBuilder()
      .setTitle(`📋 收到新的問題回報`)
      .setColor(`Yellow`)
      .setAuthor({
        name: `${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .addFields(
        { name: "問題標題", value: title },
        { name: "問題內容", value: content },
        {
          name: "回報者",
          value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
          inline: true,
        },
        {
          name: "來源伺服器",
          value: interaction.guild
            ? `${interaction.guild.name}\n\`${interaction.guild.id}\``
            : "`DM / Unknown`",
          inline: true,
        }
      )
      .setFooter({
        text: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    await reportChannel.send({ embeds: [reportEmbed] });

    const success_msg = new EmbedBuilder()
      .setTitle(`✅ 已成功送出你的問題回報`)
      .setDescription(`感謝你的回饋，開發者會盡快查看！`)
      .setColor(`Green`);

    await interaction.reply({
      embeds: [success_msg],
      flags: MessageFlags.Ephemeral,
    });
  },
};
