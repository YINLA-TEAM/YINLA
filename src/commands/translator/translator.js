const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const tranlate = require('@iamtraction/google-translate');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translator')
        .setNameLocalizations({
            "zh-TW" : "翻譯",
        })
        .setDescription("翻譯系統")
        .addStringOption(option => 
            option
                .setName("lan")
                .setNameLocalizations({
                    "zh-TW": "語言",
                })
                .setDescription("請選擇轉換語言")
                .setDescriptionLocalizations({
                    "zh-TW": "請選擇轉換語言",
                })
                .setRequired(true)
                .addChoices(
                    { name: "阿拉伯語 (Arabic)", value: "ar" },
                    { name: "簡體中文 (Chinese Simplified)", value: "zh-cn" },
                    { name: "繁體中文 (Chinese Traditional)", value: "zh-tw" },
                    { name: "丹麥語 (Danish)", value: "da" },
                    { name: "荷蘭文 (Dutch)", value: "nl" },
                    { name: "英語 (English)", value: "en" },
                    { name: "菲律賓語 (Filipino)", value: "tl" },
                    { name: "法語 (French)", value: "fr" },
                    { name: "德語 (German)", value: "de" },
                    { name: "希臘語 (Greek)", value: "el" },
                    { name: "希伯來語 (Hebrew)", value: "iw" },
                    { name: "印尼文 (Indonesian)", value: "id" },
                    { name: "意大利語 (Italian)", value: "it" },
                    { name: "日語 (Japanese)", value: "ja" },
                    { name: "韓語 (Korean)", value: "ko" },
                    { name: "拉丁語 (Latin)", value: "la" },
                    { name: "馬來語 (Malay)", value: "ms" },
                    { name: "緬甸語 (Burmese)", value: "my" },
                    { name: "波蘭語 (Polish)", value: "pl" },
                    { name: "葡萄牙語 (Portuguese)", value: "pt" },
                    { name: "俄語 (Russian)", value: "ru" },
                    { name: "西班牙語 (Spanish)", value: "es" },
                    { name: "瑞典語 (Swedish)", value: "sv" },
                    { name: "泰語 (Thai)", value: "th" },
                    { name: "越南語 (Vietnamese)", value: "vi" },
                )
            )
        .addStringOption(option =>
            option
                .setName('text')
                .setNameLocalizations({
                    "zh-TW" : "文字"
                })
                .setDescription('請輸入翻譯內容')
                .setDescriptionLocalizations({
                    "zh-TW": "請輸入翻譯內容(最多500字)",
                })
                .setRequired(true)
            ),

    async execute(interaction, client){
        const lan = interaction.options.getString('lan');
        const text = interaction.options.getString('text');

        if( text.lenght > 500){
            const error_embed = new EmbedBuilder()
                .setTitle(`翻譯｜TRANSLATE`)
                .setDescription("太多了")
                .setColor(`#5185e3`)
                .setTimestamp(Date.now())
            await interaction.reply({
                embeds:[error_embed],
                ephemeral: true
            })
        } else {
            const translatedText = (await tranlate( text, {to: lan})).text;
            const translateEmbed = new EmbedBuilder()
            .setAuthor({
                name: "翻譯｜TRANSLATE",
            })
            .setDescription(`\`\`\`${translatedText}\`\`\``)
            .setColor('Random')
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })

            await interaction.reply({
                embeds: [translateEmbed],
                ephemeral: true,
            })
        }
    }
}