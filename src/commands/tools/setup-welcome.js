const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const welcomeSchema = require("../../Model/welcome");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`setup-welcome`)
    .setNameLocalizations({
      "zh-TW": "設定歡迎訊息",
      "zh-CN": "设定欢迎讯息",
    })
    .setDescription(
      "設定歡迎頻道，如果要重新設定訊息內容請移除再建立(一個伺服器限一個頻道)"
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName("頻道")
        .setDescription("選擇頻道發送 (如果要移除推播請任意填入一個頻道)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("setup-remove")
        .setNameLocalizations({
          "zh-TW": "建立或移除",
        })
        .setDescription(
          "如果要建立在新的頻道，請先移除再建立(一個伺服器限一個頻道)"
        )
        .setRequired(true)
        .addChoices(
          { name: "建立", value: "建立" },
          { name: "移除", value: "移除" }
        )
    )
    .addRoleOption((option) =>
      option
        .setName("加入應得的身分組")
        .setDescription("設定加入應得的身分組")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("歡迎訊息")
        .setDescription("設定歡迎訊息")
        .setRequired(false)
    ),

  async execute(interaction) {
    const { options } = interaction;

    const welcomeChannel = options.getChannel("頻道");
    const welcomeMessage = options.getString("歡迎訊息");
    const roleId = options.getRole("加入應得的身分組");

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.Administrator
      )
    ) {
      const no_admin_msg = new EmbedBuilder()
        .setTitle(`❌ **你沒有權限** 或者 **機器人沒有頻道權限**`)
        .setDescription('機器人必須擁有 **"管理頻道(Manage Channels)"** 的權限')
        .setColor(`Red`);

      interaction.reply({
        embeds: [no_admin_msg],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    welcomeSchema.findOne(
      { Guild: interaction.guild.id },
      async (err, data) => {
        if (!data && interaction.options.getString("setup-remove") == "建立") {
          await welcomeSchema.create({
            Guild: interaction.guild.id,
            Channel: welcomeChannel.id,
            Msg: welcomeMessage,
            Role: roleId ? roleId.id : null,
          });
          const success_create_welcome_msg = new EmbedBuilder()
            .setTitle(`✅ 成功建立 **歡迎訊息**`)
            .setColor(`Green`);

          interaction.reply({
            embeds: [success_create_welcome_msg],
            flags: MessageFlags.Ephemeral,
          });
        } else if (interaction.options.getString("setup-remove") == "建立") {
          const err_create_welcome_msg = new EmbedBuilder()
            .setTitle(`❌ 請確認使否有設定過推播頻道`)
            .setColor(`Red`);

          interaction.reply({
            embeds: [err_create_welcome_msg],
            flags: MessageFlags.Ephemeral,
          });
        } else if (interaction.options.getString("setup-remove") == "移除") {
          await welcomeSchema.deleteOne({
            Guild: interaction.guild.id,
          });
          const rm_welcome_msg = new EmbedBuilder()
            .setTitle(`✅ 成功移除 **歡迎訊息**`)
            .setColor(`Green`);

          interaction.reply({
            embeds: [rm_welcome_msg],
          });
        }
      }
    );
  },
};
