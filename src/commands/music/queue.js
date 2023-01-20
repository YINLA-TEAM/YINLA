const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setNameLocalizations({
            "zh-TW" : "待播列表",
            "zh-CN" : "待播列表",
            "ja" : "プレイリスト",
            "ko" : "플레이리스트"
        })
        .setDescription('show the queue')
        .setDescriptionLocalizations({
            "zh-TW": "顯示待播列表",
            "zh-CN": "显示待播列表",
            "ja": "キューを表示",
            "ko": "대기열을 표시"
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
                    }

            embed
                .setColor("Random")
                .setDescription(`${queue.songs.map(
                    (song, id) => `\n**${id + 1}.** ${song.name} - \`${song.formattedDuration}\``
                )}`);
            return interaction.reply({
                embeds : [embed],
                ephemeral : true
            })
        } catch(err) {
            console.log(err)

            embed
            .setColor("Random")
            .setTitle("音樂系統 發生錯誤 請向管理員回報\n如果是點選的歌曲過多也可能導致錯誤發生\n此問題將會在日後版本更新")

            return interaction.reply({
                embeds : [embed],
                ephemeral : true
            })
        }
    }
}