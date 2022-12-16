const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setNameLocalizations({
            "zh-TW" : "循環播放",
            "zh-CN" : "循环播放",
            "ja" : "ループ",
            "ko" : "고리"
        })
        .setDescription("loop the song")
        .setDescriptionLocalizations({
            "zh-TW": "循環播放歌曲",
            "zh-CN": "循环播放歌曲",
            "ja": "曲をループする",
            "ko": "노래를 반복"
        })
        .addStringOption(option =>
            option
                .setName("options")
                .setDescription("選擇一個循環播放的方式")
                .setRequired(true)
                .addChoices(
                    { name: "關閉", value: "off" },
                    { name: "單曲", value: "song" },
                    { name: "列表", value: "queue" },
                )
        ),

        async execute(interaction) {
            const {member, guild, options} = interaction;
            const option = options.getString("options");
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
                        
                        let mode = null;

                        switch (option) {
                            case "off":
                                mode = 0;
                                break;
                            case "song":
                                mode = 1;
                                break;
                            case "queue":
                                mode = 2;
                                break;
                        }

                mode = await queue.setRepeatMode(mode);

                mode = mode ? (mode === 2? "列表" : "單曲") : "關閉";

                embed
                    .setColor("Random")
                    .setTitle(`已將重複播放設為 \`${mode}\``);
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