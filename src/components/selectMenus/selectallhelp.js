const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder, ButtonBuilder , ButtonStyle} = require("discord.js");

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
            .setTitle(`⚜️｜進階指令 (待更新)`)
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
            .setDescription(`</help:1033187250504220766> 請用以下選單選擇指令，會向您詳細介紹`)

        const common_menu = new SelectMenuBuilder()
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
        const advance_menu = new SelectMenuBuilder()
            .setCustomId(`advance`)
            .setPlaceholder("待更新")
            .setDisabled(true)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `<a:_loading:1009020311573893121>`,
                label: `待更新`,
                description:"待更新",
                value: `1`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<a:_loading:1009020311573893121>️`,
                label: `待更新`,
                description:"待更新",
                value: `2`
            })
        );
        const application_menu = new SelectMenuBuilder()
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
                emoji:`<a:_loading:1009020311573893121>`,
                label: `待更新`,
                description:"待更新",
                value: `banner`
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
                    new ActionRowBuilder({components:[advance_menu]}),
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