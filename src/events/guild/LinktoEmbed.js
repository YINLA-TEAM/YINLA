module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(interaction) {
        interaction.delete;
        if(interaction.author.bot == true) return;
        if(interaction.content.startsWith('https://x.com')){
            const message = interaction.content.replace("x.com", "vxtwitter.com");
            await interaction.reply({
                content: `<@${interaction.author.id}>傳了一則推[超連結](${message})`,
                allowedMentions: {
                    repliedUser: false
                }
            })
        } else if(interaction.content.startsWith('https://twitter.com')){
            const message = interaction.content.replace("twitter.com", "vxtwitter.com");
            await interaction.reply({
                content: `<@${interaction.author.id}> 傳了一則推[超連結](${message})`,
                allowedMentions: {
                    repliedUser: false
                }
            })
        } else if(interaction.content.startsWith('https://www.instagram.com')){
            const message = interaction.content.replace("instagram.com", "ddinstagram.com");
            await interaction.reply({
                content: `<@${interaction.author.id}> 傳了一則文[超連結](${message})`,
                allowedMentions: {
                    repliedUser: false
                }
            })
        } else {
            return;
        }
    }
}