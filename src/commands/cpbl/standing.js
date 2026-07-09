const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { teamIcon } = require("../../types/cpblType.js");
const { fetchStandings, taipeiToday } = require("../../types/cpblStats.js");

const fmtPct = (p) => (p ?? 0).toFixed(3).replace(/^0/, ""); // 0.679 → .679
const fmtGB = (gb) => (gb == null ? "-" : `${gb}`); // 領先者 GB 為 null
const fmtStreak = (s) => (s > 0 ? `${s}連勝` : s < 0 ? `${-s}連敗` : "-");
const fmtWLT = (t) =>
  `${t.GameResultWCnt}勝${t.GameResultLCnt}敗${t.GameResultTCnt}和`;

const row = (t) =>
  `\`#${t.Ranking}\` ${teamIcon(t.Team.Name)} **${t.Team.Name}**　\`${t.GameCnt}\` 場\n` +
  `　${fmtWLT(t)}・勝率 \`${fmtPct(t.Pct)}\`・勝差 \`${fmtGB(t.GB)}\`・\`${fmtStreak(
    t.Strk
  )}\``;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cpbl_standing")
    .setNameLocalizations({
      "zh-TW": "中華職棒球隊成績",
    })
    .setDescription("查看 中華職棒目前賽季球隊成績")
    .addStringOption((option) =>
      option
        .setName("season")
        .setNameLocalizations({
          "zh-TW": "賽季",
        })
        .setDescription("上半季 or 下半季")
        .setRequired(true)
        .addChoices(
          { name: "上半季", value: "上半季" },
          { name: "下半季", value: "下半季" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    const { year } = taipeiToday();

    let standings;
    try {
      standings = await fetchStandings(year);
    } catch (error) {
      console.error(error);
      await interaction.editReply("# 🚨：無法取得球隊成績，請稍後再試");
      return;
    }

    const season = interaction.options.getString("season");
    const teams = season === "上半季" ? standings.firstHalf : standings.secondHalf;
    const seasonLabel = season === "上半季" ? "上半賽季" : "下半賽季";

    if (!teams.length) {
      await interaction.editReply(
        `# 📭：\`${year}\` 年${seasonLabel}尚無戰績資料`
      );
      return;
    }

    const standingEmbed = new EmbedBuilder()
      .setAuthor({
        name: "中華職棒",
        url: "https://www.cpbl.com.tw",
        iconURL:
          "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
      })
      .setTitle(`${year} ${seasonLabel} 球隊戰績`)
      .setDescription(teams.map(row).join("\n"))
      .setColor("Blue");

    await interaction.editReply({
      embeds: [standingEmbed],
    });
  },
};
