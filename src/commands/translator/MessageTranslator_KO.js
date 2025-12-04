const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  EmbedBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
} = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Translate into Korean")
    .setNameLocalizations({
      "zh-TW": "將訊息翻譯成韓文",
      "zh-CN": "将讯息翻译成韩文",
    })
    .setType(ApplicationCommandType.Message),

  async execute(interaction, client) {
    if (interaction.targetMessage.content == "") {
      const error_embed = new EmbedBuilder()
        .setTitle(`<:tranlate:1035826480904679424> 翻譯｜TRANSLATE`)
        .setDescription("這什麼都沒有")
        .setColor(`#5185e3`)
        .setTimestamp(Date.now());
      await interaction.reply({
        embeds: [error_embed],
        flags: MessageFlags.Ephemeral,
      });
    } else if (interaction.targetMessage.content.length >= 500) {
      const error_embed = new EmbedBuilder()
        .setTitle(`<:tranlate:1035826480904679424> 翻譯｜TRANSLATE`)
        .setDescription("太多了")
        .setColor(`#5185e3`)
        .setTimestamp(Date.now());
      await interaction.reply({
        embeds: [error_embed],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const translate_header = new TextDisplayBuilder().setContent(
        [
          `## <:tranlate:1035826480904679424> 翻譯｜TRANSLATE`,
          `翻譯不一定100%正確，僅供參考，(最多可翻譯500字)`,
        ].join("\n")
      );

      const original_msg = new TextDisplayBuilder().setContent(
        [`**原始訊息**`, `\`\`\`${interaction.targetMessage}\`\`\``].join("\n")
      );

      const translated_msg = new TextDisplayBuilder().setContent(
        [
          `**翻譯訊息**`,
          `\`\`\`${
            (await translate(interaction.targetMessage, { to: "ko" })).text
          }\`\`\``,
        ].join("\n")
      );

      const translate_container = new ContainerBuilder()
        .setId(1)
        .setSpoiler(false)
        .addTextDisplayComponents(translate_header)
        .addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(original_msg)
        .addSeparatorComponents((separator) =>
          separator.setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(translated_msg);

      await interaction.reply({
        components: [translate_container],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }
  },
};
