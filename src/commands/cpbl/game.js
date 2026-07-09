const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  ThumbnailBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
} = require("discord.js");
const { teamIcon, gameType } = require("../../types/cpblType.js");
const {
  fetchGameDetail,
  fetchPlayerImage,
} = require("../../types/cpblStats.js");
const { cpblCached } = require("../../types/cpblFetch.js");

const unix = (s) => Math.floor(new Date(s).getTime() / 1000);
const playerUrl = (acnt) => `https://stats.cpbl.com.tw/players/${acnt}`;
const FALLBACK_AVATAR =
  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png";
const LOGO_URL =
  "https://www.cpbl.com.tw/theme/common/images/project/logo_new.png";

// 資料來源 stats.cpbl 僅提供 2026 年起的賽事；更早的歷史資料因舊站 www API
// 已被反爬封鎖而無法取得（純 fetch 一律 307 轉首頁），故以年份分流並明確告知
const STATS_MIN_YEAR = 2026;

// 尚未開賽 / 取消 / 延賽 / 預備：無 box 數據可顯示
const NO_BOX_STATUS = new Set([
  "SCHEDULED",
  "POSTPONED",
  "CANCELLED",
  "RESERVED",
]);

// ── 數值格式 ────────────────────────────────────────────────────────────
const fmtAvg = (n) => (n ?? 0).toFixed(3).replace(/^0/, ""); // .268 / 1.000
const fmt2 = (n) => (n ?? 0).toFixed(2);
const ip = (p) =>
  `${p.InningPitchedCnt ?? 0}${
    p.InningPitchedDiv3Cnt ? "." + p.InningPitchedDiv3Cnt : ""
  }`;

// ── 等寬表格：中文字以 2 格寬計算，code block 內才能對齊 ─────────────────
const CJK = /[⺀-鿿가-힣豈-﫿︰-﹏＀-｠￠-￦]/;
const vWidth = (s) =>
  [...String(s)].reduce((w, c) => w + (CJK.test(c) ? 2 : 1), 0);
const padR = (s, n) => String(s) + " ".repeat(Math.max(0, n - vWidth(s)));
const padL = (s, n) => " ".repeat(Math.max(0, n - vWidth(s))) + String(s);

// cols: { h, w, r?(右對齊), get(row) }
function renderTable(rows, cols) {
  const line = (cells) =>
    cols.map((c, i) => (c.r ? padL(cells[i], c.w) : padR(cells[i], c.w))).join(" ");
  return [line(cols.map((c) => c.h)), ...rows.map((r) => line(cols.map((c) => c.get(r))))].join(
    "\n"
  );
}

const BAT_COLS = [
  { h: "棒", w: 2, get: (h) => h.Lineup ?? "" },
  { h: "守", w: 6, get: (h) => h.DefendStation || "" }, // 代守換位記法如 CF(LF) 較寬
  { h: "姓名", w: 10, get: (h) => h.HitterName || "" },
  { h: "打", w: 2, r: 1, get: (h) => h.HitCnt ?? 0 },
  { h: "安", w: 2, r: 1, get: (h) => h.HittingCnt ?? 0 },
  { h: "點", w: 2, r: 1, get: (h) => h.RunBattedINCnt ?? 0 },
  { h: "分", w: 2, r: 1, get: (h) => h.ScoreCnt ?? 0 },
  { h: "轟", w: 2, r: 1, get: (h) => h.HomeRunCnt ?? 0 },
  { h: "K", w: 2, r: 1, get: (h) => h.StrikeOutCnt ?? 0 },
  { h: "保", w: 2, r: 1, get: (h) => h.BasesONBallsCnt ?? 0 },
  { h: "打擊率", w: 5, r: 1, get: (h) => fmtAvg(h.Avg) },
];

const PIT_COLS = [
  { h: "投手", w: 10, get: (p) => p.PitcherName || "" },
  { h: "角色", w: 8, get: (p) => p.RoleType || "" }, // 「最後一任」佔 4 個中文字寬

  { h: "局數", w: 4, r: 1, get: (p) => ip(p) },
  { h: "安", w: 2, r: 1, get: (p) => p.HittingCnt ?? 0 },
  { h: "失", w: 2, r: 1, get: (p) => p.RunCnt ?? 0 },
  { h: "責", w: 2, r: 1, get: (p) => p.EarnedRunCnt ?? 0 },
  { h: "K", w: 2, r: 1, get: (p) => p.StrikeOutCnt ?? 0 },
  { h: "保", w: 2, r: 1, get: (p) => p.BasesONBallsCnt ?? 0 },
  { h: "球", w: 3, r: 1, get: (p) => p.PitchCnt ?? 0 },
  { h: "ERA", w: 5, r: 1, get: (p) => fmt2(p.Era) },
];

