const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const fetchYouBikeAreaData = async () => {
  try {
    const res = await fetch("https://apis.youbike.com.tw/json/area-all.json");
    if (!res.ok) throw new Error("API 回應失敗");
    return await res.json();
  } catch (err) {
    console.error("取得行政區資料失敗:", err);
    return [];
  }
};

const fetchYouBikeDistrictData = async () => {
  try {
    const res = await fetch(
      "https://apis.youbike.com.tw/json/station-min-yb2.json"
    );
    if (!res.ok) throw new Error("API 回應失敗");
    return await res.json();
  } catch (err) {
    console.error("取得站點資料失敗:", err);
    return [];
  }
};

const fetchYouBikeData = async (station_no) => {
  try {
    const res = await fetch("https://apis.youbike.com.tw/tw2/parkingInfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station_no: [`${station_no}`] }),
    });
    if (!res.ok) throw new Error("API 回應失敗");
    return await res.json();
  } catch (err) {
    console.error("取得即時車輛資料失敗:", err);
    return null;
  }
};

let areaList = [];
let stationList = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youbike")
    .setNameLocalizations({ "zh-TW": "公共自行車查詢" })
    .setDescription("提供 公共自行車 (YouBike 2.0) 即時車輛資訊")
    .addStringOption((option) =>
      option
        .setName("area")
        .setNameLocalizations({ "zh-TW": "行政區" })
        .setDescription("請選擇欲查詢的行政區")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("station")
        .setNameLocalizations({ "zh-TW": "站名" })
        .setDescription(
          "請輸入站名進行查詢，如果不確定站名，可以輸入部分關鍵字進行搜尋"
        )
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({
        withResponse: true,
        flags: MessageFlags.Ephemeral,
      });

      const areaID = interaction.options.getString("area");
      const stationID = interaction.options.getString("station");

      const youBikeData = await fetchYouBikeData(stationID);
      if (!youBikeData || !youBikeData.retVal || !youBikeData.retVal.data) {
        return await interaction.editReply({
          content: "無法取得即時車輛資料，請稍後再試。",
          flags: MessageFlags.Ephemeral,
        });
      }

      const stationData = youBikeData.retVal.data.find(
        (station) => station.station_no === stationID
      );
      if (!stationData) {
        return await interaction.editReply({
          content: "查無此站名，請確認後重新輸入。",
          flags: MessageFlags.Ephemeral,
        });
      }

      const areaInfo = areaList.find((area) => area.area_code === areaID) || {};
      const stationInfo =
        stationList.find((station) => station.station_no === stationID) || {};

      const areaName = areaInfo.area_name_tw || "未知行政區";
      const districtName = stationInfo.district_tw || "未知區域";
      const stationName = stationInfo.name_tw || "未知站名";

      const youBikeEmbed = new EmbedBuilder();

      if (stationData.status === 2) {
        youBikeEmbed
          .setColor("Red")
          .setAuthor({
            name: `YouBike ${areaName}`,
            url: "https://www.youbike.com.tw",
          })
          .setTitle(`[${districtName}] ${stationName}`)
          .setDescription(
            `# 暫停營運\n[點我前往 Google 地圖](https://www.google.com.tw/maps?q=${stationData.lat},${stationData.lng})`
          );
      } else if (stationData.status === 1) {
        youBikeEmbed
          .setColor("Orange")
          .setAuthor({
            name: `YouBike ${areaName}`,
            url: "https://www.youbike.com.tw",
          })
          .setTitle(`[${districtName}] ${stationName}`)
          .setDescription(
            `地圖位置: [點我前往 Google 地圖](https://www.google.com.tw/maps?q=${stationData.lat},${stationData.lng})`
          )
          .addFields(
            {
              name: "可借車輛數(2.0/E)",
              value: `\`${
                stationData.available_spaces_detail?.yb2 ?? 0
              }\` / \`${stationData.available_spaces_detail?.eyb ?? 0}\` 輛`,
              inline: true,
            },
            {
              name: "可還空位數",
              value: `\`${stationData.empty_spaces ?? 0}\` 位`,
              inline: true,
            },
            {
              name: "總停車格數",
              value: `\`${stationData.parking_spaces ?? 0}\` 格`,
              inline: true,
            }
          );
      } else {
        youBikeEmbed
          .setColor("Grey")
          .setAuthor({ name: "YouBike", url: "https://www.youbike.com.tw" })
          .setTitle("發生意外狀況，無法取得站點資訊");
      }

      await interaction.editReply({ embeds: [youBikeEmbed] });
    } catch (err) {
      console.error("執行指令時發生錯誤:", err);
      await interaction.editReply({
        content: "發生錯誤，請稍後再試。",
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  async autocomplete(interaction) {
    try {
      const focusedOption = interaction.options.getFocused(true);
      const focusedValue = focusedOption.value;
      const focusedName = focusedOption.name;

      if (focusedName === "area") {
        const youBikeAreaData = await fetchYouBikeAreaData();
        if (!youBikeAreaData.length) {
          await interaction.respond([
            { name: "行政區資料取得失敗", value: "error" },
          ]);
          return;
        }
        const filtered = youBikeAreaData
          .filter(
            (area) =>
              area.area_code &&
              area.area_name_tw &&
              area.area_code.toLowerCase().includes(focusedValue.toLowerCase())
          )
          .slice(0, 25);

        areaList = filtered;

        await interaction.respond(
          filtered.map((area) => ({
            name: area.area_name_tw,
            value: area.area_code,
          }))
        );
      } else if (focusedName === "station") {
        const areaID = interaction.options.getString("area");
        const youBikeDistrictData = await fetchYouBikeDistrictData();
        if (!youBikeDistrictData.length) {
          await interaction.respond([
            { name: "站點資料取得失敗", value: "error" },
          ]);
          return;
        }
        const filtered = youBikeDistrictData
          .filter(
            (station) =>
              station.area_code &&
              station.name_tw &&
              station.area_code
                .toLowerCase()
                .includes(areaID?.toLowerCase() || "") &&
              station.name_tw.toLowerCase().includes(focusedValue.toLowerCase())
          )
          .slice(0, 25);

        stationList = filtered;

        await interaction.respond(
          filtered.map((station) => ({
            name: `[${station.district_tw}] ${station.name_tw}`,
            value: station.station_no,
          }))
        );
      }
    } catch (err) {
      console.error("自動補全時發生錯誤:", err);
      await interaction.respond([
        { name: "發生錯誤，請稍後再試", value: "error" },
      ]);
    }
  },
};
