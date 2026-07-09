// CPBL 資料層（來源：stats.cpbl.com.tw 進階數據站的同源代理 API）
//
// 背景：www.cpbl.com.tw 的動態 API（/home/getdetaillist、/box/getlive）已加上
// 只有真瀏覽器過得了的反爬，純 fetch 一律 307 轉首頁。stats.cpbl.com.tw 的
// `/api/proxy/v1/*` 端點對非瀏覽器回乾淨 JSON，改用它當資料來源。
//
// 端點：
//   GET /api/proxy/v1/games/schedule?kindCode=A&year=2026&month=6  整月賽事清單
//   GET /api/proxy/v1/games/{gameId}                               單場詳細(box/liveLog/mvp)
//   GET /api/proxy/v1/players/{acnt}                               球員資料
// 回傳格式：成功 {"Data":{...}}（PascalCase）；失敗 {"success":false,"message":"..."}

const { cpblFetch, cpblCached } = require("./cpblFetch.js");

const STATS_BASE = "https://stats.cpbl.com.tw/api/proxy/v1";
const STATS_REFERER = "https://stats.cpbl.com.tw/";

// 呼叫 stats.cpbl 代理 API，回傳 Data 內容；失敗則丟錯
async function statsApi(path) {
  const res = await cpblFetch(`${STATS_BASE}${path}`, {
    headers: { Referer: STATS_REFERER },
  });
  if (!res.ok) throw new Error(`stats API HTTP ${res.status}: ${path}`);
  const json = await res.json();
  if (json && json.success === false) {
    throw new Error(`stats API 錯誤(${json.message}): ${path}`);
  }
  return json.Data ?? json.data ?? json;
}

// 台北時區的今天（賽程時間以台北為準）
function taipeiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    year: Number(get("year")),
    month: Number(get("month")),
  };
}

// 取某類別某月的賽事清單（整月）
async function fetchSchedule(kindCode, year, month) {
  const data = await statsApi(
    `/games/schedule?kindCode=${kindCode}&year=${year}&month=${month}`
  );
  return data.Games || [];
}

// 取「今天」的比賽：依 kindCode 優先序，回傳第一個當日有賽事的類別。
// 預設涵蓋一軍例行/季後/總冠軍 與 二軍例行/總冠軍；月清單會被快取，
// 因此即使輪詢，對 stats.cpbl 的請求也收斂為每類別每 20 秒最多一次。
async function fetchTodayGames(kindCodes = ["A", "C", "E", "D", "F"]) {
  const { ymd, year, month } = taipeiToday();
  let lastError = null;
  let anySuccess = false;

  for (const kindCode of kindCodes) {
    let games;
    try {
      games = await cpblCached(
        `stats_sched:${kindCode}:${year}:${month}`,
        20000,
        () => fetchSchedule(kindCode, year, month)
      );
      anySuccess = true;
    } catch (error) {
      lastError = error;
      continue;
    }
    const today = games.filter((g) => (g.PreExeDate || "").startsWith(ymd));
    if (today.length) return { kindCode, date: ymd, games: today };
  }

  // 全部類別都請求失敗 → 視為 API 錯誤；有成功但今日無賽 → 回空陣列
  if (!anySuccess && lastError) throw lastError;
  return { kindCode: null, date: ymd, games: [] };
}

// 取「今天」全部類別的比賽（合併），給推播 poller 用：要同時涵蓋一軍/二軍/季後等。
// 與 fetchTodayGames 共用同一組快取 key，因此指令與輪詢對 stats.cpbl 的請求會共享。
async function fetchTodayGamesAll(kindCodes = ["A", "C", "E", "D", "F"]) {
  const { ymd, year, month } = taipeiToday();
  const games = [];
  for (const kindCode of kindCodes) {
    try {
      const monthGames = await cpblCached(
        `stats_sched:${kindCode}:${year}:${month}`,
        20000,
        () => fetchSchedule(kindCode, year, month)
      );
      games.push(...monthGames.filter((g) => (g.PreExeDate || "").startsWith(ymd)));
    } catch (error) {
      // 單一類別失敗不影響其他類別
    }
  }
  return { date: ymd, games };
}

// 台北時區目前小時（0~23）— 給 poller 做時段控制
function taipeiHour() {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());
  return Number(h) % 24;
}

// 取單場詳細（含 InningScore 逐局、LiveLog 逐球、MVP）— 給 game.js 用
async function fetchGameDetail(gameId) {
  const data = await statsApi(`/games/${gameId}`);
  return data.Game || null;
}

// 取某年一軍球隊戰績（上/下半季 + 全年），給 standing.js 用
async function fetchStandings(year) {
  const data = await cpblCached(`stats_standings:${year}`, 60000, () =>
    statsApi(`/home?TeamRecordsYear=${year}`)
  );
  const tr = data.TeamRecords?.A || {};
  return {
    firstHalf: tr.FirstHalf || [],
    secondHalf: tr.SecondHalf || [],
    fullYear: tr.FullYear || [],
  };
}

// 取球員照片網址（取代被擋的 www.cpbl.com.tw 爬蟲）；失敗或無照片回 null
async function fetchPlayerImage(acnt) {
  if (!acnt) return null;
  try {
    const data = await cpblCached(`stats_player_img:${acnt}`, 86400000, () =>
      statsApi(`/players/${acnt}`)
    );
    return data.Player?.AcntImgPath || null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  statsApi,
  taipeiToday,
  taipeiHour,
  fetchSchedule,
  fetchTodayGames,
  fetchTodayGamesAll,
  fetchGameDetail,
  fetchPlayerImage,
  fetchStandings,
};
