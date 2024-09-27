const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setNameLocalizations({
            "zh-TW" : "機器人資訊",
            "zh-CN" : "机器人资讯",
            "ja" : "ロボット情報",
            "ko" : "로봇정보"
        })
        .setDescription('查看機器人狀態')
        .setDescriptionLocalizations({
            "zh-TW" : "查看機器人狀態",
            "zh-CN" : "查看机器人状态",
            "ja" : "ボットのステータスを表示する",
            "ko" : "봇 상태 보기"
        }),
    
    async execute (interaction , client) {
        function msToHMS(ms) {
            let seconds = ms / 1000; 
            const hours = parseInt( seconds / 3600 ); 
            seconds = seconds % 3600; 
            const minutes = parseInt( seconds / 60 ); 
            seconds = seconds % 60; 
            return(`${hours}:${minutes}:${~~(seconds)}`);
        }
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const botInfoEmbed = new EmbedBuilder()
            .setAuthor({
                name:`YINLA`,
            })
            .setTitle('機器人狀態')
            .setThumbnail(client.user.displayAvatarURL())
            .setColor('Random')
            .addFields([{
                    name: `機器人開機時間`,
                    value: msToHMS(client.uptime),
                    inline: true
                }, {
                    name: `API延遲`,
                    value: `${client.ws.ping} ms`,
                    inline: true
                }, {
                    name: `機器人延遲`,
                    value: `${message.createdTimestamp - interaction.createdTimestamp} ms`,
                    inline: true
                }, {
                    name: `使用者數量`,
                    value: `${client.users.cache.size} 人`,
                    inline: true
                }, {
                    name: `伺服器數量`,
                    value: `${client.guilds.cache.size} 個`,
                    inline: true
                }
            ])
        await interaction.editReply({
            embeds : [ botInfoEmbed ],
        })
    }
}