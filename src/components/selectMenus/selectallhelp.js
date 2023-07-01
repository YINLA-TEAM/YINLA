const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ButtonBuilder , ButtonStyle} = require("discord.js");

module.exports = {
    data: {
        name : `help`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`🔰｜基礎指令`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`)

        const embed3 = new EmbedBuilder()
            .setTitle(`🔷｜應用程式`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> 請用以下選單選擇指令，會向您詳細介紹`)

        const common_menu = new StringSelectMenuOptionBuilder()
            .setCustomId(`common`)
            .setPlaceholder("📖 請選擇指令")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `🔎`,
                label: `DC相關資訊查詢功能`,
                value: 'search'
            }),
            new SelectMenuOptionBuilder({
                emoji:`🤖`,
                label: `機器人狀態指令`,
                value: 'bot'
            })
        );
        const application_menu = new StringSelectMenuOptionBuilder()
            .setCustomId(`application`)
            .setPlaceholder("📖 請選擇應用程式介紹")
            .setDisabled(false)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `😎`,
                label: `取得大頭貼`,
                description:"取得使用者大頭貼",
                value: `avatar`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:tranlate:1035826480904679424>`,
                label: `把訊息翻譯成 中/日/英/韓文`,
                description:"可以直接利用此功能將訊息翻譯(目前只提供四種語言)",
                value: `translator`
            })
        );

        if (interaction.values[0] == `1`) {
            await interaction.reply({
                embeds:[embed1],
                components: [
                    new ActionRowBuilder({components:[common_menu]}),
            ],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `3`) {
            await interaction.reply({
                embeds:[embed3],
                components: [
                    new ActionRowBuilder({components:[application_menu]}),
            ],
                ephemeral: true
            });
        }
    },
};