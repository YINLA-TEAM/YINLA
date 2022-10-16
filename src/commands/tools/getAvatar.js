const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('getAvatar')
        .setNameLocalizations({
            "zh-TW" : "取得大頭貼",
            "zh-CN" : "取得大头贴",
            "ja" : "ステッカーをもらう",
            "ko" : "스티커를 받다"
        })
        .setType(ApplicationCommandType.User),
    async execute(interaction, client) {
        await interaction.reply({
            content: `${interaction.targetUser.displayAvatarURL()}`
        })
    }
}