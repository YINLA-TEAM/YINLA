const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const eqSchema = require("../../Model/eqChannel");
const axios = require('axios');
const cron = require('cron');

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        client.guilds.cache.forEach(async (guild) => {
            eqSchema.findOne({ Guild: guild.id }, async (err, data) => {
                if (err) {
                    console.error('資料庫錯誤:', err);
                    return;
                }
                if (!data) {
                    console.log(`Guild ID: ${guild.id} 找不到對應的資料`);
                    return;
                }

                let previousReportContent = data.S_LastReportContent || "";

                const eqChannel = guild.channels.cache.get(data.Channel);
                if (!eqChannel) return;

                const job = new cron.CronJob("0/15 * * * * *", function () {
                    axios.get(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0016-001?Authorization=${process.env.cwa_key}`)
                        .then(async eqResult => {
                            const { records } = eqResult.data;
                            const Earthquake = records.Earthquake[0];

                            if (Earthquake.ReportContent !== previousReportContent) {
                                const No = String(Earthquake.EarthquakeNo);
                                const Color = {
                                    綠色: "Green",
                                    黃色: "Yellow",
                                    橙色: "Orange",
                                    紅色: "Red",
                                };
                                const Content = Earthquake.ReportContent.substring(11);
                                const Time = new Date(Earthquake.EarthquakeInfo.OriginTime);

                                const timecode = Time.getFullYear() +
                                    (Time.getMonth() + 1 < 10 ? "0" : "") + (Time.getMonth() + 1) +
                                    (Time.getDate() < 10 ? "0" : "") + Time.getDate() +
                                    (Time.getHours() < 10 ? "0" : "") + Time.getHours() +
                                    (Time.getMinutes() < 10 ? "0" : "") + Time.getMinutes() +
                                    (Time.getSeconds() < 10 ? "0" : "") + Time.getSeconds();

                                const cwb_code = "EQ" +
                                    Earthquake.EarthquakeNo + "-" +
                                    (Time.getMonth() + 1 < 10 ? "0" : "") + (Time.getMonth() + 1) +
                                    (Time.getDate() < 10 ? "0" : "") + Time.getDate() + "-" +
                                    (Time.getHours() < 10 ? "0" : "") + Time.getHours() +
                                    (Time.getMinutes() < 10 ? "0" : "") + Time.getMinutes() +
                                    (Time.getSeconds() < 10 ? "0" : "") + Time.getSeconds();

                                const Image = "https://www.cwa.gov.tw/Data/earthquake/img/EC" +
                                    (Earthquake.EarthquakeNo % 1000 == 0 ? "L" : "") +
                                    (Earthquake.EarthquakeNo % 1000 == 0 ? timecode : timecode.slice(4, timecode.length - 2)) +
                                    (Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue * 10) +
                                    (Earthquake.EarthquakeNo % 1000 == 0 ? "" : Earthquake.EarthquakeNo.toString().substring(3)) + "_H.png";

                                const Web = "https://www.cwa.gov.tw/V8/C/E/EQ/" + cwb_code + ".html";

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

                                const embed = new EmbedBuilder()
                                    .setAuthor({
                                        name: "地震報告 [功能測試中]",
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
                                    .setFooter({
                                        text: "交通部中央氣象署",
                                        iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
                                    })
                                    .setTimestamp(Time);

                                Earthquake.Intensity.ShakingArea
                                    .filter(v => !v.InfoStatus)
                                    .forEach(ShakingArea => embed.addFields({ name: ShakingArea.AreaDesc, value: ShakingArea.CountyName }));

                                eqChannel.send({
                                    embeds: [embed],
                                    components: [url]
                                });

                                data.S_LastReportContent = Earthquake.ReportContent;
                                await data.save();

                                previousReportContent = Earthquake.ReportContent;
                            } else {
                                console.log(`沒有新的地震報告`);
                            }
                        })
                        .catch(error => {
                            console.error("無法取得地震資料:", error);
                        });
                }, console.log('地震報告任務已啟動_S'), true, 'Asia/Taipei');
                job.start();
            });
        });
    }
}
