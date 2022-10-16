const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setNameLocalizations({
            "zh-TW" : "伺服器資訊",
            "zh-CN" : "伺服器资讯",
            "ja" : "サーバー情報",
            "ko" : "서버정보"
        })
        .setDescription('伺服器介紹網頁')
        .setDescriptionLocalizations({
            "zh-TW" : "伺服器介紹網頁",
            "zh-CN" : "伺服器介绍网页",
            "ja" : "サーバー紹介ページ",
            "ko" : "서버 소개 페이지"
        }),
    async execute (interaction , client) {
        const guild = interaction.guild.data
        const embed =  new EmbedBuilder()
            .setTitle(guild.name)
            .setColor('Random')
            .setTimestamp(Date.now())
            .setImage()
            .setAuthor({
                name: `伺服器簡介`
            })

        const button = new ButtonBuilder()
            //.setCustomId('sub-yt')
            .setEmoji('<a:yaaaa:853175939819110411>')
            .setLabel('伺服器介紹')
            .setStyle(ButtonStyle.Link)
            .setURL('https://hackmd.io/@YinCheng0106/YINLADC');
        const button2 = new ButtonBuilder()
            .setEmoji('<a:yaaaa:853175939819110411>')
            .setLabel('伺服器介紹')
            .setStyle(ButtonStyle.Link)
            .setURL('https://hackmd.io/@YinCheng0106/YINLADC');
        

        await interaction.reply({
            embed:[embed],
            //components: [new ActionRowBuilder().addComponents(button,button2)]
        });
    },
};