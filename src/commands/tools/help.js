const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations({
      "zh-TW": "指令",
      "zh-CN": "指令",
    })
    .setDescription("commands list")
    .setDescriptionLocalizations({
      "zh-TW": "指令列表",
      "zh-CN": "指令列表",
    }),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle(`📃｜指令列表`)
      .setColor("Orange")
      .setAuthor({
        name: `YINLA`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        `</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`
      );

    const button1 = new ButtonBuilder()
      .setLabel("加入支援伺服器")
      .setStyle(ButtonStyle.Link)
      .setURL("https://discord.gg/mnCHdBbh65");
    const button2 = new ButtonBuilder()
      .setLabel("支援伺服器介紹")
      .setStyle(ButtonStyle.Link)
      .setURL("https://hackmd.io/@YinCheng0106/YINLADC");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help")
      .setPlaceholder("📖 請選擇指令種類")
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          emoji: `🔰`,
          label: `基礎指令`,
          description: "基礎",
          value: `1`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🌥️`,
          label: `氣象署相關指令`,
          description: "皆由 CWA 氣象署提供",
          value: `2`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🔷`,
          label: `應用程式`,
          description: "應用程式",
          value: `3`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `<a:Baseballemoji:1293226431916281987>`,
          label: `棒球相關指令`,
          description: "目前提供中華職棒的相關數據",
          value: `4`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🛢️`,
          label: `汽油相關指令`,
          description: "查詢汽油相關指令的功能",
          value: `5`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `📢`,
          label: `推播相關指令`,
          description: "查詢目前推播的功能",
          value: `6`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🚆`,
          label: `交通相關指令`,
          description: "公共自行車、捷運等交通資訊",
          value: `7`,
        }),
        new StringSelectMenuOptionBuilder({
          emoji: `🚻`,
          label: `生活資訊指令`,
          description: "公共廁所等生活資訊查詢",
          value: `8`,
        })
      );

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder({ components: [menu] }),
        new ActionRowBuilder({ components: [button1, button2] }),
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
