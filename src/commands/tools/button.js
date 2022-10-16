const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('回復按鈕'),
    async execute (interaction , client) {
        const button = new ButtonBuilder()
            //.setCustomId('sub-yt')
            .setLabel('點我!!')
            .setStyle(ButtonStyle.Link)
            .setURL('https://www.youtube.com/channel/UC4Ia6g0Kjyso-hvA9s0vmWA')

        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(button)]
        });
    },
};