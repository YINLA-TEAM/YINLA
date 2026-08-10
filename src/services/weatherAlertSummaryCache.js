const { createHash } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const {
  getWeatherAlertAiModel,
  summarizeWeatherAlert,
} = require("./weatherAlertSummary");
const { getWeatherAlertSignature } = require("../utils/weatherAlert");

const inFlightSummaries = new Map();
const DEFAULT_CACHE_PATH = path.resolve(
  __dirname,
  "../data/weatherAlertSummaries.json"
);
let cacheData = null;
let cacheLoadPromise = null;
let writeQueue = Promise.resolve();

function getCachePath() {
  const configuredPath = process.env.WEATHER_ALERT_AI_CACHE_PATH;
  return configuredPath
    ? path.resolve(process.cwd(), configuredPath)
    : DEFAULT_CACHE_PATH;
}

async function loadCache() {
  if (cacheData) return cacheData;
  if (cacheLoadPromise) return cacheLoadPromise;

  cacheLoadPromise = (async () => {
    try {
      const parsed = JSON.parse(await fs.readFile(getCachePath(), "utf8"));
      cacheData = parsed?.summaries && typeof parsed.summaries === "object"
        ? parsed.summaries
        : {};
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw new Error(`無法讀取 AI 摘要快取: ${error.message}`);
      }
      cacheData = {};
    }
    return cacheData;
  })();

  try {
    return await cacheLoadPromise;
  } finally {
    cacheLoadPromise = null;
  }
}

async function saveCache() {
  const cachePath = getCachePath();
  const tempPath = `${cachePath}.${process.pid}.tmp`;
  const write = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(
      tempPath,
      `${JSON.stringify({ version: 1, summaries: cacheData }, null, 2)}\n`,
      "utf8"
    );
    await fs.rename(tempPath, cachePath);
  });
  writeQueue = write.catch(() => {});
  return write;
}

function getWeatherAlertCacheKey(alert) {
  const model = getWeatherAlertAiModel();
  const cacheVersion = process.env.WEATHER_ALERT_AI_CACHE_VERSION ?? "1";
  const signature = `${cacheVersion}|${model}|${getWeatherAlertSignature(alert)}`;
  return {
    cacheVersion,
    key: createHash("sha256").update(signature).digest("hex"),
    model,
  };
}

async function getOrCreateWeatherAlertSummary(alert) {
  const { cacheVersion, key, model } = getWeatherAlertCacheKey(alert);
  const cache = await loadCache();
  const cached = cache[key];
  if (cached?.summary) {
    return { summary: cached.summary, cacheHit: true };
  }

  const pending = inFlightSummaries.get(key);
  if (pending) {
    return { summary: await pending, cacheHit: true };
  }

  const generation = (async () => {
    const summary = await summarizeWeatherAlert(alert);
    if (!summary) return null;

    cache[key] = {
      summary,
      model,
      cacheVersion,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveCache();
    } catch (error) {
      delete cache[key];
      throw new Error(`無法儲存 AI 摘要快取: ${error.message}`);
    }
    return summary;
  })();

  inFlightSummaries.set(key, generation);
  try {
    return { summary: await generation, cacheHit: false };
  } finally {
    inFlightSummaries.delete(key);
  }
}

module.exports = { getOrCreateWeatherAlertSummary, getWeatherAlertCacheKey };
