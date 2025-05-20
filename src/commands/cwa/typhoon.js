const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('typhoon')
        .setNameLocalizations({
            "zh-TW" : "颱風"
        })
        .setDescription('取得颱風的相關資訊'),

    async execute(interaction){
        const typhoon_WARN = "https://www.cwa.gov.tw/Data/typhoon/TY_WARN/B20.png";
        const typhoon_WindReal = "https://www.cwa.gov.tw/Data/typhoon/WPPS_REG_WindReal.jpg";
        const typhoon_URL = "https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_WARN.html";

        await interaction.deferReply({
            withResponse: true,
            flags: MessageFlags.Ephemeral,
        });

        const typhoon_Embed = [
                new EmbedBuilder()
                    .setURL("https://www.exmple.com")
                    .setAuthor({
                        name: "颱風資訊",
                        iconURL: "https://i.imgur.com/89MW4iJ.png"
                    })
                    .setDescription("-# 手機用戶可能會無法顯示完整的內容")
                    .setColor('Random')
                    .setImage(typhoon_WARN + `?T=${Date.now()}`),
                new EmbedBuilder().setURL("https://www.exmple.com")
                    .setImage(typhoon_WindReal + `?T=${Date.now()}`),
                new EmbedBuilder().setURL("https://www.cwa.gov.tw")
                    .setAuthor({
                        name: "定量降水預報",
                        iconURL: "https://yincheng.vercel.app/icon/rain.png"
                    })
                    .setDescription("-# 手機用戶可能會無法顯示完整的內容")
                    .setColor('Random')
                    .setImage("https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_12.png" + `?T=${Date.now()}`)
                    .setFooter({
                        text: "交通部中央氣象署",
                        iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
                    })
                    .setTimestamp(Date.now()),
                new EmbedBuilder().setURL("https://www.cwa.gov.tw").setImage("https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_24.png" + `?T=${Date.now()}`),
                new EmbedBuilder().setURL("https://www.cwa.gov.tw").setImage("https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_36.png" + `?T=${Date.now()}`),
                new EmbedBuilder().setURL("https://www.cwa.gov.tw").setImage("https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_48.png" + `?T=${Date.now()}`),
            ]

        const url = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setEmoji("📰")
                    .setLabel("詳細資訊")
                    .setStyle(ButtonStyle.Link)
                    .setURL(typhoon_URL)
            ])

        await interaction.editReply({
            embeds : typhoon_Embed,
            components : [ url ],
        })
    }
}