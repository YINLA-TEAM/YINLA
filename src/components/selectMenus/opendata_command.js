const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: {
    name: `opendata`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`🚻｜公共廁所查詢`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `使用 \`/公共廁所查詢\` 並選擇行政區，即可查詢全台公共廁所資訊`
      );

    if (interaction.values[0] == `restroom`) {
      await interaction.reply({
        embeds: [embed1],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
