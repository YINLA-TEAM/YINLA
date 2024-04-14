const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather_alert')
        .setNameLocalizations({
            "zh-TW": "天氣警報",
        })
        .setDescription('檢視 天氣警報'),

    async execute(interaction, client) {
        const waResult = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/W-C0033-002?Authorization=${process.env.cwa_key}`);
        const { records } = waResult.data;
        const Alert_Embed_List = [];

        if (records.record[0] == null) {
            const Null_Embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('目前沒有任何天氣警報')

            await interaction.reply({
                embeds: [Null_Embed],
                ephemeral: true
            })
        } else {
            for (i = 0; i <= records.record.length-1; i++) {
                Alert_Embed_List.push(F_Alert_Embed(i))
            }
        }

        function F_Alert_Embed(number) {
            const Weather_Alerts = records.record[number];
            const Type = Weather_Alerts.datasetInfo.datasetDescription;
            //const Location = Weather_Alerts.locationName;

            const S_time = Date.parse(Weather_Alerts.datasetInfo.validTime.startTime) / 1000;
            const E_time = Date.parse(Weather_Alerts.datasetInfo.validTime.endTime) / 1000;
            const I_time = new Date(Weather_Alerts.datasetInfo.issueTime); //String

            const Content = Weather_Alerts.contents.content.contentText.trim();

            const Alert_Embed = new EmbedBuilder()
                .setAuthor({
                    name: "天氣警報",
                    iconURL: 'https://cdn.discordapp.com/emojis/1134845181141725364.webp?size=96&quality=lossless',
                })
                .setTitle(Type)
                .setColor('Red')
                .setDescription(`\`\`\`${Content}\`\`\``)
                .setFooter({ text: `交通部中央氣象署 • 發布於 ${I_time}`, iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
                .addFields([
                    {
                        name: "開始時間",
                        value: `<t:${S_time}>__(<t:${S_time}:R>)__`
                    },
                    {
                        name: "結束時間",
                        value: `<t:${E_time}>__(<t:${E_time}:R>)__`
                    },
                ])

            return Alert_Embed;
        }
    }
}