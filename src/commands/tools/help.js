const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ButtonBuilder , ButtonStyle} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({
            "zh-TW" : "指令",
            "zh-CN" : "指令",
            "ja" : "命令",
            "ko" : "지침"
        })
        .setDescription('commands list')
        .setDescriptionLocalizations({
            "zh-TW" : "指令列表",
            "zh-CN" : "指令列表",
            "ja" : "コマンド一覧",
            "ko" : "명령 목록"
        }),
    async execute (interaction , client) {
        const embed = new EmbedBuilder()
            .setTitle(`📃｜指令列表`)
            .setColor('Orange')
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`)
        
        const button1 = new ButtonBuilder()
            .setLabel('加入支援伺服器')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/mnCHdBbh65')
        const button2 = new ButtonBuilder()
            .setLabel('支援伺服器介紹')
            .setStyle(ButtonStyle.Link)
            .setURL('https://hackmd.io/@YinCheng0106/YINLADC')

        const menu = new StringSelectMenuBuilder()
            .setCustomId('help')
            .setPlaceholder("📖 請選擇指令種類")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new StringSelectMenuOptionBuilder({
                emoji: `🔰`,
                label: `基礎指令`,
                description:"基礎",
                value: `1`
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`🔷`,
                label: `應用程式`,
                description:"應用程式",
                value: `3`
            })
        );

    await interaction.reply({
        embeds : [embed],
        components: [
            new ActionRowBuilder({components:[menu]}),
            new ActionRowBuilder({components:[button1,button2]})
    ],
        ephemeral: true
    });
},
}