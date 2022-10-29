const { EmbedBuilder} = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder , ButtonStyle } = require("discord.js");

module.exports = {
    data: {
        name : `application`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`😎｜取得大頭貼`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`點擊 應用程式 選取 \`取得大頭貼\` 將會在你所在的頻道發送`)

        const embed2 = new EmbedBuilder()
            .setTitle(`<a:_loading:1009020311573893121>｜待更新`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`待更新`)


        if (interaction.values[0] == `avatar`) {
            await interaction.reply({
                embeds:[embed1],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `banner`) {
            await interaction.reply({
                embeds:[embed2],
                ephemeral: true
            });
        }
    },
};