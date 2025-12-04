const {
  EmbedBuilder,
  SlashCommandBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-calendar")
    .setNameLocalizations({
      "zh-TW": "建立行事曆",
    })
    .setDescription("建立一個伺服器或個人的行事曆")
    .addStringOption((option) =>
      option
        .setName("name")
        .setNameLocalizations({
          "zh-TW": "名稱",
        })
        .setDescription("行事曆的名稱")
        .setMaxLength(20)
        .setRequired(true)
    ),

  async execute(interaction) {
    const createCalendarEmbed = new EmbedBuilder()
      .setTitle("行事曆建立成功")
      .setDescription("功能尚在開發中")
      .setColor("Green");

    await interaction.reply({
      embeds: [createCalendarEmbed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
