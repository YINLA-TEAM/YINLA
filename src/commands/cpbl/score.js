const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { teamIcon, gameType } = require("../../types/cpblType.js");
const {
  fetchTodayGames,
  fetchGameDetail,
  fetchStandings,
  taipeiToday,
} = require("../../types/cpblStats.js");
const { cpblCached } = require("../../types/cpblFetch.js");

// 比賽編號顯示：總冠軍/季後/二軍總冠軍用 GAME x，其餘補零
const gameNoLabel = (g) =>
  ["C", "E", "F"].includes(g.KindCode)
    ? `GAME ${g.GameSno}`
    : String(g.GameSno).padStart(3, "0");

const unix = (s) => Math.floor(new Date(s).getTime() / 1000);
const playerUrl = (acnt) => `https://stats.cpbl.com.tw/players/${acnt}`;

// 賽程端點每場自帶的 AccumulationScore 是「該場排定當時」的累積戰績快照，對尚未開打
// （含延賽改期）的賽事多半過時或為 0-0-0。改以戰績端點建當季即時對照（代碼+隊名雙鍵），
// 查無（如二軍無一軍戰績）才退回該場自帶的 AccumulationScore。
function buildRecordLookup(standings) {
  const map = new Map();
  for (const t of standings?.fullYear || []) {
    const v = `${t.GameResultWCnt}-${t.GameResultLCnt}-${t.GameResultTCnt}`;
    map.set(t.Team.Code, v);
    map.set(t.Team.Name, v);
  }
  return map;
}
const wltOf = (side, records) =>
  records.get(side.Team.Code) ??
  records.get(side.Team.Name) ??
  `${side.AccumulationScore?.W ?? 0}-${side.AccumulationScore?.L ?? 0}-${
    side.AccumulationScore?.T ?? 0
  }`;

const AUTHOR = {
  name: "中華職棒",
  url: "https://www.cpbl.com.tw",
  iconURL: "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png",
};
const footerOf = (g) => ({
  text: `🏟️ ${g.Field?.Abbe || ""}棒球場 • ${gameType(g.KindCode)}`,
});

// 投手欄位（勝敗投/中繼），以比分高低推斷所屬隊以套用隊徽
const pitcherField = (label, pitcher, teamName) =>
  pitcher && pitcher.Name
    ? {
        name: label,
        value: `${teamIcon(teamName)} [${pitcher.Name}](${playerUrl(pitcher.Acnt)})`,
        inline: true,
      }
    : { name: label, value: "無", inline: true };

// 賽程端點不含逐球即時資料；好壞球/壘包/投球數/當前對戰只在單場詳細端點的
// LiveLog（逐球陣列）裡，最後一筆即為「當前狀態」。SCHEDULED 等非進行中狀態無
// LiveLog 可取，不必額外打 detail。
const NON_LIVE = new Set([
  "SCHEDULED",
  "RESERVED",
  "POSTPONED",
  "CANCELLED",
  "FINISHED",
]);

// 從 detail 的最新一筆 LiveLog 取當前局面：好壞球、出局、投球數、壘包、對戰投打。
// VisitingHomeType==1 為上半局（客隊進攻）→ 打者屬客隊、投手屬主隊，反之亦然。
function extractLive(detail, awayName, homeName) {
  const log = detail?.LiveLog;
  if (!log || !log.length) return null;
  const l = log[log.length - 1];
  const battingAway = String(l.VisitingHomeType) === "1";
  return {
    balls: l.BallCnt ?? 0,
    strikes: l.StrikeCnt ?? 0,
    outs: l.OutCnt ?? 0,
    pitches: l.PitchCnt ?? 0,
    // 壘包欄位存跑者背號字串，空字串＝無人在壘
    bases: {
      first: Boolean(l.FirstBase),
      second: Boolean(l.SecondBase),
      third: Boolean(l.ThirdBase),
    },
    pitcher: {
      name: l.PitcherName,
      acnt: l.PitcherAcnt,
      no: l.PitcherUniformNo,
      team: battingAway ? homeName : awayName,
    },
    hitter: {
      name: l.HitterName,
      acnt: l.HitterAcnt,
      no: l.HitterUniformNo,
      team: battingAway ? awayName : homeName,
    },
  };
}

// 壘包狀態文字：無人 / 滿壘 / 「一、二壘有人」等
const baseText = (b) => {
  const on = [b.first && "一", b.second && "二", b.third && "三"].filter(Boolean);
  if (!on.length) return "壘上無人";
  if (on.length === 3) return "滿壘";
  return `${on.join("、")}壘有人`;
};

// 當前對戰投/打欄位：隊徽 + 背號姓名（連結球員頁）
const livePlayerField = (label, p) =>
  p && p.name
    ? {
        name: label,
        value: `${teamIcon(p.team)} [${p.no ? p.no + " " : ""}${p.name}](${playerUrl(p.acnt)})`,
        inline: true,
      }
    : { name: label, value: "—", inline: true };

