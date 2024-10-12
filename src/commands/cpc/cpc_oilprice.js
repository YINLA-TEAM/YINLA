const cheerio = require('cheerio');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require('discord.js');

async function fetchCPCOilPrice() {
    const res = await fetch("https://www.cpc.com.tw/GetOilPriceJson.aspx?type=TodayOilPriceString", { method: 'GET' });
    const data = await res.json();
    const $ = cheerio.load(data.UpOrDown_Html)

    const UpOrDown = [];

    $('div').each((i, elem) => {
        const sys = $(elem).find('.sys').text().trim();
        const rate = $(elem).find('.rate i').text(). trim();

        UpOrDown.push({
            sys,
            rate
        })
    })

    return {
        PriceUpdate : data.PriceUpdate,
        nine_two_price : data.sPrice1,
        nine_five_price : data.sPrice2,
        nine_eight_price : data.sPrice3,
        ethanolFuel_price : data.sPrice4,
        superDiesel_price : data.sPrice5,
        LPG_price : data.sPrice6,
        UpOrDown : UpOrDown[0].sys,
        rate : UpOrDown[0].rate,
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cpc_oil')
        .setNameLocalizations({
            "zh-TW" : "中油油價",
        })
        .setDescription("查詢 中油油價"),

    async execute (interaction) {
        const WaitMessage = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const oil = await fetchCPCOilPrice();
        let oil_embed_color = Colors.Green;

        if(oil.UpOrDown === "調漲") oil_embed_color = Colors.Red;
        else if(oil.UpOrDown === "調降") oil_embed_color = Colors.Green;

        const oil_embed = new EmbedBuilder()
            .setAuthor({
                name: "台灣中油",
                iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/CPC_Corporation%2C_Taiwan_Seal.svg/800px-CPC_Corporation%2C_Taiwan_Seal.svg.png"
            })
            .setTitle(`本週汽油價格${oil.UpOrDown} ${oil.rate}`)
            .setDescription(`自 **${oil.PriceUpdate}** 零時起實施，單位：元/公升`)
            .setColor(oil_embed_color)
            .addFields([
                { name: "92無鉛", value: oil.nine_two_price ,inline: true },
                { name: "95無鉛", value: oil.nine_five_price ,inline: true },
                { name: "98無鉛", value: oil.nine_eight_price ,inline: true },
                { name: "酒精汽油", value: oil.ethanolFuel_price ,inline: true },
                { name: "超級柴油", value: oil.superDiesel_price ,inline: true },
                { name: "液化石油氣", value: oil.LPG_price ,inline: true },
            ])
            .setFooter({ text: "台灣中油股份有限公司 • CPC Corporation, Taiwan" })

        const url = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel("台灣中油官網")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.cpc.com.tw/"),
                new ButtonBuilder()
                    .setLabel("油價歷史資訊")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://www.cpc.com.tw/historyprice.aspx?n=2890"),
            ]);

        const SuccessMessage = await interaction.editReply({
            embeds : [ oil_embed ],
            components : [ url ]
        });
    }
}