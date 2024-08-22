const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

async function fetchCPBLScore() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.cpbl.com.tw/');
    await page.waitForSelector('.game_item');

    const data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.game_item')).map(element => {
            const gameNumber = element.querySelector('.tag.game_no a')?.textContent.trim();                     // 比賽編號 
            const gameStatus = element.querySelector('.tag.game_status span')?.textContent.trim();              // 比賽狀態

            const awayTeam = element.querySelector('.team.away .team_name a')?.textContent.trim();              // 客隊名稱
            const homeTeam = element.querySelector('.team.home .team_name a')?.textContent.trim();              // 主隊名稱
            const awayScore = element.querySelector('.score .num.away')?.textContent.trim();                    // 客隊分數
            const homeScore = element.querySelector('.score .num.home')?.textContent.trim();                    // 主隊分數
            const awayTeam_link = element.querySelector('.team.away .team_name a')?.getAttribute('href');       // 客隊資料
            const homeTeam_link = element.querySelector('.team.home .team_name a')?.getAttribute('href');       // 主隊資料
            const awayTeam_w_l_t = element.querySelector('.team.away .w-l-t')?.textContent.trim();              // 客隊勝敗和
            const homeTeam_w_l_t = element.querySelector('.team.home .w-l-t')?.textContent.trim();              // 主隊勝敗和

            const place = element.querySelector('.PlaceInfo .place')?.textContent.trim();                       // 比賽球場
            const place_time = element.querySelector('.PlaceInfo .time')?.textContent.trim();                   // 比賽時間
            const inning = element.querySelector('.GameMatchupBasic .inning')?.textContent.trim();              // 比賽局數
            const inning_top_bot = element.querySelector('.GameMatchupBasic .inning')?.getAttribute('class');   // 比賽上下局
            const schedule = element.querySelector('.ScheduleListNote div')?.textContent.trim();  

            const away_sp = element.querySelector('.PlayerMatchup.away_sp .player .name a')?.textContent.trim();                // 客隊先發
            const away_sp_link = element.querySelector('.PlayerMatchup.away_sp .player .name a')?.getAttribute('href');         // 客隊先發選手資料
            const home_sp = element.querySelector('.PlayerMatchup.home_sp .player .name a')?.textContent.trim();                // 主隊先發
            const home_sp_link = element.querySelector('.PlayerMatchup.home_sp .player .name a')?.getAttribute('href');         // 主隊先發選手資料

            const batter = element.querySelector('.PlayerMatchup.batter .player .name a')?.textContent.trim();                  // 打者
            const batter_link = element.querySelector('.PlayerMatchup.batter .player .name a')?.getAttribute('href');           // 打者選手資料
            const batter_team = element.querySelector('.PlayerMatchup.batter .player .team a')?.getAttribute('href');           // 打者隊伍

            const pitcher = element.querySelector('.PlayerMatchup.pitcher .player .name a')?.textContent.trim();                // 投手
            const pitcher_link = element.querySelector('.PlayerMatchup.pitcher .player .name a')?.getAttribute('href');         // 投手選手資料
            const pitcher_team = element.querySelector('.PlayerMatchup.pitcher .player .team a')?.getAttribute('href');         // 投手隊伍

            const wins_pitcher = element.querySelector('.PlayerMatchup.wins .player .name a')?.textContent.trim();              // 勝投
            const wins_pitcher_link = element.querySelector('.PlayerMatchup.wins .player .name a')?.getAttribute('href');       // 勝投選手資料
            const wins_pitcher_team = element.querySelector('.PlayerMatchup.wins .player .team a')?.getAttribute('href');       // 勝投隊伍

            const loses_pitcher = element.querySelector('.PlayerMatchup.loses .player .name a')?.textContent.trim();            // 敗投
            const loses_pitcher_link = element.querySelector('.PlayerMatchup.loses .player .name a')?.getAttribute('href');     // 敗投選手資料
            const loses_pitcher_team = element.querySelector('.PlayerMatchup.loses .player .team a')?.getAttribute('href');     // 敗投隊伍
            /* undefined */
            const mvp = element.querySelector('.game_detail .item.MVP .player .name a')?.textContent.trim();                    // MVP
            const mvp_link = element.querySelector('.game_detail .item.MVP  .player .name a')?.getAttribute('href');            // MVP選手資料
            const mvp_team = element.querySelector('.game_detail .item.MVP  .player .team a')?.getAttribute('href');            // MVP隊伍

            return {
                gameNumber,
                gameStatus,

                awayTeam,
                homeTeam,
                awayScore,
                homeScore,
                awayTeam_link,
                homeTeam_link,
                awayTeam_w_l_t,
                homeTeam_w_l_t,

                place,
                place_time,
                inning,
                inning_top_bot,
                schedule,

                away_sp,
                away_sp_link,
                home_sp,
                home_sp_link,

                batter,
                batter_link,
                batter_team,

                pitcher,
                pitcher_link,
                pitcher_team,

                wins_pitcher,
                wins_pitcher_link,
                wins_pitcher_team,

                loses_pitcher,
                loses_pitcher_link,
                loses_pitcher_team,

                mvp,
                mvp_link,
                mvp_team,
            };
        });
    });

    await browser.close();
    return data;
}

