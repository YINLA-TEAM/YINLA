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

async function fetchCPBLStanding() {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto('https://www.cpbl.com.tw', { waitUntil: 'domcontentloaded' });

    const standingData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.index_standing_table tbody tr'));
        return rows.map(row => {
            const rank = row.querySelector('.rank')?.innerText.trim() || ''; // 抓取排名
            const team = row.querySelector('.team_name a')?.innerText.trim() || ''; // 抓取隊伍名稱
            const gamesPlayed = row.querySelectorAll('td')[1]?.innerText.trim() || ''; // 抓取出賽數
            const winDrawLoss = row.querySelectorAll('td')[2]?.innerText.trim() || ''; // 抓取勝-敗-和
            const winRate = row.querySelectorAll('td')[3]?.innerText.trim() || ''; // 抓取勝率
            const gamesBehind = row.querySelectorAll('td')[4]?.innerText.trim() || ''; // 抓取勝差
            const streak = row.querySelectorAll('td')[5]?.innerText.trim() || ''; // 抓取連勝/連敗

            if (!rank || !team || !gamesPlayed) {
                return null;
            }

            return { rank, team, gamesPlayed, winDrawLoss, winRate, gamesBehind, streak };
        }).filter(Boolean);
    });
    // 關閉瀏覽器
    await browser.close();
    return standingData;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_standing')
        .setNameLocalizations({
            "zh-TW" : "中華職棒球隊成績",
        })
        .setDescription('查看 中華職棒目前賽季球隊成績'),

    async execute (interaction) {
        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const data = await fetchCPBLStanding();

        let broad = [];

        for(let i = 0; i < data.length; i++){
            let info = `## \`${data[i].rank}\` ${teamIcon(data[i].team)} \`${data[i].gamesPlayed}\` \`${data[i].winDrawLoss}\` \`${data[i].winRate}\` \`${data[i].gamesBehind}\` \`${data[i].streak}\``;
            broad.push(info);
        }


        const standingEmbed = new EmbedBuilder()
            .setAuthor({
                name: "中華職棒",
                url:"https://www.cpbl.com.tw",
                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
            })
            .setTitle("目前賽季球隊成績")
            .setDescription(`${broad.join("\n")}`)
            .setColor("Blue")

        const SuccessMessage = await interaction.editReply({
            embeds: [ standingEmbed ]
        });
    }
}