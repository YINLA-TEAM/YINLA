const fs = require("fs");
const path = require("path");
const cron = require("cron");

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_PATH = path.join(DATA_DIR, "restroom.json");

function needUpdate(lastUpdateISO) {
  if (!lastUpdateISO) return true;
  const now = new Date();
  const last = new Date(lastUpdateISO);
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffDays > 15;
}

function getLocalRestroomData() {
  try {
    if (!fs.existsSync(DATA_PATH)) return { lastUpdate: "", records: [] };
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (e) {
    return { lastUpdate: "", records: [] };
  }
}

async function ensureDataAndMaybeUpdate() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const { updateRestroomData } = require("../../scripts/fetchRestroomData");
  const local = getLocalRestroomData();
  if (!local.lastUpdate || needUpdate(local.lastUpdate)) {
    console.log("[事件] 公共廁所資料首次或逾期，開始更新...");
    try {
      const count = await updateRestroomData();
      console.log(`[事件] 公共廁所資料更新完成，共 ${count} 筆`);
    } catch (e) {
      console.error("[事件] 公共廁所資料更新失敗:", e);
    }
  } else {
    console.log("[事件] 公共廁所本地資料在 15 天內，略過啟動時更新");
  }
}

module.exports = {
  name: "clientReady",
  once: false,

  async execute() {
    const job = new cron.CronJob(
      "0 0 0 5 * *",
      async () => {
        try {
          const {
            updateRestroomData,
          } = require("../../scripts/fetchRestroomData");
          const count = await updateRestroomData();
          console.log(`[事件] 公共廁所資料固定更新完成，共 ${count} 筆`);
        } catch (e) {
          console.error("[事件] 公共廁所資料固定更新失敗:", e);
        }
      },
      null,
      true,
      "Asia/Taipei"
    );

    await ensureDataAndMaybeUpdate();
    job.start();
    console.log("[啟動] 公共廁所資料更新作業");
  },
};