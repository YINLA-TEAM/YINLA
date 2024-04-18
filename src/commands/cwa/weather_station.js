const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather_station')
        .setNameLocalizations({
            "zh-TW": "氣象站",
        })
        .setDescription('檢視 氣象站相關資訊(此為實驗功能，僅能檢視 台中龍井 的觀測站)'),

    async execute(interaction){
        const wtResult = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=${process.env.cwa_key}&StationId=C0F9R0`)
        const { records } = wtResult.data;

        

        const station = records.Station[0];
        const locaName = station.GeoInfo.CountyName + " " + station.GeoInfo.TownName;
        const wtStatus = station.WeatherElement.Weather;
        const airTemp = station.WeatherElement.AirTemperature.toString();
        const relHumid = station.WeatherElement.RelativeHumidity.toString();
        const airPressure = station.WeatherElement.AirPressure.toString();
        const highTemp = station.WeatherElement.DailyExtreme.DailyHigh.TemperatureInfo.AirTemperature.toString();
        const lowTemp = station.WeatherElement.DailyExtreme.DailyLow.TemperatureInfo.AirTemperature.toString();

        const wtEmbed = new EmbedBuilder()
            .setAuthor({
                name: "氣象站資訊",
            })
            .setColor('Blue')
            .setTitle(locaName)
            .addFields([
                {
                    name: '天氣狀態',
                    value: wtStatus,
                    inline: true,
                },
                {
                    name: '濕度',
                    value: `\`${relHumid}\``,
                    inline: true,
                },
                {
                    name: '氣壓',
                    value: `\`${airPressure}\``,
                    inline: true,
                },
                {
                    name: '當前氣溫',
                    value: `\`${airTemp}\``,
                    inline: true,
                },
                {
                    name: '最高溫',
                    value: `\`${highTemp}\``,
                    inline: true,
                },
                {
                    name: '最低溫',
                    value: `\`${lowTemp}\``,
                    inline: true,
                },
            ])
            .setFooter({ text: `交通部中央氣象署 提供`, iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })

            await interaction.reply({
            embeds: [wtEmbed],
            ephemeral: true
        })
    }
}