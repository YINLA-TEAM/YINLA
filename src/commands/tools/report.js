const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setNameLocalizations({
      "zh-TW": "回報問題",
    })
    .setDescription("透過表單回報問題給伺服器管理員"),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("report")
      .setTitle("📋 問題回報表單");

    const titleInput = new TextInputBuilder()
      .setCustomId("report-title")
      .setLabel("問題標題")
      .setPlaceholder("請簡短描述你遇到的問題")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

    const contentInput = new TextInputBuilder()
      .setCustomId("report-content")
      .setLabel("問題內容")
      .setPlaceholder("請詳細描述問題的發生狀況、重現步驟等")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1000)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
  },
};