function teamIcon(team_name) {
    try {
        const icon = {
            "中信兄弟": "<:cpbl_B:914141522541297696>",
            "味全龍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹": "<:cpbl_T:1273206632150470678>",
            "中信兄弟二軍": "<:cpbl_B:914141522541297696>",
            "味全龍二軍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將二軍": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅二軍": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿二軍": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹二軍": "<:cpbl_T:1273206632150470678>",
            "/team/index?teamNo=ACN011": "<:cpbl_B:914141522541297696>",
            "/team/index?teamNo=AAA011": "<:cpbl_D:1033396051224305734>",
            "/team/index?teamNo=AEO011": "<:cpbl_G:1033396049227829331>",
            "/team/index?teamNo=ADD011": "<:cpbl_L:1033396606491431012>",
            "/team/index?teamNo=AJL011": "<:cpbl_R:1033396046849646654>",
            "/team/index?teamNo=AKP011": "<:cpbl_T:1273206632150470678>",
            "/team/index?teamNo=ACN022": "<:cpbl_B:914141522541297696>",
            "/team/index?teamNo=AAA022": "<:cpbl_D:1033396051224305734>",
            "/team/index?teamNo=AEO022": "<:cpbl_G:1033396049227829331>",
            "/team/index?teamNo=ADD022": "<:cpbl_L:1033396606491431012>",
            "/team/index?teamNo=AJL022": "<:cpbl_R:1033396046849646654>",
            "/team/index?teamNo=AKP022": "<:cpbl_T:1273206632150470678>",
        };
        
        return icon[team_name] || " ";
    } catch (error) {
        return " ";
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_score')
        .setNameLocalizations({
            "zh-TW" : "中華職棒即時比分",
        })
        .setDescription('中華職棒即時比分'),
    
    async execute (interaction) {

        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        let have_game = true;
        const score_embed_list = [];
        const score = await fetchCPBLScore();

        const clearData = score.map(score => {
            return {
                gameNumber: score.gameNumber,
                gameStatus: score.gameStatus,

                awayTeam: score.awayTeam,
                homeTeam: score.homeTeam,
                awayScore: score.awayScore,
                homeScore: score.homeScore,
                awayTeam_link: score.awayTeam_link,
                homeTeam_link: score.homeTeam_link,
                awayTeam_w_l_t: score.awayTeam_w_l_t,
                homeTeam_w_l_t: score.homeTeam_w_l_t,

                place: score.place,
                place_time: score.place_time,
                inning: score.inning,
                inning_top_bot: score.inning_top_bot,
                schedule: score.schedule,

                away_sp: score.away_sp,
                away_sp_link: `https://www.cpbl.com.tw/${score.away_sp_link}`,
                home_sp: score.home_sp,
                home_sp_link: `https://www.cpbl.com.tw/${score.home_sp_link}`,

                batter: score.batter,
                batter_link: `https://www.cpbl.com.tw/${score.batter_link}`,
                batter_team: score.batter_team,

                pitcher: score.pitcher,
                pitcher_link: `https://www.cpbl.com.tw/${score.pitcher_link}`,
                pitcher_team: score.pitcher_team,

                wins_pitcher: score.wins_pitcher,
                wins_pitcher_link: `https://www.cpbl.com.tw/${score.wins_pitcher_link}`,
                wins_pitcher_team: score.wins_pitcher_team,

                loses_pitcher: score.loses_pitcher,
                loses_pitcher_link: `https://www.cpbl.com.tw/${score.loses_pitcher_link}`,
                loses_pitcher_team: score.loses_pitcher_team,

                mvp: score.mvp,
                mvp_link: `https://www.cpbl.com.tw/${score.mvp_link}`,
                mvp_team: score.mvp_team,
            }
        });
        
        // 判定有無賽事
        if(score.length === 0){
            have_game = false;
        } else {
            have_game = true;
        }

        if(have_game === true){
            for(let i = 0; i <= score.length - 1; i++){
                const ScoreEmbed = new EmbedBuilder();
                if(clearData[i].gameStatus === "比賽中"){
                    let top_bot = "-";
                    if(clearData[i].inning_top_bot === "inning top") top_bot = "上";
                    else top_bot = "下";
                    /* 比賽中的embed */
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] ${clearData[i].awayTeam} vs. ${clearData[i].homeTeam}`)
                        .setDescription(`# ${teamIcon(clearData[i].awayTeam_link)} \`${clearData[i].awayScore}\` ${clearData[i].inning + top_bot}  \`${clearData[i].homeScore}\` ${teamIcon(clearData[i].homeTeam_link)}`)
                        .setColor("Green")
                        .addFields([
                            { name: "打者", value: `${teamIcon(clearData[i].batter_team)} [${clearData[i].batter}](${clearData[i].batter_link})`, inline: true},
                            { name: "投手", value: `${teamIcon(clearData[i].pitcher_team)} [${clearData[i].pitcher}](${clearData[i].pitcher_link})`, inline: true},
                        ])
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                } else if(clearData[i].gameStatus === "比賽結束"){
                    /* 比賽結束的embed */
                    if(clearData[i].awayScore === clearData[i].homeScore) {
                        /* 和局：沒有勝敗投 */
                        ScoreEmbed
                            .setAuthor({
                                name: "中華職棒",
                                url:"https://www.cpbl.com.tw",
                                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                            })
                            .setTitle(`[${clearData[i].gameNumber}] ${clearData[i].awayTeam} vs. ${clearData[i].homeTeam}`)
                            .setColor("Red")
                            .setDescription(`# ${teamIcon(clearData[i].awayTeam)} \`${clearData[i].awayScore}\` : \`${clearData[i].homeScore}\` ${teamIcon(clearData[i].homeTeam)}`)
                            .setFooter({
                                text: `🏟️ ${clearData[i].place}棒球場`,
                            })
                            .addFields([
                                { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true },
                                { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true },
                            ])
                    } else {
                        ScoreEmbed
                            .setAuthor({
                                name: "中華職棒",
                                url:"https://www.cpbl.com.tw",
                                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                            })
                            .setTitle(`[${clearData[i].gameNumber}] ${clearData[i].awayTeam} vs. ${clearData[i].homeTeam}`)
                            .setColor("Red")
                            .setDescription(`# ${teamIcon(clearData[i].awayTeam_link)} \`${clearData[i].awayScore}\` : \`${clearData[i].homeScore}\` ${teamIcon(clearData[i].homeTeam_link)}`)
                            .setFooter({
                                text: `🏟️ ${clearData[i].place}棒球場`,
                            })
                            .addFields([
                                { name: "勝投", value: `${teamIcon(clearData[i].wins_pitcher_team)} [${clearData[i].wins_pitcher}](${clearData[i].wins_pitcher_link})`, inline: true},
                                { name: "敗投", value: `${teamIcon(clearData[i].loses_pitcher_team)} [${clearData[i].loses_pitcher}](${clearData[i].loses_pitcher_link})`, inline: true},
                                { name: "** **", value: `** **`, inline: true},
                                { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true },
                                { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true  },
                            ])
                    }
                } else if(clearData[i].gameStatus === undefined){
                    /* 比賽尚未開始的embed */
                    if(clearData[i].schedule === "延賽"){
                        ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] 比賽因故延賽`)
                        .setDescription(`## ${teamIcon(clearData[i].awayTeam_link)} vs. ${teamIcon(clearData[i].homeTeam_link)}\n# 詳情請關注[中華職棒大聯盟](https://www.cpbl.com.tw)`)
                        .setColor("Blue")
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                        .addFields([
                            { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true },
                            { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true },
                        ])
                    } else if(clearData[i].schedule === "取消比賽"){
                        ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] 取消比賽`)
                        .setDescription(`## ${teamIcon(clearData[i].awayTeam_link)} vs. ${teamIcon(clearData[i].homeTeam_link)}\n# 詳情請關注[中華職棒大聯盟](https://www.cpbl.com.tw)`)
                        .setColor("Red")
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                        .addFields([
                            { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true },
                            { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true },
                        ])
                    } else if(clearData[i].schedule === "本日尚無比賽"){
                        ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setDescription(`# 無比賽賽事相關數據`)
                        .setColor("Red")
                    } else {
                        ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] 比賽尚未開始`)
                        .setDescription(`## ${teamIcon(clearData[i].awayTeam_link)} vs. ${teamIcon(clearData[i].homeTeam_link)}\n### 預計於 **\`${clearData[i].place_time}\`** 開打`)
                        .setColor("White")
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                        .addFields([
                            { name: "客隊先發", value: `${teamIcon(clearData[i].awayTeam_link)} [${clearData[i].away_sp}](${clearData[i].away_sp_link})`, inline: true},
                            { name: "主隊先發", value: `${teamIcon(clearData[i].homeTeam_link)} [${clearData[i].home_sp}](${clearData[i].home_sp_link})`, inline: true},
                            { name: "** **", value: "** **"},
                            { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true},
                            { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true },
                        ])
                    }
                } else if(clearData[i].gameStatus === "先發打序"){
                    /* 比賽先發打序的embed */
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] ${teamIcon(clearData[i].awayTeam_link)} ${clearData[i].awayTeam} vs. ${teamIcon(clearData[i].homeTeam_link)} ${clearData[i].homeTeam}`)
                        .setDescription(`## 先發打序， 精彩比賽即將開始\n### 預計於 **\`${clearData[i].place_time}\`** 開打`)
                        .setColor("Aqua")
                        .addFields([
                            { name: "客隊先發", value: `${teamIcon(clearData[i].awayTeam_link)} [${clearData[i].away_sp}](${clearData[i].away_sp_link})`, inline: true},
                            { name: "主隊先發", value: `${teamIcon(clearData[i].homeTeam_link)} [${clearData[i].home_sp}](${clearData[i].home_sp_link})`, inline: true},
                            { name: "** **", value: "** **"},
                            { name: "客隊勝敗和", value: clearData[i].awayTeam_w_l_t, inline: true},
                            { name: "主隊勝敗和", value: clearData[i].homeTeam_w_l_t, inline: true },
                        ])
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                } else if(clearData[i].gameStatus === "比賽暫停"){
                    /* 比賽暫停的embed */
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] ${clearData[i].awayTeam} vs. ${clearData[i].homeTeam}`)
                        .setDescription(`# ${teamIcon(clearData[i].awayTeam_link)} \`${clearData[i].awayScore}\` : \`${clearData[i].homeScore}\` ${teamIcon(clearData[i].homeTeam_link)}\n ## 目前比賽因故暫停`)
                        .setColor("Red")
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                } else {
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setDescription(`# 無比賽賽事相關數據`)
                        .setColor("Red")
                }
                score_embed_list.push(ScoreEmbed);
            }
        } else {
            const ScoreEmbed = new EmbedBuilder()
                .setAuthor({
                    name: "中華職棒",
                    url:"https://www.cpbl.com.tw",
                    iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                })
                .setDescription("# 無比賽賽事相關數據");
            score_embed_list.push(ScoreEmbed);
        }

        const SuccessMessage = await interaction.editReply({
            embeds: score_embed_list
        });
    }
}