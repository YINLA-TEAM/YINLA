const { SlashCommandBuilder } = require('discord.js')

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

        const  newMessage = `<:play:827734196243398668>｜機器人開機時間：\`${msToHMS(client.uptime)}\`\n:globe_with_meridians:｜**API**：\`${client.ws.ping}\` ms\n<:Discord_Bot:986319391660593172>｜**機器人延遲**：\`${message.createdTimestamp - interaction.createdTimestamp}\` ms\n**👥｜使用者**：\`${client.users.cache.size}\`\n**👾｜伺服器**：\`${client.guilds.cache.size}\``
        await interaction.editReply({
            content : newMessage
        })
    }
}