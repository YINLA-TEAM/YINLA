const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setNameLocalizations({
            "zh-TW" : "跳過",
            "zh-CN" : "跳过",
            "ja" : "スキップ",
            "ko" : "건너뛰기"
        })
        .setDescription('Skip the song')
        .setDescriptionLocalizations({
            "zh-TW": "跳過歌曲",
            "zh-CN": "跳过歌曲",
            "ja": "曲をスキップする",
            "ko": "노래 건너뛰기"
        }),

    async execute(interaction) {
        const {member, guild} = interaction;
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();
        
        if (!voiceChannel) {
            embed
            .setColor("Random")
            .setTitle("我找不到你")
            return interaction.reply({
                embeds:[embed],
                ephemeral:true
            });
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed
            .setColor("Random")
            .setDescripsetTitletion(`我已經在 <#${guild.members.me.voice.channelId}> 被使用`)
            return interaction.reply({
                embeds:[embed],
                ephemeral:true
            });
        }

        try {
            const queue = await client.distube.getQueue(voiceChannel);

                    if (!queue) {
                        embed
                        .setColor("Random")
                        .setTitle("我在休息zzz")
                        return interaction.reply({
                            embeds : [embed],
                            ephemeral : true
                        })
                    }

                    await queue.skip(voiceChannel);
                    embed
                    .setColor("Random")
                    .setTitle("<:skip:1064554696414605402> 已切換至下首歌");
                    return interaction.reply({
                        embeds : [embed],
                        ephemeral : false
                    })

        } catch(err) {
            console.log(err)
            if (err.errorCode == 'NO_UP_NEXT') {
                embed
                    .setColor("Random")
                    .setTitle("沒歌囉~")

                return interaction.reply({
                    embeds : [embed], 
                    ephemeral : true
            })
            } else {
                embed
                    .setColor("Random")
                    .setTitle("音樂系統 發生錯誤 請向管理員回報")

                return interaction.reply({
                    embeds : [embed], 
                    ephemeral : true
                })
            }
        }
    }
}