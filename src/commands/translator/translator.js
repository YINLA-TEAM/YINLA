const { SlashCommandBuilder, EmbedBuilder, MessageFlags, ContainerBuilder,
        TextDisplayBuilder, SeparatorSpacingSize } = require('discord.js');
const translate = require('@iamtraction/google-translate');

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

    async execute(interaction){
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
                flags: MessageFlags.Ephemeral,
            })
        } else {
            const translatedText = (await translate( text, {to: lan})).text;
            const translate_header = new TextDisplayBuilder()
            .setContent([
                `## <:tranlate:1035826480904679424> 翻譯｜TRANSLATE`,
                `翻譯不一定100%正確，僅供參考，(最多可翻譯500字)`,
            ].join('\n'));

            const translated_msg = new TextDisplayBuilder()
                .setContent([
                    `**翻譯訊息**`,
                    `\`\`\`${translatedText}\`\`\``
                ].join('\n'));

            const translate_container = new ContainerBuilder()
                .setId(1)
                .setSpoiler(false)
                .addTextDisplayComponents(translate_header)
                .addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(translated_msg);

            await interaction.reply({
                components : [translate_container],
                flags: [ MessageFlags.Ephemeral, MessageFlags.IsComponentsV2 ],
            })
        }
    }
}