const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("radar")
        .setNameLocalizations({
            "zh-TW" : "雷達回波",
        })
        .setDescription("即時的雷達回波圖"),

        async execute (interaction) {
            const radarResult = await axios.get(`https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/O-A0058-003?Authorization=${process.env.cwa_key}&format=JSON`);
            const { cwaopendata } = radarResult.data;

            const radar_IMG = cwaopendata.dataset.resource.ProductURL +"?"+ cwaopendata.dataset.DateTime

            const radar_EMBED = new EmbedBuilder()
                .setColor('Random')
                .setTitle("雷達回波圖")
                .setFooter({ text: "由 交通部中央氣象署 提供", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
                .setImage(radar_IMG)

            const WaitMessage = await interaction.deferReply({
                fetchReply: true,
                ephemeral: true
            });

            const SuccessMessage = await interaction.editReply({
                embeds:[radar_EMBED]
            })
}
}
