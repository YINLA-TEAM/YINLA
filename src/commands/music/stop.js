const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setNameLocalizations({
            "zh-TW" : "音樂中斷",
            "zh-CN" : "音乐中断",
            "ja" : "音楽休憩",
            "ko" : "음악휴식"
        })
        .setDescription('End all music playback and disconnect the bot')
        .setDescriptionLocalizations({
            "zh-TW": "結束所有音樂播放，使機器人中斷連線",
            "zh-CN": "结束所有音乐播放，使机器人中断连线",
            "ja": "すべての音楽再生を終了し、ボットを切断します",
            "ko": "모든 음악 재생 종료 및 봇 연결 해제"
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
                embeds:[embed], ephemeral:true
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

                    await queue.stop(voiceChannel);
                    embed
                    .setColor("Random")
                    .setTitle("<:stop:1064554688478990356> 音樂已與頻道中斷連接")
                    .setDescription(`由 ${interaction.user} 使用指令中斷`);
                    return interaction.reply({
                        embeds : [embed],
                        ephemeral : false
                    })
        } catch(err) {
            console.log(err)

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