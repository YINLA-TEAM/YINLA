const { EmbedBuilder} = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder , ButtonStyle } = require("discord.js");

module.exports = {
    data: {
        name : `application`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`ðï½åå¾å¤§é ­è²¼`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`å°ä½¿ç¨èé»æ **å³éµ(ææ©åé·æ)** ä¸¦é»æ æç¨ç¨å¼ \né¸å \`åå¾å¤§é ­è²¼\` å°æå¨ä½ æå¨çé »éç¼é`)

            const embed2 = new EmbedBuilder()
            .setTitle(`<:tranlate:1035826480904679424>ï½å°è¨æ¯ç¿»è­¯æ ä¸­/æ¥/è±/éæ`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`å°ä½¿ç¨èé»æ **å³éµ(ææ©åé·æ)** ä¸¦é»æ æç¨ç¨å¼ \né¸å \`æè¨æ¯ç¿»è­¯æ ä¸­/æ¥/è±/éæ\` å°æå¨ä½ æå¨çé »éç¼é`)


        if (interaction.values[0] == `avatar`) {
            await interaction.reply({
                embeds:[embed1],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `translator`) {
            await interaction.reply({
                embeds:[embed2],
                ephemeral: true
            });
        }
    },
};