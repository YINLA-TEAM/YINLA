const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autocomplete')
        .setDescription('自動完成')
        .addStringOption(option => 
            option
                .setName('colour')
                .setDescription('A colour based on autocommplete.')
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction, client) {
        const focusedVaulue = interaction.options.getFocused();
        const choices = ["red", "blue", "yellow", "green", "purple", "pink"];
        const filtered = choices.filter((choice) => 
            choice.startsWith(focusedVaulue)
        )
        await interaction.respond(
            filtered.map((choice) => ({
                name: choice,
                value: choice
            }))
        );
    },
    async execute(interaction, client) {
        const option = interaction.options.getString('colour');
        await interaction.reply({
            content:`你告訴我${option}`
        })
    }
}