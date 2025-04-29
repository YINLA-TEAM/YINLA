const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, MessageFlags } = require('discord.js')

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('getAvatar')
        .setNameLocalizations({
            "zh-TW" : "取得大頭貼",
            "zh-CN" : "取得大头贴",
        })
        .setType(ApplicationCommandType.User),

    async execute(interaction, client) {
        const getAvatarEmbed = new EmbedBuilder()
            .setAuthor({
                name:`取得大頭貼`,
            })
            .setTitle(`${interaction.targetUser.username.replaceAll("_", "\\_")}`)
            .setImage(`${interaction.targetUser.displayAvatarURL()}`)
            .setColor(`Random`)
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA`
            })
            .setTimestamp(Date.now())

        await interaction.reply({
            embeds:[ getAvatarEmbed ],
            flags: MessageFlags.Ephemeral,
        })
    }
}