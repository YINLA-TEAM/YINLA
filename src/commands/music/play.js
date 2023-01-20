const {EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, VoiceChannel, GuildEmoji} = require("discord.js");
const client = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setNameLocalizations({
            "zh-TW" : "播放",
            "zh-CN" : "播放",
            "ja" : "プレーヤー",
            "ko" : "플레이"
        })
        .setDescription('Play a song')
        .setDescriptionLocalizations({
            "zh-TW": "播放歌曲",
            "zh-CN": "播放歌曲",
            "ja": "曲を再生する",
            "ko": "노래 재생"
        })
        .addStringOption(option => 
            option.setName("query")
            .setNameLocalizations({
                "zh-TW" : "關鍵字url",
                "zh-CN" : "关键字url",
                "ja" : "キーワードurl",
                "ko" : "키워드url"
            })
                .setDescription("輸入名稱 或 連結(URL)")
                .setDescriptionLocalizations({
                    "zh-TW": "輸入關鍵字或者URL",
                    "zh-CN": "输入关键字或者URL",
                    "ja": "キーワードまたは URL を入力してください",
                    "ko": "키워드 또는 URL을 입력하세요."
                })
                .setRequired(true)
        ),

    async execute(interaction) {
        const { options, member, guild, channel} = interaction;

        const query = options.getString("query");
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

        if (member.voice.channelId !== guild.members.me.voice.channelId && guild.members.me.voice.channelId != null) {
            embed
            .setColor("Random")
            .setTitle(`我已經被使用`)
            .addFields([
                {
                    name:'所在頻道',
                    value:`<#${guild.members.me.voice.channelId}>`
                }
            ])
            return interaction.reply({
                embeds:[embed],
                ephemeral:true
            });
        }
        
        try {
            client.distube.play(voiceChannel, query, {textChannel: channel, member:member});
            embed
            .setColor("Random")
            .setTitle("<a:check:1064547948605755402> 音樂已加入序列<:queue:1064554685547163668>")
            return interaction.reply({
                embeds:[embed],
                ephemeral:true
            });
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