const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setNameLocalizations({
            "zh-TW":"邀請我"
        })
        .setDescription('invite me join to your server')
        .setDescriptionLocalizations({
            "zh-TW":"邀請我加入你的伺服器"
        }),

    async execute(interaction, client) {
        const invite_embed = new EmbedBuilder()
            .setTitle('<:bot:1069839984007331961> 邀請我')
            .setColor('Random')
            .setDescription('**歡迎加入我，讓你的伺服器添加一些風采**')
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: `YINLA • 讓你的伺服器添加一些風采`
            })
        const invite_button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji('<:bot:1069839984007331961>')
                    .setLabel('點擊邀請我')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/oauth2/authorize?client_id=914150570250625044&permissions=1759214307376375&integration_type=0&scope=applications.commands+bot')
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji('<:yinla_v2:980430954063593523>')
                    .setLabel('加入支援伺服器')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/mnCHdBbh65')
            )

        await interaction.reply({
            embeds:[invite_embed],
            components:[invite_button]
        })
    }
}