const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DATA_PATH = path.join(__dirname, "../../data/restroom.json");
const UPDATE_SCRIPT = path.join(
  __dirname,
  "../../scripts/fetchRestroomData.js"
);

function normalizeCountyName(name) {
  if (!name) return null;
  return name.replace(/臺/g, "台");
}

function extractCountyAndDistrict(address) {
  if (!address || typeof address !== "string")
    return { county: null, district: null };
  const addr = address.trim().replace(/臺/g, "台");
  const countyPattern =
    /(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/;
  const m = addr.match(countyPattern);
  if (!m) return { county: null, district: null };
  const county = normalizeCountyName(m[1]);
  const rest = addr.slice(m.index + m[1].length);
  const distMatch = rest.match(/^[\s\-]*([^\s\d]+?[市鎮鄉區])/);
  const district = distMatch ? distMatch[1] : null;
  return { county, district };
}

function uniqueStrings(arr) {
  const set = new Set();
  const result = [];
  for (const s of arr) {
    if (!s) continue;
    if (!set.has(s)) {
      set.add(s);
      result.push(s);
    }
  }
  return result;
}

function toLowerSafe(s) {
  return typeof s === "string" ? s.toLowerCase() : "";
}

function needUpdate(lastUpdate) {
  const now = new Date();
  const last = new Date(lastUpdate);
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);
  return diffDays > 15;
}

function getLocalRestroomData() {
  if (!fs.existsSync(DATA_PATH)) return { lastUpdate: "", records: [] };
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("讀取本地公共廁所資料失敗:", err);
    return { lastUpdate: "", records: [] };
  }
}

