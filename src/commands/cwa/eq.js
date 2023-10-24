const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, embedLength } = require('discord.js')
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('earthquake_report')
        .setNameLocalizations({
            "zh-TW": "地震報告"
        })
        .setDescription('檢視 地震報告')
        .addStringOption(option => (
            option
                .setName("type")
                .setNameLocalizations({
                    "zh-TW": "類型",
                })
                .setDescription("有編號 or 無編號"))
                .setDescriptionLocalizations({
                    "zh-TW": "有編號 or 無編號",
                })
                .setRequired(true)
                .addChoices(
                    { name: '有編號', value: '有編號' },
                    { name: '無編號', value: '無編號' },
                )
        ),

    async execute(interaction, client) {
        
        if(interaction.options.getString('type') == '無編號'){
            cwaID = 'E-A0016-001'
        } else {
            cwaID = 'E-A0015-001'
        }

        const eqResult = await axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/${cwaID}?Authorization=${process.env.cwa_key}`);
        const { records } = eqResult.data;
        const Earthquake = records.Earthquake[0];
        const No = String(Earthquake.EarthquakeNo);
        const Color = {
            綠色: "Green",
            黃色: "Yellow",
            橙色: "Orange",
            紅色: "Red",
        };
        const Content = Earthquake.ReportContent.substring(11);

        const Time = new Date(Earthquake.EarthquakeInfo.OriginTime);

        const timecode = ""
            + Time.getFullYear()
            + (Time.getMonth() + 1 < 10 ? "0" : "") + (Time.getMonth() + 1)
            + (Time.getDate() < 10 ? "0" : "") + Time.getDate()
            + (Time.getHours() < 10 ? "0" : "") + Time.getHours()
            + (Time.getMinutes() < 10 ? "0" : "") + Time.getMinutes()
            + (Time.getSeconds() < 10 ? "0" : "") + Time.getSeconds();

        const cwb_code
            = "EQ"
            + Earthquake.EarthquakeNo
            + "-"
            + (Time.getMonth() + 1 < 10 ? "0" : "") + (Time.getMonth() + 1)
            + (Time.getDate() < 10 ? "0" : "") + Time.getDate()
            + "-"
            + (Time.getHours() < 10 ? "0" : "") + Time.getHours()
            + (Time.getMinutes() < 10 ? "0" : "") + Time.getMinutes()
            + (Time.getSeconds() < 10 ? "0" : "") + Time.getSeconds();

        const Image = "https://www.cwa.gov.tw/Data/earthquake/img/EC"
            + (Earthquake.EarthquakeNo % 1000 == 0 ? "L" : "")
            + (Earthquake.EarthquakeNo % 1000 == 0 ? timecode : timecode.slice(4, timecode.length - 2))
            + (Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue * 10)
            + (Earthquake.EarthquakeNo % 1000 == 0 ? "" : Earthquake.EarthquakeNo.toString().substring(3))
            + "_H.png";

        const Web = "https://www.cwa.gov.tw/V8/C/E/EQ/"
            + cwb_code
            + ".html";

        const url = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel("地震報告")
                    .setStyle(ButtonStyle.Link)
                    .setURL(Web),
                new ButtonBuilder()
                    .setLabel("地震測報中心")
                    .setStyle(ButtonStyle.Link)
                    .setURL(Earthquake.Web),
            ]);



        const Depth = String(Earthquake.EarthquakeInfo.FocalDepth);
        const Location = Earthquake.EarthquakeInfo.Epicenter.Location;
        const Magnitude = String(Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue);

        embed = new EmbedBuilder()
            .setAuthor({
                name: "地震報告",
                iconURL: "https://i.imgur.com/qIxk1H1.png"
            })
            .setDescription(Content)
            .setColor(Color[Earthquake.ReportColor])
            .setImage(Image)
            .addFields([
                {
                    name: '編號',
                    value: `${No % 1000 == 0 ? "無（小區域有感地震）" : No}`,
                    inline: true
                },
                {
                    name: '發生時間',
                    value: `<t:${~~(Time.getTime() / 1000)}:D>\n<t:${~~(Time.getTime() / 1000)}:T>\n__(<t:${~~(Time.getTime() / 1000)}:R>)__`,
                    inline: true
                },
                {
                    name: '震央',
                    value: Location,
                    inline: true
                },
                {
                    name: '規模',
                    value: "芮氏 " + Magnitude,
                    inline: true
                },
                {
                    name: '深度',
                    value: Depth + " 公里",
                    inline: true
                },
            ])
            .setFooter({ text: "交通部中央氣象署", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
            .setTimestamp(Time);

        Earthquake.Intensity.ShakingArea
            .filter(v => !v.InfoStatus)
            .forEach(ShakingArea => embed.addFields({ name: ShakingArea.AreaDesc, value: ShakingArea.CountyName }));

        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const SuccessMessage = await interaction.editReply({
            embeds: [embed],
            components: [url],
        });
    }
}