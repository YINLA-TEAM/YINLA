const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

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

        const embed2 = new EmbedBuilder()
            .setTitle(`🌥️｜氣象署相關`)
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

        const common_menu = new StringSelectMenuBuilder()
            .setCustomId('common')
            .setPlaceholder("📖 請選擇指令")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new StringSelectMenuOptionBuilder({
                emoji: `🔎`,
                label: `DC相關資訊查詢功能`,
                value: 'search',
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`🤖`,
                label: `機器人狀態指令`,
                value: 'bot',
            })
        );

        const cwa_menu = new StringSelectMenuBuilder()
            .setCustomId('cwa')
            .setPlaceholder("📖 請選擇指令")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new StringSelectMenuOptionBuilder({
                emoji: `🏚️`,
                label: `地震報告指令`,
                value: 'eq',
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`📡`,
                label: `雷達回波圖指令`,
                value: 'radar',
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`🚨`,
                label: `天氣警報指令`,
                value: 'alert',
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`🔭`,
                label: `氣象站指令`,
                value: 'station',
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`🛠️`,
                label: `天氣小幫手`,
                value: 'tool',
            })
        );

        const application_menu = new StringSelectMenuBuilder()
            .setCustomId(`application`)
            .setPlaceholder("📖 請選擇應用程式介紹")
            .setDisabled(false)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new StringSelectMenuOptionBuilder({
                emoji: `😎`,
                label: `取得大頭貼`,
                value: `avatar`,
            }),
            new StringSelectMenuOptionBuilder({
                emoji:`<:tranlate:1035826480904679424>`,
                label: `把訊息翻譯成 中/日/英/韓文`,
                value: `translator`,
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
        if (interaction.values[0] == `2`) {
            await interaction.reply({
                embeds:[embed2],
                components: [
                    new ActionRowBuilder({components:[cwa_menu]}),
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