// 超過 Discord embed 描述上限前先截斷，附提示
const clip = (s, max = 3700) =>
  s.length > max ? s.slice(0, max) + "\n…（內容過長已截斷，請改用其他參數縮小範圍）" : s;

// 勝隊（比分較高）：勝投/救援屬勝隊、敗投屬敗隊（詳細端點的投手物件不含隊伍）
function pitcherTeams(g) {
  const awayWon = g.Visiting.Score > g.Home.Score;
  return {
    winner: awayWon ? g.Visiting.Team.Name : g.Home.Team.Name,
    loser: awayWon ? g.Home.Team.Name : g.Visiting.Team.Name,
  };
}

// MVP 數據：依 MVP 所屬隊到該隊 Pitchers / Hitters 查逐項數據
function mvpDetail(G) {
  const mvp = G.MVP;
  if (!mvp || !mvp.Name) return null;

  const team = mvp.Team.Code === G.Home.Team.Code ? G.Home : G.Visiting;
  const pitcher = (team.Pitchers || []).find((p) => p.PitcherAcnt === mvp.Acnt);
  const hitter = (team.Hitters || []).find((h) => h.HitterAcnt === mvp.Acnt);

  const lines = [`- **當年度獲選MVP次數**： ${mvp.YearlyCount}`];
  if (pitcher) {
    lines.push(
      `- **投球局數**： ${ip(pitcher)}`,
      `- **奪三振數**： ${pitcher.StrikeOutCnt}`,
      `- **失分數**： ${pitcher.RunCnt}`
    );
  } else if (hitter) {
    lines.push(
      `- **打數**： ${hitter.HitCnt}`,
      `- **打點**： ${hitter.RunBattedINCnt}`,
      `- **得分**： ${hitter.ScoreCnt}`,
      `- **安打**： ${hitter.HittingCnt}`,
      `- **全壘打**： ${hitter.HomeRunCnt}`
    );
  }
  return { mvp, lines };
}

// 勝/敗/救援投手（僅結束賽事有）
function winLoseSaveText(g) {
  if (g.GameStatus !== "FINISHED") return null;
  const { winner, loser } = pitcherTeams(g);
  const line = (label, p, team) =>
    p && p.Name
      ? `- **${label}**： ${teamIcon(team)} [${p.Name}](${playerUrl(p.Acnt)})`
      : `- **${label}**： 無`;
  const lines = [line("勝投", g.WinningPitcher, winner), line("敗投", g.LoserPitcher, loser)];
  if (g.Closer && g.Closer.Name) lines.push(line("救援", g.Closer, winner));
  return lines.join("\n");
}

// 計分板：合併主客逐局，未上場打擊的半局以 X 補齊
function scoreboardText(G) {
  const vIS = G.Visiting.InningScore || [];
  const hIS = G.Home.InningScore || [];
  const n = Math.max(vIS.length, hIS.length);
  const cell = (arr, i) => (arr[i] ? arr[i].Score : "X");

  const innings = Array.from(
    { length: n },
    (_, i) => vIS[i]?.Seq ?? hIS[i]?.Seq ?? i + 1
  );
  const row = (arr) =>
    Array.from({ length: n }, (_, i) => `\`${cell(arr, i)}\``).join(" ");
  const rhe = (t) => `\`${t.Score}\` \`${t.HittingCnt}\` \`${t.ErrorCnt}\``;

  return (
    `### <:cpbl_logo:1275836738304217181> ${innings
      .map((i) => `\`${i}\``)
      .join(" ")} | \`R\` \`H\` \`E\`\n` +
    `### ${teamIcon(G.Visiting.Team.Name)} ${row(vIS)} | ${rhe(G.Visiting)}\n` +
    `### ${teamIcon(G.Home.Team.Name)} ${row(hIS)} | ${rhe(G.Home)}`
  );
}

