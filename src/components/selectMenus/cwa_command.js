const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: {
    name: `cwa`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`🏚️｜地震報告`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`可以查詢有編號以及無編號的最新地震報告`);

    const embed2 = new EmbedBuilder()
      .setTitle(`📡｜雷達回波`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`取得最新的雷達回波圖`);

    const embed3 = new EmbedBuilder()
      .setTitle(`🚨｜天氣警報`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `查詢當前的天氣警報\nEX:\`大雨特報\`、\`陸上颱風警報\`等`
      );

    const embed4 = new EmbedBuilder()
      .setTitle(`🔭｜氣象站`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `查詢氣象站最新的資料\n資料：\`天氣狀態\`、\`濕度\`、\`氣壓\`、\`氣壓\`、\`當前氣溫\`、\`最高溫\`、\`最低溫\``
      );

    const embed5 = new EmbedBuilder()
      .setTitle(`🛠️｜天氣小幫手`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`查詢近期兩天的氣象，並且利用口語化的方式報導`);

    const embed6 = new EmbedBuilder()
      .setTitle(`☀️｜紫外線指數`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`查詢該地區當下的紫外線指數`);

    const embed7 = new EmbedBuilder()
      .setTitle(`🌀｜颱風資訊`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(`取得颱風的相關資訊`);

    if (interaction.values[0] == `eq`) {
      await interaction.reply({
        embeds: [embed1],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `radar`) {
      await interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `alert`) {
      await interaction.reply({
        embeds: [embed3],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `station`) {
      await interaction.reply({
        embeds: [embed4],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `tool`) {
      await interaction.reply({
        embeds: [embed5],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `uv`) {
      await interaction.reply({
        embeds: [embed6],
        ephemeral: true,
      });
    }
    if (interaction.values[0] == `typhoon`) {
      await interaction.reply({
        embeds: [embed7],
        ephemeral: true,
      });
    }
  },
};
