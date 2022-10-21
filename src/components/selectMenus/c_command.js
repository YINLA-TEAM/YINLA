const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder, ButtonBuilder , ButtonStyle } = require("discord.js");
const help = require("../../commands/tools/help");

module.exports = {
    data: {
        name : `common`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`🔎｜DC相關資訊查詢功能`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`以下指令可以點擊使用`)
            .addFields([{
                name:`</server-info:1033064221283450966>`,
                value:`> 查詢伺服器資訊`
            },
            {
                name:`</user-info:1033064221283450967>`,
                value:`> 查詢個人簡介`
            },
        ])

        const embed2 = new EmbedBuilder()
            .setTitle(`🤖️｜機器人相關`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`以下指令可以點擊使用`)
            .addFields([{
                name:`</bot-info:1033064221283450962>`,
                value:`> 查詢機器人狀態`
            }])

        if (interaction.values[0] == 'search') {
            await interaction.reply({
                embeds:[embed1],
                ephemeral: true
            });
        }
        if (interaction.values[0] == 'bot') {
            await interaction.reply({
                embeds:[embed2],
                ephemeral: true
            });
        }
    },
};