// ── 視圖：一般（Components V2 容器）────────────────────────────────────
async function generalView(game) {
  const sep = (separator) => separator.setSpacing(SeparatorSpacingSize.Small);

  const logo = new TextDisplayBuilder().setContent(
    `# <:cpbl_logo:1275836738304217181> 中華職棒大聯盟`
  );
  const matchup = new TextDisplayBuilder().setContent(
    `## ${teamIcon(game.Visiting.Team.Name)} ${game.Visiting.Team.Name} vs. ${teamIcon(
      game.Home.Team.Name
    )} ${game.Home.Team.Name}`
  );
  const scoreboard = new TextDisplayBuilder().setContent(scoreboardText(game));
  const referee = new TextDisplayBuilder().setContent(
    (game.Referee || []).map((r) => `- **${r.Job}**： ${r.Name || "無"}`).join("\n")
  );
  const detail = new TextDisplayBuilder().setContent(
    [
      `- **賽事時間**： <t:${unix(game.PreExeDate)}>`,
      ``,
      `-# ${game.Field?.Abbe || ""}棒球場 • ${gameType(game.KindCode)} • 編號 ${game.GameSno}`,
    ].join("\n")
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(logo)
    .addSeparatorComponents(sep)
    .addTextDisplayComponents(matchup)
    .addTextDisplayComponents(scoreboard)
    .addSeparatorComponents(sep);

  // 勝/敗/救援投手（僅結束賽事）
  const wls = winLoseSaveText(game);
  if (wls) {
    container
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(wls))
      .addSeparatorComponents(sep);
  }

  // MVP（僅結束賽事有）
  const md = mvpDetail(game);
  if (md) {
    const img = await fetchPlayerImage(md.mvp.Acnt);
    const mvpSection = new SectionBuilder()
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(img || FALLBACK_AVATAR))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `## MVP 最有價值球員`,
            `### ${teamIcon(md.mvp.Team.Name)} [${md.mvp.Name}](${playerUrl(md.mvp.Acnt)})`,
          ].join("\n")
        )
      )
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(md.lines.join("\n")));
    container.addSectionComponents(mvpSection).addSeparatorComponents(sep);
  }

  container.addTextDisplayComponents(referee).addSeparatorComponents(sep).addTextDisplayComponents(
    detail
  );

  return container;
}

// ── 視圖：embed 共用骨架 ──────────────────────────────────────────────
const matchupTitle = (g) =>
  `[${g.GameSno}] ${g.Visiting.Team.Name} vs. ${g.Home.Team.Name}`;
const headerEmbed = (g) =>
  new EmbedBuilder()
    .setAuthor({ name: "中華職棒", url: "https://www.cpbl.com.tw", iconURL: LOGO_URL })
    .setFooter({
      text: `🏟️ ${g.Field?.Abbe || ""}棒球場 • ${gameType(g.KindCode)} • 編號 ${g.GameSno}`,
    });

// ── 視圖：完整打擊 / 投手成績表 ───────────────────────────────────────
function boxEmbed(g, kind) {
  const isBat = kind === "batting";
  const cols = isBat ? BAT_COLS : PIT_COLS;
  const block = (side) => {
    const rows = (isBat ? side.Hitters : side.Pitchers) || [];
    const head = `**${teamIcon(side.Team.Name)} ${side.Team.Name}**`;
    if (!rows.length) return `${head}\n（無資料）`;
    return `${head}\n\`\`\`\n${renderTable(rows, cols)}\n\`\`\``;
  };
  return headerEmbed(g)
    .setTitle(`${matchupTitle(g)}｜${isBat ? "打擊成績表" : "投手成績表"}`)
    .setColor(isBat ? "Blue" : "Purple")
    .setDescription(clip(`${block(g.Visiting)}\n${block(g.Home)}`));
}

// ── 視圖：得分時間軸 ──────────────────────────────────────────────────
function scoringEmbed(g) {
  const e = headerEmbed(g).setTitle(`${matchupTitle(g)}｜得分時間軸`).setColor("Gold");
  const plays = (g.LiveLog || []).filter((l) => l.IsScoreCnt === "1");
  if (!plays.length) return e.setDescription("本場目前無得分紀錄");
  const lines = plays.map((l) => {
    const top = l.VisitingHomeType == 1;
    const team = top ? g.Visiting.Team.Name : g.Home.Team.Name;
    return (
      `**${l.InningSeq}局${top ? "上" : "下"}** ${teamIcon(team)} ${l.HitterName}　` +
      `\`${g.Visiting.Team.Name} ${l.VisitingScore} : ${l.HomeScore} ${g.Home.Team.Name}\`\n` +
      `-# ${l.ActionName || ""}｜${(l.Content || "").trim()}`
    );
  });
  return e.setDescription(clip(lines.join("\n")));
}

