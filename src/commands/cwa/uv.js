const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uv')
        .setNameLocalizations({
            "zh-TW": "紫外線指數",
        })
        .setDescription("檢視 各地紫外線指數")
        .addStringOption(option => (
            option
                .setName('station')
                .setNameLocalizations({
                    "zh-TW": "測站",
                })
                .setDescription("選擇你想查看的觀測站")
                .setRequired(true)
                .addChoices(
                    { name: "基隆", value: "基隆" },
                    { name: "新北", value: "新北" },
                    { name: "臺北", value: "臺北" },
                    { name: "宜蘭", value: "宜蘭" },
                    { name: "新竹", value: "新竹" },
                    { name: "臺中", value: "臺中" },
                    { name: "嘉義", value: "嘉義" },
                    { name: "臺南", value: "臺南" },
                    { name: "高雄", value: "高雄" },
                    { name: "花蓮", value: "花蓮" },
                    { name: "臺東", value: "臺東" },
                    { name: "金門", value: "金門" },
                    { name: "馬祖", value: "馬祖" },
                )
        )),
    
    async execute(interaction) {
        const station = interaction.options.getString('station');
        let UVlevel_color = Colors.Red;
        let UVlevel_message = "";

        const uvResult = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${process.env.cwa_key}&format=JSON`);
        const { records } = uvResult.data;
        const clearedData = records.Station.map(Station => {
            return {
                StationName: Station.StationName,                                       // 氣象站名
                StationId: Station.StationId,                                           // 氣象站ID
                Weather: Station.WeatherElement.Weather,                                // 天氣狀態
                VisibilityDescription: Station.WeatherElement.VisibilityDescription,    // 能見度
                SunshineDuration: Station.WeatherElement.SunshineDuration,              // 日照時間
                Precipitation: Station.WeatherElement.Now.Precipitation,                // 降水量
                WindDirection: Station.WeatherElement.WindDirection,                    // 風向
                WindSpeed: Station.WeatherElement.WindSpeed,                            // 風速
                AirTemperature: Station.WeatherElement.AirTemperature,                  // 氣溫
                RelativeHumidity: Station.WeatherElement.RelativeHumidity,              // 相對溼度
                AirPressure: Station.WeatherElement.AirPressure,                        // 氣壓
                UVIndex: Station.WeatherElement.UVIndex,                                // 紫外線指數
            }
        })

        /* UVIndex */
        function getUV(StationName) {
            return clearedData.find(Station => Station.StationName === StationName).UVIndex;
        }
        /* AirTemperature */
        function getAirTemperature(StationName) {
            return clearedData.find(Station => Station.StationName === StationName).AirTemperature;
        }

        let uv = getUV(station);
        let temp = getAirTemperature(station);

        if(0 <= uv && uv <= 2) {
            UVlevel_color = Colors.Green;
            UVlevel_message = `# \`🟢\` 低量級 (${uv})`;
        } else if(3 <= uv && uv <= 5) {
            UVlevel_color = Colors.Yellow;
            UVlevel_message = `# \`🟡\` 中量級 (${uv})`;
        } else if(6 <= uv && uv <= 7) {
            UVlevel_color = Colors.Orange;
            UVlevel_message = `# \`🟠\` 高量級 (${uv}) \n## 建議的防護措施：\n帽子/陽傘 + 防曬液 + 太陽眼鏡 + 儘量待在陰涼處`;
        } else if(8 <= uv && uv <= 10) {
            UVlevel_color = Colors.Red;
            UVlevel_message = `# \`🔴\` 過量級 (${uv}) \n## 建議的防護措施：\n帽子/陽傘+防曬液+太陽眼鏡+陰涼處+長袖衣物\n上午十時至下午二時最好不外出`;
        } else if(11 <= uv) {
            UVlevel_color = Colors.Purple;
            UVlevel_message = `# \`🟣\` 危險級 (${uv}) \n## 建議的防護措施：\n帽子/陽傘+防曬液+太陽眼鏡+陰涼處+長袖衣物\n上午十時至下午二時最好不外出`;
        } else if(uv == -99){
            UVlevel_color = Colors.Default;
            UVlevel_message = `# 無資料 (${uv})`;
        } else {
            UVlevel_color = Colors.DarkRed;
            UVlevel_message = "# 發生錯誤";
        }

        const UV_embed = new EmbedBuilder()
            .setAuthor({
                name: "紫外線指數"
            })
            .setColor(UVlevel_color)
            .setTitle(`${station} ${temp}°C`)
            .setDescription(UVlevel_message)
            .setFooter({
                text: "交通部中央氣象署",
                iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
            })

        const WaitMessage = await interaction.deferReply({
                fetchReply: true,
                ephemeral: true
            });
    
        const SuccessMessage = await interaction.editReply({
                embeds: [UV_embed],
            });
    }
}