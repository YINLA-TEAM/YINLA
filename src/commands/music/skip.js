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

                    await queue.skip(voiceChannel);
                    embed
                    .setColor("Random")
                    .setDescription("已切換至下首歌");
                    return interaction.reply({embeds : [embed], ephemeral : false})

        } catch(err) {
            console.log(err)

            embed
            .setColor("Random")
            .setTitle("下一首在哪?我找不到")

            return interaction.reply({embeds : [embed], ephemeral : true})
        }
    }
}