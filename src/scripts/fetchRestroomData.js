const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { Signale } = require("signale");
require("dotenv").config();

const DATA_DIR = path.join(__dirname, "../data");
const DATA_PATH = path.join(DATA_DIR, "restroom.json");
const API_URL = `https://data.moenv.gov.tw/api/v2/fac_p_07?language=zh&api_key=${process.env.moenv_key}`;

async function fetchAllRestroomData() {
  const allRecords = [];
  const limit = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data } = await axios.get(
      `${API_URL}&limit=${limit}&offset=${offset}`
    );
    if (data.records && data.records.length > 0) {
      allRecords.push(...data.records);
      offset += limit;
      if (data.records.length < limit) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  return allRecords;
}

async function updateRestroomData() {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  const records = await fetchAllRestroomData();
  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify(
      {
        lastUpdate: new Date().toISOString(),
        records,
      },
      null,
      2
    )
  );
  return records.length;
}

async function main() {
  const logger = new Signale({
    scope: "FETCH_RESTROOM",
  });
  try {
    logger.info("開始取得公共廁所資料...");
    const count = await updateRestroomData();
    logger.success(`公共廁所資料已更新，共 ${count} 筆。`);
  } catch (err) {
    logger.error("取得公共廁所資料失敗:", err);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  updateRestroomData,
};
