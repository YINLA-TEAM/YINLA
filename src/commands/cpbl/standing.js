const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cheerio = require("cheerio");

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
    const response = await fetch("https://www.cpbl.com.tw", { method: 'GET' });
    const data = await response.text();
    const $ = cheerio.load(data);

    const dataArray = [];

    $('.index_standing_table tbody tr').each((i, elem) => {
        if (i === 0) return;
        const rank = $(elem).find('.rank').text().trim();
        const team = $(elem).find('.team_name a').attr('title');
        const gamesPlayed = $(elem).find('td').eq(1).text().trim();
        const winDrawLoss = $(elem).find('td').eq(2).text().trim();
        const winRate = $(elem).find('td').eq(3).text().trim();
        const gamesBehind = $(elem).find('td').eq(4).text().trim();
        const streak = $(elem).find('td').eq(5).text().trim();
        if (team == undefined) return;

        dataArray.push({
            rank,
            team,
            gamesPlayed,
            winDrawLoss,
            winRate,
            gamesBehind,
            streak,
        });
    });

    return dataArray;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpbl_standing')
        .setNameLocalizations({
            "zh-TW" : "中華職棒球隊成績",
        })
        .setDescription('查看 中華職棒目前賽季球隊成績')
        .addStringOption(option => (
            option
                .setName("season")
                .setNameLocalizations({
                    "zh-TW": "賽季",
                })
                .setDescription("上半季 or 下半季"))
                .setRequired(true)
                .addChoices(
                    { name: '上半季', value: "上半季" },
                    { name: '下半季', value: "下半季" },
                )
        ),

    async execute (interaction) {
        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const data = await fetchCPBLStanding();
        let season = "";
        let broad = [];

        if(interaction.options.getString('season') === "上半季"){
            season = "上半賽季";
            for(let i = 0; i < data.length / 2; i++){
                let info = `## \`${data[i].rank}\` ${teamIcon(data[i].team)} \`${data[i].gamesPlayed}\` \`${data[i].winDrawLoss}\` \`${data[i].winRate}\` \`${data[i].gamesBehind}\` \`${data[i].streak}\``;
                broad.push(info);
            }
        } else if(interaction.options.getString('season') === "下半季"){
            season = "下半賽季";
            for(let i = data.length/2; i < data.length; i++){
                let info = `## \`${data[i].rank}\` ${teamIcon(data[i].team)} \`${data[i].gamesPlayed}\` \`${data[i].winDrawLoss}\` \`${data[i].winRate}\` \`${data[i].gamesBehind}\` \`${data[i].streak}\``;
                broad.push(info);
            }
        }

        const standingEmbed = new EmbedBuilder()
            .setAuthor({
                name: "中華職棒",
                url:"https://www.cpbl.com.tw",
                iconURL:"https://www.cpbl.com.tw/theme/common/images/project/logo_new.png"
            })
            .setTitle(`${season} 球隊成績`)
            .setDescription(`${broad.join("\n")}`)
            .setColor("Blue")

        const SuccessMessage = await interaction.editReply({
            embeds: [ standingEmbed ]
        });
    }
}