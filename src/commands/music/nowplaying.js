const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setNameLocalizations({
            "zh-TW" : "正在播放",
            "zh-CN" : "正在播放",
            "ja" : "再生中",
            "ko" : "지금재생중"
        })
        .setDescription('Display info about the currently playing song.')
        .setDescriptionLocalizations({
            "zh-TW": "顯示正在播放",
            "zh-CN": "显示正在播放",
            "ja": "現在再生中の番組",
            "ko": "지금 재생 중 표시"
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
                    embeds:[embed], ephemeral:true
                });
            }
    
            if (!member.voice.channelId == guild.members.me.voice.channelId) {
                embed
                .setColor("Random")
                .setDescription(`我已經在 <#${guild.members.me.voice.channelId}> 被使用`)
                return interaction.reply({
                    embeds:[embed], ephemeral:true
                });
            }
    
            try {
                const queue = await client.distube.getQueue(voiceChannel);
    
                        if (!queue) {
                            embed
                            .setColor("Random")
                            .setDescription("我在休息zzz")
                            return interaction.reply({embeds : [embed], ephemeral : true})
                        }
                        
                const song = queue.songs[0];
                embed
                    .setColor("Random")
                    .setTitle("🎶 | 正在播放")
                    .setImage(song.thumbnail)
                    .setFooter({
                        iconURL: client.user.displayAvatarURL(),
                        text: `YINLA`
                    })
                    .addFields(
                        [{
                            name:`歌名`,
                            value:`[${song.name}](${song.url})`
                        },
                        {
                            name:`時長`,
                            value:`\`${song.formattedDuration}\``
                        },
                        {
                            name:`加入者`,
                            value: `${song.user}`
                            
                        },]
                    )
                return interaction.reply({embeds : [embed], ephemeral : true})

            } catch(err) {
                console.log(err)
    
                embed
                .setColor("Random")
                .setDescription("音樂系統 發生錯誤 請向管理員回報")
    
                return interaction.reply({embeds : [embed], ephemeral : true})
            }
        }
    }