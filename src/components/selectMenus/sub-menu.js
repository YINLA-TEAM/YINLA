module.exports = {
    data: {
        name : `sub-menu`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `你的選擇： ${interaction.values[0]}`
        });
    },
};