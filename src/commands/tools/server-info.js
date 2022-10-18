const { SlashCommandBuilder, EmbedBuilder, } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
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
        const embed =  new EmbedBuilder()
            .setTitle(interaction.guild.name)
            .setColor('Random')
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .setThumbnail(interaction.guild.iconURL())
            .setAuthor({
                name: `伺服器簡介`,
                iconURL:interaction.guild.iconURL()
            })
            .addFields([{
                name:`🪪 伺服器ID`,
                value:`**\`${interaction.guild.id}\`**`
            },
            {
                name:`👥 人數`,
                value:`\`${interaction.guild.memberCount}\``
            },
            {
                name:`🌟 擁有者`,
                value:`<@${interaction.guild.ownerId}>`
            },
            {
                name:`🤩 伺服簡介`,
                value:`${interaction.guild.description}`
            },
            {
                name:`<a:nitroboost:1009023116917350472> 加成狀態`,
                value:`**\`${interaction.guild.premiumSubscriptionCount} (Lv.${interaction.guild.premiumTier})\`**`
            },
            {
                name:`🔰 伺服建立`,
                value:`__**<t:${parseInt(interaction.guild.createdTimestamp/1000)}>**__ **(<t:${parseInt(interaction.guild.createdTimestamp/1000)}:R>)**`
            },
        ])

        await interaction.reply({
            embeds:[embed]
        });
    },
};