async function updateLocalRestroomData() {
  try {
    execSync(`node "${UPDATE_SCRIPT}"`, { stdio: "inherit" });
  } catch (err) {
    console.error("更新本地公共廁所資料失敗:", err);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("restroom")
    .setNameLocalizations({ "zh-TW": "公共廁所查詢" })
    .setDescription("提供全台公共廁所資訊")
    .addStringOption((option) =>
      option
        .setName("county")
        .setNameLocalizations({ "zh-TW": "行政區" })
        .setDescription("請選擇欲查詢的行政區")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("district")
        .setNameLocalizations({ "zh-TW": "鄉鎮市區" })
        .setDescription("請選擇欲查詢的鄉鎮市區")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("village")
        .setNameLocalizations({ "zh-TW": "村里" })
        .setDescription("請選擇欲查詢的村里")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setNameLocalizations({ "zh-TW": "名稱" })
        .setDescription("請輸入欲查詢的公共廁所名稱")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply({
        withResponse: true,
        flags: MessageFlags.Ephemeral,
      });

      let restroomData = getLocalRestroomData();
      if (!restroomData.lastUpdate || needUpdate(restroomData.lastUpdate)) {
        await updateLocalRestroomData();
        restroomData = getLocalRestroomData();
      }

      if (!restroomData.records || restroomData.records.length === 0) {
        return interaction.editReply("無法取得公共廁所資料，請稍後再試。");
      }

      const nameID = interaction.options.getString("name");

      const restroom = restroomData.records.find((record) => {
        const num = record.number ? String(record.number) : "";
        const nm = record.name ? String(record.name) : "";
        return (
          (num && num === String(nameID)) ||
          (nm && toLowerSafe(nm) === toLowerSafe(nameID))
        );
      });

      if (!restroom) {
        return interaction.editReply(
          "查無符合條件的公共廁所，請確認後重新輸入。"
        );
      }
      const restroomEmbed = new EmbedBuilder()
        .setAuthor({
          name: `[測試] 公共廁所查詢`,
          url: "https://esms.moenv.gov.tw/eco/toilet/FindToilet.aspx",
        })
        .setTitle(`${restroom.name}`)
        .addFields(
          { name: "類型", value: `${restroom.type}`, inline: true },
          {
            name: "管理單位",
            value: `${restroom.administration}`,
            inline: true,
          },
          { name: "評分", value: `${restroom.grade}`, inline: true },
          {
            name: "尿布檯組",
            value: restroom.diaperTableAvailable ? "有" : "無",
            inline: true,
          },
          {
            name: "地址",
            value: `[${restroom.address}](https://www.google.com.tw/maps?q=${restroom.latitude},${restroom.longitude})`,
            inline: true,
          }
        )
        .setColor(0x00ae86)
        .setFooter({ text: `資料來源：環保署` })
        .setTimestamp();

      return interaction.editReply({
        embeds: [restroomEmbed],
        MessageFlags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error("執行 restroom 指令時發生錯誤:", err);
      return interaction.editReply("執行指令時發生錯誤，請稍後再試。");
    }
  },

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const focusedName = focusedOption.name;
    const focusedValue = focusedOption.value;

    const restroomData = getLocalRestroomData();
    if (focusedName === "county") {
      if (!restroomData.records || restroomData.records.length === 0) {
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }
      const allCounties = restroomData.records
        .map((r) => extractCountyAndDistrict(r.address).county)
        .filter(Boolean);
      const uniqueCounties = uniqueStrings(allCounties);
      const filtered = uniqueCounties
        .filter((c) => toLowerSafe(c).includes(toLowerSafe(focusedValue)))
        .slice(0, 25);
      await interaction.respond(filtered.map((c) => ({ name: c, value: c })));
    } else if (focusedName === "district") {
      const countyID = interaction.options.getString("county");
      if (!restroomData.records || restroomData.records.length === 0) {
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }
      const districts = restroomData.records
        .map((r) => extractCountyAndDistrict(r.address))
        .filter((parts) => parts.county && parts.district)
        .filter(
          (parts) =>
            !countyID || toLowerSafe(parts.county) === toLowerSafe(countyID)
        )
        .map((parts) => parts.district);
      const uniqueDistricts = uniqueStrings(districts);
      const filtered = uniqueDistricts
        .filter((d) => toLowerSafe(d).includes(toLowerSafe(focusedValue)))
        .slice(0, 25);
      await interaction.respond(filtered.map((d) => ({ name: d, value: d })));
    } else if (focusedName === "village") {
      const countyID = interaction.options.getString("county");
      const areacode = interaction.options.getString("district");
      if (!restroomData.records || restroomData.records.length === 0) {
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }
      const filtered = restroomData.records
        .filter(
          (record) =>
            ((record.county &&
              toLowerSafe(record.county).includes(toLowerSafe(countyID))) ||
              (extractCountyAndDistrict(record.address).county &&
                toLowerSafe(
                  extractCountyAndDistrict(record.address).county
                ).includes(toLowerSafe(countyID)))) &&
            ((record.areacode &&
              toLowerSafe(record.areacode).includes(toLowerSafe(areacode))) ||
              (extractCountyAndDistrict(record.address).district &&
                toLowerSafe(
                  extractCountyAndDistrict(record.address).district
                ).includes(toLowerSafe(areacode)))) &&
            record.village &&
            record.village.toLowerCase().includes(focusedValue.toLowerCase())
        )
        .slice(0, 200);
      const seen = new Set();
      const uniqueVillages = [];
      for (const rec of filtered) {
        const v = String(rec.village).trim();
        const key = v.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVillages.push(v);
        }
        if (uniqueVillages.length >= 25) break;
      }

      if (uniqueVillages.length === 0) {
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }

      await interaction.respond(
        uniqueVillages.map((v) => ({ name: v, value: v }))
      );
    } else if (focusedName === "name") {
      const countyID = interaction.options.getString("county");
      const areacode = interaction.options.getString("district");
      const village = interaction.options.getString("village");
      if (!restroomData.records || restroomData.records.length === 0) {
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }

      const filtered = restroomData.records
        .filter(
          (record) =>
            ((record.county &&
              toLowerSafe(record.county).includes(toLowerSafe(countyID))) ||
              (extractCountyAndDistrict(record.address).county &&
                toLowerSafe(
                  extractCountyAndDistrict(record.address).county
                ).includes(toLowerSafe(countyID)))) &&
            ((record.areacode &&
              toLowerSafe(record.areacode).includes(toLowerSafe(areacode))) ||
              (extractCountyAndDistrict(record.address).district &&
                toLowerSafe(
                  extractCountyAndDistrict(record.address).district
                ).includes(toLowerSafe(areacode)))) &&
            record.village &&
            record.village
              .toLowerCase()
              .includes(village?.toLowerCase() || "") &&
            record.name &&
            record.name.toLowerCase().includes(focusedValue.toLowerCase())
        )
        .slice(0, 25);

      if (filtered.length === 0) {
        console.log("name autocomplete: 無資料");
        await interaction.respond([{ name: "無法取得資料", value: "error" }]);
        return;
      }

      await interaction.respond(
        filtered.map((record) => ({
          name: record.name,
          value: record.number,
        }))
      );
    }
  },
};
