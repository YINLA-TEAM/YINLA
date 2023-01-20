const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setNameLocalizations({
            "zh-TW" : "暫停",
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
            .setTitle("我找不到你")
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
                    };

            await queue.pause(voiceChannel);
                embed
                    .setColor("Random")
                    .setTitle("<:pause:1064554699807801444> 已暫停目前歌曲");
                    return interaction.reply({
                        embeds : [embed],
                        ephemeral : false
                    });
        } catch(err) {
            console.log(err)
            if(err.errorCode == 'PAUSED'){
                embed
                    .setColor("Random")
                    .setTitle("你還想要我暫停什麼?")
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