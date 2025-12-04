const {
  SlashCommandBuilder,
  SlashCommandUserOption,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user-info")
    .setNameLocalizations({
      "zh-TW": "個人簡介",
    })
    .setDescription("取得個人簡介")
    .addUserOption(
      new SlashCommandUserOption()
        .setName("成員")
        .setDescription("誰的個人簡介")
    ),

  async execute(interaction, client) {
    const member = interaction.options.getMember("成員") || interaction.member;
    const embed = new EmbedBuilder()
      .setTitle(
        `${member.user.globalName} (${member.user.username.replaceAll(
          "_",
          "\\_"
        )})`
      )
      .setColor("Random")
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp(Date.now())
      .setImage(interaction.user.bannerURL())
      .setAuthor({
        url: member.user.displayAvatarURL(),
        iconURL: member.user.displayAvatarURL(),
        name: `個人簡介`,
      })
      .setFooter({
        iconURL: client.user.displayAvatarURL(),
        text: `YINLA`,
      })
      .addFields([
        {
          name: `🪪｜使用者ID`,
          value: `\`${member.user.id}\``,
        },
        {
          name: `💩｜伺服器暱稱`,
          value: `\`${member.nickname === null ? "未設定" : member.nickname}\``,
        },
        {
          name: `🔰｜創立帳號時間`,
          value: `**__<t:${parseInt(
            member.user.createdTimestamp / 1000
          )}>__ (<t:${parseInt(member.user.createdTimestamp / 1000)}:R>)**`,
        },
        {
          name: `👥｜加入伺服時間`,
          value: `**__<t:${parseInt(
            member.joinedTimestamp / 1000
          )}>__ (<t:${parseInt(member.joinedTimestamp / 1000)}:R>)**`,
        },
        {
          name: `🤖｜機器人`,
          value: `${member.user.bot ? "`✅`" : "`❎`"}`,
        },
      ]);
    console.log(member);
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
