const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

function teamIcon(team_name) {
    try {
        const icon = {
            "中信兄弟": "<:cpbl_B:914141522541297696>",
            "味全龍": "<:cpbl_D:1033396051224305734>",
            "富邦悍將": "<:cpbl_G:1033396049227829331>",
            "統一7-ELEVEn獅": "<:cpbl_L:1033396606491431012>",
            "樂天桃猿": "<:cpbl_R:1033396046849646654>",
            "台鋼雄鷹": "<:cpbl_T:1273206632150470678>",
            "三商": "<:cpbl_Tiger:1275824989441888266>",
            "兄弟": "<:cpbl_B_O:1275825371744571455>",
            "時報": "<:cpbl_E:1275825666914386065>",
            "俊國": "<:cpbl_Bears:1275825871898411100>",
            "興農": "<:cpbl_S:1275826268700672041>",
            "中信": "<:cpbl_W:1275826947745775728>",
            "第一": "<:cpbl_L:1275827544351965194>",
            "誠泰": "<:cpbl_C:1275827950838874122>",
            "Lamigo": "<:cpbl_Lamigo:1275828301214253138>",
            "米迪亞": "<:cpbl_T_REX:1275828691842371704>",
            "義大": "<:cpbl_Rhino:1275828995019247770>",
        };
        
        return icon[team_name] || " ";
    } catch (error) {
        return " ";
    }
}

async function fetchCPBLPlayer(link) {

    if (link === undefined) {
        return;
    }
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(`https://www.cpbl.com.tw${link}`, { waitUntil: 'networkidle2' });

    const playerData = await page.evaluate(() => {
        const image_regex = /\((.*?)\)/;
        const image = document.querySelector('.img span')?.getAttribute('style').match(image_regex);
        const image_url = image ? `https://www.cpbl.com.tw/${image[1]}` : `https://www.cpbl.com.tw/theme/common/images/project/logo_new.png`;

        return {
            image_url,
        }
    })

    

    await browser.close();
    return playerData;
}