// ── 視圖：逐球文字轉播（依局數）──────────────────────────────────────
function playByPlayEmbed(g, inning) {
  const log = g.LiveLog || [];
  const innings = [...new Set(log.map((l) => l.InningSeq))].sort((a, b) => a - b);
  const target = inning ?? (innings.length ? innings[innings.length - 1] : 1);
  const e = headerEmbed(g)
    .setTitle(`${matchupTitle(g)}｜第 ${target} 局 逐球轉播`)
    .setColor("Green");

  const half = (type) => {
    const ls = log.filter((l) => l.InningSeq === target && l.VisitingHomeType == type);
    if (!ls.length) return "";
    const team = type == 1 ? g.Visiting.Team.Name : g.Home.Team.Name;
    const body = ls
      .map((l) => `\`B${l.BallCnt}-S${l.StrikeCnt} ${l.OutCnt}出局\` ${(l.Content || "").trim()}`)
      .join("\n");
    return `**${target}局${type == 1 ? "上" : "下"}　${teamIcon(team)} ${team} 進攻**\n${body}`;
  };
  const parts = [half(1), half(2)].filter(Boolean);
  if (!parts.length) return e.setDescription(`第 ${target} 局尚無逐球資料`);

  const note = innings.length
    ? `-# 可查詢局數：${innings.join("、")}（用「局數」參數切換）\n\n`
    : "";
  return e.setDescription(note + clip(parts.join("\n\n"), 3500));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cpbl_game")
    .setNameLocalizations({
      "zh-TW": "中華職棒賽事",
    })
    .setDescription("查詢賽事詳細資訊")
    .addIntegerOption((option) =>
      option
        .setName("game_year")
        .setNameLocalizations({
          "zh-TW": "比賽年份",
        })
        .setDescription("年份範圍：1990~至今")
        .setRequired(true)
        .setMinValue(1990)
        .setMaxValue(new Date().getFullYear())
    )
    .addIntegerOption((option) =>
      option
        .setName("game_number")
        .setNameLocalizations({
          "zh-TW": "比賽編號",
        })
        .setDescription("請輸入有效的比賽編號")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(360)
    )
    .addStringOption((option) =>
      option
        .setName("game_type")
        .setNameLocalizations({
          "zh-TW": "賽事類型",
        })
        .setDescription(
          "一軍例行賽、一軍明星賽、一軍總冠軍賽、二軍例行賽、一軍季後挑戰賽、二軍總冠軍賽、一軍熱身賽"
        )
        .setRequired(true)
        .addChoices(
          { name: "一軍例行賽", value: "A" },
          { name: "一軍熱身賽", value: "G" },
          { name: "一軍明星賽", value: "B" },
          { name: "一軍季後挑戰賽", value: "E" },
          { name: "一軍總冠軍賽", value: "C" },
          { name: "二軍例行賽", value: "D" },
          { name: "二軍總冠軍賽", value: "F" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("view")
        .setNameLocalizations({
          "zh-TW": "資料類型",
        })
        .setDescription("要顯示的資料類型（預設：一般）")
        .setRequired(false)
        .addChoices(
          { name: "一般（含勝敗投/MVP）", value: "general" },
          { name: "完整打擊成績表", value: "batting" },
          { name: "完整投手成績表", value: "pitching" },
          { name: "得分時間軸", value: "scoring" },
          { name: "逐球文字轉播（需指定局數）", value: "playbyplay" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("inning")
        .setNameLocalizations({
          "zh-TW": "局數",
        })
        .setDescription("僅「逐球文字轉播」用；不填則顯示最新一局")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(15)
    ),

  async execute(interaction) {
    await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });

    const year = interaction.options.getInteger("game_year");
    const number = interaction.options.getInteger("game_number");
    const type = interaction.options.getString("game_type");
    const view = interaction.options.getString("view") || "general";
    const inning = interaction.options.getInteger("inning");

    if (year < STATS_MIN_YEAR) {
      await interaction.editReply(
        `## 🚨：\`${year}\` 年的賽事資料因來源限制暫不支援，目前僅提供 \`${STATS_MIN_YEAR}\` 年起的賽事查詢`
      );
      return;
    }

    const gameId = `${year}-${type}-${number}`;

    let game;
    try {
      game = await cpblCached(`stats_game:${gameId}`, 15000, () => fetchGameDetail(gameId));
    } catch (error) {
      console.error(error);
      game = null;
    }

    if (!game || NO_BOX_STATUS.has(game.GameStatus)) {
      await interaction.editReply(
        `## 🚨：\`${year}\`年，\`${gameType(type)}\` 編號 \`${number}\` 尚未開始或無數據`
      );
      return;
    }

    if (view === "general") {
      const container = await generalView(game);
      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    let embed;
    switch (view) {
      case "batting":
      case "pitching":
        embed = boxEmbed(game, view);
        break;
      case "scoring":
        embed = scoringEmbed(game);
        break;
      case "playbyplay":
        embed = playByPlayEmbed(game, inning);
        break;
      default:
        embed = boxEmbed(game, "batting");
    }
    await interaction.editReply({ embeds: [embed] });
  },
};
