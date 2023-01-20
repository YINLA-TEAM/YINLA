const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setNameLocalizations({
            "zh-TW" : "恢復播放",
            "zh-CN" : "暂停",
            "ja" : "一時停止",
            "ko" : "정지시키다"
        })
        .setDescription('Pause a song')
        .setDescriptionLocalizations({
            "zh-TW": "播放歌曲",
            "zh-CN": "暂停歌曲",
            "ja": "曲を一時停止する",
            "ko": "노래노래 일시 중지"
        }),

    async execute(interaction) {
        const {member, guild} = interaction;
        const voiceChannel = member.voice.channel;

        const embed = new EmbedBuilder();
        
        if (!voiceChannel) {
            embed
            .setColor("Random")
            .setDescription("我找不到你")
            return interaction.reply({
                embeds:[embed],
                ephemeral:true
            });
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed
            .setColor("Random")
            .setTitle(`我已經在 <#${guild.members.me.voice.channelId}> 被使用`)
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

                await queue.resume(voiceChannel);
                    embed
                    .setColor("Random")
                    .setTitle("<:play:1064554680295886908> 已繼續播放");
                    return interaction.reply({
                        embeds : [embed],
                        ephemeral : true
                    })
        } catch(err) {
            console.log(err)

            if(err.errorCode == 'RESUMED'){
                embed
                    .setColor("Random")
                    .setTitle("在播了啦~")
                return interaction.reply({
                    embeds : [embed],
                    ephemeral : true
                });
            } else {
                embed
                .setColor("Random")
                .setTitle("音樂系統 發生錯誤 請向管理員回報")
            return interaction.reply({
                embeds : [embed],
                ephemeral : true
            });
            }
        }
    }
}