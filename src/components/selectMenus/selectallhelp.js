const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder, ButtonBuilder , ButtonStyle} = require("discord.js");

module.exports = {
    data: {
        name : `help`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`ð°ï½åºç¤æä»¤`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> è«ç¨ä»¥ä¸é¸å®é¸ææä»¤ï¼æåæ¨è©³ç´°ä»ç´¹`)

        const embed2 = new EmbedBuilder()
            .setTitle(`âï¸ï½é²éæä»¤ (å¾æ´æ°)`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033064221283450965> è«ç¨ä»¥ä¸é¸å®é¸ææä»¤ï¼æåæ¨è©³ç´°ä»ç´¹`)

        const embed3 = new EmbedBuilder()
            .setTitle(`ð·ï½æç¨ç¨å¼`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`</help:1033187250504220766> è«ç¨ä»¥ä¸é¸å®é¸ææä»¤ï¼æåæ¨è©³ç´°ä»ç´¹`)

        const common_menu = new SelectMenuBuilder()
            .setCustomId(`common`)
            .setPlaceholder("ð è«é¸ææä»¤")
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `ð`,
                label: `DCç¸éè³è¨æ¥è©¢åè½`,
                value: 'search'
            }),
            new SelectMenuOptionBuilder({
                emoji:`ð¤`,
                label: `æ©å¨äººçææä»¤`,
                value: 'bot'
            })
        );
        const advance_menu = new SelectMenuBuilder()
            .setCustomId(`advance`)
            .setPlaceholder("å¾æ´æ°")
            .setDisabled(true)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `<a:_loading:1009020311573893121>`,
                label: `å¾æ´æ°`,
                description:"å¾æ´æ°",
                value: `1`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<a:_loading:1009020311573893121>ï¸`,
                label: `å¾æ´æ°`,
                description:"å¾æ´æ°",
                value: `2`
            })
        );
        const application_menu = new SelectMenuBuilder()
            .setCustomId(`application`)
            .setPlaceholder("ð è«é¸ææç¨ç¨å¼ä»ç´¹")
            .setDisabled(false)
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(
            new SelectMenuOptionBuilder({
                emoji: `ð`,
                label: `åå¾å¤§é ­è²¼`,
                description:"åå¾ä½¿ç¨èå¤§é ­è²¼",
                value: `avatar`
            }),
            new SelectMenuOptionBuilder({
                emoji:`<:tranlate:1035826480904679424>`,
                label: `æè¨æ¯ç¿»æ ä¸­/æ¥/è±/éæ`,
                description:"å¯ä»¥ç´æ¥å©ç¨æ­¤åè½å°è¨æ¯ç¿»è­¯(ç®ååªæä¾åç¨®èªè¨)",
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