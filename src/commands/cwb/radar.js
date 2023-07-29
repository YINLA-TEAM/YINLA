const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, embedLength } = require('discord.js')
const axios = require('axios');
const { time } = require('console');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("radar")
        .setNameLocalizations({
            "zh-TW" : "雷達回波",
        })
        .setDescription("即時的雷達回波圖"),

        async execute (interaction, client) {
            const radarResult = await axios.get(`https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0058-003?Authorization=${process.env.cwb_key}&format=JSON`);
            const { cwbopendata } = radarResult.data;

            const radar_IMG = cwbopendata.dataset.resource.uri +"?"+ cwbopendata.dataset.time.obsTime
            const time = new Date(cwbopendata.dataset.time.obsTime)

            const radar_EMBED = new EmbedBuilder()
                .setColor('Random')
                .setTitle("雷達回波圖")
                .setFooter({ text: "由 交通部中央氣象局 提供", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
                .setImage(radar_IMG)

            const WaitMessage = await interaction.deferReply({
                fetchReply: true,
                ephemeral: true
            });

            const SuccessMessage = await interaction.editReply({
                embeds:[radar_EMBED],
                ephemeral: false
            })
}
}
