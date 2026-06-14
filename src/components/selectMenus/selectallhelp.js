const { EmbedBuilder, MessageFlags } = require("discord.js");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  data: {
    name: `help`,
  },
  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setTitle(`🔰｜基礎指令`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed2 = new EmbedBuilder()
      .setTitle(`🌥️｜氣象署相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed3 = new EmbedBuilder()
      .setTitle(`🔷｜應用程式`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed4 = new EmbedBuilder()
      .setTitle(`⚾️｜棒球相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed5 = new EmbedBuilder()
      .setTitle(`🛢️｜汽油相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed6 = new EmbedBuilder()
      .setTitle(`📢｜推播相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed7 = new EmbedBuilder()
      .setTitle(`🚆｜交通相關`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const embed8 = new EmbedBuilder()
      .setTitle(`🚻｜生活資訊`)
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const common_menu = new StringSelectMenuBuilder()
      .setCustomId("common")
      .setPlaceholder("📖 請選擇指令")
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🔎`,
          label: `DC相關資訊查詢功能`,
          value: "search",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🤖`,
          label: `機器人狀態指令`,
          value: "bot",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `📨`,
          label: `邀請機器人`,
          value: "invite",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `📋`,
          label: `回報問題`,
          value: "report",
        })
      );

    const cwa_menu = new StringSelectMenuBuilder()
      .setCustomId("cwa")
      .setPlaceholder("📖 請選擇指令")
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🏚️`,
          label: `地震報告指令`,
          value: "eq",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `📡`,
          label: `雷達回波圖指令`,
          value: "radar",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🚨`,
          label: `天氣警報指令`,
          value: "alert",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🔭`,
          label: `氣象站指令`,
          value: "station",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🛠️`,
          label: `天氣小幫手`,
          value: "tool",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `☀️`,
          label: `紫外線指數`,
          value: "uv",
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🌀`,
          label: `颱風資訊`,
          value: "typhoon",
        })
      );

    const application_menu = new StringSelectMenuBuilder()
      .setCustomId(`application`)
      .setPlaceholder("📖 請選擇應用程式介紹")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `😎`,
          label: `取得大頭貼`,
          value: `avatar`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<:tranlate:1035826480904679424>`,
          label: `把訊息翻譯成 中/日/英/韓文`,
          value: `translator`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<:tranlate:1035826480904679424>`,
          label: `翻譯指令`,
          value: `translator_cmd`,
        })
      );

    const cpbl_menu = new StringSelectMenuBuilder()
      .setCustomId(`cpbl`)
      .setPlaceholder("📖 請選擇指令")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `<:cpbl_logo:1275836738304217181>`,
          label: `取得 中華職棒賽事`,
          value: `game`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<:cpbl_logo:1275836738304217181>`,
          label: `取得 中華職棒即時比分`,
          value: `score`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<:cpbl_logo:1275836738304217181>`,
          label: `取得 中華職棒球隊成績`,
          value: `standing`,
        })
      );

    const cpc_menu = new StringSelectMenuBuilder()
      .setCustomId(`cpc`)
      .setPlaceholder("📖 請選擇指令")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `<:cpc_logo:1293448641620611082>`,
          label: `取得 中油油價`,
          value: `oilPrice`,
        })
      );

    const news_menu = new StringSelectMenuBuilder()
      .setCustomId(`news`)
      .setPlaceholder("📖 請選擇指令")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🏚️`,
          label: `地震推播`,
          value: `news_eq`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<:cpc_logo:1293448641620611082>`,
          label: `中油油價推播`,
          value: `news_oilPrice`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `👋`,
          label: `歡迎訊息`,
          value: `news_welcome`,
        })
      );

    const transport_menu = new StringSelectMenuBuilder()
      .setCustomId(`transport`)
      .setPlaceholder("📖 請選擇指令")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🚲`,
          label: `公共自行車查詢 (YouBike)`,
          value: `youbike`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🚇`,
          label: `臺北捷運營運狀況`,
          value: `mrt`,
        })
      );

    const opendata_menu = new StringSelectMenuBuilder()
      .setCustomId(`opendata`)
      .setPlaceholder("📖 請選擇指令")
      .setDisabled(false)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🚻`,
          label: `公共廁所查詢`,
          value: `restroom`,
        })
      );

    if (interaction.values[0] == `1`) {
      await interaction.reply({
        embeds: [embed1],
        components: [new ActionRowBuilder({ components: [common_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `2`) {
      await interaction.reply({
        embeds: [embed2],
        components: [new ActionRowBuilder({ components: [cwa_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `3`) {
      await interaction.reply({
        embeds: [embed3],
        components: [new ActionRowBuilder({ components: [application_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `4`) {
      await interaction.reply({
        embeds: [embed4],
        components: [new ActionRowBuilder({ components: [cpbl_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `5`) {
      await interaction.reply({
        embeds: [embed5],
        components: [new ActionRowBuilder({ components: [cpc_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `6`) {
      await interaction.reply({
        embeds: [embed6],
        components: [new ActionRowBuilder({ components: [news_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `7`) {
      await interaction.reply({
        embeds: [embed7],
        components: [new ActionRowBuilder({ components: [transport_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
    if (interaction.values[0] == `8`) {
      await interaction.reply({
        embeds: [embed8],
        components: [new ActionRowBuilder({ components: [opendata_menu] })],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
