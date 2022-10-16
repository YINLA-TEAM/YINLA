const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setNameLocalizations({
            "zh-TW" : "選單",
            "zh-CN" : "选单",
            "ja" : "メニュー",
            "ko" : "메뉴"
        })
        .setDescription('回覆選單')
        .setDescriptionLocalizations({
            "zh-TW" : "選單(失效)",
            "zh-CN" : "选单(失效)",
            "ja" : "メニュー(無効)",
            "ko" : "메뉴(유효하지 않은)"
        }),
    async execute (interaction , client) {
        const menu = new SelectMenuBuilder()
            .setCustomId(`sub-menu`)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `<a:yaaaa:853175939819110411>`,
                label: `TWITCH`,
                description:"圖其",
                value: `https://www.twitch.tv/yincheng0106`
            }),
            new SelectMenuOptionBuilder({
                label: `YOUTUBE`,
                description:"悠酷",
                value: `https://www.youtube.com/channel/UC4Ia6g0Kjyso-hvA9s0vmWA`
            })
        );
    await interaction.reply({
        components: [new ActionRowBuilder().addComponents(menu)],
    });
},
}