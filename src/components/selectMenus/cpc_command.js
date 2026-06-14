const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: {
    name: `cpc`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`💰｜中油油價`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(
        "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
      )
      .setDescription(`可以查詢 中油油價資訊\n(更新時間為每周日中午12點整)`);

    if (interaction.values[0] == `oilPrice`) {
      await interaction.reply({
        embeds: [embed1],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
