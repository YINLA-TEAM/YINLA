const { EmbedBuilder} = require("@discordjs/builders");
const { SlashCommandBuilder, SelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder , ButtonStyle } = require("discord.js");

module.exports = {
    data: {
        name : `music`
    },
    async execute(interaction, client) {
        const embed1 = new EmbedBuilder()
            .setTitle(`<:play:1064554680295886908>｜播放`)
            .setDescription(`輸入 **連結** 或 **關鍵字** 使機器人加入語音房播放`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .addFields([
                {
                    name:`支援平台連結`,
                    value:`**YouTube**,**Spotify**`,
                    inline:true
                },
                {
                    name:`注意`,
                    value:`建議使用 **__連結__**，關鍵字搜尋可能會播放與您所要求的不同`
                }
            ]);

        const embed2 = new EmbedBuilder()
            .setTitle(`<:play_pause:1064906658268065822>｜暫停/恢復播放`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`利用指令 將正在播放的歌曲暫停 或 將以暫停的歌曲恢復播放`)
            .addFields([
                {
                    name:`暫停播放`,
                    value:`\`/pause\`, \`/暫停\``,
                    inline:true
                },
                {
                    name:`恢復播放`,
                    value:`\`/resume\`, \`/恢復播放\``,
                    inline:true
                }
            ]);

        const embed3 = new EmbedBuilder()
            .setTitle(`<:loop:1064554690680995892>｜循環播放`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`循環播放功能有以下三種類別`)
            .addFields([
                {
                    name:`關閉`,
                    value:`關閉循環播放功能`,
                    inline:true
                },
                {
                    name:`單曲`,
                    value:`單曲無限循環播放`,
                    inline:true
                },
                {
                    name:`列表`,
                    value:`列表上鎖所有的歌曲重複無限循環播放`,
                    inline:true
                },
                {
                    name:`指令`,
                    value:`\`/loop\`, \`/循環播放\``
                }
            ]);

        const embed4 = new EmbedBuilder()
            .setTitle(`🔀｜隨機播放`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`將列表中的歌曲隨機排列`)
            .addFields([
                {
                    name:`指令`,
                    value:`\`/shuffle\`, \`/隨機播放\``
                }
            ]);

        const embed5 = new EmbedBuilder()
            .setTitle(`<:skip:1064554696414605402>｜下一首`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`跳過當前播放歌曲，並且播放下一首`)
            .addFields([
                {
                    name:`指令`,
                    value:`\`/skip\`, \`/下一首\``
                }
            ]);
        
        const embed6 = new EmbedBuilder()
            .setTitle(`<:stop:1064554688478990356>｜音樂中斷`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`斷開機器人與語音房的連結`)
            .addFields([
                {
                    name:`指令`,
                    value:`\`/stop\`, \`/音樂中斷\``
                }
            ]);

        const embed7 = new EmbedBuilder()
            .setTitle(`<a:playing:1064541169960374364>｜正在播放`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`顯示當前播放歌曲`)
            .addFields([
                {
                    name:`指令`,
                    value:`\`/nowplaying\`, \`/正在播放\``
                }
            ]);


        const embed8 = new EmbedBuilder()
            .setTitle(`<:queue:1064554685547163668>｜待播清單`)
            .setAuthor({
                name:`YINLA`,
                iconURL:client.user.displayAvatarURL()
            })
            .setDescription(`顯示 待播清單，可檢視所有待播歌曲`)
            .addFields([
                {
                    name:`指令`,
                    value:`\`/queue\`, \`/待播清單\``
                }
            ]);


        if (interaction.values[0] == `1`) {
            await interaction.reply({
                embeds:[embed1],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `2`) {
            await interaction.reply({
                embeds:[embed2],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `3`) {
            await interaction.reply({
                embeds:[embed3],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `4`) {
            await interaction.reply({
                embeds:[embed4],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `5`) {
            await interaction.reply({
                embeds:[embed5],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `6`) {
            await interaction.reply({
                embeds:[embed6],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `7`) {
            await interaction.reply({
                embeds:[embed7],
                ephemeral: true
            });
        }
        if (interaction.values[0] == `8`) {
            await interaction.reply({
                embeds:[embed8],
                ephemeral: true
            });
        }
    },
};