const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: {
    name: `common`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`🔎｜DC相關資訊查詢功能`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`以下指令可以點擊使用`)
      .addFields([
        {
          name: `</server-info:1033064221283450966>`,
          value: `> 查詢伺服器資訊`,
        },
        {
          name: `</user-info:1033064221283450967>`,
          value: `> 查詢個人簡介`,
        },
      ]);

    const embed2 = new EmbedBuilder()
      .setTitle(`🤖️｜機器人相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`以下指令可以點擊使用`)
      .addFields([
        {
          name: `</bot-info:1033064221283450962>`,
          value: `> 查詢機器人狀態`,
        },
      ]);

    const embed3 = new EmbedBuilder()
      .setTitle(`📨｜邀請機器人`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`使用 \`/邀請我\` 取得邀請連結，將機器人加入你的伺服器`);

    const embed4 = new EmbedBuilder()
      .setTitle(`📋｜回報問題`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `使用 \`/回報問題\` 開啟回報表單，填寫後即可將問題回報給開發者`
      );

    if (interaction.values[0] == "search") {
      await interaction.reply({
        embeds: [embed1],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == "bot") {
      await interaction.reply({
        embeds: [embed2],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == "invite") {
      await interaction.reply({
        embeds: [embed3],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == "report") {
      await interaction.reply({
        embeds: [embed4],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
