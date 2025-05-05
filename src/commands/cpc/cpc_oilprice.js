const cheerio = require('cheerio');
const { SlashCommandBuilder, ActionRowBuilder, ContainerBuilder, TextDisplayBuilder,
        ButtonBuilder, ButtonStyle, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder,
        SeparatorSpacingSize, Colors, } = require('discord.js');

function parseMonthDayToUnix(monthDayStr) {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const [_, month, day] = monthDayStr.match(/(\d+)月(\d+)日/);
    
    const candidates = [-1, 0, 1].map(offset => {
        const year = currentYear + offset;
        const date = new Date(year, month - 1, day);
        return { year, date };
    });
    const closest = candidates.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.date - now);
        const currDiff = Math.abs(curr.date - now);
        return currDiff < prevDiff ? curr : prev;
    });
    
    return Math.floor(closest.date.getTime() / 1000);
    }

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
        await interaction.deferReply({
            withResponse: true,
            flags: MessageFlags.Ephemeral,
        });
        try {
            const oil = await fetchCPCOilPrice();
            let oil_color = Colors.Green;
            let oil_title = "";
    
            if(oil.rate === '0.0') {
                oil_color = Colors.Grey;
                oil_title = "本週汽油價格不調整";
            } else if(oil.UpOrDown === "調漲") {
                oil_color = Colors.Red;
                oil_title = `本週汽油價格${oil.UpOrDown} ${oil.rate}`;
            } else if(oil.UpOrDown === "調降") {
                oil_color = Colors.Green;
                oil_title = `本週汽油價格${oil.UpOrDown} ${oil.rate}`;
            }
    
            const oil_header = new TextDisplayBuilder()
                .setContent(
                    [
                        `# ${oil_title}`,
                        `-# 自 **<t:${parseMonthDayToUnix(oil.PriceUpdate)}>** 起實施，單位：元/公升`,
                    ].join('\n')
                );
    
            const oil_msg = new TextDisplayBuilder()
                .setContent(
                    [
                        `- **92無鉛**\n → __${oil.nine_two_price}__ 元`,
                        `- **95無鉛**\n → __${oil.nine_five_price}__ 元`,
                        `- **98無鉛**\n → __${oil.nine_eight_price}__ 元`,
                        `- **酒精汽油**\n → __${oil.ethanolFuel_price}__ 元`,
                        `- **超級柴油**\n → __${oil.superDiesel_price}__ 元`,
                        `- **液化石油氣**\n → __${oil.LPG_price}__ 元`,
                    ].join('\n')
                );

            const oil_footer = new TextDisplayBuilder()
                .setContent(`-# 以上價格僅供參考，實際價格以中油官網為準・資料來源：台灣中油`);
    
            const cpc_logo = new MediaGalleryBuilder()
                .addItems([
                    new MediaGalleryItemBuilder()
                        .setURL('https://ws.cpc.com.tw/001/Upload/1/sites/pagebackimage/ff201a11-44a7-4d52-970d-b5e747044b4b.png')
                ]);
    
            const cpc_url = new ActionRowBuilder()
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
    
            const oil_container = new ContainerBuilder()
                .setId(1)
                .setAccentColor(oil_color)
                .setSpoiler(false)
                .addMediaGalleryComponents(cpc_logo)
                .addTextDisplayComponents(oil_header)
                .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(oil_msg)
                .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(oil_footer)
                .addActionRowComponents(cpc_url)
    
            await interaction.editReply({
                components : [oil_container],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: "發生錯誤，請稍後再試。",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    }
}