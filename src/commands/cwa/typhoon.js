const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

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

        const Wait_msg = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true,
        });

        const ChFcstPrecip_12_12 = new AttachmentBuilder('https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_12.png');
        const ChFcstPrecip_12_24 = new AttachmentBuilder('https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_24.png');
        const ChFcstPrecip_12_36 = new AttachmentBuilder('https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_36.png');
        const ChFcstPrecip_12_48 = new AttachmentBuilder('https://www.cwa.gov.tw/Data/fcst_img/QPF_ChFcstPrecip_12_48.png');

        const typhoon_Embed = new EmbedBuilder()
            .setAuthor({
                name: "颱風資訊",
                iconURL: "https://i.imgur.com/89MW4iJ.png"
            })
            .setColor('Random')
            .setImage(typhoon_WARN + `?T=${Date.now()}`)
            .setFooter({
                text: "交通部中央氣象署",
                iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
            })
            .setTimestamp(Date.now())

        const url = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setEmoji("📰")
                    .setLabel("詳細資訊")
                    .setStyle(ButtonStyle.Link)
                    .setURL(typhoon_URL)
            ])

        const Suc_msg = await interaction.editReply({
            embeds : [ typhoon_Embed ],
            components : [ url ],
            files: [ ChFcstPrecip_12_12, ChFcstPrecip_12_24, ChFcstPrecip_12_36, ChFcstPrecip_12_48 ] 
        })
    }
}