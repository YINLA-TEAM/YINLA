const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

async function CPBL_game_canceled() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.cpbl.com.tw/');
    await page.waitForSelector('.game_item.canceled');

    const data = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.game_item.canceled')).map(element => {
            const canceled_message = element.querySelector('.ScheduleListNote div')?.textContent.trim();
            return canceled_message;
        });
    });

    await browser.close();
    return data;
}

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

            const place = element.querySelector('.PlaceInfo .place')?.textContent.trim();                       // 比賽球場
            const place_time = element.querySelector('.PlaceInfo .time')?.textContent.trim();                   // 比賽時間
            const inning = element.querySelector('.GameMatchupBasic .inning')?.textContent.trim();              // 比賽局數
            const inning_top_bot = element.querySelector('.GameMatchupBasic .inning')?.getAttribute('class');   // 比賽上下局

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

            return {
                gameNumber,
                gameStatus,

                awayTeam,
                homeTeam,
                awayScore,
                homeScore,

                place,
                place_time,
                inning,
                inning_top_bot,

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

                place: score.place,
                place_time: score.place_time,
                inning: score.inning,
                inning_top_bot: score.inning_top_bot,

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
            }
        })

        // 判定有無正在執行之賽事
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
                        .setDescription(`# ${teamIcon(clearData[i].awayTeam)} \`${clearData[i].awayScore}\` ${clearData[i].inning + top_bot}  \`${clearData[i].homeScore}\` ${teamIcon(clearData[i].homeTeam)}`)
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
                } else if(clearData[i].gameStatus === undefined){
                    /* 比賽尚未開始的embed */
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] 比賽尚未開始`)
                        .setDescription(`比賽尚未開始`)
                        .setColor("White")
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
                } else if(clearData[i].gameStatus === "先發打序"){
                    /* 比賽先發打序的embed */
                    ScoreEmbed
                        .setAuthor({
                            name: "中華職棒",
                            url:"https://www.cpbl.com.tw",
                            iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                        })
                        .setTitle(`[${clearData[i].gameNumber}] ${teamIcon(clearData[i].awayTeam)} ${clearData[i].awayTeam} vs. ${teamIcon(clearData[i].homeTeam)} ${clearData[i].homeTeam}`)
                        .setDescription(`## 先發打序， 精彩比賽即將開始\n### 預計於 **\`${clearData[i].place_time}\`** 開打`)
                        .setColor("Aqua")
                        .addFields([
                            { name: "客隊先發", value: `${teamIcon(clearData[i].awayTeam)} [${clearData[i].away_sp}](${clearData[i].away_sp_link})`, inline: true},
                            { name: "主隊先發", value: `${teamIcon(clearData[i].homeTeam)} [${clearData[i].home_sp}](${clearData[i].home_sp_link})`, inline: true},
                        ])
                        .setFooter({
                            text: `🏟️ ${clearData[i].place}棒球場`,
                        })
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
                .setDescription("# 今日無賽事");
            score_embed_list.push(ScoreEmbed);
        }

        const SuccessMessage = await interaction.editReply({
            embeds: score_embed_list
        });
    }
}