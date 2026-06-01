const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `transport`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`🚲｜公共自行車查詢`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `使用 \`/公共自行車查詢\` 並選擇行政區，即可查詢 YouBike 2.0 即時車輛資訊`
      );

    const embed2 = new EmbedBuilder()
      .setTitle(`🚇｜臺北捷運營運狀況`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`使用 \`/臺北捷運營運狀況\` 即可查詢臺北捷運的即時營運狀況`);

    if (interaction.values[0] == `youbike`) {
      await interaction.reply({
        embeds: [embed1],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `mrt`) {
      await interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
  },
};
