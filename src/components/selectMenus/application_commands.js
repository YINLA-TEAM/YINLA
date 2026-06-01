const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `application`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`😎｜取得大頭貼`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `對使用者點擊 **右鍵(手機則長按)** 並點擊 應用程式 \n選取 \`取得大頭貼\` 將會在你所在的頻道發送`
      );

    const embed2 = new EmbedBuilder()
      .setTitle(`<:tranlate:1035826480904679424>｜將訊息翻譯成 中/日/英/韓文`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `對使用者點擊 **右鍵(手機則長按)** 並點擊 應用程式 \n選取 \`把訊息翻譯成 中/日/英/韓文\` 將會在你所在的頻道發送`
      );

    const embed3 = new EmbedBuilder()
      .setTitle(`<:tranlate:1035826480904679424>｜翻譯指令`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `使用 \`/翻譯\` 指令並選擇語言與輸入文字，即可將文字翻譯成指定語言`
      );

    if (interaction.values[0] == `avatar`) {
      await interaction.reply({
        embeds: [embed1],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `translator`) {
      await interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `translator_cmd`) {
      await interaction.reply({
        embeds: [embed3],
        ephemeral: true,
      });
    }
  },
};
