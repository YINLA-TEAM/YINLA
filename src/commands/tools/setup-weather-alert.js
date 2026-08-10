const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const weatherAlertChannelSchema = require("../../Model/weatherAlertChannel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-weather-alert")
    .setNameLocalizations({ "zh-TW": "設定天氣警特報推播" })
    .setDescription("設定天氣警特報推播頻道")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("action")
        .setNameLocalizations({ "zh-TW": "操作" })
        .setDescription("建立、更新或移除推播設定")
        .setRequired(true)
        .addChoices(
          { name: "建立或更新", value: "upsert" },
          { name: "移除", value: "remove" }
        )
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setNameLocalizations({ "zh-TW": "頻道" })
        .setDescription("接收天氣警特報的文字頻道")
        .addChannelTypes(ChannelType.GuildText)
    )
    .addBooleanOption((option) =>
      option
        .setName("ai-summary")
        .setNameLocalizations({ "zh-TW": "ai摘要" })
        .setDescription("是否在推播與查詢指令中顯示 AI 摘要")
    ),

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const channel = interaction.options.getChannel("channel");

    if (action === "remove") {
      await weatherAlertChannelSchema.deleteOne({ Guild: interaction.guild.id });
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor("Green").setTitle("✅ 已移除天氣警特報推播")],
      });
      return;
    }

    if (!channel) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ 請選擇接收天氣警特報的文字頻道"),
        ],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const aiSummaryEnabled = interaction.options.getBoolean("ai-summary") ?? false;
    await weatherAlertChannelSchema.findOneAndUpdate(
      { Guild: interaction.guild.id },
      {
        Channel: channel.id,
        AiSummaryEnabled: aiSummaryEnabled,
        // 更換頻道或重新設定時，讓目前有效的警報可在新設定中推播一次。
        LastAlertSignatures: [],
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ 已設定天氣警特報推播")
          .setDescription(`推播頻道：${channel}\nAI 摘要：${aiSummaryEnabled ? "已啟用" : "未啟用"}`),
      ],
    });
  },
};
