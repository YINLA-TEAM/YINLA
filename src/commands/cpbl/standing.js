const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const cheerio = require("cheerio");
const { teamIcon } = require("../../data/cpblType.js");

const fetchCPBLStanding = async() => {
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
            withResponse: true,
            flags: MessageFlags.Ephemeral,
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