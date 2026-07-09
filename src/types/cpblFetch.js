// CPBL 共用請求工具
// 1. 統一 User-Agent / Referer，避免無標頭爬蟲被限流
// 2. 逾時控制（AbortController），避免請求卡死把後續輪詢疊在一起
// 3. 手動跟隨重導並沿途累積 Set-Cookie 回送，化解 CPBL WAF 的
//    「cookie 挑戰式重導迴圈」（原生 fetch 不保存 cookie 會無限重導 → TooManyRedirects）
// 4. 命中 429 / 5xx / 重導迴圈時依 Retry-After 或指數退避（含 jitter）重試
// 5. 提供簡單記憶體快取，把大量指令請求收斂成「每 ttl 最多打 CPBL 一次」

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 手動跟隨重導：累積整條重導鏈的 cookie 一起帶上，解 WAF 的 cookie 挑戰迴圈。
async function followRedirects(url, options, maxRedirects) {
  let currentUrl = url;
  let method = options.method || "GET";
  const cookies = new Map();
  const visited = new Set();

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const cookieHeader = [...cookies.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    // 迴圈偵測：同一網址 + 相同 cookie 狀態再次造訪 = 毫無進展（帶 cookie 也解不開），
    // 立即判定為端點被擋，不再空轉到 maxRedirects
    const key = `${currentUrl}|${cookieHeader}`;
    if (visited.has(key)) {
      const err = new Error(`CPBL 端點重導迴圈（疑似被擋）: ${url}`);
      err.code = "RedirectLoop";
      throw err;
    }
    visited.add(key);

    const res = await fetch(currentUrl, {
      method,
      signal: options.signal,
      redirect: "manual",
      headers: {
        ...options.headers,
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });

    // 累積本跳設下的 cookie
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const raw of setCookies) {
      const pair = raw.split(";")[0];
      const eq = pair.indexOf("=");
      if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res; // 3xx 但沒給 Location，交回呼叫端
      currentUrl = new URL(location, currentUrl).toString();
      // 301/302/303 依瀏覽器慣例轉為 GET；307/308 維持原方法
      if (res.status !== 307 && res.status !== 308) method = "GET";
      continue;
    }

    return res;
  }

  const err = new Error(`CPBL 重導次數過多（>${maxRedirects}）: ${url}`);
  err.code = "RedirectLoop";
  throw err;
}

async function cpblFetch(
  url,
  {
    method = "GET",
    retries = 3,
    timeout = 8000,
    headers = {},
    maxRedirects = 5,
  } = {}
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await followRedirects(
        url,
        {
          method,
          signal: controller.signal,
          headers: {
            "User-Agent": DEFAULT_UA,
            Referer: "https://www.cpbl.com.tw/",
            Accept: "application/json, text/html;q=0.9, */*;q=0.8",
            ...headers,
          },
        },
        maxRedirects
      );

      // 限流或伺服器錯誤時退避重試；其餘狀態（含 4xx）直接回傳給呼叫端判斷
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const backoff =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(1000 * 2 ** attempt, 15000);
        await sleep(backoff + Math.random() * 500);
        continue;
      }

      return res;
    } catch (error) {
      lastError = error;
      // 重導迴圈是端點被擋造成、重試也無解 → 立即失敗，不空轉
      if (error.code === "RedirectLoop") break;
      // AbortError（逾時）/ 網路錯誤 → 退避後重試
      if (attempt < retries) {
        await sleep(Math.min(1000 * 2 ** attempt, 15000) + Math.random() * 500);
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error(`CPBL 請求失敗（已重試 ${retries} 次）: ${url}`);
}

// 記憶體快取：同一把 key 在 ttl 內重複呼叫直接回傳上次結果。
// 失敗結果（false / Error）不快取，避免短時間內持續回傳錯誤。
const _cache = new Map();

async function cpblCached(key, ttl, producer) {
  const hit = _cache.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttl) return hit.value;

  const value = await producer();
  if (value !== false && !(value instanceof Error)) {
    _cache.set(key, { value, at: now });
  }
  return value;
}

module.exports = { cpblFetch, cpblCached };
