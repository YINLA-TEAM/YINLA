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
            .setTitle(`🎵｜音樂指令`)
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
        const music_menu = new SelectMenuBuilder()
            .setCustomId(`music`)
            .setPlaceholder("📖 請選擇指令")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `<:play:1064554680295886908>`,
                label: `播放`,
                description:"介紹 播放 功能",
                value: `1`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:play_pause:1064906658268065822>>`,
                label: `暫停/恢復播放`,
                description:"介紹 暫停/恢復 播放 功能",
                value: `2`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:loop:1064554690680995892> `,
                label: `循環播放`,
                description:"介紹 循環播放 功能",
                value: `3`
            }),
            new SelectMenuOptionBuilder({
                emoji:`🔀`,
                label: `隨機播放`,
                description:"介紹 隨機播放 功能",
                value: `4`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:skip:1064554696414605402>`,
                label: `下一首`,
                description:"介紹 下一首 功能",
                value: `5`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:stop:1064554688478990356>`,
                label: `音樂中斷`,
                description:"介紹 音樂中斷 功能",
                value: `6`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<a:playing:1064541169960374364>`,
                label: `正在播放`,
                description:"介紹 正在播放 功能",
                value: `7`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:queue:1064554685547163668>`,
                label: `待播清單`,
                description:"介紹 待播清單 功能",
                value: `8`
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
        if (interaction.values[0] == `2`) {
            await interaction.reply({
                embeds:[embed2],
                components: [
                    new ActionRowBuilder({components:[music_menu]}),
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