async function fetchCPBLGame(game_number, game_year) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    
    // 打開目標網頁
    await page.goto(`https://www.cpbl.com.tw/box/index?gameSno=${game_number}&year=${game_year}&kindCode=A`, { waitUntil: 'networkidle2' });

    // 檢查比賽是否開始 
    const isGameNotStarted = await page.evaluate(() => {
        const gameCanceledElement = document.querySelector('.game_canceled');
        return gameCanceledElement && gameCanceledElement.innerText.includes('比賽尚未開始');
    });

    if (isGameNotStarted) {
        await browser.close();
        return;
    }

    // 爬取比分數據
    const scoreData = await page.evaluate(() => {
        const place = document.querySelector('.game_info .place')?.textContent.trim();

        const awayTeam = document.querySelector('.team.away .team_name a')?.textContent.trim();
        const homeTeam = document.querySelector('.team.home .team_name a')?.textContent.trim();

        const inning = Array.from(document.querySelectorAll('.linescore_table .inning span'))
                                .map(th => th.textContent || '-');
        // 獲取每局分數
        const awayScores = Array.from(document.querySelectorAll('.linescore_table .away .card'))
                                .map(td => td.textContent || '-');
        const homeScores = Array.from(document.querySelectorAll('.linescore_table .home .card'))
                                .map(td => td.textContent || '-');

        // 獲取總分
        const awayTotal = document.querySelector('.linescore.fixed .away td:nth-child(1)')?.textContent.trim() || '-';
        const homeTotal = document.querySelector('.linescore.fixed .home td:nth-child(1)')?.textContent.trim() || '-';
        const awayHit = document.querySelector('.linescore.fixed .away td:nth-child(2)')?.textContent.trim() || '-';
        const homeHit = document.querySelector('.linescore.fixed .home td:nth-child(2)')?.textContent.trim() || '-';
        const awayErr = document.querySelector('.linescore.fixed .away td:nth-child(3)')?.textContent.trim() || '-';
        const homeErr = document.querySelector('.linescore.fixed .home td:nth-child(3)')?.textContent.trim() || '-';

        // MVP 數據
        const MVP = document.querySelector('.item.MVP .player .name a')?.textContent.trim() || '尚未被選出';
        const MVP_link = document.querySelector('.item.MVP .player .name a')?.getAttribute('href') || undefined;
        const MVP_batter_pitcher = document.querySelector('.item.MVP .record li:nth-child(2)')?.textContent.trim() || '-';
        const MVP_year_count = document.querySelector('.item.MVP .record li:nth-child(1) span')?.textContent.trim() || '-'; // 當年度獲選MVP次數
        const MVP_hit_count_IP = document.querySelector('.item.MVP .record li:nth-child(2) span')?.textContent.trim() || '-'; // 打數 or 投球局數
        const MVP_hit_point_K = document.querySelector('.item.MVP .record li:nth-child(3) span')?.textContent.trim() || '-'; // 打點 or 奪三振數
        const MVP_get_score_R = document.querySelector('.item.MVP .record li:nth-child(4) span')?.textContent.trim() || '-'; // 得分 or 失分
        const MVP_hit = document.querySelector('.item.MVP .record li:nth-child(5) span')?.textContent.trim() || '-'; // 安打
        const MVP_homerun = document.querySelector('.item.MVP .record li:nth-child(6) span')?.textContent.trim() || '-'; // 全壘打

        // 裁判數據
        const headUmpire = document.querySelector('.GameNote li:nth-child(1)')?.textContent.trim().slice(2) || '無';         // 主審
        const firstBaseReferee = document.querySelector('.GameNote li:nth-child(2)')?.textContent.trim().slice(3) || '無';   // 一壘審
        const secondBaseReferee = document.querySelector('.GameNote li:nth-child(3)')?.textContent.trim().slice(3) || '無';  // 二壘審
        const thirdBaseReferee = document.querySelector('.GameNote li:nth-child(4)')?.textContent.trim().slice(3) || '無';   // 三壘審
        const leftFieldReferee = document.querySelector('.GameNote li:nth-child(5)')?.textContent.trim().slice(3) || '無';   // 左線審
        const rightFieldReferee = document.querySelector('.GameNote li:nth-child(6)')?.textContent.trim().slice(3) || '無';  // 右線審

        return {
            place,
            awayTeam,
            homeTeam,
            awayScores,
            homeScores,
            inning,

            awayTotal,
            homeTotal,
            awayHit,
            homeHit,
            awayErr,
            homeErr,

            MVP,
            MVP_link,
            MVP_batter_pitcher,
            MVP_year_count,
            MVP_hit_count_IP,
            MVP_hit_point_K,
            MVP_get_score_R,
            MVP_hit,
            MVP_homerun,

            headUmpire,
            firstBaseReferee,
            secondBaseReferee,
            thirdBaseReferee,
            leftFieldReferee,
            rightFieldReferee,
        };
    });

    if (scoreData.awayTeam === undefined) {
        await browser.close();
        return;
    }

    // 關閉瀏覽器
    await browser.close();
    return scoreData;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_game')
        .setNameLocalizations({
            "zh-TW" : "中華職棒賽事",
        })
        .setDescription("查詢賽事詳細資訊(一軍例行賽)，資料讀取時間較久，請耐心等待")
        .addIntegerOption(option => (
            option
                .setName('game_year')
                .setNameLocalizations({
                    "zh-TW" : "比賽年份",
                })
                .setDescription("年份範圍：1990~至今")
                .setRequired(true)
                .setMinValue(1990)
                .setMaxValue(new Date().getFullYear())
        ))
        .addIntegerOption(option => (
            option
                .setName('game_number')
                .setNameLocalizations({
                    "zh-TW" : "比賽編號",
                })
                .setDescription("場次範圍：1~360")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(360)
        )),

    async execute (interaction) {
        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        
        let game_number = interaction.options.getInteger('game_number');
        let game_year = interaction.options.getInteger('game_year');

        const game = await fetchCPBLGame(game_number, game_year);
        let player = null;

        if (!game) {
            // 如果比賽尚未開始
            await interaction.editReply(`# 🚨：\`${game_year}\`年 比賽編號 \`${game_number}\` 尚未開始或無數據`);
            return;
        }

        const CpblGameDetailEmbed = new EmbedBuilder()
            .setAuthor({
                name: "中華職棒",
                url:"https://www.cpbl.com.tw",
                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
            })
            .setTitle(`${teamIcon(game.awayTeam)} ${game.awayTeam} vs. ${teamIcon(game.homeTeam)} ${game.homeTeam}`)
            .setDescription(
                `# <:cpbl_logo:1275836738304217181> ${game.inning.map(i => `\`${i}\``).join(' ')} | \`R\` \`H\` \`E\`\n` +
                `# ${teamIcon(game.awayTeam)} ${game.awayScores.map(s => `\`${s}\``).join(' ')} | \`${game.awayTotal}\` \`${game.awayHit}\` \`${game.awayErr}\`\n` +
                `# ${teamIcon(game.homeTeam)} ${game.homeScores.map(s => `\`${s}\``).join(' ')} | \`${game.homeTotal}\` \`${game.homeHit}\` \`${game.homeErr}\``
            )
            .setColor("Green")
            .setFooter({
                text: `🏟️ ${game_year} • 第 ${game_number} 場次 • ${game.place}棒球場`,
            })
            .addFields([
                { name: "主審", value: game.headUmpire, inline: true },
                { name: "一壘審", value: game.firstBaseReferee, inline: true },
                { name: "二壘審", value: game.secondBaseReferee, inline: true },
                { name: "三壘審", value: game.thirdBaseReferee, inline: true },
                { name: "左線審", value: game.leftFieldReferee, inline: true },
                { name: "右線審", value: game.rightFieldReferee, inline: true },
            ]);

        const CplbEmbeds = [CpblGameDetailEmbed];

            if (game.MVP_link) {
                player = await fetchCPBLPlayer(game.MVP_link);
                let winner_team = null;
                if(parseInt(game.awayTotal) > parseInt(game.homeTotal)) winner_team = game.awayTeam;
                else winner_team = game.homeTeam;
                const MVPEmbed = new EmbedBuilder();
                if(game.MVP_batter_pitcher.substring(0,2) === "打數"){
                    MVPEmbed
                    .setAuthor({
                        name: "MVP 最有價值球員",
                        url:"https://www.cpbl.com.tw",
                        iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                    })
                    .setDescription(`# ${teamIcon(winner_team)} [${game.MVP}](https://www.cpbl.com.tw${game.MVP_link})`)
                    .setThumbnail(player?.image_url || "")
                    .setColor("Gold")
                    .addFields([
                        { name: "當年度獲選MVP次數", value: game.MVP_year_count, inline:false },
                        { name: "打數", value: game.MVP_hit_count_IP, inline:true },
                        { name: "打點", value: game.MVP_hit_point_K, inline:true },
                        { name: "得分", value: game.MVP_get_score_R, inline:true },
                        { name: "安打", value: game.MVP_hit, inline:true },
                        { name: "全壘打", value: game.MVP_homerun, inline:true },
                    ])
                } else {
                    MVPEmbed
                    .setAuthor({
                        name: "MVP 最有價值球員",
                        url:"https://www.cpbl.com.tw",
                        iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
                    })
                    .setDescription(`# ${teamIcon(winner_team)} [${game.MVP}](https://www.cpbl.com.tw${game.MVP_link})`)
                    .setThumbnail(player?.image_url || "")
                    .setColor("Gold")
                    .addFields([
                        { name: "當年度獲選MVP次數", value: game.MVP_year_count, inline:false },
                        { name: "投球局數", value: game.MVP_hit_count_IP, inline:true },
                        { name: "奪三振數", value: game.MVP_hit_point_K, inline:true },
                        { name: "失分數", value: game.MVP_get_score_R, inline:true },
                    ])
                }
        
                CplbEmbeds.push(MVPEmbed);
            }

        const SuccessMessage = await interaction.editReply({
            embeds : CplbEmbeds
        });
    }
}