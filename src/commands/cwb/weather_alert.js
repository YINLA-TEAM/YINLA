const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, } = require('discord.js')
const axios = require('axios');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('weather_alert')
        .setNameLocalizations({
            "zh-TW":"天氣警報",
        })
        .setDescription('檢視 天氣警報'),
    
    async execute (interaction, client) {
        const waResult = await axios.get(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/W-C0033-002?Authorization=${process.env.cwb_key}`);
        const { records } = waResult.data;
        const Weather_Alerts = records.record[0];

        if(Weather_Alerts != ""){
            const Null_Embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('目前沒有任何天氣警報')

            await interaction.reply({
                embeds:[Null_Embed],
                ephemeral: true
            })
        } else {
            const Type = Weather_Alerts.phenomena;
            const Location = Weather_Alerts.locationName;
    
            const S_time = Weather_Alerts.startTime;
            const E_time = Weather_Alerts.endTime;
            const I_time = Weather_Alerts.issueTime; //String
    
            const Content = Weather_Alerts.contentText;

            const Alert_Embed = new EmbedBuilder()
                .setTitle("天氣警報")
                .setColor('Red')
                .setDescription(Content)
                .setFooter({ text: `交通部中央氣象局 • 發布於 ${I_time}`, iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
                .addFields([
                    {
                        name:"示警類型",
                        value:Type
                    },
                    {
                        name:"開始時間",
                        value:`<t:${S_time}>__(<t:${S_time}>:R)__`
                    },
                    {
                        name:"結束時間",
                        value:`<t:${E_time}>__(<t:${E_time}>:R)__`
                    },
                    {
                        name:"發布範圍",
                        value:Location
                    }
                ])

                const WaitMessage = await interaction.deferReply({
                    fetchReply: true,
                    ephemeral: truncate
                });

                const SuccessMessage = await interaction.editReply({
                    embeds:[Alert_Embed],
                    ephemeral: false
                })
        }
    }
}