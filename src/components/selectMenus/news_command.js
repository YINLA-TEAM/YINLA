const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: `news`,
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`💰｜中油油價`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`利用\`/設定中油油價推播\`指令來設定**推播頻道**並推播**中油油價資訊**\n(推送時間為每周日中午12:10)`)

        const embed2 = new EmbedBuilder()
            .setTitle(`🏚️｜地震報告`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`利用\`/設定地震報告推播\`指令來設定**推播頻道**並推播**地震報告**`)

        if (interaction.values[0] == `news_oilPrice`) {
            await interaction.reply({
                embeds: [ embed1 ],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `news_eq`) {
            await interaction.reply({
                embeds: [ embed2 ],
                ephemeral: true
            });
        }
    },
}