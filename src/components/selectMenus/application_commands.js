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
            .setDescription(`對使用者點擊 **右鍵(手機則長按)** 並點擊 應用程式 \n選取 \`取得大頭貼\` 將會在你所在的頻道發送`)

            const embed2 = new EmbedBuilder()
            .setTitle(`<:tranlate:1035826480904679424>｜把訊息翻譯成中文`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`對使用者點擊 **右鍵(手機則長按)** 並點擊 應用程式 \n選取 \`把訊息翻成中文\` 將會在你所在的頻道發送`)


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