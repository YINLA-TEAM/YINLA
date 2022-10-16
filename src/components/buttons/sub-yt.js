module.exports = {
    data: {
        name: `sub-yt`
    },
    async execute(interaction, client) {
        await interaction.reply ({
            content : `https://www.youtube.com/channel/UC4Ia6g0Kjyso-hvA9s0vmWA`
        })
    }

}