function buildEmbed(g, records, live) {
  const away = g.Visiting;
  const home = g.Home;
  const awayName = away.Team.Name;
  const homeName = home.Team.Name;
  const awayWLT = wltOf(away, records);
  const homeWLT = wltOf(home, records);
  const title = `[${gameNoLabel(g)}] ${awayName} vs. ${homeName}`;
  const embed = new EmbedBuilder().setAuthor(AUTHOR).setFooter(footerOf(g));

  switch (g.GameStatus) {
    case "SCHEDULED":
      return embed
        .setTitle(`[${gameNoLabel(g)}] ${teamIcon(awayName)} vs. ${teamIcon(homeName)}`)
        .setDescription(
          `# 比賽尚未開始\n> 預定於 **<t:${unix(g.PreExeDate)}>**__(<t:${unix(
            g.PreExeDate
          )}:R>)__ 開始`
        )
        .setColor("Blue")
        .addFields(
          { name: "客隊勝敗和", value: awayWLT, inline: true },
          { name: "主隊勝敗和", value: homeWLT, inline: true }
        );

    case "RESERVED":
      return embed
        .setTitle(title)
        .setDescription("# 如有需要才進行")
        .setColor("Greyple");

    case "POSTPONED":
      return embed.setTitle(title).setDescription("# 賽事已延賽").setColor("Red");

    case "CANCELLED":
      return embed
        .setTitle(title)
        .setDescription("# 賽事已取消")
        .setColor("DarkRed");

    case "FINISHED": {
      // 勝隊（比分較高）：勝投/中繼屬勝隊、敗投屬敗隊
      const awayWon = away.Score > home.Score;
      const winnerTeam = awayWon ? awayName : homeName;
      const loserTeam = awayWon ? homeName : awayName;
      return embed
        .setTitle(`[${gameNoLabel(g)}] 比賽結束`)
        .setDescription(
          `# ${teamIcon(awayName)} \`${away.Score}\` vs. \`${home.Score}\` ${teamIcon(homeName)}`
        )
        .setColor("Red")
        .addFields(
          pitcherField("勝投", g.WinningPitcher, winnerTeam),
          pitcherField("敗投", g.LoserPitcher, loserTeam),
          ...(g.Closer && g.Closer.Name
            ? [pitcherField("中繼/救援", g.Closer, winnerTeam)]
            : [{ name: "** **", value: "** **", inline: true }]),
          { name: "客隊勝敗和", value: awayWLT, inline: true },
          { name: "主隊勝敗和", value: homeWLT, inline: true }
        );
    }

    default: {
      // 進行中（PLAYING / LIVE / 其他未列舉的非結束狀態）：顯示即時比分與局數，
      // 並在取得 LiveLog 時補上當前對戰投打、壘包、好壞球、出局數、投球數
      const fields = [];
      if (live) {
        fields.push(
          livePlayerField("對戰投手", live.pitcher),
          livePlayerField("對戰打者", live.hitter),
          { name: "壘包", value: baseText(live.bases), inline: true },
          { name: "好球-壞球", value: `${live.strikes}-${live.balls}`, inline: true },
          { name: "出局數", value: `${live.outs}`, inline: true },
          { name: "投球數", value: `${live.pitches} 球`, inline: true }
        );
      }
      fields.push(
        { name: "客隊勝敗和", value: awayWLT, inline: true },
        { name: "主隊勝敗和", value: homeWLT, inline: true }
      );
      return embed
        .setTitle(title)
        .setDescription(
          `# ${teamIcon(awayName)} \`${away.Score}\` ${g.InningSeq}${
            g.VisitingHomeType == 1 ? "上" : "下"
          } \`${home.Score}\` ${teamIcon(homeName)}`
        )
        .setColor("Green")
        .addFields(...fields);
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cpbl_score")
    .setNameLocalizations({
      "zh-TW": "中華職棒即時比分",
    })
    .setDescription("中華職棒即時比分"),

  async execute(interaction) {
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    let today;
    try {
      today = await fetchTodayGames();
    } catch (error) {
      console.error(error);
      await interaction.editReply("# 🚨：擷取賽事資料發生錯誤，請稍後再試");
      return;
    }

    if (today.games.length === 0) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle("今日無比賽").setColor("Red")],
      });
      return;
    }

    // 取當季戰績作勝敗和（戰績抓失敗不影響比分顯示，退回各場自帶值）
    let records = new Map();
    try {
      records = buildRecordLookup(await fetchStandings(taipeiToday().year));
    } catch (error) {
      console.error(error);
    }

    const games = today.games.slice(0, 10);

    // 進行中場次另抓單場詳細，取 LiveLog 最新一筆當「當前局面」（與 game.js 共用
    // 15 秒快取，避免輪詢重複打 API）。單場抓失敗只是少了即時欄位，不影響比分。
    const liveMap = new Map();
    await Promise.all(
      games.map(async (g) => {
        if (NON_LIVE.has(g.GameStatus)) return;
        try {
          const detail = await cpblCached(`stats_game:${g.GameId}`, 15000, () =>
            fetchGameDetail(g.GameId)
          );
          const live = extractLive(detail, g.Visiting.Team.Name, g.Home.Team.Name);
          if (live) liveMap.set(g.GameId, live);
        } catch (error) {
          console.error(error);
        }
      })
    );

    const embeds = games.map((g) => buildEmbed(g, records, liveMap.get(g.GameId)));
    await interaction.editReply({ embeds });
  },
};
