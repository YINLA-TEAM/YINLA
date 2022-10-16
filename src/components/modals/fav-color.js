module.exports = {
    data: {
        name: `fav-color`
    },
    async execute(interaction, client) {
        await interaction.reply({
            content:`你傳送你最喜歡的顏色:${interaction.fields.getTextInputValue("favColorInput")}`
        })
    }
}