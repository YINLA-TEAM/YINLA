const { ContextMenuCommandBuilder, ApplicationCommandType ,EmbedBuilder} = require('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('getAvatar')
        .setNameLocalizations({
            "zh-TW" : "取得大頭貼",
            "zh-CN" : "取得大头贴",
            "ja" : "ステッカーをもらう",
            "ko" : "스티커를 받다",
        })
        .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setAuthor({
                name:`取得大頭貼`,
            })
            .setTitle(`${interaction.targetUser.username}`)
            .setImage(`${interaction.targetUser.displayAvatarURL()}`)
            .setColor(`Random`)
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .setTimestamp(Date.now())

        await interaction.reply({
            embeds:[embed],
            ephemeral: true
        })
    }
}