const { EmbedBuilder} = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder , ButtonStyle } = require("discord.js");

module.exports = {
    data: {
        name : `advance`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`🔎｜待更新`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`)

        const embed2 = new EmbedBuilder()
            .setTitle(`🤖️｜待更新`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`)


        if (interaction.values[0] == `1`) {
            await interaction.reply({
                embeds:[embed1],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `2`) {
            await interaction.reply({
                embeds:[embed2],
                ephemeral: true
            });
        }
    },
};